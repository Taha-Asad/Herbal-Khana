import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-stone-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/home" className="inline-flex items-center gap-2 text-stone-500 hover:text-[#DDA200] transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-bold text-stone-800 mb-6">Privacy Policy</h1>
        <div className="bg-white rounded-xl p-8 shadow-sm space-y-4 text-stone-600">
          <p>Your privacy is important to us. This policy outlines how we collect, use, and protect your information.</p>
          <h2 className="text-xl font-semibold text-stone-800">1. Information We Collect</h2>
          <p>We collect information you provide when registering, placing an order, or contacting us.</p>
          <h2 className="text-xl font-semibold text-stone-800">2. How We Use Your Information</h2>
          <p>We use your information to process orders, improve our service, and communicate with you.</p>
          <h2 className="text-xl font-semibold text-stone-800">3. Data Protection</h2>
          <p>We implement security measures to protect your personal information.</p>
          <h2 className="text-xl font-semibold text-stone-800">4. Contact</h2>
          <p>For questions about this policy, please contact our support team.</p>
        </div>
      </div>
    </div>
  );
}
