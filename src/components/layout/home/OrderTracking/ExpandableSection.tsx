import { ExpandableSectionProps } from "@/types/order";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ExpandableSection({
  title,
  icon: Icon,
  children,
  defaultOpen = false,
}: ExpandableSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [isOpen, children]);

  return (
    <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 hover:bg-stone-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-[#DDA200]" />
          <span className="font-bold text-stone-800">{title}</span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-[#DDA200] transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-500 ease-out"
        style={{ maxHeight: isOpen ? `${contentHeight}px` : "0px" }}
      >
        <div ref={contentRef} className="p-6 pt-0 border-t border-stone-100">
          <div className="pt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
