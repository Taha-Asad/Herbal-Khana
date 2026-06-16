// app/unsubscribe/[token]/page.tsx
import { unsubscribeFromNewsletter } from "@/app/action/home/newsletter.actions";
import Link from "next/link";
import { CheckCircle, XCircle } from "lucide-react";

interface UnsubscribePageProps {
  params: Promise<{ token: string }>;
}

export default async function UnsubscribePage({
  params,
}: UnsubscribePageProps) {
  const { token } = await params;
  const result = await unsubscribeFromNewsletter(token);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100">
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6
            ${result.success ? "bg-green-100" : "bg-red-100"}`}
        >
          {result.success ? (
            <CheckCircle className="w-10 h-10 text-green-600" />
          ) : (
            <XCircle className="w-10 h-10 text-red-600" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {result.success ? "Unsubscribed Successfully" : "Oops!"}
        </h1>

        <p className="text-gray-600 mb-8">{result.message}</p>

        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full py-3 bg-[#DDA200] text-white font-semibold rounded-xl
              hover:bg-[#C49A00] transition-colors"
          >
            Go to Home
          </Link>

          {result.success && (
            <p className="text-sm text-gray-500">
              Changed your mind?{" "}
              <Link href="/home" className="text-[#DDA200] hover:underline">
                Resubscribe
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
