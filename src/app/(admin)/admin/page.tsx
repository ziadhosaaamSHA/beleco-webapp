"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import * as XLSX from "xlsx";
import {
  Shield,
  ShoppingBag,
  Store,
  Film,
  Camera,
  QrCode,
  FileSpreadsheet,
  Plus,
  Trash2,
  TrendingUp,
  Package,
  Users,
  CheckCircle2,
  ArrowLeft,
  Upload,
  Sparkles,
  Check,
  XCircle,
  Coins,
  Calculator,
  X,
} from "lucide-react";
import { StandardPageLayout } from "@/components/layout/StandardPageLayout";
import { AdminFloatingNavIsland } from "@/components/layout/AdminFloatingNavIsland";
import { Heading } from "@/components/ui/Heading/Heading";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { Card } from "@/components/ui/Card/Card";
import { Badge } from "@/components/ui/Badge/Badge";
import { LoadingState } from "@/components/ui/LoadingState/LoadingState";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { AdminPageSkeleton } from "@/components/ui/Skeleton/Skeleton";
import { BazaarItemCard } from "@/components/cards/BazaarItemCard";
import { BazaarSaleCard } from "@/components/cards/BazaarSaleCard";
import { StatSummaryCard } from "@/components/cards/StatSummaryCard";
import { bazaarService } from "@/services/bazaar.service";
import { ordersService } from "@/services/orders.service";
import { productsService } from "@/services/products.service";
import { reelsService } from "@/services/reels.service";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import { useToast } from "@/context/ToastContext";
import { useConfirm } from "@/context/ConfirmContext";
import type { BazaarProduct, BazaarSale } from "@/types/bazaar.types";
import type { Order, OrderStatus } from "@/types/order.types";
import type { Product, ProductCategory, ProductPlacement } from "@/types/product.types";
import type { Reel } from "@/types/reel.types";

type AdminTab = "bazaar" | "orders" | "products" | "reels";
type BazaarSubTab = "sell" | "inventory" | "report";

const SELLER_KEY = "beleco_bazaar_seller_name";
const ALL_ORDER_STATUSES: OrderStatus[] = [
  "awaiting_calculation",
  "priced",
  "payment_pending_review",
  "payment_flagged",
  "payment_confirmed",
  "ordered",
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
];

function getOrderStatusBadgeVariant(status: OrderStatus): "primary" | "neutral" | "success" | "danger" | "gold" {
  switch (status) {
    case "delivered":
    case "payment_confirmed":
      return "success";
    case "cancelled":
    case "payment_flagged":
      return "danger";
    case "awaiting_calculation":
    case "payment_pending_review":
      return "gold";
    case "priced":
    case "ordered":
    case "pending":
    case "shipped":
      return "primary";
    default:
      return "neutral";
  }
}

