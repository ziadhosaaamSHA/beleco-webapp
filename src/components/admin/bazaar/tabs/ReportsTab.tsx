"use client";

import React from "react";
import { Package, TrendingUp, Users } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { BazaarSale } from "@/types/bazaar.types";
import { Card } from "@/components/ui/Card/Card";
import { Heading } from "@/components/ui/Heading/Heading";
import { StatSummaryCard } from "@/components/cards/StatSummaryCard";
import { BazaarSaleCard } from "@/components/cards/BazaarSaleCard";

export interface ReportsTabProps {
  sales: BazaarSale[];
  onRefundSale: (sale: BazaarSale) => void;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({ sales, onRefundSale }) => {
  const { t, lang } = useLanguage();

  const totalSoldPieces = sales.length;
  const totalRevenue = sales.reduce((sum, s) => sum + (s.finalPrice || 0), 0);

  const sellerBreakdown: Record<string, { count: number; revenue: number }> = {};
  sales.forEach((s) => {
    const name = s.seller || (lang === "ar" ? "غير معروف" : "Unknown");
    sellerBreakdown[name] = sellerBreakdown[name] || { count: 0, revenue: 0 };
    sellerBreakdown[name].count += 1;
    sellerBreakdown[name].revenue += s.finalPrice || 0;
  });

  return (
    <div className="flex flex-col gap-4 text-left" dir="ltr">
      {/* Top Stat Cards */}
      <div className="flex gap-2.5">
        <StatSummaryCard
          label={t("admin.bazaar.totalSold")}
          value={totalSoldPieces}
          suffix={lang === "ar" ? "قطعة" : "items"}
          icon={<Package className="w-4 h-4 text-primary-500" />}
        />
        <StatSummaryCard
          label={t("admin.bazaar.totalRevenue")}
          value={totalRevenue}
          suffix={t("currency.egp")}
          icon={<TrendingUp className="w-4 h-4 text-success-600" />}
        />
      </div>

      {/* Seller Performance Breakdown */}
      <Card className="p-4 flex flex-col gap-3 bg-white">
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
            {t("admin.bazaar.noSales")}
          </p>
        )}
      </Card>

      {/* All Sales Records */}
      <div className="flex flex-col gap-2">
        <Heading variant="section-title" className="text-sm font-bold text-brand-neutral-900">
          {t("admin.bazaar.allSalesRecords")} ({sales.length})
        </Heading>
        {sales.length > 0 ? (
          <div className="flex flex-col gap-2">
            {sales.map((sale) => (
              <BazaarSaleCard key={sale.id} sale={sale} onRefund={onRefundSale} />
            ))}
          </div>
        ) : (
          <p className="text-xs font-sans text-brand-neutral-400 text-center py-6">
            {t("admin.bazaar.noSales")}
          </p>
        )}
      </div>
    </div>
  );
};
