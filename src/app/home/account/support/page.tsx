"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  ChevronDown,
  ChevronRight,
  Package,
  CreditCard,
  Truck,
  RefreshCw,
  Shield,
  FileText,
  Search,
  ExternalLink,
} from "lucide-react";

const faqs = [
  {
    category: "Orders",
    icon: Package,
    questions: [
      {
        q: "How can I track my order?",
        a: "You can track your order from the 'My Orders' section in your account. Once shipped, you'll receive a tracking number via email and SMS.",
      },
      {
        q: "Can I cancel my order?",
        a: "Yes, you can cancel your order if it hasn't been shipped yet. Go to 'My Orders', select the order, and click 'Cancel Order'.",
      },
      {
        q: "How long does delivery take?",
        a: "Standard delivery takes 3-5 business days. Express delivery is available for 1-2 business days. Delivery times may vary based on your location.",
      },
    ],
  },
  {
    category: "Payments",
    icon: CreditCard,
    questions: [
      {
        q: "What payment methods do you accept?",
        a: "We accept Cash on Delivery (COD), Credit/Debit Cards (Visa, Mastercard), and Bank Transfer for orders.",
      },
      {
        q: "Is my payment information secure?",
        a: "Yes, all card transactions are secured with SSL encryption. We never store your full card details on our servers.",
      },
    ],
  },
  {
    category: "Shipping",
    icon: Truck,
    questions: [
      {
        q: "Do you offer free shipping?",
        a: "Yes! We offer free standard shipping on orders above PKR 5,000. Express and overnight shipping are charged separately.",
      },
      {
        q: "Which areas do you deliver to?",
        a: "We deliver across all major cities in Pakistan. Remote areas may have longer delivery times.",
      },
    ],
  },
  {
    category: "Returns & Refunds",
    icon: RefreshCw,
    questions: [
      {
        q: "What is your return policy?",
        a: "We offer a 7-day return policy for unused products in original packaging. Beauty products with broken seals cannot be returned for hygiene reasons.",
      },
      {
        q: "How long do refunds take?",
        a: "Refunds are processed within 5-7 business days after we receive the returned product. COD refunds are made via bank transfer.",
      },
    ],
  },
];

