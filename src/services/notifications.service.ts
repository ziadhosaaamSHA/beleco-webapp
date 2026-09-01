import type { AppNotification } from "@/types/notification.types";

const NOTIFS_STORAGE_KEY = "beleco_notifications_v2";

export const notificationsService = {
  // Get all notifications with default seed if empty
  getNotifications(lang: "ar" | "en" = "ar"): AppNotification[] {
    try {
      const saved = localStorage.getItem(NOTIFS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}

    const now = Date.now();
    const isAr = lang === "ar";

    // Initial default seed for rich storefront experience
    const initialSeed: AppNotification[] = [
      {
        id: "notif_1",
        type: "order",
        title: isAr ? "تحديث حالة الطلب" : "Order Status Update",
        description: isAr
          ? "تم تسعير طلبك بنجاح وجاهز الآن لتأكيد الدفع والدخول في خط الشحن."
          : "Your custom order has been priced and is ready for payment confirmation.",
        timestamp: now - 1000 * 60 * 25, // 25 mins ago
        read: false,
        actionUrl: "/orders",
        badgeLabel: isAr ? "الطلبات" : "Orders",
      },
      {
        id: "notif_2",
        type: "offer",
        title: isAr ? "تشكيلة الصيف الحصرية وصلت" : "Exclusive Summer Drop Live",
        description: isAr
          ? "اكتشفي الآن أحدث القطع المختارة من كبرى البراندات العالمية مع شحن مباشر إلى باب بيتك."
          : "Explore the new curated luxury collection with fast delivery across Egypt and UAE.",
        timestamp: now - 1000 * 60 * 60 * 4, // 4 hours ago
        read: false,
        actionUrl: "/",
        badgeLabel: isAr ? "عروض حصرية" : "Exclusive Drop",
      },
      {
        id: "notif_3",
        type: "system",
        title: isAr ? "أهلاً بك في بيليكو" : "Welcome to Beleco",
        description: isAr
          ? "استخدمي حاسبة الأسعار الذكية لطلب أي منتج من شي إن أو ترينديول بكل سهولة."
          : "Use our smart price calculator to easily import items from Shein & Trendyol.",
        timestamp: now - 1000 * 60 * 60 * 24, // 1 day ago
        read: true,
        actionUrl: "/calculator",
        badgeLabel: isAr ? "النظام" : "System",
      },
      {
        id: "notif_4",
        type: "order",
        title: isAr ? "متابعة مسار الشحنات" : "Track Shipments Live",
        description: isAr
          ? "يمكنك الآن متابعة خط سير جميع شحناتك خطوة بخطوة من دبي وحتى التسليم."
          : "Track your international packages in real-time from our hub directly to your door.",
        timestamp: now - 1000 * 60 * 60 * 48, // 2 days ago
        read: true,
        actionUrl: "/account/tracking",
        badgeLabel: isAr ? "الشحن" : "Shipping",
      },
    ];

    try {
      localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(initialSeed));
    } catch {}

    return initialSeed;
  },

  // Mark single notification as read
  markAsRead(id: string): AppNotification[] {
    const list = this.getNotifications();
    const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
    try {
      localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    return updated;
  },

  // Mark all notifications as read
  markAllAsRead(): AppNotification[] {
    const list = this.getNotifications();
    const updated = list.map((n) => ({ ...n, read: true }));
    try {
      localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    return updated;
  },

  // Clear all notifications
  clearAll(): void {
    try {
      localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify([]));
    } catch {}
  },

  // Add a new notification
  addNotification(
    data: Omit<AppNotification, "id" | "timestamp" | "read">
  ): AppNotification {
    const list = this.getNotifications();
    const newNotif: AppNotification = {
      ...data,
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      read: false,
    };
    const updated = [newNotif, ...list];
    try {
      localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    return newNotif;
  },

  // Get unread count
  getUnreadCount(): number {
    const list = this.getNotifications();
    return list.filter((n) => !n.read).length;
  },
};
