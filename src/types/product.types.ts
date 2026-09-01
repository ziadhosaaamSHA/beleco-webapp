export type ProductCategory =
  | "women"
  | "kids"
  | "premium"
  | "sale"
  | "general"
  | "abaya"
  | "dress"
  | "set"
  | "hijab"
  | "shoes"
  | "bag"
  | "accessory"
  | "other"
  | string;

export type ProductPlacement =
  | "trend"
  | "fashion"
  | "beauty"
  | "homeware"
  | "summer"
  | "picks"
  | "featured"
  | "new_arrival"
  | "influencer_pick"
  | "trending"
  | "standard"
  | string;

export interface Product {
  id: string;
  name: string;
  nameEn?: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  imagePath?: string | null;
  category: ProductCategory;
  placement?: ProductPlacement;
  placements?: string[];
  color?: string | null;
  colors?: string[];
  size?: string | null;
  sizes?: string[];
  link?: string | null;
  description?: string;
  inStock?: boolean;
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