const contactMethods = [
  {
    icon: Phone,
    title: "Call Us",
    details: "+92 300 1234567",
    subtext: "Mon-Sat, 9AM-6PM",
    action: "tel:+923001234567",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    details: "+92 300 1234567",
    subtext: "Quick responses",
    action: "https://wa.me/923001234567",
  },
  {
    icon: Mail,
    title: "Email",
    details: "support@yourstore.com",
    subtext: "We reply within 24 hours",
    action: "mailto:support@yourstore.com",
  },
];

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openCategory, setOpenCategory] = useState<string | null>("Orders");
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const filteredFaqs = faqs
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.a.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.questions.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#FFF8E1]/30 to-white">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-[#DDA200]/10 rounded-full">
            <HelpCircle className="w-8 h-8 text-[#DDA200]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-stone-800">
            How can we help you?
          </h1>
          <p className="text-stone-600 mt-2 max-w-lg mx-auto">
            Find answers to common questions or get in touch with our support
            team
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for help..."
              className="w-full pl-12 pr-4 py-4 border-2 border-stone-200 rounded-2xl
                focus:border-[#DDA200] focus:outline-none text-stone-800"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-stone-800 mb-4">
              Frequently Asked Questions
            </h2>

            {filteredFaqs.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-stone-200 p-8 text-center">
                <p className="text-stone-600">
                  `No results found for ${searchQuery}.`
                </p>
              </div>
            ) : (
              filteredFaqs.map((category) => {
                const CategoryIcon = category.icon;
                const isOpen = openCategory === category.category;

                return (
                  <div
                    key={category.category}
                    className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden"
                  >
                    {/* Category Header */}
                    <button
                      onClick={() =>
                        setOpenCategory(isOpen ? null : category.category)
                      }
                      className="w-full flex items-center justify-between p-4 hover:bg-stone-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#DDA200]/10 rounded-lg">
                          <CategoryIcon className="w-5 h-5 text-[#DDA200]" />
                        </div>
                        <span className="font-semibold text-stone-800">
                          {category.category}
                        </span>
                        <span className="text-sm text-stone-400">
                          ({category.questions.length})
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-5 h-5 text-stone-400 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {/* Questions */}
                    {isOpen && (
                      <div className="border-t border-stone-100">
                        {category.questions.map((item, index) => {
                          const isQuestionOpen =
                            openQuestion === `${category.category}-${index}`;

                          return (
                            <div
                              key={index}
                              className="border-b border-stone-100 last:border-0"
                            >
                              <button
                                onClick={() =>
                                  setOpenQuestion(
                                    isQuestionOpen
                                      ? null
                                      : `${category.category}-${index}`
                                  )
                                }
                                className="w-full flex items-start justify-between p-4 text-left hover:bg-stone-50 transition-colors"
                              >
                                <span className="font-medium text-stone-700 pr-4">
                                  {item.q}
                                </span>
                                <ChevronRight
                                  className={`w-5 h-5 text-stone-400 flex-shrink-0 transition-transform ${
                                    isQuestionOpen ? "rotate-90" : ""
                                  }`}
                                />
                              </button>
                              {isQuestionOpen && (
                                <div className="px-4 pb-4">
                                  <p className="text-stone-600 bg-[#FFF9E6] p-4 rounded-xl">
                                    {item.a}
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Contact Section */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-stone-800">Contact Us</h2>

            {/* Contact Cards */}
            <div className="space-y-3">
              {contactMethods.map((method, index) => {
                const Icon = method.icon;

                return (
                  <a
                    key={index}
                    href={method.action}
                    target={
                      method.action.startsWith("http") ? "_blank" : undefined
                    }
                    rel={
                      method.action.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="block bg-white rounded-xl border-2 border-stone-200 p-4
                      hover:border-[#DDA200] hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-[#DDA200]/10 rounded-xl group-hover:bg-[#DDA200] transition-colors">
                        <Icon className="w-6 h-6 text-[#DDA200] group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <p className="font-semibold text-stone-800">
                          {method.title}
                        </p>
                        <p className="text-[#DDA200]">{method.details}</p>
                        <p className="text-sm text-stone-500">
                          {method.subtext}
                        </p>
                      </div>
                      <ExternalLink className="w-4 h-4 text-stone-400 ml-auto" />
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Store Hours */}
            <div className="bg-white rounded-xl border-2 border-stone-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-[#DDA200]" />
                <h3 className="font-semibold text-stone-800">Store Hours</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-600">Monday - Friday</span>
                  <span className="text-stone-800 font-medium">
                    9:00 AM - 6:00 PM
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Saturday</span>
                  <span className="text-stone-800 font-medium">
                    10:00 AM - 4:00 PM
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-600">Sunday</span>
                  <span className="text-stone-800 font-medium">Closed</span>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl border-2 border-stone-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-[#DDA200]" />
                <h3 className="font-semibold text-stone-800">Our Location</h3>
              </div>
              <p className="text-stone-600 text-sm">
                123 Business Street, Blue Area,
                <br />
                Islamabad, Pakistan 44000
              </p>
            </div>

            {/* Quick Links */}
            <div className="bg-[#FFF9E6] rounded-xl p-4 border border-[#f3e4b7]">
              <h3 className="font-semibold text-stone-800 mb-3">Quick Links</h3>
              <div className="space-y-2">
                <Link
                  href="/shipping-policy"
                  className="flex items-center gap-2 text-sm text-[#DDA200] hover:underline"
                >
                  <FileText className="w-4 h-4" />
                  Shipping Policy
                </Link>
                <Link
                  href="/return-policy"
                  className="flex items-center gap-2 text-sm text-[#DDA200] hover:underline"
                >
                  <RefreshCw className="w-4 h-4" />
                  Return Policy
                </Link>
                <Link
                  href="/privacy-policy"
                  className="flex items-center gap-2 text-sm text-[#DDA200] hover:underline"
                >
                  <Shield className="w-4 h-4" />
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
