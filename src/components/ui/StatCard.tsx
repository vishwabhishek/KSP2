import React from "react";
import { clsx } from "clsx";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { Card } from "./Card";

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: number; // e.g. +12.4 or -3.2
  trendDirection?: "up" | "down" | "neutral";
  sparklineData?: number[];
  className?: string;
}

export const StatCard = ({
  title,
  value,
  subtitle,
  trend,
  trendDirection = "neutral",
  sparklineData = [10, 15, 8, 12, 20, 16, 25],
  className
}: StatCardProps) => {
  // Generate SVG path points for sparkline
  const minVal = Math.min(...sparklineData);
  const maxVal = Math.max(...sparklineData);
  const range = maxVal - minVal || 1;
  const width = 100;
  const height = 30;
  const points = sparklineData
    .map((val, index) => {
      const x = (index / (sparklineData.length - 1)) * width;
      const y = height - ((val - minVal) / range) * height + 2; // Offset slightly to avoid cutoffs
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <Card className={className} title={title}>
      <div className="flex items-end justify-between select-none">
        <div className="flex flex-col gap-1">
          <span className="text-[28px] font-mono font-bold tracking-tight text-text-primary leading-none">
            {value}
          </span>
          {subtitle && (
            <span className="text-[0.625rem] text-text-muted mt-1">{subtitle}</span>
          )}
        </div>

        <div className="flex flex-col items-end gap-1.5">
          {/* Trend Indicator */}
          {trend !== undefined && (
            <div
              className={clsx(
                "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-sm font-mono text-[0.625rem] font-bold",
                {
                  "bg-severity-level1/10 text-severity-level1 border border-severity-level1/25": trendDirection === "up",
                  "bg-severity-level3/10 text-severity-level3 border border-severity-level3/25": trendDirection === "down",
                  "bg-bg-surface-elevated text-text-muted border border-border-subtle": trendDirection === "neutral"
                }
              )}
            >
              {trendDirection === "up" ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : trendDirection === "down" ? (
                <ArrowDownRight className="h-3 w-3" />
              ) : (
                <Minus className="h-3 w-3" />
              )}
              {trend > 0 ? `+${trend}` : trend}%
            </div>
          )}

          {/* Inline Sparkline */}
          <div className="w-[100px] h-[30px] opacity-60">
            <svg width={width} height={height} className="overflow-visible">
              <polyline
                fill="none"
                stroke={
                  trendDirection === "up"
                    ? "#10b981"
                    : trendDirection === "down"
                    ? "#ef4444"
                    : "#6b7280"
                }
                strokeWidth="1.5"
                points={points}
              />
            </svg>
          </div>
        </div>
      </div>
    </Card>
  );
};
