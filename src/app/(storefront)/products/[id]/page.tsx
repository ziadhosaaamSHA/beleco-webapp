"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ShoppingBag, Truck, ShieldCheck, Share2, Heart, ChevronRight, Check } from "lucide-react";
import { productsService } from "@/services/products.service";
import { Heading } from "@/components/ui/Heading/Heading";
import { Button } from "@/components/ui/Button/Button";
import { Badge } from "@/components/ui/Badge/Badge";
import { ProductDetailsSkeleton } from "@/components/ui/Skeleton/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import type { Product } from "@/types/product.types";
import { Card } from "@/components/ui/Card/Card";

const defaultSizes = ["XS", "S", "M", "L", "XL"];

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("M");
  const [isLiked, setIsLiked] = useState(false);
  const [isAddedRecently, setIsAddedRecently] = useState(false);

  const { lang, t, isLangReady } = useLanguage();
  const { formatPrice, countryInfo } = useLocation();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    productsService
      .getProductById(productId)
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load product:", err);
        setLoading(false);
      });
  }, [productId]);

  const handleAddToBag = () => {
    if (!product) return;
    try {
      addToCart({
        productId: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        imageUrl: product.imageUrl,
        selectedSize,
      });
      setIsAddedRecently(true);
      setTimeout(() => setIsAddedRecently(false), 2000);
    } catch {
      showToast(lang === "ar" ? "تعذر إضافة المنتج للحقيبة" : "Failed to add item to bag", "error");
    }
  };

  const handleShare = async () => {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: `اكتشفي ${product.name} على بيليكو`,
          url: window.location.href,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast("تم نسخ رابط المنتج", "info");
    }
  };

  if (!isLangReady || loading) {
    return (
      <div className="h-full w-full bg-brand-neutral-50 flex flex-col p-4 animate-in fade-in duration-150">
        <ProductDetailsSkeleton />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="h-full w-full bg-brand-neutral-50 flex flex-col items-center justify-center p-6 text-center">
        <EmptyState
          icon={<ShoppingBag className="w-8 h-8" />}
          title={lang === "ar" ? "المنتج غير متوفر حالياً" : "Product not found"}
          description={lang === "ar" ? "ربما تم حذف هذا المنتج أو لم يعد متاحاً في المتجر" : "This product may have been removed or is no longer available"}
          actionText={lang === "ar" ? "العودة للمتجر" : "Back to Store"}
          onAction={() => router.push("/")}
        />
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-brand-neutral-50 flex flex-col overflow-hidden relative animate-page-enter" dir="ltr">
      {/* Top Floating Action Bar */}
      <div
        className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 pb-2 pointer-events-none"
        style={{ paddingTop: "calc(16px + env(safe-area-inset-top, 0px))" }}
      >
        <button
          onClick={() => router.back()}
          className="pointer-events-auto w-10 h-10 rounded-full bg-white/95 backdrop-blur-md border border-brand-neutral-200/90 flex items-center justify-center text-brand-neutral-950 shadow-sm active:scale-95 transition-transform"
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-md border border-brand-neutral-200/90 flex items-center justify-center text-brand-neutral-950 shadow-sm active:scale-95 transition-transform"
            aria-label="Save"
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-danger-500 stroke-danger-500 text-danger-500" : "text-brand-neutral-800"}`} />
          </button>
          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-md border border-brand-neutral-200/90 flex items-center justify-center text-brand-neutral-950 shadow-sm active:scale-95 transition-transform"
            aria-label="Share"
          >
            <Share2 className="w-4 h-4 text-brand-neutral-800" />
          </button>
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div
        className="flex-1 overflow-y-auto overflow-x-hidden"
        style={{
          paddingBottom: "calc(110px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {/* Product Image Stage */}
        <div className="relative w-full aspect-[4/5] bg-brand-neutral-200">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-brand-neutral-400">
              <ShoppingBag className="w-12 h-12" />
            </div>
          )}

          {product.originalPrice && product.originalPrice > product.price && (
            <div className="absolute bottom-3 left-3 z-10">
              <Badge variant="primary" size="md">
                خصم {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </Badge>
            </div>
          )}
        </div>

        {/* Product Details Card */}
        <div className="p-4 flex flex-col gap-4 bg-white rounded-t-3xl -mt-4 relative z-10 border-t border-brand-neutral-100 shadow-xs text-left">
          {/* Category & Title & Price */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-sans font-bold text-primary-600">
                {product.category}
              </span>
              {product.sourcePlatform && (
                <span className="text-[11px] font-sans font-extrabold text-brand-neutral-500 uppercase">
                  {product.sourcePlatform}
                </span>
              )}
            </div>

            <Heading variant="editorial-h1" className="text-xl text-brand-neutral-950 font-bold leading-tight">
              {product.name}
            </Heading>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-mono font-extrabold text-2xl text-brand-neutral-950">
                {formatPrice(product.price).formatted}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="font-mono text-sm text-brand-neutral-400 line-through">
                  {formatPrice(product.originalPrice).formatted}
                </span>
              )}
            </div>
          </div>

          <div className="h-px bg-brand-neutral-100" />

          {/* Size Selector */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-sans font-bold text-brand-neutral-950">
              {t("product.selectSize")}
            </span>
            <div className="flex items-center gap-2">
              {defaultSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-11 h-11 rounded-xl text-xs font-mono font-bold border transition-all ${
                    selectedSize === size
                      ? "bg-brand-neutral-950 text-white border-brand-neutral-950 shadow-xs"
                      : "bg-brand-neutral-50 text-brand-neutral-800 border-brand-neutral-200 hover:border-brand-neutral-400"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="flex flex-col gap-1.5 pt-1">
              <span className="text-xs font-sans font-bold text-brand-neutral-950">
                {t("product.details")}
              </span>
              <p className="text-xs font-sans text-brand-neutral-700 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Guarantee Badges */}
          <div className="flex flex-col gap-2 pt-2">
            <Card variant="surface" className="flex items-center gap-3 p-3.5 rounded-2xl bg-brand-neutral-50 border-brand-neutral-200/90 text-xs font-sans text-brand-neutral-800">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary-500 shrink-0 shadow-xs">
                <Truck className="w-4 h-4" />
              </div>
              <span>{t("product.deliveryInfo")}</span>
            </Card>

            <Card variant="surface" className="flex items-center gap-3 p-3.5 rounded-2xl bg-brand-neutral-50 border-brand-neutral-200/90 text-xs font-sans text-brand-neutral-800">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-success-600 shrink-0 shadow-xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>{t("product.guarantee")}</span>
            </Card>
          </div>
        </div>
      </div>

      {/* Floating Bottom Add to Bag Bar */}
      <div
        className="absolute bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-brand-neutral-200 p-4 shadow-xl flex items-center justify-between gap-4"
        style={{ paddingBottom: "calc(18px + env(safe-area-inset-bottom, 0px))" }}
      >
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-sans font-bold text-brand-neutral-500">
            {t("product.totalPrice")}
          </span>
          <span className="font-mono font-extrabold text-lg text-brand-neutral-950">
            {formatPrice(product.price).formatted}
          </span>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={handleAddToBag}
          className={`flex-1 font-sans font-bold text-sm justify-between shadow-md rounded-2xl transition-all duration-300 ${
            isAddedRecently
              ? "bg-brand-neutral-950 text-emerald-400 border border-emerald-500/50 shadow-md ring-2 ring-emerald-400/20"
              : "bg-brand-neutral-950 hover:bg-brand-neutral-900 text-white"
          }`}
          leftIcon={isAddedRecently ? <Check className="w-4 h-4 text-emerald-400 stroke-[2.5]" /> : <ShoppingBag className="w-4 h-4 text-white" />}
          rightIcon={isAddedRecently ? undefined : <ChevronRight className="w-4 h-4 text-white/80" />}
        >
          {isAddedRecently ? (lang === "ar" ? "في الحقيبة ✓" : "In Bag ✓") : t("product.addToBag")}
        </Button>
      </div>
    </div>
  );
}
