import { Suspense } from "react";
import ResetPasswordClient from "./ResetPasswordClient";

interface PageProps {
  searchParams?: Promise<{
    token?: string;
  }>;
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const token = resolvedSearchParams?.token ?? "";

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-stone-600 text-lg">Loading order tracking…</p>
        </div>
      }
    >
      <ResetPasswordClient token={token} />
    </Suspense>
  );
}
