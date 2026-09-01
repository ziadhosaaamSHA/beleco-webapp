"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { productsService } from "@/services/products.service";
import { ordersService } from "@/services/orders.service";
import { reelsService } from "@/services/reels.service";
import { Product } from "@/types/product.types";
import { StandardPageLayout } from "@/components/layout/StandardPageLayout";
import { FloatingNavIsland } from "@/components/layout/FloatingNavIsland";
import { Heading } from "@/components/ui/Heading/Heading";
import { Button } from "@/components/ui/Button/Button";
import { AdminPageSkeleton } from "@/components/ui/Skeleton/Skeleton";
import { ProductsListTab } from "@/components/admin/products/tabs/ProductsListTab";
import { useLoadingTimeout } from "@/hooks/useLoadingTimeout";
import { LoadingTimeoutState } from "@/components/ui/LoadingTimeout/LoadingTimeoutState";

export default function AdminProductsPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const { t } = useLanguage();

  const [products, setProducts] = useState<Product[]>([]);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [reelsCount, setReelsCount] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      setInitialLoading(false);
      return;
    }

    const unsubProducts = productsService.subscribeProducts(
      undefined,
      (pr) => {
        setProducts(pr);
        setInitialLoading(false);
      },
      (err) => {
        console.warn("Products subscription:", err.message);
        setInitialLoading(false);
      }
    );
    const unsubOrders = ordersService.subscribeAllOrders(
      (o) => {
        setPendingOrdersCount(o.filter((ord) => ord.status === "pending" || ord.status === "awaiting_calculation").length);
      },
      (err) => {
        console.warn("Orders subscription:", err.message);
      }
    );
    const unsubReels = reelsService.subscribeReels(
      (r) => {
        setReelsCount(r.length);
      },
      (err) => {
        console.warn("Reels subscription:", err.message);
      }
    );

    return () => {
      unsubProducts();
      unsubOrders();
      unsubReels();
    };
  }, [isAdmin]);

  const isPageLoading = authLoading || (isAdmin && initialLoading);
  const { hasTimedOut, resetTimeout } = useLoadingTimeout(isPageLoading);

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
                {t("admin.tab.products")}
              </Heading>
              <p className="text-xs text-brand-neutral-500 font-sans mt-0.5">
                {t("admin.subtitle")}
              </p>
            </div>
          </div>

          {/* Products List Tab */}
          <ProductsListTab
            products={products}
            onProductUpdated={(updated) => {
              setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            }}
            onProductDeleted={(deletedId) => {
              setProducts((prev) => prev.filter((p) => p.id !== deletedId));
            }}
          />
        </div>
      </StandardPageLayout>

      {/* Floating Bottom Navigation Island */}
      <FloatingNavIsland
        activeTab="products"
        ordersCount={pendingOrdersCount}
        productsCount={products.length}
        reelsCount={reelsCount}
      />
    </div>
  );
}
