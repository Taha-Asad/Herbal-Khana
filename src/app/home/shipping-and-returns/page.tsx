// app/shipping-returns/page.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Truck,
  Package,
  Clock,
  Globe,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  ArrowRight,
  ChevronDown,
  DollarSign,
  Shield,
  Calendar,
  Box,
  Plane,
  HelpCircle,
} from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================
interface ShippingOption {
  id: string;
  name: string;
  description: string;
  time: string;
  price: string;
  freeThreshold?: string;
  icon: React.ElementType;
}

interface CountryZone {
  zone: string;
  countries: string[];
  standardTime: string;
  expressTime: string;
  standardPrice: string;
  expressPrice: string;
}

interface ReturnStep {
  step: number;
  title: string;
  description: string;
  icon: React.ElementType;
}

// =============================================================================
// DATA
// =============================================================================
const shippingOptions: ShippingOption[] = [
  {
    id: "standard",
    name: "Standard Delivery",
    description: "Delivery via local courier across Pakistan",
    time: "3–5 working days",
    price: "PKR 250",
    freeThreshold: "Free on orders over PKR 5,000",
    icon: Truck,
  },
  {
    id: "express",
    name: "Express Delivery",
    description: "Faster delivery for major cities",
    time: "1–2 working days",
    price: "PKR 450",
    freeThreshold: "Free on orders over PKR 10,000",
    icon: Plane,
  },
  {
    id: "samecity",
    name: "Same-City Delivery",
    description: "Available within selected cities",
    time: "Same or next working day",
    price: "PKR 200",
    icon: Clock,
  },
  {
    id: "international",
    name: "International Shipping",
    description: "Available for selected countries only",
    time: "7–21 working days",
    price: "Calculated at checkout",
    icon: Globe,
  },
];

const countryZones: CountryZone[] = [
  {
    zone: "Pakistan – Major Cities",
    countries: ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad"],
    standardTime: "3–4 working days",
    expressTime: "1–2 working days",
    standardPrice: "PKR 250",
    expressPrice: "PKR 450",
  },
  {
    zone: "Pakistan – Other Cities",
    countries: ["Multan", "Peshawar", "Quetta", "Sialkot", "Gujranwala"],
    standardTime: "4–6 working days",
    expressTime: "2–3 working days",
    standardPrice: "PKR 300",
    expressPrice: "PKR 550",
  },
  {
    zone: "International",
    countries: ["Middle East", "UK", "USA", "Canada"],
    standardTime: "10–21 working days",
    expressTime: "5–10 working days",
    standardPrice: "From PKR 3,500",
    expressPrice: "From PKR 6,500",
  },
];

const returnSteps: ReturnStep[] = [
  {
    step: 1,
    title: "Initiate Return",
    description: "Log into your account or contact support to request a return",
    icon: Package,
  },
  {
    step: 2,
    title: "Courier Pickup",
    description: "Our courier will pick up the item from your address",
    icon: Box,
  },
  {
    step: 3,
    title: "Quality Check",
    description: "Item is inspected at our warehouse",
    icon: Truck,
  },
  {
    step: 4,
    title: "Refund Processed",
    description: "Refund issued within 7–10 working days after approval",
    icon: DollarSign,
  },
];

const eligibleItems = [
  "Items in original condition with tags attached",
  "Unworn, unwashed, and unaltered items",
  "Items in original packaging",
  "Items returned within 30 days of delivery",
  "Defective or damaged items (contact us first)",
];

const nonReturnableItems = [
  "Personalized or custom-made items",
  "Intimate apparel and swimwear",
  "Items marked as 'Final Sale'",
  "Gift cards",
  "Items without original tags or packaging",
  "Items showing signs of wear or use",
];

// =============================================================================
// ANIMATION HOOK
// =============================================================================
function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.1, ...options }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [options]);

  return [ref, isVisible];
}

