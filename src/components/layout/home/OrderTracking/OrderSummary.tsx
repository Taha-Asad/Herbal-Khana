import useCopyToClipboard from "@/hooks/useCopyToClipboard";
import useIntersectionObserver from "@/hooks/useIntersectionObserver";
import { OrderSummaryProps } from "@/types/order";
import { formatDate } from "@/utils/FormatDate";
import {
  Calendar,
  CheckCircle,
  Clock,
  Copy,
  ExternalLink,
  Package,
  Truck,
} from "lucide-react";
import StatusBadge from "./StatusBadge";

export default function OrderSummary({ order }: OrderSummaryProps) {
  const [copied, copy] = useCopyToClipboard();
  const [ref, isVisible] = useIntersectionObserver();

  return (
    <div
      ref={ref}
      className={`bg-white rounded-2xl border-2 border-stone-200 overflow-hidden
        transition-all duration-500 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#DDA200] to-[#b38600] p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-white/80 text-sm mb-1">Order ID</p>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">{order.orderId}</h2>
              <button
                onClick={() => copy(order.orderId)}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                title="Copy Order ID"
              >
                {copied ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          <StatusBadge status={order.status} size="lg" />
        </div>
      </div>

      {/* Order Info Grid */}
      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div>
          <p className="text-sm text-stone-500 mb-1 flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Order Date
          </p>
          <p className="font-semibold text-stone-800">
            {formatDate(order.orderDate)}
          </p>
        </div>
        <div>
          <p className="text-sm text-stone-500 mb-1 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Est. Delivery
          </p>
          <p className="font-semibold text-stone-800">
            {formatDate(order.estimatedDelivery)}
          </p>
        </div>
        <div>
          <p className="text-sm text-stone-500 mb-1 flex items-center gap-1">
            <Truck className="w-4 h-4" />
            Carrier
          </p>
          <p className="font-semibold text-stone-800">
            {order.carrier || "N/A"}
          </p>
        </div>
        <div>
          <p className="text-sm text-stone-500 mb-1 flex items-center gap-1">
            <Package className="w-4 h-4" />
            Tracking #
          </p>
          <div className="flex items-center gap-1">
            <p className="font-semibold text-stone-800">
              {order.trackingNumber || "N/A"}
            </p>
            {order.carrierUrl && (
              <a
                href={order.carrierUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-[#DDA200] hover:bg-[#DDA200]/10 rounded"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
