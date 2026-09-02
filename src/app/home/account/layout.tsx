// app/account/layout.tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AccountSidebar from "@/components/layout/account/AccountSidebar";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/login?callbackUrl=/account/profile");
  }

  return (
    <div className="min-h-screen pt-35 pb-20 bg-gradient-to-br from-white via-[#FFF8E1]/30 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <AccountSidebar user={session.user} />
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
