"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, ArrowLeft, Upload, ChevronDown, Film } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { reelsService } from "@/services/reels.service";
import { productsService } from "@/services/products.service";
import { Product } from "@/types/product.types";
import { Reel } from "@/types/reel.types";
import { StandardPageLayout } from "@/components/layout/StandardPageLayout";
import { Heading } from "@/components/ui/Heading/Heading";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { Card } from "@/components/ui/Card/Card";
import { AdminPageSkeleton } from "@/components/ui/Skeleton/Skeleton";
import { useLoadingTimeout } from "@/hooks/useLoadingTimeout";
import { LoadingTimeoutState } from "@/components/ui/LoadingTimeout/LoadingTimeoutState";

export default function UploadNewReelPage() {
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useAuth();
  const { t, lang } = useLanguage();
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
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
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string>("");
  const [isUploadingReel, setIsUploadingReel] = useState(false);

  useEffect(() => {
    if (!isAdmin) return;
    const unsub = productsService.subscribeProducts(undefined, (prods) => {
      setProducts(prods);
    });
    return () => unsub();
  }, [isAdmin]);

  const handleVideoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReelVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
    }
  };

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
        const found = products.find((p) => p.id === reelForm.taggedProductId);
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
        lang === "ar" ? "تم نشر فيديو الريلز بنجاح ✓" : "Reel published successfully ✓",
        "success"
      );
      router.push("/admin/reels");
    } catch {
      showToast(lang === "ar" ? "فشل رفع فيديو الريلز" : "Failed to upload reel", "error");
    } finally {
      setIsUploadingReel(false);
    }
  };

  const { hasTimedOut, resetTimeout } = useLoadingTimeout(authLoading);

  if (authLoading) {
    return (
      <StandardPageLayout>
        {hasTimedOut ? (
          <LoadingTimeoutState onRetry={resetTimeout} />
        ) : (
          <AdminPageSkeleton />
        )}
      </StandardPageLayout>
    );
  }

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

  return (
    <div className="relative h-full w-full flex flex-col overflow-hidden">
      <StandardPageLayout
        title={lang === "ar" ? "نشر فيديو ريل جديد" : "Upload New Reel"}
        backHref="/admin/reels"
        enableNavOffset={false}
      >
        <div className="flex flex-col gap-4 px-4 pt-1 pb-24 text-left" dir="ltr">
          <Card className="p-4 flex flex-col gap-4 bg-white border border-brand-neutral-200/90 shadow-xs rounded-2xl">
            <Heading variant="card-title" className="text-sm font-bold text-brand-neutral-950 pb-2 border-b border-brand-neutral-100 flex items-center gap-2">
              <Film className="w-4 h-4 text-primary-600" />
              <span>{lang === "ar" ? "تفاصيل فيديو الريلز الجديد" : "New Reel Video Details"}</span>
            </Heading>

            <form id="admin-upload-reel-form" onSubmit={handleUploadReel} className="flex flex-col gap-3.5">
              {/* Creator Handle/Name */}
              <Input
                placeholder={
                  lang === "ar"
                    ? "اسم صانعة المحتوى / الحساب (مثال: @sara_fashion)"
                    : "Creator Handle / Name (e.g. @sara_fashion)"
                }
                value={reelForm.creator}
                onChange={(e) => setReelForm({ ...reelForm, creator: e.target.value })}
                aria-label={t("admin.reels.creator")}
                required
              />

              {/* Caption */}
              <Input
                placeholder={
                  lang === "ar"
                    ? "وصف الفيديو وكابشن العرض (مثال: فستان العيد الأنيق وصل بيليكو ✨)"
                    : "Reel caption & description (e.g. New Summer Dress arrived ✨)"
                }
                value={reelForm.caption}
                onChange={(e) => setReelForm({ ...reelForm, caption: e.target.value })}
                aria-label={t("admin.reels.caption")}
                required
              />

              {/* Tag Storefront Product */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-sans font-bold text-brand-neutral-700">
                  {t("admin.reels.tagProduct")}
                </label>
                <div className="relative w-full">
                  <select
                    value={reelForm.taggedProductId}
                    onChange={(e) => setReelForm({ ...reelForm, taggedProductId: e.target.value })}
                    className="w-full appearance-none px-3.5 py-2.5 pr-10 rtl:pr-3.5 rtl:pl-10 rounded-xl bg-brand-neutral-50 border border-brand-neutral-200 text-xs font-sans font-bold text-brand-neutral-900 outline-none focus:border-primary-500 cursor-pointer"
                  >
                    <option value="">بدون ربط منتج (No product tagged)</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.price} EGP)
                      </option>
                    ))}
                  </select>
                  <div className="absolute top-1/2 -translate-y-1/2 right-3.5 rtl:right-auto rtl:left-3.5 pointer-events-none text-brand-neutral-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Video File Input & Preview */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-sans font-bold text-brand-neutral-700">
                  {t("admin.reels.selectVideo")}
                </label>
                <input
                  type="file"
                  accept="video/mp4,video/quicktime,video/webm"
                  onChange={handleVideoSelected}
                  required
                  className="text-xs font-sans file:mr-2 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                />
              </div>

              {videoPreviewUrl && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs font-sans font-bold text-brand-neutral-700">
                    {lang === "ar" ? "معاينة الفيديو:" : "Video Preview:"}
                  </span>
                  <div className="relative w-full max-w-[240px] aspect-[9/16] rounded-2xl overflow-hidden bg-black border border-brand-neutral-200 shadow-md">
                    <video
                      src={videoPreviewUrl}
                      className="w-full h-full object-cover"
                      controls
                      playsInline
                    />
                  </div>
                </div>
              )}
            </form>
          </Card>
        </div>
      </StandardPageLayout>

      {/* Sticky Bottom Actions Bar */}
      <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md p-3 border-t border-brand-neutral-200/90 flex items-center justify-between gap-2 max-w-[480px] mx-auto w-full">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={() => router.push("/admin/reels")}
          className="flex-1 font-bold justify-center rounded-xl bg-brand-neutral-100"
        >
          {lang === "ar" ? "إلغاء والعودة" : "Cancel"}
        </Button>
        <Button
          type="submit"
          form="admin-upload-reel-form"
          variant="primary"
          size="md"
          isLoading={isUploadingReel}
          leftIcon={<Upload className="w-4 h-4" />}
          className="flex-1 font-bold shadow-xs justify-center rounded-xl"
        >
          {t("admin.reels.publishReel")}
        </Button>
      </div>
    </div>
  );
}
