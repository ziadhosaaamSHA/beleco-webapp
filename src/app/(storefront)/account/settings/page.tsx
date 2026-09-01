"use client";

import React from "react";
import Link from "next/link";
import { Globe, Check, Bell } from "lucide-react";
import { StandardPageLayout } from "@/components/layout/StandardPageLayout";
import { Heading } from "@/components/ui/Heading/Heading";
import { Card } from "@/components/ui/Card/Card";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";

export default function AccountSettingsPage() {
  const { lang, setLanguage, t } = useLanguage();
  const { showToast } = useToast();

  const handleSelectLanguage = (newLang: "ar" | "en") => {
    if (lang === newLang) return;
    setLanguage(newLang);
    showToast(newLang === "ar" ? "تم تغيير لغة التطبيق إلى العربية" : "App language set to English", "success");
  };

  return (
    <StandardPageLayout showBack backHref="/account" title={t("account.settings")}>
      <div className="settings-page flex flex-col gap-4 px-4 pt-2 pb-16 animate-page-enter text-left" dir="ltr">
        {/* Language Selection Card */}
        <div className="flex flex-col gap-2 pt-1">
          <Heading variant="section-title" className="text-xs font-bold text-brand-neutral-500 uppercase tracking-wider px-1">
            {lang === "ar" ? "لغة التطبيق" : "App Language"}
          </Heading>

          <Card className="p-1 flex flex-col bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs divide-y divide-brand-neutral-100">
            <button
              onClick={() => handleSelectLanguage("ar")}
              className="flex items-center justify-between p-3.5 hover:bg-brand-neutral-50 transition-colors rounded-xl text-sm font-sans font-bold text-brand-neutral-900 text-left w-full"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${lang === "ar" ? "bg-primary-50 text-primary-600" : "bg-brand-neutral-100 text-brand-neutral-700"}`}>
                  <Globe className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span>العربية</span>
                  <span className="text-[11px] font-sans font-normal text-brand-neutral-500">Arabic (Egypt & Gulf)</span>
                </div>
              </div>
              {lang === "ar" && (
                <div className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              )}
            </button>

            <button
              onClick={() => handleSelectLanguage("en")}
              className="flex items-center justify-between p-3.5 hover:bg-brand-neutral-50 transition-colors rounded-xl text-sm font-sans font-bold text-brand-neutral-900 text-left w-full"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${lang === "en" ? "bg-primary-50 text-primary-600" : "bg-brand-neutral-100 text-brand-neutral-700"}`}>
                  <Globe className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span>English</span>
                  <span className="text-[11px] font-sans font-normal text-brand-neutral-500">English (Global)</span>
                </div>
              </div>
              {lang === "en" && (
                <div className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              )}
            </button>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-2 pt-1">
          <Heading variant="section-title" className="text-xs font-bold text-brand-neutral-500 uppercase tracking-wider px-1">
            {lang === "ar" ? "التنبيهات والأمان" : "Notifications & Security"}
          </Heading>

          <Card className="p-1 flex flex-col bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs divide-y divide-brand-neutral-100">
            <Link
              href="/notifications"
              className="flex items-center justify-between p-3.5 hover:bg-brand-neutral-50 transition-colors rounded-xl text-sm font-sans font-bold text-brand-neutral-900"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-neutral-100 text-brand-neutral-700 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <span>{lang === "ar" ? "مركز الإشعارات" : "Notification Center"}</span>
              </div>
              <span className="text-xs text-primary-600 font-bold">{lang === "ar" ? "عرض" : "View"}</span>
            </Link>
          </Card>
        </div>
      </div>
    </StandardPageLayout>
  );
}
