"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, Copy, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { useLocation } from "@/context/LocationContext";
import { Order, OrderStatus } from "@/types/order.types";
import { Card } from "@/components/ui/Card/Card";
import { Badge } from "@/components/ui/Badge/Badge";
import { Heading } from "@/components/ui/Heading/Heading";

export const ALL_ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "priced",
  "payment_pending_review",
  "payment_confirmed",
  "ordered",
  "shipped",
  "delivered",
  "cancelled",
];

export function getOrderStatusBadgeVariant(
  status: OrderStatus
): "primary" | "neutral" | "success" | "danger" | "gold" {
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
}

export interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order, onUpdateStatus }) => {
  const { t, lang } = useLanguage();
  const { formatPrice } = useLocation();
  const { showToast } = useToast();
  const [copied, setCopied] = React.useState(false);

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopied(true);
    showToast(lang === "ar" ? "تم نسخ رقم الهاتف" : "Phone number copied", "info");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-4 flex flex-col gap-3 bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs text-left" dir="ltr">
      {/* Header: Customer Info & Total */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col">
          <Heading variant="card-title" className="text-sm font-bold text-brand-neutral-900">
            {order.customerInfo?.name || (order as any).customerName || "Customer"}
          </Heading>
          {order.customerInfo?.phone && (
            <button
              type="button"
              onClick={() => handleCopyPhone(order.customerInfo!.phone)}
              className="inline-flex items-center gap-1 text-xs font-mono text-brand-neutral-500 hover:text-primary-600 mt-0.5 w-fit"
              title="Click to copy phone"
            >
              <span>{order.customerInfo.phone}</span>
              {copied ? (
                <Check className="w-3 h-3 text-success-600" />
              ) : (
                <Copy className="w-3 h-3 text-brand-neutral-400" />
              )}
            </button>
          )}
          <span className="text-xs font-sans text-brand-neutral-600 mt-0.5">
            {order.customerInfo?.governorate || ""}
            {order.customerInfo?.city ? ` • ${order.customerInfo.city}` : ""}
            {order.customerInfo?.streetAddress ? ` • ${order.customerInfo.streetAddress}` : ""}
          </span>
          {order.customerInfo?.notes && (
            <span className="text-[11px] font-sans text-brand-neutral-500 italic mt-1 bg-brand-neutral-50 p-1.5 rounded-lg border border-brand-neutral-100">
              {lang === "ar" ? `ملاحظات: ${order.customerInfo.notes}` : `Notes: ${order.customerInfo.notes}`}
            </span>
          )}
        </div>

        <div className="flex flex-col items-end">
          <span className="font-mono font-extrabold text-base text-primary-600">
            {formatPrice(order.total || 0).formatted}
          </span>
          <Badge
            variant={getOrderStatusBadgeVariant(order.status)}
            size="sm"
            className="mt-1 font-sans"
          >
            {t(`status.${order.status}`)}
          </Badge>
          <Link
            href={`/orders/${order.id}/tracking`}
            className="inline-flex items-center gap-1 text-[11px] font-sans font-bold text-primary-600 hover:underline mt-1.5"
          >
            <span>{lang === "ar" ? "تتبع الشحنة" : "Track Order"}</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Order Items Preview */}
      {order.items && order.items.length > 0 && (
        <div className="p-2.5 rounded-xl bg-brand-neutral-50 border border-brand-neutral-100 flex flex-col gap-1.5 text-xs font-sans">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-brand-neutral-700">
              <span className="truncate max-w-[200px]">
                {item.name} {item.size ? `(${item.size})` : ""} {item.color ? `• ${item.color}` : ""}
              </span>
              <span className="font-mono font-bold">
                {item.quantity}x {formatPrice(item.price).formatted}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Status Changer Actions */}
      <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-brand-neutral-100">
        {ALL_ORDER_STATUSES.map((st) => (
          <button
            key={st}
            onClick={() => onUpdateStatus(order.id, st)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-sans font-bold border transition-all cursor-pointer ${
              order.status === st
                ? "bg-primary-500 text-white border-primary-500 shadow-xs"
                : "bg-brand-neutral-50 text-brand-neutral-700 border-brand-neutral-200 hover:bg-brand-neutral-100"
            }`}
          >
            {t(`status.${st}`)}
          </button>
        ))}
      </div>
    </Card>
  );
};
