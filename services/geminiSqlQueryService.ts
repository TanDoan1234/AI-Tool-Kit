import { GoogleGenAI, Type } from '@google/genai';
import { getApiKeys, isGeminiConfigured } from './configService';

const sqlSchema = {
  type: Type.OBJECT,
  properties: {
    language: {
      type: Type.STRING,
      description: 'The query language. Always "sql".',
    },
    query: {
      type: Type.STRING,
      description: 'The complete, valid SQL query, formatted with newlines and indentation for readability.',
    },
  },
  required: ['language', 'query'],
};

export async function generateSqlQuery(schema: string, instruction: string, language: 'en' | 'vi'): Promise<{ language: string; query: string; }> {
  if (!isGeminiConfigured()) {
    throw new Error("Gemini API key is not configured. Please set it in the settings (⚙️ icon).");
  }
  const { geminiApiKey } = getApiKeys();
  const ai = new GoogleGenAI({ apiKey: geminiApiKey });

  const systemInstruction = language === 'vi' 
  ? `Bạn là một chuyên gia SQL.
    1. Phân tích schema bảng và yêu cầu của người dùng.
    2. Viết một truy vấn SQL chính xác, hiệu quả để lấy dữ liệu được yêu cầu.
    3. TUYỆT ĐỐI QUAN TRỌNG: Truy vấn SQL bạn tạo ra BẮT BUỘC phải được định dạng đẹp mắt để con người dễ đọc. Điều này có nghĩa là sử dụng nhiều dòng, thụt đầu dòng chính xác và nhóm các mệnh đề một cách hợp lý.
    4. KHÔNG được trả về truy vấn dưới dạng một dòng văn bản dài duy nhất. Chuỗi truy vấn phải chứa các ký tự xuống dòng (\\n).
    5. Ví dụ, một truy vấn đã định dạng trông như thế này:
       SELECT
           cot1,
           cot2
       FROM
           bang_cua_toi
       WHERE
           dieu_kien = 'gia_tri';
    6. QUAN TRỌNG: Trả về một đối tượng JSON duy nhất chứa hai khóa: 'language' (luôn là "sql") và 'query' (chuỗi truy vấn SQL đã được định dạng trên nhiều dòng).
    7. KHÔNG bao gồm bất kỳ lời giải thích nào hoặc các dấu markdown như \`\`\` trong phản hồi của bạn.`
  : `You are an expert SQL professional.
    1. Analyze the provided table schema and the user's request.
    2. Write an accurate, efficient SQL query to retrieve the requested data.
    3. ABSOLUTELY CRITICAL: The SQL query you generate MUST be beautifully formatted for human readability. This means using multiple lines, correct indentation, and logical grouping of clauses.
    4. DO NOT return the query as a single, long line of text. The query string itself must contain newline characters (\\n).
    5. For example, a formatted query looks like this:
       SELECT
           column1,
           column2
       FROM
           my_table
       WHERE
           condition = 'value';
    6. CRITICAL: Return a single JSON object with two keys: 'language' (which should always be "sql") and 'query' (the multi-line, formatted SQL query string).
    7. Do NOT include any explanations or markdown fences like \`\`\` in your response.`;

  const prompt = `
    Table Schema:
    ---
    ${schema}
    ---
    User Request:
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
        responseSchema: sqlSchema,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("API returned an empty response.");
    }
    const parsedJson = JSON.parse(jsonText);
    return parsedJson as { language: string; query: string; };

  } catch (error) {
    console.error("Error calling Gemini API for SQL generation:", error);
    if (error instanceof Error && error.message.includes('SAFETY')) {
        throw new Error("The request was blocked due to safety settings. Please modify your input.");
    }
    if (error instanceof Error && error.message.includes('API key not valid')) {
        throw new Error("The provided Gemini API Key is not valid. Please check it in the settings.");
    }
    throw new Error("Failed to generate SQL query from the provided input.");
  }
}