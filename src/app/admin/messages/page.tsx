// app/admin/messages/page.tsx
"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  Mail,
  MailOpen,
  Reply,
  Archive,
  Trash2,
  RefreshCw,
  User,
  Loader2,
  MoreVertical,
  Eye,
} from "lucide-react";

import toast from "react-hot-toast";
import {
  getContactMessages,
  updateMessageStatus,
  deleteMessage,
  getMessageStats,
} from "@/app/action/admin/messages.actions";

// Types
interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "NEW" | "READ" | "REPLIED" | "ARCHIVED";
  createdAt: string;
  repliedAt?: string;
}

interface MessageStats {
  total: number;
  new: number;
  read: number;
  replied: number;
  archived: number;
}

type StatusFilter = "ALL" | "NEW" | "READ" | "REPLIED" | "ARCHIVED";

// Helper functions
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-PK", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function getStatusColor(status: string) {
  switch (status) {
    case "NEW":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "READ":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "REPLIED":
      return "bg-green-100 text-green-700 border-green-200";
    case "ARCHIVED":
      return "bg-gray-100 text-gray-600 border-gray-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case "NEW":
      return <Mail className="w-3.5 h-3.5" />;
    case "READ":
      return <MailOpen className="w-3.5 h-3.5" />;
    case "REPLIED":
      return <Reply className="w-3.5 h-3.5" />;
    case "ARCHIVED":
      return <Archive className="w-3.5 h-3.5" />;
    default:
      return <Mail className="w-3.5 h-3.5" />;
  }
}

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState<MessageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  // Load messages
  const loadMessages = async () => {
    setLoading(true);
    try {
      const [messagesResult, statsResult] = await Promise.all([
        getContactMessages({
          status: statusFilter === "ALL" ? undefined : statusFilter,
          search: searchQuery || undefined,
          page,
          limit: 20,
        }),
        getMessageStats(),
      ]);

      if (messagesResult.success && messagesResult.data) {
        setMessages(messagesResult.data.messages);
        setTotalPages(messagesResult.data.pages);
      }

      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      }
    } catch (error) {
      toast.error("Failed to load messages");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    startTransition(() => {
      loadMessages();
    });
  }, [statusFilter, page]);

  // Search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        loadMessages();
      } else {
        setPage(1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle status update
  const handleStatusUpdate = async (
    messageId: string,
    newStatus: ContactMessage["status"]
  ) => {
    try {
      const result = await updateMessageStatus(messageId, newStatus);
      if (result.success) {
        toast.success(`Message marked as ${newStatus.toLowerCase()}`);
        loadMessages();
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
  const handleDelete = async (messageId: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    try {
      const result = await deleteMessage(messageId);
      if (result.success) {
        toast.success("Message deleted");
        loadMessages();
      } else {
        toast.error(result.error || "Failed to delete message");
      }
    } catch (error) {
      toast.error("Failed to delete message");
      console.log(error);
    }
    setActionMenuOpen(null);
  };

  // Bulk actions
  const handleBulkAction = async (action: "READ" | "ARCHIVED" | "DELETE") => {
    if (selectedMessages.length === 0) {
      toast.error("No messages selected");
      return;
    }

    if (action === "DELETE") {
      if (!confirm(`Delete ${selectedMessages.length} messages?`)) return;
    }

    try {
      // Process each message
      for (const messageId of selectedMessages) {
        if (action === "DELETE") {
          await deleteMessage(messageId);
        } else {
          await updateMessageStatus(messageId, action);
        }
      }

      toast.success(`${selectedMessages.length} messages updated`);
      setSelectedMessages([]);
      loadMessages();
    } catch (error) {
      toast.error("Failed to update messages");
      console.log(error);
    }
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedMessages.length === messages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(messages.map((m) => m.id));
    }
  };

  // Toggle single selection
  const toggleSelect = (messageId: string) => {
    setSelectedMessages((prev) =>
      prev.includes(messageId)
        ? prev.filter((id) => id !== messageId)
        : [...prev, messageId]
    );
  };

  // Status tabs
  const statusTabs: { value: StatusFilter; label: string; count?: number }[] = [
    { value: "ALL", label: "All", count: stats?.total },
    { value: "NEW", label: "New", count: stats?.new },
    { value: "READ", label: "Read", count: stats?.read },
    { value: "REPLIED", label: "Replied", count: stats?.replied },
    { value: "ARCHIVED", label: "Archived", count: stats?.archived },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-amber-500" />
            Contact Messages
          </h1>
          <p className="text-gray-500 mt-1">
            Manage messages from your contact form
          </p>
        </div>
        <button
          onClick={() => loadMessages()}
          disabled={loading || isPending}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-amber-600 
            hover:bg-amber-50 rounded-lg transition-colors"
        >
          <RefreshCw
            className={`w-4 h-4 ${loading || isPending ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
                <p className="text-xs text-gray-500">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-blue-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
                <p className="text-xs text-gray-500">New</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-amber-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <MailOpen className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-600">
                  {stats.read}
                </p>
                <p className="text-xs text-gray-500">Read</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-green-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Reply className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {stats.replied}
                </p>
                <p className="text-xs text-gray-500">Replied</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Archive className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-600">
                  {stats.archived}
                </p>
                <p className="text-xs text-gray-500">Archived</p>
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
              placeholder="Search by name, email, or subject..."
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
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2
                  ${
                    statusFilter === tab.value
                      ? "bg-amber-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      statusFilter === tab.value
                        ? "bg-white/20 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedMessages.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {selectedMessages.length} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction("READ")}
                className="px-3 py-1.5 text-sm bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200"
              >
                Mark as Read
              </button>
              <button
                onClick={() => handleBulkAction("ARCHIVED")}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Archive
              </button>
              <button
                onClick={() => handleBulkAction("DELETE")}
                className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedMessages([])}
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No messages found
            </h3>
            <p className="text-gray-500">
              {searchQuery
                ? "Try a different search term"
                : statusFilter !== "ALL"
                ? `No ${statusFilter.toLowerCase()} messages`
                : "Messages will appear here when customers contact you"}
            </p>
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-600">
              <div className="col-span-1 flex items-center">
                <input
                  type="checkbox"
                  checked={selectedMessages.length === messages.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                />
              </div>
              <div className="col-span-3">Sender</div>
              <div className="col-span-4">Subject</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1">Date</div>
              <div className="col-span-1">Actions</div>
            </div>

            {/* Messages */}
            <div className="divide-y divide-gray-100">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 
                    transition-colors ${
                      message.status === "NEW" ? "bg-blue-50/50" : ""
                    }`}
                >
                  {/* Checkbox */}
                  <div className="hidden md:flex col-span-1 items-center">
                    <input
                      type="checkbox"
                      checked={selectedMessages.includes(message.id)}
                      onChange={() => toggleSelect(message.id)}
                      className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                    />
                  </div>

                  {/* Sender */}
                  <div className="col-span-1 md:col-span-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`font-medium text-gray-900 truncate ${
                            message.status === "NEW" ? "font-semibold" : ""
                          }`}
                        >
                          {message.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {message.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Subject & Preview */}
                  <div className="col-span-1 md:col-span-4">
                    <Link
                      href={`/admin/messages/${message.id}`}
                      className="block group"
                    >
                      <p
                        className={`text-gray-900 truncate group-hover:text-amber-600 transition-colors ${
                          message.status === "NEW" ? "font-semibold" : ""
                        }`}
                      >
                        {message.subject}
                      </p>
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {message.message.substring(0, 80)}...
                      </p>
                    </Link>
                  </div>

                  {/* Status */}
                  <div className="col-span-1 md:col-span-2 flex items-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        message.status
                      )}`}
                    >
                      {getStatusIcon(message.status)}
                      {message.status}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="col-span-1 md:col-span-1 flex items-center">
                    <span
                      className="text-sm text-gray-500"
                      title={new Date(message.createdAt).toLocaleString()}
                    >
                      {formatDate(message.createdAt)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 md:col-span-1 flex items-center justify-end gap-2">
                    <Link
                      href={`/admin/messages/${message.id}`}
                      className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    <div className="relative">
                      <button
                        onClick={() =>
                          setActionMenuOpen(
                            actionMenuOpen === message.id ? null : message.id
                          )
                        }
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {actionMenuOpen === message.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setActionMenuOpen(null)}
                          />
                          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-20 min-w-[160px]">
                            {message.status !== "READ" && (
                              <button
                                onClick={() =>
                                  handleStatusUpdate(message.id, "READ")
                                }
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <MailOpen className="w-4 h-4" />
                                Mark as Read
                              </button>
                            )}
                            {message.status !== "REPLIED" && (
                              <button
                                onClick={() =>
                                  handleStatusUpdate(message.id, "REPLIED")
                                }
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Reply className="w-4 h-4" />
                                Mark as Replied
                              </button>
                            )}
                            {message.status !== "ARCHIVED" && (
                              <button
                                onClick={() =>
                                  handleStatusUpdate(message.id, "ARCHIVED")
                                }
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Archive className="w-4 h-4" />
                                Archive
                              </button>
                            )}
                            <hr className="my-2 border-gray-100" />
                            <button
                              onClick={() => handleDelete(message.id)}
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
                  Page {page} of {totalPages}
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
