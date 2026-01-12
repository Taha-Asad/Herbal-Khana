// app/account/profile/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  User,
  Mail,
  Phone,
  Camera,
  Check,
  X,
  Loader2,
  Shield,
  Calendar,
  Edit3,
  Save,
} from "lucide-react";

import type {
  UserProfile,
  UpdateProfileInput,
  ChangePasswordInput,
} from "@/types/account";
import toast from "react-hot-toast";
import {
  changePassword,
  getProfile,
  requestEmailVerification,
  updateProfile,
} from "@/app/action/home/profile.action";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState<UpdateProfileInput>({
    name: "",
    phone: "",
  });

  // Password form state
  const [passwordData, setPasswordData] = useState<ChangePasswordInput>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      if (!isMounted) return;

      setIsLoading(true);

      const result = await getProfile();

      if (isMounted) {
        if (result.success && result.data) {
          setProfile(result.data);
          setFormData({
            name: result.data.name || "",
            phone: result.data.phone || "",
          });
        } else {
          toast.error(result.error || "Failed to load profile");
        }
        setIsLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false; // prevent state updates after unmount
    };
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    const result = await updateProfile(formData);
    if (result.success && result.data) {
      setProfile(result.data);
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } else {
      toast.error(result.error || "Failed to update profile");
    }
    setIsSaving(false);
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    setIsChangingPassword(true);
    const result = await changePassword(passwordData);
    if (result.success) {
      toast.success("Password changed successfully");
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } else {
      toast.error(result.error || "Failed to change password");
    }
    setIsChangingPassword(false);
  };

  const handleRequestVerification = async () => {
    const result = await requestEmailVerification();
    if (result.success) {
      toast.success("Verification email sent");
    } else {
      toast.error(result.error || "Failed to send verification email");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#DDA200]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-600">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">My Profile</h1>
          <p className="text-stone-600 mt-1">
            Manage your personal information
          </p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#DDA200] text-white 
              font-semibold rounded-xl hover:bg-[#b38600] transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  name: profile.name || "",
                  phone: profile.phone || "",
                });
              }}
              className="flex items-center gap-2 px-4 py-2 border-2 border-stone-200 
                text-stone-600 font-semibold rounded-xl hover:bg-stone-50 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-[#DDA200] text-white 
                font-semibold rounded-xl hover:bg-[#b38600] transition-colors
                disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden">
        {/* Avatar Section */}
        <div className="p-6 bg-gradient-to-r from-[#FFF9E6] to-[#F7E4B2] border-b border-stone-200">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-[#DDA200] flex items-center justify-center border-4 border-white shadow-lg">
                {profile.image ? (
                  <Image
                    src={profile.image}
                    alt={profile.name || "User"}
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-3xl font-bold text-white">
                    {getInitials(profile.name || "U")}
                  </span>
                )}
              </div>
              <button
                className="absolute bottom-0 right-0 p-2 bg-white rounded-full 
                  shadow-md border border-stone-200 hover:bg-stone-50 transition-colors"
              >
                <Camera className="w-4 h-4 text-stone-600" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-800">
                {profile.name}
              </h2>
              <p className="text-stone-600">{profile.email}</p>
              <div className="flex items-center gap-2 mt-2">
                {profile.emailVerified ? (
                  <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    <Check className="w-3 h-3" />
                    Verified
                  </span>
                ) : (
                  <button
                    onClick={handleRequestVerification}
                    className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full hover:bg-amber-200 transition-colors"
                  >
                    Verify Email
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl 
                  focus:border-[#DDA200] focus:outline-none transition-colors"
                placeholder="Enter your name"
              />
            ) : (
              <div className="flex items-center gap-3 px-4 py-3 bg-stone-50 rounded-xl">
                <User className="w-5 h-5 text-stone-400" />
                <span className="text-stone-800">{profile.name || "—"}</span>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Email Address
            </label>
            <div className="flex items-center gap-3 px-4 py-3 bg-stone-50 rounded-xl">
              <Mail className="w-5 h-5 text-stone-400" />
              <span className="text-stone-800">{profile.email}</span>
              {profile.emailVerified && (
                <Check className="w-4 h-4 text-green-500 ml-auto" />
              )}
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl 
                  focus:border-[#DDA200] focus:outline-none transition-colors"
                placeholder="Enter your phone number"
              />
            ) : (
              <div className="flex items-center gap-3 px-4 py-3 bg-stone-50 rounded-xl">
                <Phone className="w-5 h-5 text-stone-400" />
                <span className="text-stone-800">{profile.phone || "—"}</span>
              </div>
            )}
          </div>

          {/* Member Since */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">
              Member Since
            </label>
            <div className="flex items-center gap-3 px-4 py-3 bg-stone-50 rounded-xl">
              <Calendar className="w-5 h-5 text-stone-400" />
              <span className="text-stone-800">
                {new Date(profile.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-2xl border-2 border-stone-200 p-6">
        <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#DDA200]" />
          Security
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
            <div>
              <h4 className="font-medium text-stone-800">Password</h4>
              <p className="text-sm text-stone-600">
                Change your account password
              </p>
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-2 border-2 border-[#DDA200] text-[#DDA200] 
                font-semibold rounded-lg hover:bg-[#DDA200] hover:text-white transition-colors"
            >
              Change
            </button>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-stone-800 mb-4">
              Change Password
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl 
                    focus:border-[#DDA200] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl 
                    focus:border-[#DDA200] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl 
                    focus:border-[#DDA200] focus:outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-3 border-2 border-stone-200 text-stone-600 
                  font-semibold rounded-xl hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                disabled={isChangingPassword}
                className="flex-1 px-4 py-3 bg-[#DDA200] text-white font-semibold 
                  rounded-xl hover:bg-[#b38600] transition-colors disabled:opacity-50"
              >
                {isChangingPassword ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Change Password"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
