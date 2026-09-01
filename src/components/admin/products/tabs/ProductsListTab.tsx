"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Package,
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Filter,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { useConfirm } from "@/context/ConfirmContext";
import { productsService } from "@/services/products.service";
import { Product } from "@/types/product.types";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { Card } from "@/components/ui/Card/Card";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { ProductCard } from "../components/ProductCard";

export interface ProductsListTabProps {
  products: Product[];
  onProductUpdated?: (product: Product) => void;
  onProductDeleted?: (productId: string) => void;
}

type ProductSortOption = "newest" | "oldest" | "price_asc" | "price_desc" | "name_asc";

export const ProductsListTab: React.FC<ProductsListTabProps> = ({
  products,
  onProductDeleted,
}) => {
  const { t, lang } = useLanguage();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPlacement, setSelectedPlacement] = useState<string>("all");
  const [pricePreset, setPricePreset] = useState<string>("all");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [sortOption, setSortOption] = useState<ProductSortOption>("newest");
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  const categories = [
    { id: "all", label: lang === "ar" ? "الكل" : "All" },
    { id: "women", label: lang === "ar" ? "حريمي" : "Women" },
    { id: "kids", label: lang === "ar" ? "أطفال" : "Kids" },
    { id: "premium", label: lang === "ar" ? "بريميوم" : "Premium" },
    { id: "sale", label: lang === "ar" ? "تخفيضات" : "Sale" },
    { id: "general", label: lang === "ar" ? "عام" : "General" },
  ];

  const placements = [
    { id: "all", labelAr: "كل الأقسام", labelEn: "All Placements" },
    { id: "trend", labelAr: "ترند الأسبوع", labelEn: "Weekly Trend" },
    { id: "fashion", labelAr: "فاشون", labelEn: "Fashion" },
    { id: "beauty", labelAr: "بيوتي", labelEn: "Beauty" },
    { id: "homeware", labelAr: "هوم وير", labelEn: "Homeware" },
    { id: "summer", labelAr: "صيف 2026", labelEn: "Summer" },
    { id: "picks", labelAr: "اختيارات المؤثرين", labelEn: "Influencer Picks" },
  ];

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedPlacement("all");
    setPricePreset("all");
    setMinPrice("");
    setMaxPrice("");
    setSortOption("newest");
  };

  const isFiltersActive =
    Boolean(searchQuery.trim()) ||
    selectedCategory !== "all" ||
    selectedPlacement !== "all" ||
    pricePreset !== "all" ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    sortOption !== "newest";

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // 1. Category
        if (selectedCategory !== "all" && p.category !== selectedCategory) {
          return false;
        }

        // 2. Placement
        if (selectedPlacement !== "all") {
          const hasPlacement =
            p.placement === selectedPlacement ||
            (Array.isArray(p.placements) && p.placements.includes(selectedPlacement));
          if (!hasPlacement) return false;
        }

        // 3. Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const name = (p.name || "").toLowerCase();
          const id = (p.id || "").toLowerCase();
          const link = (p.link || "").toLowerCase();
          const colors = (p.colors || []).join(" ").toLowerCase();
          const sizes = (p.sizes || []).join(" ").toLowerCase();

          const matches =
            name.includes(q) ||
            id.includes(q) ||
            link.includes(q) ||
            colors.includes(q) ||
            sizes.includes(q);

          if (!matches) return false;
        }

        // 4. Price filter
        const price = Number(p.price) || 0;
        if (pricePreset === "under500" && price >= 500) return false;
        if (pricePreset === "500_1000" && (price < 500 || price > 1000)) return false;
        if (pricePreset === "1000_2000" && (price < 1000 || price > 2000)) return false;
        if (pricePreset === "above2000" && price <= 2000) return false;

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
        return 0;
      });
  }, [products, selectedCategory, selectedPlacement, searchQuery, pricePreset, minPrice, maxPrice, sortOption]);

  const handleDeleteProduct = async (prod: Product) => {
    const isConfirmed = await confirm({
      title: t("admin.products.deleteConfirmTitle"),
      message: `${t("admin.products.deleteConfirmMsg")}\n\n• ${prod.name}`,
      confirmText: lang === "ar" ? "حذف" : "Delete",
      cancelText: lang === "ar" ? "إلغاء" : "Cancel",
      isDestructive: true,
    });

    if (!isConfirmed) return;

    try {
      await productsService.deleteProduct(prod.id, prod.imagePath);
      onProductDeleted?.(prod.id);
      showToast(
        lang === "ar" ? "تم حذف المنتج من المتجر بنجاح" : "Product deleted from store",
        "success"
      );
    } catch {
      showToast(lang === "ar" ? "حدث خطأ أثناء حذف المنتج" : "Error deleting product", "error");
    }
  };

  return (
    <div className="flex flex-col gap-3.5 text-left" dir="ltr">
      {/* 1. Header Action & Add Button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-sans font-bold text-brand-neutral-700">
            {lang === "ar" ? "المنتجات المعروضة:" : "Published Products:"}
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-primary-50 text-primary-700 text-xs font-mono font-bold">
            {products.length}
          </span>
        </div>

        <Link href="/admin/products/new">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            className="rounded-xl font-bold text-xs shadow-xs"
          >
            {t("admin.products.addNew")}
          </Button>
        </Link>
      </div>

      {/* 2. Search Bar & Filter Toggle */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === "ar"
                ? "بحث بالاسم، المقاس، اللون، أو كود المنتج..."
                : "Search by name, size, color, product ID..."
            }
            leftIcon={<Search className="w-4 h-4 text-brand-neutral-400" />}
            className="w-full bg-white shadow-2xs text-xs"
            aria-label="Search products"
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
          {lang === "ar" ? "تصفية" : "Filter"}
        </Button>
      </div>

      {/* 3. Expandable Filters Panel */}
      {showFiltersPanel && (
        <Card className="p-3.5 flex flex-col gap-3 bg-white border border-brand-neutral-200/90 shadow-2xs rounded-2xl animate-in fade-in-50 zoom-in-98 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-brand-neutral-100">
            <span className="text-xs font-sans font-bold text-brand-neutral-900 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-primary-600" />
              <span>{lang === "ar" ? "فلاتر المنتجات والترتيب" : "Product Filters & Sort"}</span>
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

          {/* Placement Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-sans font-bold text-brand-neutral-700 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-primary-500" />
              <span>{lang === "ar" ? "مكان العرض بالصفحة الرئيسية:" : "Storefront Placement:"}</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {placements.map((pl) => (
                <button
                  key={pl.id}
                  type="button"
                  onClick={() => setSelectedPlacement(pl.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-sans font-bold border transition-all ${
                    selectedPlacement === pl.id
                      ? "bg-primary-50 text-primary-700 border-primary-400 shadow-2xs"
                      : "bg-brand-neutral-50 text-brand-neutral-600 border-brand-neutral-200 hover:bg-brand-neutral-100"
                  }`}
                >
                  {lang === "ar" ? pl.labelAr : pl.labelEn}
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
                { id: "all", labelAr: "كل الأسعار", labelEn: "All" },
                { id: "under500", labelAr: "أقل من 500", labelEn: "< 500" },
                { id: "500_1000", labelAr: "500 - 1000", labelEn: "500 - 1000" },
                { id: "1000_2000", labelAr: "1000 - 2000", labelEn: "1000 - 2000" },
                { id: "above2000", labelAr: "أكثر من 2000", labelEn: "2000+" },
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
              <span>{lang === "ar" ? "ترتيب المنتجات:" : "Sort Products:"}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { id: "newest", labelAr: "الأحدث", labelEn: "Newest" },
                { id: "oldest", labelAr: "الأقدم", labelEn: "Oldest" },
                { id: "price_asc", labelAr: "السعر: الأقل للأعلى", labelEn: "Price: Low to High" },
                { id: "price_desc", labelAr: "السعر: الأعلى للأقل", labelEn: "Price: High to Low" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSortOption(s.id as ProductSortOption)}
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

      {/* 4. Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "primary" : "secondary"}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
            className="rounded-xl font-bold text-xs shrink-0"
          >
            {cat.label} ({cat.id === "all" ? products.length : products.filter((p) => p.category === cat.id).length})
          </Button>
        ))}
      </div>

      {/* 5. Results Count and Reset Badge */}
      <div className="flex items-center justify-between px-1 text-xs font-sans">
        <span className="text-brand-neutral-500 font-medium">
          {lang === "ar"
            ? `عرض ${filteredProducts.length} من إجمالي ${products.length} منتج`
            : `Showing ${filteredProducts.length} of ${products.length} products`}
        </span>
        {isFiltersActive && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-primary-600 font-bold hover:underline"
          >
            {lang === "ar" ? "مسح التصفية" : "Clear filters"}
          </button>
        )}
      </div>

      {/* 6. Products Grid */}
      <div className="flex flex-col gap-3">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onDelete={handleDeleteProduct}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Package className="w-6 h-6" />}
            title={lang === "ar" ? "لم يتم العثور على منتجات مطابقة" : "No matching products"}
            description={
              lang === "ar"
                ? "جربي البحث بكلمات أخرى أو إلغاء فلاتر التصفية"
                : "Try searching with different terms or reset your active filters"
            }
            actionText={isFiltersActive ? (lang === "ar" ? "إعادة تعيين الفلاتر" : "Reset Filters") : t("admin.products.addNew")}
            actionHref={isFiltersActive ? undefined : "/admin/products/new"}
            onAction={isFiltersActive ? handleResetFilters : undefined}
          />
        )}
      </div>
    </div>
  );
};
