import { GoogleGenAI } from '@google/genai';
import { isGeminiConfigured } from './configService';

export async function generateDiagramCode(rawInput: string, language: 'en' | 'vi'): Promise<string> {
  if (!isGeminiConfigured()) {
    throw new Error("Gemini API key is not configured. It must be provided via the API_KEY environment variable.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = language === 'vi' 
  // FIX: Escaped backticks in the template literal to prevent a syntax error.
  ? `Bạn là một chuyên gia tạo sơ đồ. Phân tích mô tả của người dùng và chuyển nó thành cú pháp Mermaid.js hợp lệ.
    - Chỉ trả về mã Mermaid.js.
    - Không bao gồm bất kỳ lời giải thích nào.
    - Không bao gồm các dấu \`\`\`mermaid hoặc \`\`\`. Chỉ trả về mã thuần túy.`
  // FIX: Escaped backticks in the template literal to prevent a syntax error.
  : `You are an expert diagram generator. Analyze the user's description and convert it into valid Mermaid.js syntax.
    - Only return the Mermaid.js code.
    - Do not include any explanations.
    - Do not include markdown fences like \`\`\`mermaid or \`\`\`. Just return the raw code.`;

  const prompt = `
    Here is the description to analyze:
    ---
    ${rawInput}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
      },
    });

    const text = response.text.trim();
    if (!text) {
        throw new Error("API returned an empty response.");
    }
    return text;

  } catch (error) {
    console.error("Error calling Gemini API for diagrams:", error);
    if (error instanceof Error && error.message.includes('SAFETY')) {
        throw new Error("The request was blocked due to safety settings. Please modify your input.");
    }
    if (error instanceof Error && error.message.includes('API key not valid')) {
        throw new Error("The provided Gemini API Key is not valid. Please check it in the settings.");
    }
    throw new Error("Failed to generate diagram from the provided text.");
  }
}
