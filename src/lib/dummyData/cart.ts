import { ShippingOption } from "@/types/cart";
import { Truck } from "lucide-react";

export const shippingOptions: ShippingOption[] = [
  {
    id: "standard",
    name: "Standard Shipping",
    description: "Regular delivery",
    price: 200,
    estimatedDays: "5-7 business days",
    icon: Truck,
  },
  {
    id: "express",
    name: "Express Shipping",
    description: "Fast delivery",
    price: 400,
    estimatedDays: "2-3 business days",
    icon: Truck,
  },
  {
    id: "overnight",
    name: "Overnight Shipping",
    description: "Next day delivery",
    price: 700,
    estimatedDays: "1 business day",
    icon: Truck,
  },
];
