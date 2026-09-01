"use client";

import React from "react";
import { Store, ShoppingBag, Camera, Package, Film } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export interface AdminFloatingNavIslandProps {
  activeTab: "bazaar" | "orders" | "products" | "reels";
  onTabChange: (tab: "bazaar" | "orders" | "products" | "reels") => void;
  onOpenScanner?: () => void;
  ordersCount?: number;
  productsCount?: number;
  reelsCount?: number;
}

export const AdminFloatingNavIsland: React.FC<AdminFloatingNavIslandProps> = ({
  activeTab,
  onTabChange,
  onOpenScanner,
  ordersCount = 0,
  productsCount = 0,
  reelsCount = 0,
}) => {
  const { t } = useLanguage();

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
          onClick={() => onTabChange("bazaar")}
          className={`flex flex-1 flex-col items-center justify-center py-1 px-1 rounded-full transition-all active:scale-95 ${
            activeTab === "bazaar"
              ? "text-primary-500 font-bold"
              : "text-brand-neutral-500 hover:text-brand-neutral-900"
          }`}
        >
          <Store className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[9px] font-sans mt-0.5 whitespace-nowrap">{t("admin.tab.bazaar")}</span>
        </button>

        {/* 2. Orders */}
        <button
          onClick={() => onTabChange("orders")}
          className={`flex flex-1 flex-col items-center justify-center py-1 px-1 rounded-full transition-all active:scale-95 relative ${
            activeTab === "orders"
              ? "text-primary-500 font-bold"
              : "text-brand-neutral-500 hover:text-brand-neutral-900"
          }`}
        >
          <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[9px] font-sans mt-0.5 whitespace-nowrap">{t("admin.tab.orders")}</span>
          {ordersCount > 0 && (
            <span className="absolute -top-0.5 right-2 min-w-4 h-4 px-1 rounded-full bg-primary-500 text-white font-mono text-[9px] font-bold flex items-center justify-center shadow-xs">
              {ordersCount > 99 ? "99+" : ordersCount}
            </span>
          )}
        </button>

        {/* 3. Center Scanner FAB */}
        <button
          onClick={() => {
            onTabChange("bazaar");
            onOpenScanner?.();
          }}
          className="flex-0 shrink-0 w-12 h-12 rounded-full flex items-center justify-center -mt-6 shadow-lg active:scale-95 transition-all border-[2.5px] border-white bg-primary-500 text-white hover:bg-primary-600 shadow-floating"
          title={t("admin.bazaar.scanQr")}
        >
          <Camera className="w-5 h-5 text-white stroke-[2]" />
        </button>

        {/* 4. Products */}
        <button
          onClick={() => onTabChange("products")}
          className={`flex flex-1 flex-col items-center justify-center py-1 px-1 rounded-full transition-all active:scale-95 relative ${
            activeTab === "products"
              ? "text-primary-500 font-bold"
              : "text-brand-neutral-500 hover:text-brand-neutral-900"
          }`}
        >
          <Package className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[9px] font-sans mt-0.5 whitespace-nowrap">{t("admin.tab.products")}</span>
          {productsCount > 0 && (
            <span className="absolute -top-0.5 right-2 min-w-4 h-4 px-1 rounded-full bg-brand-neutral-200 text-brand-neutral-800 font-mono text-[9px] font-bold flex items-center justify-center">
              {productsCount > 99 ? "99+" : productsCount}
            </span>
          )}
        </button>

        {/* 5. Reels */}
        <button
          onClick={() => onTabChange("reels")}
          className={`flex flex-1 flex-col items-center justify-center py-1 px-1 rounded-full transition-all active:scale-95 relative ${
            activeTab === "reels"
              ? "text-primary-500 font-bold"
              : "text-brand-neutral-500 hover:text-brand-neutral-900"
          }`}
        >
          <Film className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[9px] font-sans mt-0.5 whitespace-nowrap">{t("admin.tab.reels")}</span>
          {reelsCount > 0 && (
            <span className="absolute -top-0.5 right-2 min-w-4 h-4 px-1 rounded-full bg-brand-neutral-200 text-brand-neutral-800 font-mono text-[9px] font-bold flex items-center justify-center">
              {reelsCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
};
