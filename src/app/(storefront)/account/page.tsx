"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  ShoppingBag,
  MapPin,
  Truck,
  HelpCircle,
  Globe,
  Shield,
  LogOut,
  LogIn,
  ChevronRight,
  ChevronLeft,
  Bell,
  Calculator,
  FileText,
  Info,
  RotateCcw,
  AlertTriangle,
} from "lucide-react";
import { StandardPageLayout } from "@/components/layout/StandardPageLayout";
import { Heading } from "@/components/ui/Heading/Heading";
import { Card } from "@/components/ui/Card/Card";
import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { Modal } from "@/components/ui/Modal/Modal";
import { AccountPageSkeleton } from "@/components/ui/Skeleton/Skeleton";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import { useToast } from "@/context/ToastContext";
import { useConfirm } from "@/context/ConfirmContext";
import { ordersService } from "@/services/orders.service";
import type { Order } from "@/types/order.types";

type PolicyKey = "about" | "shipping" | "orders" | "returns" | "disclaimer" | null;

export default function AccountPage() {
  const { user, isAdmin, loading: authLoading, logout } = useAuth();
  const { t, lang, toggleLanguage, dir, isLangReady } = useLanguage();
  const { countryInfo, openModal: openLocationModal } = useLocation();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [addressCount, setAddressCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [activePolicy, setActivePolicy] = useState<PolicyKey>(null);

  useEffect(() => {
    // Load customer orders count in real-time
    const unsub = ordersService.subscribeCustomerOrders(user?.uid, (items) => {
      setOrders(items);
      setLoading(false);
    });

    // Load saved addresses count
    try {
      const saved = localStorage.getItem("beleco_saved_addresses");
      if (saved) {
        const parsed = JSON.parse(saved);
        setAddressCount(Array.isArray(parsed) ? parsed.length : 0);
      }
    } catch {}

    return () => unsub();
  }, [user]);

  const handleRefresh = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    showToast(lang === "ar" ? "تم تحديث بيانات الحساب" : "Account data refreshed", "success");
  };

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

  const ChevronIcon = dir === "rtl" ? ChevronLeft : ChevronRight;

  if (!isLangReady || authLoading || loading) {
    return (
      <StandardPageLayout>
        <AccountPageSkeleton />
      </StandardPageLayout>
    );
  }

  return (
    <StandardPageLayout onRefresh={handleRefresh}>
      <div className="account-page flex flex-col gap-4 px-4 pt-2 pb-16 animate-page-enter text-left" dir="ltr">
        {/* User Profile Hero Card */}
        <Card className="p-4 flex items-center justify-between bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-brand-neutral-100 border border-brand-neutral-200 flex items-center justify-center text-primary-500 shrink-0">
              <User className="w-6 h-6 stroke-[1.8]" />
            </div>
            <div className="flex flex-col">
              <Heading variant="editorial-h1" className="text-base font-bold text-brand-neutral-950">
                {user?.displayName || t("account.guest")}
              </Heading>
              <span className="text-xs font-sans text-brand-neutral-500 font-medium">
                {user?.email || (lang === "ar" ? "عميلة مميزة في بيليكو" : "Valued Beleco Customer")}
              </span>
            </div>
          </div>

          {user ? (
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-brand-neutral-500 hover:text-danger-600 hover:bg-danger-50 active:scale-95 transition-all"
              title={t("account.logout")}
            >
              <LogOut className="w-5 h-5" />
            </button>
          ) : (
            <Link href="/login">
              <Button variant="secondary" size="sm" leftIcon={<LogIn className="w-3.5 h-3.5" />}>
                {lang === "ar" ? "دخول" : "Login"}
              </Button>
            </Link>
          )}
        </Card>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          <Link href="/orders">
            <Card className="p-3 flex flex-col items-center justify-center text-center bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs hover:border-primary-500 transition-colors">
              <ShoppingBag className="w-4.5 h-4.5 text-primary-500 mb-1" />
              <span className="font-mono font-extrabold text-sm text-brand-neutral-950">
                {orders.length}
              </span>
              <span className="text-[10px] font-sans text-brand-neutral-500 mt-0.5">
                {t("account.myOrders")}
              </span>
            </Card>
          </Link>

          <Link href="/account/address">
            <Card className="p-3 flex flex-col items-center justify-center text-center bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs hover:border-primary-500 transition-colors">
              <MapPin className="w-4.5 h-4.5 text-primary-500 mb-1" />
              <span className="font-mono font-extrabold text-sm text-brand-neutral-950">
                {addressCount}
              </span>
              <span className="text-[10px] font-sans text-brand-neutral-500 mt-0.5">
                {t("account.address")}
              </span>
            </Card>
          </Link>

          <button onClick={openLocationModal} className="w-full text-left">
            <Card className="p-3 flex flex-col items-center justify-center text-center bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs hover:border-primary-500 transition-colors">
              <div className="w-5.5 h-4 rounded overflow-hidden border border-brand-neutral-200 shadow-2xs mb-1 flex items-center justify-center">
                {countryInfo.flag && <countryInfo.flag className="w-full h-full object-cover" />}
              </div>
              <span className="font-mono font-extrabold text-xs text-brand-neutral-950">
                {countryInfo.currencySymbol}
              </span>
              <span className="text-[10px] font-sans text-brand-neutral-500 mt-0.5 truncate max-w-full">
                {t(countryInfo.nameKey)}
              </span>
            </Card>
          </button>
        </div>

        {/* LEGACY APP GROUP 1: PERSONAL & ORDERS NAVIGATION (Listed directly as rows) */}
        <div className="flex flex-col gap-2 pt-1">
          <Heading variant="section-title" className="text-xs font-bold text-brand-neutral-500 uppercase tracking-wider px-1">
            {lang === "ar" ? "بيانات الحساب والطلبات" : "Account & Orders"}
          </Heading>

          <Card className="p-1 flex flex-col bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs divide-y divide-brand-neutral-100">
            <Link
              href="/account/address"
              className="flex items-center justify-between p-3.5 hover:bg-brand-neutral-50 transition-colors rounded-xl text-sm font-sans font-bold text-brand-neutral-900"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span>{t("account.personalInfo")}</span>
              </div>
              <ChevronIcon className="w-4 h-4 text-brand-neutral-400" />
            </Link>

            <Link
              href="/account/address"
              className="flex items-center justify-between p-3.5 hover:bg-brand-neutral-50 transition-colors rounded-xl text-sm font-sans font-bold text-brand-neutral-900"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>{t("account.address")}</span>
              </div>
              <ChevronIcon className="w-4 h-4 text-brand-neutral-400" />
            </Link>

            <Link
              href="/orders"
              className="flex items-center justify-between p-3.5 hover:bg-brand-neutral-50 transition-colors rounded-xl text-sm font-sans font-bold text-brand-neutral-900"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <span>{t("account.myOrders")}</span>
              </div>
              <div className="flex items-center gap-2 text-brand-neutral-400">
                {orders.length > 0 && (
                  <span className="font-mono text-xs font-bold bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full">
                    {orders.length}
                  </span>
                )}
                <ChevronIcon className="w-4 h-4" />
              </div>
            </Link>

            <Link
              href="/account/tracking"
              className="flex items-center justify-between p-3.5 hover:bg-brand-neutral-50 transition-colors rounded-xl text-sm font-sans font-bold text-brand-neutral-900"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <span>{t("account.tracking")}</span>
              </div>
              <ChevronIcon className="w-4 h-4 text-brand-neutral-400" />
            </Link>

            <Link
              href="/notifications"
              className="flex items-center justify-between p-3.5 hover:bg-brand-neutral-50 transition-colors rounded-xl text-sm font-sans font-bold text-brand-neutral-900"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <span>{t("notif.title")}</span>
              </div>
              <ChevronIcon className="w-4 h-4 text-brand-neutral-400" />
            </Link>

            <Link
              href="/calculator"
              className="flex items-center justify-between p-3.5 hover:bg-brand-neutral-50 transition-colors rounded-xl text-sm font-sans font-bold text-brand-neutral-900"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                  <Calculator className="w-4 h-4" />
                </div>
                <span>{t("calc.title")}</span>
              </div>
              <ChevronIcon className="w-4 h-4 text-brand-neutral-400" />
            </Link>
          </Card>
        </div>

        {/* LEGACY APP GROUP 2: PREFERENCES & SETTINGS */}
        <div className="flex flex-col gap-2 pt-1">
          <Heading variant="section-title" className="text-xs font-bold text-brand-neutral-500 uppercase tracking-wider px-1">
            {lang === "ar" ? "الإعدادات واللغة" : "Settings & Language"}
          </Heading>

          <Card className="p-1 flex flex-col bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs divide-y divide-brand-neutral-100">
            <button
              onClick={toggleLanguage}
              className="flex items-center justify-between p-3.5 hover:bg-brand-neutral-50 transition-colors rounded-xl text-sm font-sans font-bold text-brand-neutral-900 text-left w-full"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-neutral-100 text-brand-neutral-700 flex items-center justify-center">
                  <Globe className="w-4 h-4" />
                </div>
                <span>{t("account.settings")}</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs text-primary-600 font-bold bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-200">
                <span>{lang === "ar" ? "العربية (AR)" : "English (EN)"}</span>
              </div>
            </button>

            <button
              onClick={openLocationModal}
              className="flex items-center justify-between p-3.5 hover:bg-brand-neutral-50 transition-colors rounded-xl text-sm font-sans font-bold text-brand-neutral-900 text-left w-full"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-neutral-100 text-brand-neutral-700 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <span>{t("location.select")}</span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs text-brand-neutral-600">
                <span>{t(countryInfo.nameKey)}</span>
                <ChevronIcon className="w-4 h-4 text-brand-neutral-400" />
              </div>
            </button>

            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center justify-between p-3.5 hover:bg-brand-neutral-50 transition-colors rounded-xl text-sm font-sans font-bold text-brand-neutral-900"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-brand-neutral-950 text-primary-400 flex items-center justify-center shadow-xs">
                    <Shield className="w-4 h-4" />
                  </div>
                  <span>{t("admin.title")}</span>
                </div>
                <Badge variant="neutral" size="sm" className="font-mono">
                  Admin
                </Badge>
              </Link>
            )}
          </Card>
        </div>

        {/* LEGACY APP GROUP 3: CONTACT & BRAND POLICIES */}
        <div className="flex flex-col gap-2 pt-1">
          <Heading variant="section-title" className="text-xs font-bold text-brand-neutral-500 uppercase tracking-wider px-1">
            {lang === "ar" ? "المساعدة وسياسات المتجر" : "Help & Policies"}
          </Heading>

          <Card className="p-1 flex flex-col bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs divide-y divide-brand-neutral-100">
            <Link
              href="/account/help"
              className="flex items-center justify-between p-3.5 hover:bg-brand-neutral-50 transition-colors rounded-xl text-sm font-sans font-bold text-brand-neutral-900"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <span>{t("account.help")}</span>
              </div>
              <ChevronIcon className="w-4 h-4 text-brand-neutral-400" />
            </Link>

            <button
              onClick={() => setActivePolicy("about")}
              className="flex items-center justify-between p-3.5 hover:bg-brand-neutral-50 transition-colors rounded-xl text-sm font-sans font-bold text-brand-neutral-900 text-left w-full"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-neutral-100 text-brand-neutral-700 flex items-center justify-center">
                  <Info className="w-4 h-4" />
                </div>
                <span>{t("policy.about")}</span>
              </div>
              <ChevronIcon className="w-4 h-4 text-brand-neutral-400" />
            </button>

            <button
              onClick={() => setActivePolicy("shipping")}
              className="flex items-center justify-between p-3.5 hover:bg-brand-neutral-50 transition-colors rounded-xl text-sm font-sans font-bold text-brand-neutral-900 text-left w-full"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-neutral-100 text-brand-neutral-700 flex items-center justify-center">
                  <Truck className="w-4 h-4" />
                </div>
                <span>{t("policy.shipping")}</span>
              </div>
              <ChevronIcon className="w-4 h-4 text-brand-neutral-400" />
            </button>

            <button
              onClick={() => setActivePolicy("orders")}
              className="flex items-center justify-between p-3.5 hover:bg-brand-neutral-50 transition-colors rounded-xl text-sm font-sans font-bold text-brand-neutral-900 text-left w-full"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-neutral-100 text-brand-neutral-700 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <span>{t("policy.orders")}</span>
              </div>
              <ChevronIcon className="w-4 h-4 text-brand-neutral-400" />
            </button>

            <button
              onClick={() => setActivePolicy("returns")}
              className="flex items-center justify-between p-3.5 hover:bg-brand-neutral-50 transition-colors rounded-xl text-sm font-sans font-bold text-brand-neutral-900 text-left w-full"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-neutral-100 text-brand-neutral-700 flex items-center justify-center">
                  <RotateCcw className="w-4 h-4" />
                </div>
                <span>{t("policy.returns")}</span>
              </div>
              <ChevronIcon className="w-4 h-4 text-brand-neutral-400" />
            </button>

            <button
              onClick={() => setActivePolicy("disclaimer")}
              className="flex items-center justify-between p-3.5 hover:bg-brand-neutral-50 transition-colors rounded-xl text-sm font-sans font-bold text-brand-neutral-900 text-left w-full"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-brand-neutral-100 text-brand-neutral-700 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <span>{t("policy.disclaimer")}</span>
              </div>
              <ChevronIcon className="w-4 h-4 text-brand-neutral-400" />
            </button>
          </Card>
        </div>

        {/* Log Out CTA Button */}
        {user ? (
          <div className="pt-2 pb-6">
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
          <div className="pt-2 pb-6">
            <Link href="/login" className="w-full block">
              <Button variant="primary" size="md" leftIcon={<LogIn className="w-4 h-4" />} className="w-full rounded-2xl font-bold">
                {lang === "ar" ? "تسجيل الدخول أو إنشاء حساب" : "Log In or Create Account"}
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Policy Details Modal */}
      {activePolicy && (
        <Modal
          isOpen={!!activePolicy}
          onClose={() => setActivePolicy(null)}
          title={t(`policy.${activePolicy}`)}
          icon={<FileText className="w-4 h-4" />}
          maxWidth="md"
        >
          <div className="text-sm font-sans text-brand-neutral-700 leading-relaxed whitespace-pre-line py-2">
            {t(`policy.${activePolicy}Body`)}
          </div>
          <div className="pt-3 border-t border-brand-neutral-100 flex justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setActivePolicy(null)}
              className="rounded-xl font-bold text-xs"
            >
              {lang === "ar" ? "فهمت" : "Close"}
            </Button>
          </div>
        </Modal>
      )}
    </StandardPageLayout>
  );
}
