"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Camera, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { useConfirm } from "@/context/ConfirmContext";
import { bazaarService } from "@/services/bazaar.service";
import { BazaarProduct, BazaarSale } from "@/types/bazaar.types";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { Heading } from "@/components/ui/Heading/Heading";
import { BazaarSaleCard } from "@/components/cards/BazaarSaleCard";

const SELLER_KEY = "beleco_bazaar_seller";

export interface SellTabProps {
  products: BazaarProduct[];
  sales: BazaarSale[];
  onRefundSale: (sale: BazaarSale) => void;
  scannerTrigger?: number;
}

export const SellTab: React.FC<SellTabProps> = ({
  products,
  sales,
  onRefundSale,
  scannerTrigger = 0,
}) => {
  const { t, lang } = useLanguage();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [sellerName, setSellerName] = useState<string>("");
  const [sellerInput, setSellerInput] = useState<string>("");
  const [scannedProduct, setScannedProduct] = useState<BazaarProduct | null>(null);
  const [saleDiscount, setSaleDiscount] = useState<string>("0");
  const [isRecordingSale, setIsRecordingSale] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const html5QrCodeRef = useRef<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem(SELLER_KEY);
    if (saved) setSellerName(saved);
  }, []);

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

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn("Scanner cleanup error:", e);
      }
      html5QrCodeRef.current = null;
    }
    setIsScanning(false);
  };

  const toggleScanner = async () => {
    if (isScanning) {
      await stopScanner();
    } else {
      setIsScanning(true);
    }
  };

  // Start scanner when isScanning becomes true and DOM element is mounted
  useEffect(() => {
    let isCancelled = false;

    if (isScanning && !html5QrCodeRef.current) {
      const initScanner = async () => {
        try {
          const { Html5Qrcode } = await import("html5-qrcode");
          if (isCancelled) return;

          const qrElement = document.getElementById("bazaar-qr-reader");
          if (!qrElement) return;

          const scanner = new Html5Qrcode("bazaar-qr-reader");
          html5QrCodeRef.current = scanner;

          await scanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 240, height: 240 } },
            async (decodedText) => {
              const matched = products.find((p) => p.id === decodedText);
              if (matched) {
                setScannedProduct(matched);
                setSaleDiscount("0");
                await stopScanner();
              }
            },
            () => {}
          );
        } catch (err) {
          console.error("Camera scanner error:", err);
          if (!isCancelled) {
            showToast(
              lang === "ar"
                ? "تعذر فتح الكاميرا. تأكدي من منح صلاحيات الكاميرا للموقع."
                : "Unable to access camera. Please check permissions.",
              "error"
            );
            setIsScanning(false);
          }
        }
      };

      const timer = setTimeout(initScanner, 100);
      return () => {
        isCancelled = true;
        clearTimeout(timer);
      };
    }
  }, [isScanning, products, lang]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        try {
          html5QrCodeRef.current.stop().catch(() => {});
          html5QrCodeRef.current.clear();
        } catch {}
        html5QrCodeRef.current = null;
      }
    };
  }, []);

  // Respond to external scannerTrigger (e.g. from bottom nav Camera FAB or URL query)
  useEffect(() => {
    if (scannerTrigger > 0) {
      if (!isScanning) {
        setIsScanning(true);
      }
      setTimeout(() => {
        const el = document.getElementById("bazaar-scanner-section");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 150);
    }
  }, [scannerTrigger]);

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

  return (
    <div className="flex flex-col gap-4 text-left" dir="ltr">
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

      {/* Scan QR Button & Section */}
      <div id="bazaar-scanner-section" className="flex flex-col gap-3 scroll-mt-20">
        <Button
          onClick={toggleScanner}
          variant={isScanning ? "danger" : "primary"}
          size="lg"
          className="w-full text-base font-bold shadow-md cursor-pointer"
          leftIcon={<Camera className="w-5 h-5" />}
        >
          {isScanning ? t("admin.bazaar.stopCamera") : t("admin.bazaar.scanQr")}
        </Button>

        {/* QR Scanner Container */}
        {isScanning && (
          <div
            id="bazaar-qr-reader"
            className="w-full rounded-2xl overflow-hidden border border-brand-neutral-200 bg-black min-h-[260px] shadow-md"
          />
        )}
      </div>

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
        {sales.length > 0 ? (
          <div className="flex flex-col gap-2">
            {sales.slice(0, 15).map((sale) => (
              <BazaarSaleCard key={sale.id} sale={sale} onRefund={onRefundSale} />
            ))}
          </div>
        ) : (
          <p className="text-xs font-sans text-brand-neutral-400 text-center py-6">
            {t("admin.bazaar.noSales")}
          </p>
        )}
      </div>
    </div>
  );
};
