import React from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "neutral" | "success" | "danger" | "gold" | "outline";
  size?: "sm" | "md";
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}) => {
  const variantStyles = {
    primary: "bg-primary-100 text-primary-700 border border-primary-200",
    neutral: "bg-brand-neutral-100 text-brand-neutral-800 border border-brand-neutral-200",
    success: "bg-success-50 text-success-700 border border-success-500/20",
    danger: "bg-danger-50 text-danger-700 border border-danger-500/20",
    gold: "bg-tertiary-100 text-tertiary-700 border border-tertiary-200",
    outline: "bg-transparent text-brand-neutral-600 border border-brand-neutral-300",
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-[10px] rounded-lg font-bold tracking-tight",
    md: "px-2.5 py-1 text-xs rounded-xl font-bold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center font-sans whitespace-nowrap",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
