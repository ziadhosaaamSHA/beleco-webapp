"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Package, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { useConfirm } from "@/context/ConfirmContext";
import { productsService } from "@/services/products.service";
import { Product } from "@/types/product.types";
import { Button } from "@/components/ui/Button/Button";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { ProductCard } from "../components/ProductCard";
import { ProductDetailsModal } from "../modals/ProductDetailsModal";
import { ProductEditModal } from "../modals/ProductEditModal";

export interface ProductsListTabProps {
  products: Product[];
  onProductUpdated?: (product: Product) => void;
  onProductDeleted?: (productId: string) => void;
}

export const ProductsListTab: React.FC<ProductsListTabProps> = ({
  products,
  onProductUpdated,
  onProductDeleted,
}) => {
  const { t, lang } = useLanguage();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProductForDetails, setSelectedProductForDetails] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const categories = [
    { id: "all", label: lang === "ar" ? "الكل" : "All" },
    { id: "women", label: lang === "ar" ? "حريمي" : "Women" },
    { id: "kids", label: lang === "ar" ? "أطفال" : "Kids" },
    { id: "premium", label: lang === "ar" ? "بريميوم" : "Premium" },
    { id: "sale", label: lang === "ar" ? "تخفيضات" : "Sale" },
    { id: "general", label: lang === "ar" ? "عام" : "General" },
  ];

  const filteredProducts = products.filter((p) => {
    if (selectedCategory === "all") return true;
    return p.category === selectedCategory;
  });

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
    <div className="flex flex-col gap-4 text-left" dir="ltr">
      {/* Header Action: Add Product Button & Total Count */}
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

      {/* Category Filter Tabs */}
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

      {/* Products Grid */}
      <div className="flex flex-col gap-3">
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                onView={(p) => setSelectedProductForDetails(p)}
                onEdit={(p) => setEditingProduct(p)}
                onDelete={handleDeleteProduct}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Package className="w-6 h-6" />}
            title={lang === "ar" ? "لسه مفيش منتجات منشورة" : "No published products"}
            description={
              lang === "ar"
                ? "استخدمي زر الإضافة أعلاه لنشر منتجات جديدة في المتجر"
                : "Use the button above to add new products to the storefront"
            }
            actionText={t("admin.products.addNew")}
            actionHref="/admin/products/new"
          />
        )}
      </div>

      {/* Product Details Modal */}
      <ProductDetailsModal
        product={selectedProductForDetails}
        isOpen={!!selectedProductForDetails}
        onClose={() => setSelectedProductForDetails(null)}
        onEdit={(prod) => {
          setSelectedProductForDetails(null);
          setEditingProduct(prod);
        }}
        onDelete={handleDeleteProduct}
      />

      {/* Product Edit Modal */}
      <ProductEditModal
        product={editingProduct}
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        onSuccess={(updated) => {
          onProductUpdated?.(updated);
          if (selectedProductForDetails?.id === updated.id) {
            setSelectedProductForDetails(updated);
          }
        }}
      />
    </div>
  );
};
