import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { translations, TranslationKey } from './translations';

type Language = 'en' | 'vi';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getInitialLanguage = (): Language => {
  const storedLang = localStorage.getItem('app-language');
  if (storedLang === 'en' || storedLang === 'vi') {
    return storedLang;
  }
  const browserLang = navigator.language.split(/[-_]/)[0];
  return browserLang === 'vi' ? 'vi' : 'en';
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('app-language', language);
  }, [language]);

  const setLanguage = (newLang: Language) => {
    if (newLang === language) return;
    setIsLoading(true);
    // Simulate a network delay for a smoother visual effect
    setTimeout(() => {
        setLanguageState(newLang);
        setIsLoading(false);
    }, 400);
  };

  const t = (key: TranslationKey): string => {
    const keys = key.split('.');
    let result: any = translations[language];
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if translation is missing
        let fallbackResult: any = translations.en;
        for (const fk of keys) {
            fallbackResult = fallbackResult?.[fk];
        }
        return fallbackResult || key;
      }
    }
    return result || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
