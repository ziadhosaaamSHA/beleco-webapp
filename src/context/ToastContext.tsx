"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
        {toasts.map((toast) => {
          const typeStyles = {
            success: "bg-brand-neutral-900 text-white border-brand-neutral-800",
            error: "bg-danger-500 text-white border-danger-700",
            info: "bg-brand-neutral-800 text-white border-brand-neutral-700",
          };

          return (
            <div
              key={toast.id}
              className={cn(
                "pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-sans font-medium transition-all duration-200 animate-in fade-in slide-in-from-top-4",
                typeStyles[toast.type]
              )}
              dir="rtl"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {toast.type === "success" && <CheckCircle2 className="w-5 h-5 text-success-500 shrink-0" />}
                {toast.type === "error" && <AlertCircle className="w-5 h-5 text-white shrink-0" />}
                {toast.type === "info" && <Info className="w-5 h-5 text-primary-400 shrink-0" />}
                <span className="truncate">{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors text-white/80 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
