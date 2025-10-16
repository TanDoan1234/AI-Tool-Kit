import { GoogleGenAI, Type } from '@google/genai';
import type { FormDefinition } from '../types';
// FIX: Per guidelines, getApiKeys is no longer needed for the Gemini key.
import { isGeminiConfigured } from './configService';


const formSchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "The main title of the form, extracted from the user's input.",
    },
    description: {
      type: Type.STRING,
      description: "A brief description or introduction for the form, extracted from the user's input.",
    },
    isQuiz: {
      type: Type.BOOLEAN,
      description: "Set to true if the input suggests this is a quiz, test, or assessment."
    },
    sections: {
      type: Type.ARRAY,
      description: "An array of form sections. Each section represents a page in the form.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: "The title for this section/page of the form (e.g., 'Contact Information')."
          },
          description: {
            type: Type.STRING,
            description: "An optional description for this section."
          },
          questions: {
            type: Type.ARRAY,
            description: "An array of question objects for this section.",
            items: {
              type: Type.OBJECT,
              properties: {
                title: {
                  type: Type.STRING,
                  description: "The text of the question.",
                },
                type: {
                  type: Type.STRING,
                  description: "The type of question. Must be one of: SHORT_ANSWER, PARAGRAPH, MULTIPLE_CHOICE, CHECKBOXES, IMAGE_DISPLAY.",
                },
                options: {
                  type: Type.ARRAY,
                  description: "An array of string options for MULTIPLE_CHOICE or CHECKBOXES questions. The correct answer marker (*) should be removed from the option text.",
                  items: {
                    type: Type.STRING,
                  },
                },
                imageUrl: {
                  type: Type.STRING,
                  description: "A URL for an image associated with the question. This could be for an IMAGE_DISPLAY type or an image accompanying another question type. Should be an empty string if not applicable.",
                },
                required: {
                  type: Type.BOOLEAN,
                  description: "Whether the question is mandatory. Infer this if the input mentions 'required', '*', etc."
                },
                points: {
                    type: Type.INTEGER,
                    description: "The point value for this question if it's part of a quiz. Omit or set to 0 if not a quiz question."
                },
                correctAnswers: {
                    type: Type.ARRAY,
                    description: "An array of strings containing the correct answer(s) for the question. For choice-based questions, this should match the text of the correct option(s).",
                    items: {
                        type: Type.STRING,
                    },
                }
              },
              required: ["title", "type"],
            },
          },
        },
        required: ["title", "questions"]
      }
    }
  },
  required: ["title", "description", "sections"],
};

export async function generateFormDefinition(rawInput: string, language: 'en' | 'vi'): Promise<FormDefinition> {
  if (!isGeminiConfigured()) {
    // FIX: Updated error message to reflect API key sourcing from environment variables per guidelines.
    throw new Error("Gemini API key is not configured. It must be provided via the API_KEY environment variable.");
  }
  // FIX: Per coding guidelines, initialize GoogleGenAI with API key directly from process.env.API_KEY.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = language === 'vi' 
  ? `Bạn là một chuyên gia tạo biểu mẫu và bài kiểm tra. Hãy phân tích nội dung sau và chuyển nó thành một đối tượng JSON có cấu trúc.
    1. Trích xuất tiêu đề chính và mô tả.
    2. Nhóm câu hỏi vào các phần hợp lý.
    3. Đối với mỗi câu hỏi, xác định văn bản, loại, và trạng thái bắt buộc.
    4. **QUAN TRỌNG (QUIZ):** Nếu nội dung gợi ý đây là một bài kiểm tra (ví dụ: có điểm, có đáp án đúng), hãy đặt \`isQuiz: true\` ở cấp độ cao nhất.
    5. **ĐÁP ÁN ĐÚNG:** Đối với câu hỏi trắc nghiệm hoặc hộp kiểm, nếu một lựa chọn kết thúc bằng dấu hoa thị (*), đó là câu trả lời đúng. Hãy thêm văn bản của lựa chọn đó (không có dấu *) vào mảng \`correctAnswers\` cho câu hỏi đó.
    6. **ĐIỂM SỐ:** Nếu một câu hỏi có đáp án đúng, hãy gán cho nó một số điểm (ví dụ: 10 điểm) vào trường \`points\`. Nếu người dùng chỉ định một số điểm mặc định, hãy sử dụng số điểm đó.
    7. **GOOGLE FORMS API JSON:** Nếu đầu vào là JSON từ API Google Forms, hãy phân tích nó và chuyển đổi sang schema mục tiêu.
    8. Chỉ trả về một đối tượng JSON hợp lệ duy nhất khớp với schema đã cung cấp.`
  : `You are an expert form and quiz generator. Analyze the following content and convert it into a structured JSON object.
    1. Extract the main title and description.
    2. Group questions into logical sections.
    3. For each question, identify its text, type, and required status.
    4. **CRITICAL (QUIZ):** If the content suggests it is a quiz (e.g., has points, correct answers), set \`isQuiz: true\` at the top level.
    5. **CORRECT ANSWERS:** For multiple choice or checkbox questions, if an option ends with an asterisk (*), it is the correct answer. Add the option's text (without the *) to the \`correctAnswers\` array for that question.
    6. **POINTS:** If a question has a correct answer, assign it a point value (e.g., 10) in the \`points\` field. If the user specifies a default point value, use that instead.
    7. **GOOGLE FORMS API JSON:** If the input is a JSON from the Google Forms API, parse it and transform it into the target schema.
    8. Return a single, valid JSON object matching the provided schema.`;

  const prompt = `
    Here is the content to analyze:
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
        responseMimeType: "application/json",
        responseSchema: formSchema,
      },
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("API returned an empty response.");
    }
    const parsedJson = JSON.parse(jsonText);
    return parsedJson as FormDefinition;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error && error.message.includes('SAFETY')) {
        throw new Error("The request was blocked due to safety settings. Please modify your input.");
    }
    if (error instanceof Error && error.message.includes('API key not valid')) {
        throw new Error("The provided Gemini API Key is not valid. Please check it in the settings.");
    }
    throw new Error("Failed to generate form definition from the provided text.");
  }
}