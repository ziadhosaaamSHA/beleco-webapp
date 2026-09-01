import React from "react";
import { cn } from "@/lib/utils/cn";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
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
            className={cn(
              "w-full h-11 px-3.5 bg-brand-neutral-50 border border-brand-neutral-200 rounded-xl font-sans text-sm text-brand-neutral-900 placeholder:text-brand-neutral-400 focus:bg-white focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-colors duration-150 disabled:bg-brand-neutral-100 disabled:cursor-not-allowed",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              error && "border-danger-500 focus:border-danger-500 focus:ring-danger-500/20",
              className
            )}
            {...props}
          />
          {rightIcon && (
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
