"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface CircularProgressProps extends React.SVGProps<SVGSVGElement> {
  value: number;
  max?: number;
}

const CircularProgress = React.forwardRef<
  SVGSVGElement,
  CircularProgressProps
>(({ className, value, max = 9, ...props }, ref) => {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  // Ensure progress doesn't exceed max
  const safeValue = Math.min(value, max);
  const progress = safeValue / max;
  const offset = circumference * (1 - progress);

  return (
    <svg
      ref={ref}
      width="120"
      height="120"
      viewBox="0 0 100 100"
      className={cn("transform -rotate-90", className)}
      {...props}
    >
      <circle
        cx="50"
        cy="50"
        r={radius}
        strokeWidth="10"
        className="stroke-secondary"
        fill="transparent"
      />
      <circle
        cx="50"
        cy="50"
        r={radius}
        strokeWidth="10"
        className="stroke-primary transition-all duration-500 ease-out"
        fill="transparent"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
      />
    </svg>
  );
});
CircularProgress.displayName = "CircularProgress";

export { CircularProgress };
