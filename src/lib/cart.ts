import {
  CartItem,
  PromoCode,
  RecommendedProduct,
  ShippingOption,
} from "@/types/cart";
import { Timer, Truck, Zap } from "lucide-react";

const mockCartItems: CartItem[] = [
  {
    id: "cart-1",
    productId: "prod-1",
    name: "Premium Gold Embroidered Shawl",
    image: "/api/placeholder/200/200",
    price: 8500,
    originalPrice: 12000,
    quantity: 1,
    maxQuantity: 5,
    variant: { color: "Maroon", size: "Large" },
    sku: "SHW-GLD-001",
    inStock: true,
    stockCount: 3,
    estimatedDelivery: "Jan 25 - Jan 28",
  },
  {
    id: "cart-2",
    productId: "prod-2",
    name: "Handcrafted Leather Wallet",
    image: "/api/placeholder/200/200",
    price: 3200,
    quantity: 2,
    maxQuantity: 10,
    variant: { color: "Brown" },
    sku: "WLT-LTH-002",
    inStock: true,
    stockCount: 15,
    estimatedDelivery: "Jan 24 - Jan 26",
  },
  {
    id: "cart-3",
    productId: "prod-3",
    name: "Silk Embroidered Cushion Cover Set",
    image: "/api/placeholder/200/200",
    price: 4500,
    originalPrice: 5500,
    quantity: 1,
    maxQuantity: 8,
    variant: { color: "Blue", size: "18x18 inch" },
    sku: "CSH-SLK-003",
    inStock: true,
    stockCount: 7,
    estimatedDelivery: "Jan 25 - Jan 28",
  },
];

const mockSavedItems: CartItem[] = [
  {
    id: "saved-1",
    productId: "prod-4",
    name: "Traditional Ajrak Print Scarf",
    image: "/api/placeholder/200/200",
    price: 2800,
    originalPrice: 3500,
    quantity: 1,
    maxQuantity: 10,
    variant: { color: "Indigo" },
    sku: "SCF-AJR-004",
    inStock: true,
    stockCount: 12,
    isSavedForLater: true,
  },
];

const mockRecommendedProducts: RecommendedProduct[] = [
  {
    id: "rec-1",
    name: "Pashmina Wool Shawl",
    image: "/api/placeholder/200/200",
    price: 15000,
    originalPrice: 18000,
    rating: 4.8,
    reviewCount: 124,
  },
  {
    id: "rec-2",
    name: "Hand-painted Ceramic Vase",
    image: "/api/placeholder/200/200",
    price: 4200,
    rating: 4.6,
    reviewCount: 89,
  },
  {
    id: "rec-3",
    name: "Brass Decorative Bowl",
    image: "/api/placeholder/200/200",
    price: 3800,
    originalPrice: 4500,
    rating: 4.7,
    reviewCount: 56,
  },
  {
    id: "rec-4",
    name: "Embroidered Table Runner",
    image: "/api/placeholder/200/200",
    price: 2500,
    rating: 4.5,
    reviewCount: 78,
  },
];

const shippingOptions: ShippingOption[] = [
  {
    id: "standard",
    name: "Standard Delivery",
    description: "3-5 business days",
    price: 250,
    estimatedDays: "Jan 25 - Jan 28",
    icon: Truck,
  },
  {
    id: "express",
    name: "Express Delivery",
    description: "1-2 business days",
    price: 450,
    estimatedDays: "Jan 22 - Jan 23",
    icon: Zap,
  },
  {
    id: "same-day",
    name: "Same Day Delivery",
    description: "Order before 2 PM",
    price: 650,
    estimatedDays: "Today",
    icon: Timer,
  },
];

const validPromoCodes: PromoCode[] = [
  {
    code: "SAVE10",
    type: "percentage",
    value: 10,
    minOrderAmount: 5000,
    description: "10% off on orders above PKR 5,000",
  },
  {
    code: "FLAT500",
    type: "fixed",
    value: 500,
    minOrderAmount: 3000,
    description: "PKR 500 off on orders above PKR 3,000",
  },
  {
    code: "FREESHIP",
    type: "free_shipping",
    value: 0,
    minOrderAmount: 2000,
    description: "Free shipping on orders above PKR 2,000",
  },
];

export {
  mockCartItems,
  mockSavedItems,
  mockRecommendedProducts,
  shippingOptions,
  validPromoCodes,
};
