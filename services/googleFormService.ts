// FIX: Add type declarations for the Google API and Identity Services clients, which are loaded via script tags.
// This resolves "Cannot find name 'google'" and "Cannot find name 'gapi'" TypeScript errors.
declare const gapi: any;
// FIX: Define the 'google' namespace and nested types for the Google Identity Services client
// to resolve "Cannot find namespace 'google'" error. This provides proper type info for 'tokenClient'.
declare namespace google {
  namespace accounts {
    namespace oauth2 {
      interface TokenResponse {
        access_token: string;
      }
      interface TokenClient {
        requestAccessToken: () => void;
      }
      function initTokenClient(config: {
        client_id: string | undefined;
        scope: string;
        callback: (tokenResponse: TokenResponse) => void;
      }): TokenClient;
      function revoke(token: string, done: () => void): void;
    }
  }
}

import { FormDefinition, Question, QuestionType } from "../types";
import { getApiKeys, isGoogleConfigured } from './configService';

const { googleApiKey, googleClientId } = getApiKeys();
const IS_CONFIGURED = isGoogleConfigured();

const DISCOVERY_DOC = 'https://forms.googleapis.com/$discovery/rest?version=v1';
const SCOPES = 'https://www.googleapis.com/auth/forms.body';

let tokenClient: google.accounts.oauth2.TokenClient | null = null;
let gapiInited = false;
let gisInited = false;

let onAuthChange: (isReady: boolean, isSignedIn: boolean) => void;

/**
 * Initializes the Google API client and Google Identity Services.
 * @param callback A function to call with the readiness and authentication status.
 */
export function initGoogleClient(callback: (isReady: boolean, isSignedIn: boolean) => void) {
  onAuthChange = callback;

  if (!IS_CONFIGURED) {
    console.warn("Google Form creation is disabled. Missing Google Cloud API Key or Client ID.");
    // No need to call back, App.tsx handles the UI state
    return;
  }

  loadGapiScript();
  loadGisScript();
}

function loadGapiScript() {
  const script = document.createElement('script');
  script.src = 'https://apis.google.com/js/api.js';
  script.async = true;
  script.defer = true;
  script.onload = gapiLoaded;
  document.body.appendChild(script);
}

function loadGisScript() {
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  script.onload = gisLoaded;
  document.body.appendChild(script);
}

function gapiLoaded() {
  gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: googleApiKey,
    discoveryDocs: [DISCOVERY_DOC],
  });
  gapiInited = true;
  checkAuthReady();
}

function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: googleClientId,
    scope: SCOPES,
    callback: (tokenResponse) => {
       // The access token is automatically handled by the gapi client.
       // We just need to update the UI state.
       if (tokenResponse && tokenResponse.access_token) {
        onAuthChange(true, true);
       }
    },
  });
  gisInited = true;
  checkAuthReady();
}

function checkAuthReady() {
    if(gapiInited && gisInited) {
        onAuthChange(true, false);
    }
}

export function signIn() {
  if (!IS_CONFIGURED || !tokenClient) {
    console.error("Cannot sign in, Google client not configured or initialized.");
    return;
  }
  tokenClient.requestAccessToken();
}

export function signOut() {
  if (!IS_CONFIGURED) return;
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token, () => {
      gapi.client.setToken(null);
      onAuthChange(true, false);
    });
  }
}

function mapQuestionToGoogleFormItem(question: Question) {
  const item: any = {
    title: question.title,
    questionItem: {
      question: {
        required: question.required || false,
      },
    },
  };

  // Handle quiz grading for questions with points
  if (question.points && question.points > 0) {
    item.questionItem.question.grading = {
      pointValue: question.points,
      correctAnswers: {
        answers: (question.correctAnswers || []).map(ans => ({ value: ans }))
      }
    };
  }


  if (question.imageUrl && question.type !== QuestionType.IMAGE_DISPLAY) {
    // Ensure grading is not applied to the image itself, but to the question
    item.questionItem.image = {
        sourceUri: question.imageUrl,
        properties: { alignment: 'CENTER' }
    };
  }

  switch (question.type) {
    case QuestionType.SHORT_ANSWER:
      item.questionItem.question.textQuestion = { paragraph: false };
      break;
    case QuestionType.PARAGRAPH:
      item.questionItem.question.textQuestion = { paragraph: true };
      break;
    case QuestionType.MULTIPLE_CHOICE:
    case QuestionType.CHECKBOXES:
      item.questionItem.question.choiceQuestion = {
        type: question.type === QuestionType.MULTIPLE_CHOICE ? 'RADIO' : 'CHECKBOX',
        options: (question.options || []).map(opt => ({ value: opt })),
      };
      break;
    case QuestionType.IMAGE_DISPLAY:
      return {
        title: question.title,
        imageItem: {
          image: {
            sourceUri: question.imageUrl,
            properties: { alignment: 'CENTER' }
          }
        }
      };
    default:
        // Fallback for unknown types - treat as short answer
        item.questionItem.question.textQuestion = { paragraph: false };
  }

  return item;
}

/**
 * Creates a new Google Form based on the provided definition.
 * @param definition The structure of the form to create.
 * @returns The URL of the newly created form.
 */
export async function createGoogleForm(definition: FormDefinition): Promise<string> {
  if (!IS_CONFIGURED) {
    throw new Error("Google client is not configured. Cannot create form.");
  }
  try {
    const form = {
      info: {
        title: definition.title,
        documentTitle: definition.title,
      },
    };

    const createResponse = await gapi.client.forms.forms.create({ resource: form });
    const formId = createResponse.result.formId;

    if (!formId) {
        throw new Error("Failed to get formId from creation response.");
    }
    
    const requests: any[] = [];
    
    if (definition.isQuiz) {
        const quizSettings: any = { isQuiz: true };
        const updateMaskPaths = ['quizSettings.isQuiz'];

        if (definition.quizSettings) {
            quizSettings.grade = {
                score: definition.quizSettings.releaseScoreImmediately ? 'RELEASED' : 'NOT_RELEASED',
                correctAnswersShown: !!definition.quizSettings.showCorrectAnswers,
                pointsShown: !!definition.quizSettings.showPointValues,
            };
            updateMaskPaths.push('quizSettings.grade');
        }
        
        requests.push({
            updateSettings: {
                settings: { quizSettings },
                updateMask: updateMaskPaths.join(',')
            }
        });
    }


    let currentIndex = 0;
    definition.sections.forEach((section, sectionIndex) => {
      // Add all questions for the current section
      section.questions.forEach(q => {
        requests.push({
          createItem: {
            item: mapQuestionToGoogleFormItem(q),
            location: { index: currentIndex++ }
          }
        });
      });

      // Add a page break after the section, but not for the very last one
      if (sectionIndex < definition.sections.length - 1) {
        const nextSection = definition.sections[sectionIndex + 1];
        requests.push({
          createItem: {
            item: {
              title: nextSection.title,
              description: nextSection.description,
              pageBreakItem: {}
            },
            location: { index: currentIndex++ }
          }
        });
      }
    });


    if (requests.length > 0) { // Only batch update if there are items to add
      await gapi.client.forms.forms.batchUpdate({
        formId,
        resource: { requests },
      });
    }
    
    return createResponse.result.responderUri;

  } catch (err: any) {
    console.error("Error creating Google Form:", err);
    let message = "Could not create form.";
    if (err.result?.error?.message) {
        message += ` Reason: ${err.result.error.message}`;
    }
    if (err.message) {
        message += ` Details: ${err.message}`;
    }
    throw new Error(message);
  }
}