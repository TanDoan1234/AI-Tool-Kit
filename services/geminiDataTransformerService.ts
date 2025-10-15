import { GoogleGenAI, Type } from '@google/genai';
import { isGeminiConfigured } from './configService';

const transformerSchema = {
  type: Type.OBJECT,
  properties: {
    format: {
      type: Type.STRING,
      description: 'The format of the transformed data, lowercase (e.g., "json", "csv", "xml", "yaml", "html").',
    },
    data: {
      type: Type.STRING,
      description: 'The complete, transformed data as a string.',
    },
  },
  required: ['format', 'data'],
};


export async function transformData(inputData: string, instruction: string, language: 'en' | 'vi'): Promise<{ format: string; data: string; }> {
  if (!isGeminiConfigured()) {
    throw new Error("Gemini API key is not configured. It must be provided via the API_KEY environment variable.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = language === 'vi' 
  ? `Bạn là một công cụ chuyển đổi dữ liệu chuyên nghiệp.
    1. Phân tích dữ liệu nguồn và hướng dẫn chuyển đổi được cung cấp.
    2. Chuyển đổi dữ liệu chính xác theo hướng dẫn.
    3. Xác định định dạng của dữ liệu đầu ra (ví dụ: json, csv, xml).
    4. QUAN TRỌNG: Trả về một đối tượng JSON duy nhất chứa hai khóa: 'format' (một chuỗi tên định dạng viết thường) và 'data' (chuỗi chứa dữ liệu đã chuyển đổi).
    5. KHÔNG bao gồm bất kỳ lời giải thích nào hoặc các dấu markdown như \`\`\` trong phản hồi của bạn.`
  : `You are an expert data transformation engine.
    1. Analyze the provided source data and the transformation instruction.
    2. Convert the data exactly as instructed.
    3. Identify the format of the output data (e.g., json, csv, xml).
    4. CRITICAL: Return a single JSON object with two keys: 'format' (a lowercase string of the format name) and 'data' (the string containing the transformed data).
    5. Do NOT include any explanations or markdown fences like \`\`\` in your response.`;

  const prompt = `
    Source Data:
    ---
    ${inputData}
    ---
    Transformation Instruction:
    ---
    ${instruction}
    ---
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: transformerSchema,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("API returned an empty response.");
    }
    const parsedJson = JSON.parse(jsonText);
    return parsedJson as { format: string; data: string; };

  } catch (error) {
    console.error("Error calling Gemini API for data transformation:", error);
    if (error instanceof Error && error.message.includes('SAFETY')) {
        throw new Error("The request was blocked due to safety settings. Please modify your input.");
    }
    if (error instanceof Error && error.message.includes('API key not valid')) {
        throw new Error("The provided Gemini API Key is not valid. Please check it in the settings.");
    }
    throw new Error("Failed to transform data from the provided input.");
  }
}