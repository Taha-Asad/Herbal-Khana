import { OrderSearchFormProps } from "@/types/order";
import { Info, Loader2, Mail, Package, Phone, Search } from "lucide-react";
import { useState } from "react";

export default function OrderSearchForm({
  onSearch,
  isLoading,
}: OrderSearchFormProps) {
  const [orderId, setOrderId] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [searchType, setSearchType] = useState<"email" | "phone">("email");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    onSearch({
      orderId: orderId.trim(),
      ...(searchType === "email"
        ? { email: contactInfo.trim() }
        : { phone: contactInfo.trim() }),
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Order ID Input */}
        <div>
          <label
            htmlFor="orderId"
            className="block text-sm font-semibold text-stone-700 mb-2"
          >
            Order ID <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Package className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              id="orderId"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g., ORD-2024-78542"
              className="w-full pl-12 pr-4 py-4 border-2 border-stone-200 rounded-xl 
                focus:border-[#DDA200] focus:ring-4 focus:ring-[#DDA200]/10 
                outline-none transition-all duration-300 text-stone-800
                placeholder:text-stone-400"
              required
            />
          </div>
        </div>

        {/* Contact Type Toggle */}
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-2">
            Verify with
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setSearchType("email")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl 
                border-2 font-medium transition-all duration-300 ${
                  searchType === "email"
                    ? "border-[#DDA200] bg-[#DDA200]/10 text-[#b38600]"
                    : "border-stone-200 text-stone-600 hover:border-stone-300"
                }`}
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
            <button
              type="button"
              onClick={() => setSearchType("phone")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl 
                border-2 font-medium transition-all duration-300 ${
                  searchType === "phone"
                    ? "border-[#DDA200] bg-[#DDA200]/10 text-[#b38600]"
                    : "border-stone-200 text-stone-600 hover:border-stone-300"
                }`}
            >
              <Phone className="w-4 h-4" />
              Phone
            </button>
          </div>
        </div>

        {/* Contact Info Input */}
        <div>
          <label
            htmlFor="contactInfo"
            className="block text-sm font-semibold text-stone-700 mb-2"
          >
            {searchType === "email" ? "Email Address" : "Phone Number"}
          </label>
          <div className="relative">
            {searchType === "email" ? (
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            ) : (
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            )}
            <input
              type={searchType === "email" ? "email" : "tel"}
              id="contactInfo"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder={
                searchType === "email" ? "your@email.com" : "+92 300 1234567"
              }
              className="w-full pl-12 pr-4 py-4 border-2 border-stone-200 rounded-xl 
                focus:border-[#DDA200] focus:ring-4 focus:ring-[#DDA200]/10 
                outline-none transition-all duration-300 text-stone-800
                placeholder:text-stone-400"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !orderId.trim()}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 
            bg-gradient-to-r from-[#DDA200] to-[#b38600] text-white font-bold 
            rounded-xl shadow-lg shadow-[#DDA200]/30 hover:shadow-xl 
            hover:shadow-[#DDA200]/40 disabled:opacity-60 disabled:cursor-not-allowed
            transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              Track Order
            </>
          )}
        </button>
      </form>

      {/* Quick Tips */}
      <div className="mt-8 p-4 bg-[#FFF9E6] rounded-xl border border-[#f3e4b7]">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[#DDA200] mt-0.5 flex-shrink-0" />
          <div className="text-sm text-stone-600">
            <p className="font-semibold text-stone-700 mb-1">
              Where to find your Order ID?
            </p>
            <p>
              Check your order confirmation email or SMS. The Order ID starts
              with &quot;ORD-&quot;.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
