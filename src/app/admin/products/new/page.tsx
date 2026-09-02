// app/admin/products/new/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import ProductForm from "@/components/admin/forms/ProductForm";
import { createProduct } from "@/app/action/admin/products.actions";
import { getCategories } from "@/app/action/admin/categories.actions";
import { ProductFormData, Category } from "@/types/admin";
import toast from "react-hot-toast";

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Use useTransition for initial loading
  const [isPending, startTransition] = useTransition();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load categories
  const loadCategories = useCallback(async () => {
    const result = await getCategories();
    if (result.success && result.data) {
      setCategories(result.data);
    }
    setIsInitialLoad(false);
  }, []);

  useEffect(() => {
    startTransition(() => {
      loadCategories();
    });
  }, [loadCategories]);

  const loading = isInitialLoad || isPending;

  // ✅ Fixed: Return type matches ProductForm's onSubmit interface
  const handleSubmit = async (
    data: ProductFormData
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const result = await createProduct(data);
      if (result.success) {
        toast.success("Product created successfully");
        router.push("/admin/products");
        return { success: true };
      } else {
        const errorMsg = result.error || "Failed to create product";
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      const errorMsg = "An error occurred";
      toast.error(errorMsg);
      console.error("createProduct error:", err);
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
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-500">Create a new product in your catalog</p>
        </div>
      </div>

      {/* Form - ✅ Fixed: Pass categories and use isLoading */}
      <ProductForm
        categories={categories}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
