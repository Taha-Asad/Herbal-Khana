import { AddressCardProps } from "@/types/order";
import { Mail, MapPin, Phone, User } from "lucide-react";

export default function AddressCard({
  title,
  icon: Icon,
  address,
}: AddressCardProps) {
  if (!address) {
    return (
      <div className="bg-white rounded-2xl border-2 border-stone-200 p-6">
        <h3 className="text-lg font-bold text-stone-800 mb-2 flex items-center gap-2">
          <Icon className="w-5 h-5 text-[#DDA200]" />
          {title}
        </h3>
        <p className="text-sm text-stone-500">Address not available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 hover:border-[#DDA200]/50 transition-colors duration-300">
      <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
        <Icon className="w-5 h-5 text-[#DDA200]" />
        {title}
      </h3>

      <div className="space-y-3 text-sm">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-stone-400" />
          <span className="font-medium text-stone-800">{address.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-stone-400" />
          <span className="text-stone-600">{address.phone}</span>
        </div>

        {address.email && (
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-stone-400" />
            <span className="text-stone-600">{address.email}</span>
          </div>
        )}

        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-stone-400 mt-0.5" />
          <span className="text-stone-600">
            {address.street}, {address.city}
            {address.state ? `, ${address.state}` : ""} {address.postalCode},{" "}
            {address.country}
          </span>
        </div>
      </div>
    </div>
  );
}
