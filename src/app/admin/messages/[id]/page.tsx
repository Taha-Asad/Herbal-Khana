// app/admin/messages/[id]/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  User,
  Mail,
  Clock,
  Globe,
  Monitor,
  Reply,
  Archive,
  Trash2,
  MailOpen,
  Send,
  Copy,
  ExternalLink,
  CheckCircle,
} from "lucide-react";

import toast from "react-hot-toast";
import {
  addReplyToMessage,
  deleteMessage,
  getMessageById,
  updateMessageStatus,
} from "@/app/action/admin/messages.actions";

interface MessageDetail {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "NEW" | "READ" | "REPLIED" | "ARCHIVED";
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  reply?: string;
  repliedAt?: string;
  repliedBy?: string;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-PK", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusColor(status: string) {
  switch (status) {
    case "NEW":
      return "bg-blue-100 text-blue-700";
    case "READ":
      return "bg-amber-100 text-amber-700";
    case "REPLIED":
      return "bg-green-100 text-green-700";
    case "ARCHIVED":
      return "bg-gray-100 text-gray-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export default function MessageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const messageId = params.id as string;

  const [message, setMessage] = useState<MessageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadMessage = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getMessageById(messageId);
      if (result.success && result.data) {
        setMessage(result.data);
        // Auto-mark as read if new
        if (result.data.status === "NEW") {
          await updateMessageStatus(messageId, "READ");
          setMessage((prev) => (prev ? { ...prev, status: "READ" } : null));
        }
      } else {
        setError(result.error || "Message not found");
      }
    } catch (err) {
      setError("Failed to load message");
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [messageId]);

  useEffect(() => {
    loadMessage();
  }, [loadMessage]);

  const handleStatusChange = async (newStatus: MessageDetail["status"]) => {
    if (!message) return;

    setIsUpdating(true);
    try {
      const result = await updateMessageStatus(messageId, newStatus);
      if (result.success) {
        setMessage((prev) => (prev ? { ...prev, status: newStatus } : null));
        toast.success(`Message marked as ${newStatus.toLowerCase()}`);
      } else {
        toast.error(result.error || "Failed to update status");
      }
    } catch (err) {
      toast.error("Failed to update status");
      console.log(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    setIsUpdating(true);
    try {
      const result = await deleteMessage(messageId);
      if (result.success) {
        toast.success("Message deleted");
        router.push("/admin/messages");
      } else {
        toast.error(result.error || "Failed to delete message");
      }
    } catch (err) {
      toast.error("Failed to delete message");
      console.log(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyContent.trim()) {
      toast.error("Please enter a reply");
      return;
    }

    setIsSending(true);
    try {
      const result = await addReplyToMessage(messageId, replyContent.trim());
      if (result.success) {
        toast.success("Reply sent successfully");
        setMessage((prev) =>
          prev
            ? {
                ...prev,
                status: "REPLIED",
                reply: replyContent.trim(),
                repliedAt: new Date().toISOString(),
              }
            : null
        );
        setShowReplyForm(false);
        setReplyContent("");
      } else {
        toast.error(result.error || "Failed to send reply");
      }
    } catch (err) {
      toast.error("Failed to send reply");
      console.log(err);
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (error || !message) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Message Not Found
        </h2>
        <p className="text-gray-500 mb-4">{error}</p>
        <Link
          href="/admin/messages"
          className="text-amber-600 hover:text-amber-700 font-medium"
        >
          Back to Messages
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/messages"
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 line-clamp-1">
              {message.subject}
            </h1>
            <p className="text-gray-500 text-sm">
              From {message.name} • {formatDate(message.createdAt)}
            </p>
          </div>
        </div>
        <span
          className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
            message.status
          )}`}
        >
          {message.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Message Content */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{message.name}</p>
                <a
                  href={`mailto:${message.email}`}
                  className="text-sm text-amber-600 hover:underline flex items-center gap-1"
                >
                  {message.email}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            <div className="p-6">
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {message.message}
                </p>
              </div>
            </div>
          </div>

          {/* Previous Reply */}
          {message.reply && (
            <div className="bg-green-50 rounded-xl border border-green-200 overflow-hidden">
              <div className="px-6 py-3 border-b border-green-200 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Your Reply</span>
                {message.repliedAt && (
                  <span className="text-sm text-green-600 ml-auto">
                    {formatDate(message.repliedAt)}
                  </span>
                )}
              </div>
              <div className="p-6">
                <p className="whitespace-pre-wrap text-gray-700">
                  {message.reply}
                </p>
              </div>
            </div>
          )}

          {/* Reply Form */}
          {showReplyForm ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
                <Reply className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-gray-900">Send Reply</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To: {message.email}
                  </label>
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Type your reply here..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl resize-none
                      focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSendReply}
                    disabled={isSending || !replyContent.trim()}
                    className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-medium
                      rounded-xl hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Reply
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowReplyForm(false);
                      setReplyContent("");
                    }}
                    className="px-6 py-3 border border-gray-200 text-gray-700 font-medium
                      rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowReplyForm(true)}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-amber-500 
                text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors"
            >
              <Reply className="w-5 h-5" />
              Reply to {message.name}
            </button>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-4 space-y-2">
              {message.status !== "READ" && (
                <button
                  onClick={() => handleStatusChange("READ")}
                  disabled={isUpdating}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg
                    hover:bg-amber-50 text-gray-700 hover:text-amber-700 transition-colors
                    disabled:opacity-50"
                >
                  <MailOpen className="w-5 h-5" />
                  Mark as Read
                </button>
              )}
              {message.status !== "REPLIED" && (
                <button
                  onClick={() => handleStatusChange("REPLIED")}
                  disabled={isUpdating}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg
                    hover:bg-green-50 text-gray-700 hover:text-green-700 transition-colors
                    disabled:opacity-50"
                >
                  <Reply className="w-5 h-5" />
                  Mark as Replied
                </button>
              )}
              {message.status !== "ARCHIVED" && (
                <button
                  onClick={() => handleStatusChange("ARCHIVED")}
                  disabled={isUpdating}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg
                    hover:bg-gray-100 text-gray-700 transition-colors disabled:opacity-50"
                >
                  <Archive className="w-5 h-5" />
                  Archive
                </button>
              )}
              <hr className="my-2" />
              <button
                onClick={handleDelete}
                disabled={isUpdating}
                className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg
                  hover:bg-red-50 text-red-600 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5" />
                Delete Message
              </button>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Contact Details</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">{message.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-500">Email</p>
                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${message.email}`}
                      className="font-medium text-amber-600 hover:underline truncate"
                    >
                      {message.email}
                    </a>
                    <button
                      onClick={() => copyToClipboard(message.email, "Email")}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Copy className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Received</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(message.createdAt)}
                  </p>
                </div>
              </div>
              {message.ipAddress && (
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">IP Address</p>
                    <p className="text-sm text-gray-600 font-mono">
                      {message.ipAddress}
                    </p>
                  </div>
                </div>
              )}
              {message.userAgent && (
                <div className="flex items-start gap-3">
                  <Monitor className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Browser</p>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {message.userAgent}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
