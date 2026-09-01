export type NotificationType = "order" | "offer" | "system";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
  orderId?: string;
  badgeLabel?: string;
}
