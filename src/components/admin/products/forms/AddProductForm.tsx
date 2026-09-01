"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Camera,
  Ruler,
  Palette,
  X,
  Upload,
  ChevronDown,
  ArrowLeft,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { productsService } from "@/services/products.service";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { Heading } from "@/components/ui/Heading/Heading";

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

export const AddProductForm: React.FC = () => {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const { showToast } = useToast();

  const [extractUrl, setExtractUrl] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractStatus, setExtractStatus] = useState<{ text: string; isError: boolean } | null>(null);

  const [productForm, setProductForm] = useState<{
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
    sizes: ["S", "M", "L"],
  });

  const [customSizeInput, setCustomSizeInput] = useState("");
  const [customColorInput, setCustomColorInput] = useState("");
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [extractedImageUrl, setExtractedImageUrl] = useState<string | null>(null);
  const [productImagePreview, setProductImagePreview] = useState<string>("");
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const productImageInputRef = useRef<HTMLInputElement>(null);

  const handleTogglePlacement = (placementId: string) => {
    setProductForm((prev) => {
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
    setProductForm((prev) => {
      const newSizes = [...prev.sizes];
      splitSizes.forEach((s) => {
        if (!newSizes.includes(s)) newSizes.push(s);
      });
      return { ...prev, sizes: newSizes };
    });
    setCustomSizeInput("");
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    setProductForm((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((s) => s !== sizeToRemove),
    }));
  };

  const handleAddColor = (colorStr: string) => {
    const raw = colorStr.trim();
    if (!raw) return;
    const splitColors = raw.split(/[,،]+/).map((c) => c.trim()).filter(Boolean);
    setProductForm((prev) => {
      const newColors = [...prev.colors];
      splitColors.forEach((c) => {
        if (!newColors.includes(c)) newColors.push(c);
      });
      return { ...prev, colors: newColors };
    });
    setCustomColorInput("");
  };

  const handleRemoveColor = (colorToRemove: string) => {
    setProductForm((prev) => ({
      ...prev,
      colors: prev.colors.filter((c) => c !== colorToRemove),
    }));
  };

  const handleExtractProduct = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const url = extractUrl.trim();
    if (!url) {
      showToast(lang === "ar" ? "الرجاء لصق لينك المنتج أولاً" : "Please paste product link first", "error");
      return;
    }

    setIsExtracting(true);
    setExtractStatus({
      text: lang === "ar" ? "جاري استخراج بيانات المنتج..." : "Extracting product details...",
      isError: false,
    });

    try {
      const data = await productsService.extractProductInfo(url);
      const found: string[] = [];

      setProductForm((prev) => {
        const next = { ...prev };
        if (data.title) {
          next.name = data.title;
          found.push(lang === "ar" ? "الاسم" : "Name");
        }
        if (data.price) {
          next.price = String(data.price);
          found.push(lang === "ar" ? "السعر" : "Price");
        }
        if (data.color) {
          const colorList = String(data.color).split(/[,،]+/).map((c) => c.trim()).filter(Boolean);
          next.colors = Array.from(new Set([...next.colors, ...colorList]));
          found.push(lang === "ar" ? "اللون" : "Color");
        }
        if (data.size) {
          const sizeList = String(data.size).split(/[,،\s]+/).filter(Boolean);
          next.sizes = Array.from(new Set([...next.sizes, ...sizeList]));
          found.push(lang === "ar" ? "المقاسات" : "Sizes");
        }
        next.link = url;
        return next;
      });

      if (data.image) {
        setExtractedImageUrl(data.image);
        setProductImagePreview(data.image);
        setProductImageFile(null);
        found.push(lang === "ar" ? "الصورة" : "Image");
      }

      setExtractStatus({
        text:
          found.length > 0
            ? lang === "ar"
              ? `تم استخراج: ${found.join("، ")} بنجاح ✓`
              : `Extracted: ${found.join(", ")} successfully ✓`
            : lang === "ar"
            ? "تم فتح الرابط وتجهيز النموذج"
            : "Link processed",
        isError: false,
      });
      showToast(lang === "ar" ? "تم استخراج تفاصيل المنتج بنجاح ✓" : "Details extracted ✓", "success");
    } catch {
      setExtractStatus({
        text:
          lang === "ar"
            ? "تعذر الاستخراج التلقائي. يمكنك إدخال البيانات يدوياً أدناه."
            : "Auto-extraction unavailable. Please fill manually below.",
        isError: true,
      });
      setProductForm((prev) => ({ ...prev, link: url }));
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.price) {
      showToast(lang === "ar" ? "يرجى كتابة اسم المنتج وسعره" : "Please enter product name and price", "error");
      return;
    }

    setIsSavingProduct(true);
    try {
      let finalImageUrl = extractedImageUrl || "";
      let finalImagePath = "";

      if (productImageFile) {
        const uploadRes = await productsService.uploadImage(productImageFile);
        finalImageUrl = uploadRes.imageUrl;
        finalImagePath = uploadRes.imagePath;
      }

      await productsService.addProduct({
        name: productForm.name.trim(),
        price: parseFloat(productForm.price) || 0,
        originalPrice: productForm.originalPrice ? parseFloat(productForm.originalPrice) : undefined,
        category: productForm.category,
        placement: productForm.placements[0] || "trend",
        placements: productForm.placements,
        link: productForm.link.trim() || undefined,
        sizes: productForm.sizes.length > 0 ? productForm.sizes : ["Free Size"],
        size: productForm.sizes[0] || "Free Size",
        colors: productForm.colors,
        color: productForm.colors[0] || undefined,
        imageUrl: finalImageUrl,
        imagePath: finalImagePath,
      });

      showToast(lang === "ar" ? "تم نشر المنتج في المتجر بنجاح ✓" : "Product published successfully ✓", "success");
      router.push("/admin/products");
    } catch (err) {
      console.error("Error creating product:", err);
      showToast(lang === "ar" ? "فشل نشر المنتج" : "Failed to publish product", "error");
    } finally {
      setIsSavingProduct(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 text-left" dir="ltr">
      {/* 1. Fast Auto-Extractor Card */}
      <Card className="p-4 flex flex-col gap-3 bg-white border border-primary-200/80 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <Heading variant="card-title" className="text-sm font-bold text-brand-neutral-950">
              {lang === "ar" ? "استخراج تلقائي من لينك الموقع" : "Auto-Extract from Product URL"}
            </Heading>
            <p className="text-[11px] font-sans text-brand-neutral-500">
              {lang === "ar"
                ? "الصقي لينك شي إن، زارا، أو ترينديول لسحب الاسم والسعر والصور فوراً"
                : "Paste URL from Shein, Zara, Trendyol to pull specs and photo instantly"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="url"
            placeholder={
              lang === "ar"
                ? "الصقي رابط المنتج هنا (شي إن، زارا، ترينديول...)"
                : "Paste product URL here (Shein, Zara, Trendyol...)"
            }
            value={extractUrl}
            onChange={(e) => setExtractUrl(e.target.value)}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-brand-neutral-50/80 border border-brand-neutral-200 text-xs font-sans text-brand-neutral-900 outline-none focus:border-primary-500"
            aria-label={lang === "ar" ? "رابط الاستخراج التلقائي" : "Auto-extract URL"}
          />
          <Button
            type="button"
            variant="primary"
            size="md"
            isLoading={isExtracting}
            onClick={() => handleExtractProduct()}
            className="shrink-0 text-xs font-bold rounded-xl"
          >
            {lang === "ar" ? "استخراج" : "Extract"}
          </Button>
        </div>

        {extractStatus && (
          <div
            className={`p-2.5 rounded-xl text-xs font-sans font-bold flex items-center gap-2 ${
              extractStatus.isError
                ? "bg-danger-50 text-danger-700 border border-danger-200"
                : "bg-success-50 text-success-700 border border-success-200"
            }`}
          >
            <span>{extractStatus.text}</span>
          </div>
        )}
      </Card>

      {/* 2. Full Product Form */}
      <Card className="p-4 flex flex-col gap-3.5 bg-white border border-brand-neutral-200/90 shadow-xs">
        <Heading variant="card-title" className="text-sm font-bold text-brand-neutral-950 pb-2 border-b border-brand-neutral-100">
          {lang === "ar" ? "بيانات المنتج وتفاصيل العرض" : "Product Details & Display Settings"}
        </Heading>

        <form id="admin-add-product-form" onSubmit={handleSaveProduct} className="flex flex-col gap-3.5">
          {/* Image Picker */}
          <div className="flex flex-col gap-1.5">
            <div
              onClick={() => productImageInputRef.current?.click()}
              className="border-2 border-dashed border-brand-neutral-300 hover:border-primary-400 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 bg-brand-neutral-50/70 hover:bg-brand-neutral-100/70 transition-colors cursor-pointer text-center"
            >
              {productImagePreview ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="relative w-28 h-36 rounded-xl overflow-hidden border border-brand-neutral-200 shadow-2xs">
                    <img src={productImagePreview} alt="Preview" className="w-full h-full object-cover" />
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
              ref={productImageInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setProductImageFile(file);
                  setExtractedImageUrl(null);
                  setProductImagePreview(URL.createObjectURL(file));
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
            value={productForm.name}
            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
            aria-label={t("admin.products.name")}
            required
          />

          {/* Prices */}
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder={
                lang === "ar"
                  ? "سعر البيع بالجنيه (مثال: 650)"
                  : "Selling Price in EGP (e.g. 650)"
              }
              value={productForm.price}
              onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
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
              value={productForm.originalPrice}
              onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
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
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
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
                const isChecked = productForm.placements.includes(pl.id);
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
              {productForm.sizes.map((sz) => (
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
                value={customSizeInput}
                onChange={(e) => setCustomSizeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    handleAddSize(customSizeInput);
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-brand-neutral-200 text-xs font-mono font-bold text-brand-neutral-900 outline-none focus:border-primary-500"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleAddSize(customSizeInput)}
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
                    productForm.sizes.includes(sz)
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
              {productForm.colors.map((cl) => (
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
                value={customColorInput}
                onChange={(e) => setCustomColorInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    handleAddColor(customColorInput);
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-brand-neutral-200 text-xs font-sans font-bold text-brand-neutral-900 outline-none focus:border-primary-500"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleAddColor(customColorInput)}
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
                    productForm.colors.includes(cl)
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
            value={productForm.link}
            onChange={(e) => setProductForm({ ...productForm, link: e.target.value })}
            aria-label={lang === "ar" ? "رابط المتجر الأصلي" : "Original Store Link"}
          />

        </form>
      </Card>

      {/* Sticky Bottom Actions Bar */}
      <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md p-3 border-t border-brand-neutral-200/90 flex items-center justify-between gap-2 max-w-[480px] mx-auto w-full -mx-4 px-4">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={() => router.push("/admin/products")}
          className="flex-1 font-bold justify-center rounded-xl bg-brand-neutral-100"
        >
          {lang === "ar" ? "إلغاء والعودة" : "Cancel"}
        </Button>
        <Button
          type="submit"
          form="admin-add-product-form"
          variant="primary"
          size="md"
          isLoading={isSavingProduct}
          leftIcon={<Upload className="w-4 h-4" />}
          className="flex-1 font-bold shadow-xs justify-center rounded-xl"
        >
          {lang === "ar" ? "نشر المنتج بالمتجر" : "Publish Product"}
        </Button>
      </div>
    </div>
  );
};
