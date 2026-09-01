"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, ChevronDown, Film } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { reelsService } from "@/services/reels.service";
import { productsService } from "@/services/products.service";
import { Product } from "@/types/product.types";
import { Reel } from "@/types/reel.types";
import { Card } from "@/components/ui/Card/Card";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { Heading } from "@/components/ui/Heading/Heading";

export const UploadReelForm: React.FC = () => {
  const router = useRouter();
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
    const unsub = productsService.subscribeProducts(undefined, (prods) => {
      setProducts(prods);
    });
    return () => unsub();
  }, []);

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

  return (
    <div className="flex flex-col gap-4 text-left" dir="ltr">
      <Card className="p-4 flex flex-col gap-4 bg-white border border-brand-neutral-200/90 shadow-xs">
        <Heading variant="card-title" className="text-sm font-bold text-brand-neutral-950 pb-2 border-b border-brand-neutral-100">
          {lang === "ar" ? "تفاصيل فيديو الريلز الجديد" : "New Reel Video Details"}
        </Heading>

        <form onSubmit={handleUploadReel} className="flex flex-col gap-3.5">
          {/* Creator Name */}
          <Input
            label={t("admin.reels.creator")}
            placeholder="مثال: @sara_fashion"
            value={reelForm.creator}
            onChange={(e) => setReelForm({ ...reelForm, creator: e.target.value })}
            required
          />

          {/* Caption */}
          <Input
            label={t("admin.reels.caption")}
            placeholder="مثال: فستان العيد الأنيق وصل بيليكو ✨"
            value={reelForm.caption}
            onChange={(e) => setReelForm({ ...reelForm, caption: e.target.value })}
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

          {/* Sticky Bottom Actions */}
          <div className="grid grid-cols-2 gap-2 sticky bottom-0 z-20 bg-white/95 p-2 border-t">
            <Button
              type="button"
              variant="secondary"
              size="md" 
              onClick={() => router.push("/admin/reels")}
              className="w-full font-bold justify-center rounded-xl bg-brand-neutral-100"
            >
              {lang === "ar" ? "إلغاء والعودة" : "Cancel"}
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isUploadingReel}
              leftIcon={<Upload className="w-4 h-4" />}
              className="w-full font-bold shadow-md justify-center rounded-xl"
            >
              {t("admin.reels.publishReel")}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
