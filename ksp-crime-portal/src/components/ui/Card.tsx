"use client";

import React, { HTMLAttributes, useState } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Maximize2, Minimize2 } from "lucide-react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  borderAccent?: "none" | "left" | "top" | "critical";
  glow?: boolean;
  allowMaximize?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, title, subtitle, headerAction, borderAccent = "none", glow, allowMaximize = true, children, ...props }, ref) => {
    const [isMaximized, setIsMaximized] = useState(false);

    const toggleMaximize = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsMaximized(!isMaximized);
    };

    const cardElement = (
      <div
        ref={ref}
        className={twMerge(
          clsx(
            "bg-bg-surface border border-border-subtle rounded-md shadow-medium relative overflow-hidden flex flex-col transition-all duration-200",
            {
              "border-l-2 border-l-brand-primary": borderAccent === "left" && !isMaximized,
              "border-t-2 border-t-brand-primary": borderAccent === "top" && !isMaximized,
              "border-l-2 border-l-border-critical animate-pulse-warning": borderAccent === "critical" && !isMaximized,
              "shadow-high border-brand-accent/30": glow || isMaximized,
              "fixed inset-4 md:inset-10 z-50 bg-bg-surface": isMaximized,
            }
          ),
          className
        )}
        {...props}
      >
        {(title || subtitle || headerAction || (allowMaximize && title)) && (
          <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between bg-bg-surface-elevated/40 select-none shrink-0">
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
            <div className="flex items-center gap-2">
              {headerAction}
              {allowMaximize && title && (
                <button
                  type="button"
                  onClick={toggleMaximize}
                  className="p-1 hover:bg-bg-surface-elevated rounded-sm text-text-muted hover:text-text-primary transition-colors cursor-pointer"
                  title={isMaximized ? "Exit Focus Mode" : "Expand to Focus Mode"}
                >
                  {isMaximized ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                </button>
              )}
            </div>
          </div>
        )}
        <div className="p-4 flex-1 flex flex-col overflow-auto min-h-0">
          {children}
        </div>
      </div>
    );

    if (isMaximized) {
      return (
        <>
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs z-40 transition-opacity animate-fade-in"
            onClick={() => setIsMaximized(false)}
          />
          {cardElement}
        </>
      );
    }

    return cardElement;
  }
);

Card.displayName = "Card";
