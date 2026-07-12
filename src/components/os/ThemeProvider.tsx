"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read from localStorage on mount
    const storedTheme = localStorage.getItem("os-theme") as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => {
      const newTheme = prevTheme === "dark" ? "light" : "dark";
      localStorage.setItem("os-theme", newTheme);
      return newTheme;
    });
  };

  const themeClass = mounted ? (theme === "dark" ? "theme-os-dark" : "theme-os-light") : "theme-os-dark";

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`${themeClass} h-full w-full`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
