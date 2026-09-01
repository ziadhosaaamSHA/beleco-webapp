import React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, suffix, id, placeholder, "aria-label": ariaLabel, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);
    const computedAriaLabel = ariaLabel || label || (typeof placeholder === "string" ? placeholder : undefined);

    return (
      <div className="w-full flex flex-col gap-1 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-sans font-bold text-brand-neutral-700"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-brand-neutral-400">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            placeholder={placeholder}
            aria-label={computedAriaLabel}
            className={cn(
              "w-full h-11 px-3.5 bg-brand-neutral-50/70 border border-brand-neutral-200/90 rounded-xl font-sans text-sm text-brand-neutral-900 placeholder:text-brand-neutral-400 focus:bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all duration-150 disabled:bg-brand-neutral-100 disabled:cursor-not-allowed",
              leftIcon && "pl-10",
              rightIcon && !suffix && "pr-10",
              suffix && "pr-16",
              error && "border-danger-500 focus:border-danger-500 focus:ring-danger-500/20",
              className
            )}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3 flex items-center pointer-events-none text-xs font-mono font-bold text-brand-neutral-600 bg-brand-neutral-200/70 px-2 py-1 rounded-lg select-none">
              {suffix}
            </div>
          )}
          {rightIcon && !suffix && (
            <div className="absolute right-3.5 flex items-center text-brand-neutral-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <span className="text-xs font-sans font-medium text-danger-500">
            {error}
          </span>
        )}
        {helperText && !error && (
          <span className="text-xs font-sans text-brand-neutral-400">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
