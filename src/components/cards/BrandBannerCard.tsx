"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowLeft, Sparkles, Calculator, ShoppingBag } from "lucide-react";
import { Heading } from "@/components/ui/Heading/Heading";
import { useLanguage } from "@/context/LanguageContext";

export interface BrandBannerData {
  id: string;
  brandName: string;
  taglineAr: string;
  taglineEn: string;
  badgeAr: string;
  badgeEn: string;
  subAr: string;
  subEn: string;
  ctaTextAr: string;
  ctaTextEn: string;
  actionUrl: string;
  bgClass: string;
  borderClass: string;
  accentBadgeVariant: "primary" | "gold" | "neutral";
  imagePath: string;
  watermarkText: string;
  customLogo?: React.ReactNode;
}

export const BRAND_BANNERS: BrandBannerData[] = [
  {
    id: "shein",
    brandName: "SHEIN",
    taglineAr: "اطلبي من شي إن بأرخص شحن",
    taglineEn: "Order from SHEIN with lowest shipping",
    badgeAr: "مباشر من شي إن",
    badgeEn: "Direct from SHEIN",
    subAr: "احسبي التكلفة الشاملة للجمارك والشحن بالجنيه المصري فوراً",
    subEn: "Calculate all-inclusive price in local currency instantly",
    ctaTextAr: "احسبي السعر",
    ctaTextEn: "Calculate Price",
    actionUrl: "/calculator",
    bgClass: "bg-gradient-to-br from-[#1c1815] via-[#14100e] to-[#0d0a09]",
    borderClass: "border-[#382f28]/90",
    accentBadgeVariant: "primary",
    imagePath: "/assets/brands/shein_model.jpg",
    watermarkText: "SHEIN",
    customLogo: (
      <div className="flex items-center gap-1">
        <span className="font-mono tracking-[0.25em] text-xl font-extrabold text-white uppercase drop-shadow-sm">
          SHEIN
        </span>
      </div>
    ),
  },
  {
    id: "trendyol",
    brandName: "Trendyol",
    taglineAr: "موضة ترينديول التركية",
    taglineEn: "Trendyol Turkey's Top Picks",
    badgeAr: "شحن من تركيا",
    badgeEn: "Direct from Turkey",
    subAr: "تسوقي ملابس وأحذية الماركات التركية مع ضمان فحص القطع",
    subEn: "Shop authentic Turkish apparel & footwear with door inspection",
    ctaTextAr: "اطلبي من ترينديول",
    ctaTextEn: "Order Trendyol",
    actionUrl: "/calculator",
    bgClass: "bg-gradient-to-br from-[#802200] via-[#5c1600] to-[#3a0d00]",
    borderClass: "border-[#b83b0a]/60",
    accentBadgeVariant: "gold",
    imagePath: "/assets/brands/trendyol_model.jpg",
    watermarkText: "TRENDYOL",
    customLogo: (
      <div className="flex items-center gap-1.5">
        <span className="font-sans font-black text-xl text-white tracking-tight drop-shadow-sm">
          trendyol
        </span>
      </div>
    ),
  },
  {
    id: "zara",
    brandName: "ZARA",
    taglineAr: "كولكشن زارا الجديد وصل",
    taglineEn: "ZARA New Season Arrivals",
    badgeAr: "أزياء أوروبية",
    badgeEn: "European Couture",
    subAr: "أحدث تصاميم الموسم من الفساتين والعبايات والأزياء العصرية",
    subEn: "Newest European season dresses, abayas & curated wardrobe",
    ctaTextAr: "تصفحي الكولكشن",
    ctaTextEn: "Explore Zara",
    actionUrl: "/calculator",
    bgClass: "bg-gradient-to-br from-[#2a1d17] via-[#1a120e] to-[#100a07]",
    borderClass: "border-[#4a3429]/80",
    accentBadgeVariant: "neutral",
    imagePath: "/assets/brands/zara_model.jpg",
    watermarkText: "ZARA",
    customLogo: (
      <div className="flex items-center gap-1">
        <span className="font-serif tracking-[0.18em] text-2xl font-bold text-white uppercase drop-shadow-sm">
          ZARA
        </span>
      </div>
    ),
  },
];

export interface BrandBannerCardProps {
  banner: BrandBannerData;
  className?: string;
}

export const BrandBannerCard: React.FC<BrandBannerCardProps> = ({ banner, className }) => {
  const { lang, dir } = useLanguage();
  const ArrowIcon = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <Link
      href={banner.actionUrl}
      className={`group block relative w-full h-[190px] sm:h-[205px] rounded-3xl overflow-hidden shadow-md transition-all duration-300 active:scale-[0.985] hover:shadow-xl ${banner.bgClass} border ${banner.borderClass} ${className || ""}`}
    >
      {/* Background Stylized Watermark Monogram */}
      <div className="absolute -bottom-4 -left-4 pointer-events-none opacity-10 select-none overflow-hidden">
        <span className="font-mono text-7xl sm:text-8xl font-black text-white tracking-widest whitespace-nowrap">
          {banner.watermarkText}
        </span>
      </div>

      {/* Luxury Ambient Lighting Glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />

      {/* Main Content Layout */}
      <div className="relative z-10 h-full w-full flex items-stretch justify-between p-4 sm:p-5">
        {/* Left Side: Brand Identity, Tagline, & CTA */}
        <div className="flex-1 flex flex-col justify-between max-w-[62%] sm:max-w-[65%] z-20">
          {/* Brand Logo Header */}
          <div className="flex flex-col items-start pt-0.5">
            {banner.customLogo}
          </div>

          {/* Headline & Subtitle */}
          <div className="flex flex-col gap-1 py-1">
            <Heading
              variant="card-title"
              className="text-sm sm:text-base font-bold text-white leading-snug line-clamp-1 group-hover:text-primary-300 transition-colors"
            >
              {lang === "ar" ? banner.taglineAr : banner.taglineEn}
            </Heading>
            <p className="text-[11px] font-sans text-brand-neutral-300 leading-tight line-clamp-2 opacity-90">
              {lang === "ar" ? banner.subAr : banner.subEn}
            </p>
          </div>

          {/* Action CTA Pill */}
          <div className="pt-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-brand-neutral-950 text-xs font-sans font-extrabold shadow-sm group-hover:bg-white transition-all group-hover:gap-2">
              <Calculator className="w-3.5 h-3.5 text-primary-600 shrink-0" />
              <span>{lang === "ar" ? banner.ctaTextAr : banner.ctaTextEn}</span>
              <ArrowIcon className="w-3.5 h-3.5 text-brand-neutral-700 transition-transform group-hover:translate-x-0.5" />
            </div>
          </div>
        </div>

        {/* Right Side: Commercial Fashion Model Cutout Image */}
        <div className="relative w-[38%] sm:w-[35%] h-full flex items-end justify-center pointer-events-none">
          <div className="relative w-full h-[120%] -bottom-1 flex items-end justify-center">
            <img
              src={banner.imagePath}
              alt={banner.brandName}
              className="w-full h-full object-cover object-top rounded-2xl drop-shadow-[0_12px_20px_rgba(0,0,0,0.45)] transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </Link>
  );
};
