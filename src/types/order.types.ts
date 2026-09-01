export type OrderStatus =
  | "awaiting_calculation"
  | "priced"
  | "payment_pending_review"
  | "payment_flagged"
  | "payment_confirmed"
  | "ordered"
  | "pending"
  | "confirmed"
  | "preparing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  imageUrl?: string;
  sourceUrl?: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  secondaryPhone?: string;
  governorate: string;
  city: string;
  streetAddress: string;
  notes?: string;
}

export interface Order {
  id: string;
  customerUid?: string;
  customerInfo: CustomerInfo;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  currency?: string;
  status: OrderStatus;
  statusHistory: Array<{
    status: OrderStatus;
    timestamp: number;
    note?: string;
  }>;
  createdAt: number;
  updatedAt?: number;
}