// =============================================================================
// COMPONENTS
// =============================================================================
function ShippingCard({
  option,
  index,
}: {
  option: ShippingOption;
  index: number;
}) {
  const Icon = option.icon;
  const [ref, isVisible] = useIntersectionObserver();

  return (
    <div
      ref={ref}
      className={`
        relative p-6 bg-white rounded-2xl border-2 border-stone-200 
        hover:border-amber-500 hover:shadow-2xl hover:shadow-amber-100
        transform transition-all duration-500 ease-out group
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
      `}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Hover Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

      <div className="relative flex items-start gap-4">
        <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl text-white shadow-lg shadow-amber-200 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 ease-out">
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-stone-800 mb-1 group-hover:text-amber-700 transition-colors duration-300">
            {option.name}
          </h3>
          <p className="text-stone-600 text-sm mb-3 leading-relaxed">
            {option.description}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold transition-transform duration-300 hover:scale-105">
              <Clock className="w-4 h-4" />
              {option.time}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 text-stone-700 rounded-full text-sm font-semibold transition-transform duration-300 hover:scale-105">
              <DollarSign className="w-4 h-4" />
              {option.price}
            </span>
          </div>
          {option.freeThreshold && (
            <p className="mt-4 text-sm text-emerald-700 font-semibold flex items-center gap-1.5 bg-emerald-50 px-3 py-2 rounded-lg w-fit">
              <CheckCircle className="w-4 h-4" />
              {option.freeThreshold}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function InternationalZoneCard({
  zone,
  index,
}: {
  zone: CountryZone;
  index: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [isOpen]);

  return (
    <div
      className="border-2 border-stone-200 rounded-xl overflow-hidden bg-white hover:border-amber-300 transition-all duration-300 hover:shadow-lg"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 hover:bg-amber-50/50 transition-colors duration-300"
        aria-expanded={isOpen}
        aria-controls={`zone-content-${zone.zone}`}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg transition-transform duration-300 group-hover:scale-110">
            <Globe className="w-5 h-5 text-amber-600" />
          </div>
          <span className="font-bold text-stone-800">{zone.zone}</span>
        </div>
        <div className="p-1 rounded-full bg-amber-100 transition-all duration-300">
          <ChevronDown
            className={`w-5 h-5 text-amber-600 transition-transform duration-300 ease-out ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      <div
        id={`zone-content-${zone.zone}`}
        className="overflow-hidden transition-all duration-500 ease-out"
        style={{ maxHeight: isOpen ? `${contentHeight}px` : "0px" }}
      >
        <div ref={contentRef} className="p-5 pt-0">
          <div className="pt-4 border-t-2 border-stone-100">
            <div className="flex flex-wrap gap-2 mb-5">
              {zone.countries.map((country, i) => (
                <span
                  key={country}
                  className="px-3 py-1.5 bg-stone-100 text-stone-700 text-sm rounded-lg font-medium
                    opacity-0 animate-fade-in-up"
                  style={{
                    animationDelay: `${i * 50}ms`,
                    animationFillMode: "forwards",
                  }}
                >
                  {country}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl border border-amber-200">
                <p className="text-sm text-stone-600 mb-1 font-medium">
                  Standard
                </p>
                <p className="font-bold text-stone-800 text-lg">
                  {zone.standardPrice}
                </p>
                <p className="text-sm text-amber-700 font-medium mt-1">
                  {zone.standardTime}
                </p>
              </div>
              <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl border border-amber-200">
                <p className="text-sm text-stone-600 mb-1 font-medium">
                  Express
                </p>
                <p className="font-bold text-stone-800 text-lg">
                  {zone.expressPrice}
                </p>
                <p className="text-sm text-amber-700 font-medium mt-1">
                  {zone.expressTime}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReturnStepCard({
  step,
  index,
  total,
}: {
  step: ReturnStep;
  index: number;
  total: number;
}) {
  const Icon = step.icon;
  const [ref, isVisible] = useIntersectionObserver();

  return (
    <div
      ref={ref}
      className={`relative text-center transition-all duration-700 ease-out ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Connection Line */}
      {index < total - 1 && (
        <div className="hidden md:block absolute top-8 left-[calc(50%+2rem)] right-0 h-0.5">
          <div
            className={`h-full bg-gradient-to-r from-amber-400 to-amber-200 transition-all duration-1000 ease-out ${
              isVisible ? "w-full" : "w-0"
            }`}
            style={{ transitionDelay: `${index * 150 + 300}ms` }}
          />
        </div>
      )}

      <div className="relative z-10 w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-200 group hover:scale-110 hover:rotate-3 transition-all duration-300 cursor-default">
        <Icon className="w-8 h-8" />
        <span className="absolute -top-2 -right-2 w-7 h-7 bg-white text-amber-600 text-sm font-bold rounded-full flex items-center justify-center shadow-md border-2 border-amber-100">
          {step.step}
        </span>
      </div>
      <h3 className="font-bold text-stone-800 mb-2 text-lg">{step.title}</h3>
      <p className="text-stone-600 text-sm leading-relaxed max-w-[200px] mx-auto">
        {step.description}
      </p>
    </div>
  );
}

function HighlightCard({
  icon: Icon,
  title,
  description,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay?: number;
}) {
  const [ref, isVisible] = useIntersectionObserver();

  return (
    <div
      ref={ref}
      className={`
        text-center p-8 bg-white rounded-2xl border-2 border-stone-200 
        hover:border-amber-400 hover:shadow-2xl hover:shadow-amber-100 
        transition-all duration-500 ease-out group cursor-default
        ${
          isVisible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-8 scale-95"
        }
      `}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="w-16 h-16 mx-auto mb-5 bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-200 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-2xl font-bold text-stone-800 mb-2 group-hover:text-amber-700 transition-colors duration-300">
        {title}
      </h3>
      <p className="text-stone-600 leading-relaxed">{description}</p>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================
export default function ShippingReturnsPage() {
  const [activeTab, setActiveTab] = useState<"shipping" | "returns">(
    "shipping"
  );
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleTabChange = (tab: "shipping" | "returns") => {
    if (tab === activeTab) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab(tab);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 300);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-amber-50/30 to-white overflow-hidden">
      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse-soft {
          0%,
          100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.3;
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

        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out forwards;
        }

        .animate-pulse-soft {
          animation: pulse-soft 4s ease-in-out infinite;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in-up,
          .animate-pulse-soft,
          .animate-float {
            animation: none;
          }
        }
      `}</style>

      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-48 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl animate-pulse-soft" />
        <div
          className="absolute bottom-1/4 -right-48 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl animate-pulse-soft"
          style={{ animationDelay: "2s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-amber-100/20 to-transparent rounded-full animate-float" />
      </div>

      {/* ================================================================= */}
      {/* HERO SECTION */}
      {/* ================================================================= */}
      <section className="relative mt-20 pt-24 pb-16 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          {/* Decorative Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full mb-6 animate-fade-in-up">
            <Truck className="w-4 h-4 text-amber-700" />
            <span className="text-sm font-semibold text-amber-800">
              Fast & Reliable Shipping
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-stone-800 mb-6 leading-tight">
            Shipping & Returns
          </h1>
          <p className="text-lg md:text-xl text-stone-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about getting your order and our
            hassle-free return process.
          </p>

          {/* Tab Buttons */}
          <div className="inline-flex p-1.5 bg-stone-100 rounded-2xl border border-stone-200 shadow-inner">
            <button
              onClick={() => handleTabChange("shipping")}
              className={`
                relative flex items-center gap-2 px-8 py-4 rounded-xl font-semibold 
                transition-all duration-300 ease-out overflow-hidden
                ${
                  activeTab === "shipping"
                    ? "text-white shadow-lg shadow-amber-200"
                    : "text-stone-600 hover:text-stone-800 hover:bg-white/50"
                }
              `}
              aria-pressed={activeTab === "shipping"}
            >
              {activeTab === "shipping" && (
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-300" />
              )}
              <Truck className="relative w-5 h-5" />
              <span className="relative">Shipping</span>
            </button>
            <button
              onClick={() => handleTabChange("returns")}
              className={`
                relative flex items-center gap-2 px-8 py-4 rounded-xl font-semibold 
                transition-all duration-300 ease-out overflow-hidden
                ${
                  activeTab === "returns"
                    ? "text-white shadow-lg shadow-amber-200"
                    : "text-stone-600 hover:text-stone-800 hover:bg-white/50"
                }
              `}
              aria-pressed={activeTab === "returns"}
            >
              {activeTab === "returns" && (
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-300" />
              )}
              <RotateCcw className="relative w-5 h-5" />
              <span className="relative">Returns</span>
            </button>
          </div>
        </div>
      </section>

      {/* Content Container with Transition */}
      <div
        className={`transition-all duration-300 ease-out ${
          isTransitioning
            ? "opacity-0 translate-y-4"
            : "opacity-100 translate-y-0"
        }`}
      >
        {/* ================================================================= */}
        {/* SHIPPING CONTENT */}
        {/* ================================================================= */}
        {activeTab === "shipping" && (
          <div className="relative pb-20">
            {/* Shipping Options */}
            <section className="py-12 px-4">
              <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-12">
                  <h2 className="text-2xl md:text-3xl font-bold text-stone-800 mb-4">
                    Shipping Options
                  </h2>
                  <p className="text-stone-600 max-w-xl mx-auto">
                    Choose the delivery method that works best for you
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {shippingOptions.map((option, index) => (
                    <ShippingCard
                      key={option.id}
                      option={option}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* Free Shipping Banner */}
            <section className="py-8 px-4">
              <div className="container mx-auto max-w-4xl">
                <div className="relative p-8 md:p-10 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 rounded-3xl text-white overflow-hidden shadow-2xl shadow-amber-200">
                  {/* Decorative Elements */}
                  <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute left-0 bottom-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

                  <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/20 group hover:scale-110 transition-transform duration-300">
                        <Truck className="w-8 h-8" />
                      </div>
                      <div className="text-center md:text-left">
                        <h3 className="text-2xl md:text-3xl font-bold mb-1">
                          Free Standard Shipping
                        </h3>
                        <p className="text-white/90 text-lg">
                          On all orders over PKR 5,000
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/home/shop/products"
                      className="group px-8 py-4 bg-white text-amber-600 font-bold rounded-xl 
                        hover:bg-amber-50 transition-all duration-300 
                        flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      Shop Now
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* Shipping Information */}
            <section className="py-12 px-4">
              <div className="container mx-auto max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Processing Time */}
                  <div className="p-8 bg-white rounded-2xl border-2 border-stone-200 shadow-xl shadow-stone-100 hover:border-amber-300 transition-all duration-300">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 bg-amber-100 rounded-xl">
                        <Clock className="w-6 h-6 text-amber-600" />
                      </div>
                      <h3 className="text-xl font-bold text-stone-800">
                        Processing Time
                      </h3>
                    </div>
                    <ul className="space-y-5">
                      {[
                        {
                          title: "Standard Orders",
                          desc: "1-2 business days processing",
                        },
                        {
                          title: "Personalized Items",
                          desc: "3-5 business days processing",
                        },
                        {
                          title: "Pre-Order Items",
                          desc: "Ships on release date",
                        },
                      ].map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-4 p-3 rounded-xl hover:bg-amber-50 transition-colors duration-300"
                        >
                          <div className="p-1 bg-emerald-100 rounded-full mt-0.5">
                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-stone-800">
                              {item.title}
                            </p>
                            <p className="text-stone-600 text-sm">
                              {item.desc}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Shipping Policies */}
                  <div className="p-8 bg-white rounded-2xl border-2 border-stone-200 shadow-xl shadow-stone-100 hover:border-amber-300 transition-all duration-300">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 bg-amber-100 rounded-xl">
                        <Shield className="w-6 h-6 text-amber-600" />
                      </div>
                      <h3 className="text-xl font-bold text-stone-800">
                        Shipping Policies
                      </h3>
                    </div>
                    <ul className="space-y-5">
                      {[
                        {
                          title: "Address Accuracy",
                          desc: "Please ensure your shipping address is correct. We're not responsible for packages shipped to incorrect addresses.",
                          important: true,
                        },
                        {
                          title: "Signature Required",
                          desc: "Orders over PKR 20,000 may require signature upon delivery.",
                          important: false,
                        },
                      ].map((item, i) => (
                        <li
                          key={i}
                          className={`flex items-start gap-4 p-4 rounded-xl transition-colors duration-300 ${
                            item.important
                              ? "bg-amber-50 border border-amber-200"
                              : "hover:bg-amber-50"
                          }`}
                        >
                          <div className="p-1 bg-amber-100 rounded-full mt-0.5">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-stone-800">
                              {item.title}
                            </p>
                            <p className="text-stone-600 text-sm leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* International Shipping */}
            <section className="py-16 px-4 bg-gradient-to-br from-amber-50 via-amber-100/50 to-amber-50">
              <div className="container mx-auto max-w-4xl">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl mb-5 shadow-lg shadow-amber-200">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-stone-800 mb-4">
                    International Shipping
                  </h2>
                  <p className="text-stone-600 max-w-lg mx-auto">
                    We ship to over 50 countries. Rates and delivery times vary
                    by destination.
                  </p>
                </div>

                <div className="space-y-4">
                  {countryZones.map((zone, index) => (
                    <InternationalZoneCard
                      key={zone.zone}
                      zone={zone}
                      index={index}
                    />
                  ))}
                </div>

                <div className="mt-8 p-5 bg-white rounded-xl border-2 border-amber-200 shadow-lg">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-bold text-stone-800 mb-1">
                        Import Duties & Taxes
                      </p>
                      <p className="text-stone-600 text-sm leading-relaxed">
                        International orders may be subject to import duties and
                        taxes, which are the responsibility of the recipient.
                        These charges are determined by your country&apos;s
                        customs office.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ================================================================= */}
        {/* RETURNS CONTENT */}
        {/* ================================================================= */}
        {activeTab === "returns" && (
          <div className="relative pb-20">
            {/* Return Policy Highlights */}
            <section className="py-12 px-4">
              <div className="container mx-auto max-w-6xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <HighlightCard
                    icon={Calendar}
                    title="30 Days"
                    description="Return window from delivery date"
                    delay={0}
                  />
                  <HighlightCard
                    icon={Truck}
                    title="Free Returns"
                    description="Prepaid return label included"
                    delay={100}
                  />
                  <HighlightCard
                    icon={DollarSign}
                    title="Quick Refund"
                    description="5-7 days after we receive your return"
                    delay={200}
                  />
                </div>
              </div>
            </section>

            {/* Return Process Steps */}
            <section className="py-16 px-4 bg-gradient-to-br from-amber-50 via-amber-100/50 to-amber-50">
              <div className="container mx-auto max-w-5xl">
                <div className="text-center mb-14">
                  <h2 className="text-2xl md:text-3xl font-bold text-stone-800 mb-4">
                    How to Return an Item
                  </h2>
                  <p className="text-stone-600 max-w-lg mx-auto">
                    Follow these simple steps to return your order
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-6">
                  {returnSteps.map((step, index) => (
                    <ReturnStepCard
                      key={step.step}
                      step={step}
                      index={index}
                      total={returnSteps.length}
                    />
                  ))}
                </div>

                <div className="mt-14 text-center">
                  <Link
                    href="/account/orders"
                    className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-2xl shadow-xl shadow-amber-200 hover:shadow-2xl hover:shadow-amber-300 hover:scale-105 transition-all duration-300 group"
                  >
                    <RotateCcw className="w-5 h-5 group-hover:-rotate-180 transition-transform duration-500" />
                    Start a Return
                  </Link>
                </div>
              </div>
            </section>

            {/* Return Conditions */}
            <section className="py-12 px-4">
              <div className="container mx-auto max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Eligible Items */}
                  <div className="p-8 bg-white rounded-2xl border-2 border-stone-200 shadow-xl shadow-stone-100 hover:border-emerald-300 transition-all duration-300 group">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 bg-emerald-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                      </div>
                      <h3 className="text-xl font-bold text-stone-800">
                        Eligible for Return
                      </h3>
                    </div>
                    <ul className="space-y-4">
                      {eligibleItems.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-3 text-stone-700 p-2 rounded-lg hover:bg-emerald-50 transition-colors duration-300"
                        >
                          <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Non-Eligible Items */}
                  <div className="p-8 bg-white rounded-2xl border-2 border-stone-200 shadow-xl shadow-stone-100 hover:border-rose-300 transition-all duration-300 group">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 bg-rose-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <AlertCircle className="w-6 h-6 text-rose-600" />
                      </div>
                      <h3 className="text-xl font-bold text-stone-800">
                        Non-Returnable Items
                      </h3>
                    </div>
                    <ul className="space-y-4">
                      {nonReturnableItems.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-3 text-stone-700 p-2 rounded-lg hover:bg-rose-50 transition-colors duration-300"
                        >
                          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Exchange Information */}
            <section className="py-12 px-4">
              <div className="container mx-auto max-w-4xl">
                <div className="p-8 md:p-10 bg-gradient-to-br from-amber-50 via-amber-100/80 to-amber-50 rounded-3xl border-2 border-amber-200 hover:shadow-xl transition-shadow duration-300">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="p-5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg shadow-amber-200">
                      <RotateCcw className="w-10 h-10 text-white" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-2xl font-bold text-stone-800 mb-3">
                        Prefer an Exchange?
                      </h3>
                      <p className="text-stone-600 leading-relaxed">
                        We offer free exchanges for different sizes or colors of
                        the same item. Simply select &quot;Exchange&quot; during
                        the return process and choose your new item.
                      </p>
                    </div>
                    <Link
                      href="/account/orders"
                      className="group px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 whitespace-nowrap flex items-center gap-2"
                    >
                      Start Exchange
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* NEED HELP SECTION */}
      {/* ================================================================= */}
      <section className="py-20 px-4 border-t-2 border-stone-100 bg-gradient-to-b from-white to-amber-50/30">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#DDA200] rounded-2xl mb-6 shadow-lg shadow-amber-200 hover:scale-110 transition-transform duration-300 cursor-default">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-stone-800 mb-4">
            Need More Help?
          </h2>
          <p className="text-stone-600 mb-10 max-w-lg mx-auto leading-relaxed">
            Our customer support team is available to assist you with any
            shipping or return questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/home/faqs"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border-2 border-amber-500 text-amber-600 font-bold rounded-xl hover:bg-amber-500 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <HelpCircle className="w-5 h-5" />
              View FAQs
            </Link>
            <Link
              href="/home/contact"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#DDA200] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-white hover:text-[#DDA200] transition-all duration-300"
            >
              Contact Support
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
