"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  Mail,
  Smartphone,
  Package,
  Tag,
  Newspaper,
  Loader2,
  Shield,
  Trash2,
  Download,
  Monitor,
  LogOut,
  AlertTriangle,
} from "lucide-react";

import type { NotificationPreferences } from "@/types/account";
import toast from "react-hot-toast";
import { signOut } from "next-auth/react";
import {
  exportUserData,
  getActiveSessions,
  getNotificationPreferences,
  revokeSession,
  updateNotificationPreferences,
} from "@/app/action/settings.action";
import { deleteAccount } from "@/app/action/profile.action";

export default function SettingsPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    smsNotifications: true,
    orderUpdates: true,
    promotionalEmails: false,
    newsletter: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sessions, setSessions] = useState<
    { id: string; createdAt: Date; expiresAt: Date }[]
  >([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchSettings = async () => {
      if (!isMounted) return;

      setIsLoading(true);

      const [prefsResult, sessionsResult] = await Promise.all([
        getNotificationPreferences(),
        getActiveSessions(),
      ]);

      if (isMounted) {
        if (prefsResult.success && prefsResult.data) {
          setPreferences(prefsResult.data);
        }
        if (sessionsResult.success && sessionsResult.data) {
          setSessions(sessionsResult.data);
        }
        setIsLoading(false);
      }
    };

    fetchSettings();

    return () => {
      isMounted = false; // prevent state updates after unmount
    };
  }, []);

  const handleToggle = async (key: keyof NotificationPreferences) => {
    const newValue = !preferences[key];
    setPreferences((prev) => ({ ...prev, [key]: newValue }));

    setIsSaving(true);
    const result = await updateNotificationPreferences({ [key]: newValue });
    if (!result.success) {
      // Revert on error
      setPreferences((prev) => ({ ...prev, [key]: !newValue }));
      toast.error(result.error || "Failed to update settings");
    }
    setIsSaving(false);
  };

  const handleRevokeSession = async (sessionId: string) => {
    const result = await revokeSession(sessionId);
    if (result.success) {
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast.success("Session revoked");
    } else {
      toast.error(result.error || "Failed to revoke session");
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    const result = await exportUserData();
    if (result.success && result.data) {
      // Download as JSON
      const dataStr = JSON.stringify(result.data, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "my-data.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Data exported successfully");
    } else {
      toast.error(result.error || "Failed to export data");
    }
    setIsExporting(false);
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    const result = await deleteAccount(deletePassword);
    if (result.success) {
      toast.success("Account deleted");
      await signOut({ callbackUrl: "/home" });
    } else {
      toast.error(result.error || "Failed to delete account");
    }
    setIsDeleting(false);
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
      <div>
        <h1 className="text-2xl font-bold text-stone-800">Settings</h1>
        <p className="text-stone-600 mt-1">Manage your account preferences</p>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden">
        <div className="p-4 border-b border-stone-200 flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#DDA200]" />
          <h2 className="font-bold text-stone-800">Notifications</h2>
          {isSaving && (
            <Loader2 className="w-4 h-4 animate-spin text-[#DDA200] ml-auto" />
          )}
        </div>
        <div className="divide-y divide-stone-100">
          {/* Email Notifications */}
          <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-stone-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-stone-800">
                  Email Notifications
                </p>
                <p className="text-sm text-stone-500">
                  Receive updates via email
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.emailNotifications}
              onChange={() => handleToggle("emailNotifications")}
              className="w-5 h-5 rounded text-[#DDA200] focus:ring-[#DDA200]"
            />
          </label>

          {/* SMS Notifications */}
          <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-stone-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Smartphone className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-stone-800">SMS Notifications</p>
                <p className="text-sm text-stone-500">
                  Receive updates via SMS
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.smsNotifications}
              onChange={() => handleToggle("smsNotifications")}
              className="w-5 h-5 rounded text-[#DDA200] focus:ring-[#DDA200]"
            />
          </label>

          {/* Order Updates */}
          <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-stone-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-stone-800">Order Updates</p>
                <p className="text-sm text-stone-500">
                  Get notified about order status changes
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.orderUpdates}
              onChange={() => handleToggle("orderUpdates")}
              className="w-5 h-5 rounded text-[#DDA200] focus:ring-[#DDA200]"
            />
          </label>

          {/* Promotional Emails */}
          <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-stone-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Tag className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-medium text-stone-800">Promotional Emails</p>
                <p className="text-sm text-stone-500">
                  Receive offers and discounts
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.promotionalEmails}
              onChange={() => handleToggle("promotionalEmails")}
              className="w-5 h-5 rounded text-[#DDA200] focus:ring-[#DDA200]"
            />
          </label>

          {/* Newsletter */}
          <label className="flex items-center justify-between p-4 cursor-pointer hover:bg-stone-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <Newspaper className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="font-medium text-stone-800">Newsletter</p>
                <p className="text-sm text-stone-500">
                  Get our weekly newsletter
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.newsletter}
              onChange={() => handleToggle("newsletter")}
              className="w-5 h-5 rounded text-[#DDA200] focus:ring-[#DDA200]"
            />
          </label>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden">
        <div className="p-4 border-b border-stone-200 flex items-center gap-2">
          <Monitor className="w-5 h-5 text-[#DDA200]" />
          <h2 className="font-bold text-stone-800">Active Sessions</h2>
        </div>
        <div className="p-4 space-y-3">
          {sessions.length === 0 ? (
            <p className="text-stone-500 text-center py-4">
              No active sessions
            </p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-3 bg-stone-50 rounded-xl"
              >
                <div>
                  <p className="font-medium text-stone-800">Active Session</p>
                  <p className="text-sm text-stone-500">
                    Expires: {new Date(session.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleRevokeSession(session.id)}
                  className="flex items-center gap-1 text-sm text-red-600 
                    hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Revoke
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Privacy & Data */}
      <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden">
        <div className="p-4 border-b border-stone-200 flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#DDA200]" />
          <h2 className="font-bold text-stone-800">Privacy & Data</h2>
        </div>
        <div className="p-4 space-y-4">
          {/* Export Data */}
          <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Download className="w-5 h-5 text-stone-600" />
              <div>
                <p className="font-medium text-stone-800">Export My Data</p>
                <p className="text-sm text-stone-500">
                  Download a copy of your data
                </p>
              </div>
            </div>
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="px-4 py-2 border-2 border-stone-200 text-stone-600 
                font-semibold rounded-lg hover:bg-stone-100 transition-colors
                disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Export"
              )}
            </button>
          </div>

          {/* Delete Account */}
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800">Delete Account</p>
                <p className="text-sm text-red-600">
                  Permanently delete your account and data
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-600 text-white font-semibold 
                rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-800">
                Delete Account
              </h3>
            </div>
            <p className="text-stone-600 mb-4">
              This action cannot be undone. All your data including orders,
              addresses, and preferences will be permanently deleted.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Enter your password to confirm
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl 
                  focus:border-red-500 focus:outline-none"
                placeholder="Your password"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword("");
                }}
                className="flex-1 px-4 py-3 border-2 border-stone-200 text-stone-600 
                  font-semibold rounded-xl hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={!deletePassword || isDeleting}
                className="flex-1 px-4 py-3 bg-red-600 text-white font-semibold 
                  rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  "Delete Account"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
