// app/admin/newsletter/page.tsx
"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Mail,
  Users,
  TrendingUp,
  TrendingDown,
  Download,
  Search,
  RefreshCw,
  Loader2,
  UserPlus,
  UserMinus,
  MoreVertical,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import {
  getNewsletterSubscribers,
  getSubscriberStats,
  exportSubscribers,
  updateSubscriberStatus,
  deleteSubscriber,
} from "@/app/action/admin/newsletter.actions";
import toast from "react-hot-toast";

// Types
interface Subscriber {
  id: string;
  email: string;
  status: "ACTIVE" | "UNSUBSCRIBED" | "BOUNCED";
  source?: string;
  subscribedAt: string;
  unsubscribedAt?: string;
  emailsSent: number;
  emailsOpened: number;
}

interface Stats {
  total: number;
  active: number;
  unsubscribed: number;
  thisMonth: number;
  lastMonth: number;
  growthRate: number;
}

type StatusFilter = "ALL" | "ACTIVE" | "UNSUBSCRIBED" | "BOUNCED";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-PK", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusColor(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-700";
    case "UNSUBSCRIBED":
      return "bg-gray-100 text-gray-600";
    case "BOUNCED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "ACTIVE":
      return <CheckCircle className="w-3.5 h-3.5" />;
    case "UNSUBSCRIBED":
      return <XCircle className="w-3.5 h-3.5" />;
    case "BOUNCED":
      return <AlertTriangle className="w-3.5 h-3.5" />;
    default:
      return null;
  }
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const [isPending, startTransition] = useTransition();

  // Load subscribers
  const loadSubscribers = async () => {
    setLoading(true);
    try {
      const [subscribersResult, statsResult] = await Promise.all([
        getNewsletterSubscribers({
          status: statusFilter === "ALL" ? undefined : statusFilter,
          search: searchQuery || undefined,
          page,
          limit: 50,
        }),
        getSubscriberStats(),
      ]);

      if (subscribersResult.success && subscribersResult.data) {
        setSubscribers(subscribersResult.data.subscribers);
        setTotalPages(subscribersResult.data.pages);
        setTotalSubscribers(subscribersResult.data.total);
      }

      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      }
    } catch (error) {
      toast.error("Failed to load subscribers");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startTransition(() => {
      loadSubscribers();
    });
  }, [statusFilter, page]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        loadSubscribers();
      } else {
        setPage(1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportSubscribers();
      if (result.success && result.data) {
        // Create and download CSV file
        const blob = new Blob([result.data], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `newsletter-subscribers-${
          new Date().toISOString().split("T")[0]
        }.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("Subscribers exported successfully");
      } else {
        toast.error(result.error || "Failed to export");
      }
    } catch (error) {
      toast.error("Failed to export subscribers");
      console.log(error);
    } finally {
      setIsExporting(false);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (
    subscriberId: string,
    newStatus: Subscriber["status"]
  ) => {
    try {
      const result = await updateSubscriberStatus(subscriberId, newStatus);
      if (result.success) {
        toast.success(
          `Subscriber ${
            newStatus === "ACTIVE" ? "reactivated" : "status updated"
          }`
        );
        loadSubscribers();
      } else {
        toast.error(result.error || "Failed to update status");
      }
    } catch (error) {
      toast.error("Failed to update status");
      console.log(error);
    }
    setActionMenuOpen(null);
  };

  // Handle delete
  const handleDelete = async (subscriberId: string) => {
    if (!confirm("Are you sure you want to delete this subscriber?")) return;

    try {
      const result = await deleteSubscriber(subscriberId);
      if (result.success) {
        toast.success("Subscriber deleted");
        loadSubscribers();
      } else {
        toast.error(result.error || "Failed to delete");
      }
    } catch (error) {
      toast.error("Failed to delete subscriber");
      console.log(error);
    }
    setActionMenuOpen(null);
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedSubscribers.length === subscribers.length) {
      setSelectedSubscribers([]);
    } else {
      setSelectedSubscribers(subscribers.map((s) => s.id));
    }
  };

  // Toggle single selection
  const toggleSelect = (subscriberId: string) => {
    setSelectedSubscribers((prev) =>
      prev.includes(subscriberId)
        ? prev.filter((id) => id !== subscriberId)
        : [...prev, subscriberId]
    );
  };

  // Status tabs
  const statusTabs: { value: StatusFilter; label: string }[] = [
    { value: "ALL", label: "All" },
    { value: "ACTIVE", label: "Active" },
    { value: "UNSUBSCRIBED", label: "Unsubscribed" },
    { value: "BOUNCED", label: "Bounced" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="w-7 h-7 text-amber-500" />
            Newsletter Subscribers
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your newsletter subscribers and track growth
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-medium
              rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Export CSV
          </button>
          <button
            onClick={() => loadSubscribers()}
            disabled={loading || isPending}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-amber-600 
              hover:bg-amber-50 rounded-lg transition-colors"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                loading || isPending ? "animate-spin" : ""
              }`}
            />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Subscribers</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.total.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-xl">
                <Users className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-green-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Active</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.active.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-amber-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">This Month</p>
                <p className="text-3xl font-bold text-amber-600">
                  +{stats.thisMonth}
                </p>
              </div>
              <div className="p-3 bg-amber-100 rounded-xl">
                <UserPlus className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Growth Rate</p>
                <div className="flex items-center gap-2">
                  <p
                    className={`text-3xl font-bold ${
                      stats.growthRate >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {stats.growthRate >= 0 ? "+" : ""}
                    {stats.growthRate}%
                  </p>
                </div>
              </div>
              <div
                className={`p-3 rounded-xl ${
                  stats.growthRate >= 0 ? "bg-green-100" : "bg-red-100"
                }`}
              >
                {stats.growthRate >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-green-600" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-red-600" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by email..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg
                focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setStatusFilter(tab.value);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors
                  ${
                    statusFilter === tab.value
                      ? "bg-amber-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedSubscribers.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {selectedSubscribers.length} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  // Bulk delete
                  if (
                    confirm(`Delete ${selectedSubscribers.length} subscribers?`)
                  ) {
                    // Implementation
                  }
                }}
                className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
              >
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedSubscribers([])}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Subscribers List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : subscribers.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No subscribers found
            </h3>
            <p className="text-gray-500">
              {searchQuery
                ? "Try a different search term"
                : "Subscribers will appear here when they sign up"}
            </p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-600">
              <div className="col-span-1 flex items-center">
                <input
                  type="checkbox"
                  checked={selectedSubscribers.length === subscribers.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                />
              </div>
              <div className="col-span-5">Email</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Source</div>
              <div className="col-span-1">Date</div>
              <div className="col-span-1">Actions</div>
            </div>

            {/* Subscribers */}
            <div className="divide-y divide-gray-100">
              {subscribers.map((subscriber) => (
                <div
                  key={subscriber.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Checkbox */}
                  <div className="hidden md:flex col-span-1 items-center">
                    <input
                      type="checkbox"
                      checked={selectedSubscribers.includes(subscriber.id)}
                      onChange={() => toggleSelect(subscriber.id)}
                      className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                    />
                  </div>

                  {/* Email */}
                  <div className="col-span-1 md:col-span-5 flex items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-amber-600" />
                      </div>
                      <span className="font-medium text-gray-900 truncate">
                        {subscriber.email}
                      </span>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-1 md:col-span-2 flex items-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        subscriber.status
                      )}`}
                    >
                      {getStatusIcon(subscriber.status)}
                      {subscriber.status}
                    </span>
                  </div>

                  {/* Source */}
                  <div className="col-span-1 md:col-span-2 flex items-center">
                    <span className="text-sm text-gray-500 capitalize">
                      {subscriber.source || "Website"}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="col-span-1 md:col-span-1 flex items-center">
                    <span className="text-sm text-gray-500">
                      {formatDate(subscriber.subscribedAt)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 md:col-span-1 flex items-center justify-end">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActionMenuOpen(
                            actionMenuOpen === subscriber.id
                              ? null
                              : subscriber.id
                          )
                        }
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {actionMenuOpen === subscriber.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setActionMenuOpen(null)}
                          />
                          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-20 min-w-[160px]">
                            {subscriber.status !== "ACTIVE" && (
                              <button
                                onClick={() =>
                                  handleStatusUpdate(subscriber.id, "ACTIVE")
                                }
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Reactivate
                              </button>
                            )}
                            {subscriber.status === "ACTIVE" && (
                              <button
                                onClick={() =>
                                  handleStatusUpdate(
                                    subscriber.id,
                                    "UNSUBSCRIBED"
                                  )
                                }
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <UserMinus className="w-4 h-4" />
                                Unsubscribe
                              </button>
                            )}
                            <hr className="my-2 border-gray-100" />
                            <button
                              onClick={() => handleDelete(subscriber.id)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing {subscribers.length} of {totalSubscribers} subscribers
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium
                      hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium
                      hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
