"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export interface Toast {
  id: string;
  title?: string;
  description: string;
  variant?: "default" | "success" | "destructive" | "info";
}

interface ToastContextType {
  toast: (options: Omit<Toast, "id">) => void;
  toasts: Toast[];
  dismiss: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const toast = React.useCallback(
    ({ title, description, variant = "default" }: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substring(7);
      setToasts((prev) => [...prev, { id, title, description, variant }]);

      // Auto dismiss after 4 seconds
      setTimeout(() => {
        dismiss(id);
      }, 4000);
    },
    []
  );

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, toasts, dismiss }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "flex items-start gap-3 rounded-xl border p-4 shadow-lg backdrop-blur-md animate-fade-in transition-all",
              {
                "bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100":
                  t.variant === "default",
                "bg-emerald-50/95 dark:bg-emerald-950/95 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-100":
                  t.variant === "success",
                "bg-red-50/95 dark:bg-red-950/95 border-red-200 dark:border-red-800 text-red-800 dark:text-red-100":
                  t.variant === "destructive",
                "bg-indigo-50/95 dark:bg-indigo-950/95 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-100":
                  t.variant === "info",
              }
            )}
          >
            <div className="flex-shrink-0 mt-0.5">
              {t.variant === "success" && <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
              {t.variant === "destructive" && <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />}
              {t.variant === "info" && <Info className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
              {t.variant === "default" && <Info className="h-5 w-5 text-slate-600 dark:text-slate-400" />}
            </div>
            <div className="flex-1">
              {t.title && <h4 className="text-sm font-bold leading-none mb-1">{t.title}</h4>}
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {t.description}
              </p>
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="flex-shrink-0 rounded-lg p-0.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
