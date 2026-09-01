"use client";

import React, { useState } from "react";
import { Link as LinkIcon, ChevronRight } from "lucide-react";
import { StandardPageLayout } from "@/components/layout/StandardPageLayout";
import { Heading } from "@/components/ui/Heading/Heading";
import { Input } from "@/components/ui/Input/Input";
import { Card } from "@/components/ui/Card/Card";
import { CalculatorSkeleton } from "@/components/ui/Skeleton/Skeleton";
import { useLoadingTimeout } from "@/hooks/useLoadingTimeout";
import { LoadingTimeoutState } from "@/components/ui/LoadingTimeout/LoadingTimeoutState";
import { Button } from "@/components/ui/Button/Button";
import { cn } from "@/lib/utils/cn";
import { useLanguage } from "@/context/LanguageContext";
import { useLocation } from "@/context/LocationContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

type Currency = "SAR" | "AED" | "USD" | "TRY";

const currencyRates: Record<Currency, { label: string; rate: number; defaultShipping: number }> = {
  SAR: { label: "ريال سعودي (SAR)", rate: 13.2, defaultShipping: 50 },
  AED: { label: "درهم إماراتي (AED)", rate: 13.5, defaultShipping: 50 },
  USD: { label: "دولار أمريكي (USD)", rate: 49.5, defaultShipping: 75 },
  TRY: { label: "ليرة تركية (TRY)", rate: 1.45, defaultShipping: 60 },
};

