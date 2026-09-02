import AdminDashboard from "@/components/admin/AdminDashboard";
import {
  getDashboardStats,
  getRecentOrders,
  getTopProducts,
} from "../action/admin/dashboard.actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard | Admin",
  description: "Admin dashboard overview",
};

export default async function AdminDashboardPage() {
  // Fetch initial data on the server
  const [statsResult, ordersResult, productsResult] = await Promise.all([
    getDashboardStats(),
    getRecentOrders(5),
    getTopProducts(5),
  ]);

  // Extract data with fallbacks
  const initialStats = statsResult.success ? statsResult.data : null;
  const initialOrders = ordersResult.success ? ordersResult.data : [];
  const initialProducts = productsResult.success ? productsResult.data : [];

  return (
    <AdminDashboard
      initialStats={initialStats}
      initialOrders={initialOrders || []}
      initialProducts={initialProducts || []}
    />
  );
}
