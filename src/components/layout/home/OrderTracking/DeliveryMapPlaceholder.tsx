import { MapPin, Navigation } from "lucide-react";

export default function DeliveryMapPlaceholder() {
  return (
    <div className="bg-white rounded-2xl border-2 border-stone-200 overflow-hidden">
      <div className="p-6 border-b border-stone-100">
        <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#DDA200]" />
          Delivery Location
        </h3>
      </div>
      <div className="relative h-64 bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#DDA200]/10 rounded-full flex items-center justify-center">
            <Navigation className="w-8 h-8 text-[#DDA200]" />
          </div>
          <p className="text-stone-600 font-medium">Live tracking map</p>
          <p className="text-sm text-stone-500 mt-1">
            Available when package is out for delivery
          </p>
        </div>
        {/* Map Placeholder Pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="grid"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="#DDA200"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>
    </div>
  );
}
