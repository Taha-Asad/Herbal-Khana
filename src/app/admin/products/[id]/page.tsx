// app/admin/products/[id]/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import ProductForm from "@/components/admin/forms/ProductForm";
import { getProduct, updateProduct } from "@/app/action/admin/products.actions";
import { getCategories } from "@/app/action/admin/categories.actions";
import { Product, ProductFormData, Category } from "@/types/admin";
import toast from "react-hot-toast";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use useTransition for initial loading state
  const [isPending, startTransition] = useTransition();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Define loadData BEFORE useEffect
  const loadData = useCallback(async () => {
    // Load product and categories in parallel
    const [productResult, categoriesResult] = await Promise.all([
      getProduct(productId),
      getCategories(),
    ]);

    if (productResult.success && productResult.data) {
      setProduct(productResult.data);
      setError(null);
    } else {
      setError(productResult.error || "Product not found");
    }

    if (categoriesResult.success && categoriesResult.data) {
      setCategories(categoriesResult.data);
    }

    setIsInitialLoad(false);
  }, [productId]);

  // useEffect AFTER loadData definition
  useEffect(() => {
    if (productId) {
      startTransition(() => {
        loadData();
      });
    }
  }, [productId, loadData]);

  // Combined loading state
  const loading = isInitialLoad || isPending;

  // ✅ Fixed: Return type matches ProductForm's onSubmit interface
  const handleSubmit = async (
    data: ProductFormData
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const result = await updateProduct(productId, data);
      if (result.success) {
        toast.success("Product updated successfully");
        router.push("/admin/products");
        return { success: true };
      } else {
        const errorMsg = result.error || "Failed to update product";
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = "An error occurred";
      toast.error(errorMsg);
      console.error(err);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Product Not Found
        </h2>
        <p className="text-gray-500 mb-4">{error}</p>
        <Link
          href="/admin/products"
          className="text-amber-600 hover:text-amber-700 font-medium"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  const initialData: ProductFormData = {
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    shortDescription: product.shortDescription,
    costPrice: product.costPrice,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    isNew: product.isNew,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    categoryId: product.categoryId,
    images: product.images,
    variants: product.variants,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-500">{product.name}</p>
        </div>
      </div>

      {/* Form - ✅ Fixed: Pass categories and use isLoading */}
      <ProductForm
        initialData={initialData}
        categories={categories}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
