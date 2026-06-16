// app/checkout/CheckoutClient.tsx
"use client";

import React, { ComponentType, SVGProps, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Truck,
  CreditCard,
  Check,
  Loader2,
  Shield,
  Package,
  AlertCircle,
  X,
} from "lucide-react";
import {
  CheckoutState,
  CheckoutAddress,
  ShippingMethodOption,
  PaymentMethod,
  CreateOrderInput,
} from "@/types/checkout";
import {
  saveAddress,
  validatePromoCode,
  removePromoCodeFromCart,
} from "@/app/action/home/checkout.actions";
import { createOrder } from "@/app/action/home/orders.action";
import AddressSelector from "@/components/layout/checkout/AddressSelector";
import AddressForm from "@/components/layout/checkout/AddressForm";
import ShippingMethodSelector from "@/components/layout/checkout/ShippingMethodSelector";
import PaymentMethodSelector from "@/components/layout/checkout/PaymentMethodSelector";
import CheckoutOrderSummary from "@/components/layout/checkout/CheckoutOrderSummary";

interface CheckoutClientProps {
  initialData: CheckoutState;
  savedAddresses: CheckoutAddress[];
  shippingMethods: ShippingMethodOption[];
  userEmail: string;
}

type CheckoutStep = "address" | "shipping" | "payment" | "review";

const STEPS: {
  key: CheckoutStep;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}[] = [
  { key: "address", label: "Address", icon: MapPin },
  { key: "shipping", label: "Shipping", icon: Truck },
  { key: "payment", label: "Payment", icon: CreditCard },
  { key: "review", label: "Review", icon: Check },
];

const COD_FEE = 50; // PKR 50 COD fee

