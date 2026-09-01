"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Edit3,
  Trash2,
  ExternalLink,
  Shield,
  ArrowLeft,
  Ruler,
  Palette,
  CheckCircle2,
  ShoppingBag,
  Share2,
  Copy,
  Clock,
  Tag,
  Layers,
  Sparkles,
  Info,
  Check,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { useConfirm } from "@/context/ConfirmContext";
import { productsService } from "@/services/products.service";
import { Product } from "@/types/product.types";
import { StandardPageLayout } from "@/components/layout/StandardPageLayout";
import { Heading } from "@/components/ui/Heading/Heading";
import { Button } from "@/components/ui/Button/Button";
import { Badge } from "@/components/ui/Badge/Badge";
import { Card } from "@/components/ui/Card/Card";
import { AdminPageSkeleton } from "@/components/ui/Skeleton/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { useLoadingTimeout } from "@/hooks/useLoadingTimeout";
import { LoadingTimeoutState } from "@/components/ui/LoadingTimeout/LoadingTimeoutState";

const COLOR_MAP: Record<string, string> = {
  "أسود": "#111111",
  "black": "#111111",
  "أبيض": "#FFFFFF",
  "white": "#FFFFFF",
  "بيج": "#E8D8C8",
  "beige": "#E8D8C8",
  "كحلي": "#1E2A38",
  "navy": "#1E2A38",
  "زيتي": "#4A5D4E",
  "olive": "#4A5D4E",
  "أحمر": "#DC2626",
  "red": "#DC2626",
  "وردي": "#F472B6",
  "pink": "#F472B6",
  "بني": "#78350F",
  "brown": "#78350F",
  "رمادي": "#6B7280",
  "grey": "#6B7280",
  "ذهبي": "#D4AF37",
  "gold": "#D4AF37",
};

