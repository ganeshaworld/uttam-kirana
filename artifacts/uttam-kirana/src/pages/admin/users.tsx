import { useState } from "react";
import { useGetAdminUsers, useGetOrders } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { User, Search, Users, ShoppingBag, Truck, Shield, Phone, Calendar } from "lucide-react";

const ROLE_CONFIG: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  customer: { bg: "bg-blue-50 border-blue-100", text: "text-blue-700", icon: ShoppingBag },
  admin: { bg: "bg-purple-50 border-purple-100", text: "text-purple-700", icon: Shield },
  delivery: { bg: "bg-orange-50 border-orange-100", text: "text-orange-700", icon: Truck },
};

const ROLE_BADGE: Record<string, string> = {
  customer: "bg-blue-100 text-blue-700",
  admin: "bg-purple-100 text-purple-700",
  delivery: "bg-orange-100 text-orange-700",
};

export default function AdminUsers() {
  const { data: users, isLoading } = useGetAdminUsers();
  const { data: orders } = useGetOrders({ limit: 200, offset: 0 });
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "customer" | "admin" | "delivery">("all");

  const ordersByUser: Record<number, number> = {};
  (orders ?? []).forEach(o => { ordersByUser[o.userId] = (ordersByUser[o.userId] ?? 0) + 1; });

  const filtered = (users ?? []).filter(u => {
    if (filter !== "all" && u.role !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      return (u.name ?? "").toLowerCase().includes(s) || u.mobile.includes(s);
    }
    return true;
  });

  const counts = { all: users?.length ?? 0, customer: users?.filter(u => u.role === "customer").length ?? 0, admin: users?.filter(u => u.role === "admin").length ?? 0, delivery: users?.filter(u => u.role === "delivery").length ?? 0 };

  return (
    <div className="p-5 lg:p-7 space-y-5">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Users</h1>
        <p className="text-sm text-gray-400">{users?.length ?? 0} registered users</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["all", "customer", "admin", "delivery"] as const).map(role => {
          const cfg = role === "all" ? null : ROLE_CONFIG[role];
          const count = counts[role];
          return (
            <button key={role} onClick={() => setFilter(role)} className={`rounded-2xl p-4 border text-left transition-all ${filter === role ? (cfg ? `${cfg.bg} border-current` : "bg-gray-900 border-gray-900 text-white") : "bg-white border-gray-100 hover:border-gray-200 shadow-sm"}`}>
              <p className={`text-2xl font-black ${filter === role ? (role === "all" ? "text-white" : cfg?.text) : "text-gray-900"}`}>{count}</p>
              <p className={`text-xs font-semibold capitalize mt-0.5 ${filter === role ? (role === "all" ? "text-gray-200" : "text-gray-600") : "text-gray-400"}`}>{role === "all" ? "All Users" : `${role}s`}</p>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Search by name or phone…" className="pl-10 rounded-2xl bg-white border-gray-200 shadow-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Users list */}
      {isLoading ? (
        <div className="space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">User</th>
                <th className="text-left px-4 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide hidden sm:table-cell">Phone</th>
                <th className="text-left px-4 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">Role</th>
                <th className="text-left px-4 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide hidden md:table-cell">Orders</th>
                <th className="text-left px-4 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide hidden lg:table-cell">Joined</th>
                <th className="text-left px-4 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide hidden lg:table-cell">Wallet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((user) => {
                const cfg = ROLE_CONFIG[user.role];
                const Icon = cfg?.icon ?? User;
                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black border ${cfg?.bg ?? "bg-gray-50 border-gray-100"} ${cfg?.text ?? "text-gray-600"}`}>
                          {user.name ? user.name[0]!.toUpperCase() : <Icon className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm leading-none">{user.name ?? "—"}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5 sm:hidden">+91 {user.mobile}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-sm text-gray-600 font-mono">+91 {user.mobile}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${ROLE_BADGE[user.role] ?? "bg-gray-100 text-gray-600"}`}>{user.role}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <ShoppingBag className="w-3.5 h-3.5 text-gray-300" />
                        <span className="font-semibold text-gray-700 text-sm">{ordersByUser[user.id] ?? 0}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-sm font-semibold text-gray-700">₹{user.walletBalance}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-3 text-gray-200" />
              <p className="font-semibold text-sm">No users found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
