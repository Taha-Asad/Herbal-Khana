import { FileText, HelpCircle, Mail, Phone } from "lucide-react";
import Link from "next/link";

export default function NeedHelpSection() {
  return (
    <div className="bg-gradient-to-br from-[#FFF9E6] to-[#F7E4B2] rounded-2xl border border-[#f3e4b7] p-8">
      <div className="text-center mb-8">
        <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-[#DDA200] to-[#b38600] rounded-2xl flex items-center justify-center shadow-lg shadow-[#DDA200]/30">
          <HelpCircle className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-xl font-bold text-stone-800">Need Help?</h3>
        <p className="text-stone-600 mt-2">
          Our support team is here to assist you with any questions.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/contact"
          className="flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-xl border border-stone-200 font-medium text-stone-700 hover:border-[#DDA200] hover:text-[#DDA200] transition-all duration-300 hover:shadow-lg"
        >
          <Mail className="w-5 h-5" />
          Email Us
        </Link>
        <Link
          href="tel:+923001234567"
          className="flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-xl border border-stone-200 font-medium text-stone-700 hover:border-[#DDA200] hover:text-[#DDA200] transition-all duration-300 hover:shadow-lg"
        >
          <Phone className="w-5 h-5" />
          Call Support
        </Link>
        <Link
          href="/faqs"
          className="flex items-center justify-center gap-2 px-4 py-3 bg-white 
            rounded-xl border border-stone-200 font-medium text-stone-700
            hover:border-[#DDA200] hover:text-[#DDA200] transition-all duration-300
            hover:shadow-lg"
        >
          <FileText className="w-5 h-5" />
          View FAQs
        </Link>
      </div>
    </div>
  );
}
