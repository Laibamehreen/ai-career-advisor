import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  indicatorClassName?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, indicatorClassName, ...props }, ref) => {
    // Ensure value stays between 0 and 100
    const safeValue = Math.min(100, Math.max(0, value));

    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full w-full flex-1 bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-500 ease-in-out rounded-full",
            indicatorClassName
          )}
          style={{ transform: `translateX(-${100 - safeValue}%)` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
