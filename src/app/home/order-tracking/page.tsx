import { Suspense } from "react";
import OrderTrackingClient from "./OrderTrackingClient";

interface PageProps {
  searchParams?: Promise<{
    order?: string;
  }>;
}

export default async function OrderTrackingPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const initialOrderId = resolvedSearchParams?.order ?? "";

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-stone-600 text-lg">Loading order tracking…</p>
        </div>
      }
    >
      <OrderTrackingClient initialOrderId={initialOrderId} />
    </Suspense>
  );
}
