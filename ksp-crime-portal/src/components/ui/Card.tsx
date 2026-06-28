import React, { HTMLAttributes } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  borderAccent?: "none" | "left" | "top" | "critical";
  glow?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, title, subtitle, headerAction, borderAccent = "none", glow, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={twMerge(
          clsx(
            "bg-bg-surface border border-border-subtle rounded-md shadow-medium relative overflow-hidden flex flex-col",
            {
              "border-l-2 border-l-brand-primary": borderAccent === "left",
              "border-t-2 border-t-brand-primary": borderAccent === "top",
              "border-l-2 border-l-border-critical animate-pulse-warning": borderAccent === "critical",
              "shadow-high border-brand-accent/30": glow
            }
          ),
          className
        )}
        {...props}
      >
        {(title || subtitle || headerAction) && (
          <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between bg-bg-surface-elevated/40 select-none">
            <div className="flex flex-col gap-0.5">
              {title && (
                <h3 className="font-mono text-[0.75rem] font-bold uppercase tracking-wider text-text-primary">
                  {title}
                </h3>
              )}
              {subtitle && (
                <span className="font-sans text-[0.625rem] text-text-muted">
                  {subtitle}
                </span>
              )}
            </div>
            {headerAction && (
              <div className="flex items-center gap-2">
                {headerAction}
              </div>
            )}
          </div>
        )}
        <div className="p-4 flex-1 flex flex-col overflow-auto">
          {children}
        </div>
      </div>
    );
  }
);

Card.displayName = "Card";
