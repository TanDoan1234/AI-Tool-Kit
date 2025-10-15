import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { translations, TranslationKey } from './translations';

type Language = 'en' | 'vi';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language)