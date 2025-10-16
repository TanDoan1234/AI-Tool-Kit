import { FormDefinition, Question, QuestionType } from "../types";

/**
 * Safely escapes a string to be used inside a single-quoted or double-quoted string in generated code.
 * @param str The string to escape.
 * @returns A JSON-stringified version of the string.
 */
function scriptString(str: string | undefined | null): string {
    if (!str) return '""';
    return JSON.stringify(str);
}

interface AppsScriptOptions {
  shouldCreateSheet: boolean;
}

/**
 * Generates a Google Apps Script code string from a FormDefinition object.
 * This script can be run in the Google Apps Script editor to create a Google Form.
 * @param definition The form definition object.
 * @param language The current language to use for instructional comments.
 * @param options Additional options for script generation.
 * @returns A string containing the complete Google Apps Script code.
 */
export function generateAppsScriptCode(definition: FormDefinition, language: 'en' | 'vi', options: AppsScriptOptions): string {
    const instructionsEN = `/**
 * This Google Apps Script will create a new Google Form based on your specifications.
 * To use it:
 * 1. Open a Google Sheet or Google Docs.
 * 2. Go to Extensions > Apps Script.
 * 3. Paste this entire code into the editor, replacing any existing code.
 * 4. Click the "Save project" icon.
 * 5. From the function dropdown, select "createGoogleFormFromAI" and click "Run".
 * 6. You will be asked to grant permissions. Follow the prompts to allow the script to run.
 * 7. A new Google Form will be created in your Google Drive. Check the logs for the links.
 */`;

    const instructionsVI = `/**
 * Tập lệnh Google Apps Script này sẽ tạo một Google Form mới dựa trên thông số kỹ thuật của bạn.
 * Cách sử dụng:
 * 1. Mở một Google Sheet hoặc Google Docs mới.
 * 2. Đi tới Tiện ích mở rộng > Apps Script.
 * 3. Dán toàn bộ mã này vào trình chỉnh sửa, thay thế mọi mã hiện có.
 * 4. Nhấp vào biểu tượng "Lưu dự án".
 * 5. Từ menu thả xuống của hàm, chọn "createGoogleFormFromAI" và nhấp vào "Chạy".
 * 6. Bạn sẽ được yêu cầu cấp quyền. Làm theo lời nhắc để cho phép tập lệnh chạy.
 * 7. Một Google Form mới sẽ được tạo trong Google Drive của bạn. Kiểm tra nhật ký để xem các liên kết.
 */`;

    const instructions = language === 'vi' ? instructionsVI : instructionsEN;

    let codeBody = ``;
    codeBody += `
  // Create the form with the main title
  var form = FormApp.create(${scriptString(definition.title)});
`;

    if (definition.isQuiz) {
        codeBody += `
  // This is a quiz, so update the form settings accordingly.
  form.setIsQuiz(true);
`;
        if (definition.quizSettings) {
            // Since the UI options were removed, the settings are now fixed.
            // The comments reflect these fixed defaults.
            const feedbackCommentEN = `
  // --- Quiz Feedback Settings ---
  // NOTE: The following feedback settings cannot be set directly via Apps Script.
  // You must configure them manually in the Google Forms UI after the form is created.
  // Go to Settings > Quiz settings for this form to adjust these options:
  // - Release score: Immediately after each submission
  // - Respondents can see missed questions: (Manually configure)
  // - Respondents can see correct answers: No
  // - Respondents can see point values: No
`;
            const feedbackCommentVI = `
  // --- Cài đặt Phản hồi cho Bài kiểm tra ---
  // LƯU Ý: Các cài đặt phản hồi sau không thể được thiết lập trực tiếp qua Apps Script.
  // Bạn phải cấu hình chúng theo cách thủ công trong giao diện người dùng Google Forms sau khi biểu mẫu được tạo.
  // Đi tới Cài đặt > Cài đặt bài kiểm tra cho biểu mẫu này để điều chỉnh các tùy chọn sau:
  // - Công bố điểm: Ngay sau mỗi lần nộp
  // - Người trả lời có thể xem câu hỏi trả lời sai: (Cấu hình thủ công)
  // - Người trả lời có thể xem câu trả lời đúng: Không
  // - Người trả lời có thể xem giá trị điểm: Không
`;
            codeBody += language === 'vi' ? feedbackCommentVI : feedbackCommentEN;
        }
    }

    definition.sections.forEach((section, sectionIndex) => {
        codeBody += `\n  // --- Questions for Section: ${scriptString(section.title)} ---\n`;
        
        section.questions.forEach(question => {
            const itemVar = "item" + Math.random().toString(36).substring(2, 9);
            codeBody += `\n  // Question: ${question.title.replace(/\n/g, ' ')}\n`;
            
            let itemCreationCode = '';
            let canHavePoints = false;

            switch (question.type) {
                case QuestionType.SHORT_ANSWER:
                    itemCreationCode = `form.addTextItem()`;
                    canHavePoints = true;
                    break;
                case QuestionType.PARAGRAPH:
                    itemCreationCode = `form.addParagraphTextItem()`;
                    canHavePoints = true;
                    break;
                case QuestionType.MULTIPLE_CHOICE:
                    itemCreationCode = `form.addMultipleChoiceItem()`;
                    canHavePoints = true;
                    break;
                case QuestionType.CHECKBOXES:
                    itemCreationCode = `form.addCheckboxItem()`;
                    canHavePoints = true;
                    break;
                case QuestionType.IMAGE_DISPLAY:
                    itemCreationCode = `form.addImageItem()`;
                    canHavePoints = false;
                    break;
                default:
                    itemCreationCode = `form.addTextItem()`;
                    canHavePoints = true;
            }

            codeBody += `  var ${itemVar} = ${itemCreationCode};\n`;
            codeBody += `  ${itemVar}.setTitle(${scriptString(question.title)});\n`;

            if (question.required) {
                codeBody += `  ${itemVar}.setRequired(true);\n`;
            }
            
            if (definition.isQuiz && question.points && question.points > 0 && canHavePoints) {
                codeBody += `  ${itemVar}.setPoints(${question.points});\n`;
            }

            if ((question.type === QuestionType.MULTIPLE_CHOICE || question.type === QuestionType.CHECKBOXES) && question.options) {
                const choices = question.options.map(opt => {
                    const isCorrect = (question.correctAnswers || []).includes(opt);
                    return `${itemVar}.createChoice(${scriptString(opt)}, ${isCorrect})`
                }).join(',\n    ');
                codeBody += `  ${itemVar}.setChoices([\n    ${choices}\n  ]);\n`;
            }
            
            if (question.imageUrl) {
                 codeBody += `  try {\n`;
                 codeBody += `    var imageUrl = ${scriptString(question.imageUrl)};\n`;
                 codeBody += `    var imageBlob = UrlFetchApp.fetch(imageUrl).getBlob();\n`;
                 codeBody += `    ${itemVar}.setImage(imageBlob);\n`;
                 codeBody += `  } catch (e) {\n`;
                 codeBody += `    Logger.log('Could not fetch image for question "' + ${scriptString(question.title)} + '": ' + e.message);\n`;
                 if (question.type !== QuestionType.IMAGE_DISPLAY) {
                    codeBody += `    ${itemVar}.setHelpText('Error: Could not load image from ' + imageUrl);\n`;
                 }
                 codeBody += `  }\n`;
            }
        });

        if (sectionIndex < definition.sections.length - 1) {
            const nextSection = definition.sections[sectionIndex + 1];
            codeBody += `\n  // Add page break to start the next section\n`;
            codeBody += `  var pageBreak_${sectionIndex} = form.addPageBreakItem();\n`;
            codeBody += `  pageBreak_${sectionIndex}.setTitle(${scriptString(nextSection.title)});\n`;
            if (nextSection.description) {
                codeBody += `  pageBreak_${sectionIndex}.setHelpText(${scriptString(nextSection.description)});\n`;
            }
        }
    });

    let finalizationCode = ``;
    let sheetLogCode = ``;

    if (options.shouldCreateSheet) {
        finalizationCode = `
  // Create and link a new Google Sheet to store responses
  var ss = SpreadsheetApp.create("Responses for " + ${scriptString(definition.title)});
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
`;
        sheetLogCode = `  Logger.log('📊 Responses Sheet: ' + ss.getUrl());\n`;
    }

    finalizationCode += `
  // --- Final Summary ---
  Logger.log('✅ Form creation complete!');
  Logger.log('➡️ Form Link (for sharing): ' + form.getPublishedUrl());
  Logger.log('✏️  Editor Link (for you): ' + form.getEditUrl());
`;
    finalizationCode += sheetLogCode;

    const fullFunction = `function createGoogleFormFromAI() {
${codeBody}
${finalizationCode}
}
`;
    
    return instructions + "\n" + fullFunction;
}