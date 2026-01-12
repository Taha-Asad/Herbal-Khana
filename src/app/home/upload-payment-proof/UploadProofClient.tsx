// app/upload-payment-proof/UploadPaymentProofClient.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  CreditCard,
  ArrowLeft,
  Copy,
  ImageIcon,
  X,
  User,
  Phone,
  FileText,
  Hash,
  Clock,
  Check,
  Smartphone,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getMobileWalletAccounts,
  type MobileWalletAccount,
} from "@/lib/payment-config";
import { uploadPaymentProofWithImage } from "@/app/action/home/payment.action";

// ============================================================================
// TYPES
// ============================================================================

interface OrderData {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
  paymentProof: string | null;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
}

interface UploadPaymentProofClientProps {
  initialOrder: OrderData | null;
  initialError: string | null;
  orderId: string;
}

interface FormData {
  senderName: string;
  senderPhone: string;
  transactionId: string;
  notes: string;
}

interface FormErrors {
  senderName?: string;
  senderPhone?: string;
  proofImage?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function getPaymentMethodColor(method: string | null): string {
  switch (method?.toLowerCase()) {
    case "jazzcash":
      return "bg-red-500";
    case "easypaisa":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

// Error State Component
function ErrorState({ error }: { error: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Order Not Found
        </h1>
        <p className="text-gray-600 mb-6">
          {error ||
            "The order you're looking for doesn't exist or you don't have permission to view it."}
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/30"
        >
          <ArrowLeft className="w-5 h-5" />
          Go to Home
        </Link>
      </div>
    </div>
  );
}

// Success State Component
function SuccessState({ orderNumber }: { orderNumber: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Proof Submitted!
        </h1>
        <p className="text-gray-600 mb-6">
          Your payment proof has been uploaded successfully. We&apos;ll verify
          it and update your order status within 24 hours.
        </p>
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-4 mb-6">
          <p className="text-sm text-amber-700">Order Number</p>
          <p className="text-xl font-bold text-amber-900">#{orderNumber}</p>
        </div>
        <div className="space-y-3">
          <Link
            href="/orders"
            className="block w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/30"
          >
            View My Orders
          </Link>
          <Link
            href="/"
            className="block w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

// Payment Account Card Component
interface PaymentAccountCardProps {
  accountKey: string;
  account: MobileWalletAccount;
  isSelected: boolean;
  onCopy: (text: string) => void;
}

function PaymentAccountCard({
  accountKey,
  account,
  isSelected,
  onCopy,
}: PaymentAccountCardProps) {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div
      className={`border rounded-xl p-4 transition-all ${
        isSelected
          ? "border-amber-400 bg-amber-50 shadow-md"
          : "border-gray-200 hover:border-amber-300 hover:shadow-md"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-md flex-shrink-0">
          {account.logo ? (
            <Image
              src={account.logo}
              alt={account.name}
              fill
              className="object-cover"
            />
          ) : (
            <div
              className={`w-full h-full ${getPaymentMethodColor(
                accountKey
              )} flex items-center justify-center`}
            >
              <Smartphone className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <span className="font-semibold text-gray-900 text-lg">
            {account.name}
          </span>
          {isSelected && (
            <span className="ml-2 text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
              Selected
            </span>
          )}
        </div>
      </div>

      {/* Account Details */}
      <div className="space-y-2 text-sm bg-white rounded-lg p-3 border border-gray-100">
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Account Name</span>
          <span className="font-medium text-gray-900">
            {account.accountTitle}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-500">Account Number</span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-medium text-gray-900">
              {account.accountNumber}
            </span>
            <button
              onClick={() => onCopy(account.accountNumber)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="Copy account number"
            >
              <Copy className="w-4 h-4 text-amber-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Instructions Toggle */}
      <button
        onClick={() => setShowInstructions(!showInstructions)}
        className="w-full mt-3 text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center justify-center gap-1"
      >
        {showInstructions ? "Hide" : "Show"} Instructions
        <span
          className={`transform transition-transform ${
            showInstructions ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {/* Instructions */}
      {showInstructions && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <ol className="space-y-2">
            {account.instructions.map((instruction, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-sm text-gray-600"
              >
                <span className="flex-shrink-0 w-5 h-5 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </span>
                <span>{instruction}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function UploadProofClient({
  initialOrder,
  initialError,
  orderId,
}: UploadPaymentProofClientProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(
    initialOrder?.paymentProof !== null
  );

  // Form state
  const [formData, setFormData] = useState<FormData>({
    senderName: initialOrder?.user.name || "",
    senderPhone: "",
    transactionId: "",
    notes: "",
  });

  // Image state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    initialOrder?.paymentProof || null
  );

  // Error state
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Handle error state
  if (initialError || !initialOrder) {
    return <ErrorState error={initialError || "Order not found"} />;
  }

  // Handle already submitted state
  if (isSubmitted) {
    return <SuccessState orderNumber={initialOrder.orderNumber} />;
  }

  const order = initialOrder;
  const mobileWalletAccounts = getMobileWalletAccounts();

  // Handlers
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a valid image (JPEG, PNG, or WebP)");
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));

    // Clear error
    if (formErrors.proofImage) {
      setFormErrors((prev) => ({ ...prev, proofImage: undefined }));
    }
  };

  const handleRemoveImage = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.senderName.trim()) {
      errors.senderName = "Sender name is required";
    }

    if (!formData.senderPhone.trim()) {
      errors.senderPhone = "Phone number is required";
    } else {
      const cleanPhone = formData.senderPhone.replace(/[-\s]/g, "");
      if (!/^03\d{9}$/.test(cleanPhone)) {
        errors.senderPhone =
          "Enter a valid Pakistani phone number (03XXXXXXXXX)";
      }
    }

    if (!selectedFile && !previewUrl) {
      errors.proofImage = "Payment proof image is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData for file upload
      const uploadFormData = new FormData();
      uploadFormData.append("orderId", orderId);
      uploadFormData.append("senderName", formData.senderName.trim());
      uploadFormData.append(
        "senderPhone",
        formData.senderPhone.replace(/[-\s]/g, "")
      );

      if (formData.transactionId.trim()) {
        uploadFormData.append("transactionId", formData.transactionId.trim());
      }

      if (formData.notes.trim()) {
        uploadFormData.append("notes", formData.notes.trim());
      }

      if (selectedFile) {
        uploadFormData.append("proofImage", selectedFile);
      }

      const result = await uploadPaymentProofWithImage(uploadFormData);

      if (result.success) {
        toast.success(result.message || "Payment proof uploaded successfully!");
        setIsSubmitted(true);
      } else {
        toast.error(result.message || "Failed to upload payment proof");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-amber-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30">
            <CreditCard className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Upload Payment Proof
          </h1>
          <p className="text-gray-600">
            Complete your order by uploading your payment receipt
          </p>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-500" />
            Order Summary
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Order Number</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-medium text-gray-900">
                  #{order.orderNumber}
                </span>
                <button
                  onClick={() => copyToClipboard(order.orderNumber)}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  <Copy className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Payment Method</span>
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded ${getPaymentMethodColor(
                    order.paymentMethod
                  )} flex items-center justify-center`}
                >
                  <Smartphone className="w-3 h-3 text-white" />
                </div>
                <span className="font-medium text-gray-900 capitalize">
                  {order.paymentMethod || "Bank Transfer"}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Status</span>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                Awaiting Payment
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600">Amount to Pay</span>
              <span className="text-2xl font-bold text-amber-600">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Accounts */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-500" />
            Payment Accounts
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Transfer the exact amount to any of the following accounts:
          </p>
          <div className="space-y-4">
            {Object.entries(mobileWalletAccounts).map(([key, account]) => (
              <PaymentAccountCard
                key={key}
                accountKey={key}
                account={account}
                isSelected={order.paymentMethod?.toLowerCase() === key}
                onCopy={copyToClipboard}
              />
            ))}
          </div>

          {/* Expiry Warning */}
          <div className="mt-4 flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <Clock className="w-5 h-5 text-amber-600" />
            <p className="text-sm text-amber-700">
              Please complete your payment within <strong>24 hours</strong> to
              avoid order cancellation.
            </p>
          </div>
        </div>

        {/* Payment Details Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-amber-500" />
            Payment Details
          </h2>

          <div className="space-y-4">
            {/* Sender Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sender Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="senderName"
                  value={formData.senderName}
                  onChange={handleInputChange}
                  placeholder="Name as per account"
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 
                    focus:border-transparent transition-all ${
                      formErrors.senderName
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200"
                    }`}
                />
              </div>
              {formErrors.senderName && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {formErrors.senderName}
                </p>
              )}
            </div>

            {/* Sender Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="senderPhone"
                  value={formData.senderPhone}
                  onChange={handleInputChange}
                  placeholder="03XX-XXXXXXX"
                  className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 
                    focus:border-transparent transition-all ${
                      formErrors.senderPhone
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200"
                    }`}
                />
              </div>
              {formErrors.senderPhone && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {formErrors.senderPhone}
                </p>
              )}
            </div>

            {/* Transaction ID (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction ID <span className="text-gray-400">(Optional)</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="transactionId"
                  value={formData.transactionId}
                  onChange={handleInputChange}
                  placeholder="TRX-XXXX-XXXX"
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Notes (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes <span className="text-gray-400">(Optional)</span>
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any additional information..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-amber-500" />
            Upload Receipt <span className="text-red-500">*</span>
          </h2>

          {/* Image Preview */}
          {previewUrl ? (
            <div className="relative mb-4">
              <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden border-2 border-amber-200">
                <Image
                  src={previewUrl}
                  alt="Payment proof"
                  fill
                  className="object-contain"
                />
                {/* Uploaded indicator */}
                <div className="absolute top-3 left-3 px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Image Selected
                </div>
              </div>
              <button
                onClick={handleRemoveImage}
                className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="block cursor-pointer">
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all
                  ${
                    formErrors.proofImage
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-amber-400 hover:bg-amber-50"
                  }`}
              >
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-amber-600" />
                </div>
                <p className="text-gray-700 font-medium mb-2">
                  Click to upload your payment receipt
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, JPEG, WebP up to 5MB
                </p>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          )}

          {formErrors.proofImage && (
            <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {formErrors.proofImage}
            </p>
          )}

          {/* Tips */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Tip:</strong> Make sure the receipt shows the transaction
              ID, amount, and date clearly.
            </p>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Important Notes:
          </h3>
          <ul className="text-sm text-amber-700 space-y-2">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
              Make sure the receipt is clear and readable
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
              Include the full transaction details in the screenshot
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
              Verification usually takes 1-24 hours
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
              You will receive an email once verified
            </li>
          </ul>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isUploading}
          className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold 
            rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/30 
            disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Submit Payment Proof
            </>
          )}
        </button>

        {/* Help Section */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Need help? Contact us at{" "}
          <a
            href="mailto:support@yourstore.com"
            className="text-amber-600 hover:underline font-medium"
          >
            support@yourstore.com
          </a>{" "}
          or call{" "}
          <a
            href="tel:+923001234567"
            className="text-amber-600 hover:underline font-medium"
          >
            0300-1234567
          </a>
        </p>
      </div>
    </div>
  );
}