export default function PriceCalculatorPage() {
  const { t, lang, isLangReady } = useLanguage();
  const { formatPrice } = useLocation();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const [productUrl, setProductUrl] = useState("");
  const [originalPrice, setOriginalPrice] = useState<string>("");
  const [currency, setCurrency] = useState<Currency>("SAR");
  const [customDiscount, setCustomDiscount] = useState<string>("0");

  const { hasTimedOut, resetTimeout } = useLoadingTimeout(!isLangReady, { timeoutMs: 8000 });

  if (!isLangReady) {
    return (
      <StandardPageLayout showBack title={t("calc.title")}>
        {hasTimedOut ? (
          <LoadingTimeoutState onRetry={resetTimeout} />
        ) : (
          <CalculatorSkeleton />
        )}
      </StandardPageLayout>
    );
  }

  const priceNum = parseFloat(originalPrice) || 0;
  const discountNum = parseFloat(customDiscount) || 0;
  const selectedConfig = currencyRates[currency];

  const priceInEGP = priceNum * selectedConfig.rate;
  const discountedEGP = Math.max(0, priceInEGP - discountNum);
  const finalEstimate = priceNum > 0 ? Math.round(discountedEGP + selectedConfig.defaultShipping) : 0;

  const handleAddToBag = () => {
    if (finalEstimate <= 0) {
      showToast(lang === "ar" ? "يرجى إدخال سعر المنتج أولاً" : "Please enter the product price", "error");
      return;
    }
    addToCart({
      productId: `custom_${Date.now()}`,
      name: productUrl
        ? lang === "ar"
          ? `طلب خاص (${currency} ${priceNum})`
          : `Custom Item (${currency} ${priceNum})`
        : lang === "ar"
        ? `طلب منتج خارجي (${currency} ${priceNum})`
        : `Imported Item (${currency} ${priceNum})`,
      price: finalEstimate,
      imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80",
      selectedSize: "Free Size",
      sourceUrl: productUrl || undefined,
    });
    setProductUrl("");
    setOriginalPrice("");
    setCustomDiscount("0");
  };

  return (
    <StandardPageLayout showBack title={t("calc.title")}>
      <div className="calculator-page flex flex-col gap-4 px-4 pt-2 pb-8 animate-page-enter text-left" dir="ltr">
        {/* Title Header */}
        <div className="flex flex-col gap-1">
          <Heading variant="editorial-h1" className="text-xl sm:text-2xl text-brand-neutral-950 font-bold tracking-tight">
            {t("calc.title")}
          </Heading>
          <Heading variant="subheading" className="text-brand-neutral-600 text-xs sm:text-sm leading-relaxed">
            {t("calc.sub")}
          </Heading>
        </div>

        {/* Product Link Input */}
        <Card className="p-3.5 flex flex-col gap-2 bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs">
          <Input
            leftIcon={<LinkIcon className="w-4 h-4 text-primary-500" />}
            placeholder={
              lang === "ar"
                ? "الصقي رابط المنتج هنا من Shein أو Trendyol أو Zara (اختياري)..."
                : "Paste Shein, Trendyol, or Zara product URL here (Optional)..."
            }
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            aria-label={lang === "ar" ? "رابط المنتج" : "Product Link"}
          />
        </Card>

        {/* Calculation Inputs */}
        <Card className="p-4 flex flex-col gap-3.5 bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs">
          <Heading variant="card-title" className="text-xs sm:text-sm font-bold text-brand-neutral-950">
            {lang === "ar" ? "بيانات السعر والعملة" : "Price & Currency Details"}
          </Heading>

          {/* Currency Selector */}
          <div className="flex flex-col gap-1 text-left">
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(currencyRates) as Currency[]).map((curr) => {
                const isSelected = currency === curr;
                return (
                  <Button
                    key={curr}
                    type="button"
                    variant={isSelected ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setCurrency(curr)}
                    className={cn(
                      "w-full text-xs font-bold my-0 py-2.5 px-3 h-auto",
                      isSelected
                        ? "bg-brand-neutral-950 text-white border-brand-neutral-950 hover:bg-brand-neutral-900 active:bg-black"
                        : "bg-brand-neutral-50 text-brand-neutral-800 border-brand-neutral-200 hover:bg-brand-neutral-100"
                    )}
                  >
                    {currencyRates[curr].label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Original Price Input with Currency Suffix */}
          <Input
            type="number"
            placeholder={
              lang === "ar"
                ? `سعر القطعة بالعملة الأصلية (${currency})`
                : `Item Price in (${currency})`
            }
            value={originalPrice}
            onChange={(e) => setOriginalPrice(e.target.value)}
            suffix={currency}
            aria-label={`${lang === "ar" ? "السعر بـ" : "Price in"} ${currency}`}
            className="font-mono text-base"
          />

          {/* Discount Input with Currency Suffix */}
          <Input
            type="number"
            placeholder={
              lang === "ar"
                ? "قيمة كود الخصم أو التخفيض (اختياري، بالجنيه)"
                : "Discount Coupon Value (Optional, in EGP)"
            }
            value={customDiscount}
            onChange={(e) => setCustomDiscount(e.target.value)}
            suffix={t("currency.egp")}
            aria-label={lang === "ar" ? "كوبون خصم" : "Discount Coupon"}
            className="font-mono text-base"
          />
        </Card>

        {/* Calculation Summary Card */}
        <Card className="p-4 flex flex-col gap-3 bg-brand-neutral-950 text-white border border-brand-neutral-900 rounded-2xl shadow-card">
          <div className="flex items-center justify-between text-xs text-brand-neutral-300 pb-2 border-b border-brand-neutral-800">
            <span>{lang === "ar" ? "سعر المنتج المحول" : "Converted Price"}</span>
            <span className="font-mono font-bold text-white">{Math.round(priceInEGP)} {t("currency.egp")}</span>
          </div>

          <div className="flex items-center justify-between text-xs text-brand-neutral-300 pb-2 border-b border-brand-neutral-800">
            <span>{lang === "ar" ? "الشحن والرسوم التقديرية" : "Estimated Shipping & Fees"}</span>
            <span className="font-mono font-bold text-white">+{selectedConfig.defaultShipping} {t("currency.egp")}</span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex flex-col">
              <span className="text-[11px] font-sans font-bold text-brand-neutral-400">
                {lang === "ar" ? "السعر الإجمالي التقديري" : "Estimated Total"}
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="font-mono font-extrabold text-2xl text-primary-400 tabular-nums">
                  {finalEstimate}
                </span>
                <span className="text-xs font-sans text-brand-neutral-300 font-bold">
                  {t("currency.egp")}
                </span>
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={handleAddToBag}
              disabled={finalEstimate <= 0}
              rightIcon={<ChevronRight className="w-4 h-4 text-white/80" />}
              className="my-0 font-sans font-bold text-xs shadow-xs"
            >
              {t("product.addToBag")}
            </Button>
          </div>
        </Card>
      </div>
    </StandardPageLayout>
  );
}
