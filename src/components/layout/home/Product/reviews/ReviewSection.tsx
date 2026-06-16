// src/components/product/reviews/ReviewSection.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Star, ChevronDown, Verified, Edit2, Trash2, User } from "lucide-react";
import Image from "next/image";
import {
  createReview,
  updateReview,
  deleteReview,
  getProductReviews,
  canUserReviewProduct,
  getUserReviewForProduct,
} from "@/app/action/home/review.action";
import toast from "react-hot-toast";
import type { ReviewData, ReviewStats } from "@/app/action/home/review.action";

interface ReviewSectionProps {
  productId: string;
  initialReviews: ReviewData[];
  reviewStats: ReviewStats;
  totalReviews: number;
}

export default function ReviewSection({
  productId,
  initialReviews,
  reviewStats,
  totalReviews,
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<ReviewData[]>(initialReviews);
  const [stats] = useState<ReviewStats>(reviewStats);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(totalReviews > initialReviews.length);
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "highest" | "lowest"
  >("newest");

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [canReview, setCanReview] = useState<{
    canReview: boolean;
    reason?: string;
    hasPurchased: boolean;
  } | null>(null);
  const [userReview, setUserReview] = useState<ReviewData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewData | null>(null);

  // Form values
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  // Check if user can review on mount
  useEffect(() => {
    async function checkReviewEligibility() {
      try {
        const [canReviewResult, userReviewResult] = await Promise.all([
          canUserReviewProduct(productId),
          getUserReviewForProduct(productId),
        ]);

        if (canReviewResult.success && canReviewResult.data) {
          setCanReview(canReviewResult.data);
        }

        if (userReviewResult.success && userReviewResult.data) {
          setUserReview(userReviewResult.data);
        }
      } catch (error) {
        console.error("Error checking review eligibility:", error);
      }
    }

    checkReviewEligibility();
  }, [productId]);

  // Load more reviews
  const loadMoreReviews = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const result = await getProductReviews(productId, {
        page: page + 1,
        limit: 10,
        sortBy,
      });

      if (result.success && result.data) {
        setReviews((prev) => [...prev, ...result.data.reviews]);
        setPage(result.data.currentPage);
        setHasMore(result.data.hasMore);
      }
    } catch (error) {
      toast.error("Failed to load more reviews");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sort change
  const handleSortChange = async (newSort: typeof sortBy) => {
    setSortBy(newSort);
    setIsLoading(true);

    try {
      const result = await getProductReviews(productId, {
        page: 1,
        limit: 10,
        sortBy: newSort,
      });

      if (result.success && result.data) {
        setReviews(result.data.reviews);
        setPage(1);
        setHasMore(result.data.hasMore);
      }
    } catch (error) {
      toast.error("Failed to sort reviews");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let result;

      if (editingReview) {
        result = await updateReview(editingReview.id, {
          rating,
          title,
          content,
        });
      } else {
        result = await createReview({ productId, rating, title, content });
      }

      if (result.success && result.data) {
        toast.success(result.message);

        if (editingReview) {
          setReviews((prev) =>
            prev.map((r) => (r.id === editingReview.id ? result.data : r))
          );
          setUserReview(result.data);
        } else {
          if (result.data.isApproved) {
            setReviews((prev) => [result.data, ...prev]);
          }
          setUserReview(result.data);
          setCanReview({
            canReview: false,
            reason: "You have already reviewed this product",
            hasPurchased: canReview?.hasPurchased || false,
          });
        }

        setShowReviewForm(false);
        setEditingReview(null);
        setRating(5);
        setTitle("");
        setContent("");
      } else {
        toast.error(result.message || "Failed to submit review");
      }
    } catch (error) {
      toast.error("Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete review
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      const result = await deleteReview(reviewId);

      if (result.success) {
        toast.success(result.message);
        setReviews((prev) => prev.filter((r) => r.id !== reviewId));
        setUserReview(null);
        setCanReview({
          canReview: true,
          hasPurchased: canReview?.hasPurchased || false,
        });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to delete review");
    }
  };

  // Start editing review
  const handleEditReview = (review: ReviewData) => {
    setEditingReview(review);
    setRating(review.rating);
    setTitle(review.title || "");
    setContent(review.content || "");
    setShowReviewForm(true);
  };

  // Render stars
  const renderStars = (rating: number, size: "sm" | "md" | "lg" = "md") => {
    const sizeClasses = {
      sm: "w-3 h-3",
      md: "w-4 h-4",
      lg: "w-5 h-5",
    };

    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? "fill-[#DDA200] text-[#DDA200]"
                : "fill-stone-200 text-stone-200"
            }`}
          />
        ))}
      </div>
    );
  };

  // Render interactive stars for form
  const renderInteractiveStars = () => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="p-1 transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${
                star <= (hoverRating || rating)
                  ? "fill-[#DDA200] text-[#DDA200]"
                  : "fill-stone-200 text-stone-200"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Review Summary */}
      <div className="bg-white rounded-2xl border-2 border-stone-200 p-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Overall Rating */}
          <div className="text-center lg:text-left lg:min-w-[160px]">
            <div className="text-5xl font-bold text-stone-800 mb-2">
              {stats.averageRating.toFixed(1)}
            </div>
            <div className="flex justify-center lg:justify-start">
              {renderStars(Math.round(stats.averageRating), "lg")}
            </div>
            <div className="text-sm text-stone-500 mt-2">
              Based on {stats.totalReviews}{" "}
              {stats.totalReviews === 1 ? "review" : "reviews"}
            </div>
            {stats.verifiedPurchaseCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-green-600 mt-1 justify-center lg:justify-start">
                <Verified className="w-3 h-3" />
                {stats.verifiedPurchaseCount} verified
              </div>
            )}
          </div>

          {/* Rating Distribution */}
          <div className="flex-1 max-w-md">
            {stats.ratingDistribution.map((item) => (
              <div key={item.rating} className="flex items-center gap-3 mb-2">
                <span className="text-sm text-stone-600 w-12">
                  {item.rating} star
                </span>
                <div className="flex-1 h-2.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#DDA200] rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <span className="text-sm text-stone-500 w-10 text-right">
                  {item.count}
                </span>
              </div>
            ))}
          </div>

          {/* Write Review Button */}
          <div className="flex flex-col items-center lg:items-end gap-3 lg:min-w-[180px]">
            {userReview ? (
              <div className="text-center p-4 bg-stone-50 rounded-xl w-full">
                <p className="text-sm text-stone-600 mb-3">Your review</p>
                {renderStars(userReview.rating, "sm")}
                <div className="flex justify-center gap-2 mt-3">
                  <button
                    onClick={() => handleEditReview(userReview)}
                    className="px-3 py-1.5 text-sm font-medium text-[#DDA200] hover:bg-[#FFF9E6] rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteReview(userReview.id)}
                    className="px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              </div>
            ) : canReview?.canReview ? (
              <button
                onClick={() => setShowReviewForm(true)}
                className="w-full lg:w-auto px-6 py-3 bg-gradient-to-r from-[#DDA200] to-[#b38600] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Write a Review
              </button>
            ) : canReview ? (
              <p className="text-sm text-stone-500 text-center">
                {canReview.reason}
              </p>
            ) : (
              <p className="text-sm text-stone-500 text-center">Loading...</p>
            )}
          </div>
        </div>
      </div>

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-white rounded-2xl border-2 border-[#DDA200] p-6">
          <h3 className="text-lg font-semibold text-stone-800 mb-4">
            {editingReview ? "Edit Your Review" : "Write a Review"}
          </h3>

          <form onSubmit={handleSubmitReview} className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Your Rating *
              </label>
              {renderInteractiveStars()}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Review Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Sum up your experience"
                className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-[#DDA200] focus:outline-none focus:ring-2 focus:ring-[#DDA200]/20 transition-all"
                maxLength={100}
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Your Review
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-[#DDA200] focus:outline-none focus:ring-2 focus:ring-[#DDA200]/20 resize-none transition-all"
                maxLength={2000}
              />
              <div className="text-xs text-stone-400 mt-1 text-right">
                {content.length}/2000
              </div>
            </div>

            {/* Verified Purchase Notice */}
            {canReview?.hasPurchased && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                <Verified className="w-4 h-4" />
                Your review will be marked as a verified purchase
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-[#DDA200] to-[#b38600] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
              >
                {isSubmitting
                  ? "Submitting..."
                  : editingReview
                  ? "Update Review"
                  : "Submit Review"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowReviewForm(false);
                  setEditingReview(null);
                  setRating(5);
                  setTitle("");
                  setContent("");
                }}
                className="px-6 py-3 border-2 border-stone-200 text-stone-600 font-medium rounded-xl hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sort */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-stone-800">
          Customer Reviews ({stats.totalReviews})
        </h3>

        <select
          value={sortBy}
          onChange={(e) => handleSortChange(e.target.value as typeof sortBy)}
          className="px-4 py-2 border-2 border-stone-200 rounded-xl text-sm focus:border-[#DDA200] focus:outline-none bg-white"
        >
          <option value="newest">Most Recent</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Rated</option>
          <option value="lowest">Lowest Rated</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-16 bg-stone-50 rounded-2xl">
            <Star className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <h4 className="text-xl font-semibold text-stone-700 mb-2">
              No reviews yet
            </h4>
            <p className="text-stone-500 mb-6">
              Be the first to share your thoughts!
            </p>
            {canReview?.canReview && (
              <button
                onClick={() => setShowReviewForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-[#DDA200] to-[#b38600] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Write a Review
              </button>
            )}
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-xl border-2 border-stone-200 p-5 hover:border-stone-300 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFF9E6] to-[#DDA200]/20 overflow-hidden flex-shrink-0 flex items-center justify-center">
                  {review.user.image ? (
                    <Image
                      src={review.user.image}
                      alt={review.user.name || "User"}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-[#DDA200]" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-stone-800">
                      {review.user.name || "Anonymous"}
                    </span>
                    {review.isVerifiedPurchase && (
                      <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                        <Verified className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 mb-3">
                    {renderStars(review.rating, "sm")}
                    <span className="text-xs text-stone-400">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  {review.title && (
                    <h4 className="font-semibold text-stone-800 mb-2">
                      {review.title}
                    </h4>
                  )}

                  {review.content && (
                    <p className="text-stone-600 leading-relaxed whitespace-pre-wrap">
                      {review.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Load More */}
        {hasMore && (
          <button
            onClick={loadMoreReviews}
            disabled={isLoading}
            className="w-full py-4 border-2 border-stone-200 text-stone-600 font-medium rounded-xl hover:bg-stone-50 hover:border-stone-300 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              "Loading..."
            ) : (
              <>
                Load More Reviews
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
