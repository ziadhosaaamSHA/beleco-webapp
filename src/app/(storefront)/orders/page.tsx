"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Truck } from "lucide-react";
import { StandardPageLayout } from "@/components/layout/StandardPageLayout";
import { Heading } from "@/components/ui/Heading/Heading";
import { Button } from "@/components/ui/Button/Button";
import { CustomerOrderCard } from "@/components/cards/CustomerOrderCard";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { OrdersPageSkeleton } from "@/components/ui/Skeleton/Skeleton";
import { ordersService } from "@/services/orders.service";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import type { Order } from "@/types/order.types";

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t, lang, isLangReady } = useLanguage();
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    const unsubscribe = ordersService.subscribeCustomerOrders(
      user?.uid,
      (items) => {
        setOrders(items);
        setLoading(false);
      },
      (err) => {
        console.error("Orders load error:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleRefresh = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    showToast(lang === "ar" ? "تم تحديث قائمة الطلبات" : "Orders list updated", "success");
  };

  if (!isLangReady || loading) {
    return (
      <StandardPageLayout showBack title={t("account.myOrders")}>
        <OrdersPageSkeleton />
      </StandardPageLayout>
    );
  }

  return (
    <StandardPageLayout showBack title={t("account.myOrders")} onRefresh={handleRefresh}>
      <div className="orders-page flex flex-col gap-4 px-4 pt-3 pb-16 animate-page-enter text-left" dir="ltr">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <Heading variant="editorial-h1" className="text-2xl text-brand-neutral-950 font-bold">
              {t("account.myOrders")}
            </Heading>
            <Heading variant="subheading" className="text-brand-neutral-600 text-xs sm:text-sm">
              {lang === "ar"
                ? "تابعي مسار وحالة طلباتك السابقة والحالية خطوة بخطوة"
                : "Track the live status of your current and past orders step by step"}
            </Heading>
          </div>
          <Link href="/account/tracking">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Truck className="w-3.5 h-3.5 text-primary-500" />}
              className="rounded-xl font-bold text-xs shrink-0 my-0"
            >
              {t("account.tracking")}
            </Button>
          </Link>
        </div>

        {orders.length > 0 ? (
          <div className="flex flex-col gap-3">
            {orders.map((order) => (
              <CustomerOrderCard key={order.id} order={order} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<ShoppingBag className="w-6 h-6" />}
            title={t("orders.empty")}
            description={
              lang === "ar"
                ? "اكتشفي تشكيلة منتجاتنا أو استخدمي الحاسبة لطلب منتجات شي إن وترينديول"
                : "Explore our collection or use the calculator to order from Shein & Trendyol"
            }
            actionText={lang === "ar" ? "تصفح المعروضات" : "Explore Collections"}
            onAction={() => router.push("/")}
          />
        )}
      </div>
    </StandardPageLayout>
  );
}
