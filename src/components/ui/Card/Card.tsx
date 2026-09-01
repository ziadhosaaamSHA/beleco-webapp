import React from "react";
import { cn } from "@/lib/utils/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "surface" | "elevated" | "interactive";
  children: React.ReactNode;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variantStyles = {
      default: "bg-white border border-brand-neutral-200 shadow-card",
      surface: "bg-brand-neutral-100 border border-brand-neutral-200/80",
      elevated: "bg-white border border-brand-neutral-200/60 shadow-md",
      interactive:
        "bg-white border border-brand-neutral-200 shadow-card hover:border-primary-300 hover:shadow-md transition-all duration-150 cursor-pointer active:scale-[0.99]",
    };

    return (
      <div
        ref={ref}
        className={cn("rounded-2xl p-4 text-left", variantStyles[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
