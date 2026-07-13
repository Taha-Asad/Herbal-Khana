// components/admin/forms/ProductForm.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Plus,
  Trash2,
  Upload,
  GripVertical,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { ProductFormData, ProductVariant, Category } from "@/types/admin";
import toast from "react-hot-toast";
import Image from "next/image";

interface ProductFormProps {
  initialData?: ProductFormData;
  categories: Category[];
  onSubmit: (
    data: ProductFormData,
  ) => Promise<{ success: boolean; error?: string }>;
  isLoading?: boolean;
}

const defaultVariant: Omit<ProductVariant, "id"> = {
  name: "",
  size: "",
  scent: "",
  concentration: "",
  sku: "",
  price: 0,
  stock: 0,
  lowStockThreshold: 5,
};

const defaultFormData: ProductFormData = {
  name: "",
  slug: "",
  sku: "",
  description: "",
  shortDescription: "",
  isActive: true,
  isFeatured: false,
  isNew: false,
  metaTitle: "",
  metaDescription: "",
  categoryId: "",
  images: [],
  variants: [{ ...defaultVariant }],
};

export default function ProductForm({
  initialData,
  categories,
  onSubmit,
  isLoading = false,
}: ProductFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<ProductFormData>(
    initialData || defaultFormData,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<
    "basic" | "variants" | "images" | "seo"
  >("basic");

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Auto-generate slug from name
    if (name === "name" && !initialData) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(value),
      }));
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleVariantChange = (
    index: number,
    field: keyof ProductVariant,
    value: string | number,
  ) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.map((v, i) =>
        i === index ? { ...v, [field]: value } : v,
      ),
    }));
  };

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { ...defaultVariant }],
    }));
  };

  const removeVariant = (index: number) => {
    if (formData.variants.length === 1) {
      toast.error("At least one variant is required");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const handleImageFiles = (files: FileList | null) => {
    if (!files) return;

    const newImages = Array.from(files).map((file, index) => ({
      file,
      url: URL.createObjectURL(file), // preview only
      alt: formData.name,
      sortOrder: formData.images.length + index,
      isPrimary: formData.images.length === 0 && index === 0,
    }));

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages],
    }));
  };

  const handleImageRemove = (index: number) => {
    setFormData((prev) => {
      const newImages = prev.images.filter((_, i) => i !== index);
      // If removed image was primary, make first image primary
      if (prev.images[index]?.isPrimary && newImages.length > 0) {
        newImages[0].isPrimary = true;
      }
      return { ...prev, images: newImages };
    });
  };

  const setImageAsPrimary = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      })),
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.slug.trim()) newErrors.slug = "Slug is required";
    if (!formData.sku.trim()) newErrors.sku = "SKU is required";

    // Validate variants
    formData.variants.forEach((variant, index) => {
      if (!variant.name.trim()) {
        newErrors[`variant_${index}_name`] = "Variant name is required";
      }
      if (!variant.sku.trim()) {
        newErrors[`variant_${index}_sku`] = "Variant SKU is required";
      }
      if (variant.price <= 0) {
        newErrors[`variant_${index}_price`] = "Price must be greater than 0";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    const result = await onSubmit(formData);

    if (result.success) {
      toast.success(initialData ? "Product updated" : "Product created");
      router.push("/admin/products");
    } else {
      toast.error(result.error || "Something went wrong");
    }
  };

  const tabs = [
    { id: "basic" as const, label: "Basic Info" },
    { id: "variants" as const, label: "Variants" },
    { id: "images" as const, label: "Images" },
    { id: "seo" as const, label: "SEO" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors
                  ${
                    activeTab === tab.id
                      ? "border-amber-500 text-amber-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Basic Info Tab */}
          {activeTab === "basic" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-amber-500 
                      focus:border-transparent transition-all ${
                        errors.name ? "border-red-500" : "border-gray-200"
                      }`}
                    placeholder="Enter product name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* Slug */}
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
                      focus:border-transparent transition-all ${
                        errors.slug ? "border-red-500" : "border-gray-200"
                      }`}
                    placeholder="product-slug"
                  />
                  {errors.slug && (
                    <p className="mt-1 text-sm text-red-500">{errors.slug}</p>
                  )}
                </div>

                {/* SKU */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SKU *
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-amber-500 
                      focus:border-transparent transition-all ${
                        errors.sku ? "border-red-500" : "border-gray-200"
                      }`}
                    placeholder="PROD-001"
                  />
                  {errors.sku && (
                    <p className="mt-1 text-sm text-red-500">{errors.sku}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 
                      focus:ring-amber-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Description
                </label>
                <input
                  type="text"
                  name="shortDescription"
                  value={formData.shortDescription || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 
                    focus:ring-amber-500 focus:border-transparent"
                  placeholder="Brief product description"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Description
                </label>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 
                    focus:ring-amber-500 focus:border-transparent resize-none"
                  placeholder="Detailed product description..."
                />
              </div>

              {/* Toggles */}
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Active
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Featured
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isNew"
                    checked={formData.isNew}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    New Arrival
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Variants Tab */}
          {activeTab === "variants" && (
            <div className="space-y-4">
              {formData.variants.map((variant, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-700">
                        Variant {index + 1}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) =>
                          handleVariantChange(index, "name", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                          focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="e.g., 50ml Bottle"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Size *
                      </label>
                      <input
                        type="text"
                        value={variant.size}
                        onChange={(e) =>
                          handleVariantChange(index, "size", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                          focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="e.g., 50ml"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        SKU *
                      </label>
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(e) =>
                          handleVariantChange(index, "sku", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                          focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="PROD-001-50ML"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Price (PKR) *
                      </label>
                      <input
                        type="number"
                        value={variant.price}
                        onChange={(e) =>
                          handleVariantChange(
                            index,
                            "price",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                          focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Stock
                      </label>
                      <input
                        type="number"
                        value={variant.stock}
                        onChange={(e) =>
                          handleVariantChange(
                            index,
                            "stock",
                            parseInt(e.target.value) || 0,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                          focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Low Stock Alert
                      </label>
                      <input
                        type="number"
                        value={variant.lowStockThreshold}
                        onChange={(e) =>
                          handleVariantChange(
                            index,
                            "lowStockThreshold",
                            parseInt(e.target.value) || 5,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                          focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Scent (Optional)
                      </label>
                      <input
                        type="text"
                        value={variant.scent || ""}
                        onChange={(e) =>
                          handleVariantChange(index, "scent", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                          focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="e.g., Oud"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Concentration (Optional)
                      </label>
                      <input
                        type="text"
                        value={variant.concentration || ""}
                        onChange={(e) =>
                          handleVariantChange(
                            index,
                            "concentration",
                            e.target.value,
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm
                          focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="e.g., EDP"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addVariant}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl
                  text-gray-600 hover:border-amber-500 hover:text-amber-600 transition-colors
                  flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Variant
              </button>
            </div>
          )}

          {/* Images Tab */}
          {activeTab === "images" && (
            <div className="space-y-4">
              {/* Image Upload Placeholder */}
              <label
                className="border-2 border-dashed border-gray-300 rounded-xl p-8
    text-center hover:border-amber-500 transition-colors cursor-pointer block"
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleImageFiles(e.target.files)}
                />
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">
                  Click to upload images
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  PNG, JPG, WEBP supported
                </p>
              </label>

              {/* Images Grid */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((image, index) => (
                    <div
                      key={index}
                      className={`relative group rounded-xl overflow-hidden border-2 
                        ${
                          image.isPrimary
                            ? "border-amber-500"
                            : "border-gray-200"
                        }`}
                    >
                      <div className="aspect-square bg-gray-100">
                        <Image
                          src={image.url || "/placeholder.svg"}
                          alt={image.alt || "Product image"}
                          width={500}
                          height={500}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100
                          transition-opacity flex items-center justify-center gap-2"
                      >
                        <button
                          type="button"
                          onClick={() => setImageAsPrimary(index)}
                          className="p-2 bg-white rounded-lg text-amber-600 hover:bg-amber-50"
                          title="Set as primary"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleImageRemove(index)}
                          className="p-2 bg-white rounded-lg text-red-600 hover:bg-red-50"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      {image.isPrimary && (
                        <span
                          className="absolute top-2 left-2 px-2 py-1 bg-amber-500 text-white
                            text-xs font-medium rounded"
                        >
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === "seo" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Title
                </label>
                <input
                  type="text"
                  name="metaTitle"
                  value={formData.metaTitle || ""}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 
                    focus:ring-amber-500 focus:border-transparent"
                  placeholder="SEO title (defaults to product name)"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {(formData.metaTitle || formData.name).length}/60 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  name="metaDescription"
                  value={formData.metaDescription || ""}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 
                    focus:ring-amber-500 focus:border-transparent resize-none"
                  placeholder="SEO description for search engines"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {(formData.metaDescription || "").length}/160 characters
                </p>
              </div>

              {/* Preview */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-2">Search Preview</p>
                <div className="text-blue-600 text-lg font-medium truncate">
                  {formData.metaTitle || formData.name || "Product Title"}
                </div>
                <div className="text-green-700 text-sm">
                  yourstore.com/products/{formData.slug || "product-slug"}
                </div>
                <div className="text-gray-600 text-sm mt-1 line-clamp-2">
                  {formData.metaDescription ||
                    formData.shortDescription ||
                    "Product description will appear here..."}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 
            font-medium rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 bg-linear-to-r from-amber-500 to-amber-600 text-white 
            font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all 
            disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-amber-500/30"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {initialData ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  );
}
