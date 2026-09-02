"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Loader2, Check, AlertCircle } from "lucide-react";
import Image from "next/image";
import { uploadPaymentProofWithImage } from "@/app/action/home/payment.action";

interface PaymentProofUploadProps {
  orderId: string;
  orderNumber?: string;
  onSuccess: () => void;
}

export default function PaymentProofUpload({
  orderId,
  onSuccess,
}: PaymentProofUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    transactionId: "",
    senderName: "",
    senderPhone: "",
    notes: "",
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    onDropRejected: (rejections) => {
      const rejection = rejections[0];
      if (rejection.errors[0]?.code === "file-too-large") {
        setError("File is too large. Maximum size is 5MB.");
      } else {
        setError("Please upload a valid image file (JPEG, PNG, or WebP).");
      }
    },
  });

  const removeFile = () => {
    setFile(null);
    setPreview(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError("Please upload a payment screenshot");
      return;
    }
    if (!formData.senderName.trim()) {
      setError("Sender name is required");
      return;
    }
    if (!formData.senderPhone.trim()) {
      setError("Sender phone is required");
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData for the Server Action
      const serverFormData = new FormData();
      serverFormData.append("orderId", orderId);
      serverFormData.append("senderName", formData.senderName);
      serverFormData.append("senderPhone", formData.senderPhone);
      serverFormData.append("transactionId", formData.transactionId);
      serverFormData.append("notes", formData.notes);
      serverFormData.append("proofImage", file);

      // Call Server Action directly
      const result = await uploadPaymentProofWithImage(serverFormData);

      if (!result.success) {
        throw new Error(result.message || "Failed to upload payment proof");
      }

      onSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* File Upload Area */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-2">
          Payment Screenshot *
        </label>

        {!preview ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-[#DDA200] bg-[#FFF9E6]"
                : "border-stone-300 hover:border-[#DDA200]"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto text-stone-400 mb-4" />
            <p className="text-stone-600 mb-2">
              {isDragActive
                ? "Drop the image here..."
                : "Drag & drop your payment screenshot here"}
            </p>
            <p className="text-sm text-stone-500">
              or click to select (JPEG, PNG, WebP - max 5MB)
            </p>
          </div>
        ) : (
          <div className="relative rounded-xl overflow-hidden border-2 border-stone-200">
            <Image
              src={preview}
              alt="Payment proof preview"
              width={80}
              height={80}
              className="w-full max-h-64 object-contain bg-stone-100"
            />
            <button
              type="button"
              onClick={removeFile}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Transaction Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="transactionId"
            className="block text-sm font-medium text-stone-700 mb-1"
          >
            Transaction ID (Optional)
          </label>
          <input
            type="text"
            id="transactionId"
            name="transactionId"
            value={formData.transactionId}
            onChange={handleInputChange}
            placeholder="e.g., TXN123456789"
            className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-[#DDA200] focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="senderPhone"
            className="block text-sm font-medium text-stone-700 mb-1"
          >
            Sender&apos;s Phone Number *
          </label>
          <input
            type="tel"
            id="senderPhone"
            name="senderPhone"
            value={formData.senderPhone}
            onChange={handleInputChange}
            placeholder="03XX-XXXXXXX"
            className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-[#DDA200] focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="senderName"
          className="block text-sm font-medium text-stone-700 mb-1"
        >
          Sender&apos;s Name *
        </label>
        <input
          type="text"
          id="senderName"
          name="senderName"
          value={formData.senderName}
          onChange={handleInputChange}
          placeholder="Name on the sending account"
          className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-[#DDA200] focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-stone-700 mb-1"
        >
          Additional Notes (Optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          placeholder="Any additional information about your payment..."
          rows={3}
          className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-[#DDA200] focus:outline-none resize-none"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isUploading || !file}
        className="w-full py-4 bg-gradient-to-r from-[#DDA200] to-[#b38600] text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Check className="w-5 h-5" />
            Submit Payment Proof
          </>
        )}
      </button>
    </form>
  );
}
