"use client";

import React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Info,
  Truck,
  FileText,
  RotateCcw,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
} from "lucide-react";
import { StandardPageLayout } from "@/components/layout/StandardPageLayout";
import { Heading } from "@/components/ui/Heading/Heading";
import { Card } from "@/components/ui/Card/Card";
import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { useLanguage } from "@/context/LanguageContext";

type PolicySlug = "about" | "shipping" | "orders" | "returns" | "disclaimer";

interface PolicyConfig {
  titleKey: string;
  bodyKey: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeAr: string;
  badgeEn: string;
}

const POLICY_REGISTRY: Record<PolicySlug, PolicyConfig> = {
  about: {
    titleKey: "policy.about",
    bodyKey: "policy.aboutBody",
    icon: Info,
    badgeAr: "عن المنصة",
    badgeEn: "About Beleco",
  },
  shipping: {
    titleKey: "policy.shipping",
    bodyKey: "policy.shippingBody",
    icon: Truck,
    badgeAr: "الشحن والتوصيل",
    badgeEn: "Shipping & Delivery",
  },
  orders: {
    titleKey: "policy.orders",
    bodyKey: "policy.ordersBody",
    icon: FileText,
    badgeAr: "الطلبات والحجوزات",
    badgeEn: "Orders & Deposits",
  },
  returns: {
    titleKey: "policy.returns",
    bodyKey: "policy.returnsBody",
    icon: RotateCcw,
    badgeAr: "الاستبدال والاسترجاع",
    badgeEn: "Returns & Exchanges",
  },
  disclaimer: {
    titleKey: "policy.disclaimer",
    bodyKey: "policy.disclaimerBody",
    icon: AlertTriangle,
    badgeAr: "إخلاء المسؤولية",
    badgeEn: "Legal Disclaimer",
  },
};

const ALL_SLUGS: PolicySlug[] = ["about", "shipping", "orders", "returns", "disclaimer"];

export default function PolicyDetailPage() {
  const params = useParams();
  const slug = (params?.slug as PolicySlug) || "about";
  const { t, lang, dir, isLangReady } = useLanguage();

  const router = useRouter();

  const BackIcon = dir === "rtl" ? ArrowRight : ArrowLeft;
  const ChevronIcon = dir === "rtl" ? ChevronLeft : ChevronRight;

  const currentPolicy = POLICY_REGISTRY[slug];

  if (!isLangReady) {
    return (
      <StandardPageLayout>
        <div className="p-6 text-center text-xs text-brand-neutral-400">Loading policy...</div>
      </StandardPageLayout>
    );
  }

  if (!currentPolicy) {
    return (
      <StandardPageLayout>
        <div className="p-4 pt-10">
          <EmptyState
            title={lang === "ar" ? "الصفحة غير موجودة" : "Policy Not Found"}
            description={
              lang === "ar"
                ? "عفواً، السياسة المطلوبة غير متوفرة حالياً."
                : "The policy you are looking for does not exist."
            }
            actionText={lang === "ar" ? "العودة للحساب" : "Back to Account"}
            onAction={() => router.push("/account")}
          />
        </div>
      </StandardPageLayout>
    );
  }

  const IconComponent = currentPolicy.icon;
  const otherPolicies = ALL_SLUGS.filter((s) => s !== slug);

  return (
    <StandardPageLayout>
      <div className="policy-detail-page flex flex-col gap-4 px-4 pt-2 pb-16 animate-page-enter text-left" dir="ltr">
        {/* Navigation Top Header */}
        <div className="flex items-center justify-between pt-1">
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-neutral-600 hover:text-primary-600 transition-colors"
          >
            <BackIcon className="w-4 h-4" />
            <span>{lang === "ar" ? "العودة للحساب" : "Back to Account"}</span>
          </Link>
          <Badge variant="primary" size="sm" className="font-sans text-[10px]">
            {lang === "ar" ? currentPolicy.badgeAr : currentPolicy.badgeEn}
          </Badge>
        </div>

        {/* Hero Policy Card */}
        <Card className="p-5 bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 shadow-xs border border-primary-200/60">
              <IconComponent className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <Heading variant="editorial-h1" className="text-lg font-bold text-brand-neutral-950">
                {t(currentPolicy.titleKey)}
              </Heading>
              <span className="text-[11px] font-sans text-brand-neutral-500 font-medium">
                {lang === "ar" ? "سياسات متجر بيليكو الرسمية" : "Official Beleco Store Policy"}
              </span>
            </div>
          </div>

          <div className="h-px bg-brand-neutral-100 w-full" />

          {/* Policy Body */}
          <div className="text-sm font-sans text-brand-neutral-700 leading-relaxed whitespace-pre-line py-1">
            {t(currentPolicy.bodyKey)}
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-brand-neutral-100 text-[11px] text-brand-neutral-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {lang === "ar"
                ? "تضمن بيليكو حماية حقوق العملاء وأمان المعاملات بالكامل."
                : "Beleco guarantees buyer protection & verified secure shopping."}
            </span>
          </div>
        </Card>

        {/* Other Store Policies Section */}
        <div className="flex flex-col gap-2 pt-2">
          <Heading variant="section-title" className="text-xs font-bold text-brand-neutral-500 uppercase tracking-wider px-1">
            {lang === "ar" ? "سياسات أخرى" : "Other Policies"}
          </Heading>

          <Card className="p-1 flex flex-col bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs divide-y divide-brand-neutral-100">
            {otherPolicies.map((otherSlug) => {
              const conf = POLICY_REGISTRY[otherSlug];
              const OtherIcon = conf.icon;

              return (
                <Link
                  key={otherSlug}
                  href={`/account/policies/${otherSlug}`}
                  className="flex items-center justify-between p-3.5 hover:bg-brand-neutral-50 transition-colors rounded-xl text-sm font-sans font-bold text-brand-neutral-900"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-brand-neutral-100 text-brand-neutral-700 flex items-center justify-center">
                      <OtherIcon className="w-4 h-4" />
                    </div>
                    <span>{t(conf.titleKey)}</span>
                  </div>
                  <ChevronIcon className="w-4 h-4 text-brand-neutral-400" />
                </Link>
              );
            })}
          </Card>
        </div>
      </div>
    </StandardPageLayout>
  );
}
