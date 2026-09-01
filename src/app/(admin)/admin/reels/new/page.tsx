"use client";

import React from "react";
import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { StandardPageLayout } from "@/components/layout/StandardPageLayout";
import { Heading } from "@/components/ui/Heading/Heading";
import { Button } from "@/components/ui/Button/Button";
import { AdminPageSkeleton } from "@/components/ui/Skeleton/Skeleton";
import { UploadReelForm } from "@/components/admin/reels/forms/UploadReelForm";

export default function UploadNewReelPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const { t, lang } = useLanguage();

  if (authLoading) {
    return (
      <StandardPageLayout>
        <AdminPageSkeleton />
      </StandardPageLayout>
    );
  }

  if (!isAdmin) {
    return (
      <StandardPageLayout>
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-danger-50 text-danger-500 flex items-center justify-center shadow-xs">
            <Shield className="w-8 h-8" />
          </div>
          <Heading variant="editorial-h1" className="text-xl">
            {t("admin.restricted")}
          </Heading>
          <p className="text-xs font-sans text-brand-neutral-500 max-w-[280px] leading-relaxed">
            {t("admin.restrictedSub")}
          </p>
          <Link href="/">
            <Button variant="primary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              {t("admin.backToStore")}
            </Button>
          </Link>
        </div>
      </StandardPageLayout>
    );
  }

  return (
    <StandardPageLayout
      title={lang === "ar" ? "نشر فيديو ريل جديد" : "Upload New Reel"}
      backHref="/admin/reels"
      enableNavOffset={false}
    >
      <div className="flex flex-col gap-4 px-4 pt-1 text-left" dir="ltr">
        <UploadReelForm />
      </div>
    </StandardPageLayout>
  );
}
