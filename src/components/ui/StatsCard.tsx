import React from "react";
import { IconType } from "react-icons";
interface statsProp {
  id: number;
  Icon: IconType;
  title: string;
  content: string | React.ReactElement;
  position: "center" | "left";
}
function StatsCard({ id, Icon, title, content, position }: statsProp) {
  return (
    <div
      className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all border border-black/5 group duration:800 relative overflow-hidden"
      key={id}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#DDA200]/5 to-transparent opacity-0 duration:300 group-hover:opacity-100 transition-opacity" />

      <div
        className={`w-16 h-16 bg-gradient-to-br from-[#DDA200]/20 to-[#DDA200]/10 
  rounded-2xl flex items-center justify-center mb-6 
  duration-300 group-hover:from-[#DDA200] group-hover:to-[#c99000]
  hover:rotate-360 transition-all shadow-md group-hover:shadow-xl relative z-10
  ${position === "center" ? "mx-auto" : "ml-0"}`}
      >
        <Icon className="w-8 h-8 text-[#DDA200] duration-300 group-hover:text-white transition-colors" />
      </div>

      <div className="py-4">
        <div className="font-bold text-xl mb-2">{title}</div>
        <p className="text-gray-500 text-base">{content}</p>
      </div>
    </div>
  );
}

export default StatsCard;
