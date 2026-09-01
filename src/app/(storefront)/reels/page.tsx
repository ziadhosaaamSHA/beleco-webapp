"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
  ShoppingBag,
  X,
  Send,
  AlertCircle,
  RefreshCw,
  Play,
  Check,
} from "lucide-react";
import { reelsService } from "@/services/reels.service";
import { Heading } from "@/components/ui/Heading/Heading";
import { Button } from "@/components/ui/Button/Button";
import { ReelsSkeleton } from "@/components/ui/Skeleton/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { useCart } from "@/context/CartContext";
import { useLocation } from "@/context/LocationContext";
import type { Reel, ReelComment } from "@/types/reel.types";

export default function ReelsFeedPage() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isBuffering, setIsBuffering] = useState<Record<string, boolean>>({});
  const [videoErrors, setVideoErrors] = useState<Record<string, boolean>>({});
  const [likedReels, setLikedReels] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [isPaused, setIsPaused] = useState<Record<string, boolean>>({});
  const [showPlayIcon, setShowPlayIcon] = useState<Record<string, boolean>>({});

  // Comments Sheet state
  const [activeCommentsReel, setActiveCommentsReel] = useState<Reel | null>(null);
  const [comments, setComments] = useState<ReelComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const { user } = useAuth();
  const { t, lang, dir, isLangReady } = useLanguage();
  const { showToast } = useToast();
  const { addToCart } = useCart();
  const { formatPrice } = useLocation();

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Fetch reels stream
  useEffect(() => {
    setLoading(true);
    setFetchError(null);
    const unsubscribe = reelsService.subscribeReels(
      (items) => {
        setReels(items);
        setLoading(false);
        const counts: Record<string, number> = {};
        items.forEach((r) => {
          counts[r.id] = r.likesCount || 0;
        });
        setLikeCounts(counts);
      },
      (err) => {
        console.error("Reels stream error:", err);
        setFetchError(lang === "ar" ? "تعذر تحميل الفيديوهات. يرجى التحقق من الاتصال بالإنترنت." : "Unable to load videos. Check your connection.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [lang]);

  // Robust IntersectionObserver for video scrolling & active slide detection
  useEffect(() => {
    if (reels.length === 0 || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            const index = Number(entry.target.getAttribute("data-index"));
            if (!isNaN(index) && index !== activeReelIndex) {
              setActiveReelIndex(index);
            }
          }
        });
      },
      {
        root: containerRef.current,
        threshold: [0.6],
      }
    );

    slideRefs.current.forEach((slide) => {
      if (slide) observer.observe(slide);
    });

    return () => {
      observer.disconnect();
    };
  }, [reels, loading, activeReelIndex]);

  // Controlled video play/pause on active index change
  useEffect(() => {
    if (reels.length === 0) return;

    videoRefs.current.forEach((videoEl, idx) => {
      if (!videoEl) return;
      if (idx === activeReelIndex) {
        videoEl.currentTime = 0;
        const playPromise = videoEl.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPaused((prev) => ({ ...prev, [reels[idx]?.id]: false }));
            })
            .catch((err) => {
              console.log("Autoplay was prevented or interrupted:", err);
            });
        }
      } else {
        videoEl.pause();
        setIsPaused((prev) => ({ ...prev, [reels[idx]?.id]: true }));
      }
    });
  }, [activeReelIndex, reels]);

  // Handle Mute state change
  useEffect(() => {
    videoRefs.current.forEach((videoEl) => {
      if (videoEl) {
        videoEl.muted = isMuted;
      }
    });
  }, [isMuted]);

  // Subscribe to comments for active comments reel
  useEffect(() => {
    if (!activeCommentsReel) return;
    const unsub = reelsService.subscribeComments(activeCommentsReel.id, (cList) => {
      setComments(cList);
    });
    return () => unsub();
  }, [activeCommentsReel]);

  const handleTogglePlayPause = (idx: number, reelId: string) => {
    const videoEl = videoRefs.current[idx];
    if (!videoEl) return;

    if (videoEl.paused) {
      videoEl.play();
      setIsPaused((prev) => ({ ...prev, [reelId]: false }));
      setShowPlayIcon((prev) => ({ ...prev, [reelId]: false }));
    } else {
      videoEl.pause();
      setIsPaused((prev) => ({ ...prev, [reelId]: true }));
      setShowPlayIcon((prev) => ({ ...prev, [reelId]: true }));
      setTimeout(() => {
        setShowPlayIcon((prev) => ({ ...prev, [reelId]: false }));
      }, 1200);
    }
  };

  const handleToggleLike = async (reel: Reel) => {
    const isCurrentlyLiked = Boolean(likedReels[reel.id]);
    const nextLiked = !isCurrentlyLiked;

    setLikedReels((prev) => ({ ...prev, [reel.id]: nextLiked }));
    setLikeCounts((prev) => ({
      ...prev,
      [reel.id]: Math.max(0, (prev[reel.id] || 0) + (nextLiked ? 1 : -1)),
    }));

    if (user?.uid) {
      await reelsService.toggleLike(reel.id, user.uid, isCurrentlyLiked);
    }
  };

  const handleShare = async (reel: Reel) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Beleco Reel",
          text: reel.caption,
          url: window.location.href,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast(t("reels.share"), "info");
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || !activeCommentsReel) return;
    const textToSend = commentText.trim();
    setCommentText("");
    setIsSubmittingComment(true);

    try {
      await reelsService.addComment(
        activeCommentsReel.id,
        user?.uid || "guest",
        user?.displayName || (dir === "rtl" ? "مستخدمة بيليكو" : "Beleco User"),
        textToSend
      );
      showToast(lang === "ar" ? "تم نشر تعليقك بنجاح" : "Comment posted", "success");
    } catch {
      showToast(lang === "ar" ? "تعذر إرسال التعليق" : "Failed to send comment", "error");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleShopTaggedProduct = (reel: Reel) => {
    if (!reel.taggedProduct) return;
    addToCart({
      productId: reel.taggedProduct.productId || reel.id,
      name: reel.taggedProduct.name,
      price: reel.taggedProduct.price,
      imageUrl: reel.taggedProduct.imageUrl || "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80",
      selectedSize: "M",
    });
  };

  if (!isLangReady || loading) {
    return <ReelsSkeleton />;
  }

  return (
    <div className="reels-feed-container h-full w-full bg-black relative overflow-hidden flex flex-col select-none" dir="ltr">
      {/* Top Floating Controls */}
      <div
        className="absolute top-0 right-0 z-30 flex items-center justify-between px-4 pb-2 pointer-events-none"
        style={{ paddingTop: "calc(16px + env(safe-area-inset-top, 0px))" }}
      >
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="reel-mute-btn p-2.5 rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 active:scale-90 transition-all border border-white/10 pointer-events-auto shadow-md"
          aria-label={isMuted ? "تشغيل الصوت" : "كتم الصوت"}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Reels Snap Feed */}
      {fetchError ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-white/80 gap-3">
          <AlertCircle className="w-10 h-10 text-danger-500" />
          <p className="text-sm font-sans font-bold text-white">{fetchError}</p>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 text-white text-xs font-sans font-bold shadow-md active:scale-95 transition-transform"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{lang === "ar" ? "إعادة المحاولة" : "Try Again"}</span>
          </button>
        </div>
      ) : reels.length > 0 ? (
        <div
          ref={containerRef}
          className="reels-feed flex-1 overflow-y-auto snap-y snap-mandatory no-scrollbar relative"
        >
          {reels.map((reel, idx) => {
            const isLiked = Boolean(likedReels[reel.id]);
            const currentLikeCount = likeCounts[reel.id] ?? reel.likesCount ?? 0;
            const buffering = isBuffering[reel.id];
            const hasError = videoErrors[reel.id];
            const paused = isPaused[reel.id];
            const showPlay = showPlayIcon[reel.id];

            return (
              <div
                key={reel.id}
                data-index={idx}
                ref={(el) => {
                  slideRefs.current[idx] = el;
                }}
                className="reel-slide w-full h-full snap-start relative flex items-center justify-center bg-brand-neutral-950"
                onClick={() => handleTogglePlayPause(idx, reel.id)}
              >
                {/* Video Tag */}
                {!hasError ? (
                  <video
                    ref={(el) => {
                      videoRefs.current[idx] = el;
                    }}
                    src={reel.videoUrl}
                    className="w-full h-full object-cover"
                    loop
                    playsInline
                    preload="auto"
                    muted={isMuted}
                    onLoadStart={() => setIsBuffering((prev) => ({ ...prev, [reel.id]: true }))}
                    onWaiting={() => setIsBuffering((prev) => ({ ...prev, [reel.id]: true }))}
                    onPlaying={() => setIsBuffering((prev) => ({ ...prev, [reel.id]: false }))}
                    onCanPlay={() => setIsBuffering((prev) => ({ ...prev, [reel.id]: false }))}
                    onError={() => {
                      setIsBuffering((prev) => ({ ...prev, [reel.id]: false }));
                      setVideoErrors((prev) => ({ ...prev, [reel.id]: true }));
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-white/60 gap-2">
                    <AlertCircle className="w-8 h-8 text-primary-400" />
                    <p className="text-xs font-sans text-white/80">{t("reels.error")}</p>
                  </div>
                )}

                {/* Buffering Spinner */}
                {buffering && !hasError && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 bg-black/20 backdrop-blur-xs">
                    <div className="w-10 h-10 rounded-full border-3 border-white/30 border-t-white animate-spin" />
                  </div>
                )}

                {/* Play / Pause Tap Overlay Indicator */}
                {showPlay && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-15 animate-in fade-in zoom-in-75 duration-200">
                    <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white shadow-2xl">
                      <Play className="w-8 h-8 fill-white translate-x-0.5" />
                    </div>
                  </div>
                )}

                {/* Right Action Bar (Like, Comment, Share) */}
                <div
                  className="reel-actions absolute right-3 z-20 flex flex-col items-center gap-4"
                  style={{ bottom: "calc(96px + env(safe-area-inset-bottom, 0px))" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Like Button */}
                  <button
                    onClick={() => handleToggleLike(reel)}
                    className="reel-action-btn flex flex-col items-center gap-1 text-white active:scale-90 transition-transform cursor-pointer"
                    aria-label="إعجاب"
                  >
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-colors ${
                        isLiked ? "bg-primary-500 text-white shadow-lg ring-2 ring-primary-300/40" : "bg-black/45 text-white hover:bg-black/65"
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isLiked ? "fill-white stroke-white" : "stroke-white fill-none stroke-[2]"}`} />
                    </div>
                    <span className="ra-count text-[11px] font-mono font-bold text-white drop-shadow-md">
                      {currentLikeCount}
                    </span>
                  </button>

                  {/* Comment Button */}
                  <button
                    onClick={() => setActiveCommentsReel(reel)}
                    className="reel-action-btn flex flex-col items-center gap-1 text-white active:scale-90 transition-transform cursor-pointer"
                    aria-label="التعليقات"
                  >
                    <div className="w-11 h-11 rounded-full bg-black/45 text-white backdrop-blur-md flex items-center justify-center hover:bg-black/65 transition-colors">
                      <MessageCircle className="w-5 h-5 stroke-white fill-none stroke-[2]" />
                    </div>
                    <span className="ra-count text-[11px] font-mono font-bold text-white drop-shadow-md">
                      {comments.length > 0 && activeCommentsReel?.id === reel.id ? comments.length : reel.commentsCount || 0}
                    </span>
                  </button>

                  {/* Share Button */}
                  <button
                    onClick={() => handleShare(reel)}
                    className="reel-action-btn flex flex-col items-center gap-1 text-white active:scale-90 transition-transform cursor-pointer"
                    aria-label="مشاركة"
                  >
                    <div className="w-11 h-11 rounded-full bg-black/45 text-white backdrop-blur-md flex items-center justify-center hover:bg-black/65 transition-colors">
                      <Share2 className="w-5 h-5 stroke-white fill-none stroke-[2]" />
                    </div>
                    <span className="ra-count text-[11px] font-sans font-bold text-white drop-shadow-md">
                      {t("reels.share")}
                    </span>
                  </button>
                </div>

                {/* Bottom Video Metadata & Tagged Product Overlay */}
                <div
                  className="reel-overlay absolute left-4 right-16 z-20 flex flex-col gap-2.5"
                  style={{ bottom: "calc(96px + env(safe-area-inset-bottom, 0px))" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* High contrast pure white text */}
                  <div className="flex flex-col gap-1 text-white drop-shadow-lg text-left">
                    <span className="reel-creator text-sm font-sans font-extrabold text-white">
                      {reel.creator}
                    </span>
                    <p className="reel-caption text-xs font-sans text-white/95 font-medium leading-relaxed drop-shadow-md">
                      {reel.caption}
                    </p>
                  </div>

                  {/* Tagged Product Pill (if available) */}
                  {reel.taggedProduct && (
                    <div className="reel-shop-pill bg-white/95 backdrop-blur-md rounded-2xl p-2.5 flex items-center justify-between gap-3 text-brand-neutral-900 shadow-xl border border-white/30 text-left">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="rsp-name text-xs font-sans font-bold truncate">
                            {reel.taggedProduct.name}
                          </span>
                          <span className="rsp-sub text-[11px] font-mono font-bold text-primary-600">
                            {formatPrice(reel.taggedProduct.price).formatted}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleShopTaggedProduct(reel)}
                        className="px-3 py-1.5 rounded-xl bg-primary-500 text-white text-xs font-sans font-bold hover:bg-primary-600 active:scale-95 transition-all shrink-0 flex items-center gap-1 shadow-xs"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{t("reels.shopNow")}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="reels-empty flex-1 flex flex-col items-center justify-center text-center p-6 text-white/70">
          <EmptyState
            icon={<ShoppingBag className="w-8 h-8" />}
            title={t("reels.empty")}
            description={lang === "ar" ? "سيتم إضافة فيديوهات وتنسيقات قريباً!" : "New videos and lookbooks coming soon!"}
            className="bg-brand-neutral-900/80 border-brand-neutral-800 text-white"
          />
        </div>
      )}

      {/* ---------------- Live Comments Sheet ---------------- */}
      {activeCommentsReel && (
        <div className="comments-sheet fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="comments-panel w-full max-w-lg bg-white rounded-t-[28px] max-h-[70vh] flex flex-col animate-sheet-up text-left"
            dir="ltr"
            style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))" }}
          >
            {/* Header */}
            <div className="comments-header flex items-center justify-between p-4 border-b border-brand-neutral-200">
              <Heading variant="editorial-h1" className="text-base font-bold text-brand-neutral-950">
                {t("reels.comments")} ({comments.length})
              </Heading>
              <button
                onClick={() => setActiveCommentsReel(null)}
                className="comments-close p-1 rounded-full text-brand-neutral-400 hover:text-brand-neutral-700 hover:bg-brand-neutral-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="comments-list flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {comments.length > 0 ? (
                comments.map((c) => (
                  <div key={c.id} className="comment-row flex flex-col gap-0.5 bg-brand-neutral-50 p-2.5 rounded-xl border border-brand-neutral-100">
                    <span className="comment-name text-xs font-sans font-bold text-brand-neutral-900">
                      {c.userName}
                    </span>
                    <p className="comment-text text-xs font-sans text-brand-neutral-700 leading-relaxed">
                      {c.text}
                    </p>
                  </div>
                ))
              ) : (
                <div className="comments-empty flex flex-col items-center justify-center py-12 text-center text-brand-neutral-400 text-xs font-sans">
                  {lang === "ar" ? "لا توجد تعليقات بعد. كوني أول من يعلّق!" : "No comments yet. Be the first to comment!"}
                </div>
              )}
            </div>

            {/* Comment Input */}
            <div className="comments-input p-3 border-t border-brand-neutral-200 flex items-center gap-2">
              <input
                type="text"
                placeholder={t("reels.addComment")}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendComment();
                }}
                className="flex-1 px-3.5 py-2 rounded-xl bg-brand-neutral-100 text-xs font-sans text-brand-neutral-900 outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Button
                variant="primary"
                size="sm"
                isLoading={isSubmittingComment}
                onClick={handleSendComment}
                className="rounded-xl px-3"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
