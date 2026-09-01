"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Truck, Package, Clock, CheckCircle2, AlertCircle, MapPin, Phone, ArrowRight, ArrowLeft } from "lucide-react";
import { StandardPageLayout } from "@/components/layout/StandardPageLayout";
import { Heading } from "@/components/ui/Heading/Heading";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { Card } from "@/components/ui/Card/Card";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState/LoadingState";
import { TrackingPageSkeleton } from "@/components/ui/Skeleton/Skeleton";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import { ordersService } from "@/services/orders.service";
import type { Order, OrderStatus } from "@/types/order.types";
import { Badge } from "@/components/ui/Badge/Badge";

const TRACKING_STEPS: Array<{ status: OrderStatus; key: string; icon: React.ComponentType<{ className?: string }> }> = [
  { status: "pending", key: "tracking.steps.1", icon: Clock },
  { status: "confirmed", key: "tracking.steps.2", icon: CheckCircle2 },
  { status: "preparing", key: "tracking.steps.3", icon: Package },
  { status: "shipped", key: "tracking.steps.4", icon: Truck },
  { status: "delivered", key: "tracking.steps.5", icon: CheckCircle2 },
];

export default function TrackShipmentsPage() {
  const { user } = useAuth();
  const { t, lang, dir, isLangReady } = useLanguage();
  const { formatPrice } = useLocation();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [matchedOrders, setMatchedOrders] = useState<Order[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Pre-load recent orders from local storage or latest customer orders (newest first)
  useEffect(() => {
    const unsub = ordersService.subscribeCustomerOrders(user?.uid, (items) => {
      if (items.length > 0 && !hasSearched) {
        setMatchedOrders(items);
      }
      setInitialLoading(false);
    });
    return () => unsub();
  }, [user, hasSearched]);

  if (!isLangReady || initialLoading) {
    return (
      <StandardPageLayout>
        <TrackingPageSkeleton />
      </StandardPageLayout>
    );
  }

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) {
      showToast(lang === "ar" ? "يرجى كتابة رقم الطلب أو الهاتف للبحث" : "Please enter Order ID or phone number", "error");
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    try {
      const results = await ordersService.searchOrders(searchQuery.trim());
      setMatchedOrders(results);
      if (results.length === 0) {
        showToast(t("tracking.notFound"), "info");
      }
    } catch {
      showToast(lang === "ar" ? "حدث خطأ أثناء البحث عن الشحنة" : "Error searching for shipment", "error");
    } finally {
      setIsSearching(false);
    }
  };

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case "awaiting_calculation":
      case "priced":
      case "payment_pending_review":
      case "payment_flagged":
      case "pending":
        return 0;
      case "payment_confirmed":
      case "confirmed":
        return 1;
      case "ordered":
      case "preparing":
        return 2;
      case "shipped":
        return 3;
      case "delivered":
        return 4;
      case "cancelled":
        return -1;
      default:
        return 0;
    }
  };

  const getStatusBadgeVariant = (status: OrderStatus): "primary" | "neutral" | "success" | "danger" | "gold" => {
    switch (status) {
      case "delivered":
      case "payment_confirmed":
        return "success";
      case "cancelled":
      case "payment_flagged":
        return "danger";
      case "awaiting_calculation":
      case "payment_pending_review":
        return "gold";
      case "priced":
      case "ordered":
      case "pending":
      case "shipped":
        return "primary";
      default:
        return "neutral";
    }
  };

  return (
    <StandardPageLayout showBack backHref="/account" title={t("account.tracking")}>
      <div className="tracking-page flex flex-col gap-4 px-4 pt-2 pb-16 animate-page-enter text-left" dir="ltr">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <Heading variant="editorial-h1" className="text-xl sm:text-2xl text-brand-neutral-950 font-bold">
            {t("tracking.title")}
          </Heading>
          <p className="text-xs font-sans text-brand-neutral-500">
            {t("tracking.sub")}
          </p>
        </div>

        {/* Search Box */}
        <Card className="p-3.5 flex flex-col gap-2.5 bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs">
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <Input
              placeholder={t("tracking.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-brand-neutral-50"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSearching}
              leftIcon={<Search className="w-4 h-4" />}
              className="font-bold text-xs shrink-0 rounded-xl"
            >
              {t("tracking.trackBtn")}
            </Button>
          </form>
        </Card>

        {/* Results List */}
        {isSearching ? (
          <LoadingState
            title={lang === "ar" ? "جاري تتبع الشحنة..." : "Searching for shipment..."}
            description={lang === "ar" ? "يتم التحقق من مسار الطلب مع شركة الشحن" : "Checking tracking status"}
          />
        ) : matchedOrders.length > 0 ? (
          <div className="flex flex-col gap-4">
            {matchedOrders.map((ord) => {
              const currentStepIdx = getStepIndex(ord.status);
              const isCancelled = ord.status === "cancelled";
              const { formatted: formattedTotal } = formatPrice(ord.total || 0);

              return (
                <Card
                  key={ord.id}
                  className="p-4 flex flex-col gap-4 bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs"
                >
                  {/* Order Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <Heading variant="card-title" className="text-sm font-bold text-brand-neutral-950">
                          {lang === "ar" ? "طلب #" : "Order #"}{ord.id.slice(-6).toUpperCase()}
                        </Heading>
                        <span className="text-xs font-mono text-brand-neutral-500">
                          {new Date(ord.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    <Badge
                      variant={getStatusBadgeVariant(ord.status)}
                      size="sm"
                      className="font-sans"
                    >
                      {t(`status.${ord.status}`)}
                    </Badge>
                  </div>

                  {/* Step Timeline */}
                  {!isCancelled ? (
                    <div className="py-3 px-2 border-y border-brand-neutral-100 flex items-center justify-between relative">
                      {/* Background Bar */}
                      <div className="absolute top-1/2 left-6 right-6 h-1 bg-brand-neutral-100 -translate-y-1/2 z-0" />
                      {/* Active Progress Bar */}
                      <div
                        className="absolute top-1/2 left-6 h-1 bg-primary-500 -translate-y-1/2 z-0 transition-all duration-500"
                        style={{
                          width: `${(Math.max(0, currentStepIdx) / (TRACKING_STEPS.length - 1)) * 88}%`,
                        }}
                      />

                      {TRACKING_STEPS.map((step, idx) => {
                        const isReached = idx <= currentStepIdx;
                        const isCurrent = idx === currentStepIdx;
                        const StepIcon = step.icon;

                        return (
                          <div
                            key={step.key}
                            className="flex flex-col items-center gap-1.5 z-10 select-none"
                          >
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                                isCurrent
                                  ? "bg-primary-500 border-white text-white shadow-md ring-4 ring-primary-100 scale-110"
                                  : isReached
                                  ? "bg-primary-500 border-white text-white shadow-2xs"
                                  : "bg-white border-brand-neutral-200 text-brand-neutral-400"
                              }`}
                            >
                              <StepIcon className="w-3.5 h-3.5 stroke-[2.2]" />
                            </div>
                            <span
                              className={`text-[9px] font-sans whitespace-nowrap ${
                                isCurrent
                                  ? "font-bold text-primary-600"
                                  : isReached
                                  ? "font-medium text-brand-neutral-800"
                                  : "text-brand-neutral-400"
                              }`}
                            >
                              {t(step.key)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-danger-50 text-danger-700 text-xs font-sans flex items-center gap-2 border border-danger-200">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{lang === "ar" ? "تم إلغاء هذا الطلب من قبل الإدارة أو العميل" : "This order has been cancelled"}</span>
                    </div>
                  )}

                  {/* Shipment Details & Items */}
                  <div className="flex flex-col gap-2 text-xs font-sans text-brand-neutral-700">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-brand-neutral-50 border border-brand-neutral-100">
                      <div className="flex items-center gap-1.5 truncate max-w-[220px]">
                        <MapPin className="w-3.5 h-3.5 text-brand-neutral-500 shrink-0" />
                        <span className="truncate">{ord.customerInfo?.streetAddress || ord.customerInfo?.city || "العنوان"}</span>
                      </div>
                      <span className="font-mono font-extrabold text-primary-600 shrink-0">
                        {formattedTotal}
                      </span>
                    </div>

                    {/* Action Links */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-brand-neutral-100">
                      <Link href={`/orders/${ord.id}`} className="w-full">
                        <Button variant="secondary" size="sm" className="w-full text-xs font-bold rounded-xl justify-center">
                          {lang === "ar" ? "تفاصيل الفاتورة" : "View Invoice"}
                        </Button>
                      </Link>
                      <Link href={`/orders/${ord.id}/tracking`} className="w-full">
                        <Button variant="primary" size="sm" leftIcon={<Truck className="w-3.5 h-3.5" />} className="w-full text-xs font-bold rounded-xl justify-center">
                          {lang === "ar" ? "مسار الشحنة" : "Live Tracking"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : hasSearched ? (
          <EmptyState
            icon={<Truck className="w-6 h-6" />}
            title={t("tracking.notFound")}
            description={lang === "ar" ? "تأكدي من صحة رقم الطلب أو رقم الهاتف المسجل به الطلب" : "Check the Order ID or phone number"}
          />
        ) : (
          <EmptyState
            icon={<Truck className="w-6 h-6" />}
            title={t("tracking.title")}
            description={t("tracking.sub")}
          />
        )}
      </div>
    </StandardPageLayout>
  );
}
