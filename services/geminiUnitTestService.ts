import { GoogleGenAI, Type } from '@google/genai';
import { isGeminiConfigured } from './configService';

const unitTestSchema = {
  type: Type.OBJECT,
  properties: {
    language: {
      type: Type.STRING,
      description: 'The programming language for the test file, lowercase (e.g., "python", "javascript", "typescript").',
    },
    code: {
      type: Type.STRING,
      description: 'The complete code for the unit tests.',
    },
  },
  required: ['language', 'code'],
};


export async function generateUnitTests(codeInput: string, language: 'en' | 'vi'): Promise<{ language: string; code: string; }> {
  if (!isGeminiConfigured()) {
    throw new Error("Gemini API key is not configured. It must be provided via the API_KEY environment variable.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = language === 'vi' 
  ? `Bạn là một kỹ sư đảm bảo chất lượng (QA) chuyên nghiệp.
    1. Phân tích đoạn mã được cung cấp.
    2. Tự động phát hiện ngôn ngữ lập trình.
    3. Viết một bộ unit test toàn diện cho mã đó. Sử dụng các framework kiểm thử phổ biến (ví dụ: pytest cho Python, Jest hoặc Vitest cho JavaScript/TypeScript).
    4. Bao gồm các ca kiểm thử cho các trường hợp thông thường, trường hợp biên (edge cases) và các đầu vào không hợp lệ.
    5. QUAN TRỌNG: Trả về một đối tượng JSON duy nhất chứa hai khóa: 'language' (tên ngôn ngữ của tệp test viết thường) và 'code' (toàn bộ mã unit test).
    6. KHÔNG bao gồm mã gốc trong phản hồi, chỉ mã test.
    7. KHÔNG bao gồm bất kỳ lời giải thích nào hoặc các dấu markdown như \`\`\` trong phản hồi của bạn.`
  : `You are an expert Quality Assurance (QA) engineer.
    1. Analyze the provided code snippet.
    2. Automatically detect the programming language.
    3. Write a comprehensive suite of unit tests for the code. Use common testing frameworks (e.g., pytest for Python, Jest or Vitest for JavaScript/TypeScript).
    4. Include test cases for normal operation, edge cases, and invalid inputs.
    5. CRITICAL: Return a single JSON object with two keys: 'language' (the lowercase language name of the test file) and 'code' (the entire unit test code).
    6. Do NOT include the original code in the response, only the test code.
    7. Do NOT include any explanations or markdown fences like \`\`\` in your response.`;

  const prompt = `
    Here is the code to test:
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
        responseSchema: unitTestSchema,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("API returned an empty response.");
    }
    const parsedJson = JSON.parse(jsonText);
    return parsedJson as { language: string; code: string; };

  } catch (error) {
    console.error("Error calling Gemini API for unit tests:", error);
    if (error instanceof Error && error.message.includes('SAFETY')) {
        throw new Error("The request was blocked due to safety settings. Please modify your input.");
    }
    if (error instanceof Error && error.message.includes('API key not valid')) {
        throw new Error("The provided Gemini API Key is not valid. Please check it in the settings.");
    }
    throw new Error("Failed to generate unit tests from the provided code.");
  }
}