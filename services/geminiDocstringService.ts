import { GoogleGenAI, Type } from '@google/genai';
import { isGeminiConfigured } from './configService';

const docstringSchema = {
  type: Type.OBJECT,
  properties: {
    language: {
      type: Type.STRING,
      description: 'The detected programming language, lowercase (e.g., "python", "javascript", "typescript").',
    },
    code: {
      type: Type.STRING,
      description: 'The complete, original code with the generated docstring inserted.',
    },
  },
  required: ['language', 'code'],
};


export async function generateDocstring(codeInput: string, language: 'en' | 'vi'): Promise<{ language: string; code: string; }> {
  if (!isGeminiConfigured()) {
    throw new Error("Gemini API key is not configured. It must be provided via the API_KEY environment variable.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = language === 'vi' 
  ? `Bạn là một trợ lý chuyên gia về tài liệu mã nguồn.
    1. Phân tích đoạn mã được cung cấp.
    2. Tự động phát hiện ngôn ngữ lập trình (ví dụ: Python, JavaScript, TypeScript, Java, v.v.).
    3. Tạo một docstring hoặc bình luận JSDoc chất lượng cao, theo quy ước cho mã đó.
    4. Docstring phải giải thích mục đích của hàm/lớp, các tham số của nó (bao gồm cả kiểu dữ liệu nếu có thể suy ra) và giá trị trả về.
    5. QUAN TRỌNG: Trả về một đối tượng JSON duy nhất chứa hai khóa: 'language' (chuỗi tên ngôn ngữ viết thường) và 'code' (toàn bộ đoạn mã gốc với docstring mới được chèn vào).
    6. KHÔNG bao gồm bất kỳ lời giải thích nào hoặc các dấu markdown như \`\`\` trong phản hồi của bạn.`
  : `You are an expert code documentation assistant.
    1. Analyze the provided code snippet.
    2. Automatically detect the programming language (e.g., Python, JavaScript, TypeScript, Java, etc.).
    3. Generate a high-quality, conventional docstring or JSDoc comment for the code.
    4. The docstring should explain the function/class's purpose, its arguments (including types if inferable), and what it returns.
    5. CRITICAL: Return a single JSON object with two keys: 'language' (a lowercase string of the language name) and 'code' (the ENTIRE original code snippet with the new docstring inserted).
    6. Do NOT include any explanations or markdown fences like \`\`\` in your response.`;

  const prompt = `
    Here is the code to document:
    ---
    ${codeInput}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: docstringSchema,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("API returned an empty response.");
    }
    const parsedJson = JSON.parse(jsonText);
    return parsedJson as { language: string; code: string; };

  } catch (error) {
    console.error("Error calling Gemini API for docstrings:", error);
    if (error instanceof Error && error.message.includes('SAFETY')) {
        throw new Error("The request was blocked due to safety settings. Please modify your input.");
    }
    if (error instanceof Error && error.message.includes('API key not valid')) {
        throw new Error("The provided Gemini API Key is not valid. Please check it in the settings.");
    }
    throw new Error("Failed to generate docstring from the provided code.");
  }
}