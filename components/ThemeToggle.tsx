"use client";

import * as React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/app/providers";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-9 w-9 p-0 rounded-full hover:bg-slate-200/10 dark:hover:bg-slate-800/60"
      onClick={toggleTheme}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      {theme === "dark" ? (
        <Sun className="h-4.5 w-4.5 text-amber-400 transition-all" />
      ) : (
        <Moon className="h-4.5 w-4.5 text-indigo-400 transition-all" />
      )}
    </Button>
  );
}
