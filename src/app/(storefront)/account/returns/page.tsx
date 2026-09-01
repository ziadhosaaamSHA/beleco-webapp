"use client";

import React from "react";
import { RotateCcw, CheckCircle2 } from "lucide-react";
import { StandardPageLayout } from "@/components/layout/StandardPageLayout";
import { Heading } from "@/components/ui/Heading/Heading";
import { Card } from "@/components/ui/Card/Card";
import { useLanguage } from "@/context/LanguageContext";

export default function ReturnsPolicyPage() {
  const { t, lang } = useLanguage();

  return (
    <StandardPageLayout showBack backHref="/account" title={t("policy.returns")}>
      <div className="returns-page flex flex-col gap-4 px-4 pt-2 pb-16 animate-page-enter text-left" dir="ltr">
        {/* Hero Card */}
        <Card className="p-5 bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 border border-primary-200/60 shadow-xs">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <Heading variant="editorial-h1" className="text-lg font-bold text-brand-neutral-950">
                {t("policy.returns")}
              </Heading>
              <span className="text-xs font-sans text-brand-neutral-500 font-medium">
                {lang === "ar" ? "سياسة المعاينة والاستبدال المرنة" : "Hassle-free inspection & returns guarantee"}
              </span>
            </div>
          </div>

          <div className="h-px bg-brand-neutral-100 w-full" />

          <div className="text-sm font-sans text-brand-neutral-700 leading-relaxed whitespace-pre-line py-1">
            {t("policy.returnsBody")}
          </div>

          <div className="p-3 bg-brand-neutral-50 rounded-xl flex items-center gap-2.5 text-xs font-sans font-medium text-brand-neutral-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {lang === "ar"
                ? "إمكانية المعاينة والتأكد من المقاس والخامة عند الاستلام مباشرة."
                : "Inspection on delivery is supported for complete peace of mind."}
            </span>
          </div>
        </Card>
      </div>
    </StandardPageLayout>
  );
}
