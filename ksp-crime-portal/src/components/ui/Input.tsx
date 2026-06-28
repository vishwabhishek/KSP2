import React, { InputHTMLAttributes } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefixIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, prefixIcon, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 w-full">
        {label && (
          <label className="text-[0.625rem] font-mono font-bold uppercase tracking-wider text-text-secondary select-none">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {prefixIcon && (
            <div className="absolute left-3 text-text-muted pointer-events-none flex items-center justify-center">
              {prefixIcon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={twMerge(
              clsx(
                "w-full h-9 bg-bg-surface border border-border-subtle rounded-sm text-[0.75rem] text-text-primary px-3 transition-all duration-150 placeholder:text-text-muted focus:outline-none focus:border-border-focus focus:ring-1 focus:ring-border-focus shadow-low disabled:opacity-50 disabled:cursor-not-allowed",
                {
                  "pl-9": prefixIcon,
                  "border-border-critical focus:border-border-critical focus:ring-border-critical": error,
                }
              ),
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <span className="text-[0.625rem] font-mono text-border-critical tracking-wide">
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
