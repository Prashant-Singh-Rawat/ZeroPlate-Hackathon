import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language } from '../services/i18n/translations';

export type Theme = 'light' | 'dark';

interface ThemeLanguageContextType {
  theme: Theme;
  language: Language;
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
  toggleTheme: () => void;
  t: (key: string, fallback?: string) => string;
}

const ThemeLanguageContext = createContext<ThemeLanguageContextType | undefined>(undefined);

export const ThemeLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('zeroplate_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  });

  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('zeroplate_language');
    if (saved === 'Hindi' || saved === 'Marathi' || saved === 'English') return saved;
    return 'English';
  });

  // Apply dark class to document element immediately
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('zeroplate_theme', theme);
  }, [theme]);

  // Persist language
  useEffect(() => {
    localStorage.setItem('zeroplate_language', language);
  }, [language]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
  };

  const t = (key: string, fallback?: string): string => {
    const langDict = translations[language] || translations.English;
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    const engDict = translations.English;
    if (engDict && engDict[key]) {
      return engDict[key];
    }
    return fallback || key;
  };

  return (
    <ThemeLanguageContext.Provider
      value={{
        theme,
        language,
        setTheme,
        setLanguage,
        toggleTheme,
        t,
      }}
    >
      {children}
    </ThemeLanguageContext.Provider>
  );
};

export const useThemeLanguage = () => {
  const context = useContext(ThemeLanguageContext);
  if (!context) {
    throw new Error('useThemeLanguage must be used within ThemeLanguageProvider');
  }
  return context;
};
