import { Link } from "wouter";
import { useGetAnalyticsSummary, useGetTopProducts, useGetOrdersByStatus, useGetOrders } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import { ShoppingBag, TrendingUp, Users, Clock, Package, IndianRupee, ArrowRight, Truck, AlertCircle, CheckCircle2, XCircle } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  placed: "#3b82f6", confirmed: "#6366f1", packed: "#8b5cf6",
  out_for_delivery: "#f97316", delivered: "#22c55e", cancelled: "#ef4444",
};
const STATUS_LABELS: Record<string, string> = { placed: "Placed", confirmed: "Confirmed", packed: "Packed", out_for_delivery: "Out for Delivery", delivered: "Delivered", cancelled: "Cancelled" };
const STATUS_BG: Record<string, string> = { placed: "bg-blue-100 text-blue-700", confirmed: "bg-indigo-100 text-indigo-700", packed: "bg-purple-100 text-purple-700", out_for_delivery: "bg-orange-100 text-orange-700", delivered: "bg-green-100 text-green-700", cancelled: "bg-red-100 text-red-700" };

export default function AdminDashboard() {
  const { data: summary, isLoading: sumLoading } = useGetAnalyticsSummary();
  const { data: topProducts } = useGetTopProducts();
  const { data: statusData } = useGetOrdersByStatus();
  const { data: recentOrders } = useGetOrders({ limit: 8, offset: 0 });

  const statCards = summary ? [
    { label: "Total Revenue", value: `₹${summary.totalRevenue.toFixed(0)}`, sub: `Today: ₹${summary.todayRevenue.toFixed(0)}`, icon: IndianRupee, color: "text-[#0c831f]", bg: "bg-green-50", border: "border-green-100" },
    { label: "Total Orders", value: summary.totalOrders, sub: `Today: ${summary.todayOrders} orders`, icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    { label: "Total Customers", value: summary.totalCustomers, sub: "Registered users", icon: Users, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
    { label: "Avg Order Value", value: `₹${summary.averageOrderValue.toFixed(0)}`, sub: "Per order", icon: TrendingUp, color: "text-teal-600", bg: "bg-teal-50", border: "border-teal-100" },
    { label: "Pending Orders", value: summary.pendingOrders, sub: "Awaiting action", icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
    { label: "Out for Delivery", value: summary.outForDeliveryOrders, sub: "On the way", icon: Truck, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
  ] : [];

  return (
    <div className="p-5 lg:p-7 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
        <Link href="/admin/orders">
          <button className="flex items-center gap-2 bg-[#0c831f] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#0a6e19] transition-colors shadow-sm">
            View Orders <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </Link>
      </div>

      {/* Alert if pending orders */}
      {summary && summary.pendingOrders > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-sm font-semibold text-amber-800">
            You have <strong>{summary.pendingOrders} pending order{summary.pendingOrders > 1 ? "s" : ""}</strong> that need action.
          </p>
          <Link href="/admin/orders" className="ml-auto">
            <span className="text-xs font-bold text-amber-700 underline hover:no-underline whitespace-nowrap">Review now →</span>
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      {sumLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className={`${card.bg} border ${card.border} rounded-2xl p-4`}>
                <div className={`w-8 h-8 bg-white rounded-xl flex items-center justify-center mb-3 shadow-sm`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
                <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
                <p className="text-xs text-gray-500 font-semibold mt-0.5">{card.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{card.sub}</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Orders by Status Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Orders by Status</h3>
            <Link href="/admin/orders">
              <span className="text-xs text-[#0c831f] font-semibold hover:underline">Manage →</span>
            </Link>
          </div>
          {statusData && statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={statusData.map(d => ({ ...d, label: STATUS_LABELS[d.status] ?? d.status }))} barSize={32}>
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #f3f4f6", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Orders">
                  {statusData.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#94a3b8"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No order data yet</div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Top Products</h3>
            <Link href="/admin/products">
              <span className="text-xs text-[#0c831f] font-semibold hover:underline">All →</span>
            </Link>
          </div>
          {topProducts && topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.slice(0, 6).map((p, idx) => (
                <div key={p.productId} className="flex items-center gap-3">
                  <div className="w-7 h-7 shrink-0">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.productName} className="w-7 h-7 rounded-lg object-cover" />
                    ) : (
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white ${["bg-[#0c831f]","bg-blue-500","bg-purple-500","bg-orange-500","bg-teal-500","bg-pink-500"][idx % 6]}`}>{idx + 1}</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{p.productName}</p>
                    <p className="text-[10px] text-gray-400">{p.totalSold} sold</p>
                  </div>
                  <p className="text-xs font-bold text-[#0c831f] shrink-0">₹{p.revenue.toFixed(0)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No sales data yet</div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Recent Orders</h3>
          <Link href="/admin/orders">
            <span className="text-xs text-[#0c831f] font-semibold hover:underline">View all →</span>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2.5 px-2 text-xs text-gray-400 font-semibold">Order</th>
                <th className="text-left py-2.5 px-2 text-xs text-gray-400 font-semibold">Customer</th>
                <th className="text-left py-2.5 px-2 text-xs text-gray-400 font-semibold hidden sm:table-cell">Items</th>
                <th className="text-left py-2.5 px-2 text-xs text-gray-400 font-semibold">Amount</th>
                <th className="text-left py-2.5 px-2 text-xs text-gray-400 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {(recentOrders ?? []).map((order) => {
                const items = order.items as Array<{ productName: string; quantity: number }>;
                return (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-2 font-bold text-gray-900">#{order.id}</td>
                    <td className="py-3 px-2">
                      <p className="font-semibold text-gray-800 text-xs">{order.userName ?? "Customer"}</p>
                      <p className="text-[10px] text-gray-400">{order.userMobile}</p>
                    </td>
                    <td className="py-3 px-2 text-xs text-gray-500 hidden sm:table-cell max-w-[180px] truncate">
                      {items.slice(0, 2).map(i => `${i.productName} ×${i.quantity}`).join(", ")}
                      {items.length > 2 ? ` +${items.length - 2}` : ""}
                    </td>
                    <td className="py-3 px-2 font-bold text-gray-900">₹{Number(order.total).toFixed(0)}</td>
                    <td className="py-3 px-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold whitespace-nowrap ${STATUS_BG[order.status] ?? "bg-gray-100 text-gray-700"}`}>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {(!recentOrders || recentOrders.length === 0) && (
            <div className="py-12 text-center text-gray-400 text-sm">No orders yet</div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/admin/products", label: "Add Product", icon: Package, color: "bg-[#0c831f]" },
          { href: "/admin/orders", label: "Manage Orders", icon: ShoppingBag, color: "bg-blue-600" },
          { href: "/admin/delivery", label: "Track Delivery", icon: Truck, color: "bg-orange-500" },
          { href: "/admin/users", label: "View Users", icon: Users, color: "bg-purple-600" },
        ].map(({ href, label, icon: Icon, color }) => (
          <Link key={href} href={href}>
            <div className={`${color} text-white rounded-2xl p-4 cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-3 shadow-sm`}>
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-sm font-bold">{label}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
