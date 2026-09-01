"use client";

import React, { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Camera,
  Ruler,
  Palette,
  X,
  Check,
  ChevronDown,
  Shield,
  ArrowLeft,
  Package,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { productsService } from "@/services/products.service";
import { Product } from "@/types/product.types";
import { StandardPageLayout } from "@/components/layout/StandardPageLayout";
import { Heading } from "@/components/ui/Heading/Heading";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { Card } from "@/components/ui/Card/Card";
import { AdminPageSkeleton } from "@/components/ui/Skeleton/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { useLoadingTimeout } from "@/hooks/useLoadingTimeout";
import { LoadingTimeoutState } from "@/components/ui/LoadingTimeout/LoadingTimeoutState";

const SIZE_PRESETS = ["XS", "S", "M", "L", "XL", "XXL", "36", "38", "40", "42", "Free Size"];
const COLOR_PRESETS = [
  "أسود",
  "أبيض",
  "بيج",
  "كحلي",
  "زيتي",
  "أحمر",
  "وردي",
  "بني",
  "رمادي",
  "ذهبي",
];

export default function AdminEditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const { isAdmin, loading: authLoading } = useAuth();
  const { t, lang } = useLanguage();
  const { showToast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [editForm, setEditForm] = useState<{
    name: string;
    price: string;
    originalPrice: string;
    category: string;
    placements: string[];
    link: string;
    colors: string[];
    sizes: string[];
  }>({
    name: "",
    price: "",
    originalPrice: "",
    category: "women",
    placements: ["trend"],
    link: "",
    colors: [],
    sizes: [],
  });

  const [editCustomSizeInput, setEditCustomSizeInput] = useState("");
  const [editCustomColorInput, setEditCustomColorInput] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const editProductImageInputRef = useRef<HTMLInputElement>(null);

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
          if (p) {
            setEditForm({
              name: p.name || "",
              price: String(p.price || ""),
              originalPrice: String(p.originalPrice || ""),
              category: p.category || "women",
              placements:
                Array.isArray(p.placements) && p.placements.length > 0
                  ? p.placements
                  : p.placement
                  ? [p.placement]
                  : ["trend"],
              link: p.link || "",
              colors:
                Array.isArray(p.colors) && p.colors.length > 0
                  ? p.colors
                  : p.color
                  ? [p.color]
                  : [],
              sizes:
                Array.isArray(p.sizes) && p.sizes.length > 0
                  ? p.sizes
                  : p.size
                  ? [p.size]
                  : ["Free Size"],
            });
            setEditImagePreview(p.imageUrl || "");
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch product:", err);
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

  const handleTogglePlacement = (placementId: string) => {
    setEditForm((prev) => {
      const exists = prev.placements.includes(placementId);
      let nextPlacements = exists
        ? prev.placements.filter((p) => p !== placementId)
        : [...prev.placements, placementId];
      if (nextPlacements.length === 0) nextPlacements = ["trend"];
      return { ...prev, placements: nextPlacements };
    });
  };

  const handleAddSize = (sizeStr: string) => {
    const raw = sizeStr.trim();
    if (!raw) return;
    const splitSizes = raw.split(/[,،\s]+/).filter(Boolean);
    setEditForm((prev) => {
      const newSizes = [...prev.sizes];
      splitSizes.forEach((s) => {
        if (!newSizes.includes(s)) newSizes.push(s);
      });
      return { ...prev, sizes: newSizes };
    });
    setEditCustomSizeInput("");
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    setEditForm((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((s) => s !== sizeToRemove),
    }));
  };

  const handleAddColor = (colorStr: string) => {
    const raw = colorStr.trim();
    if (!raw) return;
    const splitColors = raw.split(/[,،]+/).map((c) => c.trim()).filter(Boolean);
    setEditForm((prev) => {
      const newColors = [...prev.colors];
      splitColors.forEach((c) => {
        if (!newColors.includes(c)) newColors.push(c);
      });
      return { ...prev, colors: newColors };
    });
    setEditCustomColorInput("");
  };

  const handleRemoveColor = (colorToRemove: string) => {
    setEditForm((prev) => ({
      ...prev,
      colors: prev.colors.filter((c) => c !== colorToRemove),
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.name.trim() || !editForm.price) {
      showToast(lang === "ar" ? "يرجى ملء الحقول المطلوبة" : "Please fill required fields", "error");
      return;
    }

    setIsUpdating(true);
    try {
      let finalImageUrl = product.imageUrl;
      let finalImagePath = product.imagePath;

      if (editImageFile) {
        const uploadResult = await productsService.uploadImage(editImageFile);
        finalImageUrl = uploadResult.imageUrl;
        finalImagePath = uploadResult.imagePath;
      }

      const parsedPrice = parseFloat(editForm.price) || 0;
      const parsedOriginal = editForm.originalPrice ? parseFloat(editForm.originalPrice) : undefined;

      await productsService.updateProduct(product.id, {
        name: editForm.name.trim(),
        price: parsedPrice,
        originalPrice: parsedOriginal,
        category: editForm.category,
        placement: editForm.placements[0] || "trend",
        placements: editForm.placements,
        link: editForm.link.trim() || undefined,
        imageUrl: finalImageUrl,
        imagePath: finalImagePath,
        colors: editForm.colors,
        sizes: editForm.sizes,
      });

      showToast(
        lang === "ar" ? "تم تحديث بيانات المنتج بنجاح ✓" : "Product updated successfully ✓",
        "success"
      );
      router.push(`/admin/products/${product.id}`);
    } catch (err) {
      console.error("Failed to update product:", err);
      showToast(lang === "ar" ? "حدث خطأ أثناء حفظ التعديلات" : "Failed to update product", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="relative h-full w-full flex flex-col overflow-hidden">
      <StandardPageLayout enableNavOffset={false}>
        <div className="flex flex-col gap-4 px-4 pt-2 pb-32 text-left" dir="ltr">
          <Card className="p-4 flex flex-col gap-4 bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs">
            <Heading variant="card-title" className="text-sm font-bold text-brand-neutral-950 pb-2 border-b border-brand-neutral-100">
              {lang === "ar" ? "تعديل بيانات المنتج" : "Edit Product Details"}
            </Heading>

            <form id="admin-edit-product-form" onSubmit={handleSave} className="flex flex-col gap-4">
              {/* Image Picker */}
              <div className="flex flex-col gap-1.5">
                <div
                  onClick={() => editProductImageInputRef.current?.click()}
                  className="border-2 border-dashed border-brand-neutral-300 hover:border-primary-400 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 bg-brand-neutral-50/70 hover:bg-brand-neutral-100/70 transition-colors cursor-pointer text-center"
                >
                  {editImagePreview ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="relative w-28 h-36 rounded-xl overflow-hidden border border-brand-neutral-200 shadow-2xs">
                        <img src={editImagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-sans font-bold text-primary-600 underline">
                        {lang === "ar" ? "اضغطي هنا لتغيير الصورة" : "Click to change image"}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-xs font-sans text-brand-neutral-600 py-4">
                      <Camera className="w-6 h-6 text-primary-500" />
                      <span className="font-bold">{lang === "ar" ? "اضغطي لاختيار صورة من جهازك" : "Click to select image"}</span>
                      <span className="text-[11px] text-brand-neutral-400">JPG, PNG, WebP</span>
                    </div>
                  )}
                </div>
                <input
                  ref={editProductImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setEditImageFile(file);
                      setEditImagePreview(URL.createObjectURL(file));
                    }
                  }}
                  className="hidden"
                />
              </div>

              {/* Product Name */}
              <Input
                placeholder={
                  lang === "ar"
                    ? "اسم المنتج وتفاصيل القطعة (مثال: فستان سهرة شيفون مطرز)"
                    : "Product Name & Details (e.g. Elegant Chiffon Dress)"
                }
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                aria-label={t("admin.products.name")}
                required
              />

              {/* Prices with Currency Suffix */}
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder={
                    lang === "ar"
                      ? "سعر البيع بالجنيه (مثال: 650)"
                      : "Selling Price in EGP (e.g. 650)"
                  }
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                  suffix={t("currency.egp")}
                  aria-label={t("admin.products.price")}
                  required
                />
                <Input
                  type="number"
                  placeholder={
                    lang === "ar"
                      ? "السعر قبل الخصم (اختياري، 850)"
                      : "Original Price (Optional, 850)"
                  }
                  value={editForm.originalPrice}
                  onChange={(e) => setEditForm({ ...editForm, originalPrice: e.target.value })}
                  suffix={t("currency.egp")}
                  aria-label={lang === "ar" ? "السعر قبل الخصم" : "Original Price"}
                />
              </div>

              {/* Category Dropdown */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-sans font-bold text-brand-neutral-800">
                  {lang === "ar" ? "القسم (حريمي / أطفال / بريميوم / تخفيضات / عام)" : "Category"}
                </label>
                <div className="relative w-full">
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full appearance-none px-3.5 py-2.5 pr-10 rtl:pr-3.5 rtl:pl-10 rounded-xl bg-white border border-brand-neutral-200 text-xs font-sans font-bold text-brand-neutral-900 outline-none focus:border-primary-500 cursor-pointer shadow-2xs"
                  >
                    <option value="women">{lang === "ar" ? "حريمي (Women)" : "Women"}</option>
                    <option value="kids">{lang === "ar" ? "أطفال (Kids)" : "Kids"}</option>
                    <option value="premium">{lang === "ar" ? "بريميوم (Premium)" : "Premium"}</option>
                    <option value="sale">{lang === "ar" ? "تخفيضات (Sale)" : "Sale"}</option>
                    <option value="general">{lang === "ar" ? "عام (General)" : "General"}</option>
                  </select>
                  <div className="absolute top-1/2 -translate-y-1/2 right-3.5 rtl:right-auto rtl:left-3.5 pointer-events-none text-brand-neutral-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Placements */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-sans font-bold text-brand-neutral-800">
                  {lang === "ar" ? "أماكن الظهور في الصفحة الرئيسية" : "Storefront Placements"}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: "trend", labelAr: "ترند الأسبوع", labelEn: "Weekly Trend" },
                    { id: "fashion", labelAr: "فاشون", labelEn: "Fashion" },
                    { id: "beauty", labelAr: "بيوتي", labelEn: "Beauty" },
                    { id: "homeware", labelAr: "هوم وير", labelEn: "Homeware" },
                    { id: "summer", labelAr: "صيف 2026", labelEn: "Summer 2026" },
                    { id: "picks", labelAr: "اختيارات المؤثرين", labelEn: "Influencer Picks" },
                  ].map((pl) => {
                    const isChecked = editForm.placements.includes(pl.id);
                    return (
                      <label
                        key={pl.id}
                        onClick={() => handleTogglePlacement(pl.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-sans font-bold border cursor-pointer select-none transition-all ${
                          isChecked
                            ? "bg-primary-50 text-primary-700 border-primary-500 shadow-2xs"
                            : "bg-white text-brand-neutral-600 border-brand-neutral-200 hover:bg-brand-neutral-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="accent-primary-500 w-3.5 h-3.5"
                        />
                        <span>{lang === "ar" ? pl.labelAr : pl.labelEn}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Sizes Tag Manager */}
              <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-brand-neutral-50/80 border border-brand-neutral-200/90">
                <div className="flex items-center gap-2 pb-1 border-b border-brand-neutral-200/60">
                  <Ruler className="w-4 h-4 text-primary-600" />
                  <span className="text-xs font-sans font-bold text-brand-neutral-900">
                    {lang === "ar" ? "المقاسات المتاحة (Sizes)" : "Available Sizes"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 min-h-[30px] items-center">
                  {editForm.sizes.map((sz) => (
                    <span
                      key={sz}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-brand-neutral-300 text-xs font-mono font-bold text-brand-neutral-900 shadow-2xs"
                    >
                      <span>{sz}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSize(sz)}
                        className="text-brand-neutral-400 hover:text-danger-600 p-0.5 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder={lang === "ar" ? "اكتبي مقاس واضغطي Enter أو +" : "Type size and press Enter"}
                    value={editCustomSizeInput}
                    onChange={(e) => setEditCustomSizeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        handleAddSize(editCustomSizeInput);
                      }
                    }}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-brand-neutral-200 text-xs font-mono font-bold text-brand-neutral-900 outline-none focus:border-primary-500"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAddSize(editCustomSizeInput)}
                    className="rounded-xl text-xs font-bold shrink-0 bg-white"
                  >
                    {lang === "ar" ? "+ إضافة" : "+ Add"}
                  </Button>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1 flex-wrap pt-1">
                  <span className="text-[10px] font-sans text-brand-neutral-400">{lang === "ar" ? "اقتراحات سريعة:" : "Quick suggestions:"}</span>
                  {SIZE_PRESETS.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => handleAddSize(sz)}
                      className={`text-[11px] font-mono px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                        editForm.sizes.includes(sz)
                          ? "bg-primary-50 text-primary-700 border-primary-300 font-bold opacity-60 pointer-events-none"
                          : "bg-white text-brand-neutral-700 border-brand-neutral-200 hover:bg-brand-neutral-100"
                      }`}
                    >
                      +{sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors Tag Manager */}
              <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-brand-neutral-50/80 border border-brand-neutral-200/90">
                <div className="flex items-center gap-2 pb-1 border-b border-brand-neutral-200/60">
                  <Palette className="w-4 h-4 text-primary-600" />
                  <span className="text-xs font-sans font-bold text-brand-neutral-900">
                    {lang === "ar" ? "الألوان المتاحة (Colors)" : "Available Colors"}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 min-h-[30px] items-center">
                  {editForm.colors.map((cl) => (
                    <span
                      key={cl}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white border border-brand-neutral-300 text-xs font-sans font-bold text-brand-neutral-900 shadow-2xs"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-primary-500 shrink-0" />
                      <span>{cl}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(cl)}
                        className="text-brand-neutral-400 hover:text-danger-600 p-0.5 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder={lang === "ar" ? "اكتبي اسم اللون واضغطي Enter أو +" : "Type color and press Enter"}
                    value={editCustomColorInput}
                    onChange={(e) => setEditCustomColorInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        handleAddColor(editCustomColorInput);
                      }
                    }}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-brand-neutral-200 text-xs font-sans font-bold text-brand-neutral-900 outline-none focus:border-primary-500"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAddColor(editCustomColorInput)}
                    className="rounded-xl text-xs font-bold shrink-0 bg-white"
                  >
                    {lang === "ar" ? "+ إضافة" : "+ Add"}
                  </Button>
                </div>

                {/* Quick Color Presets */}
                <div className="flex items-center gap-1 flex-wrap pt-1">
                  <span className="text-[10px] font-sans text-brand-neutral-400">{lang === "ar" ? "ألوان شائعة:" : "Common colors:"}</span>
                  {COLOR_PRESETS.map((cl) => (
                    <button
                      key={cl}
                      type="button"
                      onClick={() => handleAddColor(cl)}
                      className={`text-[11px] font-sans px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                        editForm.colors.includes(cl)
                          ? "bg-primary-50 text-primary-700 border-primary-300 font-bold opacity-60 pointer-events-none"
                          : "bg-white text-brand-neutral-700 border-brand-neutral-200 hover:bg-brand-neutral-100"
                      }`}
                    >
                      +{cl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Original Store Link */}
              <Input
                placeholder={
                  lang === "ar"
                    ? "رابط القطعة في المتجر الأصلي (اختياري، https://...)"
                    : "Original Store Product Link (Optional, https://...)"
                }
                value={editForm.link}
                onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
                aria-label={lang === "ar" ? "رابط المتجر الأصلي" : "Original Store Link"}
              />
            </form>
          </Card>
        </div>
      </StandardPageLayout>

      {/* Sticky Bottom Actions Bar */}
      <div
        className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-brand-neutral-200 p-4 shadow-xl flex items-center justify-between gap-3 max-w-[480px] mx-auto w-full"
        style={{ paddingBottom: "calc(18px + env(safe-area-inset-bottom, 0px))" }}
      >
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={() => router.push(`/admin/products/${product.id}`)}
          className="flex-1 font-bold justify-center rounded-xl bg-brand-neutral-100"
        >
          {lang === "ar" ? "إلغاء والعودة" : "Cancel"}
        </Button>
        <Button
          type="submit"
          form="admin-edit-product-form"
          variant="primary"
          size="md"
          isLoading={isUpdating}
          leftIcon={<Check className="w-4 h-4" />}
          className="flex-1 font-bold shadow-xs justify-center rounded-xl"
        >
          {lang === "ar" ? "حفظ التعديلات" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
