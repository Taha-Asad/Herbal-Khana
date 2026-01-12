// components/admin/forms/PromoCodeForm.tsx
"use client";

import React, { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { PromoCodeFormData } from "@/types/admin";
import { PROMO_TYPE } from "@prisma/client";

interface PromoCodeFormProps {
  initialData?: PromoCodeFormData;
  onSubmit: (data: PromoCodeFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const defaultFormData: PromoCodeFormData = {
  code: "",
  description: "",
  type: "PERCENTAGE",
  value: 0,
  minOrderAmount: undefined,
  maxDiscount: undefined,
  maxUses: undefined,
  maxUsesPerUser: 1,
  isActive: true,
  isFirstOrderOnly: false,
  startsAt: "",
  expiresAt: "",
};

const promoTypes: { value: PROMO_TYPE; label: string }[] = [
  { value: "PERCENTAGE", label: "Percentage Discount" },
  { value: "FIXED", label: "Fixed Amount" },
  { value: "FREE_SHIPPING", label: "Free Shipping" },
];

export default function PromoCodeForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: PromoCodeFormProps) {
  const [formData, setFormData] = useState<PromoCodeFormData>(
    initialData || defaultFormData
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    let processedValue: string | number | boolean | undefined = value;

    if (type === "checkbox") {
      processedValue = checked;
    } else if (type === "number") {
      processedValue = value === "" ? undefined : parseFloat(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) newErrors.code = "Code is required";
    if (formData.type !== "FREE_SHIPPING" && formData.value <= 0) {
      newErrors.value = "Value must be greater than 0";
    }
    if (formData.type === "PERCENTAGE" && formData.value > 100) {
      newErrors.value = "Percentage cannot exceed 100%";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Promo Code *
          </label>
          <input
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-amber-500 
              focus:border-transparent transition-all uppercase
              ${errors.code ? "border-red-500" : "border-gray-200"}`}
            placeholder="SAVE20"
          />
          {errors.code && (
            <p className="mt-1 text-sm text-red-600">{errors.code}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type *
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 
              focus:ring-amber-500 focus:border-transparent transition-all"
          >
            {promoTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          rows={2}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 
            focus:ring-amber-500 focus:border-transparent transition-all resize-none"
          placeholder="Promo code description"
        />
      </div>

      {formData.type !== "FREE_SHIPPING" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.type === "PERCENTAGE"
                ? "Discount %"
                : "Discount Amount"}{" "}
              *
            </label>
            <input
              type="number"
              name="value"
              value={formData.value || ""}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-amber-500 
                focus:border-transparent transition-all
                ${errors.value ? "border-red-500" : "border-gray-200"}`}
              min="0"
              max={formData.type === "PERCENTAGE" ? 100 : undefined}
              step={formData.type === "PERCENTAGE" ? 1 : 0.01}
            />
            {errors.value && (
              <p className="mt-1 text-sm text-red-600">{errors.value}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Order Amount
            </label>
            <input
              type="number"
              name="minOrderAmount"
              value={formData.minOrderAmount || ""}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 
                focus:ring-amber-500 focus:border-transparent transition-all"
              min="0"
              step="0.01"
              placeholder="0"
            />
          </div>

          {formData.type === "PERCENTAGE" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Discount
              </label>
              <input
                type="number"
                name="maxDiscount"
                value={formData.maxDiscount || ""}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 
                  focus:ring-amber-500 focus:border-transparent transition-all"
                min="0"
                step="0.01"
                placeholder="No limit"
              />
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Total Uses
          </label>
          <input
            type="number"
            name="maxUses"
            value={formData.maxUses || ""}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 
              focus:ring-amber-500 focus:border-transparent transition-all"
            min="1"
            placeholder="Unlimited"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Uses Per User
          </label>
          <input
            type="number"
            name="maxUsesPerUser"
            value={formData.maxUsesPerUser}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 
              focus:ring-amber-500 focus:border-transparent transition-all"
            min="1"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Starts At
          </label>
          <input
            type="datetime-local"
            name="startsAt"
            value={formData.startsAt || ""}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 
              focus:ring-amber-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expires At
          </label>
          <input
            type="datetime-local"
            name="expiresAt"
            value={formData.expiresAt || ""}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 
              focus:ring-amber-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
          />
          <span className="text-sm text-gray-700">Active</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="isFirstOrderOnly"
            checked={formData.isFirstOrderOnly}
            onChange={handleChange}
            className="w-4 h-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
          />
          <span className="text-sm text-gray-700">First Order Only</span>
        </label>
      </div>

      <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 
            font-medium rounded-xl transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 
            text-white font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 
            transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {initialData ? "Update" : "Create"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
