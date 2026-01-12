// app/admin/shipping/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import {
  Plus,
  Truck,
  MapPin,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  Package,
  DollarSign,
  Clock,
  GripVertical,
  X,
  Save,
} from "lucide-react";
import {
  getShippingZones,
  createShippingZone,
  updateShippingZone,
  deleteShippingZone,
  getShippingStats,
  ShippingZone,
  ShippingZoneFormData,
} from "@/app/action/admin/shipping.actions";
import EmptyState from "@/components/admin/ui/EmptyState";
import ConfirmModal from "@/components/admin/ui/ConfirmModal";
import toast from "react-hot-toast";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Pakistan regions/cities
const PAKISTAN_REGIONS = [
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
  "Abbottabad",
  "Bahawalpur",
  "Sargodha",
  "Sukkur",
  "Punjab",
  "Sindh",
  "KPK",
  "Balochistan",
  "All Pakistan",
];

interface ShippingFormProps {
  initialData?: ShippingZone;
  onSubmit: (data: ShippingZoneFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

function ShippingForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}: ShippingFormProps) {
  const [formData, setFormData] = useState<ShippingZoneFormData>({
    name: initialData?.name || "",
    regions: initialData?.regions || [],
    rate: initialData?.rate || 0,
    freeShippingThreshold: initialData?.freeShippingThreshold || null,
    estimatedDays: initialData?.estimatedDays || "3-5 days",
    isActive: initialData?.isActive ?? true,
    sortOrder: initialData?.sortOrder || 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? parseFloat(value) || 0
          : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleRegionToggle = (region: string) => {
    setFormData((prev) => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter((r) => r !== region)
        : [...prev.regions, region],
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (formData.regions.length === 0)
      newErrors.regions = "Select at least one region";
    if (formData.rate < 0) newErrors.rate = "Rate cannot be negative";

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
        {/* Zone Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Zone Name *
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
            placeholder="e.g., Major Cities"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        {/* Shipping Rate */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shipping Rate (PKR) *
          </label>
          <input
            type="number"
            name="rate"
            value={formData.rate}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-amber-500 
              focus:border-transparent transition-all ${
                errors.rate ? "border-red-500" : "border-gray-200"
              }`}
            min="0"
            step="1"
          />
          {errors.rate && (
            <p className="mt-1 text-sm text-red-500">{errors.rate}</p>
          )}
        </div>

        {/* Free Shipping Threshold */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Free Shipping Threshold (PKR)
          </label>
          <input
            type="number"
            name="freeShippingThreshold"
            value={formData.freeShippingThreshold || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                freeShippingThreshold: e.target.value
                  ? parseFloat(e.target.value)
                  : null,
              }))
            }
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 
              focus:ring-amber-500 focus:border-transparent"
            min="0"
            placeholder="Leave empty for no free shipping"
          />
        </div>

        {/* Estimated Days */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Delivery
          </label>
          <input
            type="text"
            name="estimatedDays"
            value={formData.estimatedDays}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 
              focus:ring-amber-500 focus:border-transparent"
            placeholder="e.g., 3-5 days"
          />
        </div>

        {/* Sort Order */}
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
              focus:ring-amber-500 focus:border-transparent"
            min="0"
          />
        </div>

        {/* Active Toggle */}
        <div className="flex items-center">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
            />
            <span className="font-medium text-gray-700">Active</span>
          </label>
        </div>
      </div>

      {/* Regions Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Regions *
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {PAKISTAN_REGIONS.map((region) => (
            <button
              key={region}
              type="button"
              onClick={() => handleRegionToggle(region)}
              className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                formData.regions.includes(region)
                  ? "bg-amber-500 text-white border-amber-500"
                  : "bg-white text-gray-700 border-gray-200 hover:border-amber-300"
              }`}
            >
              {region}
            </button>
          ))}
        </div>
        {errors.regions && (
          <p className="mt-1 text-sm text-red-500">{errors.regions}</p>
        )}
      </div>

      {/* Actions */}
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

export default function ShippingPage() {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [stats, setStats] = useState({
    totalZones: 0,
    activeZones: 0,
    averageRate: 0,
    freeShippingZones: 0,
  });
  const [showForm, setShowForm] = useState(false);
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const loadZones = useCallback(async () => {
    const result = await getShippingZones();
    if (result.success && result.data) {
      setZones(result.data);
    }
    setIsInitialLoad(false);
  }, []);

  const loadStats = useCallback(async () => {
    const result = await getShippingStats();
    if (result.success && result.data) {
      setStats(result.data);
    }
  }, []);

  useEffect(() => {
    startTransition(() => {
      loadZones();
      loadStats();
    });
  }, [loadZones, loadStats]);

  const loading = isInitialLoad || isPending;

  const handleCreate = async (data: ShippingZoneFormData) => {
    setIsSubmitting(true);
    const result = await createShippingZone(data);
    if (result.success) {
      toast.success("Shipping zone created");
      setShowForm(false);
      startTransition(() => {
        loadZones();
        loadStats();
      });
    } else {
      toast.error(result.error || "Failed to create zone");
    }
    setIsSubmitting(false);
  };

  const handleUpdate = async (data: ShippingZoneFormData) => {
    if (!editingZone) return;
    setIsSubmitting(true);
    const result = await updateShippingZone(editingZone.id, data);
    if (result.success) {
      toast.success("Shipping zone updated");
      setEditingZone(null);
      startTransition(() => {
        loadZones();
        loadStats();
      });
    } else {
      toast.error(result.error || "Failed to update zone");
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteShippingZone(deleteId);
    if (result.success) {
      toast.success("Shipping zone deleted");
      startTransition(() => {
        loadZones();
        loadStats();
      });
    } else {
      toast.error(result.error || "Failed to delete zone");
    }
    setDeleting(false);
    setDeleteId(null);
  };

  const handleToggleStatus = async (zone: ShippingZone) => {
    const result = await updateShippingZone(zone.id, {
      isActive: !zone.isActive,
    });
    if (result.success) {
      toast.success(`Zone ${!zone.isActive ? "activated" : "deactivated"}`);
      startTransition(() => {
        loadZones();
        loadStats();
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
          <h1 className="text-2xl font-bold text-gray-900">Shipping Zones</h1>
          <p className="text-gray-500">Manage shipping rates and regions</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r 
            from-amber-500 to-amber-600 text-white font-semibold rounded-xl 
            hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/30"
        >
          <Plus className="w-5 h-5" />
          Add Zone
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalZones}
              </p>
              <p className="text-sm text-gray-500">Total Zones</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.activeZones}
              </p>
              <p className="text-sm text-gray-500">Active Zones</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.averageRate)}
              </p>
              <p className="text-sm text-gray-500">Avg. Rate</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.freeShippingZones}
              </p>
              <p className="text-sm text-gray-500">Free Shipping</p>
            </div>
          </div>
        </div>
      </div>

      {/* Zones List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : zones.length === 0 ? (
          <EmptyState
            icon={Truck}
            title="No shipping zones yet"
            description="Create your first shipping zone to start managing delivery rates."
            action={{ label: "Add Zone", onClick: () => setShowForm(true) }}
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {zones.map((zone) => (
              <div
                key={zone.id}
                className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="text-gray-400 cursor-move">
                  <GripVertical className="w-5 h-5" />
                </div>

                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Truck className="w-6 h-6 text-amber-600" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900">{zone.name}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {zone.regions.slice(0, 3).map((region) => (
                      <span
                        key={region}
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {region}
                      </span>
                    ))}
                    {zone.regions.length > 3 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{zone.regions.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-center px-4">
                  <p className="font-semibold text-gray-900">
                    {zone.rate === 0 ? "FREE" : formatCurrency(zone.rate)}
                  </p>
                  <p className="text-xs text-gray-500">Rate</p>
                </div>

                <div className="text-center px-4">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{zone.estimatedDays}</span>
                  </div>
                </div>

                {zone.freeShippingThreshold && (
                  <div className="text-center px-4">
                    <p className="text-xs text-green-600 font-medium">
                      Free over {formatCurrency(zone.freeShippingThreshold)}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => handleToggleStatus(zone)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors
                    ${
                      zone.isActive
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  {zone.isActive ? (
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
                    onClick={() => setEditingZone(zone)}
                    className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteId(zone.id)}
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
      {(showForm || editingZone) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              setShowForm(false);
              setEditingZone(null);
            }}
          />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingZone ? "Edit Shipping Zone" : "Create Shipping Zone"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingZone(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ShippingForm
              initialData={editingZone || undefined}
              onSubmit={editingZone ? handleUpdate : handleCreate}
              onCancel={() => {
                setShowForm(false);
                setEditingZone(null);
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
        title="Delete Shipping Zone"
        message="Are you sure you want to delete this shipping zone? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  );
}
