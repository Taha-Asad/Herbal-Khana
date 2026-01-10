// app/checkout/confirmation/ConfirmationClient.tsx
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  Package,
  Truck,
  Clock,
  Copy,
  Check,
  Upload,
  ArrowRight,
  Phone,
  Mail,
  AlertCircle,
  Shield,
  CreditCard,
} from "lucide-react";
import { OrderConfirmation } from "@/types/checkout";
import { PAYMENT_ACCOUNTS } from "@/lib/payment-config";
import Image from "next/image";
import PaymentProofUpload from "@/components/layout/checkout/PaymentProofUpload";

interface ConfirmationClientProps {
  orderData: OrderConfirmation;
  userEmail: string;
}

export default function ConfirmationClient({
  orderData,
  userEmail,
}: ConfirmationClientProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [proofUploaded, setProofUploaded] = useState(false);

  const paymentConfig =
    orderData.paymentMethod !== "cod"
      ? PAYMENT_ACCOUNTS[
          orderData.paymentMethod as keyof typeof PAYMENT_ACCOUNTS
        ]
      : null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleProofUploadSuccess = () => {
    setProofUploaded(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#FFF8E1]/30 to-white py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">
            {orderData.paymentMethod === "cod"
              ? "Order Placed Successfully!"
              : "Order Created - Payment Required"}
          </h1>
          <p className="text-lg text-stone-600 max-w-xl mx-auto">
            {orderData.paymentMethod === "cod"
              ? "Thank you for your order! We'll start processing it right away."
              : "Please complete your payment and upload the proof to confirm your order."}
          </p>
        </div>

        {/* Order Number Card */}
        <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm text-stone-500 mb-1">Order Number</p>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-stone-800">
                  {orderData.orderNumber}
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(orderData.orderNumber, "orderNumber")
                  }
                  className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
                  title="Copy order number"
                >
                  {copied === "orderNumber" ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-stone-400" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center gap-6 text-center md:text-right">
              <div>
                <p className="text-sm text-stone-500">Total Amount</p>
                <p className="text-xl font-bold text-[#DDA200]">
                  PKR {orderData.total.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-stone-500">Status</p>
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                    orderData.paymentStatus === "SUCCESS"
                      ? "bg-green-100 text-green-700"
                      : orderData.paymentStatus === "PENDING"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {orderData.paymentStatus === "PENDING" && (
                    <Clock className="w-4 h-4" />
                  )}
                  {orderData.paymentStatus === "SUCCESS" && (
                    <Check className="w-4 h-4" />
                  )}
                  {orderData.paymentStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Instructions (for non-COD) */}
        {orderData.requiresProof &&
          orderData.paymentInstructions &&
          !proofUploaded && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 p-6 md:p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-amber-200 rounded-xl">
                  <CreditCard className="w-6 h-6 text-amber-700" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-stone-800">
                    Complete Your Payment
                  </h2>
                  <p className="text-sm text-stone-600">
                    Send payment to the account below
                  </p>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-white rounded-xl p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-stone-500">Payment Method</p>
                    <p className="font-bold text-stone-800 flex items-center gap-2">
                      {paymentConfig?.name}
                      {paymentConfig?.logo && (
                        <Image
                          src={paymentConfig.logo}
                          alt={paymentConfig.name}
                          className="h-6"
                        />
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-stone-500">Account Title</p>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-stone-800">
                        {orderData.paymentInstructions.accountTitle}
                      </p>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            orderData.paymentInstructions!.accountTitle!,
                            "accountTitle"
                          )
                        }
                        className="p-1 hover:bg-stone-100 rounded transition-colors"
                      >
                        {copied === "accountTitle" ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-stone-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-stone-500">Account Number</p>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-stone-800 font-mono">
                        {orderData.paymentInstructions.accountNumber}
                      </p>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            orderData.paymentInstructions!.accountNumber!,
                            "accountNumber"
                          )
                        }
                        className="p-1 hover:bg-stone-100 rounded transition-colors"
                      >
                        {copied === "accountNumber" ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-stone-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-stone-500">Amount to Send</p>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-2xl text-[#DDA200]">
                        PKR{" "}
                        {orderData.paymentInstructions.amount.toLocaleString()}
                      </p>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            orderData.paymentInstructions!.amount.toString(),
                            "amount"
                          )
                        }
                        className="p-1 hover:bg-stone-100 rounded transition-colors"
                      >
                        {copied === "amount" ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-stone-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Reference */}
                <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Reference:</strong> Use{" "}
                    <span className="font-mono font-bold">
                      {orderData.paymentInstructions.reference}
                    </span>{" "}
                    as payment reference/description
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div className="mb-6">
                <h3 className="font-bold text-stone-800 mb-3">How to Pay:</h3>
                <ol className="space-y-2">
                  {orderData.paymentInstructions.instructions.map(
                    (instruction, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-stone-600"
                      >
                        <span className="flex-shrink-0 w-6 h-6 bg-[#DDA200] text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </span>
                        {instruction}
                      </li>
                    )
                  )}
                </ol>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700">
                  <p className="font-semibold">Important:</p>
                  <p>
                    Please send the exact amount shown above. Your order will be
                    cancelled if payment is not received within 24 hours.
                  </p>
                </div>
              </div>
            </div>
          )}

        {/* Payment Proof Upload Section */}
        {orderData.requiresProof && !proofUploaded && (
          <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 md:p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#DDA200]/20 rounded-xl">
                <Upload className="w-6 h-6 text-[#DDA200]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-stone-800">
                  Upload Payment Proof
                </h2>
                <p className="text-sm text-stone-600">
                  Upload a screenshot of your payment confirmation
                </p>
              </div>
            </div>

            <PaymentProofUpload
              orderId={orderData.orderId}
              orderNumber={orderData.orderNumber}
              onSuccess={handleProofUploadSuccess}
            />
          </div>
        )}

        {/* Proof Uploaded Success */}
        {proofUploaded && (
          <div className="bg-green-50 rounded-2xl border-2 border-green-200 p-6 md:p-8 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-200 rounded-xl">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-green-800">
                  Payment Proof Uploaded!
                </h2>
                <p className="text-green-700">
                  We will verify your payment and send you a confirmation email
                  within 24 hours.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* COD Order Confirmation */}
        {orderData.paymentMethod === "cod" && (
          <div className="bg-green-50 rounded-2xl border-2 border-green-200 p-6 md:p-8 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-green-200 rounded-xl">
                <Truck className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-green-800">
                  Cash on Delivery Selected
                </h2>
                <p className="text-green-700">
                  Please keep PKR {orderData.total.toLocaleString()} ready when
                  your order arrives.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-white/50 rounded-xl">
              <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">
                Our delivery partner will call you before delivery. Please
                ensure someone is available to receive the package.
              </p>
            </div>
          </div>
        )}

        {/* Order Timeline */}
        <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 md:p-8 mb-8">
          <h2 className="text-xl font-bold text-stone-800 mb-6">
            What&apos;s Next?
          </h2>
          <div className="space-y-6">
            {[
              {
                icon: Package,
                title:
                  orderData.paymentMethod === "cod"
                    ? "Order Confirmed"
                    : "Payment Verification",
                description:
                  orderData.paymentMethod === "cod"
                    ? "Your order is confirmed and will be processed soon"
                    : "We'll verify your payment within 24 hours",
                completed: orderData.paymentMethod === "cod" || proofUploaded,
              },
              {
                icon: Truck,
                title: "Processing & Shipping",
                description: "Your order will be prepared and shipped",
                completed: false,
              },
              {
                icon: CheckCircle,
                title: "Delivery",
                description: orderData.estimatedDelivery
                  ? `Expected by ${new Date(
                      orderData.estimatedDelivery
                    ).toLocaleDateString("en-PK", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}`
                  : "You'll receive your package soon",
                completed: false,
              },
            ].map((step, index) => (
              <div key={index} className="flex items-start gap-4">
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    step.completed
                      ? "bg-green-100 text-green-600"
                      : "bg-stone-100 text-stone-400"
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 pb-6 border-l-2 border-stone-200 pl-6 -ml-5 last:border-0 last:pb-0">
                  <h3
                    className={`font-semibold ${
                      step.completed ? "text-green-700" : "text-stone-800"
                    }`}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm text-stone-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Email Confirmation */}
        <div className="bg-[#FFF9E6] rounded-2xl border-2 border-[#f3e4b7] p-6 mb-8">
          <div className="flex items-center gap-4">
            <Mail className="w-8 h-8 text-[#DDA200]" />
            <div>
              <h3 className="font-bold text-stone-800">
                Confirmation Email Sent
              </h3>
              <p className="text-stone-600">
                We&apos;ve sent order details to{" "}
                <span className="font-medium">{userEmail}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={`/home/order-tracking?order=${orderData.orderNumber}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-[#DDA200] to-[#b38600] text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            <Truck className="w-5 h-5" />
            Track Order
          </Link>
          <Link
            href="/home/shop/products"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-stone-200 text-stone-800 font-bold rounded-xl hover:border-[#DDA200] transition-colors"
          >
            Continue Shopping
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Support Section */}
        <div className="mt-12 text-center">
          <p className="text-stone-600 mb-4">Need help with your order?</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <a
              href="tel:+923001234567"
              className="inline-flex items-center gap-2 text-[#DDA200] hover:text-[#b38600] font-medium"
            >
              <Phone className="w-5 h-5" />
              +92 300 1234567
            </a>
            <a
              href="mailto:support@yourstore.com"
              className="inline-flex items-center gap-2 text-[#DDA200] hover:text-[#b38600] font-medium"
            >
              <Mail className="w-5 h-5" />
              support@yourstore.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
