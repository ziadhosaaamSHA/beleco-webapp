"use client";

import React from "react";
import Link from "next/link";
import { Plus, Film } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { useConfirm } from "@/context/ConfirmContext";
import { reelsService } from "@/services/reels.service";
import { Reel } from "@/types/reel.types";
import { Button } from "@/components/ui/Button/Button";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { ReelCard } from "../components/ReelCard";

export interface ReelsGalleryTabProps {
  reels: Reel[];
  onReelDeleted?: (reelId: string) => void;
}

export const ReelsGalleryTab: React.FC<ReelsGalleryTabProps> = ({
  reels,
  onReelDeleted,
}) => {
  const { t, lang } = useLanguage();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

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
      onReelDeleted?.(reel.id);
      showToast(lang === "ar" ? "تم حذف فيديو الريلز بنجاح" : "Reel deleted successfully", "success");
    } catch {
      showToast(lang === "ar" ? "حدث خطأ أثناء حذف الفيديو" : "Error deleting reel", "error");
    }
  };

  return (
    <div className="flex flex-col gap-4 text-left" dir="ltr">
      {/* Header Action: Upload Reel Button & Total Count */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-sans font-bold text-brand-neutral-700">
            {lang === "ar" ? "فيديوهات الريلز المنشورة:" : "Published Reels:"}
          </span>
          <span className="px-2 py-0.5 rounded-lg bg-primary-50 text-primary-700 text-xs font-mono font-bold">
            {reels.length}
          </span>
        </div>

        <Link href="/admin/reels/new">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            className="rounded-xl font-bold text-xs shadow-xs"
          >
            {t("admin.reels.uploadNew")}
          </Button>
        </Link>
      </div>

      {/* Video Reels List */}
      <div className="flex flex-col gap-3">
        {reels.length > 0 ? (
          reels.map((reel) => (
            <ReelCard
              key={reel.id}
              reel={reel}
              onDelete={handleDeleteReel}
            />
          ))
        ) : (
          <EmptyState
            icon={<Film className="w-6 h-6" />}
            title={t("admin.reels.noReels")}
            actionText={t("admin.reels.uploadNew")}
            actionHref="/admin/reels/new"
          />
        )}
      </div>
    </div>
  );
};
