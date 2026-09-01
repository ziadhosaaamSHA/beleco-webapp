export interface BazaarProduct {
  id: string;
  name: string;
  price: number;
  costPrice?: number;
  imageUrl?: string;
  imagePath?: string;
  category?: string;
  stock?: number;
  barcode?: string;
  createdAt: number;
}

export interface BazaarSale {
  id: string;
  productId: string;
  productName: string;
  price: number;
  discount: number;
  finalPrice: number;
  seller: string;
  soldAt: number;
  paymentMethod?: "cash" | "instapay" | "card";
}

export interface SellerReport {
  sellerName: string;
  totalPieces: number;
  totalRevenue: number;
}
