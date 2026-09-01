import React from "react";
import Image from "next/image";
import { QrCode, Camera, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card/Card";
import { Heading } from "@/components/ui/Heading/Heading";
import type { BazaarProduct } from "@/types/bazaar.types";

interface BazaarItemCardProps {
  product: BazaarProduct;
  onShowQR: (product: BazaarProduct) => void;
  onUploadPhoto: (product: BazaarProduct) => void;
  onDelete: (product: BazaarProduct) => void;
}

export const BazaarItemCard: React.FC<BazaarItemCardProps> = ({
  product,
  onShowQR,
  onUploadPhoto,
  onDelete,
}) => {
  return (
    <Card className="p-3 flex items-center justify-between gap-3 bg-white">
      <div className="flex items-center gap-3 min-w-0">
        {/* Photo Thumbnail / Add Photo */}
        <button
          onClick={() => onUploadPhoto(product)}
          className="relative w-12 h-12 rounded-xl bg-brand-neutral-100 border border-brand-neutral-200 overflow-hidden flex items-center justify-center text-brand-neutral-400 hover:text-primary-500 hover:border-primary-300 transition-colors shrink-0 group"
          title="تغيير / إضافة صورة"
        >
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
          )}
        </button>

        {/* Product Details */}
        <div className="flex flex-col min-w-0">
          <Heading
            variant="card-title"
            className="text-sm font-bold text-brand-neutral-900 truncate"
          >
            {product.name}
          </Heading>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-mono font-bold text-sm text-primary-500 tabular-nums">
              {product.price}
            </span>
            <span className="text-[11px] font-sans text-brand-neutral-500">
              ج.م
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => onShowQR(product)}
          className="p-2 rounded-xl bg-brand-neutral-100 text-brand-neutral-700 hover:bg-brand-neutral-200 active:scale-95 transition-all"
          title="عرض كود QR"
          aria-label="عرض كود QR"
        >
          <QrCode className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(product)}
          className="p-2 rounded-xl bg-danger-50 text-danger-500 hover:bg-danger-500 hover:text-white active:scale-95 transition-all"
          title="حذف المنتج"
          aria-label="حذف المنتج"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </Card>
  );
};
