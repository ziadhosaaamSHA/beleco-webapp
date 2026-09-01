"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Store,
  ShoppingBag,
  Camera,
  Package,
  Film,
  User,
  Play,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export interface FloatingNavIslandProps {
  // Optional Admin Mode Props
  mode?: "storefront" | "admin";
  adminActiveTab?: "bazaar" | "orders" | "products" | "reels";
  onAdminTabChange?: (tab: "bazaar" | "orders" | "products" | "reels") => void;
  onAdminOpenScanner?: () => void;
  adminOrdersCount?: number;
  adminProductsCount?: number;
  adminReelsCount?: number;
}

export const FloatingNavIsland: React.FC<FloatingNavIslandProps> = ({
  mode,
  adminActiveTab,
  onAdminTabChange,
  onAdminOpenScanner,
  adminOrdersCount = 0,
  adminProductsCount = 0,
  adminReelsCount = 0,
}) => {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { itemCount } = useCart();
  const { isAdmin } = useAuth();

  const isOnAdminRoute = pathname.startsWith("/admin");
  const isProductDetail = pathname.startsWith("/products/");
  const isOnReels = pathname === "/reels";

  // Hide on product detail view
  if (isProductDetail) {
    return null;
  }

  // If in admin mode or on /admin route
  const isCurrentlyAdmin = mode === "admin" || isOnAdminRoute;

  // If on admin route without explicit handler props, hide to let AdminFloatingNavIsland or admin state handle it
  if (isOnAdminRoute && !onAdminTabChange && mode !== "admin") {
    return null;
  }

  // =========================================================================
  // ADMIN NAVIGATION
  // =========================================================================
  if (isCurrentlyAdmin) {
    return (
      <nav
        className="absolute bottom-0 left-0 right-0 z-50 flex items-center justify-center px-4 pointer-events-none select-none"
        style={{
          paddingBottom: "calc(14px + env(safe-area-inset-bottom, 0px))",
        }}
        dir="ltr"
      >
        <div className="pointer-events-auto flex items-center justify-around gap-1 w-full max-w-[420px] rounded-full px-2 py-1.5 transition-all duration-200 bg-white/80 backdrop-blur-md border border-white/80 shadow-floating">
          {/* 1. Bazaar POS */}
          <button
            onClick={() => onAdminTabChange?.("bazaar")}
            className={`flex flex-1 flex-col items-center justify-center py-1 px-1 rounded-full transition-all active:scale-95 ${
              adminActiveTab === "bazaar"
                ? "text-primary-500 font-bold"
                : "text-brand-neutral-500 hover:text-brand-neutral-900"
            }`}
          >
            <Store className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[9px] font-sans mt-0.5 whitespace-nowrap">{t("admin.tab.bazaar")}</span>
          </button>

          {/* 2. Orders */}
          <button
            onClick={() => onAdminTabChange?.("orders")}
            className={`flex flex-1 flex-col items-center justify-center py-1 px-1 rounded-full transition-all active:scale-95 relative ${
              adminActiveTab === "orders"
                ? "text-primary-500 font-bold"
                : "text-brand-neutral-500 hover:text-brand-neutral-900"
            }`}
          >
            <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[9px] font-sans mt-0.5 whitespace-nowrap">{t("admin.tab.orders")}</span>
            {adminOrdersCount > 0 && (
              <span className="absolute -top-0.5 right-2 min-w-4 h-4 px-1 rounded-full bg-primary-500 text-white font-mono text-[9px] font-bold flex items-center justify-center shadow-xs">
                {adminOrdersCount > 99 ? "99+" : adminOrdersCount}
              </span>
            )}
          </button>

          {/* 3. Center Scanner FAB */}
          <button
            onClick={() => {
              onAdminTabChange?.("bazaar");
              onAdminOpenScanner?.();
            }}
            className="flex-0 shrink-0 w-12 h-12 rounded-full flex items-center justify-center -mt-6 shadow-lg active:scale-95 transition-all border-[2.5px] border-white bg-primary-500 text-white hover:bg-primary-600 shadow-floating"
            title={t("admin.bazaar.scanQr")}
          >
            <Camera className="w-5 h-5 text-white stroke-[2]" />
          </button>

          {/* 4. Products */}
          <button
            onClick={() => onAdminTabChange?.("products")}
            className={`flex flex-1 flex-col items-center justify-center py-1 px-1 rounded-full transition-all active:scale-95 relative ${
              adminActiveTab === "products"
                ? "text-primary-500 font-bold"
                : "text-brand-neutral-500 hover:text-brand-neutral-900"
            }`}
          >
            <Package className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[9px] font-sans mt-0.5 whitespace-nowrap">{t("admin.tab.products")}</span>
            {adminProductsCount > 0 && (
              <span className="absolute -top-0.5 right-2 min-w-4 h-4 px-1 rounded-full bg-brand-neutral-200 text-brand-neutral-800 font-mono text-[9px] font-bold flex items-center justify-center">
                {adminProductsCount > 99 ? "99+" : adminProductsCount}
              </span>
            )}
          </button>

          {/* 5. Reels */}
          <button
            onClick={() => onAdminTabChange?.("reels")}
            className={`flex flex-1 flex-col items-center justify-center py-1 px-1 rounded-full transition-all active:scale-95 relative ${
              adminActiveTab === "reels"
                ? "text-primary-500 font-bold"
                : "text-brand-neutral-500 hover:text-brand-neutral-900"
            }`}
          >
            <Film className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[9px] font-sans mt-0.5 whitespace-nowrap">{t("admin.tab.reels")}</span>
            {adminReelsCount > 0 && (
              <span className="absolute -top-0.5 right-2 min-w-4 h-4 px-1 rounded-full bg-brand-neutral-200 text-brand-neutral-800 font-mono text-[9px] font-bold flex items-center justify-center">
                {adminReelsCount}
              </span>
            )}
          </button>
        </div>
      </nav>
    );
  }

  // =========================================================================
  // STOREFRONT NAVIGATION
  // =========================================================================
  const isHome = pathname === "/";
  const isReels = pathname === "/reels";
  const isCalc = pathname === "/calculator";
  const isAccount = pathname.startsWith("/account") || pathname.startsWith("/orders");
  const isCart = pathname === "/cart";

  return (
    <nav
      className="absolute bottom-0 left-0 right-0 z-50 flex items-center justify-center px-4 pointer-events-none select-none"
      style={{
        paddingBottom: "calc(14px + env(safe-area-inset-bottom, 0px))",
      }}
      dir="ltr"
    >
      <div
        className={`pointer-events-auto flex items-center justify-around gap-1 w-full max-w-[420px] rounded-full px-2 py-1.5 transition-all duration-200 ${
          isOnReels
            ? "bg-brand-neutral-950/60 backdrop-blur-md border border-white/10 shadow-2xl"
            : "bg-white/80 backdrop-blur-md border border-white/80 shadow-floating"
        }`}
      >
        {/* 1. الرئيسية (Home) */}
        <Link
          href="/"
          className={`flex flex-1 flex-col items-center justify-center py-1 px-1 rounded-full transition-all active:scale-95 ${
            isHome
              ? "text-primary-500 font-bold"
              : isOnReels
              ? "text-white/60 hover:text-white"
              : "text-brand-neutral-500 hover:text-brand-neutral-900"
          }`}
        >
          <svg
            className="w-5 h-5 stroke-current fill-none stroke-[1.8]"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 10.5 12 3l9 7.5" />
            <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
          </svg>
          <span className="text-[9px] font-sans mt-0.5 whitespace-nowrap">{t("tab.home")}</span>
        </Link>

        {/* 2. Reels */}
        <Link
          href="/reels"
          className={`flex flex-1 flex-col items-center justify-center py-1 px-1 rounded-full transition-all active:scale-95 ${
            isReels
              ? "text-primary-500 font-bold"
              : isOnReels
              ? "text-white/60 hover:text-white"
              : "text-brand-neutral-500 hover:text-brand-neutral-900"
          }`}
        >
          <svg
            className="w-5 h-5 fill-current stroke-none"
            viewBox="0 0 24 24"
          >
            <polygon points="6 3 20 12 6 21 6 3" />
          </svg>
          <span className="text-[9px] font-sans mt-0.5 whitespace-nowrap">{t("tab.reels")}</span>
        </Link>

        {/* 3. احسبيلي (Center Calc FAB) */}
        <Link
          href="/calculator"
          className={`flex-0 shrink-0 w-12 h-12 rounded-full flex items-center justify-center -mt-6 shadow-lg active:scale-95 transition-all border-[2.5px] border-white ${
            isCalc
              ? "bg-brand-neutral-950 text-white shadow-xl"
              : "bg-primary-500 text-white hover:bg-primary-600"
          }`}
          title={t("calc.title")}
        >
          <svg
            className="w-5 h-5 stroke-white fill-none stroke-[2]"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="4" y="2" width="16" height="20" rx="3" />
            <line x1="8" x2="16" y1="6" y2="6" />
            <line x1="16" x2="16" y1="14" y2="18" />
            <path d="M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M8 18h.01M12 18h.01" />
          </svg>
        </Link>

        {/* 4. حسابي (Account) */}
        <Link
          href="/account"
          className={`flex flex-1 flex-col items-center justify-center py-1 px-1 rounded-full transition-all active:scale-95 ${
            isAccount
              ? "text-primary-500 font-bold"
              : isOnReels
              ? "text-white/60 hover:text-white"
              : "text-brand-neutral-500 hover:text-brand-neutral-900"
          }`}
        >
          <svg
            className="w-5 h-5 stroke-current fill-none stroke-[1.8]"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
          </svg>
          <span className="text-[9px] font-sans mt-0.5 whitespace-nowrap">{t("tab.account")}</span>
        </Link>

        {/* 5. الشنطة (Bag) */}
        <Link
          href="/cart"
          className={`flex flex-1 flex-col items-center justify-center py-1 px-1 rounded-full transition-all active:scale-95 relative ${
            isCart
              ? "text-primary-500 font-bold"
              : isOnReels
              ? "text-white/60 hover:text-white"
              : "text-brand-neutral-500 hover:text-brand-neutral-900"
          }`}
        >
          <svg
            className="w-5 h-5 stroke-current fill-none stroke-[1.8]"
            viewBox="0 0 24 24"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 8h10l1 12.5a1.2 1.2 0 0 1-1.2 1.3H7.2A1.2 1.2 0 0 1 6 20.5L7 8Z" />
            <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
          </svg>
          <span className="text-[9px] font-sans mt-0.5 whitespace-nowrap">{t("tab.bag")}</span>
          {itemCount > 0 && (
            <span className="absolute -top-0.5 right-2 min-w-4 h-4 px-1 rounded-full bg-primary-500 text-white font-mono text-[9px] font-bold flex items-center justify-center shadow-xs">
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          )}
        </Link>
      </div>
    </nav>
  );
};
