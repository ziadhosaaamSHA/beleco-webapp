"use client";

import React from "react";
import Link from "next/link";
import { Clock, RotateCcw, Home, WifiOff } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/Button/Button";
import { Card } from "@/components/ui/Card/Card";
import { Heading } from "@/components/ui/Heading/Heading";

export interface LoadingTimeoutStateProps {
  onRetry?: () => void;
  title?: string;
  description?: string;
  className?: string;
  showHomeButton?: boolean;
}

export const LoadingTimeoutState: React.FC<LoadingTimeoutStateProps> = ({
  onRetry,
  title,
  description,
  className = "",
  showHomeButton = true,
}) => {
  const { t, lang } = useLanguage();

  const handleRefresh = () => {
    if (onRetry) {
      onRetry();
    } else if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  const defaultTitle =
    lang === "ar"
      ? "استغرق التحميل وقتاً أطول من المعتاد"
      : "Loading took longer than expected";

  const defaultDescription =
    lang === "ar"
      ? "قد يكون هناك بطء في الاتصال بالإنترنت أو تأخر في استجابة الخادم. اضغطي لتحديث الصفحة."
      : "There might be a slow network connection or server delay. Tap below to refresh the page.";

  return (
    <div
      className={`w-full flex items-center justify-center p-4 min-h-[340px] animate-in fade-in-50 zoom-in-95 duration-200 text-left ${className}`}
      dir="ltr"
    >
      <Card className="max-w-md w-full p-6 flex flex-col items-center text-center gap-4 bg-white/95 backdrop-blur-md border border-brand-neutral-200/90 rounded-3xl shadow-card">
        {/* Animated Icon */}
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center shadow-xs">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-brand-neutral-200 flex items-center justify-center shadow-2xs">
            <WifiOff className="w-3.5 h-3.5 text-brand-neutral-500" />
          </div>
        </div>

        {/* Text Content */}
        <div className="flex flex-col gap-1.5 max-w-[320px]">
          <Heading variant="card-title" className="text-base sm:text-lg font-bold text-brand-neutral-950">
            {title || defaultTitle}
          </Heading>
          <p className="text-xs font-sans text-brand-neutral-600 leading-relaxed">
            {description || defaultDescription}
          </p>
        </div>

        {/* Single Refresh Button */}
        <div className="w-full pt-2">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleRefresh}
            leftIcon={<RotateCcw className="w-4 h-4" />}
            className="w-full font-bold justify-center rounded-xl shadow-xs"
          >
            {lang === "ar" ? "تحديث الصفحة" : "Refresh Page"}
          </Button>
        </div>

        {showHomeButton && (
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-sans font-bold text-brand-neutral-500 hover:text-primary-600 transition-colors pt-1"
          >
            <Home className="w-3.5 h-3.5" />
            <span>{lang === "ar" ? "العودة للرئيسية" : "Return to Home"}</span>
          </Link>
        )}
      </Card>
    </div>
  );
};
