// components/admin/forms/CategoryForm.tsx
"use client";

import React, { useState } from "react";
import { Save, ImagePlus, Loader2 } from "lucide-react";
import { CategoryFormData } from "@/types/admin";

interface CategoryFormProps {
  initialData?: CategoryFormData;
  onSubmit: (data: CategoryFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const defaultFormData: CategoryFormData = {
  name: "",
  slug: "",
  description: "",
  image: "",
  isActive: true,
  sortOrder: 0,
};

export default function CategoryForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: CategoryFormProps) {
  const [formData, setFormData] = useState<CategoryFormData>(
    initialData || defaultFormData
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseInt(value) || 0
          : value,
    }));

    if (name === "name" && !initialData) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(value),
      }));
    }

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
    if (!formData.slug.trim()) newErrors.slug = "Slug is required";

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
            Category Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-amber-500 
              focus:border-transparent transition-all
              ${errors.name ? "border-red-500" : "border-gray-200"}`}
            placeholder="Enter category name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slug *
          </label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-amber-500 
              focus:border-transparent transition-all
              ${errors.slug ? "border-red-500" : "border-gray-200"}`}
            placeholder="category-slug"
          />
          {errors.slug && (
            <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
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
          rows={3}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 
            focus:ring-amber-500 focus:border-transparent transition-all resize-none"
          placeholder="Category description"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image URL
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              name="image"
              value={formData.image || ""}
              onChange={handleChange}
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 
                focus:ring-amber-500 focus:border-transparent transition-all"
              placeholder="https://example.com/image.jpg"
            />
            <button
              type="button"
              className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <ImagePlus className="w-5 h-5 text-gray-500" />
            </button>
          </div>
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