export default function AdminDashboardPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const { t, lang } = useLanguage();
  const { formatPrice } = useLocation();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  // Navigation state (Driven by floating bottom nav island)
  const [activeTab, setActiveTab] = useState<AdminTab>("bazaar");
  const [bazaarSubTab, setBazaarSubTab] = useState<BazaarSubTab>("sell");

  // Bazaar State
  const [bazaarProducts, setBazaarProducts] = useState<BazaarProduct[]>([]);
  const [bazaarSales, setBazaarSales] = useState<BazaarSale[]>([]);
  const [sellerName, setSellerName] = useState<string>("");
  const [sellerInput, setSellerInput] = useState<string>("");
  const [scannedProduct, setScannedProduct] = useState<BazaarProduct | null>(null);
  const [saleDiscount, setSaleDiscount] = useState<string>("0");
  const [isRecordingSale, setIsRecordingSale] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderStatus, setSelectedOrderStatus] = useState<string>("all");

  // Storefront Products State
  const [storefrontProducts, setStorefrontProducts] = useState<Product[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productForm, setProductForm] = useState<{
    name: string;
    price: string;
    originalPrice: string;
    category: ProductCategory;
    placement: ProductPlacement;
    description: string;
  }>({
    name: "",
    price: "",
    originalPrice: "",
    category: "abaya",
    placement: "standard",
    description: "",
  });
  const [productImageFile, setProductImageFile] = useState<File | null>(null);
  const [productImagePreview, setProductImagePreview] = useState<string>("");
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Video Reels State
  const [reelsList, setReelsList] = useState<Reel[]>([]);
  const [isAddingReel, setIsAddingReel] = useState(false);
  const [reelForm, setReelForm] = useState<{
    creator: string;
    caption: string;
    taggedProductId: string;
  }>({
    creator: "",
    caption: "",
    taggedProductId: "",
  });
  const [reelVideoFile, setReelVideoFile] = useState<File | null>(null);
  const [isUploadingReel, setIsUploadingReel] = useState(false);

  // Inventory forms & file triggers
  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);
  const [photoTargetProduct, setPhotoTargetProduct] = useState<BazaarProduct | null>(null);
  const html5QrCodeRef = useRef<any>(null);

  const [initialLoading, setInitialLoading] = useState(true);

  // Load seller name from storage
  useEffect(() => {
    const saved = localStorage.getItem(SELLER_KEY);
    if (saved) setSellerName(saved);
  }, []);

  // Subscribe to real-time data
  useEffect(() => {
    if (!isAdmin) {
      setInitialLoading(false);
      return;
    }
    let count = 0;
    const markLoaded = () => {
      count++;
      if (count >= 2) {
        setInitialLoading(false);
      }
    };

    const unsubBazaarProd = bazaarService.subscribeProducts((p) => {
      setBazaarProducts(p);
      markLoaded();
    });
    const unsubSales = bazaarService.subscribeSales((s) => {
      setBazaarSales(s);
      markLoaded();
    });
    const unsubOrders = ordersService.subscribeAllOrders((o) => {
      setOrders(o);
      markLoaded();
    });
    const unsubProducts = productsService.subscribeProducts(undefined, (pr) => {
      setStorefrontProducts(pr);
      markLoaded();
    });
    const unsubReels = reelsService.subscribeReels((r) => {
      setReelsList(r);
      markLoaded();
    });

    return () => {
      unsubBazaarProd();
      unsubSales();
      unsubOrders();
      unsubProducts();
      unsubReels();
    };
  }, [isAdmin]);

  const handleSaveSeller = () => {
    if (!sellerInput.trim()) return;
    localStorage.setItem(SELLER_KEY, sellerInput.trim());
    setSellerName(sellerInput.trim());
    setSellerInput("");
    showToast(
      lang === "ar"
        ? `تم حفظ اسم البائع: ${sellerInput.trim()}`
        : `Seller name saved: ${sellerInput.trim()}`,
      "success"
    );
  };

  const handleChangeSeller = async () => {
    const isConfirmed = await confirm({
      title: lang === "ar" ? "تغيير اسم البائع" : "Change Seller",
      message:
        lang === "ar"
          ? `هل ترغب في تغيير البائع الحالي (${sellerName})؟`
          : `Are you sure you want to change current seller (${sellerName})?`,
      confirmText: lang === "ar" ? "تغيير" : "Change",
      cancelText: lang === "ar" ? "إلغاء" : "Cancel",
    });
    if (!isConfirmed) return;
    localStorage.removeItem(SELLER_KEY);
    setSellerName("");
    showToast(lang === "ar" ? "تمت إزالة اسم البائع الحالي" : "Seller cleared", "info");
  };

  // QR Camera Scanner Toggle
  const toggleScanner = async () => {
    if (isScanning) {
      if (html5QrCodeRef.current) {
        try {
          await html5QrCodeRef.current.stop();
          html5QrCodeRef.current.clear();
        } catch {}
        html5QrCodeRef.current = null;
      }
      setIsScanning(false);
      return;
    }

    setIsScanning(true);
    const { Html5Qrcode } = await import("html5-qrcode");
    const scanner = new Html5Qrcode("bazaar-qr-reader");
    html5QrCodeRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: 240 },
        async (decodedText) => {
          const matched = bazaarProducts.find((p) => p.id === decodedText);
          if (matched) {
            setScannedProduct(matched);
            setSaleDiscount("0");
            await scanner.stop();
            scanner.clear();
            html5QrCodeRef.current = null;
            setIsScanning(false);
          }
        },
        () => {}
      );
    } catch {
      showToast(
        lang === "ar"
          ? "تعذر فتح الكاميرا. تأكدي من منح صلاحيات الكاميرا للموقع."
          : "Unable to access camera. Please check permissions.",
        "error"
      );
      setIsScanning(false);
    }
  };

  // Confirm Sale
  const handleConfirmSale = async () => {
    if (!scannedProduct) return;
    const discount = parseFloat(saleDiscount) || 0;
    const finalPrice = Math.max(0, scannedProduct.price - discount);

    setIsRecordingSale(true);
    try {
      await bazaarService.recordSale({
        productId: scannedProduct.id,
        productName: scannedProduct.name,
        price: scannedProduct.price,
        discount,
        finalPrice,
        seller: sellerName || (lang === "ar" ? "غير معروف" : "Unknown"),
        soldAt: Date.now(),
      });
      showToast(
        lang === "ar"
          ? `تم تسجيل بيع "${scannedProduct.name}" بنجاح`
          : `Recorded sale for "${scannedProduct.name}"`,
        "success"
      );
      setScannedProduct(null);
      setSaleDiscount("0");
    } catch {
      showToast(
        lang === "ar" ? "حدث خطأ أثناء تسجيل البيع" : "Error recording sale",
        "error"
      );
    } finally {
      setIsRecordingSale(false);
    }
  };

  // Refund Sale
  const handleRefundSale = async (sale: BazaarSale) => {
    const isConfirmed = await confirm({
      title: lang === "ar" ? "تأكيد استرجاع / إلغاء بيع" : "Confirm Refund / Cancel Sale",
      message:
        lang === "ar"
          ? `هل أنت متأكد من استرجاع هذا المنتج وإلغاء تسجيل العملية من النظام؟\n\n• المنتج: ${sale.productName}\n• المبلغ: ${sale.finalPrice} ج.م`
          : `Are you sure you want to refund this sale?\n\n• Product: ${sale.productName}\n• Amount: ${sale.finalPrice} EGP`,
      confirmText: lang === "ar" ? "تأكيد الاسترجاع" : "Confirm Refund",
      cancelText: lang === "ar" ? "إلغاء" : "Cancel",
      isDestructive: true,
    });

    if (!isConfirmed) return;

    try {
      await bazaarService.refundSale(sale.id);
      showToast(
        lang === "ar"
          ? "تم استرجاع المنتج وخصمه من المبيعات"
          : "Sale refunded successfully",
        "success"
      );
    } catch {
      showToast(lang === "ar" ? "حدث خطأ أثناء إلغاء البيع" : "Error processing refund", "error");
    }
  };

  // Add Bazaar Product
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

  // Delete Bazaar Product
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

  // Print Pure QR Tags
  const handlePrintAllQRs = async () => {
    if (!bazaarProducts.length) {
      showToast(lang === "ar" ? "لا توجد منتجات لطباعة أكوادها" : "No products to print QR", "error");
      return;
    }

    const tagsHtml = await Promise.all(
      bazaarProducts.map(async (p) => {
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

  // Photo upload handler
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

  // Excel bulk import
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
            : "No valid columns (Name, Price) found in Excel file",
          "error"
        );
        return;
      }

      const count = await bazaarService.bulkImportProducts(itemsToImport);
      showToast(
        lang === "ar"
          ? `تم استيراد ${count} منتج بنجاح`
          : `Imported ${count} products successfully`,
        "success"
      );
    } catch {
      showToast(
        lang === "ar" ? "حدث خطأ أثناء قراءة ملف الإكسيل" : "Error reading Excel file",
        "error"
      );
    } finally {
      if (excelInputRef.current) excelInputRef.current.value = "";
    }
  };

  // Orders status update
  const handleOrderStatusUpdate = async (orderId: string, status: OrderStatus) => {
    try {
      await ordersService.updateStatus(orderId, status);
      showToast(
        lang === "ar" ? "تم تحديث حالة الطلب بنجاح" : "Order status updated",
        "success"
      );
    } catch {
      showToast(lang === "ar" ? "فشل تحديث الحالة" : "Failed to update order status", "error");
    }
  };

  // Storefront Product creation
  const handleCreateStorefrontProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.price) {
      showToast(lang === "ar" ? "يرجى ملء الاسم والسعر" : "Please fill name and price", "error");
      return;
    }

    setIsSavingProduct(true);
    try {
      let imageUrl = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&auto=format&fit=crop&q=80";
      let imagePath = "";

      if (productImageFile) {
        const uploadRes = await productsService.uploadImage(productImageFile);
        imageUrl = uploadRes.imageUrl;
        imagePath = uploadRes.imagePath;
      }

      const price = parseFloat(productForm.price) || 0;
      const originalPrice = productForm.originalPrice ? parseFloat(productForm.originalPrice) : undefined;

      await productsService.addProduct({
        name: productForm.name.trim(),
        price,
        originalPrice,
        imageUrl,
        imagePath,
        category: productForm.category,
        placement: productForm.placement,
        description: productForm.description.trim() || undefined,
        inStock: true,
      });

      showToast(
        lang === "ar"
          ? "تمت إضافة المنتج إلى كتالوج المتجر بنجاح"
          : "Product added to storefront catalog",
        "success"
      );
      setProductForm({
        name: "",
        price: "",
        originalPrice: "",
        category: "abaya",
        placement: "standard",
        description: "",
      });
      setProductImageFile(null);
      setProductImagePreview("");
      setIsAddingProduct(false);
    } catch {
      showToast(
        lang === "ar" ? "حدث خطأ أثناء إضافة المنتج" : "Failed to add product",
        "error"
      );
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Delete Storefront Product
  const handleDeleteStorefrontProduct = async (prod: Product) => {
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
      showToast(
        lang === "ar" ? "تم حذف المنتج من المتجر بنجاح" : "Product deleted from store",
        "success"
      );
    } catch {
      showToast(lang === "ar" ? "حدث خطأ أثناء حذف المنتج" : "Error deleting product", "error");
    }
  };

  // Upload Video Reel
  const handleUploadReel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reelVideoFile) {
      showToast(lang === "ar" ? "يرجى اختيار ملف الفيديو" : "Please select a video file", "error");
      return;
    }
    if (!reelForm.creator.trim() || !reelForm.caption.trim()) {
      showToast(lang === "ar" ? "يرجى كتابة اسم المنشئ والوصف" : "Please enter creator and caption", "error");
      return;
    }

    setIsUploadingReel(true);
    try {
      let taggedProductData: Reel["taggedProduct"] = undefined;
      if (reelForm.taggedProductId) {
        const found = storefrontProducts.find((p) => p.id === reelForm.taggedProductId);
        if (found) {
          taggedProductData = {
            productId: found.id,
            name: found.name,
            price: found.price,
            imageUrl: found.imageUrl,
          };
        }
      }

      await reelsService.uploadReel(reelVideoFile, {
        creator: reelForm.creator.trim(),
        caption: reelForm.caption.trim(),
        taggedProduct: taggedProductData,
      });

      showToast(
        lang === "ar" ? "تم نشر فيديو الريلز بنجاح" : "Reel published successfully",
        "success"
      );
      setReelForm({ creator: "", caption: "", taggedProductId: "" });
      setReelVideoFile(null);
      setIsAddingReel(false);
    } catch {
      showToast(lang === "ar" ? "فشل رفع فيديو الريلز" : "Failed to upload reel", "error");
    } finally {
      setIsUploadingReel(false);
    }
  };

  // Delete Video Reel
  const handleDeleteReel = async (reel: Reel) => {
    const isConfirmed = await confirm({
      title: t("admin.reels.deleteConfirmTitle"),
      message: `${t("admin.reels.deleteConfirmMsg")}\n\n• ${reel.caption}`,
      confirmText: lang === "ar" ? "حذف" : "Delete",
      cancelText: lang === "ar" ? "إلغاء" : "Cancel",
      isDestructive: true,
    });

    if (!isConfirmed) return;

    try {
      await reelsService.deleteReel(reel.id, reel.videoPath);
      showToast(lang === "ar" ? "تم حذف فيديو الريلز بنجاح" : "Reel deleted successfully", "success");
    } catch {
      showToast(lang === "ar" ? "حدث خطأ أثناء حذف الفيديو" : "Error deleting reel", "error");
    }
  };

  if (authLoading || (isAdmin && initialLoading)) {
    return (
      <StandardPageLayout>
        <AdminPageSkeleton />
      </StandardPageLayout>
    );
  }

  // Access check
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

  // Report calculations for Bazaar
  const totalSoldPieces = bazaarSales.length;
  const totalRevenue = bazaarSales.reduce((sum, s) => sum + (s.finalPrice || 0), 0);
  const sellerBreakdown: Record<string, { count: number; revenue: number }> = {};
  bazaarSales.forEach((s) => {
    const name = s.seller || (lang === "ar" ? "غير معروف" : "Unknown");
    sellerBreakdown[name] = sellerBreakdown[name] || { count: 0, revenue: 0 };
    sellerBreakdown[name].count += 1;
    sellerBreakdown[name].revenue += s.finalPrice || 0;
  });

  // Filtered orders (sorted newest to oldest)
  const filteredOrders = (
    selectedOrderStatus === "all"
      ? orders
      : orders.filter((o) => o.status === selectedOrderStatus)
  )
    .slice()
    .sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0));

  return (
    <div className="relative h-full w-full flex flex-col overflow-hidden">
      <StandardPageLayout>
        <div className="flex flex-col gap-4 px-4 pt-1 pb-16 text-left" dir="ltr">
          {/* Admin Header Title & Actions */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex flex-col">
              <Heading variant="editorial-h1" className="text-2xl text-brand-neutral-950 font-bold">
                {t(`admin.tab.${activeTab}`)}
              </Heading>
              <p className="text-xs text-brand-neutral-500 font-sans mt-0.5">
                {t("admin.subtitle")}
              </p>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: BAZAAR POS TAB */}
          {/* ========================================================================= */}
          {activeTab === "bazaar" && (
            <div className="flex flex-col gap-4 animate-page-enter">
              {/* Bazaar Sub Tabs */}
              <div className="flex items-center gap-2 border-b border-brand-neutral-200 pb-2.5 overflow-x-auto no-scrollbar">
                <Button
                  variant={bazaarSubTab === "sell" ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setBazaarSubTab("sell")}
                  className="rounded-xl font-bold text-xs"
                >
                  {t("admin.bazaar.sell")}
                </Button>
                <Button
                  variant={bazaarSubTab === "inventory" ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setBazaarSubTab("inventory")}
                  className="rounded-xl font-bold text-xs"
                >
                  {t("admin.bazaar.inventory")} ({bazaarProducts.length})
                </Button>
                <Button
                  variant={bazaarSubTab === "report" ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setBazaarSubTab("report")}
                  className="rounded-xl font-bold text-xs"
                >
                  {t("admin.bazaar.report")}
                </Button>
              </div>

              {/* --- SELL SUB TAB --- */}
              {bazaarSubTab === "sell" && (
                <div className="flex flex-col gap-4">
                  {/* Seller Identity Card */}
                  {!sellerName ? (
                    <Card className="p-4 flex flex-col gap-3 bg-white">
                      <Heading variant="card-title" className="text-sm font-bold">
                        {t("admin.bazaar.whoIsSelling")}
                      </Heading>
                      <p className="text-xs font-sans text-brand-neutral-500">
                        {t("admin.bazaar.sellerNote")}
                      </p>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder={t("admin.bazaar.sellerPlaceholder")}
                          value={sellerInput}
                          onChange={(e) => setSellerInput(e.target.value)}
                          className="bg-brand-neutral-50"
                        />
                        <Button onClick={handleSaveSeller} size="md">
                          {t("admin.bazaar.save")}
                        </Button>
                      </div>
                    </Card>
                  ) : (
                    <div className="flex items-center justify-between px-1 text-xs font-sans text-brand-neutral-600">
                      <span>
                        {t("admin.bazaar.sellingAs")}{" "}
                        <b className="text-brand-neutral-900">{sellerName}</b>
                      </span>
                      <button
                        onClick={handleChangeSeller}
                        className="text-primary-600 font-bold hover:underline"
                      >
                        {t("admin.bazaar.change")}
                      </button>
                    </div>
                  )}

                  {/* Scan QR Button */}
                  <Button
                    onClick={toggleScanner}
                    variant={isScanning ? "danger" : "primary"}
                    size="lg"
                    className="w-full text-base font-bold shadow-md"
                    leftIcon={<Camera className="w-5 h-5" />}
                  >
                    {isScanning ? t("admin.bazaar.stopCamera") : t("admin.bazaar.scanQr")}
                  </Button>

                  {/* QR Scanner Container */}
                  <div
                    id="bazaar-qr-reader"
                    className={`w-full rounded-2xl overflow-hidden border border-brand-neutral-200 bg-black ${
                      isScanning ? "block min-h-[260px]" : "hidden"
                    }`}
                  />

                  {/* Scanned Product Sale Confirmation Card */}
                  {scannedProduct && (
                    <Card className="p-4 flex flex-col gap-3 bg-white border-2 border-primary-500 shadow-xl animate-in zoom-in-95">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {scannedProduct.imageUrl && (
                            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-brand-neutral-100 shrink-0">
                              <Image
                                src={scannedProduct.imageUrl}
                                alt={scannedProduct.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <Heading variant="card-title" className="text-base font-bold">
                              {scannedProduct.name}
                            </Heading>
                            <span className="font-mono text-sm text-brand-neutral-500">
                              {t("admin.bazaar.originalPrice")} {scannedProduct.price} {t("currency.egp")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Input
                        label={t("admin.bazaar.discountLabel")}
                        type="number"
                        value={saleDiscount}
                        onChange={(e) => setSaleDiscount(e.target.value)}
                        className="font-mono text-base"
                      />

                      <div className="flex items-center justify-between py-2 border-t border-brand-neutral-100">
                        <span className="text-xs font-sans text-brand-neutral-500">
                          {t("admin.bazaar.finalPrice")}
                        </span>
                        <span className="font-mono font-extrabold text-xl text-primary-600">
                          {Math.max(0, scannedProduct.price - (parseFloat(saleDiscount) || 0))}{" "}
                          {t("currency.egp")}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="primary"
                          className="flex-1 text-base bg-success-500 hover:bg-success-700"
                          isLoading={isRecordingSale}
                          onClick={handleConfirmSale}
                          leftIcon={<CheckCircle2 className="w-4 h-4" />}
                        >
                          {t("admin.bazaar.confirmSale")}
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => setScannedProduct(null)}
                        >
                          {t("admin.bazaar.cancel")}
                        </Button>
                      </div>
                    </Card>
                  )}

                  {/* Recent Sales List */}
                  <div className="flex flex-col gap-2 pt-2">
                    <Heading variant="section-title" className="text-sm font-bold text-brand-neutral-900">
                      {t("admin.bazaar.recentSales")}
                    </Heading>
                    {bazaarSales.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {bazaarSales.slice(0, 15).map((sale) => (
                          <BazaarSaleCard key={sale.id} sale={sale} onRefund={handleRefundSale} />
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs font-sans text-brand-neutral-400 text-center py-6">
                        {t("admin.bazaar.noSales")}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* --- INVENTORY SUB TAB --- */}
              {bazaarSubTab === "inventory" && (
                <div className="flex flex-col gap-4">
                  {/* Actions: Print All QRs & Excel Import */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handlePrintAllQRs}
                      leftIcon={<QrCode className="w-4 h-4 text-primary-500" />}
                    >
                      {t("admin.bazaar.printAllQRs")}
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => excelInputRef.current?.click()}
                      leftIcon={<FileSpreadsheet className="w-4 h-4 text-success-600" />}
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

                  {/* Add Manual Product Form */}
                  <Card className="p-4 flex flex-col gap-3 bg-white">
                    <Heading variant="card-title" className="text-sm font-bold">
                      {t("admin.bazaar.addManualProduct")}
                    </Heading>
                    <form onSubmit={handleAddBazaarProduct} className="flex flex-col gap-2.5">
                      <Input
                        placeholder={t("admin.bazaar.productNamePlaceholder")}
                        value={newProdName}
                        onChange={(e) => setNewProdName(e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder={t("admin.bazaar.pricePlaceholder")}
                        value={newProdPrice}
                        onChange={(e) => setNewProdPrice(e.target.value)}
                      />
                      <Button type="submit" variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
                        {t("admin.bazaar.addToInventory")}
                      </Button>
                    </form>
                  </Card>

                  {/* Inventory Items List */}
                  <div className="flex flex-col gap-2">
                    <Heading variant="section-title" className="text-sm font-bold text-brand-neutral-900">
                      {t("admin.bazaar.itemsCount")} ({bazaarProducts.length})
                    </Heading>
                    {bazaarProducts.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {bazaarProducts.map((p) => (
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
                        title={t("admin.bazaar.noInventory")}
                        description={lang === "ar" ? "أضيفي منتجات يدوياً أو استوردي ملف إكسيل لبدء البيع" : "Add products or import from Excel"}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* --- REPORT SUB TAB --- */}
              {bazaarSubTab === "report" && (
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2.5">
                    <StatSummaryCard
                      label={t("admin.bazaar.totalSold")}
                      value={totalSoldPieces}
                      suffix={lang === "ar" ? "قطعة" : "items"}
                      icon={<Package className="w-4 h-4 text-primary-500" />}
                    />
                    <StatSummaryCard
                      label={t("admin.bazaar.totalRevenue")}
                      value={totalRevenue}
                      suffix={t("currency.egp")}
                      icon={<TrendingUp className="w-4 h-4 text-success-600" />}
                    />
                  </div>

                  {/* Seller Breakdown */}
                  <Card className="p-4 flex flex-col gap-3 bg-white">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary-500" />
                      <Heading variant="card-title" className="text-sm font-bold">
                        {t("admin.bazaar.sellerPerformance")}
                      </Heading>
                    </div>
                    {Object.keys(sellerBreakdown).length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {Object.keys(sellerBreakdown).map((name) => (
                          <div
                            key={name}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-brand-neutral-50 border border-brand-neutral-200 text-xs font-sans"
                          >
                            <span className="font-bold text-brand-neutral-800">{name}</span>
                            <span className="font-mono font-bold text-primary-600">
                              {sellerBreakdown[name].count} {lang === "ar" ? "قطعة" : "items"} — {sellerBreakdown[name].revenue} {t("currency.egp")}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs font-sans text-brand-neutral-400 text-center py-4">
                        {t("admin.bazaar.noSales")}
                      </p>
                    )}
                  </Card>

                  {/* All Sales Records */}
                  <div className="flex flex-col gap-2">
                    <Heading variant="section-title" className="text-sm font-bold text-brand-neutral-900">
                      {t("admin.bazaar.allSalesRecords")} ({bazaarSales.length})
                    </Heading>
                    {bazaarSales.map((sale) => (
                      <BazaarSaleCard key={sale.id} sale={sale} onRefund={handleRefundSale} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: ORDERS MANAGEMENT TAB */}
          {/* ========================================================================= */}
          {activeTab === "orders" && (
            <div className="flex flex-col gap-4 animate-page-enter">
              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                <Button
                  variant={selectedOrderStatus === "all" ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setSelectedOrderStatus("all")}
                  className="rounded-xl font-bold text-xs shrink-0"
                >
                  {t("admin.orders.filterAll")} ({orders.length})
                </Button>
                {ALL_ORDER_STATUSES.map((st) => (
                  <Button
                    key={st}
                    variant={selectedOrderStatus === st ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setSelectedOrderStatus(st)}
                    className="rounded-xl font-bold text-xs shrink-0"
                  >
                    {t(`status.${st}`)} ({orders.filter((o) => o.status === st).length})
                  </Button>
                ))}
              </div>

              {/* Orders List */}
              <div className="flex flex-col gap-3">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((ord) => (
                    <Card key={ord.id} className="p-4 flex flex-col gap-3 bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs">
                      {/* Header: Customer Info & Total */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col">
                          <Heading variant="card-title" className="text-sm font-bold text-brand-neutral-900">
                            {ord.customerInfo?.name || (ord as any).customerName || "Customer"}
                          </Heading>
                          <span className="text-xs font-mono text-brand-neutral-500 mt-0.5">
                            {ord.customerInfo?.phone || ""}
                          </span>
                          <span className="text-xs font-sans text-brand-neutral-600 mt-0.5">
                            {ord.customerInfo?.governorate || ""} {ord.customerInfo?.city ? `• ${ord.customerInfo.city}` : ""} {ord.customerInfo?.streetAddress ? `• ${ord.customerInfo.streetAddress}` : ""}
                          </span>
                          {ord.customerInfo?.notes && (
                            <span className="text-[11px] font-sans text-brand-neutral-500 italic mt-1 bg-brand-neutral-50 p-1.5 rounded-lg border border-brand-neutral-100">
                              ملاحظات: {ord.customerInfo.notes}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="font-mono font-extrabold text-base text-primary-600">
                            {formatPrice(ord.total || 0).formatted}
                          </span>
                          <Badge
                            variant={getOrderStatusBadgeVariant(ord.status)}
                            size="sm"
                            className="mt-1 font-sans"
                          >
                            {t(`status.${ord.status}`)}
                          </Badge>
                        </div>
                      </div>

                      {/* Order Items Preview */}
                      {ord.items && ord.items.length > 0 && (
                        <div className="p-2.5 rounded-xl bg-brand-neutral-50 border border-brand-neutral-100 flex flex-col gap-1.5 text-xs font-sans">
                          {ord.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-brand-neutral-700">
                              <span className="truncate max-w-[200px]">{item.name} {item.size ? `(${item.size})` : ""}</span>
                              <span className="font-mono font-bold">{item.quantity}x {formatPrice(item.price).formatted}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Status Changer Actions */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-brand-neutral-100">
                        {ALL_ORDER_STATUSES.map((st) => (
                          <button
                            key={st}
                            onClick={() => handleOrderStatusUpdate(ord.id, st)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-sans font-bold border transition-all ${
                              ord.status === st
                                ? "bg-primary-500 text-white border-primary-500 shadow-xs"
                                : "bg-brand-neutral-50 text-brand-neutral-700 border-brand-neutral-200 hover:bg-brand-neutral-100"
                            }`}
                          >
                            {t(`status.${st}`)}
                          </button>
                        ))}
                      </div>
                    </Card>
                  ))
                ) : (
                  <EmptyState
                    icon={<ShoppingBag className="w-6 h-6" />}
                    title={t("admin.orders.noOrders")}
                    description={lang === "ar" ? "لا توجد طلبات مسجلة بهذه الحالة حالياً" : "No orders found under this status"}
                  />
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: STOREFRONT PRODUCTS CATALOG */}
          {/* ========================================================================= */}
          {activeTab === "products" && (
            <div className="flex flex-col gap-4 animate-page-enter">
              {/* Header Action: Add Product */}
              <div className="flex items-center justify-between">
                <Heading variant="section-title" className="text-sm font-bold text-brand-neutral-900">
                  {t("admin.products.title")} ({storefrontProducts.length})
                </Heading>
                <Button
                  variant={isAddingProduct ? "secondary" : "primary"}
                  size="sm"
                  onClick={() => setIsAddingProduct(!isAddingProduct)}
                  leftIcon={isAddingProduct ? <XCircle className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  className="rounded-xl font-bold text-xs"
                >
                  {isAddingProduct ? t("admin.bazaar.cancel") : t("admin.products.addNew")}
                </Button>
              </div>

              {/* Add Product Form */}
              {isAddingProduct && (
                <Card className="p-4 flex flex-col gap-3 bg-white border-2 border-primary-500/80 shadow-md">
                  <Heading variant="card-title" className="text-sm font-bold text-brand-neutral-900">
                    {t("admin.products.addNew")}
                  </Heading>
                  <form onSubmit={handleCreateStorefrontProduct} className="flex flex-col gap-3">
                    <Input
                      label={t("admin.products.name")}
                      placeholder="مثال: فستان حرير ملكي مطرز"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        label={t("admin.products.price")}
                        type="number"
                        placeholder="850"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      />
                      <Input
                        label={t("admin.products.discountPrice")}
                        type="number"
                        placeholder="690"
                        value={productForm.originalPrice}
                        onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-sans font-bold text-brand-neutral-700">
                          {t("admin.products.category")}
                        </label>
                        <select
                          value={productForm.category}
                          onChange={(e) => setProductForm({ ...productForm, category: e.target.value as ProductCategory })}
                          className="w-full px-3 py-2 rounded-xl bg-brand-neutral-50 border border-brand-neutral-200 text-xs font-sans font-bold text-brand-neutral-900 outline-none focus:border-primary-500"
                        >
                          <option value="abaya">عباية (Abaya)</option>
                          <option value="dress">فستان (Dress)</option>
                          <option value="set">طقم (Set)</option>
                          <option value="hijab">طرحة / حجاب (Hijab)</option>
                          <option value="shoes">أحذية (Shoes)</option>
                          <option value="bag">شنط (Bag)</option>
                          <option value="accessory">إكسسوارات (Accessory)</option>
                          <option value="other">أخرى (Other)</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-sans font-bold text-brand-neutral-700">
                          {t("admin.products.placement")}
                        </label>
                        <select
                          value={productForm.placement}
                          onChange={(e) => setProductForm({ ...productForm, placement: e.target.value as ProductPlacement })}
                          className="w-full px-3 py-2 rounded-xl bg-brand-neutral-50 border border-brand-neutral-200 text-xs font-sans font-bold text-brand-neutral-900 outline-none focus:border-primary-500"
                        >
                          <option value="standard">قياسي (Standard)</option>
                          <option value="featured">مميز (Featured)</option>
                          <option value="new_arrival">وصل حديثاً (New Arrival)</option>
                          <option value="influencer_pick">اختيار البلوجرز (Influencer Pick)</option>
                          <option value="trending">الأكثر طلباً (Trending)</option>
                        </select>
                      </div>
                    </div>

                    {/* Image Upload Input */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-sans font-bold text-brand-neutral-700">
                        {t("admin.products.uploadImage")}
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setProductImageFile(file);
                            setProductImagePreview(URL.createObjectURL(file));
                          }
                        }}
                        className="text-xs font-sans file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                      />
                      {productImagePreview && (
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-brand-neutral-200 mt-1">
                          <Image src={productImagePreview} alt="Preview" fill className="object-cover" />
                        </div>
                      )}
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      isLoading={isSavingProduct}
                      leftIcon={<Check className="w-4 h-4" />}
                      className="mt-1"
                    >
                      {t("admin.products.saveProduct")}
                    </Button>
                  </form>
                </Card>
              )}

              {/* Storefront Products List */}
              <div className="grid grid-cols-1 gap-2.5">
                {storefrontProducts.length > 0 ? (
                  storefrontProducts.map((prod) => (
                    <Card key={prod.id} className="p-3 flex items-center justify-between gap-3 bg-white border border-brand-neutral-200 rounded-2xl shadow-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-brand-neutral-100 border border-brand-neutral-200 shrink-0">
                          {prod.imageUrl ? (
                            <Image src={prod.imageUrl} alt={prod.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-brand-neutral-400">
                              <Package className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-sans font-bold text-brand-neutral-900 truncate">
                            {prod.name}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-mono font-extrabold text-sm text-primary-600">
                              {prod.price} {t("currency.egp")}
                            </span>
                            {prod.originalPrice && (
                              <span className="font-mono text-xs text-brand-neutral-400 line-through">
                                {prod.originalPrice}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Badge variant="neutral" size="sm" className="text-[9px] py-0 px-1.5">
                              {prod.category}
                            </Badge>
                            {prod.placement && prod.placement !== "standard" && (
                              <Badge variant="primary" size="sm" className="text-[9px] py-0 px-1.5">
                                {t(`placement.${prod.placement}`)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteStorefrontProduct(prod)}
                        className="p-2 rounded-xl text-danger-500 hover:bg-danger-50 active:scale-95 transition-all shrink-0"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </Card>
                  ))
                ) : (
                  <EmptyState
                    icon={<Package className="w-6 h-6" />}
                    title={t("admin.products.noProducts")}
                    actionText={t("admin.products.addNew")}
                    onAction={() => setIsAddingProduct(true)}
                  />
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: REELS MANAGEMENT */}
          {/* ========================================================================= */}
          {activeTab === "reels" && (
            <div className="flex flex-col gap-4 animate-page-enter">
              {/* Header Action: Upload Reel */}
              <div className="flex items-center justify-between">
                <Heading variant="section-title" className="text-sm font-bold text-brand-neutral-900">
                  {t("admin.reels.title")} ({reelsList.length})
                </Heading>
                <Button
                  variant={isAddingReel ? "secondary" : "primary"}
                  size="sm"
                  onClick={() => setIsAddingReel(!isAddingReel)}
                  leftIcon={isAddingReel ? <XCircle className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                  className="rounded-xl font-bold text-xs"
                >
                  {isAddingReel ? t("admin.bazaar.cancel") : t("admin.reels.uploadNew")}
                </Button>
              </div>

              {/* Upload Reel Form */}
              {isAddingReel && (
                <Card className="p-4 flex flex-col gap-3 bg-white border-2 border-primary-500/80 shadow-md">
                  <Heading variant="card-title" className="text-sm font-bold text-brand-neutral-900">
                    {t("admin.reels.uploadNew")}
                  </Heading>
                  <form onSubmit={handleUploadReel} className="flex flex-col gap-3">
                    <Input
                      label={t("admin.reels.creator")}
                      placeholder="مثال: سارة أحمد (@sarah_fashion)"
                      value={reelForm.creator}
                      onChange={(e) => setReelForm({ ...reelForm, creator: e.target.value })}
                    />

                    <Input
                      label={t("admin.reels.caption")}
                      placeholder="مثال: فستان العيد الأنيق وصل بيليكو ✨"
                      value={reelForm.caption}
                      onChange={(e) => setReelForm({ ...reelForm, caption: e.target.value })}
                    />

                    {/* Tag Storefront Product */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-sans font-bold text-brand-neutral-700">
                        {t("admin.reels.tagProduct")}
                      </label>
                      <select
                        value={reelForm.taggedProductId}
                        onChange={(e) => setReelForm({ ...reelForm, taggedProductId: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-brand-neutral-50 border border-brand-neutral-200 text-xs font-sans font-bold text-brand-neutral-900 outline-none focus:border-primary-500"
                      >
                        <option value="">بدون ربط منتج (No product tagged)</option>
                        {storefrontProducts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.price} EGP)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Video File Input */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-sans font-bold text-brand-neutral-700">
                        {t("admin.reels.selectVideo")}
                      </label>
                      <input
                        type="file"
                        accept="video/mp4,video/quicktime,video/webm"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setReelVideoFile(file);
                        }}
                        className="text-xs font-sans file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      isLoading={isUploadingReel}
                      leftIcon={<Upload className="w-4 h-4" />}
                      className="mt-1"
                    >
                      {t("admin.reels.publishReel")}
                    </Button>
                  </form>
                </Card>
              )}

              {/* Video Reels List */}
              <div className="flex flex-col gap-3">
                {reelsList.length > 0 ? (
                  reelsList.map((reel) => (
                    <Card key={reel.id} className="p-3.5 flex items-center justify-between gap-3 bg-white border border-brand-neutral-200 rounded-2xl shadow-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-14 h-20 rounded-xl overflow-hidden bg-brand-neutral-900 border border-brand-neutral-200 shrink-0 flex items-center justify-center text-white">
                          <video
                            src={reel.videoUrl}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                          />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-sans font-bold text-brand-neutral-950 truncate">
                            {reel.creator}
                          </span>
                          <p className="text-xs font-sans text-brand-neutral-600 line-clamp-2 mt-0.5 leading-relaxed">
                            {reel.caption}
                          </p>
                          {reel.taggedProduct && (
                            <div className="flex items-center gap-1 mt-1 text-[10px] font-sans font-bold text-primary-600">
                              <Sparkles className="w-3 h-3 shrink-0" />
                              <span className="truncate">{reel.taggedProduct.name}</span>
                            </div>
                          )}
                          <span className="text-[10px] font-mono text-brand-neutral-400 mt-1">
                            {reel.likesCount || 0} Likes • {reel.commentsCount || 0} Comments
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteReel(reel)}
                        className="p-2 rounded-xl text-danger-500 hover:bg-danger-50 active:scale-95 transition-all shrink-0"
                        title="Delete Reel"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </Card>
                  ))
                ) : (
                  <EmptyState
                    icon={<Film className="w-6 h-6" />}
                    title={t("admin.reels.noReels")}
                    actionText={t("admin.reels.uploadNew")}
                    onAction={() => setIsAddingReel(true)}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </StandardPageLayout>

      {/* Floating Bottom Navigation Island for Admin */}
      <AdminFloatingNavIsland
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === "bazaar" && bazaarSubTab !== "sell") {
            setBazaarSubTab("sell");
          }
        }}
        onOpenScanner={() => {
          if (!isScanning) toggleScanner();
        }}
        ordersCount={orders.filter((o) => o.status === "pending" || o.status === "awaiting_calculation").length}
        productsCount={storefrontProducts.length}
        reelsCount={reelsList.length}
      />
    </div>
  );
}
