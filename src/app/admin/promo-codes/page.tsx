// app/admin/promo-codes/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import {
  Plus,
  Tag,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Percent,
  DollarSign,
  Truck,
  Copy,
} from "lucide-react";
import {
  getPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  togglePromoStatus,
} from "@/app/action/admin/promo.actions";
import { PromoCode, PromoCodeFormData } from "@/types/admin";
import { PROMO_TYPE } from "@prisma/client";
import EmptyState from "@/components/admin/ui/EmptyState";
import ConfirmModal from "@/components/admin/ui/ConfirmModal";
import { Badge } from "@/components/admin/ui/StatusBadge";
import toast from "react-hot-toast";
import PromoCodeForm from "@/components/admin/forms/PromoCodeForm";

function formatCurrency(amount: number): string {
  return `PKR ${amount.toLocaleString()}`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const typeIcons: Record<PROMO_TYPE, React.ElementType> = {
  PERCENTAGE: Percent,
  FIXED: DollarSign,
  FREE_SHIPPING: Truck,
};

const typeLabels: Record<PROMO_TYPE, string> = {
  PERCENTAGE: "Percentage",
  FIXED: "Fixed Amount",
  FREE_SHIPPING: "Free Shipping",
};

export default function PromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const loadPromoCodes = useCallback(async () => {
    const result = await getPromoCodes();
    if (result.success && result.data) {
      setPromoCodes(result.data);
    }
    setIsInitialLoad(false);
  }, []);

  useEffect(() => {
    startTransition(() => {
      loadPromoCodes();
    });
  }, [loadPromoCodes]);
  const loading = isInitialLoad || (isPending && promoCodes.length === 0);
  const handleCreate = async (data: PromoCodeFormData) => {
    setIsSubmitting(true);
    const result = await createPromoCode(data);
    if (result.success) {
      toast.success("Promo code created");
      setShowForm(false);
      startTransition(() => {
        loadPromoCodes();
      });
    } else {
      toast.error(result.error || "Failed to create promo code");
    }
    setIsSubmitting(false);
  };

  const handleUpdate = async (data: PromoCodeFormData) => {
    if (!editingPromo) return;
    setIsSubmitting(true);
    const result = await updatePromoCode(editingPromo.id, data);
    if (result.success) {
      toast.success("Promo code updated");
      setEditingPromo(null);
      startTransition(() => {
        loadPromoCodes();
      });
    } else {
      toast.error(result.error || "Failed to update promo code");
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deletePromoCode(deleteId);
    if (result.success) {
      toast.success("Promo code deleted");
      startTransition(() => {
        loadPromoCodes();
      });
    } else {
      toast.error(result.error || "Failed to delete promo code");
    }
    setDeleting(false);
    setDeleteId(null);
  };

  const handleToggleStatus = async (promo: PromoCode) => {
    const result = await togglePromoStatus(promo.id, !promo.isActive);
    if (result.success) {
      toast.success(
        `Promo code ${!promo.isActive ? "activated" : "deactivated"}`
      );
      startTransition(() => {
        loadPromoCodes();
      });
    } else {
      toast.error(result.error || "Failed to update status");
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied!");
  };

  const isExpired = (promo: PromoCode) => {
    if (!promo.expiresAt) return false;
    return new Date(promo.expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promo Codes</h1>
          <p className="text-gray-500">Manage discount codes and promotions</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r 
            from-amber-500 to-amber-600 text-white font-semibold rounded-xl 
            hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/30"
        >
          <Plus className="w-5 h-5" />
          Create Promo Code
        </button>
      </div>

      {/* Promo Codes List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : promoCodes.length === 0 ? (
          <EmptyState
            icon={Tag}
            title="No promo codes yet"
            description="Create your first promo code to offer discounts."
            action={{
              label: "Create Promo Code",
              onClick: () => setShowForm(true),
            }}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Value
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Usage
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Expires
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {promoCodes.map((promo) => {
                  const TypeIcon = typeIcons[promo.type];
                  const expired = isExpired(promo);

                  return (
                    <tr
                      key={promo.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono font-medium">
                            {promo.code}
                          </code>
                          <button
                            onClick={() => copyCode(promo.code)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                        {promo.description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {promo.description}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="flex items-center gap-1.5 text-gray-600">
                          <TypeIcon className="w-4 h-4" />
                          {typeLabels[promo.type]}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-medium text-gray-900">
                          {promo.type === "PERCENTAGE"
                            ? `${promo.value}%`
                            : promo.type === "FIXED"
                            ? formatCurrency(promo.value)
                            : "Free"}
                        </span>
                        {promo.maxDiscount && promo.type === "PERCENTAGE" && (
                          <p className="text-xs text-gray-500">
                            Max: {formatCurrency(promo.maxDiscount)}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-gray-600">
                          {promo.usedCount}
                          {promo.maxUses ? ` / ${promo.maxUses}` : ""}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(promo)}
                            className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors
                              ${
                                promo.isActive && !expired
                                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                          >
                            {promo.isActive && !expired ? (
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" /> Active
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <EyeOff className="w-3 h-3" /> Inactive
                              </span>
                            )}
                          </button>
                          {expired && <Badge label="Expired" variant="error" />}
                          {promo.isFirstOrderOnly && (
                            <Badge label="First Order" variant="info" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {promo.expiresAt ? (
                          <span
                            className={`text-sm ${
                              expired ? "text-red-600" : "text-gray-600"
                            }`}
                          >
                            {formatDate(promo.expiresAt)}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">Never</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingPromo(promo)}
                            className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(promo.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showForm || editingPromo) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setShowForm(false);
              setEditingPromo(null);
            }}
          />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editingPromo ? "Edit Promo Code" : "Create Promo Code"}
            </h2>
            <PromoCodeForm
              initialData={editingPromo || undefined}
              onSubmit={editingPromo ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditingPromo(null);
              }}
              isLoading={isSubmitting}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Promo Code"
        message="Are you sure you want to delete this promo code? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  );
}
