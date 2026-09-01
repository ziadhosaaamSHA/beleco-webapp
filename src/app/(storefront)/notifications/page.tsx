"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Truck,
  Sparkles,
  Shield,
  CheckCheck,
  Trash2,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Package,
} from "lucide-react";
import { StandardPageLayout } from "@/components/layout/StandardPageLayout";
import { Heading } from "@/components/ui/Heading/Heading";
import { Card } from "@/components/ui/Card/Card";
import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { EmptyState } from "@/components/ui/EmptyState/EmptyState";
import { NotificationsPageSkeleton } from "@/components/ui/Skeleton/Skeleton";
import { useLanguage } from "@/context/LanguageContext";
import { useToast } from "@/context/ToastContext";
import { useConfirm } from "@/context/ConfirmContext";
import { notificationsService } from "@/services/notifications.service";
import type { AppNotification, NotificationType } from "@/types/notification.types";

type FilterTab = "all" | NotificationType;

export default function NotificationsPage() {
  const { t, lang, dir, isLangReady } = useLanguage();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const router = useRouter();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [loading, setLoading] = useState(true);

  // Load notifications
  const loadData = () => {
    const list = notificationsService.getNotifications(lang);
    setNotifications(list);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [lang]);

  const handleRefresh = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    loadData();
    showToast(lang === "ar" ? "تم تحديث الإشعارات" : "Notifications refreshed", "success");
  };

  const handleMarkAllRead = () => {
    const updated = notificationsService.markAllAsRead();
    setNotifications(updated);
    showToast(t("notif.markedReadSuccess"), "success");
  };

  const handleClearAll = async () => {
    const isConfirmed = await confirm({
      title: lang === "ar" ? "مسح جميع الإشعارات" : "Clear All Notifications",
      message:
        lang === "ar"
          ? "هل ترغبين بالتأكيد في مسح سجل الإشعارات بالكامل؟"
          : "Are you sure you want to clear all your notifications?",
      confirmText: lang === "ar" ? "مسح الكل" : "Clear All",
      cancelText: lang === "ar" ? "إلغاء" : "Cancel",
      isDestructive: true,
    });

    if (!isConfirmed) return;

    notificationsService.clearAll();
    setNotifications([]);
    showToast(t("notif.clearedSuccess"), "info");
  };

  const handleNotificationClick = (notif: AppNotification) => {
    if (!notif.read) {
      const updated = notificationsService.markAsRead(notif.id);
      setNotifications(updated);
    }
    if (notif.actionUrl) {
      router.push(notif.actionUrl);
    }
  };

  // Helper to format relative time
  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (lang === "ar") {
      if (minutes < 5) return "الآن";
      if (minutes < 60) return `منذ ${minutes} دقيقة`;
      if (hours === 1) return "منذ ساعة";
      if (hours === 2) return "منذ ساعتين";
      if (hours < 24) return `منذ ${hours} ساعات`;
      if (days === 1) return "أمس";
      if (days === 2) return "منذ يومين";
      return `منذ ${days} أيام`;
    } else {
      if (minutes < 5) return "Just now";
      if (minutes < 60) return `${minutes}m ago`;
      if (hours === 1) return "1h ago";
      if (hours < 24) return `${hours}h ago`;
      if (days === 1) return "Yesterday";
      return `${days}d ago`;
    }
  };

  const filteredNotifications =
    activeTab === "all"
      ? notifications
      : notifications.filter((n) => n.type === activeTab);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const ChevronIcon = dir === "rtl" ? ChevronLeft : ChevronRight;

  if (!isLangReady || loading) {
    return (
      <StandardPageLayout>
        <NotificationsPageSkeleton />
      </StandardPageLayout>
    );
  }

  return (
    <StandardPageLayout onRefresh={handleRefresh}>
      <div className="notifications-page flex flex-col gap-4 px-4 pt-2 pb-16 animate-page-enter text-left" dir="ltr">
        {/* Header Title & Actions */}
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Heading variant="editorial-h1" className="text-xl sm:text-2xl text-brand-neutral-950 font-bold tracking-tight">
                  {t("notif.title")}
                </Heading>
                {unreadCount > 0 && (
                  <Badge variant="primary" size="sm" className="font-mono font-bold">
                    {unreadCount} {lang === "ar" ? "جديد" : "new"}
                  </Badge>
                )}
              </div>
              <Heading variant="subheading" className="text-brand-neutral-600 text-xs sm:text-sm">
                {t("notif.sub")}
              </Heading>
            </div>
          </div>

          {/* Quick Actions Toolbar */}
          {notifications.length > 0 && (
            <div className="flex items-center justify-between pt-1 border-t border-brand-neutral-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0}
                leftIcon={<CheckCheck className="w-3.5 h-3.5 text-primary-600" />}
                className="text-[11px] font-sans font-bold h-8 px-2.5 rounded-lg text-brand-neutral-700 hover:text-primary-600 my-0"
              >
                {t("notif.markAllRead")}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                leftIcon={<Trash2 className="w-3.5 h-3.5 text-danger-500" />}
                className="text-[11px] font-sans font-bold h-8 px-2.5 rounded-lg text-danger-600 hover:bg-danger-50 my-0"
              >
                {t("notif.clearAll")}
              </Button>
            </div>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          <Button
            variant={activeTab === "all" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setActiveTab("all")}
            className="rounded-xl font-bold text-xs shrink-0 my-0"
          >
            {t("notif.all")} ({notifications.length})
          </Button>

          <Button
            variant={activeTab === "order" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setActiveTab("order")}
            leftIcon={<Truck className="w-3.5 h-3.5" />}
            className="rounded-xl font-bold text-xs shrink-0 my-0"
          >
            {t("notif.orders")} ({notifications.filter((n) => n.type === "order").length})
          </Button>

          <Button
            variant={activeTab === "offer" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setActiveTab("offer")}
            leftIcon={<Sparkles className="w-3.5 h-3.5" />}
            className="rounded-xl font-bold text-xs shrink-0 my-0"
          >
            {t("notif.offers")} ({notifications.filter((n) => n.type === "offer").length})
          </Button>

          <Button
            variant={activeTab === "system" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setActiveTab("system")}
            leftIcon={<Shield className="w-3.5 h-3.5" />}
            className="rounded-xl font-bold text-xs shrink-0 my-0"
          >
            {t("notif.system")} ({notifications.filter((n) => n.type === "system").length})
          </Button>
        </div>

        {/* Notifications Feed */}
        {filteredNotifications.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filteredNotifications.map((notif) => {
              const isUnread = !notif.read;

              return (
                <Card
                  key={notif.id}
                  variant="interactive"
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 flex items-start gap-3.5 rounded-2xl transition-all relative ${
                    isUnread
                      ? "bg-white border-primary-300 shadow-sm ring-1 ring-primary-500/10"
                      : "bg-white/80 border-brand-neutral-200/80 shadow-2xs hover:bg-white"
                  }`}
                >
                  {/* Icon Indicator */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      notif.type === "order"
                        ? "bg-primary-50 border-primary-200 text-primary-600"
                        : notif.type === "offer"
                        ? "bg-tertiary-50 border-tertiary-200 text-tertiary-700"
                        : "bg-brand-neutral-100 border-brand-neutral-200 text-brand-neutral-700"
                    }`}
                  >
                    {notif.type === "order" && <Truck className="w-5 h-5 stroke-[2]" />}
                    {notif.type === "offer" && <Sparkles className="w-5 h-5 stroke-[2]" />}
                    {notif.type === "system" && <Shield className="w-5 h-5 stroke-[2]" />}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-primary-500 shrink-0" />
                        )}
                        <Heading
                          variant="card-title"
                          className={`text-sm truncate ${
                            isUnread
                              ? "font-extrabold text-brand-neutral-950"
                              : "font-semibold text-brand-neutral-800"
                          }`}
                        >
                          {notif.title}
                        </Heading>
                      </div>

                      <span className="text-[11px] font-mono text-brand-neutral-400 shrink-0 whitespace-nowrap">
                        {formatTimeAgo(notif.timestamp)}
                      </span>
                    </div>

                    <p className="text-xs font-sans text-brand-neutral-600 leading-relaxed line-clamp-2">
                      {notif.description}
                    </p>

                    {/* Footer Badge & Action */}
                    <div className="flex items-center justify-between pt-1 mt-0.5">
                      {notif.badgeLabel && (
                        <Badge
                          variant={
                            notif.type === "order"
                              ? "primary"
                              : notif.type === "offer"
                              ? "gold"
                              : "neutral"
                          }
                          size="sm"
                          className="text-[10px] py-0.5 px-2 font-sans font-medium"
                        >
                          {notif.badgeLabel}
                        </Badge>
                      )}

                      {notif.actionUrl && (
                        <span className="text-xs font-sans font-bold text-primary-600 flex items-center gap-0.5 ml-auto hover:underline">
                          {lang === "ar" ? "عرض التفاصيل" : "View Details"}
                          <ChevronIcon className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Bell className="w-6 h-6" />}
            title={t("notif.empty")}
            description={t("notif.emptySub")}
            actionText={lang === "ar" ? "العودة للرئيسية" : "Back to Home"}
            onAction={() => router.push("/")}
          />
        )}
      </div>
    </StandardPageLayout>
  );
}
