"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, ChevronRight, ArrowLeft, X, Truck, ShoppingBag } from "lucide-react";
import { StandardPageLayout } from "@/components/layout/StandardPageLayout";
import { StorefrontProductCard } from "@/components/cards/StorefrontProductCard";
import { BrandBannerCard, BRAND_BANNERS } from "@/components/cards/BrandBannerCard";
import { ProductCardSkeleton, HomePageSkeleton } from "@/components/ui/Skeleton/Skeleton";
import { Heading } from "@/components/ui/Heading/Heading";
import { Button } from "@/components/ui/Button/Button";
import { Badge } from "@/components/ui/Badge/Badge";
import { Card } from "@/components/ui/Card/Card";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { useRouter } from "next/navigation";
import { productsService } from "@/services/products.service";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { useLoadingTimeout } from "@/hooks/useLoadingTimeout";
import { LoadingTimeoutState } from "@/components/ui/LoadingTimeout/LoadingTimeoutState";
import type { Product } from "@/types/product.types";

const subtabs: Array<{ id: string; labelKey: string }> = [
  { id: "all", labelKey: "home.tab.fashion" },
  { id: "beauty", labelKey: "home.tab.beauty" },
  { id: "homeware", labelKey: "home.tab.home" },
  { id: "summer", labelKey: "home.tab.summer" },
  { id: "picks", labelKey: "home.tab.picks" },
];

const genderCategories = [
  { id: "women", labelKey: "cat.women", soon: false },
  { id: "men", labelKey: "cat.men", soon: true },
  { id: "kids", labelKey: "cat.kids", soon: true },
  { id: "premium", labelKey: "cat.premium", soon: false },
  { id: "sale", labelKey: "cat.sale", soon: false },
];

const picksSlides = [
  {
    eyebrow: "NEW THIS WEEK",
    title: "Fresh drops\njust for you",
    cta: "Shop now",
    bgClass: "bg-primary-500",
  },
  {
    eyebrow: "LIMITED TIME",
    title: "Styles worth\nthe splurge",
    cta: "Shop now",
    bgClass: "bg-brand-neutral-950",
  },
  {
    eyebrow: "TRENDING",
    title: "Everyone's\ntalking about",
    cta: "Shop now",
    bgClass: "bg-tertiary-500",
  },
];

