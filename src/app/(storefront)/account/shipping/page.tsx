"use client";

import React from "react";
import { Truck, Clock, MapPin } from "lucide-react";
import { StandardPageLayout } from "@/components/layout/StandardPageLayout";
import { Heading } from "@/components/ui/Heading/Heading";
import { Card } from "@/components/ui/Card/Card";
import { useLanguage } from "@/context/LanguageContext";

export default function ShippingPolicyPage() {
  const { t, lang } = useLanguage();

  return (
    <StandardPageLayout showBack backHref="/account" title={t("policy.shipping")}>
      <div className="shipping-page flex flex-col gap-4 px-4 pt-2 pb-16 animate-page-enter text-left" dir="ltr">
        {/* Hero Card */}
        <Card className="p-5 bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 border border-primary-200/60 shadow-xs">
              <Truck className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <Heading variant="editorial-h1" className="text-lg font-bold text-brand-neutral-950">
                {t("policy.shipping")}
              </Heading>
              <span className="text-xs font-sans text-brand-neutral-500 font-medium">
                {lang === "ar" ? "توصيل سريع وتغطية شاملة لجميع المحافظات" : "Fast & secure door-to-door delivery"}
              </span>
            </div>
          </div>

          <div className="h-px bg-brand-neutral-100 w-full" />

          <div className="text-sm font-sans text-brand-neutral-700 leading-relaxed whitespace-pre-line py-1">
            {t("policy.shippingBody")}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-brand-neutral-100">
            <div className="p-3 bg-brand-neutral-50 rounded-xl flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-primary-600">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-bold font-sans">{lang === "ar" ? "مدة الشحن" : "Timeline"}</span>
              </div>
              <span className="text-[11px] text-brand-neutral-500 font-sans">
                {lang === "ar" ? "10 إلى 17 يوم عمل" : "10-17 business days"}
              </span>
            </div>

            <div className="p-3 bg-brand-neutral-50 rounded-xl flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-primary-600">
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-bold font-sans">{lang === "ar" ? "تتبع مباشر" : "Live Tracking"}</span>
              </div>
              <span className="text-[11px] text-brand-neutral-500 font-sans">
                {lang === "ar" ? "متابعة لحظية للشحنة" : "Track status step-by-step"}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </StandardPageLayout>
  );
}
