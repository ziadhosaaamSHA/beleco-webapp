"use client";

import React, { useState, useRef, useMemo } from "react";
import QRCode from "qrcode";
import * as XLSX from "xlsx";
import {
  Plus,
  Package,
  FileSpreadsheet,
  QrCode,
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Filter,
  AlertTriangle,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { useConfirm } from "@/context/ConfirmContext";
import { bazaarService } from "@/services/bazaar.service";
import { BazaarProduct } from "@/types/bazaar.types";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { Heading } from "@/components/ui/Heading/Heading";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { BazaarItemCard } from "@/components/cards/BazaarItemCard";

export interface InventoryTabProps {
  products: BazaarProduct[];
}

type InventorySortOption = "newest" | "oldest" | "price_asc" | "price_desc" | "name_asc" | "stock_desc";

export const InventoryTab: React.FC<InventoryTabProps> = ({ products }) => {
  const { t, lang } = useLanguage();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [photoTargetProduct, setPhotoTargetProduct] = useState<BazaarProduct | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "low_stock" | "out_of_stock">("all");
  const [pricePreset, setPricePreset] = useState<string>("all");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortOption, setSortOption] = useState<InventorySortOption>("newest");
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const handleAddBazaarProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPrice) return;

    try {
      await bazaarService.addProduct({
        name: newProdName.trim(),
        price: parseFloat(newProdPrice) || 0,
      });
      setNewProdName("");
      setNewProdPrice("");
      showToast(lang === "ar" ? "تمت إضافة المنتج بنجاح" : "Product added successfully", "success");
    } catch {
      showToast(lang === "ar" ? "حدث خطأ أثناء إضافة المنتج" : "Error adding product", "error");
    }
  };

  const handleDeleteBazaarProduct = async (product: BazaarProduct) => {
    const isConfirmed = await confirm({
      title: lang === "ar" ? "حذف منتج من البازار" : "Delete Bazaar Product",
      message:
        lang === "ar"
          ? `هل أنت متأكد من حذف "${product.name}" نهائياً من قائمة المنتجات؟`
          : `Are you sure you want to permanently delete "${product.name}"?`,
      confirmText: lang === "ar" ? "حذف" : "Delete",
      cancelText: lang === "ar" ? "إلغاء" : "Cancel",
      isDestructive: true,
    });

    if (!isConfirmed) return;

    try {
      await bazaarService.deleteProduct(product.id, product.imagePath);
      showToast(lang === "ar" ? "تم حذف المنتج بنجاح" : "Product deleted successfully", "success");
    } catch {
      showToast(lang === "ar" ? "حدث خطأ أثناء حذف المنتج" : "Error deleting product", "error");
    }
  };

  const handlePrintAllQRs = async () => {
    if (!products.length) {
      showToast(lang === "ar" ? "لا توجد منتجات لطباعة أكوادها" : "No products to print QR", "error");
      return;
    }

    const tagsHtml = await Promise.all(
      products.map(async (p) => {
        const qrDataUrl = await QRCode.toDataURL(p.id, { width: 220, margin: 0 });
        return `<div style="text-align:center; display:inline-block; margin:8px; border:1px solid #ccc; padding:8px; border-radius:8px;">
          <img src="${qrDataUrl}" style="width:110px; height:110px; display:block;" />
          <div style="font-family:sans-serif; font-size:11px; font-weight:bold; margin-top:4px; max-width:110px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${p.name}</div>
          <div style="font-family:sans-serif; font-size:12px; color:#F0660E; font-weight:bold;">${p.price} EGP</div>
        </div>`;
      })
    );

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html><html><head><meta charset="UTF-8"><title>Beleco QR Tags</title>
      <style>body{margin:0;padding:10px;display:flex;flex-wrap:wrap;gap:8px;}@media print{body{padding:0;}}</style>
      </head><body>${tagsHtml.join("")}<script>window.onload=()=>window.print();<\/script></body></html>
    `);
    win.document.close();
  };

  const handlePhotoSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !photoTargetProduct) return;

    try {
      showToast(lang === "ar" ? "جاري رفع صورة المنتج..." : "Uploading product photo...", "info");
      await bazaarService.uploadProductPhoto(photoTargetProduct.id, file);
      showToast(lang === "ar" ? "تم تحديث صورة المنتج بنجاح" : "Product photo updated", "success");
    } catch {
      showToast(lang === "ar" ? "فشل رفع الصورة" : "Failed to upload photo", "error");
    } finally {
      setPhotoTargetProduct(null);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);

      const itemsToImport = rows
        .map((r) => ({
          name: String(r["الاسم"] || r["اسم المنتج"] || r["Name"] || r["name"] || "").trim(),
          price: parseFloat(r["السعر"] || r["سعر البيع"] || r["Price"] || r["price"] || 0),
        }))
        .filter((i) => i.name && i.price > 0);

      if (!itemsToImport.length) {
        showToast(
          lang === "ar"
            ? "لم يتم العثور على أعمدة صالحة (الاسم، السعر) في الملف"
            : "No valid columns found in file",
          "error"
        );
        return;
      }

      showToast(
        lang === "ar"
          ? `جاري استيراد ${itemsToImport.length} منتج...`
          : `Importing ${itemsToImport.length} items...`,
        "info"
      );

      for (const item of itemsToImport) {
        await bazaarService.addProduct(item);
      }

      showToast(
        lang === "ar"
          ? `تم استيراد ${itemsToImport.length} منتج بنجاح`
          : `Imported ${itemsToImport.length} items successfully`,
        "success"
      );
    } catch {
      showToast(lang === "ar" ? "فشل قراءة ملف الإكسيل" : "Failed to read Excel file", "error");
    } finally {
      if (excelInputRef.current) excelInputRef.current.value = "";
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setStockFilter("all");
    setPricePreset("all");
    setMinPrice("");
    setMaxPrice("");
    setSortOption("newest");
  };

  const isFiltersActive =
    searchQuery.trim() !== "" ||
    stockFilter !== "all" ||
    pricePreset !== "all" ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    sortOption !== "newest";

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Search query (name, barcode, id)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const name = (p.name || "").toLowerCase();
          const barcode = (p.barcode || "").toLowerCase();
          const id = (p.id || "").toLowerCase();

          if (!name.includes(q) && !barcode.includes(q) && !id.includes(q)) {
            return false;
          }
        }

        // Stock filter
        const stock = p.stock ?? 1; // Default to 1 if not specified
        if (stockFilter === "in_stock" && stock <= 0) return false;
        if (stockFilter === "low_stock" && (stock <= 0 || stock > 2)) return false;
        if (stockFilter === "out_of_stock" && stock > 0) return false;

        // Price filter
        const price = Number(p.price) || 0;
        if (pricePreset === "under200" && price >= 200) return false;
        if (pricePreset === "200_500" && (price < 200 || price > 500)) return false;
        if (pricePreset === "500_1000" && (price < 500 || price > 1000)) return false;
        if (pricePreset === "above1000" && price <= 1000) return false;

        if (minPrice && price < parseFloat(minPrice)) return false;
        if (maxPrice && price > parseFloat(maxPrice)) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortOption === "newest") {
          return (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0);
        }
        if (sortOption === "oldest") {
          return (Number(a.createdAt) || 0) - (Number(b.createdAt) || 0);
        }
        if (sortOption === "price_asc") {
          return (Number(a.price) || 0) - (Number(b.price) || 0);
        }
        if (sortOption === "price_desc") {
          return (Number(b.price) || 0) - (Number(a.price) || 0);
        }
        if (sortOption === "name_asc") {
          return (a.name || "").localeCompare(b.name || "");
        }
        if (sortOption === "stock_desc") {
          return (Number(b.stock) || 0) - (Number(a.stock) || 0);
        }
        return 0;
      });
  }, [products, searchQuery, stockFilter, pricePreset, minPrice, maxPrice, sortOption]);

  return (
    <div className="flex flex-col gap-3.5 text-left" dir="ltr">
      {/* 1. Quick Actions: Print All QRs & Excel Import */}
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={handlePrintAllQRs}
          leftIcon={<QrCode className="w-4 h-4 text-primary-500" />}
          className="rounded-xl font-bold bg-white"
        >
          {t("admin.bazaar.printAllQRs")}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => excelInputRef.current?.click()}
          leftIcon={<FileSpreadsheet className="w-4 h-4 text-success-600" />}
          className="rounded-xl font-bold bg-white"
        >
          {t("admin.bazaar.importExcel")}
        </Button>
      </div>

      <input
        type="file"
        ref={excelInputRef}
        accept=".xlsx, .xls, .csv"
        className="hidden"
        onChange={handleExcelImport}
      />
      <input
        type="file"
        ref={photoInputRef}
        accept="image/*"
        className="hidden"
        onChange={handlePhotoSelected}
      />

      {/* 2. Add Manual Product Form */}
      <Card className="p-3.5 flex flex-col gap-2.5 bg-white border border-brand-neutral-200/90 shadow-2xs rounded-2xl">
        <Heading variant="card-title" className="text-xs sm:text-sm font-bold">
          {t("admin.bazaar.addManualProduct")}
        </Heading>
        <form onSubmit={handleAddBazaarProduct} className="flex flex-col gap-2">
          <Input
            placeholder={
              lang === "ar"
                ? "اسم القطعة بالبازار (مثال: توب قطن بيج)"
                : "Bazaar Item Name (e.g. Cotton Top)"
            }
            value={newProdName}
            onChange={(e) => setNewProdName(e.target.value)}
            className="text-xs"
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder={lang === "ar" ? "السعر (مثال: 350)" : "Price (e.g. 350)"}
              value={newProdPrice}
              onChange={(e) => setNewProdPrice(e.target.value)}
              suffix="EGP"
              className="text-xs"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={<Plus className="w-4 h-4" />}
              className="font-bold text-xs justify-center rounded-xl"
            >
              {lang === "ar" ? "إضافة للمخزون" : "Add to Stock"}
            </Button>
          </div>
        </form>
      </Card>

      {/* 3. Search Bar & Filter Toggle */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === "ar"
                ? "بحث بالاسم، الباركود، أو الكود..."
                : "Search item name, barcode, or ID..."
            }
            leftIcon={<Search className="w-4 h-4 text-brand-neutral-400" />}
            className="w-full bg-white shadow-2xs text-xs"
            aria-label="Search inventory"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-brand-neutral-400 hover:text-brand-neutral-700 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <Button
          variant={showFiltersPanel || isFiltersActive ? "primary" : "secondary"}
          size="md"
          onClick={() => setShowFiltersPanel(!showFiltersPanel)}
          leftIcon={<SlidersHorizontal className="w-4 h-4" />}
          className="rounded-xl font-bold text-xs shrink-0 bg-white"
        >
          {lang === "ar" ? "فلترة" : "Filter"}
        </Button>
      </div>

      {/* 4. Expandable Filters Panel */}
      {showFiltersPanel && (
        <Card className="p-3.5 flex flex-col gap-3 bg-white border border-brand-neutral-200/90 shadow-2xs rounded-2xl animate-in fade-in-50 zoom-in-98 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-brand-neutral-100">
            <span className="text-xs font-sans font-bold text-brand-neutral-900 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-primary-600" />
              <span>{lang === "ar" ? "فلاتر المخزون والتسعير" : "Inventory & Price Filters"}</span>
            </span>
            {isFiltersActive && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-[11px] font-sans font-bold text-danger-600 hover:underline"
              >
                {lang === "ar" ? "إلغاء كل الفلاتر" : "Reset All"}
              </button>
            )}
          </div>

          {/* Stock Filter Pills */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-sans font-bold text-brand-neutral-700">
              {lang === "ar" ? "حالة التوفر بالمخزون:" : "Stock Status:"}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "all", labelAr: "الكل", labelEn: "All" },
                { id: "in_stock", labelAr: "متوفر", labelEn: "In Stock" },
                { id: "low_stock", labelAr: "مخزون منخفض (1-2)", labelEn: "Low Stock" },
                { id: "out_of_stock", labelAr: "نفذت الكمية", labelEn: "Out of Stock" },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStockFilter(st.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-sans font-bold border transition-all ${
                    stockFilter === st.id
                      ? "bg-primary-50 text-primary-700 border-primary-400 shadow-2xs"
                      : "bg-brand-neutral-50 text-brand-neutral-600 border-brand-neutral-200 hover:bg-brand-neutral-100"
                  }`}
                >
                  {lang === "ar" ? st.labelAr : st.labelEn}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="flex flex-col gap-1.5 pt-1 border-t border-brand-neutral-100">
            <label className="text-[11px] font-sans font-bold text-brand-neutral-700">
              {lang === "ar" ? "نطاق السعر بالجنيه (EGP)" : "Price Range (EGP)"}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: "all", labelAr: "الكل", labelEn: "All" },
                { id: "under200", labelAr: "أقل من 200", labelEn: "< 200" },
                { id: "200_500", labelAr: "200 - 500", labelEn: "200 - 500" },
                { id: "500_1000", labelAr: "500 - 1000", labelEn: "500 - 1000" },
                { id: "above1000", labelAr: "أكثر من 1000", labelEn: "1000+" },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setPricePreset(p.id);
                    setMinPrice("");
                    setMaxPrice("");
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-sans font-bold border transition-all ${
                    pricePreset === p.id
                      ? "bg-primary-50 text-primary-700 border-primary-400 shadow-2xs"
                      : "bg-brand-neutral-50 text-brand-neutral-600 border-brand-neutral-200 hover:bg-brand-neutral-100"
                  }`}
                >
                  {lang === "ar" ? p.labelAr : p.labelEn}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Input
                type="number"
                placeholder={lang === "ar" ? "أقل سعر" : "Min Price"}
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setPricePreset("custom");
                }}
                suffix="EGP"
                className="bg-brand-neutral-50/70 text-xs"
              />
              <Input
                type="number"
                placeholder={lang === "ar" ? "أعلى سعر" : "Max Price"}
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setPricePreset("custom");
                }}
                suffix="EGP"
                className="bg-brand-neutral-50/70 text-xs"
              />
            </div>
          </div>

          {/* Sort By */}
          <div className="flex flex-col gap-1.5 pt-1 border-t border-brand-neutral-100">
            <label className="text-[11px] font-sans font-bold text-brand-neutral-700 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-brand-neutral-500" />
              <span>{lang === "ar" ? "الترتيب:" : "Sort By:"}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {[
                { id: "newest", labelAr: "الأحدث", labelEn: "Newest" },
                { id: "price_asc", labelAr: "السعر: الأقل للأعلى", labelEn: "Price: Low to High" },
                { id: "price_desc", labelAr: "السعر: الأعلى للأقل", labelEn: "Price: High to Low" },
                { id: "name_asc", labelAr: "الاسم (أ - ي)", labelEn: "Name (A - Z)" },
                { id: "stock_desc", labelAr: "الأكثر توفراً", labelEn: "Highest Stock" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSortOption(s.id as InventorySortOption)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-sans font-bold border text-center transition-all ${
                    sortOption === s.id
                      ? "bg-brand-neutral-900 text-white border-brand-neutral-900 shadow-2xs"
                      : "bg-brand-neutral-50 text-brand-neutral-600 border-brand-neutral-200 hover:bg-brand-neutral-100"
                  }`}
                >
                  {lang === "ar" ? s.labelAr : s.labelEn}
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* 5. Inventory Items List */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <Heading variant="section-title" className="text-xs sm:text-sm font-bold text-brand-neutral-900">
            {lang === "ar"
              ? `عناصر المخزون (${filteredProducts.length} من ${products.length})`
              : `Inventory Items (${filteredProducts.length} of ${products.length})`}
          </Heading>
          {isFiltersActive && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-primary-600 font-bold hover:underline"
            >
              {lang === "ar" ? "مسح التصفية" : "Clear filters"}
            </button>
          )}
        </div>

        {filteredProducts.length > 0 ? (
          <div className="flex flex-col gap-2">
            {filteredProducts.map((p) => (
              <BazaarItemCard
                key={p.id}
                product={p}
                onShowQR={async (prod) => {
                  const dataUrl = await QRCode.toDataURL(prod.id, { width: 220, margin: 0 });
                  const win = window.open("", "_blank");
                  win?.document.write(`
                    <!DOCTYPE html><html><head><title>${prod.name}</title></head>
                    <body style="display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
                      <img src="${dataUrl}" style="width:240px;height:240px;" />
                    </body></html>
                  `);
                }}
                onUploadPhoto={(prod) => {
                  setPhotoTargetProduct(prod);
                  photoInputRef.current?.click();
                }}
                onDelete={handleDeleteBazaarProduct}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Package className="w-6 h-6" />}
            title={lang === "ar" ? "لم يتم العثور على قطع مطابقة" : "No matching items"}
            description={
              lang === "ar"
                ? "جربي البحث بكلمات أخرى أو إلغاء فلاتر التصفية"
                : "Try searching with different terms or reset filters"
            }
            actionText={isFiltersActive ? (lang === "ar" ? "إعادة تعيين الفلاتر" : "Reset Filters") : undefined}
            onAction={isFiltersActive ? handleResetFilters : undefined}
          />
        )}
      </div>
    </div>
  );
};
