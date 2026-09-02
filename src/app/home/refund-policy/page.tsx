// app/refund-policy/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import {
  DollarSign,
  Clock,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Info,
  ArrowRight,
  Shield,
  RotateCcw,
  HelpCircle,
  ChevronRight,
  Wallet,
  Banknote,
  Gift,
} from "lucide-react";

// =============================================================================
// DATA
// =============================================================================
const refundMethods = [
  {
    icon: CreditCard,
    title: "Original Payment Method",
    description:
      "Refunds are credited back to the original payment method used for the purchase.",
    time: "3-5 business days after processing",
  },
  {
    icon: Wallet,
    title: "Store Credit",
    description:
      "Opt for store credit and receive an additional 10% bonus on your refund amount.",
    time: "Instant after approval",
  },
  {
    icon: Banknote,
    title: "PayPal / Digital Wallets",
    description:
      "PayPal and digital wallet refunds are processed directly to your account.",
    time: "1-2 business days after processing",
  },
  {
    icon: Gift,
    title: "Gift Card Purchases",
    description: "Purchases made with gift cards are refunded as store credit.",
    time: "Instant after approval",
  },
];

const refundTimeline = [
  {
    stage: "Return Shipped",
    description: "You ship your return using the prepaid label",
    days: "Day 1",
  },
  {
    stage: "Return Received",
    description: "We receive your package at our facility",
    days: "Day 3-7",
  },
  {
    stage: "Inspection",
    description: "Our team inspects the returned item",
    days: "Day 8-10",
  },
  {
    stage: "Refund Processed",
    description: "Refund is initiated to your payment method",
    days: "Day 11-12",
  },
  {
    stage: "Refund Received",
    description: "Funds appear in your account",
    days: "Day 14-17",
  },
];

const policyPoints = [
  {
    title: "Full Refunds",
    items: [
      "Items returned in original, unused condition",
      "Defective or damaged items",
      "Wrong items shipped",
      "Items that don't match the description",
    ],
  },
  {
    title: "Partial Refunds",
    items: [
      "Items showing minor signs of use",
      "Items returned without original packaging",
      "Items returned after 30 days (50% restocking fee)",
    ],
  },
  {
    title: "No Refunds",
    items: [
      "Final sale items",
      "Personalized or custom items",
      "Items with removed tags",
      "Items not in resellable condition",
    ],
  },
];

