"use client";

import React, { useState, useEffect } from "react";
import { Plus, MapPin, Trash2, CheckCircle2, Home, Building2, Phone, User, Check, Navigation, Sparkles } from "lucide-react";
import { StandardPageLayout } from "@/components/layout/StandardPageLayout";
import { Heading } from "@/components/ui/Heading/Heading";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { Card } from "@/components/ui/Card/Card";
import { Badge } from "@/components/ui/Badge/Badge";
import { Modal } from "@/components/ui/Modal/Modal";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { AddressesPageSkeleton } from "@/components/ui/Skeleton/Skeleton";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { useConfirm } from "@/context/ConfirmContext";

export interface SavedAddress {
  id: string;
  name: string;
  phone: string;
  governorate: string;
  city: string;
  streetAddress: string;
  building?: string;
  isDefault?: boolean;
}

const ADDRESS_KEY = "beleco_saved_addresses";

export default function MyAddressesPage() {
  const { t, lang } = useLanguage();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [city, setCity] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [building, setBuilding] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  useEffect(() => {
    try {
      const saved = localStorage.getItem(ADDRESS_KEY);
      if (saved) {
        setAddresses(JSON.parse(saved));
      }
    } catch {}
    setLoading(false);
  }, []);

  const saveToStorage = (updated: SavedAddress[]) => {
    setAddresses(updated);
    try {
      localStorage.setItem(ADDRESS_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !streetAddress.trim()) {
      showToast(lang === "ar" ? "يرجى ملء الحقول المطلوبة" : "Please fill required fields", "error");
      return;
    }

    setIsSubmitting(true);
    const newAddress: SavedAddress = {
      id: `addr_${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      governorate: governorate.trim(),
      city: city.trim(),
      streetAddress: streetAddress.trim(),
      building: building.trim() || undefined,
      isDefault: addresses.length === 0 ? true : isDefault,
    };

    let updated = [...addresses];
    if (newAddress.isDefault) {
      updated = updated.map((a) => ({ ...a, isDefault: false }));
    }
    updated.unshift(newAddress);

    saveToStorage(updated);
    showToast(lang === "ar" ? "تم حفظ العنوان بنجاح" : "Address saved successfully", "success");

    // Reset Form
    setName("");
    setPhone("");
    setGovernorate("");
    setCity("");
    setStreetAddress("");
    setBuilding("");
    setIsDefault(false);
    setIsSubmitting(false);
    setIsModalOpen(false);
  };

  const handleSetDefault = (id: string) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    saveToStorage(updated);
    showToast(lang === "ar" ? "تم تعيين العنوان كافتراضي" : "Set as default address", "success");
  };

  const handleDeleteAddress = async (addr: SavedAddress) => {
    const isConfirmed = await confirm({
      title: t("address.delete"),
      message: `${lang === "ar" ? "هل أنت متأكد من حذف هذا العنوان؟" : "Are you sure you want to delete this address?"}\n\n• ${addr.streetAddress}`,
      confirmText: lang === "ar" ? "حذف" : "Delete",
      cancelText: lang === "ar" ? "إلغاء" : "Cancel",
      isDestructive: true,
    });

    if (!isConfirmed) return;

    const updated = addresses.filter((a) => a.id !== addr.id);
    if (addr.isDefault && updated.length > 0) {
      updated[0].isDefault = true;
    }
    saveToStorage(updated);
    showToast(lang === "ar" ? "تم حذف العنوان" : "Address deleted", "info");
  };

  if (loading) {
    return (
      <StandardPageLayout>
        <AddressesPageSkeleton />
      </StandardPageLayout>
    );
  }

  return (
    <StandardPageLayout>
      <div className="addresses-page flex flex-col gap-4 px-4 pt-2 pb-16 animate-page-enter text-left" dir="ltr">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Heading variant="editorial-h1" className="text-xl sm:text-2xl text-brand-neutral-950 font-bold">
              {t("address.title")}
            </Heading>
            <p className="text-xs font-sans text-brand-neutral-500 mt-0.5">
              {t("address.sub")}
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="rounded-xl font-bold text-xs shrink-0"
          >
            {t("address.add")}
          </Button>
        </div>

        {/* Addresses List */}
        {addresses.length > 0 ? (
          <div className="flex flex-col gap-3">
            {addresses.map((addr) => (
              <Card
                key={addr.id}
                className={`p-4 flex flex-col gap-3 bg-white border rounded-2xl shadow-xs transition-all ${
                  addr.isDefault ? "border-primary-500/80 bg-primary-50/20" : "border-brand-neutral-200/90"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      addr.isDefault ? "bg-primary-500 text-white" : "bg-brand-neutral-100 text-brand-neutral-700"
                    }`}>
                      <Home className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-sans font-bold text-sm text-brand-neutral-950">
                          {addr.name}
                        </span>
                        {addr.isDefault && (
                          <Badge variant="primary" size="sm" className="text-[9px] py-0 px-1.5">
                            {t("address.default")}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs font-mono text-brand-neutral-500">
                        {addr.phone}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteAddress(addr)}
                    className="p-1.5 rounded-lg text-brand-neutral-400 hover:text-danger-500 hover:bg-danger-50 transition-colors"
                    title={t("address.delete")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs font-sans text-brand-neutral-700 p-2.5 rounded-xl bg-brand-neutral-50 border border-brand-neutral-100 flex flex-col gap-1">
                  <span>{addr.streetAddress} {addr.building ? `— ${addr.building}` : ""}</span>
                  <span className="text-brand-neutral-500">{addr.city ? `${addr.city}، ` : ""}{addr.governorate}</span>
                </div>

                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-xs font-sans font-bold text-primary-600 hover:underline self-start pt-1"
                  >
                    {t("address.setDefault")}
                  </button>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<MapPin className="w-6 h-6" />}
            title={t("address.empty")}
            description={t("address.emptySub")}
            actionText={t("address.add")}
            onAction={() => setIsModalOpen(true)}
          />
        )}

        {/* Add Address Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={t("address.add")}
          icon={<MapPin className="w-4 h-4" />}
        >
          <form onSubmit={handleAddAddress} className="flex flex-col gap-3">
            {/* Rapid Geolocation Auto-Fill Button */}
            <button
              type="button"
              onClick={handleAutoDetectLocation}
              disabled={isLocating}
              className="w-full py-2 px-3 rounded-2xl bg-primary-50 hover:bg-primary-100/80 border border-primary-200 text-primary-700 flex items-center justify-between transition-all active:scale-98 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-primary-500 text-white flex items-center justify-center shrink-0">
                  <Navigation className={`w-3 h-3 ${isLocating ? "animate-spin" : ""}`} />
                </div>
                <span className="text-xs font-sans font-bold">
                  {isLocating ? t("cart.detectingLocation") : t("cart.autoDetectLocation")}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-sans font-bold text-primary-600">
                <Sparkles className="w-3 h-3" />
                <span>{lang === "ar" ? "تعبئة سريعة" : "Instant Fill"}</span>
              </div>
            </button>

            <Input
              label={lang === "ar" ? "الاسم المستلم" : "Recipient Name"}
              placeholder="مثال: سارة أحمد"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label={lang === "ar" ? "رقم الهاتف" : "Phone Number"}
              type="tel"
              placeholder="01012345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                label={lang === "ar" ? "المحافظة" : "Governorate"}
                placeholder="القاهرة"
                value={governorate}
                onChange={(e) => setGovernorate(e.target.value)}
                required
              />
              <Input
                label={lang === "ar" ? "المدينة / المنطقة" : "City / Area"}
                placeholder="التجمع الخامس"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>

            <Input
              label={lang === "ar" ? "العنوان بالتفصيل" : "Street Address"}
              placeholder="شارع التسعين الشمالي، عمارة 45"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              required
            />

            <Input
              label={lang === "ar" ? "العمارة / رقم الشقة (اختياري)" : "Building / Apt (Optional)"}
              placeholder="شقة 4، الدور الثاني"
              value={building}
              onChange={(e) => setBuilding(e.target.value)}
            />

            <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs font-sans text-brand-neutral-800">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="w-4 h-4 rounded text-primary-500 focus:ring-primary-400"
              />
              <span>{lang === "ar" ? "تعيين كعنوان استلام افتراضي" : "Set as default delivery address"}</span>
            </label>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              leftIcon={<Check className="w-4 h-4" />}
              className="mt-2 font-bold shadow-md"
            >
              {t("address.save")}
            </Button>
          </form>
        </Modal>
      </div>
    </StandardPageLayout>
  );
}
