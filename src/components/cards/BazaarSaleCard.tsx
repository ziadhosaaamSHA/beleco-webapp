import React from "react";
import { RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import type { BazaarSale } from "@/types/bazaar.types";

interface BazaarSaleCardProps {
  sale: BazaarSale;
  onRefund: (sale: BazaarSale) => void;
  isRefunding?: boolean;
}

export const BazaarSaleCard: React.FC<BazaarSaleCardProps> = ({
  sale,
  onRefund,
  isRefunding = false,
}) => {
  const timeStr = sale.soldAt
    ? new Date(sale.soldAt).toLocaleTimeString("ar-EG", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  return (
    <Card className="p-3 flex items-center justify-between gap-3 bg-white">
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-sans font-bold text-sm text-brand-neutral-900 truncate">
            {sale.productName}
          </span>
          {sale.discount > 0 && (
            <span className="text-[11px] font-sans font-bold text-danger-500 shrink-0">
              (خصم {sale.discount} ج.م)
            </span>
          )}
        </div>
        <div className="text-[11px] font-sans text-brand-neutral-500 mt-0.5">
          {sale.seller || "غير معروف"} {timeStr && `· ${timeStr}`}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-baseline gap-1 text-right">
          <span className="font-mono font-bold text-base text-primary-500 tabular-nums">
            {sale.finalPrice}
          </span>
          <span className="text-[11px] font-sans text-brand-neutral-500">
            ج.م
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          isLoading={isRefunding}
          onClick={() => onRefund(sale)}
          className="text-xs text-danger-500 border-danger-500/30 hover:bg-danger-50 hover:text-danger-700 h-8 px-2.5 rounded-lg"
          leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          استرجاع
        </Button>
      </div>
    </Card>
  );
};