// =============================================================================
// COMPONENTS
// =============================================================================
function RefundMethodCard({
  method,
}: {
  method: {
    icon: React.ElementType;
    title: string;
    description: string;
    time: string;
  };
}) {
  const Icon = method.icon;

  return (
    <div className="p-6 bg-white rounded-2xl border border-[#e5d9b6] hover:border-[#DDA200] hover:shadow-xl transition-all duration-300 group">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-[#DDA200]/10 rounded-xl group-hover:bg-[#DDA200] transition-colors">
          <Icon className="w-6 h-6 text-[#DDA200] group-hover:text-white transition-colors" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 mb-2">{method.title}</h3>
          <p className="text-gray-600 text-sm mb-3">{method.description}</p>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-[#DDA200]" />
            <span className="text-[#b38600] font-medium">{method.time}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PolicySection({
  title,
  items,
  type,
}: {
  title: string;
  items: string[];
  type: "full" | "partial" | "none";
}) {
  const colors = {
    full: {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: "text-green-500",
    },
    partial: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      icon: "text-yellow-500",
    },
    none: { bg: "bg-red-50", border: "border-red-200", icon: "text-red-500" },
  };

  const icons = {
    full: CheckCircle,
    partial: AlertCircle,
    none: AlertCircle,
  };

  const Icon = icons[type];

  return (
    <div
      className={`p-6 rounded-2xl ${colors[type].bg} border ${colors[type].border}`}
    >
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Icon className={`w-5 h-5 ${colors[type].icon}`} />
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2 text-gray-600 text-sm">
            <ChevronRight className={`w-4 h-4 ${colors[type].icon}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export default function RefundPolicyPage() {
  return (
    <div className="relative min-h-screen py-20 bg-gradient-to-br from-white via-[#FFF8E1] to-white">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#DDA200]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-[#DDA200]/20 rounded-full blur-3xl" />
      </div>

      {/* ================================================================= */}
      {/* HERO SECTION */}
      {/* ================================================================= */}
      <section className="relative pt-20 pb-12 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#DDA200]/10 rounded-full mb-6">
            <DollarSign className="w-10 h-10 text-[#DDA200]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Refund Policy
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            We want you to be completely satisfied with your purchase. Learn
            about our fair and transparent refund process.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#DDA200]/10 rounded-full">
            <Info className="w-4 h-4 text-[#DDA200]" />
            <span className="text-sm text-[#b38600] font-medium">
              Last updated: December 15, 2025
            </span>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* QUICK OVERVIEW */}
      {/* ================================================================= */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-8 bg-white rounded-2xl border border-[#e5d9b6] shadow-lg">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#DDA200] to-[#b38600] rounded-2xl flex items-center justify-center text-white shadow-lg">
                <RotateCcw className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">30</h3>
              <p className="text-gray-600">Days Return Window</p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl border border-[#e5d9b6] shadow-lg">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#DDA200] to-[#b38600] rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Clock className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">5-7</h3>
              <p className="text-gray-600">Days to Process Refund</p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl border border-[#e5d9b6] shadow-lg">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#DDA200] to-[#b38600] rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-bold text-gray-800 mb-2">100%</h3>
              <p className="text-gray-600">Money-Back Guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* REFUND METHODS */}
      {/* ================================================================= */}
      <section className="py-12 px-4 bg-gradient-to-br from-[#FFF9E6] to-[#F7E4B2]">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-10">
            How You&apos;ll Receive Your Refund
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {refundMethods.map((method, index) => (
              <RefundMethodCard key={index} method={method} />
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* REFUND TIMELINE */}
      {/* ================================================================= */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-12">
            Refund Timeline
          </h2>

          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-[#DDA200]/20 -translate-x-1/2" />

            <div className="space-y-8">
              {refundTimeline.map((step, index) => (
                <div
                  key={index}
                  className={`relative flex items-center gap-6 ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-6 md:left-1/2 w-4 h-4 bg-[#DDA200] rounded-full border-4 border-white shadow -translate-x-1/2 z-10" />

                  {/* Content */}
                  <div
                    className={`flex-1 ml-12 md:ml-0 ${
                      index % 2 === 0
                        ? "md:pr-12 md:text-right"
                        : "md:pl-12 md:text-left"
                    }`}
                  >
                    <div className="p-6 bg-white rounded-xl border border-[#e5d9b6] shadow-md hover:shadow-lg transition-shadow">
                      <span className="inline-block px-3 py-1 bg-[#DDA200]/10 text-[#b38600] text-sm font-bold rounded-full mb-2">
                        {step.days}
                      </span>
                      <h3 className="font-bold text-gray-800 mb-1">
                        {step.stage}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="hidden md:block flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* REFUND ELIGIBILITY */}
      {/* ================================================================= */}
      <section className="py-12 px-4 bg-gradient-to-br from-[#FFF9E6] to-[#F7E4B2]">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 text-center mb-10">
            Refund Eligibility
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PolicySection
              title={policyPoints[0].title}
              items={policyPoints[0].items}
              type="full"
            />
            <PolicySection
              title={policyPoints[1].title}
              items={policyPoints[1].items}
              type="partial"
            />
            <PolicySection
              title={policyPoints[2].title}
              items={policyPoints[2].items}
              type="none"
            />
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* DETAILED POLICY */}
      {/* ================================================================= */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="prose prose-lg max-w-none">
            <div className="p-8 bg-white rounded-2xl border border-[#e5d9b6] shadow-lg space-y-8">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-[#DDA200]/10 rounded-lg flex items-center justify-center text-[#DDA200] font-bold text-sm">
                    1
                  </span>
                  Eligibility Requirements
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  To be eligible for a refund, items must be returned within 30
                  days of delivery. Items must be in their original condition,
                  unworn, unwashed, with all tags attached, and in original
                  packaging. We reserve the right to refuse refunds on items
                  that do not meet these criteria.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-[#DDA200]/10 rounded-lg flex items-center justify-center text-[#DDA200] font-bold text-sm">
                    2
                  </span>
                  Refund Processing
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Once we receive your return, our team will inspect the item
                  within 2-3 business days. If approved, your refund will be
                  processed within 5-7 business days. The refund will be
                  credited to your original payment method. Please note that it
                  may take additional time for your bank or credit card company
                  to post the refund to your account.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-[#DDA200]/10 rounded-lg flex items-center justify-center text-[#DDA200] font-bold text-sm">
                    3
                  </span>
                  Shipping Costs
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Original shipping costs are non-refundable unless the return
                  is due to our error (wrong item, defective product, etc.). We
                  provide free return shipping for all eligible returns within
                  the United States. International customers are responsible for
                  return shipping costs.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-[#DDA200]/10 rounded-lg flex items-center justify-center text-[#DDA200] font-bold text-sm">
                    4
                  </span>
                  Defective or Damaged Items
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  If you receive a defective or damaged item, please contact us
                  within 48 hours of delivery. We&apos;ll provide a prepaid
                  return label and issue a full refund or replacement once we
                  receive the item. Please include photos of the damage when
                  contacting us.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-[#DDA200]/10 rounded-lg flex items-center justify-center text-[#DDA200] font-bold text-sm">
                    5
                  </span>
                  Late Returns
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Returns received after the 30-day window may be accepted at
                  our discretion. Late returns are subject to a 50% restocking
                  fee. Items returned after 60 days will not be accepted and
                  will be returned to the sender at their expense.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* STORE CREDIT BONUS */}
      {/* ================================================================= */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="p-8 bg-gradient-to-r from-[#DDA200] to-[#b38600] rounded-2xl text-white relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative flex flex-col md:flex-row items-center gap-6">
              <div className="p-4 bg-white/20 rounded-2xl">
                <Gift className="w-12 h-12" />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">
                  Get 10% Bonus with Store Credit
                </h3>
                <p className="text-white/80">
                  Choose store credit instead of a refund and receive an extra
                  10% on your refund amount. Use it on your next purchase!
                </p>
              </div>
              <Link
                href="/account/orders"
                className="px-8 py-3 bg-white text-[#DDA200] font-bold rounded-xl hover:bg-gray-100 transition-colors whitespace-nowrap"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* NEED HELP */}
      {/* ================================================================= */}
      <section className="py-16 px-4 border-t border-[#e5d9b6]">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#DDA200]/10 rounded-full mb-6">
            <HelpCircle className="w-8 h-8 text-[#DDA200]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Questions About Your Refund?
          </h2>
          <p className="text-gray-600 mb-8">
            Our customer support team is here to help with any refund-related
            inquiries.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/home/faqs"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-[#DDA200] text-[#DDA200] font-semibold rounded-xl hover:bg-[#DDA200] hover:text-white transition-all duration-300"
            >
              <HelpCircle className="w-5 h-5" />
              View FAQs
            </Link>
            <Link
              href="/home/order-tracking"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-[#DDA200] text-[#DDA200] font-semibold rounded-xl hover:bg-[#DDA200] hover:text-white transition-all duration-300"
            >
              <RotateCcw className="w-5 h-5" />
              Track Return
            </Link>
            <Link
              href="/home/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#DDA200] to-[#b38600] text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
            >
              Contact Support
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
