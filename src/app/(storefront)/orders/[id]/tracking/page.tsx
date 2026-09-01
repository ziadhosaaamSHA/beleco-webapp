"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Truck,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  ShieldCheck,
  CreditCard,
  Calculator,
  Check,
  ShoppingBag,
  ExternalLink,
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import { StandardPageLayout } from "@/components/layout/StandardPageLayout";
import { Heading } from "@/components/ui/Heading/Heading";
import { Card } from "@/components/ui/Card/Card";
import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { TrackingPageSkeleton } from "@/components/ui/Skeleton/Skeleton";
import { ordersService } from "@/services/orders.service";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import type { Order, OrderStatus } from "@/types/order.types";

interface MilestoneStage {
  id: string;
  stepNumber: number;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  icon: React.ComponentType<{ className?: string }>;
  statuses: OrderStatus[];
}

const MILESTONE_STAGES: MilestoneStage[] = [
  {
    id: "received",
    stepNumber: 1,
    titleAr: "استلام الطلب",
    titleEn: "Order Received",
    descAr: "تم استلام بيانات الطلب بنجاح وهو قيد المراجعة الأولية.",
    descEn: "Order details received and entered into our system.",
    icon: Clock,
    statuses: ["awaiting_calculation", "pending"],
  },
  {
    id: "confirmed",
    stepNumber: 2,
    titleAr: "التأكيد والدفع",
    titleEn: "Confirmed & Paid",
    descAr: "تم تأكيد الأسعار وتحويل العربون/المبلغ وبدء الشراء.",
    descEn: "Payment confirmed. Order locked with merchant.",
    icon: CheckCircle2,
    statuses: ["priced", "payment_pending_review", "payment_confirmed", "confirmed"],
  },
  {
    id: "preparing",
    stepNumber: 3,
    titleAr: "التجهيز وفحص الجودة",
    titleEn: "Processing & Quality Check",
    descAr: "القطع في مركز الفحص للتأكد من مطابقة المقاس والخامة قبل التغليف.",
    descEn: "Items inspected for quality and packed safely.",
    icon: Package,
    statuses: ["ordered", "preparing"],
  },
  {
    id: "shipped",
    stepNumber: 4,
    titleAr: "الشحن مع المندوب",
    titleEn: "In Transit / Out for Delivery",
    descAr: "الشحنة في طريقها للتوصيل المباشر إلى باب بيتك مع المندوب.",
    descEn: "Package is on the way to your delivery address.",
    icon: Truck,
    statuses: ["shipped"],
  },
  {
    id: "delivered",
    stepNumber: 5,
    titleAr: "تم التوصيل بنجاح",
    titleEn: "Delivered",
    descAr: "تم استلام الطلب وتأكيد رضا العميلة عن المنتجات.",
    descEn: "Package delivered. Enjoy your luxury items!",
    icon: CheckCircle2,
    statuses: ["delivered"],
  },
];

// Helper to determine the current milestone index (0 to 4)
function getStageIndex(status: OrderStatus): number {
  if (status === "cancelled") return -1;
  if (status === "delivered") return 4;
  if (status === "shipped") return 3;
  if (status === "ordered" || status === "preparing") return 2;
  if (["priced", "payment_pending_review", "payment_confirmed", "confirmed"].includes(status)) return 1;
  return 0; // awaiting_calculation, pending
}

