import React from "react";
import { cn } from "@/lib/utils/cn";

export interface AppShellProps {
  children: React.ReactNode;
  className?: string;
}

export const AppShell: React.FC<AppShellProps> = ({ children, className }) => {
  return (
    <div className="min-h-screen w-full bg-brand-neutral-100 flex items-center justify-center sm:py-6 selection:bg-primary-100 selection:text-primary-900">
      <div
        className={cn(
          "w-full sm:max-w-[440px] bg-brand-neutral-50 h-screen sm:h-[880px] sm:max-h-[94vh] sm:rounded-[36px] sm:border sm:border-brand-neutral-200 sm:shadow-2xl flex flex-col relative overflow-hidden",
          className
        )}
        style={{
          height: "calc(100dvh + env(safe-area-inset-bottom, 0px))",
          minHeight: "-webkit-fill-available",
        }}
      >
        {children}
      </div>
    </div>
  );
};
