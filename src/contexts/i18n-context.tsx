
"use client"

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { translations, TranslationKey } from '@/lib/translations';

type Language = 'en' | 'hi' | 'mr';

interface I18nContextType {
  language: Language;
  t: (key: TranslationKey) => string;
  changeLanguage: (lang: Language) => void;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  const changeLanguage = useCallback((lang: Language) => {
    if (['en', 'hi', 'mr'].includes(lang)) {
        setLanguage(lang);
    }
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    return translations[language][key] || translations['en'][key] || key;
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, t, changeLanguage }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
