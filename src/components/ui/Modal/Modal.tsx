"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Heading } from "../Heading/Heading";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  children,
  footer,
  className,
  maxWidth = "md",
}) => {
  useEffect(() => {
    if (isOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-brand-neutral-950/60 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "w-full bg-white rounded-3xl border border-brand-neutral-200/90 shadow-2xl flex flex-col overflow-hidden max-h-[82vh] sm:max-h-[85vh] animate-in zoom-in-95 duration-200 my-auto",
          maxWidthClasses[maxWidth],
          className
        )}
      >
        {/* Sticky Top Header */}
        {(title || icon) && (
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-5 py-4 border-b border-brand-neutral-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              {icon && (
                <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                  {icon}
                </div>
              )}
              {title && (
                <Heading variant="card-title" className="text-base font-bold text-brand-neutral-900">
                  {title}
                </Heading>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-brand-neutral-400 hover:text-brand-neutral-700 hover:bg-brand-neutral-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 flex flex-col gap-3.5">
          {children}
        </div>

        {/* Sticky Bottom Footer */}
        {footer && (
          <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md px-5 py-3.5 border-t border-brand-neutral-100 flex items-center shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
