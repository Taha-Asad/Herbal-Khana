// app/admin/categories/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import Image from "next/image";
import {
  Plus,
  FolderTree,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  Loader2,
} from "lucide-react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/app/action/admin/categories.actions";
import { Category, CategoryFormData } from "@/types/admin";
import EmptyState from "@/components/admin/ui/EmptyState";
import ConfirmModal from "@/components/admin/ui/ConfirmModal";
import toast from "react-hot-toast";
import CategoryForm from "@/components/admin/forms/CategoryForm";
const mapCategoryToFormData = (category: Category): CategoryFormData => ({
  name: category.name,
  slug: category.slug,
  description: category.description,
  image: null, // IMPORTANT: Files cannot come from DB
  isActive: category.isActive,
  sortOrder: category.sortOrder,
});

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Use useTransition for loading state to avoid the effect warning
  const [isPending, startTransition] = useTransition();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    const result = await getCategories();
    if (result.success && result.data) {
      setCategories(result.data);
    }
    setIsInitialLoading(false);
  }, []);

  useEffect(() => {
    // Wrap the data fetching in startTransition
    startTransition(() => {
      loadCategories();
    });
  }, [loadCategories]);

  // Combined loading state
  const loading = isInitialLoading || isPending;

  const handleCreate = async (data: CategoryFormData) => {
    setIsSubmitting(true);
    const result = await createCategory(data);
    if (result.success) {
      toast.success("Category created");
      setShowForm(false);
      startTransition(() => {
        loadCategories();
      });
    } else {
      toast.error(result.error || "Failed to create category");
    }
    setIsSubmitting(false);
  };

  const handleUpdate = async (data: CategoryFormData) => {
    if (!editingCategory) return;
    setIsSubmitting(true);
    const result = await updateCategory(editingCategory.id, data);
    if (result.success) {
      toast.success("Category updated");
      setEditingCategory(null);
      startTransition(() => {
        loadCategories();
      });
    } else {
      toast.error(result.error || "Failed to update category");
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteCategory(deleteId);
    if (result.success) {
      toast.success("Category deleted");
      startTransition(() => {
        loadCategories();
      });
    } else {
      toast.error(result.error || "Failed to delete category");
    }
    setDeleting(false);
    setDeleteId(null);
  };

  const handleToggleStatus = async (category: Category) => {
    const result = await updateCategory(category.id, {
      isActive: !category.isActive,
    });
    if (result.success) {
      toast.success(
        `Category ${!category.isActive ? "activated" : "deactivated"}`
      );
      startTransition(() => {
        loadCategories();
      });
    } else {
      toast.error(result.error || "Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500">Manage product categories</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r 
            from-amber-500 to-amber-600 text-white font-semibold rounded-xl 
            hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/30"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : categories.length === 0 ? (
          <EmptyState
            icon={FolderTree}
            title="No categories yet"
            description="Create your first category to organize your products."
            action={{ label: "Add Category", onClick: () => setShowForm(true) }}
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="text-gray-400 cursor-move">
                  <GripVertical className="w-5 h-5" />
                </div>
                <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                  {category.image ? (
                    <Image
                      src={category.image}
                      alt={category.name}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FolderTree className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-500">
                    {category.productCount} products • /{category.slug}
                  </p>
                </div>
                <button
                  onClick={() => handleToggleStatus(category)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors
                    ${
                      category.isActive
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  {category.isActive ? (
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Active
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <EyeOff className="w-3 h-3" /> Inactive
                    </span>
                  )}
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingCategory(category)}
                    className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(category.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showForm || editingCategory) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setShowForm(false);
              setEditingCategory(null);
            }}
          />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingCategory ? "Edit Category" : "Create Category"}
            </h2>
            <CategoryForm
              initialData={
                editingCategory
                  ? mapCategoryToFormData(editingCategory)
                  : undefined
              }
              onSubmit={editingCategory ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditingCategory(null);
              }}
              isLoading={isSubmitting} // ✅ Fixed: Changed from isSubmitting to isLoading
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category? Products in this category will be uncategorized."
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  );
}
