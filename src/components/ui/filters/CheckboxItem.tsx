import { Check } from "lucide-react";

export default function CheckboxItem({
  name,
  count,
  checked,
  onChange,
}: {
  id: string;
  name: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      onClick={onChange}
      className="flex items-center gap-3 py-2 cursor-pointer group hover:bg-stone-50 px-2 rounded-lg transition-colors"
    >
      <div
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
          checked
            ? "border-[#DDA200] bg-[#DDA200]"
            : "border-stone-300 group-hover:border-[#DDA200]/60"
        }`}
      >
        {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </div>

      <span
        className={`flex-1 text-sm transition-colors ${
          checked ? "text-stone-800 font-medium" : "text-stone-600"
        }`}
      >
        {name}
      </span>

      {count !== undefined && (
        <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </label>
  );
}
