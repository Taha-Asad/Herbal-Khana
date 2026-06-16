import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/home" className="inline-flex items-center gap-2 text-stone-500 hover:text-[#DDA200] transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold text-stone-800 mb-6">Terms of Service</h1>
        <div className="bg-white rounded-xl p-8 shadow-sm space-y-4 text-stone-600">
          <p>These terms and conditions outline the rules and regulations for the use of Herbal Khana's website.</p>
          <h2 className="text-xl font-semibold text-stone-800">1. Introduction</h2>
          <p>By accessing this website, you agree to be bound by these terms of service. If you do not agree, please do not use our service.</p>
          <h2 className="text-xl font-semibold text-stone-800">2. Products</h2>
          <p>All products are subject to availability. We reserve the right to discontinue any product at any time.</p>
          <h2 className="text-xl font-semibold text-stone-800">3. Pricing</h2>
          <p>Prices are subject to change without notice. We reserve the right to modify prices at any time.</p>
          <h2 className="text-xl font-semibold text-stone-800">4. Contact</h2>
          <p>For any questions regarding these terms, please contact our support team.</p>
        </div>
      </div>
    </div>
  );
}
