// app/checkout/page.tsx
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getServerAuthSession } from "@/app/action/home/user.action";
import {
  getCheckoutData,
  validateCheckout,
} from "@/app/action/home/checkout.actions";
import CheckoutClient from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout | Your Store Name",
  description: "Complete your purchase securely",
};

export default async function CheckoutPage() {
  // Check authentication
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/checkout");
  }

  // Fetch checkout data
  const result = await getCheckoutData();

  if (!result.success || !result.data) {
    redirect(`/cart?error=${encodeURIComponent(result.error || "empty")}`);
  }

  const {
    data: checkoutState,
    savedAddresses,
    shippingMethods,
    userEmail,
  } = result;

  // Validate cart has items
  if (checkoutState.items.length === 0) {
    redirect("/cart?error=empty");
  }

  // Validate stock availability
  const validation = await validateCheckout(checkoutState.cartId);

  if (!validation.success) {
    const errorParam = validation.issues
      ? encodeURIComponent(validation.issues.join(", "))
      : "stock";
    redirect(`/home/cart?error=${errorParam}`);
  }

  return (
    <CheckoutClient
      initialData={checkoutState}
      savedAddresses={savedAddresses || []}
      shippingMethods={shippingMethods || []}
      userEmail={userEmail || ""}
    />
  );
}
