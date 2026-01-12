import prisma from "@/lib/prisma";
import { getServerAuthSession } from "../action/home/user.action";
import { checkAdminAccess } from "@/lib/auth/admin-auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import { ThemeProvider } from "@/contexts/ThemeContext";
export const metadata = {
  title: "Admin Dashboard",
  description: "Admin panel for managing your store",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await checkAdminAccess();

  const session = await getServerAuthSession();
  const user = await prisma.user.findUnique({
    where: { id: session!.user!.id },
    select: { name: true, email: true, image: true },
  });

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="lg:pl-72">
          <AdminHeader
            user={{
              name: user?.name || "Admin",
              email: user?.email || "",
              image: user?.image || undefined,
            }}
          />
          <main className="p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  );
}
