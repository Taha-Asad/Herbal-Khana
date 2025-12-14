export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  images: string[];
  price: number;
  originalPrice?: number;
  discount?: number;
  category: string;
  subcategory?: string;
  tags: string[];
  ingredients: string[];
  skinType: string[];
  concerns: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockCount?: number;
  isNew?: boolean;
  isBestseller?: boolean;
  isFeatured?: boolean;
  isOrganic?: boolean;
  size?: string;
  volume?: string;
  sku: string;
  benefits: string[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: React.ElementType;
  count: number;
  subcategories?: { id: string; name: string; slug: string; count: number }[];
}

export interface FilterState {
  categories: string[];
  subcategories: string[];
  priceRange: [number, number];
  skinTypes: string[];
  concerns: string[];
  ingredients: string[];
  ratings: number[];
  availability: string[];
  offers: string[];
  sortBy: string;
}
