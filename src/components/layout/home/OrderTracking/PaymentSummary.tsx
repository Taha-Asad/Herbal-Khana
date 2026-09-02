import { PaymentSummaryProps } from "@/types/order";
import { formatCurrency } from "@/utils/OrderRelated";
import { CreditCard } from "lucide-react";

export default function PaymentSummary({ order }: PaymentSummaryProps) {
  return (
    <div className="bg-white rounded-2xl border-2 border-stone-200 p-6">
      <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-[#DDA200]" />
        Payment Summary
      </h3>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-stone-600">Subtotal</span>
          <span className="text-stone-800">
            {formatCurrency(order.subtotal)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-600">Shipping</span>
          <span className="text-stone-800">
            {order.shippingCost === 0 ? (
              <span className="text-green-600 font-medium">Free</span>
            ) : (
              formatCurrency(order.shippingCost)
            )}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-stone-600">Tax</span>
          <span className="text-stone-800">{formatCurrency(order.tax)}</span>
        </div>
        {order.discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span>-{formatCurrency(order.discount)}</span>
          </div>
        )}
        <div className="border-t-2 border-stone-100 pt-3 flex justify-between">
          <span className="font-bold text-stone-800">Total</span>
          <span className="font-bold text-[#DDA200] text-lg">
            {formatCurrency(order.total)}
          </span>
        </div>
        <div className="pt-3 flex items-center gap-2 text-stone-600">
          <CreditCard className="w-4 h-4" />
          <span>{order.paymentMethod}</span>
        </div>
      </div>
    </div>
  );
}
