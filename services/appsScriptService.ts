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

/**
 * Generates a Google Apps Script code string from a FormDefinition object.
 * This script can be run in the Google Apps Script editor to create a Google Form.
 * @param definition The form definition object.
 * @returns A string containing the complete Google Apps Script code.
 */
export function generateAppsScriptCode(definition: FormDefinition): string {
    let code = `/**
 * This Google Apps Script will create a new Google Form based on your specifications.
 * To use it:
 * 1. Open a Google Sheet or Google Docs.
 * 2. Go to Extensions > Apps Script.
 * 3. Paste this entire code into the editor, replacing any existing code.
 * 4. Click the "Save project" icon.
 * 5. From the function dropdown, select "createGoogleFormFromAI" and click "Run".
 * 6. You will be asked to grant permissions. Follow the prompts to allow the script to run.
 * 7. A new Google Form will be created in your Google Drive.
 */
function createGoogleFormFromAI() {
  // Create the form with the main title and description
  var form = FormApp.create(${scriptString(definition.title)});
  form.setDescription(${scriptString(definition.description)});

`;

    definition.sections.forEach((section, sectionIndex) => {
        code += `\n  // --- Questions for Section: ${scriptString(section.title)} ---\n`;
        
        section.questions.forEach(question => {
            // Generate a reasonably unique variable name for the item
            const itemVar = "item" + Math.random().toString(36).substring(2, 9);
            code += `\n  // Question: ${question.title.replace(/\n/g, ' ')}\n`;
            
            let itemCreationCode = '';

            switch (question.type) {
                case QuestionType.SHORT_ANSWER:
                    itemCreationCode = `form.addTextItem()`;
                    break;
                case QuestionType.PARAGRAPH:
                    itemCreationCode = `form.addParagraphTextItem()`;
                    break;
                case QuestionType.MULTIPLE_CHOICE:
                    itemCreationCode = `form.addMultipleChoiceItem()`;
                    break;
                case QuestionType.CHECKBOXES:
                    itemCreationCode = `form.addCheckboxItem()`;
                    break;
                case QuestionType.IMAGE_DISPLAY:
                    itemCreationCode = `form.addImageItem()`;
                    break;
                default:
                    // Fallback to a standard text item for any unknown types
                    itemCreationCode = `form.addTextItem()`;
            }

            code += `  var ${itemVar} = ${itemCreationCode};\n`;
            code += `  ${itemVar}.setTitle(${scriptString(question.title)});\n`;

            if (question.required) {
                code += `  ${itemVar}.setRequired(true);\n`;
            }

            // For choice-based questions, add the options
            if ((question.type === QuestionType.MULTIPLE_CHOICE || question.type === QuestionType.CHECKBOXES) && question.options) {
                const choices = question.options.map(opt => `${itemVar}.createChoice(${scriptString(opt)})`).join(',\n    ');
                code += `  ${itemVar}.setChoices([\n    ${choices}\n  ]);\n`;
            }
            
            // Handle images. For IMAGE_DISPLAY, it's the main content. For others, it's an attachment.
            if (question.imageUrl) {
                 code += `  try {\n`;
                 code += `    var imageUrl = ${scriptString(question.imageUrl)};\n`;
                 code += `    var imageBlob = UrlFetchApp.fetch(imageUrl).getBlob();\n`;
                 code += `    ${itemVar}.setImage(imageBlob);\n`;
                 code += `  } catch (e) {\n`;
                 code += `    Logger.log('Could not fetch image for question "' + ${scriptString(question.title)} + '": ' + e.message);\n`;
                 code += `    // If image fails to load, add a help text note.\n`;
                 code += `    ${itemVar}.setHelpText('Error: Could not load image from ' + imageUrl);\n`;
                 code += `  }\n`;
            }
        });

        // Add a page break after the current section if it's not the last one
        if (sectionIndex < definition.sections.length - 1) {
            const nextSection = definition.sections[sectionIndex + 1];
            code += `\n  // Add page break to start the next section\n`;
            code += `  var pageBreak_${sectionIndex} = form.addPageBreakItem();\n`;
            code += `  pageBreak_${sectionIndex}.setTitle(${scriptString(nextSection.title)});\n`;
            if (nextSection.description) {
                code += `  pageBreak_${sectionIndex}.setHelpText(${scriptString(nextSection.description)});\n`;
            }
        }
    });

    code += `\n  Logger.log('Form created successfully!');\n`;
    code += `  Logger.log('Published URL: ' + form.getPublishedUrl());\n`;
    code += `  Logger.log('Editor URL: ' + form.getEditUrl());\n`;
    code += `}\n`;
    
    return code;
}