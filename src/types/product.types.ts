export type ProductCategory = "abaya" | "dress" | "set" | "hijab" | "shoes" | "bag" | "accessory" | "other";

export type ProductPlacement = "featured" | "new_arrival" | "influencer_pick" | "trending" | "standard";

export interface Product {
  id: string;
  name: string;
  nameEn?: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  imagePath?: string;
  category: ProductCategory;
  placement: ProductPlacement;
  description?: string;
  inStock: boolean;
  stockCount?: number;
  rating?: number;
  creatorTag?: string;
  sheinId?: string;
  trendyolId?: string;
  sourcePlatform?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface ProductFilterDTO {
  category?: ProductCategory | "all";
  placement?: ProductPlacement | "all";
  searchQuery?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
}
