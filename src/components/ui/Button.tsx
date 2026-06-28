import React, { ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "critical" | "borderless" | "hud";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", loading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={twMerge(
          clsx(
            "inline-flex items-center justify-center font-mono font-bold uppercase tracking-wider rounded-sm transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]",
            // Variants
            {
              "bg-brand-primary text-text-primary border border-brand-primary hover:bg-brand-primary-hover hover:border-brand-primary-hover shadow-low":
                variant === "primary",
              "bg-bg-surface-elevated text-text-primary border border-border-subtle hover:bg-bg-surface hover:border-border-focus hover:text-text-accent shadow-low":
                variant === "secondary",
              "bg-severity-level4 text-text-primary border border-border-critical hover:bg-red-950/80 shadow-low":
                variant === "critical",
              "bg-transparent text-text-secondary border border-transparent hover:text-text-primary hover:bg-bg-surface-elevated":
                variant === "borderless",
              "bg-bg-base/70 backdrop-blur-md text-brand-accent border border-border-subtle hover:border-brand-accent hover:text-text-primary shadow-high":
                variant === "hud",
            },
            // Sizes
            {
              "px-2 py-1 text-[0.625rem] h-7": size === "sm",
              "px-3 py-1.5 text-[0.75rem] h-9": size === "md",
              "px-4 py-2 text-[0.875rem] h-11": size === "lg",
            }
          ),
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
