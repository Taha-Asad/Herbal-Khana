// components/checkout/AddressForm.tsx
"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { CheckoutAddress } from "@/types/checkout";

interface AddressFormProps {
  initialData?: Partial<CheckoutAddress>;
  onSubmit: (address: Omit<CheckoutAddress, "id">) => void;
  isLoading?: boolean;
  onCancel?: () => void;
}

const PAKISTAN_CITIES = [
  "Karachi",
  "Lahore",
  "Islamabad",
  "Rawalpindi",
  "Faisalabad",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
  "Hyderabad",
  "Bahawalpur",
  "Sargodha",
  "Sukkur",
  "Larkana",
  "Sheikhupura",
  "Jhang",
  "Rahim Yar Khan",
  "Mardan",
  "Gujrat",
  "Other",
];

const PAKISTAN_PROVINCES = [
  "Punjab",
  "Sindh",
  "Khyber Pakhtunkhwa",
  "Balochistan",
  "Islamabad Capital Territory",
  "Azad Kashmir",
  "Gilgit-Baltistan",
];

export default function AddressForm({
  initialData,
  onSubmit,
  isLoading = false,
  onCancel,
}: AddressFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    phone: initialData?.phone || "",
    line1: initialData?.line1 || "",
    line2: initialData?.line2 || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    postal: initialData?.postal || "",
    country: "Pakistan",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (
      !/^(\+92|0)?[0-9]{10}$/.test(formData.phone.replace(/\s/g, ""))
    ) {
      newErrors.phone = "Enter a valid Pakistani phone number";
    }

    if (!formData.line1.trim()) {
      newErrors.line1 = "Street address is required";
    }

    if (!formData.city) {
      newErrors.city = "City is required";
    }

    if (!formData.state) {
      newErrors.state = "Province is required";
    }

    if (!formData.postal.trim()) {
      newErrors.postal = "Postal code is required";
    } else if (!/^[0-9]{5}$/.test(formData.postal)) {
      newErrors.postal = "Enter a valid 5-digit postal code";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Full Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-stone-700 mb-1"
        >
          Full Name *
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter your full name"
          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
            errors.name
              ? "border-red-300 focus:border-red-500"
              : "border-stone-200 focus:border-[#DDA200]"
          }`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label
          htmlFor="phone"
          className="block text-sm font-medium text-stone-700 mb-1"
        >
          Phone Number *
        </label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="03XX-XXXXXXX"
          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
            errors.phone
              ? "border-red-300 focus:border-red-500"
              : "border-stone-200 focus:border-[#DDA200]"
          }`}
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
        )}
      </div>

      {/* Street Address */}
      <div>
        <label
          htmlFor="line1"
          className="block text-sm font-medium text-stone-700 mb-1"
        >
          Street Address *
        </label>
        <input
          type="text"
          id="line1"
          name="line1"
          value={formData.line1}
          onChange={handleChange}
          placeholder="House no, Street, Area"
          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
            errors.line1
              ? "border-red-300 focus:border-red-500"
              : "border-stone-200 focus:border-[#DDA200]"
          }`}
        />
        {errors.line1 && (
          <p className="mt-1 text-sm text-red-500">{errors.line1}</p>
        )}
      </div>

      {/* Address Line 2 */}
      <div>
        <label
          htmlFor="line2"
          className="block text-sm font-medium text-stone-700 mb-1"
        >
          Apartment, Suite, etc. (Optional)
        </label>
        <input
          type="text"
          id="line2"
          name="line2"
          value={formData.line2}
          onChange={handleChange}
          placeholder="Apartment, suite, floor, etc."
          className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-[#DDA200] focus:outline-none transition-colors"
        />
      </div>

      {/* City and Province */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-stone-700 mb-1"
          >
            City *
          </label>
          <select
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors bg-white ${
              errors.city
                ? "border-red-300 focus:border-red-500"
                : "border-stone-200 focus:border-[#DDA200]"
            }`}
          >
            <option value="">Select City</option>
            {PAKISTAN_CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          {errors.city && (
            <p className="mt-1 text-sm text-red-500">{errors.city}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="state"
            className="block text-sm font-medium text-stone-700 mb-1"
          >
            Province *
          </label>
          <select
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors bg-white ${
              errors.state
                ? "border-red-300 focus:border-red-500"
                : "border-stone-200 focus:border-[#DDA200]"
            }`}
          >
            <option value="">Select Province</option>
            {PAKISTAN_PROVINCES.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="mt-1 text-sm text-red-500">{errors.state}</p>
          )}
        </div>
      </div>

      {/* Postal Code */}
      <div className="max-w-xs">
        <label
          htmlFor="postal"
          className="block text-sm font-medium text-stone-700 mb-1"
        >
          Postal Code *
        </label>
        <input
          type="text"
          id="postal"
          name="postal"
          value={formData.postal}
          onChange={handleChange}
          placeholder="e.g., 75400"
          maxLength={5}
          className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
            errors.postal
              ? "border-red-300 focus:border-red-500"
              : "border-stone-200 focus:border-[#DDA200]"
          }`}
        />
        {errors.postal && (
          <p className="mt-1 text-sm text-red-500">{errors.postal}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex items-center gap-4 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 py-3 px-6 bg-gradient-to-r from-[#DDA200] to-[#b38600] text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Address"
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-stone-600 font-medium hover:text-stone-800 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
