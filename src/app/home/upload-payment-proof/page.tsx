// app/upload-payment-proof/page.tsx
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getServerAuthSession } from "@/app/action/home/user.action";
import { getOrderForPaymentProof } from "@/app/action/home/payment.action";
import UploadProofClient from "./UploadProofClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Upload Payment Proof | Your Store",
  description: "Upload your payment receipt to confirm your order",
};

interface PageProps {
  searchParams?: Promise<{
    order?: string;
  }>;
}

// Loading component
function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 animate-spin text-amber-500 mx-auto mb-4" />
        <p className="text-gray-600">Loading order details...</p>
      </div>
    </div>
  );
}

// Main content fetcher
async function PaymentProofContent({ orderId }: { orderId: string }) {
  const session = await getServerAuthSession();

  if (!session?.user?.id) {
    redirect(`/auth/login?redirect=/upload-payment-proof?order=${orderId}`);
  }

  const result = await getOrderForPaymentProof(orderId);

  if (!result.success || !result.data) {
    return (
      <UploadProofClient
        initialOrder={null}
        initialError={result.error || "Order not found"}
        orderId={orderId}
      />
    );
  }

  // Check if COD order (shouldn't be on this page)
  if (result.data.paymentMethod === "cod") {
    redirect(`/home/account/orders/${orderId}`);
  }

  return (
    <UploadProofClient
      initialOrder={result.data}
      initialError={null}
      orderId={orderId}
    />
  );
}

export default async function UploadPaymentProofPage({
  searchParams,
}: PageProps) {
  const resolvedSearchParams = await searchParams;
  const orderId = resolvedSearchParams?.order ?? "";
  if (!orderId) {
    return (
      <UploadProofClient
        initialOrder={null}
        initialError="No order ID provided"
        orderId=""
      />
    );
  }

  return (
    <Suspense fallback={<LoadingState />}>
      <PaymentProofContent orderId={orderId} />
    </Suspense>
  );
}
