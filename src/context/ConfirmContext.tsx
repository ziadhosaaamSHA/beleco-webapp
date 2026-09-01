"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { Heading } from "@/components/ui/Heading/Heading";
import { useLanguage } from "./LanguageContext";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: (val: boolean) => void;
  } | null>(null);

  const { lang } = useLanguage();

  React.useEffect(() => {
    if (modalState?.isOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [modalState?.isOpen]);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setModalState({
        isOpen: true,
        options,
        resolve,
      });
    });
  }, []);

  const handleClose = (result: boolean) => {
    if (modalState) {
      modalState.resolve(result);
      setModalState(null);
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {modalState?.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pb-24 sm:pb-4 bg-brand-neutral-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-sm bg-white rounded-3xl p-5 border border-brand-neutral-200 shadow-2xl flex flex-col gap-4 animate-modal-pop text-left my-auto"
            dir="ltr"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {modalState.options.isDestructive && (
                  <div className="w-9 h-9 rounded-xl bg-danger-50 flex items-center justify-center text-danger-500 shrink-0">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                )}
                <Heading variant="card-title" className="text-base font-bold text-brand-neutral-950">
                  {modalState.options.title}
                </Heading>
              </div>
              <button
                onClick={() => handleClose(false)}
                className="p-1.5 text-brand-neutral-400 hover:text-brand-neutral-700 rounded-lg hover:bg-brand-neutral-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm font-sans text-brand-neutral-600 leading-relaxed whitespace-pre-line">
              {modalState.options.message}
            </p>

            <div className="flex items-center gap-2.5 pt-2">
              <Button
                variant={modalState.options.isDestructive ? "danger" : "primary"}
                className="flex-1 font-bold"
                onClick={() => handleClose(true)}
              >
                {modalState.options.confirmText || (lang === "ar" ? "تأكيد" : "Confirm")}
              </Button>
              <Button
                variant="secondary"
                className="flex-1 font-bold"
                onClick={() => handleClose(false)}
              >
                {modalState.options.cancelText || (lang === "ar" ? "إلغاء" : "Cancel")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
};
