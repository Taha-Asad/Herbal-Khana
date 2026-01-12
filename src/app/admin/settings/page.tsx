"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Truck,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Save,
  GripVertical,
} from "lucide-react";
import {
  getShippingMethods,
  createShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
  getStoreSettings,
  updateStoreSettings,
} from "@/app/action/admin/settings.actions";
import { ShippingMethod, ShippingMethodFormData } from "@/types/admin";
import ConfirmModal from "@/components/admin/ui/ConfirmModal";
import ShippingMethodForm from "@/components/admin/forms/ShippingMethodForm";
import toast from "react-hot-toast";

function formatCurrency(amount: number): string {
  return `PKR ${amount.toLocaleString()}`;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "shipping">("general");

  /* ---------------- General settings ---------------- */
  const [storeSettings, setStoreSettings] = useState({
    storeName: "",
    storeEmail: "",
    storePhone: "",
    storeAddress: "",
    currency: "PKR",
    lowStockThreshold: 5,
  });

  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  /* ---------------- Shipping ---------------- */
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [loadingShipping, setLoadingShipping] = useState(true);

  const [showShippingForm, setShowShippingForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(
    null
  );
  const [deleteMethodId, setDeleteMethodId] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  /* ---------------- Load store settings ---------------- */
  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      setLoadingSettings(true);
      const result = await getStoreSettings();
      if (mounted && result.success && result.data) {
        setStoreSettings(result.data);
      }
      if (mounted) setLoadingSettings(false);
    };

    loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  /* ---------------- Load shipping methods (NO WARNING) ---------------- */
  useEffect(() => {
    let mounted = true;

    const loadShipping = async () => {
      setLoadingShipping(true);
      const result = await getShippingMethods();

      if (!mounted) return;

      if (result.success && result.data) {
        setShippingMethods(result.data);
      }
      setLoadingShipping(false);
    };

    loadShipping();

    return () => {
      mounted = false;
    };
  }, []);

  /* ---------------- Manual reload (used by CRUD) ---------------- */
  const reloadShippingMethods = async () => {
    setLoadingShipping(true);
    const result = await getShippingMethods();
    if (result.success && result.data) {
      setShippingMethods(result.data);
    }
    setLoadingShipping(false);
  };

  /* ---------------- Save settings ---------------- */
  const handleSaveSettings = async () => {
    setSavingSettings(true);
    const result = await updateStoreSettings(storeSettings);

    if (result.success) {
      toast.success("Settings saved");
    } else {
      toast.error(result.error || "Failed to save settings");
    }

    setSavingSettings(false);
  };

  /* ---------------- Shipping CRUD ---------------- */
  const handleCreateShipping = async (data: ShippingMethodFormData) => {
    setIsSubmitting(true);
    const result = await createShippingMethod(data);

    if (result.success) {
      toast.success("Shipping method created");
      setShowShippingForm(false);
      reloadShippingMethods();
    } else {
      toast.error(result.error || "Failed to create shipping method");
    }

    setIsSubmitting(false);
  };

  const handleUpdateShipping = async (data: ShippingMethodFormData) => {
    if (!editingMethod) return;

    setIsSubmitting(true);
    const result = await updateShippingMethod(editingMethod.id, data);

    if (result.success) {
      toast.success("Shipping method updated");
      setEditingMethod(null);
      reloadShippingMethods();
    } else {
      toast.error(result.error || "Failed to update shipping method");
    }

    setIsSubmitting(false);
  };

  const handleDeleteShipping = async () => {
    if (!deleteMethodId) return;

    setDeleting(true);
    const result = await deleteShippingMethod(deleteMethodId);

    if (result.success) {
      toast.success("Shipping method deleted");
      reloadShippingMethods();
    } else {
      toast.error(result.error || "Failed to delete shipping method");
    }

    setDeleting(false);
    setDeleteMethodId(null);
  };

  const handleToggleShippingStatus = async (method: ShippingMethod) => {
    const result = await updateShippingMethod(method.id, {
      isActive: !method.isActive,
    });

    if (result.success) {
      toast.success(
        `Shipping method ${method.isActive ? "deactivated" : "activated"}`
      );
      reloadShippingMethods();
    } else {
      toast.error(result.error || "Failed to update status");
    }
  };

  /* ---------------- Render ---------------- */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage your store settings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(["general", "shipping"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium relative ${
              activeTab === tab
                ? "text-amber-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span className="flex items-center gap-2">
              {tab === "general" ? (
                <Settings className="w-4 h-4" />
              ) : (
                <Truck className="w-4 h-4" />
              )}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </span>
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
            )}
          </button>
        ))}
      </div>

      {/* ---------------- General Tab ---------------- */}
      {activeTab === "general" && (
        <div className="bg-white rounded-xl border p-6">
          {loadingSettings ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
            </div>
          ) : (
            <div className="space-y-6 max-w-2xl">
              {(
                [
                  ["Store Name", "storeName"],
                  ["Store Email", "storeEmail"],
                  ["Store Phone", "storePhone"],
                ] as const
              ).map(([label, key]) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-2">
                    {label}
                  </label>
                  <input
                    value={storeSettings[key]}
                    onChange={(e) =>
                      setStoreSettings({
                        ...storeSettings,
                        [key]: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border rounded-xl"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Low Stock Threshold
                </label>
                <input
                  type="number"
                  min={1}
                  value={storeSettings.lowStockThreshold}
                  onChange={(e) =>
                    setStoreSettings({
                      ...storeSettings,
                      lowStockThreshold: Number(e.target.value) || 5,
                    })
                  }
                  className="w-32 px-4 py-2.5 border rounded-xl"
                />
              </div>

              <button
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-white rounded-xl"
              >
                {savingSettings ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Changes
              </button>
            </div>
          )}
        </div>
      )}

      {/* ---------------- Shipping Tab ---------------- */}
      {activeTab === "shipping" && (
        <>
          <div className="flex justify-end">
            <button
              onClick={() => setShowShippingForm(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl"
            >
              <Plus className="w-5 h-5" />
              Add Shipping Method
            </button>
          </div>

          <div className="bg-white rounded-xl border overflow-hidden">
            {loadingShipping ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              </div>
            ) : (
              shippingMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center gap-4 p-4 border-t"
                >
                  <GripVertical className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <h3 className="font-medium">{method.name}</h3>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(method.price)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleShippingStatus(method)}
                    className={`px-3 py-1.5 rounded-full text-xs ${
                      method.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {method.isActive ? "Active" : "Inactive"}
                  </button>
                  <button onClick={() => setEditingMethod(method)}>
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteMethodId(method.id)}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Modals */}
      {(showShippingForm || editingMethod) && (
        <ShippingMethodForm
          initialData={editingMethod || undefined}
          onSubmit={editingMethod ? handleUpdateShipping : handleCreateShipping}
          onCancel={() => {
            setShowShippingForm(false);
            setEditingMethod(null);
          }}
          isLoading={isSubmitting}
        />
      )}

      <ConfirmModal
        isOpen={!!deleteMethodId}
        onClose={() => setDeleteMethodId(null)}
        onConfirm={handleDeleteShipping}
        title="Delete Shipping Method"
        message="Are you sure?"
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  );
}
