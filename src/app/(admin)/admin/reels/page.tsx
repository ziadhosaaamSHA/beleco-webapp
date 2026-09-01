"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { reelsService } from "@/services/reels.service";
import { productsService } from "@/services/products.service";
import { ordersService } from "@/services/orders.service";
import { Reel } from "@/types/reel.types";
import { StandardPageLayout } from "@/components/layout/StandardPageLayout";
import { FloatingNavIsland } from "@/components/layout/FloatingNavIsland";
import { Heading } from "@/components/ui/Heading/Heading";
import { Button } from "@/components/ui/Button/Button";
import { AdminPageSkeleton } from "@/components/ui/Skeleton/Skeleton";
import { ReelsGalleryTab } from "@/components/admin/reels/tabs/ReelsGalleryTab";
import { useLoadingTimeout } from "@/hooks/useLoadingTimeout";
import { LoadingTimeoutState } from "@/components/ui/LoadingTimeout/LoadingTimeoutState";

export default function AdminReelsPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  const [reels, setReels] = useState<Reel[]>([]);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      setInitialLoading(false);
      return;
    }

    const unsubReels = reelsService.subscribeReels((r) => {
      setReels(r);
      setInitialLoading(false);
    });
    const unsubOrders = ordersService.subscribeAllOrders((o) => {
      setPendingOrdersCount(o.filter((ord) => ord.status === "pending" || ord.status === "awaiting_calculation").length);
    });
    const unsubProducts = productsService.subscribeProducts(undefined, (pr) => {
      setProductsCount(pr.length);
    });

    return () => {
      unsubReels();
      unsubOrders();
      unsubProducts();
    };
  }, [isAdmin]);

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
                {t("admin.tab.reels")}
              </Heading>
              <p className="text-xs text-brand-neutral-500 font-sans mt-0.5">
                {t("admin.subtitle")}
              </p>
            </div>
          </div>

          {/* Reels Gallery Tab */}
          <ReelsGalleryTab
            reels={reels}
            onReelDeleted={(deletedId) => {
              setReels((prev) => prev.filter((r) => r.id !== deletedId));
            }}
          />
        </div>
      </StandardPageLayout>

      {/* Floating Bottom Navigation Island */}
      <FloatingNavIsland
        activeTab="reels"
        ordersCount={pendingOrdersCount}
        productsCount={productsCount}
        reelsCount={reels.length}
      />
    </div>
  );
}
