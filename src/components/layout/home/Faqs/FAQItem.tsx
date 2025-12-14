"use client";
import { FAQ } from "@/types/faq";
import { ChevronDown, ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";

export default function FAQItem({
  faq,
  isOpen,
  onToggle,
}: {
  faq: FAQ;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const [helpfulClicked, setHelpfulClicked] = useState<"yes" | "no" | null>(
    null
  );

  return (
    <div
      className={`
        border rounded-xl overflow-hidden transition-all duration-300
        ${
          isOpen
            ? "border-[#DDA200] shadow-lg shadow-[#DDA200]/10"
            : "border-[#e5d9b6] hover:border-[#DDA200]/50"
        }
      `}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-[#FFF9E6]/50 transition-colors"
      >
        <span
          className={`font-semibold pr-4 ${
            isOpen ? "text-[#DDA200]" : "text-gray-800"
          }`}
        >
          {faq.question}
        </span>
        <ChevronDown
          className={`w-5 h-5 flex-shrink-0 text-[#DDA200] transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="p-5 pt-0 bg-white">
          <div className="pt-4 border-t border-[#f3e4b7]">
            <p className="text-gray-600 leading-relaxed">{faq.answer}</p>

            {/* Helpful Feedback */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#f3e4b7]">
              <span className="text-sm text-gray-500">Was this helpful?</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setHelpfulClicked("yes");
                  }}
                  disabled={helpfulClicked !== null}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all duration-300 ${
                    helpfulClicked === "yes"
                      ? "bg-green-100 text-green-600"
                      : helpfulClicked === null
                      ? "bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>
                    {(faq.helpful || 0) + (helpfulClicked === "yes" ? 1 : 0)}
                  </span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setHelpfulClicked("no");
                  }}
                  disabled={helpfulClicked !== null}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all duration-300 ${
                    helpfulClicked === "no"
                      ? "bg-red-100 text-red-600"
                      : helpfulClicked === null
                      ? "bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  <ThumbsDown className="w-4 h-4" />
                  <span>
                    {(faq.notHelpful || 0) + (helpfulClicked === "no" ? 1 : 0)}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
