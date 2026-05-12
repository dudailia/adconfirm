import clsx from "clsx";
import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm text-muted-fg mb-1.5">{label}</label>
        )}
        <input
          ref={ref}
          className={clsx(
            "w-full px-3 py-2.5 rounded-lg text-sm text-white",
            "bg-surface-2 border transition-colors duration-200",
            "placeholder:text-muted-fg",
            "focus:outline-none focus:border-accent/60",
            error ? "border-danger/50" : "border-border",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-danger mt-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
