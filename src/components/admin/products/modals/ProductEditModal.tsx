"use client";

import React, { useState, useRef, useEffect } from "react";
import { Edit3, Check, Camera, Ruler, Palette, X, ChevronDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { productsService } from "@/services/products.service";
import { Product } from "@/types/product.types";
import { Modal } from "@/components/ui/Modal/Modal";
import { Button } from "@/components/ui/Button/Button";

export interface ProductEditModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedProduct: Product) => void;
}

export const ProductEditModal: React.FC<ProductEditModalProps> = ({
  product,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { lang } = useLanguage();
  const { showToast } = useToast();

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
    if (product) {
      setEditForm({
        name: product.name || "",
        price: String(product.price || ""),
        originalPrice: String(product.originalPrice || ""),
        category: product.category || "women",
        placements:
          Array.isArray(product.placements) && product.placements.length > 0
            ? product.placements
            : product.placement
            ? [product.placement]
            : ["trend"],
        link: product.link || "",
        colors:
          Array.isArray(product.colors) && product.colors.length > 0
            ? product.colors
            : product.color
            ? [product.color]
            : [],
        sizes:
          Array.isArray(product.sizes) && product.sizes.length > 0
            ? product.sizes
            : product.size
            ? [product.size]
            : ["Free Size"],
      });
      setEditImagePreview(product.imageUrl || "");
      setEditImageFile(null);
    }
  }, [product]);

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
    if (!product) return;

    if (!editForm.name.trim() || !editForm.price) {
      showToast(lang === "ar" ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill required fields", "error");
      return;
    }

    setIsUpdating(true);
    try {
      let finalImageUrl = product.imageUrl || "";
      let finalImagePath = product.imagePath || "";

      if (editImageFile) {
        const uploadRes = await productsService.uploadImage(editImageFile);
        finalImageUrl = uploadRes.imageUrl;
        finalImagePath = uploadRes.imagePath;
      }

      const updates = {
        name: editForm.name.trim(),
        price: parseFloat(editForm.price) || 0,
        originalPrice: editForm.originalPrice ? parseFloat(editForm.originalPrice) : undefined,
        category: editForm.category,
        placement: editForm.placements[0] || "trend",
        placements: editForm.placements,
        link: editForm.link.trim() || undefined,
        sizes: editForm.sizes.length > 0 ? editForm.sizes : ["Free Size"],
        size: editForm.sizes[0] || "Free Size",
        colors: editForm.colors,
        color: editForm.colors[0] || undefined,
        imageUrl: finalImageUrl,
        imagePath: finalImagePath,
      };

      await productsService.updateProduct(product.id, updates);

      const updatedProduct: Product = {
        ...product,
        ...updates,
      };

      onSuccess(updatedProduct);
      showToast(lang === "ar" ? "تم تحديث بيانات المنتج بنجاح ✓" : "Product updated successfully ✓", "success");
      onClose();
    } catch (err) {
      console.error("Error updating product:", err);
      showToast(lang === "ar" ? "حدث خطأ أثناء تعديل المنتج" : "Failed to update product", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!product) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lang === "ar" ? "تعديل بيانات المنتج" : "Edit Product Details"}
      icon={<Edit3 className="w-4 h-4" />}
      maxWidth="md"
      footer={
        <div className="grid grid-cols-2 gap-2 w-full" dir="ltr">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onClose}
            className="w-full text-xs font-bold rounded-2xl justify-center bg-brand-neutral-100"
          >
            {lang === "ar" ? "إلغاء" : "Cancel"}
          </Button>
          <Button
            type="submit"
            form="admin-edit-product-form"
            variant="primary"
            size="md"
            isLoading={isUpdating}
            leftIcon={<Check className="w-4 h-4" />}
            className="w-full text-xs font-bold rounded-2xl justify-center shadow-xs"
          >
            {lang === "ar" ? "حفظ التعديلات" : "Save Changes"}
          </Button>
        </div>
      }
    >
      <form id="admin-edit-product-form" onSubmit={handleSave} className="flex flex-col gap-3.5 text-left" dir="ltr">
        {/* Image Selection / Preview */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-sans font-bold text-brand-neutral-800">
            {lang === "ar" ? "صورة المنتج" : "Product Image"}
          </label>
          <div
            onClick={() => editProductImageInputRef.current?.click()}
            className="border-1.5 border-dashed border-brand-neutral-300 rounded-2xl p-3 flex flex-col items-center justify-center gap-2 bg-brand-neutral-50/70 hover:bg-brand-neutral-100/70 transition-colors cursor-pointer text-center"
          >
            {editImagePreview ? (
              <div className="flex flex-col items-center gap-1.5">
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-brand-neutral-200 shadow-2xs">
                  <img src={editImagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <span className="text-[11px] font-sans font-bold text-primary-600 underline">
                  {lang === "ar" ? "اضغطي هنا لتغيير الصورة" : "Click to change image"}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-sans text-brand-neutral-600 font-medium">
                <Camera className="w-4 h-4 text-primary-500" />
                <span>{lang === "ar" ? "اختيار صورة جديدة" : "Select new image"}</span>
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

        {/* Name */}
        <input
          type="text"
          placeholder={
            lang === "ar"
              ? "اسم المنتج وتفاصيل القطعة (مثال: فستان سهرة مطرز)"
              : "Product Name & Details (e.g. Elegant Dress)"
          }
          value={editForm.name}
          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
          aria-label={lang === "ar" ? "اسم المنتج" : "Product Name"}
          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-brand-neutral-200 text-xs font-sans text-brand-neutral-900 placeholder:text-brand-neutral-400 outline-none focus:border-primary-500"
          required
        />

        {/* Prices */}
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder={
              lang === "ar"
                ? "سعر البيع بالجنيه (مثال: 650)"
                : "Price in EGP (e.g. 650)"
            }
            value={editForm.price}
            onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
            aria-label={lang === "ar" ? "سعر البيع" : "Price"}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-brand-neutral-200 text-xs font-mono font-bold text-brand-neutral-900 placeholder:text-brand-neutral-400 outline-none focus:border-primary-500"
            required
          />
          <input
            type="number"
            placeholder={
              lang === "ar"
                ? "السعر قبل الخصم (اختياري، 850)"
                : "Original Price (Optional, 850)"
            }
            value={editForm.originalPrice}
            onChange={(e) => setEditForm({ ...editForm, originalPrice: e.target.value })}
            aria-label={lang === "ar" ? "السعر قبل الخصم" : "Original Price"}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-brand-neutral-200 text-xs font-mono text-brand-neutral-900 placeholder:text-brand-neutral-400 outline-none focus:border-primary-500"
          />
        </div>

        {/* Category */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-sans font-bold text-brand-neutral-800">
            {lang === "ar" ? "القسم" : "Category"}
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
            {lang === "ar" ? "مكان الظهور" : "Placements"}
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
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-bold border cursor-pointer select-none transition-all ${
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

        {/* Sizes */}
        <div className="flex flex-col gap-2 p-3 rounded-2xl bg-brand-neutral-50 border border-brand-neutral-200">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-primary-600" />
            <span className="text-xs font-sans font-bold text-brand-neutral-900">
              {lang === "ar" ? "المقاسات (Sizes)" : "Available Sizes"}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 min-h-[28px] items-center">
            {editForm.sizes.map((sz) => (
              <span
                key={sz}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl bg-white border border-brand-neutral-300 text-xs font-mono font-bold text-brand-neutral-900 shadow-2xs"
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
              placeholder={lang === "ar" ? "اكتبي المقاس واضغطي Enter" : "Type size and press Enter"}
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
        </div>

        {/* Colors */}
        <div className="flex flex-col gap-2 p-3 rounded-2xl bg-brand-neutral-50 border border-brand-neutral-200">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-primary-600" />
            <span className="text-xs font-sans font-bold text-brand-neutral-900">
              {lang === "ar" ? "الألوان (Colors)" : "Available Colors"}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 min-h-[28px] items-center">
            {editForm.colors.map((cl) => (
              <span
                key={cl}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl bg-white border border-brand-neutral-300 text-xs font-sans font-bold text-brand-neutral-900 shadow-2xs"
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
              placeholder={lang === "ar" ? "اكتبي اللون واضغطي Enter" : "Type color and press Enter"}
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
        </div>

        {/* Link */}
        <input
          type="url"
          placeholder={
            lang === "ar"
              ? "رابط القطعة في المتجر الأصلي (اختياري، https://...)"
              : "Original Store Product Link (Optional, https://...)"
          }
          value={editForm.link}
          onChange={(e) => setEditForm({ ...editForm, link: e.target.value })}
          aria-label={lang === "ar" ? "رابط المتجر الأصلي" : "Original Store Link"}
          className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-brand-neutral-200 text-xs font-sans text-brand-neutral-900 placeholder:text-brand-neutral-400 outline-none focus:border-primary-500"
        />
      </form>
    </Modal>
  );
};
