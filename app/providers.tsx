"use client";

import * as React from "react";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "@/components/ui/toast";

interface ThemeContextType {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<"light" | "dark">("dark");

  React.useEffect(() => {
    // Try to load saved theme
    const saved = localStorage.getItem("theme") as "light" | "dark";
    if (saved) {
      setTheme(saved);
      applyTheme(saved);
    } else {
      // Default to dark
      applyTheme("dark");
    }
  }, []);

  const applyTheme = (t: "light" | "dark") => {
    const root = window.document.documentElement;
    if (t === "dark") {
      root.classList.remove("light");
      root.classList.add("dark");
      document.body.classList.remove("light-theme");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
      document.body.classList.add("light-theme");
    }
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    applyTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
