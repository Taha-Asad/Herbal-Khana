// components/admin/forms/ShippingMethodForm.tsx
"use client";

import React, { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { ShippingMethodFormData } from "@/types/admin";

interface ShippingMethodFormProps {
  initialData?: ShippingMethodFormData;
  onSubmit: (data: ShippingMethodFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const defaultFormData: ShippingMethodFormData = {
  name: "",
  description: "",
  price: 0,
  freeAbove: undefined,
  estimatedDays: "3-5 business days",
  isActive: true,
  sortOrder: 0,
};

export default function ShippingMethodForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: ShippingMethodFormProps) {
  const [formData, setFormData] = useState<ShippingMethodFormData>(
    initialData || defaultFormData
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (formData.price < 0) newErrors.price = "Price cannot be negative";
    if (!formData.estimatedDays.trim())
      newErrors.estimatedDays = "Estimated days is required";

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
            Method Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-amber-500 
              focus:border-transparent transition-all
              ${errors.name ? "border-red-500" : "border-gray-200"}`}
            placeholder="Standard Shipping"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price (PKR) *
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-amber-500 
              focus:border-transparent transition-all
              ${errors.price ? "border-red-500" : "border-gray-200"}`}
            min="0"
            step="0.01"
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price}</p>
          )}
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
          placeholder="Shipping method description"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Free Above (PKR)
          </label>
          <input
            type="number"
            name="freeAbove"
            value={formData.freeAbove || ""}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 
              focus:ring-amber-500 focus:border-transparent transition-all"
            min="0"
            step="0.01"
            placeholder="No threshold"
          />
          <p className="mt-1 text-xs text-gray-500">
            Free shipping for orders above this amount
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Delivery *
          </label>
          <input
            type="text"
            name="estimatedDays"
            value={formData.estimatedDays}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-amber-500 
              focus:border-transparent transition-all
              ${errors.estimatedDays ? "border-red-500" : "border-gray-200"}`}
            placeholder="3-5 business days"
          />
          {errors.estimatedDays && (
            <p className="mt-1 text-sm text-red-600">{errors.estimatedDays}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort Order
          </label>
          <input
            type="number"
            name="sortOrder"
            value={formData.sortOrder}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 
              focus:ring-amber-500 focus:border-transparent transition-all"
            min="0"
          />
        </div>
      </div>

      <div>
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
