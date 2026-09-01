"use client";

import React, { useState, useMemo } from "react";
import {
  ShoppingBag,
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Phone,
  Filter,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { ordersService } from "@/services/orders.service";
import { Order, OrderStatus } from "@/types/order.types";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { Card } from "@/components/ui/Card/Card";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { OrderCard, ALL_ORDER_STATUSES } from "../components/OrderCard";

export interface OrdersListTabProps {
  orders: Order[];
}

type SortOption = "newest" | "oldest" | "price_desc" | "price_asc";

export const OrdersListTab: React.FC<OrdersListTabProps> = ({ orders }) => {
  const { t, lang } = useLanguage();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<string>("all");
  const [pricePreset, setPricePreset] = useState<string>("all");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

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
      showToast(
        lang === "ar" ? "حدث خطأ أثناء تحديث حالة الطلب" : "Error updating order status",
        "error"
      );
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedOrderStatus("all");
    setPricePreset("all");
    setMinPrice("");
    setMaxPrice("");
    setSortOption("newest");
  };

  const isFiltersActive =
    Boolean(searchQuery.trim()) ||
    selectedOrderStatus !== "all" ||
    pricePreset !== "all" ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    sortOption !== "newest";

  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        // 1. Status Filter
        if (selectedOrderStatus !== "all" && o.status !== selectedOrderStatus) {
          return false;
        }

        // 2. Search Query (phone, name, id, items, city)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim().replace(/[\s-+]/g, "");
          const cleanPhone = (o.customerInfo?.phone || "").replace(/[\s-+]/g, "");
          const cleanSecondaryPhone = (o.customerInfo?.secondaryPhone || "").replace(/[\s-+]/g, "");
          const customerName = (o.customerInfo?.name || "").toLowerCase();
          const orderId = (o.id || "").toLowerCase();
          const city = (o.customerInfo?.city || "").toLowerCase();
          const governorate = (o.customerInfo?.governorate || "").toLowerCase();
          const itemNames = (o.items || []).map((i) => (i.name || "").toLowerCase()).join(" ");

          const matches =
            cleanPhone.includes(q) ||
            cleanSecondaryPhone.includes(q) ||
            customerName.includes(searchQuery.toLowerCase().trim()) ||
            orderId.includes(searchQuery.toLowerCase().trim()) ||
            city.includes(searchQuery.toLowerCase().trim()) ||
            governorate.includes(searchQuery.toLowerCase().trim()) ||
            itemNames.includes(searchQuery.toLowerCase().trim());

          if (!matches) return false;
        }

        // 3. Price Preset or Custom Range Filter
        const total = Number(o.total) || 0;
        if (pricePreset === "under500" && total >= 500) return false;
        if (pricePreset === "500_1000" && (total < 500 || total > 1000)) return false;
        if (pricePreset === "1000_2000" && (total < 1000 || total > 2000)) return false;
        if (pricePreset === "above2000" && total <= 2000) return false;

        if (minPrice && total < parseFloat(minPrice)) return false;
        if (maxPrice && total > parseFloat(maxPrice)) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortOption === "newest") {
          return (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0);
        }
        if (sortOption === "oldest") {
          return (Number(a.createdAt) || 0) - (Number(b.createdAt) || 0);
        }
        if (sortOption === "price_desc") {
          return (Number(b.total) || 0) - (Number(a.total) || 0);
        }
        if (sortOption === "price_asc") {
          return (Number(a.total) || 0) - (Number(b.total) || 0);
        }
        return 0;
      });
  }, [orders, selectedOrderStatus, searchQuery, pricePreset, minPrice, maxPrice, sortOption]);

  return (
    <div className="flex flex-col gap-3.5 text-left" dir="ltr">
      {/* 1. Search Bar & Filter Toggle */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === "ar"
                ? "بحث برقم الهاتف، اسم العميل، أو رقم الطلب..."
                : "Search by phone, customer name, order ID..."
            }
            leftIcon={<Search className="w-4 h-4 text-brand-neutral-400" />}
            className="w-full bg-white shadow-2xs text-xs"
            aria-label="Search orders"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-brand-neutral-400 hover:text-brand-neutral-700 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <Button
          variant={showFiltersPanel || isFiltersActive ? "primary" : "secondary"}
          size="md"
          onClick={() => setShowFiltersPanel(!showFiltersPanel)}
          leftIcon={<SlidersHorizontal className="w-4 h-4" />}
          className="rounded-xl font-bold text-xs shrink-0 bg-white"
        >
          {lang === "ar" ? "فلترة" : "Filters"}
        </Button>
      </div>

      {/* 2. Expandable Filter Panel */}
      {showFiltersPanel && (
        <Card className="p-3.5 flex flex-col gap-3 bg-white border border-brand-neutral-200/90 shadow-2xs rounded-2xl animate-in fade-in-50 zoom-in-98 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-brand-neutral-100">
            <span className="text-xs font-sans font-bold text-brand-neutral-900 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-primary-600" />
              <span>{lang === "ar" ? "تخصيص الفلترة والترتيب" : "Filter & Sort Options"}</span>
            </span>
            {isFiltersActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-sans font-bold text-danger-600 hover:underline"
              >
                {lang === "ar" ? "إلغاء كل الفلاتر" : "Reset All"}
              </button>
            )}
          </div>

          {/* Price Range Presets */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-sans font-bold text-brand-neutral-700">
              {lang === "ar" ? "نطاق السعر الإجمالي (EGP)" : "Total Price Range (EGP)"}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "all", labelAr: "كل الأسعار", labelEn: "All Prices" },
                { id: "under500", labelAr: "أقل من 500", labelEn: "< 500" },
                { id: "500_1000", labelAr: "500 - 1000", labelEn: "500 - 1000" },
                { id: "1000_2000", labelAr: "1000 - 2000", labelEn: "1000 - 2000" },
                { id: "above2000", labelAr: "أكثر من 2000", labelEn: "2000+" },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setPricePreset(p.id);
                    setMinPrice("");
                    setMaxPrice("");
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-sans font-bold border transition-all ${
                    pricePreset === p.id
                      ? "bg-primary-50 text-primary-700 border-primary-400 shadow-2xs"
                      : "bg-brand-neutral-50 text-brand-neutral-600 border-brand-neutral-200 hover:bg-brand-neutral-100"
                  }`}
                >
                  {lang === "ar" ? p.labelAr : p.labelEn}
                </button>
              ))}
            </div>

            {/* Custom Min / Max Price Inputs */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Input
                type="number"
                placeholder={lang === "ar" ? "أقل سعر" : "Min Price"}
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setPricePreset("custom");
                }}
                suffix="EGP"
                className="bg-brand-neutral-50/70 text-xs"
              />
              <Input
                type="number"
                placeholder={lang === "ar" ? "أعلى سعر" : "Max Price"}
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setPricePreset("custom");
                }}
                suffix="EGP"
                className="bg-brand-neutral-50/70 text-xs"
              />
            </div>
          </div>

          {/* Sort By Dropdown */}
          <div className="flex flex-col gap-1.5 pt-1 border-t border-brand-neutral-100">
            <label className="text-[11px] font-sans font-bold text-brand-neutral-700 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-brand-neutral-500" />
              <span>{lang === "ar" ? "ترتيب النتائج حسب:" : "Sort Orders By:"}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { id: "newest", labelAr: "الأحدث أولاً", labelEn: "Newest First" },
                { id: "oldest", labelAr: "الأقدم أولاً", labelEn: "Oldest First" },
                { id: "price_desc", labelAr: "الأعلى سعراً", labelEn: "Highest Price" },
                { id: "price_asc", labelAr: "الأقل سعراً", labelEn: "Lowest Price" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSortOption(s.id as SortOption)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-sans font-bold border text-center transition-all ${
                    sortOption === s.id
                      ? "bg-brand-neutral-900 text-white border-brand-neutral-900 shadow-2xs"
                      : "bg-brand-neutral-50 text-brand-neutral-600 border-brand-neutral-200 hover:bg-brand-neutral-100"
                  }`}
                >
                  {lang === "ar" ? s.labelAr : s.labelEn}
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* 3. Status Filter Tabs */}
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

      {/* 4. Results Count and Reset Badge */}
      <div className="flex items-center justify-between px-1 text-xs font-sans">
        <span className="text-brand-neutral-500 font-medium">
          {lang === "ar"
            ? `عرض ${filteredOrders.length} من إجمالي ${orders.length} طلب`
            : `Showing ${filteredOrders.length} of ${orders.length} orders`}
        </span>
        {isFiltersActive && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-primary-600 font-bold hover:underline"
          >
            {lang === "ar" ? "مسح التصفية" : "Clear filters"}
          </button>
        )}
      </div>

      {/* 5. Orders List */}
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
                ? "لا توجد طلبات مطابقة للبحث أو الفلاتر المحددة"
                : "No orders match your search or selected filters"
            }
            actionText={isFiltersActive ? (lang === "ar" ? "إعادة تعيين الفلاتر" : "Reset Filters") : undefined}
            onAction={isFiltersActive ? handleResetFilters : undefined}
          />
        )}
      </div>
    </div>
  );
};
