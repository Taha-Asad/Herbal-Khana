"use client";

import React, { useEffect, useState } from "react";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Star,
  Loader2,
  X,
  Phone,
  Home,
  Building,
} from "lucide-react";

import type { Address, AddressInput } from "@/types/account";
import toast from "react-hot-toast";
import {
  createAddress,
  deleteAddress,
  getAddresses,
  setDefaultAddress,
  updateAddress,
} from "@/app/action/home/addresses.action";

const initialFormData: AddressInput = {
  label: "",
  name: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  postal: "",
  country: "Pakistan",
  isDefault: false,
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<AddressInput>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const loadAddresses = async () => {
      setIsLoading(true);
      const result = await getAddresses();
      if (result.success && result.data) {
        setAddresses(result.data);
      } else {
        toast.error(result.error || "Failed to load addresses");
      }
      setIsLoading(false);
    };

    loadAddresses();
  }, []); // empty dependency array = run once on mount

  const handleOpenModal = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        label: address.label || "",
        name: address.name,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2 || "",
        city: address.city,
        state: address.state || "",
        postal: address.postal,
        country: address.country,
        isDefault: address.isDefault,
      });
    } else {
      setEditingAddress(null);
      setFormData(initialFormData);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAddress(null);
    setFormData(initialFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    let result;
    if (editingAddress) {
      result = await updateAddress(editingAddress.id, formData);
    } else {
      result = await createAddress(formData);
    }

    if (result.success) {
      toast.success(editingAddress ? "Address updated" : "Address added");
      handleCloseModal();
    } else {
      toast.error(result.error || "Failed to save address");
    }
    setIsSaving(false);
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    setDeletingId(addressId);
    const result = await deleteAddress(addressId);
    if (result.success) {
      setAddresses((prev) => prev.filter((a) => a.id !== addressId));
      toast.success("Address deleted");
    } else {
      toast.error(result.error || "Failed to delete address");
    }
    setDeletingId(null);
  };

  const handleSetDefault = async (addressId: string) => {
    const result = await setDefaultAddress(addressId);
    if (result.success) {
      setAddresses((prev) =>
        prev.map((a) => ({
          ...a,
          isDefault: a.id === addressId,
        }))
      );
      toast.success("Default address updated");
    } else {
      toast.error(result.error || "Failed to update default address");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#DDA200]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">My Addresses</h1>
          <p className="text-stone-600 mt-1">Manage your delivery addresses</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-[#DDA200] text-white 
            font-semibold rounded-xl hover:bg-[#b38600] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Address
        </button>
      </div>

      {/* Addresses Grid */}
      {addresses.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-stone-200 p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 bg-[#FFF9E6] rounded-full flex items-center justify-center">
            <MapPin className="w-10 h-10 text-[#DDA200]" />
          </div>
          <h3 className="text-lg font-semibold text-stone-800">
            No addresses saved
          </h3>
          <p className="text-stone-600 mt-2">
            Add an address for faster checkout
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 mt-6 px-6 py-3 
              bg-[#DDA200] text-white font-semibold rounded-xl 
              hover:bg-[#b38600] transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`bg-white rounded-2xl border-2 p-5 relative
                ${
                  address.isDefault
                    ? "border-[#DDA200] ring-2 ring-[#DDA200]/20"
                    : "border-stone-200"
                }`}
            >
              {/* Default Badge */}
              {address.isDefault && (
                <div className="absolute -top-3 left-4 px-3 py-1 bg-[#DDA200] text-white text-xs font-semibold rounded-full">
                  Default
                </div>
              )}

              {/* Label */}
              <div className="flex items-center gap-2 mb-3">
                {address.label?.toLowerCase().includes("home") ? (
                  <Home className="w-5 h-5 text-[#DDA200]" />
                ) : address.label?.toLowerCase().includes("work") ||
                  address.label?.toLowerCase().includes("office") ? (
                  <Building className="w-5 h-5 text-[#DDA200]" />
                ) : (
                  <MapPin className="w-5 h-5 text-[#DDA200]" />
                )}
                <span className="font-semibold text-stone-800">
                  {address.label || "Address"}
                </span>
              </div>

              {/* Address Details */}
              <div className="space-y-1 text-stone-600">
                <p className="font-medium text-stone-800">{address.name}</p>
                <p>{address.line1}</p>
                {address.line2 && <p>{address.line2}</p>}
                <p>
                  {address.city}
                  {address.state && `, ${address.state}`} {address.postal}
                </p>
                <p>{address.country}</p>
                <p className="flex items-center gap-1 pt-2">
                  <Phone className="w-4 h-4" />
                  {address.phone}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-stone-100">
                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="flex items-center gap-1 text-sm text-[#DDA200] 
                      hover:bg-[#DDA200]/10 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Star className="w-4 h-4" />
                    Set Default
                  </button>
                )}
                <button
                  onClick={() => handleOpenModal(address)}
                  className="flex items-center gap-1 text-sm text-stone-600 
                    hover:bg-stone-100 px-3 py-1.5 rounded-lg transition-colors ml-auto"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(address.id)}
                  disabled={deletingId === address.id}
                  className="flex items-center gap-1 text-sm text-red-600 
                    hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {deletingId === address.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white p-4 border-b border-stone-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-stone-800">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Label */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Label (optional)
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                  placeholder="e.g., Home, Office"
                  className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl 
                    focus:border-[#DDA200] focus:outline-none"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl 
                    focus:border-[#DDA200] focus:outline-none"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl 
                    focus:border-[#DDA200] focus:outline-none"
                />
              </div>

              {/* Address Line 1 */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Address Line 1 *
                </label>
                <input
                  type="text"
                  value={formData.line1}
                  onChange={(e) =>
                    setFormData({ ...formData, line1: e.target.value })
                  }
                  required
                  placeholder="Street address, P.O. box"
                  className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl 
                    focus:border-[#DDA200] focus:outline-none"
                />
              </div>

              {/* Address Line 2 */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Address Line 2 (optional)
                </label>
                <input
                  type="text"
                  value={formData.line2}
                  onChange={(e) =>
                    setFormData({ ...formData, line2: e.target.value })
                  }
                  placeholder="Apartment, suite, unit, building, floor"
                  className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl 
                    focus:border-[#DDA200] focus:outline-none"
                />
              </div>

              {/* City & State */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl 
                      focus:border-[#DDA200] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    State/Province
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl 
                      focus:border-[#DDA200] focus:outline-none"
                  />
                </div>
              </div>

              {/* Postal & Country */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    value={formData.postal}
                    onChange={(e) =>
                      setFormData({ ...formData, postal: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl 
                      focus:border-[#DDA200] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl 
                      focus:border-[#DDA200] focus:outline-none"
                  />
                </div>
              </div>

              {/* Set as Default */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) =>
                    setFormData({ ...formData, isDefault: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-stone-300 text-[#DDA200] 
                    focus:ring-[#DDA200]"
                />
                <span className="text-stone-700">Set as default address</span>
              </label>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 border-2 border-stone-200 text-stone-600 
                    font-semibold rounded-xl hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 bg-[#DDA200] text-white font-semibold 
                    rounded-xl hover:bg-[#b38600] transition-colors disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : editingAddress ? (
                    "Update Address"
                  ) : (
                    "Add Address"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
