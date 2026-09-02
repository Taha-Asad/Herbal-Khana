// components/checkout/ShippingMethodSelector.tsx
"use client";

import { ShippingMethodOption } from "@/types/checkout";
import { Truck, Check, Zap, Clock } from "lucide-react";

interface ShippingMethodSelectorProps {
  methods: ShippingMethodOption[];
  selectedId?: string;
  subtotal: number;
  onSelect: (method: ShippingMethodOption) => void;
}

export default function ShippingMethodSelector({
  methods,
  selectedId,
  subtotal,
  onSelect,
}: ShippingMethodSelectorProps) {
  return (
    <div className="space-y-3">
      {methods.map((method) => {
        const isFree = method.freeAbove && subtotal >= method.freeAbove;
        const displayPrice = isFree ? 0 : method.price;

        return (
          <button
            key={method.id}
            onClick={() => onSelect(method)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              selectedId === method.id
                ? "border-[#DDA200] bg-[#FFF9E6]"
                : "border-stone-200 hover:border-[#DDA200]/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedId === method.id
                      ? "border-[#DDA200] bg-[#DDA200]"
                      : "border-stone-300"
                  }`}
                >
                  {selectedId === method.id && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>

                <div className="p-2 bg-stone-100 rounded-lg">
                  {method.name.toLowerCase().includes("express") ? (
                    <Zap className="w-5 h-5 text-[#DDA200]" />
                  ) : (
                    <Truck className="w-5 h-5 text-stone-500" />
                  )}
                </div>

                <div>
                  <p className="font-semibold text-stone-800">{method.name}</p>
                  {method.description && (
                    <p className="text-sm text-stone-500">
                      {method.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-stone-400" />
                    <span className="text-sm text-stone-600">
                      {method.estimatedDays} days
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                {isFree ? (
                  <div>
                    <span className="text-green-600 font-bold">FREE</span>
                    <p className="text-xs text-stone-500 line-through">
                      PKR {method.price.toLocaleString()}
                    </p>
                  </div>
                ) : (
                  <span className="font-bold text-stone-800">
                    PKR {displayPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Free shipping threshold notice */}
            {method.freeAbove && !isFree && (
              <div className="mt-3 p-2 bg-amber-50 rounded-lg">
                <p className="text-xs text-amber-700">
                  Add PKR {(method.freeAbove - subtotal).toLocaleString()} more
                  for free shipping
                </p>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