export default function AdminProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const { isAdmin, loading: authLoading } = useAuth();
  const { t, lang } = useLanguage();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (!isAdmin || !productId) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    productsService
      .getProductById(productId)
      .then((p) => {
        if (isMounted) {
          setProduct(p);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load product:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isAdmin, productId]);

  const isPageLoading = authLoading || (isAdmin && loading);
  const { hasTimedOut, resetTimeout } = useLoadingTimeout(isPageLoading);

  if (isPageLoading) {
    return (
      <StandardPageLayout>
        {hasTimedOut ? (
          <LoadingTimeoutState
            onRetry={() => {
              resetTimeout();
              setLoading(true);
              productsService
                .getProductById(productId)
                .then((p) => {
                  setProduct(p);
                  setLoading(false);
                })
                .catch(() => setLoading(false));
            }}
          />
        ) : (
          <AdminPageSkeleton />
        )}
      </StandardPageLayout>
    );
  }

  if (!isAdmin) {
    return (
      <StandardPageLayout>
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-danger-50 text-danger-500 flex items-center justify-center shadow-xs">
            <Shield className="w-8 h-8" />
          </div>
          <Heading variant="editorial-h1" className="text-xl">
            {t("admin.restricted")}
          </Heading>
          <p className="text-xs font-sans text-brand-neutral-500 max-w-[280px] leading-relaxed">
            {t("admin.restrictedSub")}
          </p>
          <Link href="/">
            <Button variant="primary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              {t("admin.backToStore")}
            </Button>
          </Link>
        </div>
      </StandardPageLayout>
    );
  }

  if (!product) {
    return (
      <StandardPageLayout>
        <div className="p-4 flex flex-col gap-4">
          <EmptyState
            icon={<Package className="w-8 h-8" />}
            title={lang === "ar" ? "المنتج غير موجود" : "Product Not Found"}
            description={
              lang === "ar"
                ? "قد يكون تم حذف المنتج أو أن الرابط غير صحيح"
                : "The product might have been deleted or the link is invalid"
            }
            actionText={lang === "ar" ? "العودة للكتالوج" : "Back to Catalog"}
            actionHref="/admin/products"
          />
        </div>
      </StandardPageLayout>
    );
  }

  const handleDelete = async () => {
    const isConfirmed = await confirm({
      title: t("admin.products.deleteConfirmTitle"),
      message: `${t("admin.products.deleteConfirmMsg")}\n\n• ${product.name}`,
      confirmText: lang === "ar" ? "حذف" : "Delete",
      cancelText: lang === "ar" ? "إلغاء" : "Cancel",
      isDestructive: true,
    });

    if (!isConfirmed) return;

    setIsDeleting(true);
    try {
      await productsService.deleteProduct(product.id, product.imagePath);
      showToast(
        lang === "ar" ? "تم حذف المنتج بنجاح" : "Product deleted successfully",
        "success"
      );
      router.push("/admin/products");
    } catch {
      showToast(lang === "ar" ? "حدث خطأ أثناء حذف المنتج" : "Failed to delete product", "error");
      setIsDeleting(false);
    }
  };

  const handleCopyProductLink = () => {
    if (typeof window === "undefined") return;
    const storefrontUrl = `${window.location.origin}/products/${product.id}`;
    navigator.clipboard.writeText(storefrontUrl);
    setCopiedLink(true);
    showToast(lang === "ar" ? "تم نسخ رابط المنتج في المتجر" : "Storefront link copied", "info");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(product.id);
    setCopiedId(true);
    showToast(lang === "ar" ? "تم نسخ كود المنتج" : "Product ID copied", "info");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);
  const discountPercent = hasDiscount && product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const savingsAmount = hasDiscount && product.originalPrice
    ? product.originalPrice - product.price
    : 0;

  // Format timestamp into human-readable string
  const createdDateStr = product.createdAt
    ? new Date(product.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  // Sourcing platform badge
  const getSourcePlatform = (url?: string | null) => {
    if (!url) return null;
    if (url.includes("shein")) return "SHEIN";
    if (url.includes("zara")) return "ZARA";
    if (url.includes("trendyol")) return "TRENDYOL";
    if (url.includes("hm.com")) return "H&M";
    return lang === "ar" ? "متجر خارجي" : "External Store";
  };
  const sourcePlatform = getSourcePlatform(product.link);

  return (
    <div className="relative h-full w-full flex flex-col overflow-hidden">
      <StandardPageLayout enableNavOffset={false}>
        <div className="flex flex-col gap-4 px-4 pt-2 pb-24 text-left" dir="ltr">
          
          {/* Top Info Bar (ID & Status) */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handleCopyId}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-brand-neutral-100 hover:bg-brand-neutral-200 border border-brand-neutral-200 text-xs font-mono font-bold text-brand-neutral-700 transition-colors cursor-pointer"
              title="Copy ID"
            >
              <Tag className="w-3 h-3 text-primary-600" />
              <span>ID: {product.id.slice(0, 10)}...</span>
              {copiedId ? <Check className="w-3 h-3 text-success-600" /> : <Copy className="w-3 h-3 text-brand-neutral-400" />}
            </button>

            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-success-50 text-success-700 border border-success-200 text-xs font-sans font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{lang === "ar" ? "معروض بالمتجر" : "Active in Catalog"}</span>
            </span>
          </div>

          {/* 1. Main Media & Details Card */}
          <Card className="p-4 flex flex-col gap-4 bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs">
            {/* Image Showcase */}
            <div className="relative w-full aspect-[4/5] max-h-[380px] rounded-2xl overflow-hidden bg-brand-neutral-100 border border-brand-neutral-200">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-brand-neutral-400">
                  <Package className="w-12 h-12" />
                </div>
              )}

              {/* Badges Overlay */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                <Badge variant="neutral" size="sm" className="bg-white/95 backdrop-blur-md shadow-xs font-bold text-xs">
                  {product.category}
                </Badge>
                {Array.isArray(product.placements) ? (
                  product.placements.map((pl) => (
                    <Badge key={pl} variant="primary" size="sm" className="bg-primary-500/95 text-white backdrop-blur-md shadow-xs text-xs font-bold">
                      {pl}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="primary" size="sm" className="bg-primary-500/95 text-white backdrop-blur-md shadow-xs text-xs font-bold">
                    {product.placement || "trend"}
                  </Badge>
                )}
              </div>
            </div>

            {/* Product Title */}
            <div className="flex flex-col gap-1.5">
              <Heading variant="editorial-h1" className="text-xl font-bold text-brand-neutral-950 leading-snug">
                {product.name}
              </Heading>
              {product.nameEn && (
                <span className="text-xs font-sans text-brand-neutral-500">
                  {product.nameEn}
                </span>
              )}
            </div>

            {/* Price Breakdown Grid */}
            <div className="p-3.5 rounded-2xl bg-brand-neutral-50/80 border border-brand-neutral-200/90 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans font-bold text-brand-neutral-600">
                  {lang === "ar" ? "سعر البيع للعملاء:" : "Selling Price:"}
                </span>
                <span className="font-mono font-extrabold text-2xl text-primary-600">
                  {product.price} {t("currency.egp")}
                </span>
              </div>

              {hasDiscount && (
                <div className="flex items-center justify-between pt-1.5 border-t border-brand-neutral-200/60 text-xs">
                  <div className="flex items-center gap-1.5 text-brand-neutral-500">
                    <span>{lang === "ar" ? "السعر قبل الخصم:" : "Original Price:"}</span>
                    <span className="font-mono line-through">{product.originalPrice} {t("currency.egp")}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono font-bold text-danger-600 bg-danger-50 px-2 py-0.5 rounded-md">
                    <span>وفر: {savingsAmount} {t("currency.egp")}</span>
                    <span>(-{discountPercent}%)</span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* 2. Variants & Specifications Card */}
          <Card className="p-4 flex flex-col gap-4 bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs">
            <Heading variant="card-title" className="text-sm font-bold text-brand-neutral-950 pb-2 border-b border-brand-neutral-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary-600" />
              <span>{lang === "ar" ? "المواصفات والمقاسات والألوان" : "Variants & Specifications"}</span>
            </Heading>

            {/* Available Sizes Tag Section */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <Ruler className="w-4 h-4 text-primary-600" />
                <span className="text-xs font-sans font-bold text-brand-neutral-800">
                  {lang === "ar" ? "المقاسات المتوفرة بالمخزون:" : "Available Sizes in Stock:"}
                </span>
                <span className="text-[10px] font-mono text-brand-neutral-400">
                  ({product.sizes?.length || 1})
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {product.sizes && product.sizes.length > 0 ? (
                  product.sizes.map((sz) => (
                    <span
                      key={sz}
                      className="px-3 py-1.5 rounded-xl bg-brand-neutral-50 border border-brand-neutral-300 text-xs font-mono font-bold text-brand-neutral-900 shadow-2xs"
                    >
                      {sz}
                    </span>
                  ))
                ) : (
                  <span className="px-3 py-1.5 rounded-xl bg-brand-neutral-50 border border-brand-neutral-300 text-xs font-mono font-bold text-brand-neutral-900">
                    {product.size || "Free Size"}
                  </span>
                )}
              </div>
            </div>

            {/* Available Colors Tag Section */}
            <div className="flex flex-col gap-2 pt-2 border-t border-brand-neutral-100">
              <div className="flex items-center gap-1.5">
                <Palette className="w-4 h-4 text-primary-600" />
                <span className="text-xs font-sans font-bold text-brand-neutral-800">
                  {lang === "ar" ? "الألوان وخيارات القطعة:" : "Available Colors:"}
                </span>
                <span className="text-[10px] font-mono text-brand-neutral-400">
                  ({product.colors?.length || (product.color ? 1 : 0)})
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {product.colors && product.colors.length > 0 ? (
                  product.colors.map((cl) => {
                    const swatch = COLOR_MAP[cl.toLowerCase()] || COLOR_MAP[cl] || "#D49B44";
                    return (
                      <span
                        key={cl}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-neutral-50 border border-brand-neutral-300 text-xs font-sans font-bold text-brand-neutral-900 shadow-2xs"
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                          style={{ backgroundColor: swatch }}
                        />
                        <span>{cl}</span>
                      </span>
                    );
                  })
                ) : product.color ? (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-neutral-50 border border-brand-neutral-300 text-xs font-sans font-bold text-brand-neutral-900">
                    <span className="w-3.5 h-3.5 rounded-full bg-primary-500" />
                    <span>{product.color}</span>
                  </span>
                ) : (
                  <span className="text-xs font-sans text-brand-neutral-400">
                    {lang === "ar" ? "لون موحد كالصورة" : "Standard color as shown"}
                  </span>
                )}
              </div>
            </div>
          </Card>

          {/* 3. Sourcing & Metadata Card */}
          <Card className="p-4 flex flex-col gap-3 bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs">
            <Heading variant="card-title" className="text-sm font-bold text-brand-neutral-950 pb-2 border-b border-brand-neutral-100 flex items-center gap-2">
              <Info className="w-4 h-4 text-primary-600" />
              <span>{lang === "ar" ? "بيانات المصدر والتوثيق" : "Sourcing & Metadata"}</span>
            </Heading>

            {/* Original Store Link */}
            {product.link ? (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-sans font-bold text-brand-neutral-700">
                    {lang === "ar" ? "رابط الاستيراد الأصلي:" : "Original Merchant URL:"}
                  </span>
                  {sourcePlatform && (
                    <span className="px-2 py-0.5 rounded-md bg-primary-100 text-primary-800 text-[10px] font-mono font-bold">
                      {sourcePlatform}
                    </span>
                  )}
                </div>
                <a
                  href={product.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-brand-neutral-50 border border-brand-neutral-200 text-xs font-sans text-primary-700 hover:bg-brand-neutral-100 transition-colors"
                >
                  <span className="truncate flex-1 pr-2">{product.link}</span>
                  <ExternalLink className="w-4 h-4 shrink-0 text-primary-600" />
                </a>
              </div>
            ) : (
              <div className="text-xs font-sans text-brand-neutral-500">
                {lang === "ar" ? "تمت إضافة المنتج يدوياً دون رابط خارجي" : "Manually added product without external merchant link"}
              </div>
            )}

            {/* Timestamps */}
            {createdDateStr && (
              <div className="flex items-center gap-2 pt-2 border-t border-brand-neutral-100 text-xs text-brand-neutral-500">
                <Clock className="w-3.5 h-3.5 text-brand-neutral-400" />
                <span>
                  {lang === "ar" ? "تاريخ الإضافة:" : "Added on:"} <strong className="text-brand-neutral-800">{createdDateStr}</strong>
                </span>
              </div>
            )}
          </Card>
        </div>
      </StandardPageLayout>

      {/* Sticky Bottom Actions Bar */}
      <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md p-3 border-t border-brand-neutral-200/90 flex items-center justify-between gap-2 max-w-[480px] mx-auto w-full">
        <Link href={`/admin/products/${product.id}/edit`} className="flex-1">
          <Button
            variant="primary"
            size="md"
            leftIcon={<Edit3 className="w-4 h-4" />}
            className="w-full font-bold justify-center rounded-xl shadow-xs"
          >
            {lang === "ar" ? "تعديل بيانات المنتج" : "Edit Product Details"}
          </Button>
        </Link>

        <button
          onClick={handleCopyProductLink}
          className="w-11 h-11 rounded-xl flex items-center justify-center bg-brand-neutral-100 hover:bg-brand-neutral-200 active:scale-95 text-brand-neutral-700 transition-all border border-brand-neutral-200 shrink-0 cursor-pointer"
          title={lang === "ar" ? "نسخ رابط المتجر" : "Copy Store Link"}
        >
          {copiedLink ? <Check className="w-4 h-4 text-success-600" /> : <Share2 className="w-4 h-4" />}
        </button>

        <Button
          variant="danger"
          size="md"
          isLoading={isDeleting}
          onClick={handleDelete}
          className="px-3.5 h-11 rounded-xl justify-center bg-danger-50 hover:bg-danger-100 text-danger-700 border border-danger-200 shrink-0"
          title={lang === "ar" ? "حذف المنتج" : "Delete Product"}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
