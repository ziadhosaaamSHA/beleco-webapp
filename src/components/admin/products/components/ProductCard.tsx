"use client";

import React from "react";
import { Package, Eye, Edit3, Trash2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Product } from "@/types/product.types";
import { Card } from "@/components/ui/Card/Card";
import { Badge } from "@/components/ui/Badge/Badge";
import { Heading } from "@/components/ui/Heading/Heading";

export interface ProductCardProps {
  product: Product;
  onView: (product: Product) => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onView,
  onEdit,
  onDelete,
}) => {
  const { t, lang } = useLanguage();

  return (
    <Card className="p-3.5 flex flex-col justify-between bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs text-left group" dir="ltr">
      <div className="flex gap-3">
        {/* Product Image */}
        <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-brand-neutral-100 border border-brand-neutral-200 shrink-0">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-brand-neutral-400">
              <Package className="w-6 h-6" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="neutral" size="sm" className="font-bold text-[10px]">
                {product.category}
              </Badge>
              {Array.isArray(product.placements) && product.placements.length > 0 ? (
                product.placements.map((p) => (
                  <Badge key={p} variant="primary" size="sm" className="text-[9px]">
                    {p}
                  </Badge>
                ))
              ) : (
                <Badge variant="primary" size="sm" className="text-[9px]">
                  {product.placement || "trend"}
                </Badge>
              )}
            </div>

            <Heading
              variant="card-title"
              className="text-xs font-bold text-brand-neutral-900 line-clamp-2 mt-1"
            >
              {product.name}
            </Heading>
          </div>

          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="font-mono font-extrabold text-sm text-primary-600">
              {product.price} {t("currency.egp")}
            </span>
            {product.originalPrice && (
              <span className="font-mono text-[10px] text-brand-neutral-400 line-through">
                {product.originalPrice}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 3-Button Actions Bar */}
      <div className="grid grid-cols-3 gap-1 mt-2.5 pt-2 border-t border-brand-neutral-100" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={() => onView(product)}
          className="py-1.5 px-1.5 rounded-xl text-brand-neutral-800 bg-brand-neutral-100 hover:bg-brand-neutral-200 active:scale-98 transition-all text-[11px] font-sans font-bold flex items-center justify-center gap-1 border border-brand-neutral-200 cursor-pointer"
        >
          <Eye className="w-3 h-3" />
          <span>{lang === "ar" ? "عرض" : "View"}</span>
        </button>
        <button
          type="button"
          onClick={() => onEdit(product)}
          className="py-1.5 px-1.5 rounded-xl text-primary-700 bg-primary-50 hover:bg-primary-100 active:scale-98 transition-all text-[11px] font-sans font-bold flex items-center justify-center gap-1 border border-primary-200 cursor-pointer"
        >
          <Edit3 className="w-3 h-3" />
          <span>{lang === "ar" ? "تعديل" : "Edit"}</span>
        </button>
        <button
          type="button"
          onClick={() => onDelete(product)}
          className="py-1.5 px-1.5 rounded-xl text-danger-600 bg-danger-50 hover:bg-danger-100 active:scale-98 transition-all text-[11px] font-sans font-bold flex items-center justify-center gap-1 border border-danger-200 cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
          <span>{lang === "ar" ? "حذف" : "Delete"}</span>
        </button>
      </div>
    </Card>
  );
};
