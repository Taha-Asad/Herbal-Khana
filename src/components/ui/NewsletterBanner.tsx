// components/newsletter/NewsletterBanner.tsx
"use client";

import React, { useState } from "react";
import { Check, Mail, Send, Loader2, Sparkles } from "lucide-react";
import { subscribeToNewsletter } from "@/app/action/home/newsletter.actions";
import toast from "react-hot-toast";

interface NewsletterBannerProps {
  source?: string;
}

export default function NewsletterBanner({
  source = "banner",
}: NewsletterBannerProps) {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email address");
      toast.error("Please enter your email address");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const result = await subscribeToNewsletter(email.trim(), source);

      if (result.success) {
        setIsSubscribed(true);
        toast.success(result.message);

        // Reset after 5 seconds
        setTimeout(() => {
          setEmail("");
          setIsSubscribed(false);
        }, 5000);
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    } catch (err) {
      const message = "Something went wrong. Please try again.";
      console.log(err);
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-8 sm:py-10 md:py-12 lg:py-16 px-4 sm:px-6 lg:px-8 w-full bg-gradient-to-br from-[#E7D8B1] to-[#F5ECD9]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center">
          {/* Icon */}
          <div
            className="inline-flex items-center justify-center
              w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20
              bg-[#DDA200]
              rounded-full
              mb-4 sm:mb-6
              transition-all duration-300
              hover:scale-110 hover:bg-[#C49A00]
              shadow-lg shadow-[#DDA200]/30"
          >
            <Mail className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-2 sm:mb-3">
            Subscribe to Our Newsletter
          </h2>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8 px-2">
            Join our herbal family and receive exclusive offers, natural beauty
            tips, and updates on new products directly to your inbox.
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
            {[
              "Exclusive Offers",
              "Beauty Tips",
              "New Products",
              "10% Off First Order",
            ].map((benefit) => (
              <span
                key={benefit}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-white/60 
                    backdrop-blur-sm rounded-full text-xs sm:text-sm text-gray-700"
              >
                <Sparkles className="w-3 h-3 text-[#DDA200]" />
                {benefit}
              </span>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Email Input */}
              <div className="flex-1 relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  placeholder="Enter your email address"
                  disabled={isSubscribed || isLoading}
                  className={`w-full px-4 sm:px-6 py-3 sm:py-4 rounded-full 
                    border-2 transition-all duration-300
                    bg-white/90 backdrop-blur-sm
                    placeholder:text-gray-400 text-gray-900
                    disabled:opacity-60 disabled:cursor-not-allowed
                    text-sm sm:text-base
                    ${
                      error
                        ? "border-red-400 focus:border-red-500"
                        : "border-transparent focus:border-[#DDA200]"
                    }
                    focus:outline-none focus:ring-2 focus:ring-[#DDA200]/30`}
                />
                {isSubscribed && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubscribed || isLoading}
                className={`px-6 sm:px-8 py-3 sm:py-4 rounded-full
                  font-semibold transition-all duration-300
                  flex items-center justify-center gap-2 whitespace-nowrap
                  disabled:cursor-not-allowed
                  w-full sm:w-auto
                  text-sm sm:text-base
                  shadow-lg
                  ${
                    isSubscribed
                      ? "bg-green-500 text-white"
                      : isLoading
                      ? "bg-gray-400 text-white"
                      : "bg-gray-900 text-white hover:bg-[#DDA200] hover:shadow-xl hover:shadow-[#DDA200]/30"
                  }`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <span className="hidden sm:inline">Subscribing...</span>
                  </>
                ) : isSubscribed ? (
                  <>
                    <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Subscribed!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Subscribe</span>
                  </>
                )}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
            )}

            {/* Privacy Note */}
            <p className="text-gray-500 text-xs sm:text-sm mt-4 text-center">
              We respect your privacy. Unsubscribe at any time.
              <br className="hidden sm:block" />
              <span className="text-gray-400"> No spam, ever.</span>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
