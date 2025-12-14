"use client";
import { Check, Mail, Send } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

function NewsletterBanner() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubscribed(true);
      toast.success("Successfully subscribed to our newsletter!");

      // Reset after 3 seconds
      setTimeout(() => {
        setEmail("");
        setIsSubscribed(false);
      }, 3000);
    }, 1000);
  };
  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 w-full bg-[#E7D8B1]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div
            className="  inline-flex items-center justify-center
  w-16 h-16
  bg-[#DDA200]
  border-transparent
  rounded-full
  mb-6
  transition-all duration-300
  hover:scale-105 hover:bg-[#E7D8B1] hover:border hover:border-[#DDA200]"
          >
            <Mail className="w-8 h-8 text-white hover:text-[#DDA200]" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-semibold py-3">
            Subscribe to Our Newsletter
          </h2>
          <p className="text-black/60 max-w-2xl mx-auto">
            Join our herbal family and receive exclusive offers, natural beauty
            tips, and updates on new products directly to your inbox.
          </p>
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4 py-4">
              <div className="flex-1 relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  disabled={isSubscribed}
                  className="w-full px-6 py-4 rounded-full border-2 border-black/10 
                           focus:border-[#DDA200] focus:outline-none transition-all
                           bg-white/80 backdrop-blur-sm
                           placeholder:text-black/40 text-black
                           disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {isSubscribed && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Check className="w-6 h-6 text-green-600" />
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubscribed || isLoading}
                className="px-8 py-4 bg-black text-white rounded-full
                         hover:bg-[#DDA200] transition-all duration-300
                         flex items-center justify-center gap-2 whitespace-nowrap
                         disabled:opacity-50 disabled:cursor-not-allowed
                         sm:w-auto w-full shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <div>
                    <Send className="w-5 h-5" />
                  </div>
                ) : isSubscribed ? (
                  <>
                    <Check className="w-5 h-5" />
                    Subscribed!
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Subscribe
                  </>
                )}
              </button>
            </div>

            <p className="text-black/50 text-sm mt-4 text-center">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

export default NewsletterBanner;
