// app/checkout/confirmation/page.tsx
import { redirect } from "next/navigation";
import ConfirmationClient from "./ConfirmationClient";
import { getServerAuthSession } from "@/app/action/user.action";
import { getOrderConfirmation } from "@/app/action/orders.action";

export const metadata = {
  title: "Order Confirmation | Your Store",
  description: "Your order has been placed successfully",
};

interface PageProps {
  searchParams: { order?: string };
}

export default async function ConfirmationPage({ searchParams }: PageProps) {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (!searchParams.order) {
    redirect("/");
  }

  const result = await getOrderConfirmation(searchParams.order);

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
