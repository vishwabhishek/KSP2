import React, { HTMLAttributes } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const Skeleton = ({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={twMerge(
        clsx(
          "animate-shimmer rounded-sm bg-linear-to-r from-bg-surface via-bg-surface-elevated to-bg-surface bg-[length:200%_100%]",
          className
        )
      )}
      {...props}
    />
  );
};
