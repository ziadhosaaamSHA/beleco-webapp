"use client";

import React from "react";
import { Package, Clock, CheckCircle2, Truck, AlertCircle, Calculator, Check, CreditCard, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/Card/Card";
import { Badge } from "@/components/ui/Badge/Badge";
import { Heading } from "@/components/ui/Heading/Heading";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import type { Order, OrderStatus } from "@/types/order.types";

interface CustomerOrderCardProps {
  order: Order;
  onViewDetails?: (order: Order) => void;
}

const statusConfig: Record<
  OrderStatus,
  {
    key: string;
    variant: "primary" | "neutral" | "success" | "danger" | "gold";
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  awaiting_calculation: { key: "status.awaiting_calculation", variant: "gold", icon: Calculator },
  priced: { key: "status.priced", variant: "primary", icon: CreditCard },
  payment_pending_review: { key: "status.payment_pending_review", variant: "gold", icon: Clock },
  payment_flagged: { key: "status.payment_flagged", variant: "danger", icon: AlertCircle },
  payment_confirmed: { key: "status.payment_confirmed", variant: "success", icon: CheckCircle2 },
  ordered: { key: "status.ordered", variant: "primary", icon: ShoppingBag },
  pending: { key: "status.pending", variant: "primary", icon: Clock },
  confirmed: { key: "status.confirmed", variant: "neutral", icon: Check },
  preparing: { key: "status.preparing", variant: "neutral", icon: Package },
  shipped: { key: "status.shipped", variant: "primary", icon: Truck },
  delivered: { key: "status.delivered", variant: "success", icon: CheckCircle2 },
  cancelled: { key: "status.cancelled", variant: "danger", icon: AlertCircle },
};

export const CustomerOrderCard: React.FC<CustomerOrderCardProps> = ({ order, onViewDetails }) => {
  const { t, lang } = useLanguage();
  const { formatPrice } = useLocation();
  const status = statusConfig[order.status] || statusConfig.awaiting_calculation;
  const StatusIcon = status.icon;

  const formattedDate = new Date(order.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const { formatted: formattedTotal } = formatPrice(order.total);

  return (
    <Card
      variant="interactive"
      onClick={() => onViewDetails?.(order)}
      className="p-4 flex flex-col gap-3 bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs text-left"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-brand-neutral-100 border border-brand-neutral-200 flex items-center justify-center text-brand-neutral-800 shrink-0">
            <Package className="w-4.5 h-4.5" />
          </div>
          <div>
            <Heading variant="card-title" className="text-sm font-bold text-brand-neutral-950">
              {lang === "ar" ? "طلب #" : "Order #"}{order.id.slice(-6).toUpperCase()}
            </Heading>
            <span className="text-[11px] font-mono text-brand-neutral-500">
              {formattedDate}
            </span>
          </div>
        </div>

        <Badge variant={status.variant} size="sm" className="gap-1 shadow-2xs font-sans">
          <StatusIcon className="w-3 h-3 shrink-0" />
          <span>{t(status.key)}</span>
        </Badge>
      </div>

      <div className="py-2.5 border-y border-brand-neutral-100 flex items-center justify-between text-xs font-sans text-brand-neutral-600">
        <span>
          {order.items?.length || 0} {lang === "ar" ? "منتجات" : "items"}
        </span>
        <span className="truncate max-w-[190px]">
          {lang === "ar" ? "الشحن إلى: " : "Ship to: "}
          {order.customerInfo?.city || order.customerInfo?.governorate || "العنوان"}
        </span>
      </div>

      <div className="flex items-center justify-between pt-0.5">
        <span className="text-xs font-sans font-medium text-brand-neutral-500">
          {lang === "ar" ? "الإجمالي" : "Total"}
        </span>
        <span className="font-mono font-extrabold text-base text-primary-600 tabular-nums">
          {formattedTotal}
        </span>
      </div>
    </Card>
  );
};
