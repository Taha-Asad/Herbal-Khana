// components/checkout/AddressSelector.tsx
"use client";

import { CheckoutAddress } from "@/types/checkout";
import { MapPin, Check, Edit2, Trash2 } from "lucide-react";

interface AddressSelectorProps {
  addresses: CheckoutAddress[];
  selectedId?: string;
  onSelect: (address: CheckoutAddress) => void;
  onEdit?: (address: CheckoutAddress) => void;
  onDelete?: (addressId: string) => void;
}

export default function AddressSelector({
  addresses,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
}: AddressSelectorProps) {
  return (
    <div className="space-y-3">
      {addresses.map((address) => (
        <div
          key={address.id}
          className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
            selectedId === address.id
              ? "border-[#DDA200] bg-[#FFF9E6]"
              : "border-stone-200 hover:border-[#DDA200]/50"
          }`}
          onClick={() => onSelect(address)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                  selectedId === address.id
                    ? "border-[#DDA200] bg-[#DDA200]"
                    : "border-stone-300"
                }`}
              >
                {selectedId === address.id && (
                  <Check className="w-4 h-4 text-white" />
                )}
              </div>
              <div>
                <p className="font-semibold text-stone-800">{address.name}</p>
                <p className="text-sm text-stone-600">{address.line1}</p>
                {address.line2 && (
                  <p className="text-sm text-stone-600">{address.line2}</p>
                )}
                <p className="text-sm text-stone-600">
                  {address.city}, {address.state} {address.postal}
                </p>
                <p className="text-sm text-stone-500 mt-1">{address.phone}</p>
              </div>
            </div>

            {/* Action buttons */}
            {(onEdit || onDelete) && (
              <div className="flex items-center gap-2">
                {onEdit && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(address);
                    }}
                    className="p-2 text-stone-400 hover:text-[#DDA200] hover:bg-stone-100 rounded-lg transition-colors"
                    title="Edit address"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        confirm("Are you sure you want to delete this address?")
                      ) {
                        onDelete(address.id!);
                      }
                    }}
                    className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      {addresses.length === 0 && (
        <div className="text-center py-8 text-stone-500">
          <MapPin className="w-12 h-12 mx-auto mb-3 text-stone-300" />
          <p>No saved addresses yet</p>
        </div>
      )}
    </div>
  );
}
