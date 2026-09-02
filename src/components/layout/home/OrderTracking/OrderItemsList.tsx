import useIntersectionObserver from "@/hooks/useIntersectionObserver";
import { OrderItemsListProps } from "@/types/order";
import { formatCurrency } from "@/utils/OrderRelated";
import { Box } from "lucide-react";
import Image from "next/image";

export default function OrderItemsList({ items }: OrderItemsListProps) {
  const [ref, isVisible] = useIntersectionObserver();

  return (
    <div
      ref={ref}
      className={`bg-white rounded-2xl border-2 border-stone-200 p-6 md:p-8
        transition-all duration-500 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
    >
      <h3 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-2">
        <Box className="w-6 h-6 text-[#DDA200]" />
        Order Items ({items.length})
      </h3>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="flex gap-4 p-4 bg-stone-50 rounded-xl hover:bg-[#FFF9E6] 
              transition-all duration-300"
            style={{ transitionDelay: `${index * 50}ms` }}
          >
            {/* Product Image */}
            <div className="w-20 h-20 bg-stone-200 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Details */}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-stone-800 truncate">
                {item.name}
              </h4>
              {item.variant && (
                <p className="text-sm text-stone-500 mt-0.5">{item.variant}</p>
              )}
              <p className="text-xs text-stone-400 mt-1">SKU: {item.sku}</p>
            </div>

            {/* Quantity & Price */}
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-stone-800">
                {formatCurrency(item.price * item.quantity)}
              </p>
              <p className="text-sm text-stone-500">Qty: {item.quantity}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