export default function CheckoutClient({
  initialData,
  savedAddresses,
  shippingMethods,
  userEmail,
}: CheckoutClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>("address");
  const [checkoutData, setCheckoutData] = useState<CheckoutState>(initialData);
  const [addresses, setAddresses] = useState(savedAddresses);
  const [showNewAddressForm, setShowNewAddressForm] = useState(
    savedAddresses.length === 0
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Promo code state
  const [promoInput, setPromoInput] = useState("");
  const [promoMessage, setPromoMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const currentStepIndex = STEPS.findIndex((s) => s.key === currentStep);

  // Calculate updated summary when shipping or payment changes
  const calculateSummary = (
    shipping: ShippingMethodOption | null = checkoutData.shippingMethod,
    paymentMethod: PaymentMethod | null = checkoutData.paymentMethod
  ) => {
    const subtotal = checkoutData.items.reduce(
      (sum, item) => sum + item.subtotal,
      0
    );

    let shippingCost = shipping?.price || 0;

    // Check for free shipping
    if (shipping?.freeAbove && subtotal >= shipping.freeAbove) {
      shippingCost = 0;
    }

    // Add COD fee
    if (paymentMethod === "cod") {
      shippingCost += COD_FEE;
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
    startTransition(async () => {
      const result = await saveAddress(address, addresses.length === 0);
      if (result.success && result.data) {
        setAddresses((prev) => [result.data!, ...prev]);
        handleAddressSelect(result.data);
      } else {
        setError(result.error || "Failed to save address");
      }
    });
  };

  // Handle shipping method selection
  const handleShippingSelect = (method: ShippingMethodOption) => {
    const newSummary = calculateSummary(method, checkoutData.paymentMethod);
    setCheckoutData((prev) => ({
      ...prev,
      shippingMethod: method,
      summary: newSummary,
    }));
    setError(null);
  };

  // Handle payment method selection
  const handlePaymentSelect = (method: PaymentMethod) => {
    const newSummary = calculateSummary(checkoutData.shippingMethod, method);
    setCheckoutData((prev) => ({
      ...prev,
      paymentMethod: method,
      summary: newSummary,
    }));
    setError(null);
  };

  // Apply promo code
  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;

    setIsApplyingPromo(true);
    setPromoMessage(null);

    const result = await validatePromoCode(
      promoInput.trim(),
      checkoutData.summary.subtotal
    );

    if (result.success) {
      const newSummary = {
        ...checkoutData.summary,
        promoDiscount: result.discount!,
        total:
          checkoutData.summary.subtotal +
          checkoutData.summary.shippingCost -
          result.discount!,
        appliedPromoCode: promoInput.trim().toUpperCase(),
      };

      setCheckoutData((prev) => ({
        ...prev,
        summary: newSummary,
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
    await removePromoCodeFromCart();

    const newSummary = {
      ...checkoutData.summary,
      promoDiscount: 0,
      total: checkoutData.summary.subtotal + checkoutData.summary.shippingCost,
      appliedPromoCode: undefined,
    };

    setCheckoutData((prev) => ({
      ...prev,
      summary: newSummary,
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

    // Final validation
    if (!checkoutData.shippingAddress) {
      setError("Shipping address is required");
      setCurrentStep("address");
      return;
    }

    if (!checkoutData.shippingMethod) {
      setError("Shipping method is required");
      setCurrentStep("shipping");
      return;
    }

    if (!checkoutData.paymentMethod) {
      setError("Payment method is required");
      setCurrentStep("payment");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const input: CreateOrderInput = {
        cartId: checkoutData.cartId,
        shippingAddressId: checkoutData.shippingAddress.id,
        shippingAddress: checkoutData.shippingAddress.id
          ? undefined
          : checkoutData.shippingAddress,
        sameAsShipping: checkoutData.sameAsShipping,
        billingAddressId: checkoutData.sameAsShipping
          ? undefined
          : checkoutData.billingAddress?.id,
        billingAddress:
          checkoutData.sameAsShipping || checkoutData.billingAddress?.id
            ? undefined
            : checkoutData.billingAddress || undefined,
        shippingMethodId: checkoutData.shippingMethod.id,
        paymentMethod: checkoutData.paymentMethod,
        promoCode: checkoutData.summary.appliedPromoCode,
        customerNote: checkoutData.customerNote,
      };

      const result = await createOrder(input);

      if (result.success) {
        router.push(`/home/checkout/confirmation?order=${result.orderId}`);
      } else {
        setError(result.message || "Failed to place order. Please try again.");
      }
    } catch (err) {
      console.error("Order error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen pt-40 pb-10 bg-gradient-to-br from-white via-[#FFF8E1]/30 to-white">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-stone-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/home/cart"
              className="flex items-center gap-2 text-stone-600 hover:text-[#DDA200] transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-medium">Back to Cart</span>
            </Link>
            <h1 className="text-xl font-bold text-stone-800">Checkout</h1>
            <div className="w-24" />
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-stone-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-4 md:gap-8">
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
                      ? "text-green-600 cursor-pointer hover:text-green-700"
                      : "text-stone-400 cursor-not-allowed"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      index === currentStepIndex
                        ? "bg-[#DDA200] text-white shadow-lg shadow-[#DDA200]/30"
                        : index < currentStepIndex
                        ? "bg-green-600 text-white"
                        : "bg-stone-200 text-stone-400"
                    }`}
                  >
                    {index < currentStepIndex ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="hidden md:block font-medium">
                    {step.label}
                  </span>
                </button>
                {index < STEPS.length - 1 && (
                  <div
                    className={`hidden md:block w-16 h-0.5 transition-colors ${
                      index < currentStepIndex ? "bg-green-600" : "bg-stone-200"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Step Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 flex-1">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Step: Address */}
            {currentStep === "address" && (
              <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-[#DDA200]/10 rounded-lg">
                    <MapPin className="w-6 h-6 text-[#DDA200]" />
                  </div>
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
                      className="mt-4 text-[#DDA200] hover:text-[#b38600] font-medium flex items-center gap-2 transition-colors"
                    >
                      <span className="text-lg">+</span>
                      <span>Add New Address</span>
                    </button>
                  </>
                ) : (
                  <>
                    <AddressForm
                      onSubmit={handleSaveNewAddress}
                      isLoading={isPending}
                    />
                    {addresses.length > 0 && (
                      <button
                        onClick={() => setShowNewAddressForm(false)}
                        className="mt-4 text-stone-600 hover:text-stone-800 font-medium transition-colors"
                      >
                        ← Back to saved addresses
                      </button>
                    )}
                  </>
                )}

                {/* Same as shipping checkbox */}
                <div className="mt-6 pt-6 border-t border-stone-200">
                  <label className="flex items-center gap-3 cursor-pointer group">
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
                      className="w-5 h-5 rounded border-stone-300 text-[#DDA200] focus:ring-[#DDA200] cursor-pointer"
                    />
                    <span className="text-stone-700 group-hover:text-stone-900 transition-colors">
                      Billing address same as shipping
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Step: Shipping */}
            {currentStep === "shipping" && (
              <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-[#DDA200]/10 rounded-lg">
                    <Truck className="w-6 h-6 text-[#DDA200]" />
                  </div>
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
              <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 md:p-8 shadow-sm">
                <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-3">
                  <div className="p-2 bg-[#DDA200]/10 rounded-lg">
                    <CreditCard className="w-6 h-6 text-[#DDA200]" />
                  </div>
                  Payment Method
                </h2>

                <PaymentMethodSelector
                  selected={checkoutData.paymentMethod}
                  onSelect={handlePaymentSelect}
                  total={checkoutData.summary.total}
                />

                {/* Payment Method Info */}
                {checkoutData.paymentMethod &&
                  checkoutData.paymentMethod !== "cod" && (
                    <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-800">
                          <strong>Note:</strong> After placing your order, you
                          will need to make the payment and upload the
                          screenshot as proof. Your order will be confirmed once
                          we verify the payment.
                        </p>
                      </div>
                    </div>
                  )}

                {checkoutData.paymentMethod === "cod" && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-800">
                        Pay with cash when your order is delivered. A fee of{" "}
                        <strong>{formatCurrency(COD_FEE)}</strong> applies for
                        cash on delivery orders.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step: Review */}
            {currentStep === "review" && (
              <div className="space-y-6">
                {/* Order Items */}
                <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 md:p-8 shadow-sm">
                  <h2 className="text-xl font-bold text-stone-800 mb-6 flex items-center gap-3">
                    <div className="p-2 bg-[#DDA200]/10 rounded-lg">
                      <Package className="w-6 h-6 text-[#DDA200]" />
                    </div>
                    Order Items ({checkoutData.items.length})
                  </h2>
                  <div className="space-y-4">
                    {checkoutData.items.map((item) => (
                      <div
                        key={item.variantId}
                        className="flex gap-4 p-4 bg-stone-50 rounded-xl"
                      >
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-20 h-20 bg-stone-200 rounded-lg flex items-center justify-center">
                            <Package className="w-8 h-8 text-stone-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-stone-800 truncate">
                            {item.name}
                          </h4>
                          <p className="text-sm text-stone-600">
                            {item.variantName}
                          </p>
                          <p className="text-sm text-stone-500">
                            Qty: {item.quantity} × {formatCurrency(item.price)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-stone-800">
                            {formatCurrency(item.subtotal)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Shipping Address Card */}
                  <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-stone-800 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-[#DDA200]" />
                        Shipping To
                      </h3>
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
                        <p>{checkoutData.shippingAddress.phone}</p>
                        <p>{checkoutData.shippingAddress.line1}</p>
                        {checkoutData.shippingAddress.line2 && (
                          <p>{checkoutData.shippingAddress.line2}</p>
                        )}
                        <p>
                          {checkoutData.shippingAddress.city}
                          {checkoutData.shippingAddress.state &&
                            `, ${checkoutData.shippingAddress.state}`}{" "}
                          {checkoutData.shippingAddress.postal}
                        </p>
                        <p>{checkoutData.shippingAddress.country}</p>
                      </div>
                    )}
                  </div>

                  {/* Payment & Shipping Method Card */}
                  <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 shadow-sm">
                    <div className="space-y-4">
                      {/* Shipping Method */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-stone-800 flex items-center gap-2">
                            <Truck className="w-5 h-5 text-[#DDA200]" />
                            Shipping
                          </h3>
                          <button
                            onClick={() => setCurrentStep("shipping")}
                            className="text-[#DDA200] text-sm font-medium hover:underline"
                          >
                            Edit
                          </button>
                        </div>
                        {checkoutData.shippingMethod && (
                          <div className="text-sm text-stone-600">
                            <p className="font-medium text-stone-800">
                              {checkoutData.shippingMethod.name}
                            </p>
                            <p>{checkoutData.shippingMethod.estimatedDays}</p>
                          </div>
                        )}
                      </div>

                      <div className="border-t border-stone-200 pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-stone-800 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-[#DDA200]" />
                            Payment
                          </h3>
                          <button
                            onClick={() => setCurrentStep("payment")}
                            className="text-[#DDA200] text-sm font-medium hover:underline"
                          >
                            Edit
                          </button>
                        </div>
                        <div className="text-sm text-stone-600">
                          <p className="font-medium text-stone-800">
                            {checkoutData.paymentMethod === "cod"
                              ? "Cash on Delivery"
                              : checkoutData.paymentMethod === "jazzcash"
                              ? "JazzCash"
                              : checkoutData.paymentMethod === "easypaisa"
                              ? "EasyPaisa"
                              : "Bank Transfer"}
                          </p>
                          {checkoutData.paymentMethod === "cod" && (
                            <p className="text-xs text-amber-600 mt-1">
                              +{formatCurrency(COD_FEE)} COD fee
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Note */}
                <div className="bg-white rounded-2xl border-2 border-stone-200 p-6 shadow-sm">
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
                    className="w-full px-4 py-3 border-2 border-stone-200 rounded-xl focus:border-[#DDA200] focus:outline-none resize-none transition-colors"
                    rows={3}
                  />
                </div>

                {/* Contact Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-800">
                    Order confirmation will be sent to:{" "}
                    <strong>{userEmail}</strong>
                  </p>
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
                  className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#DDA200] to-[#b38600] text-white font-bold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#DDA200]/30"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      Place Order • {formatCurrency(checkoutData.summary.total)}
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleNextStep}
                  className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#DDA200] to-[#b38600] text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-[#DDA200]/30"
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
      </main>
    </div>
  );
}
