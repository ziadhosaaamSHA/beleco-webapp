"use client";

import React, { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { ordersService } from "@/services/orders.service";
import { Order, OrderStatus } from "@/types/order.types";
import { Button } from "@/components/ui/Button/Button";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { OrderCard, ALL_ORDER_STATUSES } from "../components/OrderCard";

export interface OrdersListTabProps {
  orders: Order[];
}

export const OrdersListTab: React.FC<OrdersListTabProps> = ({ orders }) => {
  const { t, lang } = useLanguage();
  const { showToast } = useToast();
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<string>("all");

  const handleOrderStatusUpdate = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await ordersService.updateStatus(orderId, newStatus);
      showToast(
        lang === "ar"
          ? `تم تحديث حالة الطلب إلى "${t(`status.${newStatus}`)}"`
          : `Order status updated to "${t(`status.${newStatus}`)}"`,
        "success"
      );
    } catch {
      showToast(lang === "ar" ? "حدث خطأ أثناء تحديث حالة الطلب" : "Error updating order status", "error");
    }
  };

  const filteredOrders = (
    selectedOrderStatus === "all"
      ? orders
      : orders.filter((o) => o.status === selectedOrderStatus)
  )
    .slice()
    .sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0));

  return (
    <div className="flex flex-col gap-4 text-left" dir="ltr">
      {/* Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <Button
          variant={selectedOrderStatus === "all" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setSelectedOrderStatus("all")}
          className="rounded-xl font-bold text-xs shrink-0"
        >
          {t("admin.orders.filterAll")} ({orders.length})
        </Button>
        {ALL_ORDER_STATUSES.map((st) => (
          <Button
            key={st}
            variant={selectedOrderStatus === st ? "primary" : "secondary"}
            size="sm"
            onClick={() => setSelectedOrderStatus(st)}
            className="rounded-xl font-bold text-xs shrink-0"
          >
            {t(`status.${st}`)} ({orders.filter((o) => o.status === st).length})
          </Button>
        ))}
      </div>

      {/* Orders List */}
      <div className="flex flex-col gap-3">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((ord) => (
            <OrderCard
              key={ord.id}
              order={ord}
              onUpdateStatus={handleOrderStatusUpdate}
            />
          ))
        ) : (
          <EmptyState
            icon={<ShoppingBag className="w-6 h-6" />}
            title={t("admin.orders.noOrders")}
            description={
              lang === "ar"
                ? "لا توجد طلبات مسجلة بهذه الحالة حالياً"
                : "No orders found under this status"
            }
          />
        )}
      </div>
    </div>
  );
};
