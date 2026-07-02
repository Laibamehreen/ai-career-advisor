import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "premium";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 active:scale-95 duration-200 cursor-pointer",
          {
            // Variants
            "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-200 dark:shadow-none hover:brightness-110 hover:-translate-y-0.5": variant === "default",
            "bg-red-500 text-white hover:bg-red-600 shadow-sm shadow-red-100 dark:shadow-none": variant === "destructive",
            "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850": variant === "outline",
            "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-150 hover:bg-slate-200 dark:hover:bg-slate-700": variant === "secondary",
            "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200": variant === "ghost",
            "text-indigo-600 dark:text-indigo-400 underline-offset-4 hover:underline bg-transparent p-0 active:scale-100": variant === "link",
            "bg-gradient-to-r from-amber-500 via-orange-600 to-pink-600 text-white shadow-md hover:brightness-110 hover:shadow-orange-200 hover:-translate-y-0.5": variant === "premium",
            // Sizes
            "h-10 px-4 py-2": size === "default",
            "h-8 rounded-lg px-3 text-xs": size === "sm",
            "h-12 rounded-xl px-8 text-base": size === "lg",
            "h-10 w-10 p-0": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
