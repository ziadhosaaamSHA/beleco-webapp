import React from "react";
import { cn } from "@/lib/utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex p-4 my-2 items-center justify-center font-sans font-bold select-none cursor-pointer transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40";

    const variantStyles = {
      primary:
        "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-sm border border-transparent",
      secondary:
        "bg-brand-neutral-100 text-brand-neutral-900 hover:bg-brand-neutral-200 active:bg-brand-neutral-300 border border-brand-neutral-200",
      ghost:
        "bg-transparent text-brand-neutral-800 hover:bg-brand-neutral-100 active:bg-brand-neutral-200",
      danger:
        "bg-danger-500 text-white hover:bg-danger-600 active:bg-danger-700 shadow-sm",
      outline:
        "bg-transparent text-primary-600 border border-primary-500 hover:bg-primary-50 active:bg-primary-100",
    };

    const sizeStyles = {
      sm: "h-9 px-4 text-xs rounded-xl gap-2",
      md: "h-11 px-5 text-sm rounded-xl gap-2.5",
      lg: "h-13 px-7 text-base rounded-2xl gap-3",
      icon: "h-10 w-10 p-0 rounded-xl",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
