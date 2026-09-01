"use client";

import React, { useState } from "react";
import { TopHeaderBar } from "./TopHeaderBar";
import { SideDrawer } from "./SideDrawer";
import { cn } from "@/lib/utils/cn";

export interface StandardPageLayoutProps {
  showHeader?: boolean;
  title?: string;
  showBack?: boolean;
  backHref?: string;
  onBack?: () => void;
  children: React.ReactNode;
  className?: string;
  onRefresh?: () => Promise<void>;
  scrollLocked?: boolean;
  enableNavOffset?: boolean;
}

export const StandardPageLayout: React.FC<StandardPageLayoutProps> = ({
  showHeader = true,
  title,
  showBack,
  backHref,
  onBack,
  children,
  className,
  onRefresh,
  scrollLocked = false,
  enableNavOffset = true,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [pullOffset, setPullOffset] = useState<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!onRefresh || isRefreshing) return;
    const scrollContainer = e.currentTarget;
    if (scrollContainer.scrollTop === 0) {
      setTouchStart(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null || !onRefresh || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStart;
    if (diff > 0) {
      setPullOffset(Math.min(diff * 0.45, 65));
    }
  };

  const handleTouchEnd = async () => {
    if (touchStart === null || !onRefresh) return;
    if (pullOffset > 45 && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullOffset(0);
        setTouchStart(null);
      }
    } else {
      setPullOffset(0);
      setTouchStart(null);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-brand-neutral-50 overflow-hidden relative" dir="ltr">
      {showHeader && (
        <TopHeaderBar
          title={title}
          showBack={showBack}
          backHref={backHref}
          onBack={onBack}
          onOpenMenu={() => setIsDrawerOpen(true)}
        />
      )}

      <SideDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />

      {/* Pull to refresh indicator */}
      {pullOffset > 0 && (
        <div
          className="w-full flex items-center justify-center transition-transform pointer-events-none"
          style={{ height: `${pullOffset}px` }}
        >
          <div className="w-7 h-7 rounded-full bg-white border border-brand-neutral-200 shadow-md flex items-center justify-center text-primary-500">
            <svg
              className={cn("w-4 h-4", isRefreshing && "animate-spin")}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Main scrollable body with page transition animation */}
      <main
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={cn(
          "flex-1 scroll-smooth animate-page-enter",
          (scrollLocked || isDrawerOpen)
            ? "overflow-hidden"
            : "overflow-y-auto overflow-x-hidden",
          className
        )}
        style={{
          paddingBottom: enableNavOffset
            ? "calc(88px + env(safe-area-inset-bottom, 0px))"
            : "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {children}
      </main>
    </div>
  );
};
