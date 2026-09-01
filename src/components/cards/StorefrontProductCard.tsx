"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronRight, Check, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/Card/Card";
import { Badge } from "@/components/ui/Badge/Badge";
import { Heading } from "@/components/ui/Heading/Heading";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types/product.types";

export interface StorefrontProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

export const StorefrontProductCard: React.FC<StorefrontProductCardProps> = ({
  product,
  onSelect,
  onAddToCart,
}) => {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const { formatPrice } = useLocation();
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const getPlacement = (placement: Product["placement"]) => {
    switch (placement) {
      case "featured":
        return { text: t("placement.featured"), variant: "primary" as const };
      case "new_arrival":
        return { text: t("placement.new_arrival"), variant: "neutral" as const };
      case "influencer_pick":
        return { text: t("placement.influencer_pick"), variant: "gold" as const };
      case "trending":
        return { text: t("placement.trending"), variant: "primary" as const };
      default:
        return null;
    }
  };

  const placement = getPlacement(product.placement);
  const { formatted: formattedPrice } = formatPrice(product.price);

  const handleClick = () => {
    if (onSelect) {
      onSelect(product);
    }
    router.push(`/products/${product.id}`);
  };

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        imageUrl: product.imageUrl,
        selectedSize: "M",
      });
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 1800);
      onAddToCart?.(product);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Card
      variant="interactive"
      onClick={handleClick}
      className="p-0 flex flex-col relative group overflow-hidden bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs cursor-pointer select-none"
    >
      {/* Edge-to-Edge Image Container */}
      <div className="relative w-full aspect-[4/5] bg-brand-neutral-100 overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 200px"
            className="object-cover group-hover:scale-105 transition-transform duration-300 rounded-none"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-brand-neutral-300 text-xs">
            بدون صورة
          </div>
        )}

        {/* Placement Badge */}
        {placement && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <Badge variant={placement.variant} size="sm">
              {placement.text}
            </Badge>
          </div>
        )}
      </div>

      {/* Product Details & Actions with clean padding */}
      <div className="flex flex-col gap-2 p-3">
        <Heading
          variant="card-title"
          className="text-xs sm:text-sm font-bold text-brand-neutral-950 line-clamp-1 text-left"
        >
          {product.name}
        </Heading>

        <div className="flex items-baseline gap-1">
          <span className="font-mono font-extrabold text-sm sm:text-base text-brand-neutral-950 tabular-nums">
            {formattedPrice}
          </span>
        </div>

        {/* Add to Bag Button with visual state */}
        <button
          onClick={handleAdd}
          className={`w-full h-9 rounded-xl flex items-center justify-between px-3 text-xs font-sans font-bold transition-all duration-200 active:scale-95 shadow-xs mt-0.5 cursor-pointer ${
            isAdded
              ? "bg-brand-neutral-950 text-emerald-400 border border-emerald-500/50 shadow-sm ring-2 ring-emerald-400/20"
              : "bg-brand-neutral-950 hover:bg-brand-neutral-800 text-white"
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1.5">
              {isAdded && <Check className="w-3.5 h-3.5 stroke-[2.5] text-emerald-400 animate-in zoom-in-50 duration-200" />}
              <span>{isAdded ? (lang === "ar" ? "في الحقيبة ✓" : "In Bag ✓") : t("product.addToBag")}</span>
            </div>
            {!isAdded && <ChevronRight className="w-4 h-4 text-white/70" />}
          </div>
        </button>
      </div>
    </Card>
  );
};
