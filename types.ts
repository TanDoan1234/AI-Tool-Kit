export enum QuestionType {
  SHORT_ANSWER = 'SHORT_ANSWER',
  PARAGRAPH = 'PARAGRAPH',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  CHECKBOXES = 'CHECKBOXES',
  IMAGE_DISPLAY = 'IMAGE_DISPLAY',
}

export interface Question {
  title: string;
  type: QuestionType;
  options?: string[];
  imageUrl?: string;
  required?: boolean;
}

export interface FormSection {
  title: string;
  description: string;
  questions: Question[];
}

export interface FormDefinition {
  title: string;
  description: string;
  sections: FormSection[];
}