export default function StorefrontHomePage() {
  const { user, loading: authLoading } = useAuth();
  const { t, lang, isLangReady } = useLanguage();
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && !authLoading) {
      const hasSeenWelcome = localStorage.getItem("beleco_welcomed") === "true";
      if (!user && !hasSeenWelcome) {
        router.replace("/welcome");
      }
    }
  }, [user, authLoading, router]);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubtab, setActiveSubtab] = useState("all");
  const [activeGenderCat, setActiveGenderCat] = useState("women");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activePicksIndex, setActivePicksIndex] = useState(0);
  const [activeBrandsIndex, setActiveBrandsIndex] = useState(0);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const picksCarouselRef = useRef<HTMLDivElement>(null);
  const brandsCarouselRef = useRef<HTMLDivElement>(null);

  // Autoplay for Beleco Picks Carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePicksIndex((prev) => {
        const nextIdx = (prev + 1) % picksSlides.length;
        if (picksCarouselRef.current) {
          const container = picksCarouselRef.current;
          const slideWidth = container.clientWidth * 0.85;
          container.scrollTo({
            left: nextIdx * (slideWidth + 12),
            behavior: "smooth",
          });
        }
        return nextIdx;
      });
    }, 3800);

    return () => clearInterval(interval);
  }, []);

  // Autoplay for Premium Brands Banners Carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveBrandsIndex((prev) => {
        const nextIdx = (prev + 1) % BRAND_BANNERS.length;
        if (brandsCarouselRef.current) {
          const container = brandsCarouselRef.current;
          const slideWidth = 315;
          container.scrollTo({
            left: nextIdx * slideWidth,
            behavior: "smooth",
          });
        }
        return nextIdx;
      });
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // Delivery Banner Looping Typewriter Effect with Pauses
  const fullDeliveryText = t("home.fastTitle");
  const [deliveryTypedText, setDeliveryTypedText] = useState("");
  const [isDeliveryDeleting, setIsDeliveryDeleting] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (!isDeliveryDeleting) {
      if (deliveryTypedText.length < fullDeliveryText.length) {
        timeout = setTimeout(() => {
          setDeliveryTypedText(fullDeliveryText.slice(0, deliveryTypedText.length + 1));
        }, 55);
      } else {
        // Pause at the end of typing
        timeout = setTimeout(() => {
          setIsDeliveryDeleting(true);
        }, 2500);
      }
    } else {
      if (deliveryTypedText.length > 0) {
        timeout = setTimeout(() => {
          setDeliveryTypedText(fullDeliveryText.slice(0, deliveryTypedText.length - 1));
        }, 25);
      } else {
        // Pause before restarting typing loop
        timeout = setTimeout(() => {
          setIsDeliveryDeleting(false);
        }, 400);
      }
    }

    return () => clearTimeout(timeout);
  }, [deliveryTypedText, isDeliveryDeleting, fullDeliveryText]);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = productsService.subscribeProducts(
      {},
      (items) => {
        setProducts(items);
        setLoading(false);
      },
      (err) => {
        console.error("Products error:", err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSearchOpen]);

  const handleRefresh = async () => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    showToast(lang === "ar" ? "تم تحديث المعروضات" : "Products refreshed", "success");
  };

  const handleAddToCart = (product: Product) => {
    // Toast is handled automatically with localized name in CartContext.addToCart
  };

  // Filtered products based on active subtab & gender category
  const filteredProducts = products.filter((p) => {
    const matchesSubtab =
      activeSubtab === "all" ||
      p.placement === activeSubtab ||
      (Array.isArray(p.placements) && p.placements.includes(activeSubtab)) ||
      (activeSubtab === "beauty" && (p.category === "beauty" || p.category === "accessory")) ||
      (activeSubtab === "picks" && (p.placement === "influencer_pick" || p.placements?.includes("picks"))) ||
      (activeSubtab === "summer" && (p.placement === "trending" || p.placements?.includes("summer")));

    const matchesCategory =
      !activeGenderCat ||
      activeGenderCat === "women" ||
      p.category === activeGenderCat ||
      (activeGenderCat === "premium" && (p.category === "premium" || p.price > 1200)) ||
      (activeGenderCat === "sale" && (p.category === "sale" || Boolean(p.originalPrice && p.originalPrice > p.price)));

    return matchesSubtab && matchesCategory;
  });

  const searchedProducts = searchQuery.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase().trim()))
    : [];

  const displayTrending = products
    .filter(
      (p) =>
        p.placement === "trending" ||
        p.placement === "featured" ||
        (Array.isArray(p.placements) && (p.placements.includes("trend") || p.placements.includes("fashion")))
    )
    .slice(0, 6);

  const displayInfluencer = products
    .filter(
      (p) =>
        p.placement === "influencer_pick" ||
        (Array.isArray(p.placements) && p.placements.includes("picks"))
    )
    .slice(0, 6);

  const isPageLoading = !isLangReady || loading;
  const { hasTimedOut, resetTimeout } = useLoadingTimeout(isPageLoading, { timeoutMs: 8000 });

  // Show rich full page skeleton while language or products are loading, or timeout state if taking too long
  if (isPageLoading) {
    return (
      <StandardPageLayout>
        {hasTimedOut ? (
          <LoadingTimeoutState
            onRetry={() => {
              resetTimeout();
              setLoading(true);
              productsService.getProducts().then((items) => {
                setProducts(items);
                setLoading(false);
              }).catch(() => setLoading(false));
            }}
          />
        ) : (
          <HomePageSkeleton />
        )}
      </StandardPageLayout>
    );
  }

  return (
    <StandardPageLayout onRefresh={handleRefresh} scrollLocked={isSearchOpen}>
      <div className="home-content-container flex flex-col gap-5 pb-8 animate-in fade-in duration-200 text-left" dir="ltr">
        
        {/* ---------------- 1. TOP WELCOME HEADLINE ---------------- */}
        <div className="welcome-section px-4 pt-1">
          <Heading variant="editorial-h1" className="text-xl sm:text-2xl text-brand-neutral-950 font-bold tracking-tight">
            {user?.displayName
              ? `${t("home.welcomeBack")} ${user.displayName}`
              : t("home.welcome")}
          </Heading>
        </div>
        {/* ---------------- 2. STICKY CONTROLS (SEARCH + CATEGORIES) ---------------- */}
        <div className="sticky-controls sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-brand-neutral-200/90 px-4 pt-2.5 pb-2.5 flex flex-col gap-2">
        {/* ---------------- 2. SUBTABS ROW ---------------- */}
        <div className="subtabs-section px-4">
          <div className="subtabs-row flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 -mx-4 px-4">
            {subtabs.map((tab) => {
              const isSelected = activeSubtab === tab.id;
              return (
                <Button
                  key={tab.id}
                  variant={isSelected ? "primary" : "secondary"}
                  size="sm"
                  onClick={() => setActiveSubtab(tab.id)}
                  className={`h-8 px-3.5 rounded-full text-xs font-sans font-bold whitespace-nowrap shrink-0 transition-all ${
                    isSelected
                      ? "bg-brand-neutral-950 hover:bg-brand-neutral-900 text-white shadow-xs border-transparent"
                      : "bg-white text-brand-neutral-800 hover:bg-brand-neutral-100 border-brand-neutral-200"
                  }`}
                >
                  {t(tab.labelKey)}
                </Button>
              );
            })}
          </div>
        </div>
          {/* Search Trigger Bar */}
          <div className="search-wrap relative flex items-center">
            <button
              onClick={() => {
                setIsSearchOpen(true);
                setTimeout(() => searchInputRef.current?.focus(), 50);
              }}
              className="w-full h-10 px-3.5 bg-brand-neutral-50 border border-brand-neutral-200 rounded-xl font-sans text-xs text-brand-neutral-500 flex items-center justify-between hover:bg-brand-neutral-100 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-brand-neutral-500" />
                <span className="text-brand-neutral-500 font-medium">
                  {searchQuery || t("home.search")}
                </span>
              </div>
            </button>
          </div>

          {/* Gender / Category Indicator Row */}
          <div className="cat-row flex items-center justify-between border-t border-brand-neutral-100 pt-2 -mx-1 px-1">
            {genderCategories.map((cat) => {
              const isActive = activeGenderCat === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    if (cat.soon) {
                      showToast(t("cat.soon"), "info");
                      return;
                    }
                    setActiveGenderCat(cat.id);
                  }}
                  className={`cat-item flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-xs font-sans font-bold transition-colors relative cursor-pointer ${
                    isActive ? "text-primary-600 font-extrabold" : "text-brand-neutral-600 hover:text-brand-neutral-950"
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span>{t(cat.labelKey)}</span>
                    {cat.soon && (
                      <Badge variant="neutral" size="sm" className="text-[9px] px-1 py-0 h-4">
                        {t("cat.soon")}
                      </Badge>
                    )}
                  </div>
                  {isActive && <div className="cat-indicator w-4 h-0.5 bg-primary-500 rounded-full mt-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ---------------- MEGA SEARCH OVERLAY ---------------- */}
        {isSearchOpen && (
          <div className="mega-search-screen fixed inset-0 z-50 bg-white flex flex-col overscroll-contain animate-page-enter text-left" dir="ltr">
            <div
              className="p-4 border-b border-brand-neutral-200 flex items-center gap-3 bg-white shrink-0"
              style={{ paddingTop: "calc(16px + env(safe-area-inset-top, 0px))" }}
            >
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery("");
                }}
                className="p-2 rounded-xl text-brand-neutral-800 hover:bg-brand-neutral-100 transition-colors cursor-pointer"
                aria-label="Close Search"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="relative flex-1 flex items-center">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t("home.search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-4 pr-10 bg-brand-neutral-50 border border-brand-neutral-200 rounded-xl font-sans text-sm text-brand-neutral-950 placeholder:text-brand-neutral-400 focus:bg-white focus:outline-none focus:border-primary-500 transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 text-brand-neutral-400 hover:text-brand-neutral-700 p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {searchQuery ? (
                searchedProducts.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    <Heading variant="subheading" className="text-xs font-bold text-brand-neutral-500">
                      {t("home.search.results")} ({searchedProducts.length})
                    </Heading>
                    <div className="grid grid-cols-2 gap-3">
                      {searchedProducts.map((p) => (
                        <StorefrontProductCard
                          key={p.id}
                          product={p}
                          onAddToCart={handleAddToCart}
                          onSelect={() => setIsSearchOpen(false)}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center gap-2 text-brand-neutral-500">
                    <Search className="w-8 h-8 text-brand-neutral-300" />
                    <Heading variant="card-title" className="text-sm font-bold text-brand-neutral-800">
                      {t("home.search.noResults")}
                    </Heading>
                    <p className="text-xs font-sans text-brand-neutral-400">
                      {t("home.search.tryAgain")}
                    </p>
                  </div>
                )
              ) : (
                <div className="flex flex-col gap-3">
                  <Heading variant="subheading" className="text-xs font-bold text-brand-neutral-500">
                    {t("home.search.popular")}
                  </Heading>
                  <div className="flex flex-wrap gap-2">
                    {(lang === "ar"
                      ? ["عباية حرير", "فستان سهرة", "طرحة بيج", "طقم تركي", "SHEIN Premium"]
                      : ["Silk Abaya", "Evening Dress", "Beige Scarf", "Turkish Set", "SHEIN Premium"]
                    ).map((term) => (
                      <Button
                        key={term}
                        variant="secondary"
                        size="sm"
                        onClick={() => setSearchQuery(term)}
                        className="h-8 px-3.5 rounded-full text-xs font-sans font-bold bg-brand-neutral-100 hover:bg-primary-50 hover:text-primary-700 border-transparent"
                      >
                        {term}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ---------------- 4. Beleco's Picks Carousel ---------------- */}
        <div className="picks-section px-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <Heading variant="editorial-h1" className="text-base font-bold text-brand-neutral-950">
              Beleco's Picks
            </Heading>
          </div>

          <div
            ref={picksCarouselRef}
            onScroll={(e) => {
              const el = e.currentTarget;
              const idx = Math.round(el.scrollLeft / (el.clientWidth * 0.85));
              setActivePicksIndex(Math.min(Math.max(idx, 0), picksSlides.length - 1));
            }}
            className="picks-carousel flex items-center gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory py-1 -mx-4 px-4"
          >
            {picksSlides.map((slide, idx) => (
              <div
                key={idx}
                className={`picks-slide w-[85%] sm:w-[320px] shrink-0 snap-center rounded-2xl p-5 text-white flex flex-col justify-between  shadow-sm ${slide.bgClass}`}
              >
                <div>
                  <span className="ps-eyebrow text-[10px] font-sans font-extrabold tracking-wider opacity-85 block mb-1">
                    {slide.eyebrow}
                  </span>
                  <Heading variant="editorial-h1" className="text-lg text-white font-bold leading-snug whitespace-pre-line">
                    {slide.title}
                  </Heading>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => showToast(t("common.seeAll"), "info")}
                  className="self-start h-8 px-3.5 rounded-full bg-white text-brand-neutral-950 text-xs font-sans font-bold hover:bg-brand-neutral-100 active:scale-95 shadow-xs border-transparent"
                >
                  {slide.cta}
                </Button>
              </div>
            ))}
          </div>

          {/* Carousel Pagination Dots Indicator */}
          <div className="picks-dots flex items-center justify-center gap-1.5 pt-0.5">
            {picksSlides.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => {
                  setActivePicksIndex(dotIdx);
                  if (picksCarouselRef.current) {
                    const container = picksCarouselRef.current;
                    const slideWidth = container.clientWidth * 0.85;
                    container.scrollTo({
                      left: dotIdx * (slideWidth + 12),
                      behavior: "smooth",
                    });
                  }
                }}
                aria-label={`Slide ${dotIdx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                  activePicksIndex === dotIdx ? "w-5 bg-primary-500" : "w-1.5 bg-brand-neutral-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* ---------------- 5. SHEIN Brands Day Banner ---------------- */}
        <div className="shein-day-banner px-4">
          <Card className="w-full bg-brand-neutral-950 text-white rounded-3xl p-6 min-h-[140px] flex flex-col items-center justify-center text-center gap-3 shadow-card border-none">
            <div className="flex flex-col items-center text-center gap-1">
              <span className="wb-eyebrow text-xs font-sans font-extrabold text-tertiary-400 tracking-widest uppercase">
                {t("home.sheinDayEyebrow")} & TRENDYOL
              </span>
              <Heading variant="editorial-h1" className="text-xl sm:text-2xl text-white font-bold italic">
                {t("home.sheinDayTitle")}
              </Heading>
            </div>
            <Link href="/calculator" className="mt-1">
              <Button
                variant="primary"
                size="md"
                className="rounded-full font-bold shadow-md px-6 py-2.5"
              >
                {t("calc.title")}
              </Button>
            </Link>
          </Card>
        </div>

        {/* ---------------- 6. Fast Delivery Info Bar with Looping Typing Animation ---------------- */}
        <div className="delivery-banner px-4">
          <Card variant="surface" className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-brand-neutral-200/90 shadow-xs min-h-[52px]">
            <Truck className="w-5 h-5 text-brand-neutral-950 stroke-[2] shrink-0" />
            <div className="flex items-center gap-0.5 min-w-0 flex-1">
              <span className="text-xs font-sans font-bold text-brand-neutral-900 leading-relaxed">
                {deliveryTypedText}
              </span>
              <span className="inline-block w-0.5 h-3.5 bg-brand-neutral-950 animate-pulse shrink-0" />
            </div>
          </Card>
        </div>

        {/* ---------------- 7. Premium Brands Luxury Banners ---------------- */}
        <div className="platforms-section px-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Heading variant="section-title" className="text-sm font-bold text-brand-neutral-950">
              {t("home.premiumBrands")}
            </Heading>
            <Link
              href="/calculator"
              className="text-xs font-sans font-bold text-primary-600 hover:text-primary-700 flex items-center gap-0.5"
            >
              <span>{t("calc.title")}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Horizontal Luxury Swipe Carousel of Brand Banners */}
          <div
            ref={brandsCarouselRef}
            onScroll={(e) => {
              const el = e.currentTarget;
              const idx = Math.round(el.scrollLeft / 315);
              setActiveBrandsIndex(Math.min(Math.max(idx, 0), BRAND_BANNERS.length - 1));
            }}
            className="brand-banners-scroll flex items-center gap-3.5 overflow-x-auto no-scrollbar snap-x snap-mandatory py-1 -mx-4 px-4"
          >
            {BRAND_BANNERS.map((banner) => (
              <div key={banner.id} className="w-[305px] sm:w-[340px] shrink-0 snap-center">
                <BrandBannerCard banner={banner} />
              </div>
            ))}
          </div>

          {/* Brand Banners Pagination Dots Indicator */}
          <div className="brand-dots flex items-center justify-center gap-1.5 pt-0.5">
            {BRAND_BANNERS.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => {
                  setActiveBrandsIndex(dotIdx);
                  if (brandsCarouselRef.current) {
                    const container = brandsCarouselRef.current;
                    const cardWidth = 315;
                    container.scrollTo({
                      left: dotIdx * cardWidth,
                      behavior: "smooth",
                    });
                  }
                }}
                aria-label={`Brand slide ${dotIdx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                  activeBrandsIndex === dotIdx ? "w-5 bg-primary-500" : "w-1.5 bg-brand-neutral-300"
                }`}
              />
            ))}
          </div>
        </div>

        {/* ---------------- 8. This Week Trend ---------------- */}
        <div className="trend-section px-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <Heading variant="section-title" className="text-sm font-bold text-brand-neutral-950">
              {t("home.weekTrend")}
            </Heading>
            <button
              onClick={() => showToast(t("common.seeAll"), "info")}
              className="see-all text-xs font-sans font-bold text-primary-600 flex items-center gap-0.5 cursor-pointer hover:text-primary-700"
            >
              <span>{t("common.seeAll")}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="product-row flex items-center gap-3 overflow-x-auto no-scrollbar py-1 -mx-4 px-4">
            {displayTrending.length > 0 ? (
              displayTrending.map((p) => (
                <div key={p.id} className="w-[170px] shrink-0">
                  <StorefrontProductCard product={p} onAddToCart={handleAddToCart} />
                </div>
              ))
            ) : (
              <p className="text-xs font-sans text-brand-neutral-400 py-4">{t("home.productSoon")}</p>
            )}
          </div>
        </div>

        {/* ---------------- 9. Influencer Picks ---------------- */}
        <div className="influencer-section px-4 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <Heading variant="section-title" className="text-sm font-bold text-brand-neutral-950">
              {t("home.tab.picks")}
            </Heading>
            <button
              onClick={() => showToast(t("common.seeAll"), "info")}
              className="see-all text-xs font-sans font-bold text-primary-600 flex items-center gap-0.5 cursor-pointer hover:text-primary-700"
            >
              <span>{t("common.seeAll")}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="product-row flex items-center gap-3 overflow-x-auto no-scrollbar py-1 -mx-4 px-4">
            {displayInfluencer.length > 0 ? (
              displayInfluencer.map((p) => (
                <div key={p.id} className="w-[170px] shrink-0">
                  <StorefrontProductCard product={p} onAddToCart={handleAddToCart} />
                </div>
              ))
            ) : (
              <p className="text-xs font-sans text-brand-neutral-400 py-4">{t("home.productSoon")}</p>
            )}
          </div>
        </div>

        {/* ---------------- 10. Complete Catalog Grid ---------------- */}
        <div className="catalog-section px-4 flex flex-col gap-3 pt-2">
          <Heading variant="section-title" className="text-sm font-bold text-brand-neutral-950">
            {t("home.allProducts")}
          </Heading>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((product) => (
                <StorefrontProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<ShoppingBag className="w-6 h-6" />}
              title={lang === "ar" ? "لا توجد منتجات مسجلة في هذا القسم حالياً" : "No products in this category yet"}
              description={lang === "ar" ? "تصفحي الأقسام الأخرى للاطلاع على أحدث التشكيلات" : "Browse other categories to see our latest drops"}
            />
          )}
        </div>
      </div>
    </StandardPageLayout>
  );
}
