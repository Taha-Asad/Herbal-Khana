// app/admin/products/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  Package,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  AlertTriangle,
  Loader2,
  Filter,
} from "lucide-react";
import {
  getProducts,
  toggleProductStatus,
  toggleProductFeatured,
  deleteProduct,
} from "@/app/action/admin/products.actions";
import { getCategories } from "@/app/action/admin/categories.actions";
import { ProductListItem, Category } from "@/types/admin";
import Pagination from "@/components/admin/ui/Pagination";
import EmptyState from "@/components/admin/ui/EmptyState";
import ConfirmModal from "@/components/admin/ui/ConfirmModal";
import toast from "react-hot-toast";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Use useTransition for loading states
  const [isPending, startTransition] = useTransition();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isCategoriesLoaded, setIsCategoriesLoaded] = useState(false);

  // Define loadProducts with useCallback BEFORE useEffect
  const loadProducts = useCallback(async () => {
    const result = await getProducts({
      search,
      status: statusFilter,
      category: categoryFilter,
      page,
      pageSize: 20,
    });

    if (result.success && result.data) {
      setProducts(result.data.items);
      setTotalPages(result.data.totalPages);
      setTotal(result.data.total);
    }
    setIsInitialLoad(false);
  }, [search, statusFilter, categoryFilter, page]);

  // Define loadCategories with useCallback BEFORE useEffect
  const loadCategories = useCallback(async () => {
    const result = await getCategories();
    if (result.success && result.data) {
      setCategories(result.data);
    }
    setIsCategoriesLoaded(true);
  }, []);

  // useEffect comes AFTER function definitions
  useEffect(() => {
    startTransition(() => {
      loadProducts();
    });
  }, [loadProducts]);

  useEffect(() => {
    if (!isCategoriesLoaded) {
      startTransition(() => {
        loadCategories();
      });
    }
  }, [loadCategories, isCategoriesLoaded]);

  // Combined loading state
  const loading = isInitialLoad || (isPending && products.length === 0);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const result = await toggleProductStatus(id, !currentStatus);
    if (result.success) {
      toast.success(`Product ${!currentStatus ? "activated" : "deactivated"}`);
      startTransition(() => {
        loadProducts();
      });
    } else {
      toast.error(result.error || "Failed to update status");
    }
  };

  const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
    const result = await toggleProductFeatured(id, !currentFeatured);
    if (result.success) {
      toast.success(`Product ${!currentFeatured ? "featured" : "unfeatured"}`);
      startTransition(() => {
        loadProducts();
      });
    } else {
      toast.error(result.error || "Failed to update");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteProduct(deleteId);
    if (result.success) {
      toast.success("Product deleted");
      startTransition(() => {
        loadProducts();
      });
    } else {
      toast.error(result.error || "Failed to delete");
    }
    setDeleting(false);
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500">
            Manage your product catalog ({total} products)
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r 
            from-amber-500 to-amber-600 text-white font-semibold rounded-xl 
            hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/30"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl 
                  focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white
                focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="featured">Featured</option>
              <option value="lowstock">Low Stock</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white
                focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products found"
            description="Try adjusting your search or filters, or add a new product."
            action={{ label: "Add Product", href: "/admin/products/new" }}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Discount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                            {product.image ? (
                              <Image
                                src={product.image}
                                alt={product.name}
                                width={48}
                                height={48}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link
                              href={`/admin/products/${product.id}`}
                              className="font-medium text-gray-900 hover:text-amber-600 transition-colors"
                            >
                              {product.name}
                            </Link>
                            <div className="flex items-center gap-2 mt-0.5">
                              {product.isFeatured && (
                                <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                                  <Star className="w-3 h-3 fill-current" />
                                  Featured
                                </span>
                              )}
                              {product.variantCount > 1 && (
                                <span className="text-xs text-gray-500">
                                  {product.variantCount} variants
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600 font-mono">
                          {product.sku}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600">
                          {product.categoryName || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(product.price)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {product.discount && product.discount > 0 ? (
                          <div className="flex flex-col">
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full w-fit">
                              -{product.discount}%
                            </span>
                            {product.originalPrice && (
                              <span className="text-xs text-gray-400 line-through mt-0.5">
                                {formatCurrency(product.originalPrice)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-medium ${
                              product.isLowStock
                                ? "text-red-600"
                                : "text-gray-900"
                            }`}
                          >
                            {product.stock}
                          </span>
                          {product.isLowStock && (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleToggleStatus(product.id, product.isActive)
                            }
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs 
                              font-medium rounded-full transition-colors ${
                                product.isActive
                                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                          >
                            {product.isActive ? (
                              <>
                                <Eye className="w-3 h-3" />
                                Active
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3" />
                                Inactive
                              </>
                            )}
                          </button>
                          <button
                            onClick={() =>
                              handleToggleFeatured(
                                product.id,
                                product.isFeatured
                              )
                            }
                            className={`p-1.5 rounded-lg transition-colors ${
                              product.isFeatured
                                ? "text-amber-500 bg-amber-50"
                                : "text-gray-400 hover:text-amber-500 hover:bg-amber-50"
                            }`}
                            title={
                              product.isFeatured
                                ? "Remove from featured"
                                : "Add to featured"
                            }
                          >
                            <Star
                              className={`w-4 h-4 ${
                                product.isFeatured ? "fill-current" : ""
                              }`}
                            />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="p-2 text-gray-400 hover:text-amber-600 
                              hover:bg-amber-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteId(product.id)}
                            className="p-2 text-gray-400 hover:text-red-600 
                              hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  );
}
