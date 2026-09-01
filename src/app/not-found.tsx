"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Home, Search } from "lucide-react";
import { Heading } from "@/components/ui/Heading/Heading";
import { Button } from "@/components/ui/Button/Button";
import { useLanguage } from "@/context/LanguageContext";

export default function NotFoundPage() {
  const { lang } = useLanguage();

  return (
    <div className="min-h-screen w-full bg-brand-neutral-50 flex flex-col items-center justify-center p-6 text-left" dir="ltr">
      <div className="w-full max-w-sm flex flex-col items-center text-center gap-4 animate-page-enter">
        {/* Error Code Tag */}
        <div className="px-3.5 py-1 rounded-full bg-primary-50 border border-primary-200/80 text-primary-600 font-mono font-extrabold text-xs">
          ERROR 404
        </div>

        {/* Heading */}
        <Heading variant="editorial-h1" className="text-2xl sm:text-3xl text-brand-neutral-950 font-bold">
          {lang === "ar" ? "الصفحة غير موجودة" : "Page Not Found"}
        </Heading>

        <p className="text-xs sm:text-sm font-sans text-brand-neutral-600 leading-relaxed max-w-xs">
          {lang === "ar"
            ? "الصفحة التي تبحثين عنها قد تكون نُقلت أو حُذفت، أو أن الرابط غير صحيح."
            : "The page you are looking for might have been removed, had its name changed, or is temporarily unavailable."}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col w-full gap-2.5 pt-3">
          <Link href="/" className="w-full">
            <Button
              variant="primary"
              size="lg"
              className="w-full justify-center shadow-md text-sm font-bold"
              leftIcon={<Home className="w-4 h-4" />}
            >
              {lang === "ar" ? "العودة للرئيسية" : "Back to Home"}
            </Button>
          </Link>

          <Link href="/" className="w-full">
            <Button
              variant="secondary"
              size="lg"
              className="w-full justify-center text-sm font-bold"
              leftIcon={<Search className="w-4 h-4" />}
            >
              {lang === "ar" ? "تصفح المنتجات" : "Browse Collections"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
