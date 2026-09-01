"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Store, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";

export interface TopHeaderBarProps {
  onOpenMenu?: () => void;
}

export const TopHeaderBar: React.FC<TopHeaderBarProps> = ({ onOpenMenu }) => {
  const pathname = usePathname();
  const { isAdmin } = useAuth();
  const { lang, toggleLanguage, t } = useLanguage();
  const { showToast } = useToast();
  const isOnAdmin = pathname.startsWith("/admin");

  return (
    <div
      className="w-full px-4 pt-2 pb-1 sticky top-0 z-30 pointer-events-none select-none"
      style={{
        paddingTop: "calc(12px + env(safe-area-inset-top, 0px))",
      }}
      dir="ltr"
    >
      <header className="beleco-floating-topbar pointer-events-auto w-full bg-white/95 backdrop-blur-md border border-brand-neutral-200/90 rounded-full px-3.5 py-2 flex items-center justify-between gap-2 shadow-sm">
        {/* Left side: Back to Store on Admin, Beleco Logo on Storefront */}
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
            <span className="font-editorial text-base font-extrabold text-brand-neutral-950 tracking-tight group-hover:text-primary-600 transition-colors">
              Beleco
            </span>
          </Link>
        )}

        {/* Right side: Topbar Actions */}
        <div className="topbar-actions flex items-center gap-1.5 shrink-0">
          {isAdmin && !isOnAdmin && (
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
        </div>
      </header>
    </div>
  );
};
