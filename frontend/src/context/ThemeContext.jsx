import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem("moviereview-theme");
    if (savedTheme) {
      return savedTheme === "dark";
    }
    // Check system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    // Apply theme to document
    if (isDarkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
    }

    // Save to localStorage
    localStorage.setItem("moviereview-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const value = {
    isDarkMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
