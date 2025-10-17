// FIX: Manually define types for import.meta.env to resolve TypeScript errors
// in environments where "vite/client" types are not automatically included.
// This removes the need for a triple-slash directive that was causing a file-not-found error.
interface ImportMetaEnv {
  readonly VITE_GEMINI_API_KEY: string;
  readonly VITE_GOOGLE_API_KEY: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
}

// FIX: Correctly augment the global `ImportMeta` type to include `env` for Vite environment variables.
// This is done by wrapping the `ImportMeta` interface declaration in a `declare global` block,
// which is necessary because this file is a module.
declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export interface ApiKeys {
  geminiApiKey: string;
  googleApiKey: string;
  googleClientId: string;
}

const STORAGE_KEY = 'ai-form-generator-apikeys';

/**
 * Retrieves API keys from localStorage, with environment variables as a fallback.
 * Vite uses `import.meta.env` to expose environment variables.
 */
export function getApiKeys(): ApiKeys {
  const storedKeys = localStorage.getItem(STORAGE_KEY);
  const parsedKeys = storedKeys ? JSON.parse(storedKeys) : {};
  
  // FIX: Safely access Vite environment variables. The 'import.meta.env' object 
  // is injected by Vite and may be undefined in other environments.
  // By setting the fallback to `undefined` and using optional chaining (`?.`), 
  // we avoid type errors when accessing environment variables that may not exist.
  const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : undefined;

  return {
    geminiApiKey: parsedKeys.geminiApiKey || env?.VITE_GEMINI_API_KEY || '',
    googleApiKey: parsedKeys.googleApiKey || env?.VITE_GOOGLE_API_KEY || '',
    googleClientId: parsedKeys.googleClientId || env?.VITE_GOOGLE_CLIENT_ID || '',
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
