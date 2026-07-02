import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "premium";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none",
        {
          "border-transparent bg-indigo-100 dark:bg-indigo-950/65 text-indigo-700 dark:text-indigo-400": variant === "default",
          "border-transparent bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300": variant === "secondary",
          "border-transparent bg-red-100 dark:bg-red-950/65 text-red-700 dark:text-red-400": variant === "destructive",
          "border-transparent bg-emerald-100 dark:bg-emerald-950/65 text-emerald-700 dark:text-emerald-400": variant === "success",
          "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-transparent": variant === "outline",
          "border-transparent bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold animate-pulse-slow": variant === "premium",
        },
        className
      )}
      {...props}
    />
  );
}

export { Badge };
