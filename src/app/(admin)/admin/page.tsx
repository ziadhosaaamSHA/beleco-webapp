"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { useConfirm } from "@/context/ConfirmContext";
import { bazaarService } from "@/services/bazaar.service";
import { ordersService } from "@/services/orders.service";
import { productsService } from "@/services/products.service";
import { reelsService } from "@/services/reels.service";
import { BazaarProduct, BazaarSale } from "@/types/bazaar.types";
import { StandardPageLayout } from "@/components/layout/StandardPageLayout";
import { FloatingNavIsland } from "@/components/layout/FloatingNavIsland";
import { Heading } from "@/components/ui/Heading/Heading";
import { Button } from "@/components/ui/Button/Button";
import { AdminPageSkeleton } from "@/components/ui/Skeleton/Skeleton";
import { useLoadingTimeout } from "@/hooks/useLoadingTimeout";
import { LoadingTimeoutState } from "@/components/ui/LoadingTimeout/LoadingTimeoutState";
import { SellTab } from "@/components/admin/bazaar/tabs/SellTab";
import { InventoryTab } from "@/components/admin/bazaar/tabs/InventoryTab";
import { ReportsTab } from "@/components/admin/bazaar/tabs/ReportsTab";

export default function AdminBazaarPOSPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const { t, lang } = useLanguage();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [bazaarSubTab, setBazaarSubTab] = useState<"sell" | "inventory" | "report">("sell");
  const [bazaarProducts, setBazaarProducts] = useState<BazaarProduct[]>([]);
  const [bazaarSales, setBazaarSales] = useState<BazaarSale[]>([]);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [reelsCount, setReelsCount] = useState(0);
  const [scannerTrigger, setScannerTrigger] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);

  // Check URL query on mount / navigation for scan trigger
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("scan")) {
        setBazaarSubTab("sell");
        setScannerTrigger((prev) => prev + 1);
      }
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setInitialLoading(false);
      return;
    }

    let count = 0;
    const markLoaded = () => {
      count++;
      if (count >= 1) {
        setInitialLoading(false);
      }
    };

    const unsubProd = bazaarService.subscribeProducts((p) => {
      setBazaarProducts(p);
      markLoaded();
    });
    const unsubSales = bazaarService.subscribeSales((s) => {
      setBazaarSales(s);
      markLoaded();
    });
    const unsubOrders = ordersService.subscribeAllOrders((o) => {
      setPendingOrdersCount(o.filter((ord) => ord.status === "pending" || ord.status === "awaiting_calculation").length);
    });
    const unsubProducts = productsService.subscribeProducts(undefined, (pr) => {
      setProductsCount(pr.length);
    });
    const unsubReels = reelsService.subscribeReels((r) => {
      setReelsCount(r.length);
    });

    return () => {
      unsubProd();
      unsubSales();
      unsubOrders();
      unsubProducts();
      unsubReels();
    };
  }, [isAdmin]);

  const handleRefundSale = async (sale: BazaarSale) => {
    const isConfirmed = await confirm({
      title: lang === "ar" ? "تأكيد استرجاع / إلغاء بيع" : "Confirm Refund / Cancel Sale",
      message:
        lang === "ar"
          ? `هل أنت متأكد من استرجاع هذا المنتج وإلغاء تسجيل العملية من النظام؟\n\n• المنتج: ${sale.productName}\n• المبلغ: ${sale.finalPrice} ج.م`
          : `Are you sure you want to refund this sale?\n\n• Product: ${sale.productName}\n• Amount: ${sale.finalPrice} EGP`,
      confirmText: lang === "ar" ? "تأكيد الاسترجاع" : "Confirm Refund",
      cancelText: lang === "ar" ? "إلغاء" : "Cancel",
      isDestructive: true,
    });

    if (!isConfirmed) return;

    try {
      await bazaarService.refundSale(sale.id);
      showToast(
        lang === "ar" ? "تم استرجاع المنتج وخصمه من المبيعات" : "Sale refunded successfully",
        "success"
      );
    } catch {
      showToast(lang === "ar" ? "حدث خطأ أثناء إلغاء البيع" : "Error processing refund", "error");
    }
  };

  const isPageLoading = authLoading || (isAdmin && initialLoading);
  const { hasTimedOut, resetTimeout } = useLoadingTimeout(isPageLoading, { timeoutMs: 8000 });

  if (isPageLoading) {
    return (
      <StandardPageLayout>
        {hasTimedOut ? (
          <LoadingTimeoutState onRetry={resetTimeout} />
        ) : (
          <AdminPageSkeleton />
        )}
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
    <div className="relative h-full w-full flex flex-col overflow-hidden">
      <StandardPageLayout>
        <div className="flex flex-col gap-4 px-4 pt-1 pb-24 text-left" dir="ltr">
          {/* Header Title */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex flex-col">
              <Heading variant="editorial-h1" className="text-2xl text-brand-neutral-950 font-bold">
                {t("admin.tab.bazaar")}
              </Heading>
              <p className="text-xs text-brand-neutral-500 font-sans mt-0.5">
                {t("admin.subtitle")}
              </p>
            </div>
          </div>

          {/* Bazaar Sub Tabs */}
          <div className="flex items-center gap-2 border-b border-brand-neutral-200 pb-2.5 overflow-x-auto no-scrollbar">
            <Button
              variant={bazaarSubTab === "sell" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setBazaarSubTab("sell")}
              className="rounded-xl font-bold text-xs"
            >
              {t("admin.bazaar.sell")}
            </Button>
            <Button
              variant={bazaarSubTab === "inventory" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setBazaarSubTab("inventory")}
              className="rounded-xl font-bold text-xs"
            >
              {t("admin.bazaar.inventory")} ({bazaarProducts.length})
            </Button>
            <Button
              variant={bazaarSubTab === "report" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setBazaarSubTab("report")}
              className="rounded-xl font-bold text-xs"
            >
              {t("admin.bazaar.report")}
            </Button>
          </div>

          {/* Sub Tab Content */}
          {bazaarSubTab === "sell" && (
            <SellTab
              products={bazaarProducts}
              sales={bazaarSales}
              onRefundSale={handleRefundSale}
              scannerTrigger={scannerTrigger}
            />
          )}

          {bazaarSubTab === "inventory" && (
            <InventoryTab products={bazaarProducts} />
          )}

          {bazaarSubTab === "report" && (
            <ReportsTab sales={bazaarSales} onRefundSale={handleRefundSale} />
          )}
        </div>
      </StandardPageLayout>

      {/* Floating Bottom Navigation Island */}
      <FloatingNavIsland
        activeTab="bazaar"
        onOpenScanner={() => {
          if (bazaarSubTab !== "sell") {
            setBazaarSubTab("sell");
          }
          setScannerTrigger((prev) => prev + 1);
        }}
        ordersCount={pendingOrdersCount}
        productsCount={productsCount}
        reelsCount={reelsCount}
      />
    </div>
  );
}
