"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Shield,
  MapPin,
  LogOut,
  Sparkles,
} from "lucide-react";
import { StandardPageLayout } from "@/components/layout/StandardPageLayout";
import { Heading } from "@/components/ui/Heading/Heading";
import { Card } from "@/components/ui/Card/Card";
import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { AccountPageSkeleton } from "@/components/ui/Skeleton/Skeleton";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { useConfirm } from "@/context/ConfirmContext";

export default function AccountProfilePage() {
  const { user, isAdmin, loading: authLoading, logout } = useAuth();
  const { t, lang, isLangReady } = useLanguage();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const router = useRouter();

  const handleLogout = async () => {
    const isConfirmed = await confirm({
      title: lang === "ar" ? "تسجيل الخروج" : "Log Out",
      message:
        lang === "ar"
          ? "هل ترغبين بالتأكيد في تسجيل الخروج من حسابك؟"
          : "Are you sure you want to log out of your account?",
      confirmText: lang === "ar" ? "تسجيل الخروج" : "Log Out",
      cancelText: lang === "ar" ? "إلغاء" : "Cancel",
      isDestructive: true,
    });

    if (!isConfirmed) return;

    try {
      await logout();
      showToast(lang === "ar" ? "تم تسجيل الخروج بنجاح" : "Logged out successfully", "success");
      router.push("/");
    } catch {
      showToast(lang === "ar" ? "حدث خطأ أثناء تسجيل الخروج" : "Error logging out", "error");
    }
  };

  if (!isLangReady || authLoading) {
    return (
      <StandardPageLayout showBack backHref="/account">
        <AccountPageSkeleton />
      </StandardPageLayout>
    );
  }

  return (
    <StandardPageLayout showBack backHref="/account" title={t("account.personalInfo")}>
      <div className="account-profile-page flex flex-col gap-4 px-4 pt-2 pb-16 animate-page-enter text-left" dir="ltr">
        {/* Profile Card */}
        <Card className="p-5 flex flex-col items-center text-center bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs relative overflow-hidden">
          <div className="w-16 h-16 rounded-full bg-brand-neutral-100 border-2 border-brand-neutral-200 flex items-center justify-center text-primary-500 mb-3 shadow-xs">
            <User className="w-8 h-8 stroke-[1.8]" />
          </div>

          <Heading variant="editorial-h1" className="text-lg font-bold text-brand-neutral-950">
            {user?.displayName || (lang === "ar" ? "عميلة مميزة" : "Valued Customer")}
          </Heading>

          <span className="text-xs font-mono text-brand-neutral-500 font-medium mt-0.5">
            {user?.email || (lang === "ar" ? "تسجيل كزائرة" : "Guest Mode")}
          </span>

          <div className="flex items-center gap-1.5 mt-3 bg-primary-50 border border-primary-200/80 px-3 py-1 rounded-full text-xs font-sans font-bold text-primary-700">
            <Sparkles className="w-3.5 h-3.5 text-primary-500" />
            <span>{lang === "ar" ? "عضوية بيليكو المميزة" : "Beleco VIP Member"}</span>
          </div>
        </Card>

        {/* Personal Details Information */}
        <div className="flex flex-col gap-2 pt-1">
          <Heading variant="section-title" className="text-xs font-bold text-brand-neutral-500 uppercase tracking-wider px-1">
            {lang === "ar" ? "تفاصيل الحساب" : "Account Details"}
          </Heading>

          <Card className="p-1 flex flex-col bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs divide-y divide-brand-neutral-100">
            <div className="flex items-center justify-between p-3.5 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-neutral-100 text-brand-neutral-700 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span className="font-bold text-brand-neutral-900">{lang === "ar" ? "الاسم" : "Full Name"}</span>
              </div>
              <span className="font-sans text-xs text-brand-neutral-600 font-medium">
                {user?.displayName || "—"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-neutral-100 text-brand-neutral-700 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="font-bold text-brand-neutral-900">{lang === "ar" ? "البريد الإلكتروني" : "Email"}</span>
              </div>
              <span className="font-mono text-xs text-brand-neutral-600">
                {user?.email || "—"}
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-neutral-100 text-brand-neutral-700 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="font-bold text-brand-neutral-900">{lang === "ar" ? "نوع الحساب" : "Account Role"}</span>
              </div>
              <Badge variant={isAdmin ? "primary" : "neutral"} size="sm" className="font-mono">
                {isAdmin ? "Admin" : "Customer"}
              </Badge>
            </div>

            <Link
              href="/account/address"
              className="flex items-center justify-between p-3.5 hover:bg-brand-neutral-50 transition-colors text-sm rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="font-bold text-brand-neutral-900">{lang === "ar" ? "عناوين التوصيل المسجلة" : "Delivery Addresses"}</span>
              </div>
              <span className="text-xs font-bold text-primary-600 hover:underline">
                {lang === "ar" ? "إدارة العناوين" : "Manage"}
              </span>
            </Link>
          </Card>
        </div>

        {/* Action Button */}
        {user ? (
          <div className="pt-3">
            <Button
              variant="secondary"
              size="md"
              onClick={handleLogout}
              leftIcon={<LogOut className="w-4 h-4 text-danger-600" />}
              className="w-full text-danger-600 font-bold border-danger-200 hover:bg-danger-50 rounded-2xl"
            >
              {t("account.logout")}
            </Button>
          </div>
        ) : (
          <div className="pt-3">
            <Link href="/login" className="w-full block">
              <Button variant="primary" size="md" className="w-full rounded-2xl font-bold">
                {lang === "ar" ? "تسجيل الدخول" : "Log In"}
              </Button>
            </Link>
          </div>
        )}
      </div>
    </StandardPageLayout>
  );
}
