import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function getAutoThemeByDaytime() {
  const hour = new Date().getHours();
  // Daytime: 6:00 AM (06:00) to 5:59 PM (17:59) -> Light Mode
  // Nighttime: 6:00 PM (18:00) to 5:59 AM (05:59) -> Dark Mode
  return hour >= 6 && hour < 18 ? 'light' : 'dark';
}

export function ThemeProvider({ children }) {
  // Default to 'auto' so the theme automatically follows outside daytime/nighttime
  const [themeMode, setThemeMode] = useState(() => {
    if (typeof window !== 'undefined') {
      // Remove legacy permanent 'theme' key so automatic daytime mode works out of the box
      localStorage.removeItem('theme');
      const sessionMode = sessionStorage.getItem('theme_mode');
      if (sessionMode === 'light' || sessionMode === 'dark' || sessionMode === 'auto') {
        return sessionMode;
      }
    }
    return 'auto';
  });

  const [autoTheme, setAutoTheme] = useState(() => getAutoThemeByDaytime());

  // Automatically check local daytime/nighttime every 30 seconds and on tab focus
  useEffect(() => {
    const syncDaytime = () => {
      setAutoTheme(getAutoThemeByDaytime());
    };

    syncDaytime();
    const intervalId = setInterval(syncDaytime, 30000);
    window.addEventListener('focus', syncDaytime);
    document.addEventListener('visibilitychange', syncDaytime);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', syncDaytime);
      document.removeEventListener('visibilitychange', syncDaytime);
    };
  }, []);

  const theme = themeMode === 'auto' ? autoTheme : themeMode;

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.classList.toggle('dark', theme === 'dark');
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('theme_mode', themeMode);
    }
  }, [theme, themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => {
      if (prev === 'auto') {
        return autoTheme === 'dark' ? 'light' : 'dark';
      }
      return 'auto';
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        isAuto: themeMode === 'auto',
        setThemeMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
