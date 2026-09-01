"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, Film, Search, X, Tag, ArrowUpDown } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { useConfirm } from "@/context/ConfirmContext";
import { reelsService } from "@/services/reels.service";
import { Reel } from "@/types/reel.types";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
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

  const [searchQuery, setSearchQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<"all" | "tagged" | "untagged">("all");
  const [sortOption, setSortOption] = useState<"newest" | "oldest" | "likes">("newest");

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

  const isFiltersActive = searchQuery.trim() !== "" || tagFilter !== "all" || sortOption !== "newest";

  const handleResetFilters = () => {
    setSearchQuery("");
    setTagFilter("all");
    setSortOption("newest");
  };

  const filteredReels = useMemo(() => {
    return reels
      .filter((r) => {
        // Tagged status filter
        if (tagFilter === "tagged" && !r.taggedProduct) return false;
        if (tagFilter === "untagged" && Boolean(r.taggedProduct)) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const creator = (r.creator || "").toLowerCase();
          const caption = (r.caption || "").toLowerCase();
          const taggedProdName = (r.taggedProduct?.name || "").toLowerCase();

          const matches =
            creator.includes(q) ||
            caption.includes(q) ||
            taggedProdName.includes(q);

          if (!matches) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === "newest") {
          return (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0);
        }
        if (sortOption === "oldest") {
          return (Number(a.createdAt) || 0) - (Number(b.createdAt) || 0);
        }
        if (sortOption === "likes") {
          return (Number(b.likesCount) || 0) - (Number(a.likesCount) || 0);
        }
        return 0;
      });
  }, [reels, tagFilter, searchQuery, sortOption]);

  return (
    <div className="flex flex-col gap-3 text-left" dir="ltr">
      {/* Sticky Header: Action Bar, Search, Tag Filters & Sort */}
      <div className="sticky top-0 z-20 bg-brand-neutral-50/95 backdrop-blur-md -mx-4 px-4 pt-1 pb-2.5 border-b border-brand-neutral-200/80 flex flex-col gap-2 shadow-2xs">
        {/* 1. Header Action & Total Count */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-sans font-bold text-brand-neutral-700">
              {lang === "ar" ? "فيديوهات الريلز:" : "Published Reels:"}
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
              className="rounded-xl font-bold text-xs shadow-2xs"
            >
              {t("admin.reels.uploadNew")}
            </Button>
          </Link>
        </div>

        {/* 2. Search Bar */}
        <div className="relative">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === "ar"
                ? "بحث باسم المنشئ، كابشن الفيديو، أو المنتج المربوط..."
                : "Search creator, caption, or tagged product..."
            }
            leftIcon={<Search className="w-4 h-4 text-brand-neutral-400" />}
            className="w-full bg-white shadow-2xs text-xs"
            aria-label="Search reels"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-brand-neutral-400 hover:text-brand-neutral-700 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* 3. Quick Filter Tabs & Sorting */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-0.5">
          <div className="flex items-center gap-1.5 shrink-0">
            {[
              { id: "all", labelAr: "الكل", labelEn: "All" },
              { id: "tagged", labelAr: "بمنتج مربوط", labelEn: "With Product" },
              { id: "untagged", labelAr: "بدون ربط", labelEn: "No Product" },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={tagFilter === tab.id ? "primary" : "secondary"}
                size="sm"
                onClick={() => setTagFilter(tab.id as any)}
                className="rounded-xl font-bold text-xs shrink-0 shadow-2xs"
              >
                {lang === "ar" ? tab.labelAr : tab.labelEn}
              </Button>
            ))}
          </div>

          {/* Sort Pill */}
          <button
            type="button"
            onClick={() => {
              if (sortOption === "newest") setSortOption("likes");
              else if (sortOption === "likes") setSortOption("oldest");
              else setSortOption("newest");
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-brand-neutral-200 text-xs font-sans font-bold text-brand-neutral-700 hover:bg-brand-neutral-50 shrink-0 shadow-2xs cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-brand-neutral-400" />
            <span>
              {sortOption === "newest"
                ? (lang === "ar" ? "الأحدث" : "Newest")
                : sortOption === "likes"
                ? (lang === "ar" ? "الأكثر إعجاباً" : "Most Liked")
                : (lang === "ar" ? "الأقدم" : "Oldest")}
            </span>
          </button>
        </div>

        {/* 4. Results Count and Reset Badge */}
        <div className="flex items-center justify-between px-1 text-xs font-sans">
          <span className="text-brand-neutral-500 font-medium">
            {lang === "ar"
              ? `عرض ${filteredReels.length} من إجمالي ${reels.length} فيديو`
              : `Showing ${filteredReels.length} of ${reels.length} reels`}
          </span>
          {isFiltersActive && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-primary-600 font-bold hover:underline"
            >
              {lang === "ar" ? "مسح التصفية" : "Clear filters"}
            </button>
          )}
        </div>
      </div>

      {/* 5. Video Reels List */}
      <div className="flex flex-col gap-3 pt-1">
        {filteredReels.length > 0 ? (
          filteredReels.map((reel) => (
            <ReelCard
              key={reel.id}
              reel={reel}
              onDelete={handleDeleteReel}
            />
          ))
        ) : (
          <EmptyState
            icon={<Film className="w-6 h-6" />}
            title={lang === "ar" ? "لم يتم العثور على فيديوهات مطابقة" : "No matching reels"}
            description={
              lang === "ar"
                ? "جربي البحث باسم صانعة محتوى أخرى أو مسح التصفية"
                : "Try searching with different terms or reset active filters"
            }
            actionText={isFiltersActive ? (lang === "ar" ? "إعادة تعيين الفلاتر" : "Reset Filters") : t("admin.reels.uploadNew")}
            actionHref={isFiltersActive ? undefined : "/admin/reels/new"}
            onAction={isFiltersActive ? handleResetFilters : undefined}
          />
        )}
      </div>
    </div>
  );
};
