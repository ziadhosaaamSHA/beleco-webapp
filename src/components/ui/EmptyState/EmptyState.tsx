"use client";

import React from "react";
import { cn } from "@/lib/utils/cn";
import { Heading } from "../Heading/Heading";
import { Button } from "../Button/Button";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 rounded-3xl bg-white border border-brand-neutral-200/80 shadow-xs gap-3.5 animate-in fade-in duration-200 select-none",
        className
      )}
    >
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-brand-neutral-100 border border-brand-neutral-200/90 flex items-center justify-center text-primary-500 shadow-2xs">
          {icon}
        </div>
      )}

      <div className="flex flex-col gap-1 max-w-[280px]">
        <Heading variant="card-title" className="text-base font-bold text-brand-neutral-950">
          {title}
        </Heading>
        {description && (
          <p className="text-xs font-sans text-brand-neutral-500 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actionText && (
        <Button
          variant="primary"
          size="md"
          onClick={onAction}
          className="mt-1 font-bold text-xs shadow-xs"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
};
