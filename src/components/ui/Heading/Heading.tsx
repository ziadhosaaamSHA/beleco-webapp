import React from "react";
import { cn } from "@/lib/utils/cn";

export type HeadingVariant =
  | "editorial-h1"
  | "editorial-h2"
  | "section-title"
  | "card-title"
  | "metric-value"
  | "subheading"
  | "badge-label";

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
  variant?: HeadingVariant;
  children: React.ReactNode;
}

const variantStyles: Record<HeadingVariant, string> = {
  "editorial-h1": "font-editorial font-bold text-2xl sm:text-3xl text-brand-neutral-900 tracking-tight leading-tight",
  "editorial-h2": "font-editorial font-semibold text-xl sm:text-2xl text-brand-neutral-900 leading-snug",
  "section-title": "font-sans font-bold text-lg sm:text-xl text-brand-neutral-900 leading-normal",
  "card-title": "font-sans font-semibold text-base text-brand-neutral-800 leading-snug",
  "metric-value": "font-mono font-extrabold text-2xl sm:text-3xl text-primary-500 tracking-tight tabular-nums",
  "subheading": "font-sans font-medium text-sm text-brand-neutral-500 leading-relaxed",
  "badge-label": "font-sans font-bold text-xs uppercase tracking-wider text-brand-neutral-600",
};

export const Heading: React.FC<HeadingProps> = ({
  as: Component = "h2",
  variant = "section-title",
  className,
  children,
  ...props
}) => {
  return (
    <Component
      className={cn(variantStyles[variant], className)}
      {...props}
    >
      {children}
    </Component>
  );
};
