import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from '../locales/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('zeroplate_language');
      if (saved === 'en' || saved === 'hi' || saved === 'mr') {
        return saved;
      }
    } catch (e) {
      console.warn('Failed to read language from localStorage', e);
    }
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('zeroplate_language', lang);
    } catch (e) {
      console.warn('Failed to save language to localStorage', e);
    }
  };

  const t = (key: string, fallback?: string): string => {
    const item = translations[key];
    if (item && item[language]) {
      return item[language];
    }
    return fallback || (item && item.en) || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
