"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Globe,
  Store,
  Shield,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { Heading } from "@/components/ui/Heading/Heading";

export interface TopHeaderBarProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
  onBack?: () => void;
  onOpenMenu?: () => void;
}

const ROOT_PATHS = [
  "/",
  "/reels",
  "/cart",
  "/account",
  "/admin",
  "/admin/orders",
  "/admin/products",
  "/admin/reels",
];

export const TopHeaderBar: React.FC<TopHeaderBarProps> = ({
  title,
  showBack,
  backHref,
  onBack,
  onOpenMenu,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { lang, toggleLanguage, dir, t } = useLanguage();
  const isOnAdmin = pathname.startsWith("/admin");

  // Determine if current view should display the stacked child header
  const isChildPage = showBack !== undefined ? showBack : !ROOT_PATHS.includes(pathname);

  // Derive default back destination if needed
  const defaultBackHref = pathname.startsWith("/admin/products/")
    ? "/admin/products"
    : pathname.startsWith("/admin/reels/")
    ? "/admin/reels"
    : pathname.startsWith("/admin/")
    ? "/admin"
    : pathname.endsWith("/tracking") && pathname.startsWith("/orders/")
    ? pathname.replace("/tracking", "")
    : pathname.startsWith("/orders/")
    ? "/orders"
    : pathname.startsWith("/account/") || pathname === "/orders"
    ? "/account"
    : pathname.startsWith("/products/")
    ? "/"
    : "/";

  // Derive default localized page title if not explicitly passed
  const getResolvedTitle = (): string => {
    if (title) return title;
    if (pathname === "/admin/products/new") return lang === "ar" ? "إضافة منتج جديد" : "Add New Product";
    if (pathname === "/admin/reels/new") return lang === "ar" ? "نشر فيديو ريل جديد" : "Upload New Reel";
    if (pathname === "/admin/orders") return lang === "ar" ? "إدارة الطلبات" : "Orders Management";
    if (pathname === "/admin/products") return lang === "ar" ? "كتالوج المنتجات" : "Products Catalog";
    if (pathname === "/admin/reels") return lang === "ar" ? "إدارة الريلز" : "Reels Management";
    if (pathname === "/admin") return lang === "ar" ? "نقطة بيع البازار (POS)" : "Bazaar POS";
    if (pathname === "/orders") return t("account.myOrders");
    if (pathname.endsWith("/tracking")) return t("account.tracking");
    if (pathname.startsWith("/orders/")) return lang === "ar" ? "تفاصيل الطلب" : "Order Details";
    if (pathname === "/account/profile") return t("account.personalInfo");
    if (pathname === "/account/address") return t("account.address");
    if (pathname === "/account/settings") return t("account.settings");
    if (pathname === "/account/help") return t("account.help");
    if (pathname === "/account/about") return t("policy.about");
    if (pathname === "/account/shipping") return t("policy.shipping");
    if (pathname === "/account/orders-policy") return t("policy.orders");
    if (pathname === "/account/returns") return t("policy.returns");
    if (pathname === "/account/disclaimer") return t("policy.disclaimer");
    if (pathname === "/account/tracking") return t("account.tracking");
    if (pathname === "/notifications") return t("notif.title");
    if (pathname === "/calculator") return t("calc.title");
    return "";
  };

  const resolvedTitle = getResolvedTitle();
  const BackChevron = dir === "rtl" ? ChevronRight : ChevronLeft;

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else if (backHref) {
      router.push(backHref);
    } else {
      // Check if browser history has an entry, else fallback
      if (window.history.length > 1) {
        router.back();
      } else {
        router.push(defaultBackHref);
      }
    }
  };

  return (
    <div
      className="w-full px-4 pt-2 pb-1 sticky top-0 z-30 pointer-events-none select-none"
      style={{
        paddingTop: "calc(12px + env(safe-area-inset-top, 0px))",
      }}
      dir="ltr"
    >
      <header className="beleco-floating-topbar pointer-events-auto w-full bg-white/95 backdrop-blur-md border border-brand-neutral-200/90 rounded-full px-3 py-1.5 flex items-center justify-between gap-2 shadow-sm min-h-[44px]">
        {/* STACK NAVIGATION (Child / Detail View) */}
        {isChildPage ? (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button
              onClick={handleBackClick}
              className="w-8 h-8 rounded-full bg-brand-neutral-100/90 hover:bg-primary-50 text-brand-neutral-800 hover:text-primary-600 active:scale-95 transition-all flex items-center justify-center shrink-0 border border-brand-neutral-200/80 cursor-pointer"
              aria-label={lang === "ar" ? "رجوع" : "Back"}
              title={lang === "ar" ? "رجوع" : "Back"}
            >
              <BackChevron className="w-4 h-4 stroke-[2.2]" />
            </button>

            {resolvedTitle && (
              <div className="flex-1 min-w-0 pr-1">
                <Heading
                  variant="card-title"
                  className="text-xs sm:text-sm font-bold text-brand-neutral-950 truncate"
                >
                  {resolvedTitle}
                </Heading>
              </div>
            )}
          </div>
        ) : (
          /* ROOT STOREFRONT NAVIGATION */
          <div className="flex items-center gap-2 shrink-0">
            {isOnAdmin ? (
              <Link
                href="/"
                className="flex items-center gap-1.5 bg-transparent border-none p-0 cursor-pointer text-brand-neutral-950 shrink-0 group text-left"
                title={t("admin.backToStore")}
              >
                <div className="w-6 h-6 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                  <Store className="w-3.5 h-3.5 stroke-[2.2]" />
                </div>
                <span className="text-xs font-sans font-bold whitespace-nowrap text-brand-neutral-900 group-hover:text-primary-600">
                  {t("admin.backToStore")}
                </span>
              </Link>
            ) : (
              <Link
                href="/"
                className="flex items-center gap-2 bg-transparent border-none p-0 cursor-pointer group shrink-0"
                title="Beleco"
              >
                <img
                  src="/logo.png"
                  alt="Beleco Logo"
                  className="h-6 w-auto object-contain shrink-0 drop-shadow-2xs transition-transform group-hover:scale-105"
                />
              </Link>
            )}
          </div>
        )}

        {/* Right side: Topbar Quick Actions */}
        <div className="topbar-actions flex items-center gap-1.5 shrink-0">
          {isAdmin && !isOnAdmin && !isChildPage && (
            <Link
              href="/admin"
              className="admin-badge flex items-center gap-1 bg-brand-neutral-950 text-white text-[11px] font-sans font-bold tracking-tight px-3 py-1 rounded-full hover:bg-brand-neutral-800 transition-colors shadow-xs"
              title={t("admin.badge")}
            >
              <Shield className="w-3.5 h-3.5 text-primary-400 stroke-[2]" />
              <span>{t("admin.badge")}</span>
            </Link>
          )}

          {isOnAdmin && (
            <div className="flex items-center gap-1 bg-brand-neutral-100 text-brand-neutral-800 text-[11px] font-sans font-bold px-2.5 py-1 rounded-full border border-brand-neutral-200">
              <Shield className="w-3.5 h-3.5 text-primary-500 stroke-[2]" />
              <span>{t("admin.role")}</span>
            </div>
          )}

          {/* Transparent Language Button with Visible Border & World Icon */}
          <button
            onClick={toggleLanguage}
            className="lang-toggle flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-transparent border border-brand-neutral-300 text-brand-neutral-900 hover:border-primary-500 hover:text-primary-600 active:scale-95 transition-all"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-brand-neutral-600" />
            <span suppressHydrationWarning className="font-mono font-extrabold text-[11px]">
              {lang === "ar" ? "EN" : "AR"}
            </span>
          </button>

          {!isChildPage && (
            <>
              {/* Notifications Bell Link */}
              <Link
                href="/notifications"
                className="icon-btn w-8 h-8 rounded-full flex items-center justify-center text-brand-neutral-800 hover:bg-primary-50 active:scale-95 transition-all relative"
                aria-label={t("notif.title")}
                title={t("notif.title")}
              >
                <svg
                  className="w-4 h-4 stroke-brand-neutral-800 fill-none stroke-[1.8]"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10Z" />
                  <path d="M10 19a2 2 0 0 0 4 0" />
                </svg>
                {/* Unread Indicator Pulse Dot */}
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-500 ring-2 ring-white" />
              </Link>

              {/* Side Drawer Hamburger Menu Button */}
              <button
                onClick={onOpenMenu}
                className="menu-btn w-8 h-8 rounded-full flex items-center justify-center text-brand-neutral-800 hover:bg-primary-50 active:scale-95 transition-all"
                aria-label="القائمة الجانبية"
              >
                <svg
                  className="w-4 h-4 stroke-brand-neutral-800 fill-none stroke-[1.8]"
                  viewBox="0 0 24 24"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </>
          )}
        </div>
      </header>
    </div>
  );
};
