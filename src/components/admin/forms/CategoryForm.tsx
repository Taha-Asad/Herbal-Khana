"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Save, ImagePlus, Loader2, X } from "lucide-react";
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
  image: null,
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
    initialData ?? defaultFormData
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<string | null>(
    initialData && typeof initialData.image === "string"
      ? initialData.image
      : null
  );

  const generateSlug = (name: string): string =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

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
          ? Number(value) || 0
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
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;

    setFormData((prev) => ({
      ...prev,
      image: file,
    }));

    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setPreview(null);
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
      {/* Name + Slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Category Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 rounded-xl border ${
              errors.name ? "border-red-500" : "border-gray-200"
            }`}
          />
          {errors.name && (
            <p className="text-sm text-red-600 mt-1">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Slug *</label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 rounded-xl border ${
              errors.slug ? "border-red-500" : "border-gray-200"
            }`}
          />
          {errors.slug && (
            <p className="text-sm text-red-600 mt-1">{errors.slug}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl resize-none"
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium mb-2">Category Image</label>

        {preview ? (
          <div className="relative w-32 h-32 rounded-xl overflow-hidden border">
            <Image src={preview} alt="Preview" fill className="object-cover" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-2 cursor-pointer px-4 py-2.5 border border-dashed rounded-xl hover:bg-gray-50">
            <ImagePlus className="w-5 h-5 text-gray-500" />
            <span className="text-sm text-gray-600">Upload image</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        )}
      </div>

      {/* Sort + Active */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Sort Order</label>
          <input
            type="number"
            name="sortOrder"
            value={formData.sortOrder}
            onChange={handleChange}
            min={0}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl"
          />
        </div>

        <label className="flex items-center gap-2 mt-8">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
          />
          <span className="text-sm">Active</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-6 py-2.5 bg-gray-100 rounded-xl"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 text-white rounded-xl"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving…
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
