"use client";

import React, { useState, useRef } from "react";
import QRCode from "qrcode";
import * as XLSX from "xlsx";
import { Plus, Package, FileSpreadsheet, QrCode } from "lucide-react";
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

export const InventoryTab: React.FC<InventoryTabProps> = ({ products }) => {
  const { t, lang } = useLanguage();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [newProdName, setNewProdName] = useState("");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [photoTargetProduct, setPhotoTargetProduct] = useState<BazaarProduct | null>(null);

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

  return (
    <div className="flex flex-col gap-4 text-left" dir="ltr">
      {/* Actions: Print All QRs & Excel Import */}
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
          {t("admin.bazaar.itemsCount")} ({products.length})
        </Heading>
        {products.length > 0 ? (
          <div className="flex flex-col gap-2">
            {products.map((p) => (
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
            description={
              lang === "ar"
                ? "أضيفي منتجات يدوياً أو استوردي ملف إكسيل لبدء البيع"
                : "Add products or import from Excel"
            }
          />
        )}
      </div>
    </div>
  );
};
