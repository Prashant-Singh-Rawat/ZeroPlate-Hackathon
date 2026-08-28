import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Apply theme to DOM immediately (synchronous, before render)
function applyTheme(t: Theme) {
  const root = document.documentElement;
  if (t === 'dark') {
    root.classList.add('dark');
    document.body?.classList.add('dark');
  } else {
    root.classList.remove('dark');
    document.body?.classList.remove('dark');
  }
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('zeroplate_theme');
      if (saved === 'light' || saved === 'dark') {
        // Apply immediately so DOM is correct before first paint
        applyTheme(saved);
        return saved;
      }
    } catch (e) {
      console.warn('Failed to read theme from localStorage', e);
    }
    // Default = light
    applyTheme('light');
    return 'light';
  });

  // Keep DOM in sync whenever theme state changes
  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem('zeroplate_theme', theme);
    } catch (e) {}
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    try {
      localStorage.setItem('zeroplate_theme', newTheme);
    } catch (e) {
      console.warn('Failed to save theme to localStorage', e);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme: theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
