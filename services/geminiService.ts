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
                  description: "An array of string options for MULTIPLE_CHOICE or CHECKBOXES questions. Should be an empty array for other types.",
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
  ? `Bạn là một chuyên gia tạo biểu mẫu. Hãy phân tích nội dung sau và chuyển nó thành một đối tượng JSON có cấu trúc đại diện cho một Google Form.
    1. Từ văn bản không cấu trúc (như Markdown hoặc HTML), hãy trích xuất tiêu đề chính và mô tả cho biểu mẫu.
    2. Nhóm các câu hỏi liên quan một cách hợp lý vào các phần riêng biệt. Mỗi phần sẽ trở thành một trang riêng trong biểu mẫu.
    3. Cung cấp một tiêu đề ngắn, mô tả cho mỗi phần.
    4. Đối với mỗi câu hỏi, xác định văn bản và loại câu hỏi phù hợp nhất (SHORT_ANSWER, PARAGRAPH, MULTIPLE_CHOICE, CHECKBOXES, IMAGE_DISPLAY).
    5. Trích xuất các tùy chọn cho câu hỏi MULTIPLE_CHOICE và CHECKBOXES.
    6. Xác định các URL hình ảnh và liên kết chúng với câu hỏi có liên quan.
    7. Xác định xem một câu hỏi có bắt buộc hay không.
    8. Ngoài ra, nếu đầu vào là một đối tượng JSON khớp với cấu trúc \`batchUpdate\` của Google Forms API (tức là có một mảng 'requests' với các đối tượng 'createItem'), bạn phải phân tích cấu trúc này và chuyển đổi nó sang schema mục tiêu. Đối với mỗi 'item' trong requests:
        - Trích xuất tiêu đề câu hỏi từ \`item.title\`.
        - Xác định loại câu hỏi bằng cách xem \`item.questionItem.question\`. Một \`choiceQuestion\` với loại 'RADIO' sẽ ánh xạ tới 'MULTIPLE_CHOICE', và 'CHECKBOX' sẽ ánh xạ tới 'CHECKBOXES'. Một \`textQuestion\` với \`paragraph: true\` sẽ ánh xạ tới 'PARAGRAPH', nếu không thì là 'SHORT_ANSWER'.
        - Trích xuất các tùy chọn cho câu hỏi lựa chọn từ \`item.questionItem.question.choiceQuestion.options\`, lấy 'value' từ mỗi đối tượng tùy chọn.
        - Trích xuất trạng thái \`required\` từ \`item.questionItem.question.required\`.
        - Nhóm tất cả các câu hỏi đã trích xuất vào một phần duy nhất. Bạn nên tự nghĩ ra một tiêu đề phù hợp cho phần này và một tiêu đề chính cùng mô tả cho toàn bộ biểu mẫu dựa trên nội dung của các câu hỏi.
    9. Chỉ trả về một đối tượng JSON hợp lệ duy nhất khớp với schema đã cung cấp.`
  : `You are an expert form generator. Analyze the following content and convert it into a structured JSON object that represents a multi-page Google Form.
    1. From unstructured text (like Markdown or HTML), extract the main title and a description for the form.
    2. Logically group related questions into distinct sections. Each section will become a separate page in the form.
    3. Provide a short, descriptive title for each section.
    4. For each question, identify its text and determine the most appropriate question type (SHORT_ANSWER, PARAGRAPH, MULTIPLE_CHOICE, CHECKBOXES, IMAGE_DISPLAY).
    5. Extract the options for MULTIPLE_CHOICE and CHECKBOXES questions.
    6. Identify any image URLs and associate them with the relevant question.
    7. Determine if a question is required.
    8. Alternatively, if the input is a JSON object matching the Google Forms API \`batchUpdate\` structure (i.e., it has a 'requests' array with 'createItem' objects), you must parse this structure and transform it into the target schema. For each 'item' in the requests:
        - Extract the question title from \`item.title\`.
        - Determine the question type by looking at \`item.questionItem.question\`. A \`choiceQuestion\` with type 'RADIO' maps to 'MULTIPLE_CHOICE', and 'CHECKBOX' maps to 'CHECKBOXES'. A \`textQuestion\` with \`paragraph: true\` maps to 'PARAGRAPH', otherwise it's 'SHORT_ANSWER'.
        - Extract options for choice questions from \`item.questionItem.question.choiceQuestion.options\`, taking the 'value' from each option object.
        - Extract the \`required\` status from \`item.questionItem.question.required\`.
        - Group all extracted questions into a single section. You should invent a suitable title for this section and a main title and description for the entire form based on the questions' content.
    9. Return a single, valid JSON object matching the provided schema.`;

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
