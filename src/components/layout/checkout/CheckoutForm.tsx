// components/checkout/CheckoutForm.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Truck,
  CreditCard,
  Check,
  Loader2,
  Shield,
} from "lucide-react";
import {
  CheckoutState,
  CheckoutAddress,
  ShippingMethodOption,
  PaymentMethod,
  CreateOrderInput,
} from "@/types/checkout";
import AddressSelector from "./AddressSelector";
import AddressForm from "./AddressForm";
import ShippingMethodSelector from "./ShippingMethodSelector";
import PaymentMethodSelector from "./PaymentMethodSelector";
import CheckoutOrderSummary from "./CheckoutOrderSummary";
import Image from "next/image";
import { createOrder } from "@/app/action/home/orders.action";

interface CheckoutFormProps {
  initialData: CheckoutState;
  savedAddresses: CheckoutAddress[];
  shippingMethods: ShippingMethodOption[];
  cartId: string;
  onAddressSave: (
    address: Omit<CheckoutAddress, "id">
  ) => Promise<CheckoutAddress | null>;
  onPromoApply: (
    code: string
  ) => Promise<{ success: boolean; discount?: number; message?: string }>;
  onPromoRemove: () => Promise<void>;
}

type CheckoutStep = "address" | "shipping" | "payment" | "review";

const STEPS: { key: CheckoutStep; label: string; icon: React.ElementType }[] = [
  { key: "address", label: "Address", icon: MapPin },
  { key: "shipping", label: "Shipping", icon: Truck },
  { key: "payment", label: "Payment", icon: CreditCard },
  { key: "review", label: "Review", icon: Check },
];

