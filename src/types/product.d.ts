export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  shortDescription: string | null;
  sku: string;
  costPrice: number | null;
  weight: number | null;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  images: ProductImage[];
  category: ProductCategory | null;
  variants: ProductVariant[];
  inStock: boolean;
  stockCount: number;
  isNew: boolean;
  isFeatured: boolean;
  isBestseller: boolean;
  viewCount: number;
  salesCount: number;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
  reviews?: ProductReview[];
  comments?: ProductComment[];
  reviewStats?: ReviewStats;
}
export interface ProductVariant {
  id: string;
  name: string;
  size: string;
  scent: string | null;
  concentration: string | null;
  price: number;
  stock: number;
  sku: string;
  lowStockThreshold: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  categorySlug: string;
  defaultVariantId: string;
  inStock: boolean;
  stockCount: number;
  isNew: boolean;
  isFeatured: boolean;
  isBestseller: boolean;
}

// types/product.ts

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  image: string; // Single image URL, not an array!
  category: string;
  categorySlug: string;
  defaultVariantId: string;
  inStock: boolean;
  stockCount: number;
  isNew: boolean;
  isFeatured: boolean;
  isBestseller: boolean;
}

export interface FilterState {
  categories: string[];
  priceRange: [number, number];
  ratings: number[];
  availability: string[];
  offers: string[];
  sortBy: string;
  search?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface AvailableFilters {
  categories: { id: string; name: string; slug: string; count: number }[];
  priceRange: { min: number; max: number };
  ratings: { value: number; count: number }[];
}

export interface SortOption {
  id: string;
  name: string;
}

export interface FilterState {
  categories: string[];
  priceRange: [number, number];
  ratings: number[];
  availability: string[];
  offers: string[];
  sortBy: string;
  search?: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface CategoryFilter {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface ProductsResponse {
  products: ProductListItem[];
  pagination: PaginationInfo;
  filters: AvailableFilters;
}

// types/product.ts - Add these types

export interface ProductReview {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
  isApproved: boolean;
  isVerifiedPurchase: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export interface ProductComment {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  isOwner: boolean;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
  verifiedPurchaseCount: number;
}
