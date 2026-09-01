"use client";

import React from "react";
import { FileText, ShieldCheck } from "lucide-react";
import { StandardPageLayout } from "@/components/layout/StandardPageLayout";
import { Heading } from "@/components/ui/Heading/Heading";
import { Card } from "@/components/ui/Card/Card";
import { useLanguage } from "@/context/LanguageContext";

export default function OrdersPolicyPage() {
  const { t, lang } = useLanguage();

  return (
    <StandardPageLayout showBack backHref="/account" title={t("policy.orders")}>
      <div className="orders-policy-page flex flex-col gap-4 px-4 pt-2 pb-16 animate-page-enter text-left" dir="ltr">
        {/* Hero Card */}
        <Card className="p-5 bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 border border-primary-200/60 shadow-xs">
              <FileText className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <Heading variant="editorial-h1" className="text-lg font-bold text-brand-neutral-950">
                {t("policy.orders")}
              </Heading>
              <span className="text-xs font-sans text-brand-neutral-500 font-medium">
                {lang === "ar" ? "ضوابط وتأكيد الطلبات في بيليكو" : "Beleco order processing guidelines"}
              </span>
            </div>
          </div>

          <div className="h-px bg-brand-neutral-100 w-full" />

          <div className="text-sm font-sans text-brand-neutral-700 leading-relaxed whitespace-pre-line py-1">
            {t("policy.ordersBody")}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-brand-neutral-100 text-[11px] text-brand-neutral-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {lang === "ar"
                ? "تأكيد فوري وتحديثات دورية على حالة الطلب عبر الإشعارات."
                : "Real-time order confirmation & automated status updates."}
            </span>
          </div>
        </Card>
      </div>
    </StandardPageLayout>
  );
}
