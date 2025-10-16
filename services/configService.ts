export interface ApiKeys {
  geminiApiKey: string;
  googleApiKey: string;
  googleClientId: string;
}

const STORAGE_KEY = 'ai-form-generator-apikeys';

/**
 * Retrieves API keys from localStorage, with environment variables as a fallback.
 */
export function getApiKeys(): ApiKeys {
  const storedKeys = localStorage.getItem(STORAGE_KEY);
  const parsedKeys = storedKeys ? JSON.parse(storedKeys) : {};
  
  return {
    geminiApiKey: parsedKeys.geminiApiKey || process.env.API_KEY || '',
    googleApiKey: parsedKeys.googleApiKey || process.env.GOOGLE_API_KEY || '',
    googleClientId: parsedKeys.googleClientId || process.env.GOOGLE_CLIENT_ID || '',
  };
}

/**
 * Saves the provided API keys to localStorage.
 * @param keys The API keys to save.
 */
export function saveApiKeys(keys: ApiKeys): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
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
    const keys = getApiKeys();
    return !!keys.geminiApiKey;
}