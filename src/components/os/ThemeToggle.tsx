"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center w-14 h-7 rounded-full bg-surface-container-high border border-outline-variant p-1 transition-colors hover:border-primary-container focus:outline-none"
      aria-label="Toggle Theme"
    >
      <div 
        className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-primary-container flex items-center justify-center transition-transform duration-300 ease-in-out ${isDark ? "translate-x-0" : "translate-x-7"}`}
      >
        {isDark ? (
          <Moon className="w-3 h-3 text-on-primary-container" />
        ) : (
          <Sun className="w-3 h-3 text-on-primary-container" />
        )}
      </div>
      <div className="w-full flex justify-between px-1.5">
        <Moon className={`w-3 h-3 ${isDark ? "opacity-0" : "text-on-surface-variant"}`} />
        <Sun className={`w-3 h-3 ${!isDark ? "opacity-0" : "text-on-surface-variant"}`} />
      </div>
    </button>
  );
}
