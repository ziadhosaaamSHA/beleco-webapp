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
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  children,
  className,
  maxWidth = "md",
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-brand-neutral-950/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "w-full bg-white rounded-t-[28px] sm:rounded-3xl p-6 border border-brand-neutral-200 shadow-2xl flex flex-col gap-4 animate-sheet-up max-h-[90vh] overflow-y-auto",
          maxWidthClasses[maxWidth],
          className
        )}
        style={{ paddingBottom: "calc(24px + env(safe-area-inset-bottom, 0px))" }}
      >
        {/* Header */}
        {(title || icon) && (
          <div className="flex items-center justify-between border-b border-brand-neutral-100 pb-3">
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

        {/* Modal Body */}
        <div className="flex flex-col gap-3">{children}</div>
      </div>
    </div>
  );
};
