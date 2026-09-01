"use client";

import React, { useState, useMemo } from "react";
import {
  Package,
  TrendingUp,
  Users,
  Calendar,
  Search,
  X,
  SlidersHorizontal,
  CreditCard,
  RotateCcw,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { BazaarSale } from "@/types/bazaar.types";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { Heading } from "@/components/ui/Heading/Heading";
import { StatSummaryCard } from "@/components/cards/StatSummaryCard";
import { BazaarSaleCard } from "@/components/cards/BazaarSaleCard";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";

export interface ReportsTabProps {
  sales: BazaarSale[];
  onRefundSale: (sale: BazaarSale) => void;
}

type DatePreset = "all" | "today" | "yesterday" | "7days" | "month" | "specific";

export const ReportsTab: React.FC<ReportsTabProps> = ({ sales, onRefundSale }) => {
  const { t, lang } = useLanguage();

  const [datePreset, setDatePreset] = useState<DatePreset>("all");
  const [specificDate, setSpecificDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Helper to format date string YYYY-MM-DD from timestamp
  const getLocalDateString = (timestamp: number) => {
    const d = new Date(timestamp);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleResetFilters = () => {
    setDatePreset("all");
    setSearchQuery("");
    setPaymentMethodFilter("all");
  };

  const isFiltersActive =
    datePreset !== "all" ||
    Boolean(searchQuery.trim()) ||
    paymentMethodFilter !== "all";

  // Filter sales
  const filteredSales = useMemo(() => {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

    const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

    return sales
      .filter((s) => {
        const saleTimestamp = Number(s.soldAt) || 0;
        const saleDateStr = getLocalDateString(saleTimestamp);

        // 1. Date Preset Filtering
        if (datePreset === "today" && saleDateStr !== todayStr) return false;
        if (datePreset === "yesterday" && saleDateStr !== yesterdayStr) return false;
        if (datePreset === "7days" && saleTimestamp < sevenDaysAgo) return false;
        if (datePreset === "month" && saleTimestamp < startOfMonth) return false;
        if (datePreset === "specific" && saleDateStr !== specificDate) return false;

        // 2. Search query (product name, seller, payment method, id)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const prodName = (s.productName || "").toLowerCase();
          const seller = (s.seller || "").toLowerCase();
          const id = (s.id || "").toLowerCase();

          if (!prodName.includes(q) && !seller.includes(q) && !id.includes(q)) {
            return false;
          }
        }

        // 3. Payment Method Filter
        if (paymentMethodFilter !== "all" && s.paymentMethod !== paymentMethodFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => (Number(b.soldAt) || 0) - (Number(a.soldAt) || 0));
  }, [sales, datePreset, specificDate, searchQuery, paymentMethodFilter]);

  // Dynamically calculated stats for the current filter/date selection
  const totalSoldPieces = filteredSales.length;
  const totalRevenue = filteredSales.reduce((sum, s) => sum + (s.finalPrice || 0), 0);

  const sellerBreakdown: Record<string, { count: number; revenue: number }> = useMemo(() => {
    const breakdown: Record<string, { count: number; revenue: number }> = {};
    filteredSales.forEach((s) => {
      const name = s.seller || (lang === "ar" ? "غير معروف" : "Unknown");
      breakdown[name] = breakdown[name] || { count: 0, revenue: 0 };
      breakdown[name].count += 1;
      breakdown[name].revenue += s.finalPrice || 0;
    });
    return breakdown;
  }, [filteredSales, lang]);

  return (
    <div className="flex flex-col gap-3.5 text-left" dir="ltr">
      {/* 1. Date Filter Header & Selector Bar */}
      <Card className="p-3.5 flex flex-col gap-3 bg-white border border-brand-neutral-200/90 shadow-2xs rounded-2xl">
        <div className="flex items-center justify-between pb-1 border-b border-brand-neutral-100">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-primary-600" />
            <Heading variant="card-title" className="text-xs sm:text-sm font-bold text-brand-neutral-900">
              {lang === "ar" ? "تحديد تاريخ المبيعات والتقرير" : "Sales Date & Period Filter"}
            </Heading>
          </div>
          {isFiltersActive && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] font-sans font-bold text-danger-600 hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>{lang === "ar" ? "إلغاء التصفية" : "Reset"}</span>
            </button>
          )}
        </div>

        {/* Date Presets Row */}
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: "all", labelAr: "كل الأوقات", labelEn: "All Time" },
            { id: "today", labelAr: "مبيعات اليوم", labelEn: "Today" },
            { id: "yesterday", labelAr: "أمس", labelEn: "Yesterday" },
            { id: "7days", labelAr: "آخر 7 أيام", labelEn: "Last 7 Days" },
            { id: "month", labelAr: "هذا الشهر", labelEn: "This Month" },
            { id: "specific", labelAr: "تاريخ محدد 📅", labelEn: "Specific Date 📅" },
          ].map((dp) => (
            <button
              key={dp.id}
              type="button"
              onClick={() => setDatePreset(dp.id as DatePreset)}
              className={`px-3 py-1.5 rounded-xl text-xs font-sans font-bold border transition-all ${
                datePreset === dp.id
                  ? "bg-primary-50 text-primary-700 border-primary-400 shadow-2xs"
                  : "bg-brand-neutral-50 text-brand-neutral-600 border-brand-neutral-200 hover:bg-brand-neutral-100"
              }`}
            >
              {lang === "ar" ? dp.labelAr : dp.labelEn}
            </button>
          ))}
        </div>

        {/* Specific Date Picker Input */}
        {datePreset === "specific" && (
          <div className="p-3 bg-brand-neutral-50/90 rounded-xl border border-brand-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-2 animate-in fade-in-50 zoom-in-98 duration-150">
            <span className="text-xs font-sans font-bold text-brand-neutral-700">
              {lang === "ar" ? "اختاري اليوم المحدد:" : "Select Specific Date:"}
            </span>
            <input
              type="date"
              value={specificDate}
              onChange={(e) => setSpecificDate(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-white border border-brand-neutral-300 text-xs font-mono font-bold text-brand-neutral-900 outline-none focus:border-primary-500 cursor-pointer shadow-2xs"
            />
          </div>
        )}
      </Card>

      {/* 2. Top Stat Cards (Dynamically Calculated) */}
      <div className="flex gap-2.5">
        <StatSummaryCard
          label={
            datePreset === "today"
              ? (lang === "ar" ? "مبيعات اليوم (قطع)" : "Today's Pieces")
              : datePreset === "specific"
              ? (lang === "ar" ? `قطع يوم ${specificDate}` : `Pieces on ${specificDate}`)
              : t("admin.bazaar.totalSold")
          }
          value={totalSoldPieces}
          suffix={lang === "ar" ? "قطعة" : "items"}
          icon={<Package className="w-4 h-4 text-primary-500" />}
        />
        <StatSummaryCard
          label={
            datePreset === "today"
              ? (lang === "ar" ? "إيراد اليوم الإجمالي" : "Today's Revenue")
              : datePreset === "specific"
              ? (lang === "ar" ? `إيراد يوم ${specificDate}` : `Revenue on ${specificDate}`)
              : t("admin.bazaar.totalRevenue")
          }
          value={totalRevenue}
          suffix={t("currency.egp")}
          icon={<TrendingUp className="w-4 h-4 text-success-600" />}
        />
      </div>

      {/* 3. Search & Additional Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === "ar"
                ? "بحث باسم القطعة أو البائعة..."
                : "Search item name or seller..."
            }
            leftIcon={<Search className="w-4 h-4 text-brand-neutral-400" />}
            className="w-full bg-white shadow-2xs text-xs"
            aria-label="Search sales"
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
          variant={showFiltersPanel || paymentMethodFilter !== "all" ? "primary" : "secondary"}
          size="md"
          onClick={() => setShowFiltersPanel(!showFiltersPanel)}
          leftIcon={<SlidersHorizontal className="w-4 h-4" />}
          className="rounded-xl font-bold text-xs shrink-0 bg-white"
        >
          {lang === "ar" ? "الدفع" : "Payment"}
        </Button>
      </div>

      {/* Payment Method Filter */}
      {showFiltersPanel && (
        <Card className="p-3 flex flex-col gap-2 bg-white border border-brand-neutral-200/90 shadow-2xs rounded-2xl animate-in fade-in-50 zoom-in-98 duration-150">
          <label className="text-[11px] font-sans font-bold text-brand-neutral-700 flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-primary-500" />
            <span>{lang === "ar" ? "طريقة الدفع المسجلة:" : "Payment Method:"}</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "all", labelAr: "الكل", labelEn: "All" },
              { id: "cash", labelAr: "كاش (نقد)", labelEn: "Cash" },
              { id: "instapay", labelAr: "إنستاباي (Instapay)", labelEn: "Instapay" },
              { id: "card", labelAr: "بطاقة بنكية (Card)", labelEn: "Card" },
            ].map((pm) => (
              <button
                key={pm.id}
                type="button"
                onClick={() => setPaymentMethodFilter(pm.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-sans font-bold border transition-all ${
                  paymentMethodFilter === pm.id
                    ? "bg-primary-50 text-primary-700 border-primary-400 shadow-2xs"
                    : "bg-brand-neutral-50 text-brand-neutral-600 border-brand-neutral-200 hover:bg-brand-neutral-100"
                }`}
              >
                {lang === "ar" ? pm.labelAr : pm.labelEn}
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* 4. Seller Performance Breakdown */}
      <Card className="p-4 flex flex-col gap-3 bg-white border border-brand-neutral-200/90 shadow-2xs rounded-2xl">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary-500" />
          <Heading variant="card-title" className="text-sm font-bold">
            {t("admin.bazaar.sellerPerformance")}
          </Heading>
        </div>
        {Object.keys(sellerBreakdown).length > 0 ? (
          <div className="flex flex-col gap-2">
            {Object.keys(sellerBreakdown).map((name) => (
              <div
                key={name}
                className="flex items-center justify-between p-2.5 rounded-xl bg-brand-neutral-50 border border-brand-neutral-200 text-xs font-sans"
              >
                <span className="font-bold text-brand-neutral-800">{name}</span>
                <span className="font-mono font-bold text-primary-600">
                  {sellerBreakdown[name].count} {lang === "ar" ? "قطعة" : "items"} — {sellerBreakdown[name].revenue} {t("currency.egp")}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs font-sans text-brand-neutral-400 text-center py-4">
            {lang === "ar" ? "لا توجد عمليات بيع مسجلة في هذا التاريخ" : "No sales recorded in this date"}
          </p>
        )}
      </Card>

      {/* 5. Sales Records List */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <Heading variant="section-title" className="text-xs sm:text-sm font-bold text-brand-neutral-900">
            {lang === "ar"
              ? `سجل العمليات (${filteredSales.length} من ${sales.length})`
              : `Sales Records (${filteredSales.length} of ${sales.length})`}
          </Heading>
          {isFiltersActive && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-primary-600 font-bold hover:underline"
            >
              {lang === "ar" ? "مسح التصفية" : "Clear filters"}
            </button>
          )}
        </div>

        {filteredSales.length > 0 ? (
          <div className="flex flex-col gap-2">
            {filteredSales.map((sale) => (
              <BazaarSaleCard key={sale.id} sale={sale} onRefund={onRefundSale} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Package className="w-6 h-6" />}
            title={lang === "ar" ? "لا توجد مبيعات مسجلة في هذا التاريخ" : "No sales for selected date"}
            description={
              lang === "ar"
                ? "اختاري تاريخاً آخر من الفلاتر بالأعلى أو امسحي التصفية"
                : "Select another date from the filters above or reset filters"
            }
            actionText={isFiltersActive ? (lang === "ar" ? "عرض كل المبيعات" : "View All Sales") : undefined}
            onAction={isFiltersActive ? handleResetFilters : undefined}
          />
        )}
      </div>
    </div>
  );
};