export default function OrderShipmentTrackingPage() {
  const params = useParams();
  const orderId = (params?.id as string) || "";
  const router = useRouter();

  const { t, lang, dir, isLangReady } = useLanguage();
  const { formatPrice } = useLocation();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    ordersService
      .getOrderById(orderId)
      .then((data) => {
        if (isMounted) {
          setOrder(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load order tracking:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  if (!isLangReady || loading) {
    return (
      <StandardPageLayout showBack backHref={`/orders/${orderId}`} title={lang === "ar" ? "تتبع الشحنة" : "Track Shipment"}>
        <TrackingPageSkeleton />
      </StandardPageLayout>
    );
  }

  if (!order) {
    return (
      <StandardPageLayout showBack backHref="/orders" title={lang === "ar" ? "تتبع الشحنة" : "Track Shipment"}>
        <div className="p-4 pt-12">
          <EmptyState
            icon={<Truck className="w-6 h-6" />}
            title={lang === "ar" ? "الشحنة غير موجودة" : "Shipment Not Found"}
            description={
              lang === "ar"
                ? "تعذر العثور على بيانات تتبع هذا الطلب، يرجى التأكد من رقم الطلب."
                : "Unable to find tracking information for this order."
            }
            actionText={lang === "ar" ? "العودة لقائمة الطلبات" : "Back to Orders"}
            onAction={() => router.push("/orders")}
          />
        </div>
      </StandardPageLayout>
    );
  }

  const currentStageIndex = getStageIndex(order.status);
  const currentStage = currentStageIndex >= 0 ? MILESTONE_STAGES[currentStageIndex] : null;
  const isCancelled = order.status === "cancelled";

  const formattedDate = new Date(order.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const { formatted: formattedTotal } = formatPrice(order.total || 0);

  const handleWhatsAppTrackingHelp = () => {
    const text = encodeURIComponent(
      lang === "ar"
        ? `مرحباً بيليكو! أرغب في معرفة موعد وصول شحنتي لطلب رقم #${order.id.slice(-6).toUpperCase()}`
        : `Hello Beleco! I would like to inquire about the delivery ETA for order #${order.id.slice(-6).toUpperCase()}`
    );
    window.open(`https://wa.me/201012345678?text=${text}`, "_blank");
  };

  return (
    <StandardPageLayout
      showBack
      backHref={`/orders/${order.id}`}
      title={`${lang === "ar" ? "تتبع شحنة #" : "Tracking #"}${order.id.slice(-6).toUpperCase()}`}
    >
      <div className="shipment-tracking-page flex flex-col gap-4 px-4 pt-2 pb-16 animate-page-enter text-left" dir="ltr">
        {/* Top Tracking Identity Card */}
        <Card className="p-4 bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 border border-primary-200/80 shadow-2xs">
                <Truck className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <Heading variant="editorial-h1" className="text-base font-bold text-brand-neutral-950">
                  {lang === "ar" ? "شحنة رقم #" : "Shipment #"}{order.id.slice(-6).toUpperCase()}
                </Heading>
                <span className="text-[11px] font-sans text-brand-neutral-500 font-medium">
                  {lang === "ar" ? "تاريخ الطلب: " : "Placed on: "}{formattedDate}
                </span>
              </div>
            </div>

            <Link href={`/orders/${order.id}`}>
              <Button variant="secondary" size="sm" className="text-xs rounded-xl font-bold">
                {lang === "ar" ? "الفاتورة" : "Invoice"}
              </Button>
            </Link>
          </div>

          {/* Cancelled Banner or Active Stage Graphic */}
          {isCancelled ? (
            <div className="p-3.5 bg-danger-50 border border-danger-200 rounded-xl flex items-center gap-3 text-danger-700">
              <AlertCircle className="w-5 h-5 shrink-0 text-danger-600" />
              <div className="flex flex-col">
                <span className="text-xs font-bold font-sans">{lang === "ar" ? "تم إلغاء الطلب" : "Order Cancelled"}</span>
                <span className="text-[11px] font-sans text-danger-600">
                  {lang === "ar" ? "تم إيقاف مسار هذه الشحنة." : "This shipment has been cancelled."}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-brand-neutral-50 border border-brand-neutral-200/80 rounded-xl flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-primary-700">
                  <Sparkles className="w-4 h-4 text-primary-500" />
                  <span>{lang === "ar" ? "المرحلة الحالية:" : "Current Stage:"}</span>
                  <span>{lang === "ar" ? currentStage?.titleAr : currentStage?.titleEn}</span>
                </div>

                <Badge variant="primary" size="sm" className="font-mono text-[10px]">
                  {Math.round(((currentStageIndex + 1) / 5) * 100)}%
                </Badge>
              </div>

              <span className="text-xs font-sans text-brand-neutral-600 leading-relaxed">
                {lang === "ar" ? currentStage?.descAr : currentStage?.descEn}
              </span>

              <div className="pt-2 border-t border-brand-neutral-200/60 flex items-center justify-between text-[11px] text-brand-neutral-500">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary-500" />
                  <span>{lang === "ar" ? "المدة المقدرة: 10–17 يوم عمل" : "ETA: 10-17 business days"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{lang === "ar" ? "فحص جودة معتمد" : "Verified Quality"}</span>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Visual Multi-Stage Progress Timeline */}
        {!isCancelled && (
          <div className="flex flex-col gap-2 pt-1">
            <Heading variant="section-title" className="text-xs font-bold text-brand-neutral-500 uppercase tracking-wider px-1">
              {lang === "ar" ? "مراحل الشحن والتسليم" : "Shipment Milestones"}
            </Heading>

            <Card className="p-4 bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs flex flex-col gap-4">
              {MILESTONE_STAGES.map((stage, idx) => {
                const isPassed = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                const StageIcon = stage.icon;

                return (
                  <div key={stage.id} className="relative flex items-start gap-3.5">
                    {/* Vertical connecting line */}
                    {idx < MILESTONE_STAGES.length - 1 && (
                      <div
                        className={`absolute left-4 top-8 bottom-[-16px] w-0.5 -translate-x-1/2 transition-colors ${
                          idx < currentStageIndex ? "bg-primary-500" : "bg-brand-neutral-200"
                        }`}
                      />
                    )}

                    {/* Step Icon Badge */}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                        isCurrent
                          ? "bg-primary-500 text-white ring-4 ring-primary-100 shadow-sm"
                          : isPassed
                          ? "bg-primary-500 text-white"
                          : "bg-brand-neutral-100 text-brand-neutral-400 border border-brand-neutral-200"
                      }`}
                    >
                      <StageIcon className="w-4 h-4 stroke-[2.2]" />
                    </div>

                    {/* Stage Text Details */}
                    <div className="flex-1 flex flex-col pt-0.5 pb-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-sans font-bold ${
                            isCurrent
                              ? "text-primary-700"
                              : isPassed
                              ? "text-brand-neutral-900"
                              : "text-brand-neutral-400"
                          }`}
                        >
                          {lang === "ar" ? stage.titleAr : stage.titleEn}
                        </span>

                        {isCurrent && (
                          <span className="font-sans text-[10px] font-bold bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full border border-primary-200">
                            {lang === "ar" ? "جاري الآن" : "Active"}
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] font-sans text-brand-neutral-500 leading-relaxed mt-0.5">
                        {lang === "ar" ? stage.descAr : stage.descEn}
                      </span>
                    </div>
                  </div>
                );
              })}
            </Card>
          </div>
        )}

        {/* Package Summary & Destination Card */}
        <div className="flex flex-col gap-2 pt-1">
          <Heading variant="section-title" className="text-xs font-bold text-brand-neutral-500 uppercase tracking-wider px-1">
            {lang === "ar" ? "محتويات الشحنة والوجهة" : "Package & Destination"}
          </Heading>

          <Card className="p-4 bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs flex flex-col gap-3">
            {/* Thumbnails of items */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {order.items?.map((item, i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-xl bg-brand-neutral-100 border border-brand-neutral-200 overflow-hidden shrink-0 flex items-center justify-center relative shadow-2xs"
                  title={item.name}
                >
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <Package className="w-5 h-5 text-brand-neutral-400" />
                  )}
                  {item.quantity > 1 && (
                    <span className="absolute bottom-0 right-0 bg-brand-neutral-900 text-white font-mono text-[9px] px-1 rounded-tl">
                      x{item.quantity}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="h-px bg-brand-neutral-100" />

            <div className="flex items-start gap-2.5 text-xs text-brand-neutral-700">
              <MapPin className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="font-bold text-brand-neutral-900">
                  {order.customerInfo?.name || "—"} ({order.customerInfo?.city || order.customerInfo?.governorate || "—"})
                </span>
                <span className="text-[11px] text-brand-neutral-500 mt-0.5">
                  {order.customerInfo?.streetAddress || "—"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-xs border-t border-brand-neutral-100">
              <span className="text-brand-neutral-500 font-sans">{lang === "ar" ? "قيمة الطلب:" : "Order Total:"}</span>
              <span className="font-mono font-bold text-primary-600">{formattedTotal}</span>
            </div>
          </Card>
        </div>

        {/* WhatsApp Real-time Delivery Inquiry */}
        <div className="pt-2">
          <Button
            variant="secondary"
            size="md"
            onClick={handleWhatsAppTrackingHelp}
            leftIcon={<MessageCircle className="w-4 h-4 text-success-600" />}
            className="w-full rounded-2xl font-bold text-xs justify-center border-success-200 text-success-700 hover:bg-success-50"
          >
            {lang === "ar" ? "متابعة موعد التسليم مع المندوب" : "Inquire Delivery Schedule via WhatsApp"}
          </Button>
        </div>
      </div>
    </StandardPageLayout>
  );
}
