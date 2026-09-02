"use client";

import { Sparkles, Sun, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
const theme = {
  primary: "#DDA200",
  primaryDark: "#b38600",
  primaryLight: "#FFF9E6",
  primaryHover: "#c89200",
  accent: "#FFF8E1",
  success: "#10b981",
  error: "#ef4444",
  warning: "#f59e0b",
};
export default function PromotionalBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = useMemo(
    () => [
      {
        title: "Summer Sale",
        subtitle: "Up to 30% Off on All Facial Oils",
        cta: "Shop Now",
        bgGradient: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`,
        icon: Sun,
      },
      {
        title: "New Arrivals",
        subtitle: "Discover Our Latest Herbal Serums",
        cta: "Explore",
        bgGradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        icon: Sparkles,
      },
      {
        title: "Free Shipping",
        subtitle: "On Orders Above Rs 3,000",
        cta: "Learn More",
        bgGradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
        icon: Truck,
      },
    ],
    []
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div
      className="relative mt-30 overflow-hidden rounded-2xl p-6 md:p-8 text-white transition-all duration-500 shadow-lg"
      style={{ background: slide.bgGradient }}
    >
      {/* Decorative Elements */}
      <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute left-0 bottom-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Icon className="w-8 h-8" />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold">{slide.title}</h2>
            <p className="text-white/90">{slide.subtitle}</p>
          </div>
        </div>
        <button className="px-6 py-3 bg-white text-stone-800 font-bold rounded-xl hover:bg-stone-100 transition-colors shadow-md">
          {slide.cta}
        </button>
      </div>

      {/* Dots Navigation */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentSlide ? "bg-white w-6" : "bg-white/50 w-2"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
