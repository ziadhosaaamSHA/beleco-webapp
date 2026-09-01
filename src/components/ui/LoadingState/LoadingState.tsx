"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface LoadingStateProps {
  title?: string;
  description?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title,
  description,
  className,
  size = "md",
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-6 gap-3 animate-in fade-in duration-200 select-none",
        className
      )}
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute w-full h-full rounded-full bg-primary-100/50 animate-ping opacity-60 pointer-events-none" />
        <Loader2 className={cn("text-primary-500 animate-spin", sizeClasses[size])} />
      </div>

      {title && (
        <span className="font-editorial text-sm sm:text-base font-bold text-brand-neutral-900">
          {title}
        </span>
      )}

      {description && (
        <span className="text-xs font-sans text-brand-neutral-500 max-w-[260px] leading-relaxed">
          {description}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="h-full w-full flex items-center justify-center min-h-[300px]">
        {content}
      </div>
    );
  }

  return content;
};
