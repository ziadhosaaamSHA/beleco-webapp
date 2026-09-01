"use client";

import React from "react";
import { Info, Heart, Sparkles } from "lucide-react";
import { StandardPageLayout } from "@/components/layout/StandardPageLayout";
import { Heading } from "@/components/ui/Heading/Heading";
import { Card } from "@/components/ui/Card/Card";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutPage() {
  const { t, lang } = useLanguage();

  return (
    <StandardPageLayout showBack backHref="/account" title={t("policy.about")}>
      <div className="about-page flex flex-col gap-4 px-4 pt-2 pb-16 animate-page-enter text-left" dir="ltr">
        {/* Hero Card */}
        <Card className="p-5 bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 border border-primary-200/60 shadow-xs">
              <Info className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <Heading variant="editorial-h1" className="text-lg font-bold text-brand-neutral-950">
                {t("policy.about")}
              </Heading>
              <span className="text-xs font-sans text-brand-neutral-500 font-medium">
                {lang === "ar" ? "منصة تسوق وشحن عالمية فاخرة" : "Luxury Global Shopping & Concierge"}
              </span>
            </div>
          </div>

          <div className="h-px bg-brand-neutral-100 w-full" />

          <div className="text-sm font-sans text-brand-neutral-700 leading-relaxed whitespace-pre-line py-1">
            {t("policy.aboutBody")}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-brand-neutral-100">
            <div className="p-3 bg-brand-neutral-50 rounded-xl flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-primary-600">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold font-sans">{lang === "ar" ? "جودة مضمونة" : "Top Quality"}</span>
              </div>
              <span className="text-[11px] text-brand-neutral-500 font-sans">
                {lang === "ar" ? "فحص دقيق قبل الشحن" : "Inspected before dispatch"}
              </span>
            </div>

            <div className="p-3 bg-brand-neutral-50 rounded-xl flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-primary-600">
                <Heart className="w-4 h-4" />
                <span className="text-xs font-bold font-sans">{lang === "ar" ? "خدمة متميزة" : "VIP Support"}</span>
              </div>
              <span className="text-[11px] text-brand-neutral-500 font-sans">
                {lang === "ar" ? "فريق دعم متاح لمساعدتك" : "Dedicated customer care"}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </StandardPageLayout>
  );
}
