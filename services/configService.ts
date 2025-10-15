export interface ApiKeys {
  geminiApiKey: string;
  googleApiKey: string;
  googleClientId: string;
}

const STORAGE_KEY = 'ai-form-generator-apikeys';

/**
 * Retrieves API keys. The Gemini key comes ONLY from environment variables,
 * while Google keys can come from localStorage or environment variables.
 */
export function getApiKeys(): ApiKeys {
  const storedKeys = localStorage.getItem(STORAGE_KEY);
  const parsedKeys = storedKeys ? JSON.parse(storedKeys) : {};
  
  return {
    // FIX: Per guidelines, Gemini API Key must come exclusively from environment variables.
    geminiApiKey: process.env.API_KEY || '',
    googleApiKey: parsedKeys.googleApiKey || process.env.GOOGLE_API_KEY || '',
    googleClientId: parsedKeys.googleClientId || process.env.GOOGLE_CLIENT_ID || '',
  };
}

/**
 * Saves the provided API keys to localStorage, excluding the Gemini key.
 * @param keys The API keys to save.
 */
export function saveApiKeys(keys: ApiKeys): void {
  // FIX: Per guidelines, do not store or manage the Gemini API key in the UI/localStorage.
  const { geminiApiKey, ...googleKeys } = keys;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(googleKeys));
}

/**
 * Checks if the necessary keys for Google integration are present.
 */
export function isGoogleConfigured(): boolean {
  const keys = getApiKeys();
  return !!keys.googleApiKey && !!keys.googleClientId;
}

/**
 * Checks if the necessary key for Gemini integration is present.
 */
export function isGeminiConfigured(): boolean {
    // FIX: Per guidelines, Gemini API key must be from process.env.API_KEY.
    return !!process.env.API_KEY;
}
