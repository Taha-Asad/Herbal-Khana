// app/order-tracking/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Truck,
  Clock,
  MapPin,
  ArrowRight,
  ChevronRight,
  CreditCard,
  Shield,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import type {
  DisplayAddress,
  TrackingData,
  TrackingSearchParams,
} from "@/types/order";
import OrderSearchForm from "@/components/layout/home/OrderTracking/OrderSearchForm";
import TrackingTimeline from "@/components/layout/home/OrderTracking/TrackingTimeline";
import OrderItemsList from "@/components/layout/home/OrderTracking/OrderItemsList";
import PaymentSummary from "@/components/layout/home/OrderTracking/PaymentSummary";
import AddressCard from "@/components/layout/home/OrderTracking/AddressCard";
import NeedHelpSection from "@/components/layout/home/OrderTracking/NeedHelpSection";
import OrderSummary from "@/components/layout/home/OrderTracking/OrderSummary";

// =============================================================================
// TYPES
// =============================================================================
const emptyAddress: DisplayAddress = {
  name: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};
interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
        <AlertCircle className="w-10 h-10 text-red-500" />
      </div>
      <h3 className="text-2xl font-bold text-stone-800 mb-2">
        Order Not Found
      </h3>
      <p className="text-stone-600 mb-8 max-w-md mx-auto">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-6 py-3 bg-[#DDA200] text-white font-semibold rounded-xl hover:bg-[#b38600] transition-colors duration-300"
      >
        <RefreshCw className="w-5 h-5" />
        Try Again
      </button>
    </div>
  );
}

// =============================================================================
// MAIN PAGE COMPONENT
// =============================================================================

