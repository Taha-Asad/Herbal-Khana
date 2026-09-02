// components/products/comments/CommentSection.tsx
"use client";

import React, { useState } from "react";
import {
  MessageSquare,
  Send,
  MoreVertical,
  Edit2,
  Trash2,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import {
  createComment,
  updateComment,
  deleteComment,
  getProductComments,
} from "@/app/action/home/comments.action";
import type { CommentData } from "@/app/action/home/comments.action";
import toast from "react-hot-toast";

interface CommentSectionProps {
  productId: string;
  initialComments: CommentData[];
  totalComments: number;
}

export default function CommentSection({
  productId,
  initialComments,
  totalComments,
}: CommentSectionProps) {
  const [comments, setComments] = useState<CommentData[]>(initialComments);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(
    totalComments > initialComments.length
  );

  // Form state
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Load more comments
  const loadMoreComments = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const result = await getProductComments(productId, {
        page: page + 1,
        limit: 20,
      });

      if (result.success) {
        setComments((prev) => [...prev, ...result.data.comments]);
        setPage(result.data.currentPage);
        setHasMore(result.data.hasMore);
      }
    } catch (error) {
      toast.error("Failed to load more comments");
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit new comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await createComment({
        productId,
        content: newComment.trim(),
      });

      if (result.success) {
        setComments((prev) => [result.data, ...prev]);
        setNewComment("");
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to post comment");
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update comment
  const handleUpdateComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    setIsSubmitting(true);
    try {
      const result = await updateComment(commentId, editContent.trim());

      if (result.success) {
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? result.data : c))
        );
        setEditingId(null);
        setEditContent("");
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to update comment");
      console.log(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const result = await deleteComment(commentId);

      if (result.success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to delete comment");
      console.log(error);
    }
  };

  // Start editing
  const startEditing = (comment: CommentData) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
    setActiveMenu(null);
  };

  // Format time ago
  const timeAgo = (date: Date) => {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / 1000
    );

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-stone-800 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-[#DDA200]" />
        Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="flex gap-3">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Ask a question or leave a comment..."
          className="flex-1 px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-[#DDA200] focus:outline-none focus:ring-2 focus:ring-[#DDA200]/20"
          maxLength={1000}
        />
        <button
          type="submit"
          disabled={isSubmitting || !newComment.trim()}
          className="px-5 py-3 bg-gradient-to-r from-[#DDA200] to-[#b38600] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Post</span>
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-12 bg-stone-50 rounded-2xl">
            <MessageSquare className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-stone-700 mb-2">
              No comments yet
            </h4>
            <p className="text-stone-500">
              Be the first to start a discussion!
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white rounded-xl border border-stone-200 p-4"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-stone-200 overflow-hidden flex-shrink-0">
                  {comment.user.image ? (
                    <Image
                      src={comment.user.image}
                      alt={comment.user.name || "User"}
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-500 font-semibold text-sm">
                      {comment.user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-stone-800 text-sm">
                        {comment.user.name || "Anonymous"}
                      </span>
                      <span className="text-xs text-stone-400">
                        {timeAgo(comment.createdAt)}
                      </span>
                    </div>

                    {/* Actions Menu */}
                    {comment.isOwner && (
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveMenu(
                              activeMenu === comment.id ? null : comment.id
                            )
                          }
                          className="p-1 hover:bg-stone-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-stone-400" />
                        </button>

                        {activeMenu === comment.id && (
                          <div className="absolute right-0 top-full mt-1 bg-white border border-stone-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                            <button
                              onClick={() => startEditing(comment)}
                              className="w-full px-3 py-2 text-left text-sm text-stone-600 hover:bg-stone-50 flex items-center gap-2"
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {editingId === comment.id ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-stone-200 rounded-lg focus:border-[#DDA200] focus:outline-none text-sm resize-none"
                        rows={2}
                        maxLength={1000}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateComment(comment.id)}
                          disabled={isSubmitting}
                          className="px-3 py-1.5 bg-[#DDA200] text-white text-sm font-medium rounded-lg hover:bg-[#b38600] transition-colors disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditContent("");
                          }}
                          className="px-3 py-1.5 border border-stone-200 text-stone-600 text-sm font-medium rounded-lg hover:bg-stone-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-stone-600 text-sm mt-1 whitespace-pre-wrap">
                      {comment.content}
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
            onClick={loadMoreComments}
            disabled={isLoading}
            className="w-full py-3 border-2 border-stone-200 text-stone-600 font-medium rounded-xl hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              "Loading..."
            ) : (
              <>
                Load More Comments
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
