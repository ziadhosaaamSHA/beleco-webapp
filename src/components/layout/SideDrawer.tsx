"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { useConfirm } from "@/context/ConfirmContext";

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SideDrawer: React.FC<SideDrawerProps> = ({ isOpen, onClose }) => {
  const { user, isAdmin, logout } = useAuth();
  const { lang, toggleLanguage, t, dir } = useLanguage();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const router = useRouter();

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleLogout = async () => {
    const isConfirmed = await confirm({
      title: lang === "ar" ? "تسجيل الخروج" : "Log Out",
      message: lang === "ar" ? "هل ترغبين بالتأكيد في تسجيل الخروج من حسابك؟" : "Are you sure you want to log out of your account?",
      confirmText: lang === "ar" ? "تسجيل الخروج" : "Log Out",
      cancelText: lang === "ar" ? "إلغاء" : "Cancel",
      isDestructive: true,
    });

    if (!isConfirmed) return;

    try {
      await logout();
      try {
        localStorage.removeItem("beleco_welcomed");
      } catch {}
      showToast(lang === "ar" ? "تم تسجيل الخروج بنجاح" : "Logged out successfully", "success");
      onClose();
      router.push("/welcome");
    } catch {
      showToast(lang === "ar" ? "حدث خطأ أثناء تسجيل الخروج" : "Error logging out", "error");
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`drawer-backdrop fixed inset-0 z-50 bg-brand-neutral-950/50 backdrop-blur-xs transition-opacity duration-250 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer Panel */}
      <div
        className={`drawer fixed top-0 bottom-0 right-0 z-50 w-[80%] max-w-[310px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        dir="ltr"
      >
        {/* Drawer Header */}
        <div
          className="drawer-header flex items-center gap-3 p-4 border-b border-brand-neutral-200"
          style={{ paddingTop: "calc(20px + env(safe-area-inset-top, 0px))" }}
        >
          <div className="drawer-avatar w-12 h-12 rounded-full bg-brand-neutral-100 border border-brand-neutral-200 flex items-center justify-center text-primary-500 shrink-0">
            <svg className="w-6 h-6 stroke-primary-500 fill-none stroke-[1.7]" viewBox="0 0 24 24">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
            </svg>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="drawer-name font-editorial text-base font-bold text-brand-neutral-900 truncate">
              {user?.displayName || t("account.guest")}
            </span>
            <span className="drawer-sub text-xs font-sans text-brand-neutral-500 truncate" dir="ltr">
              {user?.email || (lang === "ar" ? "زائرة في بيليكو" : "Guest in Beleco")}
            </span>
          </div>
        </div>

        {/* Drawer Links List */}
        <div className="drawer-list flex-1 overflow-y-auto p-2.5 flex flex-col gap-1">
          <Link
            href="/orders"
            onClick={onClose}
            className="drawer-item flex items-center gap-3 w-full p-3 rounded-xl text-brand-neutral-900 hover:bg-brand-neutral-100 active:bg-primary-50 transition-colors text-sm font-sans font-bold"
          >
            <svg className="w-5 h-5 stroke-primary-500 fill-none stroke-[1.7] shrink-0" viewBox="0 0 24 24">
              <rect x="5" y="2.5" width="14" height="19" rx="2" />
              <path d="M8.5 7h7M8.5 11h.01M12 11h.01M15.5 11h.01M8.5 14.5h.01M12 14.5h.01M15.5 14.5h.01M8.5 18h7" />
            </svg>
            <span>{t("account.myOrders")}</span>
          </Link>

          <Link
            href="/account/tracking"
            onClick={onClose}
            className="drawer-item flex items-center gap-3 w-full p-3 rounded-xl text-brand-neutral-900 hover:bg-brand-neutral-100 active:bg-primary-50 transition-colors text-sm font-sans font-bold"
          >
            <svg className="w-5 h-5 stroke-primary-500 fill-none stroke-[1.7] shrink-0" viewBox="0 0 24 24">
              <path d="M10 17h4V5H2v12h3" />
              <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1" />
              <circle cx="7.5" cy="17.5" r="2.5" />
              <circle cx="17.5" cy="17.5" r="2.5" />
            </svg>
            <span>{t("account.tracking")}</span>
          </Link>

          <Link
            href="/account/address"
            onClick={onClose}
            className="drawer-item flex items-center gap-3 w-full p-3 rounded-xl text-brand-neutral-900 hover:bg-brand-neutral-100 active:bg-primary-50 transition-colors text-sm font-sans font-bold"
          >
            <svg className="w-5 h-5 stroke-primary-500 fill-none stroke-[1.7] shrink-0" viewBox="0 0 24 24">
              <path d="M12 21s-7-5.2-7-11a7 7 0 0 1 14 0c0 5.8-7 11-7 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            <span>{t("account.address")}</span>
          </Link>

          <Link
            href="/calculator"
            onClick={onClose}
            className="drawer-item flex items-center gap-3 w-full p-3 rounded-xl text-brand-neutral-900 hover:bg-brand-neutral-100 active:bg-primary-50 transition-colors text-sm font-sans font-bold"
          >
            <svg className="w-5 h-5 stroke-primary-500 fill-none stroke-[1.7] shrink-0" viewBox="0 0 24 24">
              <rect x="4" y="2" width="16" height="20" rx="3" />
              <line x1="8" x2="16" y1="6" y2="6" />
              <line x1="16" x2="16" y1="14" y2="18" />
              <path d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M8 18h.01M12 18h.01" />
            </svg>
            <span>{t("calc.title")}</span>
          </Link>

          <Link
            href="/notifications"
            onClick={onClose}
            className="drawer-item flex items-center gap-3 w-full p-3 rounded-xl text-brand-neutral-900 hover:bg-brand-neutral-100 active:bg-primary-50 transition-colors text-sm font-sans font-bold"
          >
            <svg className="w-5 h-5 stroke-primary-500 fill-none stroke-[1.7] shrink-0" viewBox="0 0 24 24">
              <path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10Z" />
              <path d="M10 19a2 2 0 0 0 4 0" />
            </svg>
            <span>{t("notif.title")}</span>
          </Link>

          <Link
            href="/account/help"
            onClick={onClose}
            className="drawer-item flex items-center gap-3 w-full p-3 rounded-xl text-brand-neutral-900 hover:bg-brand-neutral-100 active:bg-primary-50 transition-colors text-sm font-sans font-bold"
          >
            <svg className="w-5 h-5 stroke-primary-500 fill-none stroke-[1.7] shrink-0" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <path d="M12 17h.01" />
            </svg>
            <span>{t("account.help")}</span>
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              onClick={onClose}
              className="drawer-item flex items-center gap-3 w-full p-3 rounded-xl text-brand-neutral-900 hover:bg-brand-neutral-100 active:bg-primary-50 transition-colors text-sm font-sans font-bold"
            >
              <svg className="w-5 h-5 stroke-primary-500 fill-none stroke-[1.7] shrink-0" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>{t("admin.title")}</span>
            </Link>
          )}

          <div className="drawer-divider h-px bg-brand-neutral-200 my-1 mx-2" />

          {/* Language Switch Row */}
          <button
            onClick={() => {
              toggleLanguage();
              onClose();
            }}
            className="drawer-item flex items-center justify-between w-full p-3 rounded-xl text-brand-neutral-900 hover:bg-brand-neutral-100 active:bg-primary-50 transition-colors text-sm font-sans font-bold text-right"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 stroke-primary-500 fill-none stroke-[1.7] shrink-0" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z" />
              </svg>
              <span>{t("account.settings")}</span>
            </div>
            <span className="text-xs font-mono font-bold text-primary-600 px-2 py-0.5 rounded bg-primary-50">
              {lang.toUpperCase()}
            </span>
          </button>

          <div className="drawer-divider h-px bg-brand-neutral-200 my-1 mx-2" />

          {user ? (
            <button
              onClick={handleLogout}
              className="drawer-item drawer-logout flex items-center gap-3 w-full p-3 rounded-xl text-danger-600 hover:bg-danger-50 active:bg-danger-100 transition-colors text-sm font-sans font-bold text-right"
            >
              <svg className="w-5 h-5 stroke-danger-600 fill-none stroke-[1.7] shrink-0" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
              <span>{t("account.logout")}</span>
            </button>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="drawer-item flex items-center gap-3 w-full p-3 rounded-xl text-primary-600 hover:bg-primary-50 active:bg-primary-100 transition-colors text-sm font-sans font-bold"
            >
              <svg className="w-5 h-5 stroke-primary-600 fill-none stroke-[1.7] shrink-0" viewBox="0 0 24 24">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10 17 15 12 10 7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              <span>تسجيل الدخول / Login</span>
            </Link>
          )}
        </div>
      </div>
    </>
  );
};
