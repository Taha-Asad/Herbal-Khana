// app/checkout/confirmation/page.tsx
import { redirect } from "next/navigation";
import ConfirmationClient from "./ConfirmationClient";
import { getServerAuthSession } from "@/app/action/home/user.action";
import { getOrderConfirmation } from "@/app/action/home/orders.action";

export const metadata = {
  title: "Order Confirmation | Your Store",
  description: "Your order has been placed successfully",
};

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const session = await getServerAuthSession();
  const { order } = await searchParams;

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (!order) {
    redirect("/");
  }

  const result = await getOrderConfirmation(order);

  if (!result.success || !result.data) {
    redirect("/");
  }

  return (
    <ConfirmationClient
      orderData={result.data}
      userEmail={session.user.email!}
    />
  );
}
