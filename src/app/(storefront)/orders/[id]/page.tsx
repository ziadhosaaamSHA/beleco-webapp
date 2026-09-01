"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Package,
  Truck,
  MapPin,
  Phone,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Calculator,
  Check,
  ShoppingBag,
  ExternalLink,
  MessageCircle,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { StandardPageLayout } from "@/components/layout/StandardPageLayout";
import { Heading } from "@/components/ui/Heading/Heading";
import { Card } from "@/components/ui/Card/Card";
import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { OrdersPageSkeleton } from "@/components/ui/Skeleton/Skeleton";
import { ordersService } from "@/services/orders.service";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import { useToast } from "@/context/ToastContext";
import type { Order, OrderStatus } from "@/types/order.types";

const statusConfig: Record<
  OrderStatus,
  {
    key: string;
    variant: "primary" | "neutral" | "success" | "danger" | "gold";
    icon: React.ComponentType<{ className?: string }>;
    descAr: string;
    descEn: string;
  }
> = {
  awaiting_calculation: {
    key: "status.awaiting_calculation",
    variant: "gold",
    icon: Calculator,
    descAr: "جاري مراجعة طلبك وحساب تكاليف الشحن والجمارك بدقة.",
    descEn: "Your custom order is being priced and calculated.",
  },
  priced: {
    key: "status.priced",
    variant: "primary",
    icon: CreditCard,
    descAr: "تم تسعير الطلب، يرجى تأكيد الدفع أو العربون للبدء في التنفيذ.",
    descEn: "Price calculated. Awaiting payment or deposit confirmation.",
  },
  payment_pending_review: {
    key: "status.payment_pending_review",
    variant: "gold",
    icon: Clock,
    descAr: "تم إرسال إشعار الدفع وجاري التحقق من التحويل من قبل الإدارة.",
    descEn: "Payment proof received. Verifying transfer details.",
  },
  payment_flagged: {
    key: "status.payment_flagged",
    variant: "danger",
    icon: AlertCircle,
    descAr: "تعذر تأكيد التحويل. يرجى التواصل مع فريق الدعم للمساعدة.",
    descEn: "Payment verification issue. Please contact customer care.",
  },
  payment_confirmed: {
    key: "status.payment_confirmed",
    variant: "success",
    icon: CheckCircle2,
    descAr: "تم تأكيد الدفع بنجاح وجاري تجهيز الشحنة لدى المصدر.",
    descEn: "Payment confirmed. Preparing fulfillment with merchant.",
  },
  ordered: {
    key: "status.ordered",
    variant: "primary",
    icon: ShoppingBag,
    descAr: "تم طلب القطع من المتاجر العالمية وبدء الشحن الدولي.",
    descEn: "Items ordered from international stores.",
  },
  pending: {
    key: "status.pending",
    variant: "primary",
    icon: Clock,
    descAr: "الطلب قيد المراجعة والمعالجة في نظام بيليكو.",
    descEn: "Order is pending initial review.",
  },
  confirmed: {
    key: "status.confirmed",
    variant: "neutral",
    icon: Check,
    descAr: "تم تأكيد الطلب وجاري تجميعه في مركز الشحن والتوزيع.",
    descEn: "Order confirmed and queued for fulfillment.",
  },
  preparing: {
    key: "status.preparing",
    variant: "neutral",
    icon: Package,
    descAr: "جاري فحص الجودة وتغليف الشحنة استعداداً للتسليم للمندوب.",
    descEn: "Quality check in progress and packaging for dispatch.",
  },
  shipped: {
    key: "status.shipped",
    variant: "primary",
    icon: Truck,
    descAr: "الشحنة في طريقها مع مندوب التوصيل إلى عنوانك المسجل.",
    descEn: "Package is with courier and out for delivery.",
  },
  delivered: {
    key: "status.delivered",
    variant: "success",
    icon: CheckCircle2,
    descAr: "تم تسليم الطلب بنجاح. نتمنى أن تنال المنتجات إعجابك!",
    descEn: "Order delivered successfully. Enjoy your pieces!",
  },
  cancelled: {
    key: "status.cancelled",
    variant: "danger",
    icon: AlertCircle,
    descAr: "تم إلغاء هذا الطلب. تواصلي معنا في حال وجود أي استفسار.",
    descEn: "This order has been cancelled.",
  },
};

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = (params?.id as string) || "";
  const router = useRouter();

  const { t, lang, dir, isLangReady } = useLanguage();
  const { formatPrice } = useLocation();
  const { showToast } = useToast();

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
        console.error("Failed to load order:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  if (!isLangReady || loading) {
    return (
      <StandardPageLayout showBack backHref="/orders" title={lang === "ar" ? "تفاصيل الطلب" : "Order Details"}>
        <OrdersPageSkeleton />
      </StandardPageLayout>
    );
  }

  if (!order) {
    return (
      <StandardPageLayout showBack backHref="/orders" title={lang === "ar" ? "تفاصيل الطلب" : "Order Details"}>
        <div className="p-4 pt-12">
          <EmptyState
            icon={<Package className="w-6 h-6" />}
            title={lang === "ar" ? "الطلب غير موجود" : "Order Not Found"}
            description={
              lang === "ar"
                ? "تعذر العثور على بيانات هذا الطلب، يرجى التأكد من رقم الطلب."
                : "Unable to find this order. Please verify the order number."
            }
            actionText={lang === "ar" ? "العودة لقائمة الطلبات" : "Back to Orders"}
            onAction={() => router.push("/orders")}
          />
        </div>
      </StandardPageLayout>
    );
  }

  const status = statusConfig[order.status] || statusConfig.awaiting_calculation;
  const StatusIcon = status.icon;

  const formattedDate = new Date(order.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const { formatted: formattedSubtotal } = formatPrice(order.subtotal || 0);
  const { formatted: formattedShipping } = formatPrice(order.shippingFee || 0);
  const { formatted: formattedDiscount } = formatPrice(order.discount || 0);
  const { formatted: formattedTotal } = formatPrice(order.total || 0);

  const handleSupportClick = () => {
    const text = encodeURIComponent(
      lang === "ar"
        ? `مرحباً بيليكو! أرغب في الاستفسار عن طلبي رقم #${order.id.slice(-6).toUpperCase()}`
        : `Hello Beleco! I would like to inquire about my order #${order.id.slice(-6).toUpperCase()}`
    );
    window.open(`https://wa.me/201012345678?text=${text}`, "_blank");
  };

  return (
    <StandardPageLayout
      showBack
      backHref="/orders"
      title={`${lang === "ar" ? "طلب #" : "Order #"}${order.id.slice(-6).toUpperCase()}`}
    >
      <div className="order-details-page flex flex-col gap-4 px-4 pt-2 pb-16 animate-page-enter text-left" dir="ltr">
        {/* Status Highlight Banner Card */}
        <Card className="p-4 bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-brand-neutral-500">
                #{order.id.slice(-8).toUpperCase()}
              </span>
              <span className="text-brand-neutral-300">•</span>
              <span className="text-xs font-sans text-brand-neutral-500 font-medium">
                {formattedDate}
              </span>
            </div>

            <Badge variant={status.variant} size="sm" className="gap-1 shadow-2xs font-sans">
              <StatusIcon className="w-3.5 h-3.5 shrink-0" />
              <span>{t(status.key)}</span>
            </Badge>
          </div>

          <div className="p-3 bg-brand-neutral-50 border border-brand-neutral-200/70 rounded-xl flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white border border-brand-neutral-200 flex items-center justify-center text-primary-600 shrink-0 shadow-2xs">
              <StatusIcon className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-sans font-bold text-brand-neutral-900">
                {lang === "ar" ? "حالة الطلب الحالية" : "Current Order Status"}
              </span>
              <span className="text-[11px] font-sans text-brand-neutral-600 leading-relaxed mt-0.5">
                {lang === "ar" ? status.descAr : status.descEn}
              </span>
            </div>
          </div>

          {/* Direct CTA: Track Shipment */}
          <Link href={`/orders/${order.id}/tracking`} className="w-full">
            <Button
              variant="primary"
              size="md"
              leftIcon={<Truck className="w-4 h-4" />}
              className="w-full rounded-xl font-bold text-xs justify-center shadow-xs"
            >
              {lang === "ar" ? "تتبع مسار الشحنة بالكامل" : "Track Full Shipment Status"}
            </Button>
          </Link>
        </Card>

        {/* Ordered Items List */}
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center justify-between px-1">
            <Heading variant="section-title" className="text-xs font-bold text-brand-neutral-500 uppercase tracking-wider">
              {lang === "ar" ? "المنتجات المطلوبة" : "Ordered Items"} ({order.items?.length || 0})
            </Heading>
          </div>

          <Card className="p-1 flex flex-col bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs divide-y divide-brand-neutral-100">
            {order.items?.map((item, idx) => {
              const { formatted: itemPriceFormatted } = formatPrice(item.price);
              return (
                <div key={`${item.productId}-${idx}`} className="p-3.5 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-brand-neutral-100 border border-brand-neutral-200 overflow-hidden shrink-0 relative flex items-center justify-center">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-brand-neutral-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <span className="text-xs font-sans font-bold text-brand-neutral-900 truncate">
                      {item.name}
                    </span>

                    <div className="flex items-center gap-2 text-[11px] font-sans text-brand-neutral-500">
                      {item.size && (
                        <span>
                          {lang === "ar" ? "المقاس: " : "Size: "}
                          <strong className="text-brand-neutral-700">{item.size}</strong>
                        </span>
                      )}
                      {item.color && (
                        <span>
                          {lang === "ar" ? "اللون: " : "Color: "}
                          <strong className="text-brand-neutral-700">{item.color}</strong>
                        </span>
                      )}
                      <span>
                        {lang === "ar" ? "الكمية: " : "Qty: "}
                        <strong className="text-brand-neutral-700">{item.quantity || 1}</strong>
                      </span>
                    </div>

                    <span className="font-mono font-bold text-xs text-primary-600">
                      {itemPriceFormatted}
                    </span>
                  </div>

                  {item.sourceUrl && (
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl text-brand-neutral-400 hover:text-primary-600 hover:bg-brand-neutral-50 transition-colors"
                      title={lang === "ar" ? "رابط القطعة الأصلي" : "Original Item Link"}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              );
            })}
          </Card>
        </div>

        {/* Shipping Delivery Address Card */}
        <div className="flex flex-col gap-2 pt-1">
          <Heading variant="section-title" className="text-xs font-bold text-brand-neutral-500 uppercase tracking-wider px-1">
            {lang === "ar" ? "بيانات التوصيل والشحن" : "Delivery Address & Contact"}
          </Heading>

          <Card className="p-4 bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs flex flex-col gap-2.5">
            <div className="flex items-center gap-2.5 text-xs text-brand-neutral-900 font-bold">
              <User className="w-4 h-4 text-primary-500 shrink-0" />
              <span>{order.customerInfo?.name || "—"}</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs text-brand-neutral-700 font-mono">
              <Phone className="w-4 h-4 text-primary-500 shrink-0" />
              <span>{order.customerInfo?.phone || "—"}</span>
              {order.customerInfo?.secondaryPhone && (
                <span className="text-brand-neutral-400 text-[11px]">
                  ({order.customerInfo.secondaryPhone})
                </span>
              )}
            </div>

            <div className="flex items-start gap-2.5 text-xs text-brand-neutral-700">
              <MapPin className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="font-bold text-brand-neutral-900">
                  {order.customerInfo?.city || order.customerInfo?.governorate || "—"}
                </span>
                <span className="text-brand-neutral-500 text-[11px] mt-0.5">
                  {order.customerInfo?.streetAddress || "—"}
                  {order.customerInfo?.governorate ? `, ${order.customerInfo.governorate}` : ""}
                </span>
              </div>
            </div>

            {order.customerInfo?.notes && (
              <div className="mt-1 pt-2 border-t border-brand-neutral-100 text-[11px] text-brand-neutral-500">
                <strong>{lang === "ar" ? "ملاحظات: " : "Notes: "}</strong>
                {order.customerInfo.notes}
              </div>
            )}
          </Card>
        </div>

        {/* Financial Summary Breakdown Card */}
        <div className="flex flex-col gap-2 pt-1">
          <Heading variant="section-title" className="text-xs font-bold text-brand-neutral-500 uppercase tracking-wider px-1">
            {lang === "ar" ? "ملخص الفاتورة" : "Payment Summary"}
          </Heading>

          <Card className="p-4 bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs text-brand-neutral-600">
              <span>{lang === "ar" ? "قيمة المنتجات" : "Subtotal"}</span>
              <span className="font-mono font-bold text-brand-neutral-900">{formattedSubtotal}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-brand-neutral-600">
              <span>{lang === "ar" ? "رسوم الشحن والتوصيل" : "Shipping & Delivery"}</span>
              <span className="font-mono font-bold text-brand-neutral-900">
                {order.shippingFee > 0 ? formattedShipping : lang === "ar" ? "مجاني" : "Free"}
              </span>
            </div>

            {order.discount > 0 && (
              <div className="flex items-center justify-between text-xs text-emerald-600">
                <span>{lang === "ar" ? "الخصم" : "Discount"}</span>
                <span className="font-mono font-bold">-{formattedDiscount}</span>
              </div>
            )}

            <div className="h-px bg-brand-neutral-100 my-1" />

            <div className="flex items-center justify-between text-sm font-bold text-brand-neutral-950">
              <span>{lang === "ar" ? "المبلغ الإجمالي" : "Total Amount"}</span>
              <span className="font-mono font-extrabold text-lg text-primary-600 tabular-nums">
                {formattedTotal}
              </span>
            </div>
          </Card>
        </div>

        {/* WhatsApp Customer Support Action */}
        <div className="pt-2">
          <Button
            variant="secondary"
            size="md"
            onClick={handleSupportClick}
            leftIcon={<MessageCircle className="w-4 h-4 text-success-600" />}
            className="w-full rounded-2xl font-bold text-xs justify-center border-success-200 text-success-700 hover:bg-success-50"
          >
            {lang === "ar" ? "استفسار عن هذا الطلب عبر واتساب" : "Inquire via WhatsApp"}
          </Button>
        </div>
      </div>
    </StandardPageLayout>
  );
}
