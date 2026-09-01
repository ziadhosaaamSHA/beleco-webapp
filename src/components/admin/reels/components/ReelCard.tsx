"use client";

import React from "react";
import { Trash2, Sparkles } from "lucide-react";
import { Reel } from "@/types/reel.types";
import { Card } from "@/components/ui/Card/Card";

export interface ReelCardProps {
  reel: Reel;
  onDelete: (reel: Reel) => void;
}

export const ReelCard: React.FC<ReelCardProps> = ({ reel, onDelete }) => {
  return (
    <Card className="p-3.5 flex items-center justify-between gap-3 bg-white border border-brand-neutral-200 rounded-2xl shadow-xs text-left" dir="ltr">
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative w-14 h-20 rounded-xl overflow-hidden bg-brand-neutral-900 border border-brand-neutral-200 shrink-0 flex items-center justify-center text-white">
          <video
            src={reel.videoUrl}
            className="w-full h-full object-cover"
            muted
            playsInline
          />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-sans font-bold text-brand-neutral-950 truncate">
            {reel.creator}
          </span>
          <p className="text-xs font-sans text-brand-neutral-600 line-clamp-2 mt-0.5 leading-relaxed">
            {reel.caption}
          </p>
          {reel.taggedProduct && (
            <div className="flex items-center gap-1 mt-1 text-[10px] font-sans font-bold text-primary-600">
              <Sparkles className="w-3 h-3 shrink-0" />
              <span className="truncate">{reel.taggedProduct.name}</span>
            </div>
          )}
          <span className="text-[10px] font-mono text-brand-neutral-400 mt-1">
            {reel.likesCount || 0} Likes • {reel.commentsCount || 0} Comments
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onDelete(reel)}
        className="p-2 rounded-xl text-danger-500 hover:bg-danger-50 active:scale-95 transition-all shrink-0 cursor-pointer"
        title="Delete Reel"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </Card>
  );
};