export default function CheckoutForm({
  initialData,
  savedAddresses,
  shippingMethods,
  cartId,
  onAddressSave,
  onPromoApply,
  onPromoRemove,
}: CheckoutFormProps) {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("address");
  const [checkoutData, setCheckoutData] = useState<CheckoutState>(initialData);
  const [addresses, setAddresses] = useState(savedAddresses);
  const [showNewAddressForm, setShowNewAddressForm] = useState(
    savedAddresses.length === 0
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Promo code state
  const [promoInput, setPromoInput] = useState("");
  const [promoMessage, setPromoMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const currentStepIndex = STEPS.findIndex((s) => s.key === currentStep);

  // Calculate updated summary
  const calculateSummary = (
    shipping: ShippingMethodOption | null = checkoutData.shippingMethod,
    paymentMethod: PaymentMethod | null = checkoutData.paymentMethod
  ) => {
    const subtotal = checkoutData.items.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );

    let shippingCost = shipping?.price || 0;

    if (shipping?.freeAbove && subtotal >= shipping.freeAbove) {
      shippingCost = 0;
    }

    if (paymentMethod === "cod") {
      shippingCost += 50;
    }

    const promoDiscount = checkoutData.summary.promoDiscount;
    const total = subtotal + shippingCost - promoDiscount;

    return {
      ...checkoutData.summary,
      shippingCost,
      total,
    };
  };

  // Handle address selection
  const handleAddressSelect = (address: CheckoutAddress) => {
    setCheckoutData((prev) => ({
      ...prev,
      shippingAddress: address,
      billingAddress: prev.sameAsShipping ? address : prev.billingAddress,
    }));
    setShowNewAddressForm(false);
    setError(null);
  };

  // Handle new address save
  const handleSaveNewAddress = async (address: Omit<CheckoutAddress, "id">) => {
    setIsSavingAddress(true);
    try {
      const savedAddress = await onAddressSave(address);
      if (savedAddress) {
        setAddresses((prev) => [savedAddress, ...prev]);
        handleAddressSelect(savedAddress);
      }
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Handle shipping method selection
  const handleShippingSelect = (method: ShippingMethodOption) => {
    const newSummary = calculateSummary(method, checkoutData.paymentMethod);
    setCheckoutData((prev) => ({
      ...prev,
      shippingMethod: method,
      summary: newSummary,
    }));
  };

  // Handle payment method selection
  const handlePaymentSelect = (method: PaymentMethod) => {
    const newSummary = calculateSummary(checkoutData.shippingMethod, method);
    setCheckoutData((prev) => ({
      ...prev,
      paymentMethod: method,
      summary: newSummary,
    }));
  };

  // Apply promo code
  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;

    setIsApplyingPromo(true);
    setPromoMessage(null);

    const result = await onPromoApply(promoInput.trim());

    if (result.success && result.discount !== undefined) {
      setCheckoutData((prev) => ({
        ...prev,
        summary: {
          ...prev.summary,
          promoDiscount: result.discount!,
          total:
            prev.summary.subtotal +
            prev.summary.shippingCost -
            result.discount!,
          appliedPromoCode: promoInput.trim().toUpperCase(),
        },
      }));
      setPromoMessage({ type: "success", text: result.message! });
      setPromoInput("");
    } else {
      setPromoMessage({ type: "error", text: result.message! });
    }

    setIsApplyingPromo(false);
  };

  // Remove promo code
  const handleRemovePromo = async () => {
    await onPromoRemove();
    setCheckoutData((prev) => ({
      ...prev,
      summary: {
        ...prev.summary,
        promoDiscount: 0,
        total: prev.summary.subtotal + prev.summary.shippingCost,
        appliedPromoCode: undefined,
      },
    }));
    setPromoMessage(null);
  };

  // Validate current step
  const validateStep = (): boolean => {
    setError(null);

    switch (currentStep) {
      case "address":
        if (!checkoutData.shippingAddress) {
          setError("Please select or add a shipping address");
          return false;
        }
        return true;

      case "shipping":
        if (!checkoutData.shippingMethod) {
          setError("Please select a shipping method");
          return false;
        }
        return true;

      case "payment":
        if (!checkoutData.paymentMethod) {
          setError("Please select a payment method");
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  // Navigate to next step
  const handleNextStep = () => {
    if (!validateStep()) return;

    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].key);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Navigate to previous step
  const handlePrevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].key);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Submit order
  const handlePlaceOrder = async () => {
    if (!validateStep()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const input: CreateOrderInput = {
        cartId,
        shippingAddressId: checkoutData.shippingAddress?.id,
        shippingAddress: checkoutData.shippingAddress?.id
          ? undefined
          : (checkoutData.shippingAddress as Omit<CheckoutAddress, "id">),
        sameAsShipping: checkoutData.sameAsShipping,
        billingAddressId: checkoutData.sameAsShipping
          ? undefined
          : checkoutData.billingAddress?.id,
        billingAddress:
          checkoutData.sameAsShipping || checkoutData.billingAddress?.id
            ? undefined
            : (checkoutData.billingAddress as Omit<CheckoutAddress, "id">),
        shippingMethodId: checkoutData.shippingMethod!.id,
        paymentMethod: checkoutData.paymentMethod!,
        promoCode: checkoutData.summary.appliedPromoCode,
        customerNote: checkoutData.customerNote,
      };

      const result = await createOrder(input);

      if (result.success) {
        router.push(`/home/checkout/confirmation?order=${result.orderId}`);
      } else {
        setError(result.message || "Failed to place order");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
      console.log(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - Step Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 md:gap-4 p-4 bg-white rounded-xl border border-stone-200">
          {STEPS.map((step, index) => (
            <React.Fragment key={step.key}>
              <button
                onClick={() =>
                  index < currentStepIndex && setCurrentStep(step.key)
                }
                disabled={index > currentStepIndex}
                className={`flex items-center gap-2 transition-all ${
                  index === currentStepIndex
                    ? "text-[#DDA200]"
                    : index < currentStepIndex
                    ? "text-green-600 cursor-pointer"
                    : "text-stone-400 cursor-not-allowed"
                }`}
              >
                <div
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all ${
                    index === currentStepIndex
                      ? "bg-[#DDA200] text-white"
                      : index < currentStepIndex
                      ? "bg-green-600 text-white"
                      : "bg-stone-200 text-stone-400"
                  }`}
                >
                  {index < currentStepIndex ? (
                    <Check className="w-4 h-4 md:w-5 md:h-5" />
                  ) : (
                    <step.icon className="w-4 h-4 md:w-5 md:h-5" />
                  )}
                </div>
                <span className="hidden md:block font-medium text-sm">
                  {step.label}
                </span>
              </button>
              {index < STEPS.length - 1 && (
                <div
                  className={`w-8 md:w-12 h-0.5 ${
                    index < currentStepIndex ? "bg-green-600" : "bg-stone-200"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <div className="w-5 h-5 text-red-500">⚠️</div>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Step: Address */}
        {currentStep === "address" && (
          <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 md:p-8">
            <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-3">
              <MapPin className="w-6 h-6 text-[#DDA200]" />
              Shipping Address
            </h2>

            {!showNewAddressForm && addresses.length > 0 ? (
              <>
                <AddressSelector
                  addresses={addresses}
                  selectedId={checkoutData.shippingAddress?.id}
                  onSelect={handleAddressSelect}
                />
                <button
                  onClick={() => setShowNewAddressForm(true)}
                  className="mt-4 text-[#DDA200] hover:text-[#b38600] font-medium flex items-center gap-2"
                >
                  <span>+ Add New Address</span>
                </button>
              </>
            ) : (
              <>
                <AddressForm
                  onSubmit={handleSaveNewAddress}
                  isLoading={isSavingAddress}
                />
                {addresses.length > 0 && (
                  <button
                    onClick={() => setShowNewAddressForm(false)}
                    className="mt-4 text-stone-600 hover:text-stone-800 font-medium"
                  >
                    ← Back to saved addresses
                  </button>
                )}
              </>
            )}

            <div className="mt-6 pt-6 border-t border-stone-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkoutData.sameAsShipping}
                  onChange={(e) =>
                    setCheckoutData((prev) => ({
                      ...prev,
                      sameAsShipping: e.target.checked,
                      billingAddress: e.target.checked
                        ? prev.shippingAddress
                        : null,
                    }))
                  }
                  className="w-5 h-5 rounded border-stone-300 text-[#DDA200] focus:ring-[#DDA200]"
                />
                <span className="text-stone-700">
                  Billing address same as shipping
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Step: Shipping */}
        {currentStep === "shipping" && (
          <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 md:p-8">
            <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-3">
              <Truck className="w-6 h-6 text-[#DDA200]" />
              Shipping Method
            </h2>

            <ShippingMethodSelector
              methods={shippingMethods}
              selectedId={checkoutData.shippingMethod?.id}
              subtotal={checkoutData.summary.subtotal}
              onSelect={handleShippingSelect}
            />
          </div>
        )}

        {/* Step: Payment */}
        {currentStep === "payment" && (
          <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 md:p-8">
            <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-3">
              <CreditCard className="w-6 h-6 text-[#DDA200]" />
              Payment Method
            </h2>

            <PaymentMethodSelector
              selected={checkoutData.paymentMethod}
              onSelect={handlePaymentSelect}
              total={checkoutData.summary.total}
            />

            {checkoutData.paymentMethod &&
              checkoutData.paymentMethod !== "cod" && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-800">
                    <strong>Note:</strong> After placing your order, you will
                    need to make the payment and upload the screenshot as proof.
                    Your order will be confirmed once we verify the payment.
                  </p>
                </div>
              )}
          </div>
        )}

        {/* Step: Review */}
        {currentStep === "review" && (
          <div className="space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 md:p-8">
              <h2 className="text-xl font-bold text-stone-800 mb-6">
                Order Items
              </h2>
              <div className="space-y-4">
                {checkoutData.items.map((item) => (
                  <div
                    key={item.variantId}
                    className="flex gap-4 p-4 bg-stone-50 rounded-xl"
                  >
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-stone-800">
                        {item.name}
                      </h4>
                      <p className="text-sm text-stone-600">
                        {item.variantName}
                      </p>
                      <p className="text-sm text-stone-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-stone-800">
                        PKR {item.subtotal.toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border-2 border-stone-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-stone-800">Shipping To</h3>
                  <button
                    onClick={() => setCurrentStep("address")}
                    className="text-[#DDA200] text-sm font-medium hover:underline"
                  >
                    Edit
                  </button>
                </div>
                {checkoutData.shippingAddress && (
                  <div className="text-sm text-stone-600 space-y-1">
                    <p className="font-medium text-stone-800">
                      {checkoutData.shippingAddress.name}
                    </p>
                    <p>{checkoutData.shippingAddress.line1}</p>
                    <p>
                      {checkoutData.shippingAddress.city},{" "}
                      {checkoutData.shippingAddress.state}{" "}
                      {checkoutData.shippingAddress.postal}
                    </p>
                    <p>{checkoutData.shippingAddress.phone}</p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border-2 border-stone-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-stone-800">Payment</h3>
                  <button
                    onClick={() => setCurrentStep("payment")}
                    className="text-[#DDA200] text-sm font-medium hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <p className="font-medium text-stone-800">
                  {checkoutData.paymentMethod === "cod"
                    ? "Cash on Delivery"
                    : checkoutData.paymentMethod === "jazzcash"
                    ? "JazzCash"
                    : "EasyPaisa"}
                </p>
              </div>
            </div>

            {/* Customer Note */}
            <div className="bg-white rounded-2xl border-2 border-stone-200 p-6">
              <h3 className="font-bold text-stone-800 mb-4">
                Order Notes (Optional)
              </h3>
              <textarea
                value={checkoutData.customerNote || ""}
                onChange={(e) =>
                  setCheckoutData((prev) => ({
                    ...prev,
                    customerNote: e.target.value,
                  }))
                }
                placeholder="Any special instructions for your order..."
                className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-[#DDA200] focus:outline-none resize-none"
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4">
          {currentStepIndex > 0 ? (
            <button
              onClick={handlePrevStep}
              className="flex items-center gap-2 px-6 py-3 text-stone-600 font-medium hover:text-stone-800 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          ) : (
            <div />
          )}

          {currentStep === "review" ? (
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#DDA200] to-[#b38600] text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Place Order
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleNextStep}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#DDA200] to-[#b38600] text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Right Column - Order Summary */}
      <div className="lg:col-span-1">
        <div className="sticky top-32">
          <CheckoutOrderSummary
            items={checkoutData.items}
            summary={checkoutData.summary}
            promoInput={promoInput}
            onPromoInputChange={setPromoInput}
            onApplyPromo={handleApplyPromo}
            onRemovePromo={handleRemovePromo}
            isApplyingPromo={isApplyingPromo}
            promoMessage={promoMessage}
            shippingMethod={checkoutData.shippingMethod}
            paymentMethod={checkoutData.paymentMethod}
          />
        </div>
      </div>
    </div>
  );
}
