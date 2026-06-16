// app/admin/users/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import Image from "next/image";
import {
  Search,
  Users,
  User,
  Ban,
  CheckCircle,
  Loader2,
  Filter,
  ShoppingCart,
} from "lucide-react";
import {
  getUsers,
  banUser,
  unbanUser,
  getUserStats,
} from "@/app/action/admin/users.actions";
import { UserListItem } from "@/types/admin";
import { Badge } from "@/components/admin/ui/StatusBadge";
import Pagination from "@/components/admin/ui/Pagination";
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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [, setTotal] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    banned: 0,
    newThisMonth: 0,
  });

  const [banModal, setBanModal] = useState<{
    userId: string;
    userName: string;
  } | null>(null);
  const [banReason, setBanReason] = useState("");
  const [unbanUserId, setUnbanUserId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [statsLoaded, setStatsLoaded] = useState(false);
  const loadUsers = useCallback(async () => {
    const result = await getUsers({
      search,
      status: statusFilter,
      page,
      pageSize: 20,
    });

    if (result.success && result.data) {
      setUsers(result.data.items);
      setTotalPages(result.data.totalPages);
      setTotal(result.data.total);
    }

    setUsersLoaded(true);
  }, [search, statusFilter, page]);
  const loadStats = useCallback(async () => {
    const result = await getUserStats();
    if (result.success && result.data) {
      setStats(result.data);
    }

    setStatsLoaded(true);
  }, []);
  const loading =
    !usersLoaded || !statsLoaded || (isPending && users.length === 0);

  useEffect(() => {
    startTransition(() => {
      loadUsers();
    });
  }, [loadUsers]);

  useEffect(() => {
    startTransition(() => {
      loadStats();
    });
  }, [loadStats]);

  const handleBan = async () => {
    if (!banModal) return;
    setProcessing(true);
    const result = await banUser(banModal.userId, banReason);
    if (result.success) {
      toast.success("User banned");
      startTransition(() => {
        loadUsers(); // Refresh data
      });
      startTransition(() => {
        loadStats();
      });
    } else {
      toast.error(result.error || "Failed to ban user");
    }
    setProcessing(false);
    setBanModal(null);
    setBanReason("");
  };

  const handleUnban = async () => {
    if (!unbanUserId) return;
    setProcessing(true);
    const result = await unbanUser(unbanUserId);
    if (result.success) {
      toast.success("User unbanned");
      startTransition(() => {
        loadUsers(); // Refresh data
      });
      startTransition(() => {
        loadStats();
      });
    } else {
      toast.error(result.error || "Failed to unban user");
    }
    setProcessing(false);
    setUnbanUserId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-500">Manage your customer accounts</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total Users</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <div className="text-2xl font-bold text-green-700">
            {stats.active}
          </div>
          <div className="text-sm text-green-600">Active</div>
        </div>
        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
          <div className="text-2xl font-bold text-red-700">{stats.banned}</div>
          <div className="text-sm text-red-600">Banned</div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="text-2xl font-bold text-blue-700">
            {stats.newThisMonth}
          </div>
          <div className="text-sm text-blue-600">New This Month</div>
        </div>
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
                placeholder="Search by name, email, phone..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl 
                  focus:ring-2 focus:ring-amber-500 focus:border-transparent"
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
              <option value="">All Users</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users found"
            description="Try adjusting your search or filters."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Orders
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Total Spent
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Joined
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                            {user.image ? (
                              <Image
                                src={user.image}
                                alt={user.name || ""}
                                width={40}
                                height={40}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.name || "No name"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="flex items-center gap-1 text-gray-600">
                          <ShoppingCart className="w-4 h-4 text-gray-400" />
                          {user.orderCount}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-medium text-gray-900">
                          {formatCurrency(user.totalSpent)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {user.isBanned ? (
                          <Badge label="Banned" variant="error" />
                        ) : user.isActive ? (
                          <Badge label="Active" variant="success" />
                        ) : (
                          <Badge label="Inactive" variant="default" />
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600">
                          {formatDate(user.createdAt)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        {user.isBanned ? (
                          <button
                            onClick={() => setUnbanUserId(user.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm 
                              text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Unban
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              setBanModal({
                                userId: user.id,
                                userName: user.name || user.email,
                              })
                            }
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm 
                              text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Ban className="w-4 h-4" />
                            Ban
                          </button>
                        )}
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

      {/* Ban Modal */}
      {banModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setBanModal(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Ban User</h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to ban <strong>{banModal.userName}</strong>?
            </p>
            <textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="Reason for banning (optional)"
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none
                focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setBanModal(null)}
                disabled={processing}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium 
                  rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBan}
                disabled={processing}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium 
                  rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 
                  flex items-center justify-center gap-2"
              >
                {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                Ban User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unban Confirmation */}
      <ConfirmModal
        isOpen={!!unbanUserId}
        onClose={() => setUnbanUserId(null)}
        onConfirm={handleUnban}
        title="Unban User"
        message="Are you sure you want to unban this user? They will be able to access their account again."
        confirmLabel="Unban"
        variant="info"
        isLoading={processing}
      />
    </div>
  );
}
