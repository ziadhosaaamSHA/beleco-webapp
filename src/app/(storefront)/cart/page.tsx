"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  Navigation,
  Check,
  Bookmark,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { StandardPageLayout } from "@/components/layout/StandardPageLayout";
import { Heading } from "@/components/ui/Heading/Heading";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { Card } from "@/components/ui/Card/Card";
import { Badge } from "@/components/ui/Badge/Badge";
import { CartPageSkeleton } from "@/components/ui/Skeleton/Skeleton";
import { useLoadingTimeout } from "@/hooks/useLoadingTimeout";
import { LoadingTimeoutState } from "@/components/ui/LoadingTimeout/LoadingTimeoutState";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { useCart, type CartItem } from "@/context/CartContext";
import { useLocation } from "@/context/LocationContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useConfirm } from "@/context/ConfirmContext";
import { ordersService } from "@/services/orders.service";
import type { SavedAddress } from "@/app/(storefront)/account/address/page";

const ADDRESS_STORAGE_KEY = "beleco_saved_addresses";

export default function CartPage() {
  const { items, itemCount, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { formatPrice, countryInfo } = useLocation();
  const { t, lang, dir, isLangReady } = useLanguage();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const router = useRouter();

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressMode, setSelectedAddressMode] = useState<"saved" | "custom">("custom");
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");

  // Custom Form fields
  const [customerName, setCustomerName] = useState(user?.displayName || "");
  const [customerPhone, setCustomerPhone] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [city, setCity] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [building, setBuilding] = useState("");
  const [notes, setNotes] = useState("");
  const [saveForLater, setSaveForLater] = useState(true);

  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load saved addresses on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(ADDRESS_STORAGE_KEY);
      if (saved) {
        const parsed: SavedAddress[] = JSON.parse(saved);
        if (parsed.length > 0) {
          setSavedAddresses(parsed);
          setSelectedAddressMode("saved");
          const defaultAddr = parsed.find((a) => a.isDefault) || parsed[0];
          setSelectedAddressId(defaultAddr.id);
          applySavedAddress(defaultAddr);
        }
      }
    } catch {}
  }, []);

  const applySavedAddress = (addr: SavedAddress) => {
    setCustomerName(addr.name);
    setCustomerPhone(addr.phone);
    setGovernorate(addr.governorate);
    setCity(addr.city);
    setStreetAddress(addr.streetAddress);
    setBuilding(addr.building || "");
  };

  const handleSelectSavedAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    applySavedAddress(addr);
  };

  const handleRemoveItem = async (item: CartItem) => {
    const isConfirmed = await confirm({
      title: lang === "ar" ? "حذف القطعة من الحقيبة" : "Remove Item",
      message:
        lang === "ar"
          ? `هل أنت متأكدة من حذف "${item.name}" من حقيبة التسوق؟`
          : `Are you sure you want to remove "${item.name}" from your bag?`,
      confirmText: lang === "ar" ? "حذف" : "Remove",
      cancelText: lang === "ar" ? "إلغاء" : "Cancel",
      isDestructive: true,
    });

    if (isConfirmed) {
      removeFromCart(item.id);
    }
  };

  // Rapid Geolocation Auto-Detection
  const handleAutoDetectLocation = () => {
    if (!navigator.geolocation) {
      showToast(lang === "ar" ? "خاصية تحديد الموقع غير مدعومة في متصفحك" : "Geolocation not supported", "error");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=${
              lang === "ar" ? "ar" : "en"
            }`
          );
          const data = await res.json();

          const detectedGov = data.principalSubdivision || data.countryName || "";
          const detectedCity = data.city || data.locality || "";
          const detectedStreet = [
            data.locality,
            data.localityInfo?.administrative?.[3]?.name,
            data.localityInfo?.administrative?.[4]?.name,
          ]
            .filter(Boolean)
            .filter((v, i, a) => a.indexOf(v) === i)
            .join(" - ");

          if (detectedGov) setGovernorate(detectedGov);
          if (detectedCity) setCity(detectedCity);
          if (detectedStreet) setStreetAddress(detectedStreet);

          showToast(
            lang === "ar"
              ? `تم تحديد موقعك بدقة: ${detectedCity || detectedGov}`
              : `Location detected: ${detectedCity || detectedGov}`,
            "success"
          );
        } catch (err) {
          console.error("Geocoding error:", err);
          showToast(
            lang === "ar" ? "تعذر جلب تفاصيل العنوان، يرجى كتابتها يدوياً" : "Failed to get address details",
            "error"
          );
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.warn("Geolocation permission error:", err);
        setIsLocating(false);
        showToast(
          lang === "ar" ? "يرجى السماح بصلاحية الموقع لتحديد عنوانك تلقائياً" : "Please enable location permission",
          "error"
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) return;

    if (!customerName.trim()) {
      showToast(lang === "ar" ? "يرجى كتابة الاسم بالكامل" : "Please enter full name", "error");
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 8) {
      showToast(lang === "ar" ? "يرجى كتابة رقم هاتف صحيح للتواصل" : "Please enter a valid phone number", "error");
      return;
    }
    if (!streetAddress.trim()) {
      showToast(lang === "ar" ? "يرجى كتابة العنوان بالتفصيل" : "Please enter detailed address", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      // Save address for later if opted
      if (selectedAddressMode === "custom" && saveForLater) {
        try {
          const newSaved: SavedAddress = {
            id: `addr_${Date.now()}`,
            name: customerName.trim(),
            phone: customerPhone.trim(),
            governorate: governorate.trim() || t(countryInfo.nameKey),
            city: city.trim(),
            streetAddress: streetAddress.trim(),
            building: building.trim() || undefined,
            isDefault: savedAddresses.length === 0,
          };
          const updated = [newSaved, ...savedAddresses];
          localStorage.setItem(ADDRESS_STORAGE_KEY, JSON.stringify(updated));
        } catch {}
      }

      const orderItems = items.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.selectedSize,
        color: item.selectedColor,
        imageUrl: item.imageUrl,
        sourceUrl: item.sourceUrl,
      }));

      await ordersService.createOrder({
        customerUid: user?.uid,
        customerInfo: {
          name: customerName.trim(),
          phone: customerPhone.trim(),
          governorate: governorate.trim() || t(countryInfo.nameKey),
          city: city.trim() || "",
          streetAddress: building.trim() ? `${streetAddress.trim()} (${building.trim()})` : streetAddress.trim(),
          notes: notes.trim() || undefined,
        },
        items: orderItems,
        subtotal,
        shippingFee: 0,
        discount: 0,
        total: subtotal,
        currency: countryInfo.currencySymbol,
      });

      showToast(t("cart.orderSuccess"), "success");
      clearCart();
      router.push("/orders");
    } catch (err) {
      console.error("Order submission failed:", err);
      showToast(lang === "ar" ? "حدث خطأ أثناء تسجيل الطلب، يرجى المحاولة ثانية" : "Failed to place order", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const { hasTimedOut, resetTimeout } = useLoadingTimeout(!isLangReady, { timeoutMs: 8000 });

  if (!isLangReady) {
    return (
      <StandardPageLayout>
        {hasTimedOut ? (
          <LoadingTimeoutState onRetry={resetTimeout} />
        ) : (
          <CartPageSkeleton />
        )}
      </StandardPageLayout>
    );
  }

  if (items.length === 0) {
    return (
      <StandardPageLayout>
        <div className="flex flex-col gap-4 px-4 pt-4 pb-12 animate-page-enter">
          <EmptyState
            icon={<ShoppingBag className="w-8 h-8" />}
            title={t("cart.empty")}
            description={t("cart.emptySub")}
            actionText={t("cart.startShopping")}
            onAction={() => router.push("/")}
          />
        </div>
      </StandardPageLayout>
    );
  }

  const { formatted: formattedSubtotal } = formatPrice(subtotal);

  return (
    <StandardPageLayout>
      <div className="cart-page flex flex-col gap-4 px-4 pt-2 pb-12 animate-page-enter text-left" dir="ltr">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <div>
            <Heading variant="editorial-h1" className="text-xl sm:text-2xl text-brand-neutral-950 font-bold">
              {t("cart.title")}
            </Heading>
            <span className="text-xs font-sans text-brand-neutral-500">
              {itemCount} {lang === "ar" ? "قطع مختارة" : "items in bag"}
            </span>
          </div>

          <Badge variant="primary" size="sm">
            {t(countryInfo.nameKey)}
          </Badge>
        </div>

        {/* Cart Items List */}
        <div className="flex flex-col gap-2.5">
          {items.map((item) => {
            const { formatted: itemFormattedPrice } = formatPrice(item.price);
            return (
              <Card
                key={item.id}
                className="p-3 flex items-center justify-between gap-3 bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs"
              >
                {/* Item Thumbnail & Info */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-brand-neutral-100 shrink-0 border border-brand-neutral-200">
                    <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-sans font-bold text-brand-neutral-950 truncate">{item.name}</span>

                    <div className="flex items-center gap-1.5 mt-0.5">
                      {item.selectedSize && (
                        <span className="text-[10px] font-mono font-bold bg-brand-neutral-100 px-1.5 py-0.5 rounded text-brand-neutral-700">
                          {item.selectedSize}
                        </span>
                      )}
                    </div>

                    <span className="font-mono font-extrabold text-sm text-primary-600 mt-1">{itemFormattedPrice}</span>
                  </div>
                </div>

                {/* Quantity Stepper & Remove */}
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <button
                    onClick={() => handleRemoveItem(item)}
                    className="text-brand-neutral-400 hover:text-danger-500 p-1 transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1.5 bg-brand-neutral-100 rounded-xl p-1 border border-brand-neutral-200">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-brand-neutral-800 hover:bg-brand-neutral-50 active:scale-95 shadow-2xs"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-mono font-bold text-xs px-1 text-brand-neutral-900 min-w-[16px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-brand-neutral-800 hover:bg-brand-neutral-50 active:scale-95 shadow-2xs"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Order Summary Card */}
        <Card className="p-4 flex flex-col gap-3 bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs">
          <Heading variant="card-title" className="text-sm font-bold text-brand-neutral-900">
            {t("cart.summary")}
          </Heading>

          <div className="flex flex-col gap-2 text-xs font-sans text-brand-neutral-600 border-y border-brand-neutral-100 py-2.5">
            <div className="flex items-center justify-between">
              <span>{t("cart.subtotal")}</span>
              <span className="font-mono font-bold text-brand-neutral-900">{formattedSubtotal}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>{t("cart.shipping")}</span>
              <span className="font-sans font-bold text-success-600">{t("cart.shippingFree")}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <span className="font-sans font-bold text-sm text-brand-neutral-900">{t("cart.total")}</span>
            <span className="font-mono font-extrabold text-lg text-primary-600">{formattedSubtotal}</span>
          </div>
        </Card>

        {/* Delivery Address & Checkout Section */}
        <Card className="p-4 flex flex-col gap-4 bg-white border border-brand-neutral-200/90 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-brand-neutral-950">
              <div className="w-7 h-7 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <Heading variant="card-title" className="text-sm font-bold">
                {t("cart.checkout")}
              </Heading>
            </div>

            {savedAddresses.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedAddressMode(selectedAddressMode === "saved" ? "custom" : "saved")}
                className="text-xs font-sans font-bold text-primary-600 hover:text-primary-700 transition-colors cursor-pointer"
              >
                {selectedAddressMode === "saved" ? `+ ${t("cart.useNewAddress")}` : t("cart.savedAddresses")}
              </button>
            )}
          </div>

          {/* 1. Saved Addresses Selector (1-Click Personal Address UX) */}
          {selectedAddressMode === "saved" && savedAddresses.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-sans font-bold text-brand-neutral-700">
                {lang === "ar" ? "اختر من عناوينك المسجلة للتوصيل السريع:" : "Select saved address for fast delivery:"}
              </span>

              <div className="flex flex-col gap-2">
                {savedAddresses.map((addr) => {
                  const isSelected = selectedAddressId === addr.id;
                  return (
                    <div
                      key={addr.id}
                      onClick={() => handleSelectSavedAddress(addr)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isSelected
                          ? "border-primary-500 bg-primary-50/40 ring-2 ring-primary-300/30 shadow-xs"
                          : "border-brand-neutral-200 bg-brand-neutral-50/50 hover:bg-brand-neutral-100/50"
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-full mt-0.5 border flex items-center justify-center shrink-0 transition-colors ${
                            isSelected ? "border-primary-500 bg-primary-500 text-white" : "border-brand-neutral-300 bg-white"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>

                        <div className="flex flex-col gap-0.5 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-sans font-bold text-brand-neutral-950">{addr.name}</span>
                            {addr.isDefault && (
                              <span className="text-[10px] font-sans font-bold px-1.5 py-0.2 bg-primary-100 text-primary-700 rounded-md">
                                {t("address.default")}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-sans text-brand-neutral-600 font-medium truncate">
                            {addr.streetAddress} {addr.building ? `(${addr.building})` : ""}, {addr.city},{" "}
                            {addr.governorate}
                          </span>
                          <span className="text-[10px] font-mono text-brand-neutral-500">{addr.phone}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Notes Field */}
              <div className="pt-2">
                <Input
                  placeholder={
                    lang === "ar"
                      ? "ملاحظات التوصيل أو توقيت الاستلام والمقاس (اختياري)..."
                      : "Delivery notes or preferred delivery time (Optional)..."
                  }
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  aria-label={t("cart.notes")}
                />
              </div>

              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={handlePlaceOrder}
                isLoading={isSubmitting}
                leftIcon={<CheckCircle2 className="w-5 h-5" />}
                className="w-full text-base font-bold shadow-md mt-2"
              >
                {t("cart.placeOrder")} ({formattedSubtotal})
              </Button>
            </div>
          ) : (
            /* 2. Custom Address Form with Rapid Geolocation */
            <form onSubmit={handlePlaceOrder} className="flex flex-col gap-3">
              {/* Rapid Geolocation Auto-Fill Button */}
              <button
                type="button"
                onClick={handleAutoDetectLocation}
                disabled={isLocating}
                className="w-full py-2.5 px-3 rounded-2xl bg-primary-50 hover:bg-primary-100/80 border border-primary-200 text-primary-700 flex items-center justify-between transition-all active:scale-98 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-primary-500 text-white flex items-center justify-center shrink-0">
                    <Navigation className={`w-3.5 h-3.5 ${isLocating ? "animate-spin" : ""}`} />
                  </div>
                  <span className="text-xs font-sans font-bold">
                    {isLocating ? t("cart.detectingLocation") : t("cart.autoDetectLocation")}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-sans font-bold text-primary-600">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{lang === "ar" ? "تعبئة سريعة" : "Instant Fill"}</span>
                </div>
              </button>

              <Input
                placeholder={
                  lang === "ar"
                    ? "الاسم بالكامل (مثال: ياسمين محمود)"
                    : "Full Name (e.g. Yasmin Mahmoud)"
                }
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                aria-label={t("cart.name")}
                required
              />

              <Input
                type="tel"
                placeholder={
                  lang === "ar"
                    ? "رقم الهاتف للتواصل وتأكيد الطلب (مثال: 01012345678)"
                    : "Phone Number for delivery (e.g. 01012345678)"
                }
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                aria-label={t("cart.phone")}
                required
              />

              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder={
                    lang === "ar"
                      ? "المحافظة (مثال: القاهرة / الجيزة)"
                      : "Governorate / State (e.g. Cairo / Giza)"
                  }
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  aria-label={t("cart.gov")}
                  required
                />
                <Input
                  placeholder={
                    lang === "ar"
                      ? "المدينة / الحي (مثال: التجمع / المعادي)"
                      : "City / District (e.g. New Cairo / Maadi)"
                  }
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  aria-label={t("cart.city")}
                  required
                />
              </div>

              <Input
                placeholder={
                  lang === "ar"
                    ? "العنوان بالتفصيل (اسم الشارع، رقم العمارة، أقرب معلم)"
                    : "Detailed Address (Street, Building, Landmark)"
                }
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                aria-label={t("cart.address")}
                required
              />

              <Input
                placeholder={
                  lang === "ar"
                    ? "رقم العمارة / الشقة / الطابق (اختياري)"
                    : "Building / Apartment / Floor (Optional)"
                }
                value={building}
                onChange={(e) => setBuilding(e.target.value)}
                aria-label={lang === "ar" ? "رقم العمارة / الشقة" : "Building / Apartment"}
              />

              {/* Save Address For Future Orders Checkbox */}
              <label className="flex items-center gap-2 p-2.5 rounded-xl bg-brand-neutral-50/70 border border-brand-neutral-200/90 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveForLater}
                  onChange={(e) => setSaveForLater(e.target.checked)}
                  className="w-4 h-4 rounded text-primary-500 focus:ring-primary-400"
                />
                <span className="text-xs font-sans font-bold text-brand-neutral-800">
                  {t("cart.saveAddressForLater")}
                </span>
              </label>

              <Input
                placeholder={
                  lang === "ar"
                    ? "ملاحظات التوصيل أو توقيت الاستلام والمقاسات (اختياري)..."
                    : "Delivery notes or preferred delivery time (Optional)..."
                }
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                aria-label={t("cart.notes")}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                leftIcon={<CheckCircle2 className="w-5 h-5" />}
                className="w-full text-base font-bold shadow-md mt-1"
              >
                {t("cart.placeOrder")} ({formattedSubtotal})
              </Button>
            </form>
          )}
        </Card>
      </div>
    </StandardPageLayout>
  );
}
