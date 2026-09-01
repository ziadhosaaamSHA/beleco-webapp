"use client";

import React from "react";
import Link from "next/link";
import { Package, Ruler, Palette, ExternalLink, Edit3, Trash2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { Product } from "@/types/product.types";
import { Modal } from "@/components/ui/Modal/Modal";
import { Badge } from "@/components/ui/Badge/Badge";
import { Heading } from "@/components/ui/Heading/Heading";
import { Button } from "@/components/ui/Button/Button";

export interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  const { t, lang } = useLanguage();

  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lang === "ar" ? "تفاصيل المنتج في المتجر" : "Storefront Product Details"}
      icon={<Package className="w-4 h-4" />}
      maxWidth="md"
      footer={
        <div className="grid grid-cols-3 gap-2 w-full" dir="ltr">
          <Button
            variant="primary"
            size="md"
            leftIcon={<Edit3 className="w-4 h-4" />}
            onClick={() => {
              onClose();
              onEdit(product);
            }}
            className="w-full text-xs font-bold rounded-2xl justify-center shadow-xs"
          >
            {lang === "ar" ? "تعديل" : "Edit"}
          </Button>

          <Link href={`/products/${product.id}`} className="w-full">
            <Button
              variant="secondary"
              size="md"
              leftIcon={<ExternalLink className="w-4 h-4" />}
              className="w-full text-xs font-bold rounded-2xl justify-center bg-brand-neutral-100 hover:bg-brand-neutral-200"
            >
              {lang === "ar" ? "معاينة" : "Preview"}
            </Button>
          </Link>

          <Button
            variant="danger"
            size="md"
            leftIcon={<Trash2 className="w-4 h-4" />}
            onClick={async () => {
              onClose();
              onDelete(product);
            }}
            className="w-full text-xs font-bold rounded-2xl justify-center"
          >
            {lang === "ar" ? "حذف" : "Delete"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 text-left" dir="ltr">
        {/* Product Image & Key Specs */}
        <div className="flex gap-3">
          <div className="relative w-24 h-32 rounded-2xl overflow-hidden bg-brand-neutral-100 border border-brand-neutral-200 shrink-0 shadow-2xs">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-brand-neutral-400">
                <Package className="w-8 h-8" />
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-between py-0.5">
            <div className="flex flex-col gap-1">
              <Badge variant="neutral" size="sm" className="w-fit font-bold">
                {product.category}
              </Badge>
              <Heading variant="card-title" className="text-sm font-bold text-brand-neutral-950 line-clamp-2 mt-0.5">
                {product.name}
              </Heading>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="font-mono font-extrabold text-lg text-primary-600">
                  {product.price} {t("currency.egp")}
                </span>
                {product.originalPrice && (
                  <span className="font-mono text-xs text-brand-neutral-400 line-through">
                    {product.originalPrice}
                  </span>
                )}
              </div>
            </div>

            <span className="text-[10px] font-mono text-brand-neutral-400">
              ID: #{product.id.slice(-8).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Placements */}
        <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-brand-neutral-50 border border-brand-neutral-100">
          <span className="text-xs font-sans font-bold text-brand-neutral-800">
            {lang === "ar" ? "أماكن الظهور في المتجر:" : "Storefront Placements:"}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {(Array.isArray(product.placements) && product.placements.length > 0
              ? product.placements
              : product.placement
              ? [product.placement]
              : ["trend"]
            ).map((p) => (
              <span
                key={p}
                className="px-2.5 py-1 rounded-xl bg-white border border-brand-neutral-200 text-xs font-sans font-bold text-brand-neutral-800 shadow-2xs"
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* Sizes */}
        <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-brand-neutral-50 border border-brand-neutral-100">
          <div className="flex items-center gap-1.5 text-xs font-sans font-bold text-brand-neutral-800">
            <Ruler className="w-3.5 h-3.5 text-primary-600" />
            <span>{lang === "ar" ? "المقاسات المسجلة:" : "Available Sizes:"}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(Array.isArray(product.sizes) && product.sizes.length > 0
              ? product.sizes
              : product.size
              ? [product.size]
              : ["Free Size"]
            ).map((sz) => (
              <span
                key={sz}
                className="px-2.5 py-1 rounded-xl bg-white border border-brand-neutral-300 text-xs font-mono font-bold text-brand-neutral-900 shadow-2xs"
              >
                {sz}
              </span>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div className="flex flex-col gap-1.5 p-3 rounded-2xl bg-brand-neutral-50 border border-brand-neutral-100">
          <div className="flex items-center gap-1.5 text-xs font-sans font-bold text-brand-neutral-800">
            <Palette className="w-3.5 h-3.5 text-primary-600" />
            <span>{lang === "ar" ? "الألوان المسجلة:" : "Available Colors:"}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(Array.isArray(product.colors) && product.colors.length > 0
              ? product.colors
              : product.color
              ? [product.color]
              : []
            ).map((cl) => (
              <span
                key={cl}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-brand-neutral-300 text-xs font-sans font-bold text-brand-neutral-900 shadow-2xs"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-primary-500 shrink-0" />
                <span>{cl}</span>
              </span>
            ))}
            {(!product.colors || product.colors.length === 0) && !product.color && (
              <span className="text-[11px] font-sans text-brand-neutral-400 italic">
                {lang === "ar" ? "لم يتم تسجيل ألوان محددة" : "No specific colors"}
              </span>
            )}
          </div>
        </div>

        {/* Original Store Link if available */}
        {product.link && (
          <div className="flex items-center justify-between p-3 rounded-2xl bg-brand-neutral-50 border border-brand-neutral-100 text-xs font-sans">
            <span className="text-brand-neutral-600 font-bold truncate max-w-[200px]">
              {product.link}
            </span>
            <a
              href={product.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary-600 font-bold hover:underline shrink-0"
            >
              <span>{lang === "ar" ? "فتح الرابط" : "Open Link"}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    </Modal>
  );
};
