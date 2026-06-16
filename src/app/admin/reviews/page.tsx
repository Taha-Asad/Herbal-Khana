// app/admin/reviews/page.tsx
"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  CheckCircle,
  XCircle,
  Trash2,
  Loader2,
  Filter,
  Package,
  User,
} from "lucide-react";
import {
  getReviews,
  approveReview,
  rejectReview,
  deleteReview,
  getReviewStats,
} from "@/app/action/admin/reviews.actions";
import { Review } from "@/types/admin";
import { Badge } from "@/components/admin/ui/StatusBadge";
import Pagination from "@/components/admin/ui/Pagination";
import EmptyState from "@/components/admin/ui/EmptyState";
import ConfirmModal from "@/components/admin/ui/ConfirmModal";
import toast from "react-hot-toast";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? "text-amber-400 fill-amber-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    averageRating: 0,
  });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ✅ Use useTransition for loading states
  const [isPending, startTransition] = useTransition();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isStatsLoaded, setIsStatsLoaded] = useState(false);

  // ✅ Define functions BEFORE useEffect
  const loadReviews = useCallback(async () => {
    const result = await getReviews({
      status: statusFilter,
      page,
      pageSize: 20,
    });

    if (result.success && result.data) {
      setReviews(result.data.items);
      setTotalPages(result.data.totalPages);
    }
    setIsInitialLoad(false);
  }, [statusFilter, page]);

  const loadStats = useCallback(async () => {
    const result = await getReviewStats();
    if (result.success && result.data) {
      setStats(result.data);
    }
    setIsStatsLoaded(true);
  }, []);

  // ✅ useEffect AFTER function definitions, wrapped in startTransition
  useEffect(() => {
    startTransition(() => {
      loadReviews();
    });
  }, [loadReviews]);

  useEffect(() => {
    if (!isStatsLoaded) {
      startTransition(() => {
        loadStats();
      });
    }
  }, [loadStats, isStatsLoaded]);

  // Combined loading state
  const loading = isInitialLoad || (isPending && reviews.length === 0);

  const handleApprove = async (id: string) => {
    const result = await approveReview(id);
    if (result.success) {
      toast.success("Review approved");
      startTransition(() => {
        loadReviews();
        loadStats();
      });
    } else {
      toast.error(result.error || "Failed to approve review");
    }
  };

  const handleReject = async (id: string) => {
    const result = await rejectReview(id);
    if (result.success) {
      toast.success("Review rejected");
      startTransition(() => {
        loadReviews();
        loadStats();
      });
    } else {
      toast.error(result.error || "Failed to reject review");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const result = await deleteReview(deleteId);
    if (result.success) {
      toast.success("Review deleted");
      startTransition(() => {
        loadReviews();
        loadStats();
      });
    } else {
      toast.error(result.error || "Failed to delete review");
    }
    setDeleting(false);
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
        <p className="text-gray-500">Moderate product reviews</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">Total Reviews</div>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
          <div className="text-2xl font-bold text-amber-700">
            {stats.pending}
          </div>
          <div className="text-sm text-amber-600">Pending</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 border border-green-100">
          <div className="text-2xl font-bold text-green-700">
            {stats.approved}
          </div>
          <div className="text-sm text-green-600">Approved</div>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-1 text-2xl font-bold text-blue-700">
            <Star className="w-5 h-5 fill-current" />
            {stats.averageRating.toFixed(1)}
          </div>
          <div className="text-sm text-blue-600">Average Rating</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
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
            <option value="">All Reviews</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : reviews.length === 0 ? (
          <EmptyState
            icon={Star}
            title="No reviews found"
            description="Reviews will appear here when customers submit them."
          />
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {review.product.image ? (
                        <Image
                          src={review.product.image}
                          alt={review.product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Link
                            href={`/admin/products/${review.product.id}`}
                            className="font-medium text-gray-900 hover:text-amber-600 transition-colors"
                          >
                            {review.product.name}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <StarRating rating={review.rating} />
                            {review.isApproved ? (
                              <Badge label="Approved" variant="success" />
                            ) : (
                              <Badge label="Pending" variant="warning" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {!review.isApproved && (
                            <button
                              onClick={() => handleApprove(review.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {review.isApproved && (
                            <button
                              onClick={() => handleReject(review.id)}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteId(review.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {review.title && (
                        <h4 className="font-medium text-gray-900 mt-2">
                          {review.title}
                        </h4>
                      )}
                      {review.content && (
                        <p className="text-gray-600 text-sm mt-1">
                          {review.content}
                        </p>
                      )}

                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {review.user.name || review.user.email}
                        </span>
                        <span>{formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Review"
        message="Are you sure you want to delete this review? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  );
}