export default function OrderTrackingClient({
  initialOrderId,
}: {
  initialOrderId: string;
}) {
  const [searchState, setSearchState] = useState<
    "idle" | "loading" | "success" | "error"
  >(initialOrderId ? "loading" : "idle");

  const [orderData, setOrderData] = useState<TrackingData | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isLoading = searchState === "loading";

  // Auto-search if order ID is in URL
  useEffect(() => {
    if (initialOrderId) {
      // For URL-based tracking, we need the user to still verify with email/phone
      setSearchState("idle");
    }
  }, [initialOrderId]);

  const handleSearch = async (params: TrackingSearchParams) => {
    setSearchState("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: params.orderId,
          contactInfo: params.email || params.phone,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setOrderData(result.data);
        setSearchState("success");
      } else {
        setErrorMessage(
          result.error ||
            "We couldn't find an order with the provided details. Please check your Order ID and contact information."
        );
        setSearchState("error");
      }
    } catch {
      setErrorMessage("Something went wrong. Please try again later.");
      setSearchState("error");
    }
  };

  const handleRefreshTracking = async () => {
    if (!orderData) return;

    setIsRefreshing(true);
    try {
      const response = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber: orderData.orderId,
          contactInfo: orderData.shippingAddress.phone,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setOrderData(result.data);
      }
    } catch {
      console.error("Failed to refresh tracking");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleReset = () => {
    setSearchState("idle");
    setOrderData(null);
    setErrorMessage("");
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-[#FFF8E1]/30 to-white overflow-hidden">
      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes pulse-ring {
          0% {
            transform: scale(0.95);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.5;
          }
          100% {
            transform: scale(0.95);
            opacity: 1;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-pulse-ring {
          animation: pulse-ring 2s ease-in-out infinite;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-pulse-ring,
          .animate-float {
            animation: none;
          }
        }
      `}</style>

      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-[#DDA200]/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/4 -right-48 w-96 h-96 bg-[#DDA200]/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "3s" }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative mt-20 py-20 pb-12 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#DDA200]/10 rounded-full mb-6">
            <Truck className="w-4 h-4 text-[#DDA200]" />
            <span className="text-sm font-semibold text-[#b38600]">
              Real-time Order Tracking
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-stone-800 mb-6">
            Track Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#DDA200] to-[#b38600]">
              Order
            </span>
          </h1>
          <p className="text-lg md:text-xl text-stone-600 max-w-2xl mx-auto">
            Enter your order details below to see real-time updates on your
            shipment&apos;s journey.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Search Form */}
          {(searchState === "idle" || searchState === "error") && (
            <div className="py-8">
              <OrderSearchForm
                onSearch={handleSearch}
                isLoading={isLoading}
                initialOrderId={initialOrderId}
              />
              {searchState === "error" && (
                <div className="mt-6">
                  <ErrorState message={errorMessage} onRetry={handleReset} />
                </div>
              )}
            </div>
          )}

          {/* Loading State */}
          {searchState === "loading" && (
            <div className="py-20 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-[#DDA200]/10 rounded-full flex items-center justify-center animate-pulse-ring">
                <Package className="w-10 h-10 text-[#DDA200]" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-2">
                Searching for your order...
              </h3>
              <p className="text-stone-600">This may take a moment</p>
            </div>
          )}

          {/* Order Details */}
          {searchState === "success" && orderData && (
            <div className="space-y-8">
              {/* Back Button */}
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 text-[#DDA200] hover:text-[#b38600] font-medium transition-colors"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
                Track Another Order
              </button>

              {/* Order Summary */}
              <OrderSummary order={orderData} />

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                  <TrackingTimeline
                    events={orderData.trackingHistory}
                    isRefreshing={isRefreshing}
                    onRefresh={handleRefreshTracking}
                  />
                  <OrderItemsList items={orderData.items} />
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <PaymentSummary order={orderData} />
                  <AddressCard
                    title="Shipping Address"
                    icon={MapPin}
                    address={orderData.shippingAddress ?? emptyAddress}
                  />
                  <AddressCard
                    title="Billing Address"
                    icon={CreditCard}
                    address={orderData.billingAddress ?? emptyAddress}
                  />
                  <div className="bg-gradient-to-br from-[#FFF9E6] to-[#F7E4B2] rounded-2xl p-6 border border-[#f3e4b7]">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-[#DDA200]/20 rounded-lg">
                        <Shield className="w-5 h-5 text-[#DDA200]" />
                      </div>
                      <h4 className="font-bold text-stone-800">
                        Order Protection
                      </h4>
                    </div>
                    <p className="text-sm text-stone-600">
                      Your order is protected against loss, damage, and theft
                      during transit.
                    </p>
                  </div>
                </div>
              </div>

              {/* Need Help Section */}
              <NeedHelpSection />
            </div>
          )}
        </div>
      </section>

      {/* Features Section (Show when idle) */}
      {searchState === "idle" && (
        <section className="relative py-16 px-4 bg-gradient-to-br from-[#FFF9E6] to-[#F7E4B2]">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-stone-800 mb-4">
                Why Track with Us?
              </h2>
              <p className="text-stone-600 max-w-lg mx-auto">
                Stay informed at every step of your order&apos;s journey
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: Clock,
                  title: "Real-Time Updates",
                  description:
                    "Get instant notifications as your package moves through our delivery network",
                },
                {
                  icon: MapPin,
                  title: "Live Location",
                  description:
                    "See exactly where your package is with our live tracking map",
                },
                {
                  icon: Shield,
                  title: "Secure & Protected",
                  description:
                    "Your order is protected throughout its journey to your doorstep",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-2xl border-2 border-stone-200 hover:border-[#DDA200] hover:shadow-xl transition-all duration-300 group cursor-default"
                >
                  <div className="w-14 h-14 mb-4 bg-gradient-to-br from-[#DDA200] to-[#b38600] rounded-2xl flex items-center justify-center shadow-lg shadow-[#DDA200]/30 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-stone-800 mb-2 group-hover:text-[#DDA200] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section (Show when idle) */}
      {searchState === "idle" && (
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-4xl">
            <div className="relative p-8 md:p-12 bg-gradient-to-r from-[#DDA200] to-[#b38600] rounded-3xl text-white overflow-hidden shadow-2xl shadow-[#DDA200]/30">
              <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute left-0 bottom-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

              <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <Package className="w-10 h-10" />
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl md:text-3xl font-bold mb-1">
                      Don&apos;t have an order yet?
                    </h3>
                    <p className="text-white/90 text-lg">
                      Explore our collection and find something special
                    </p>
                  </div>
                </div>
                <Link
                  href="/home/shop/products"
                  className="group px-8 py-4 bg-white text-[#DDA200] font-bold rounded-xl hover:bg-stone-50 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Start Shopping
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
