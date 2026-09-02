// components/checkout/PaymentMethodSelector.tsx
"use client";

import { PaymentMethod } from "@/types/checkout";
import { PAYMENT_ACCOUNTS } from "@/lib/payment-config";
import { Check, Smartphone, Banknote, Shield } from "lucide-react";
import { ComponentType, SVGProps } from "react";

interface PaymentMethodSelectorProps {
  selected: PaymentMethod | null;
  onSelect: (method: PaymentMethod) => void;
  total: number;
}

const PAYMENT_OPTIONS: {
  id: PaymentMethod;
  name: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  color: string;
}[] = [
  {
    id: "jazzcash",
    name: "JazzCash",
    description: "Pay via JazzCash mobile wallet",
    icon: Smartphone,
    color: "bg-red-500",
  },
  {
    id: "easypaisa",
    name: "EasyPaisa",
    description: "Pay via EasyPaisa mobile wallet",
    icon: Smartphone,
    color: "bg-green-500",
  },
  {
    id: "cod",
    name: "Cash on Delivery",
    description: "Pay when you receive your order",
    icon: Banknote,
    color: "bg-stone-500",
  },
];

export default function PaymentMethodSelector({
  selected,
  onSelect,
  total,
}: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-3">
      {PAYMENT_OPTIONS.map((option) => {
        const config =
          PAYMENT_ACCOUNTS[option.id as keyof typeof PAYMENT_ACCOUNTS];

        let additionalFee = 0;

        // Only read additionalFee if it exists
        if (config && "additionalFee" in config && option.id === "cod") {
          additionalFee = config.additionalFee;
        }

        return (
          <button
            key={option.id}
            onClick={() => onSelect(option.id)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              selected === option.id
                ? "border-[#DDA200] bg-[#FFF9E6]"
                : "border-stone-200 hover:border-[#DDA200]/50"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selected === option.id
                      ? "border-[#DDA200] bg-[#DDA200]"
                      : "border-stone-300"
                  }`}
                >
                  {selected === option.id && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>

                <div className={`p-2 ${option.color} rounded-lg`}>
                  <option.icon className="w-5 h-5 text-white" />
                </div>

                <div>
                  <p className="font-semibold text-stone-800">{option.name}</p>
                  <p className="text-sm text-stone-500">{option.description}</p>
                </div>
              </div>

              {additionalFee > 0 && (
                <span className="text-sm text-stone-500">
                  +PKR {additionalFee}
                </span>
              )}
            </div>

            {/* Payment proof notice */}
            {selected === option.id && option.id !== "cod" && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  You&apos;ll need to upload payment proof after completing the
                  transaction. Your order will be confirmed once we verify the
                  payment.
                </p>
              </div>
            )}

            {/* COD notice */}
            {selected === option.id && option.id === "cod" && (
              <div className="mt-3 p-3 bg-stone-50 border border-stone-200 rounded-lg flex items-start gap-2">
                <Banknote className="w-4 h-4 text-stone-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-stone-600">
                  Please keep PKR {(total + additionalFee).toLocaleString()}{" "}
                  ready in cash when your order arrives.
                </p>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
