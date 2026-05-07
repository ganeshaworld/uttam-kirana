import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { LayoutDashboard, ShoppingBag, Package, Users, LogOut, Menu, X, Truck, BarChart3, Store, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useGetAnalyticsSummary } from "@workspace/api-client-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag, exact: false },
  { href: "/admin/products", label: "Products", icon: Package, exact: false },
  { href: "/admin/delivery", label: "Delivery", icon: Truck, exact: false },
  { href: "/admin/users", label: "Users", icon: Users, exact: false },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: summary } = useGetAnalyticsSummary();

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:flex w-60 bg-white border-r border-gray-100 flex-col fixed inset-y-0 shadow-sm z-40">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0c831f] rounded-xl flex items-center justify-center font-black text-white text-sm shadow-sm">UK</div>
            <div>
              <p className="font-black text-sm text-gray-900 leading-none">Uttam Kirana</p>
              <p className="text-[10px] text-gray-400 font-medium tracking-wider uppercase mt-0.5">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Quick stats */}
        {summary && (
          <div className="px-4 py-3 border-b border-gray-100 grid grid-cols-2 gap-2">
            <div className="bg-green-50 rounded-xl p-2.5 text-center">
              <p className="text-lg font-black text-[#0c831f]">{summary.todayOrders}</p>
              <p className="text-[9px] text-gray-500 font-medium uppercase tracking-wide">Today</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-2.5 text-center">
              <p className="text-lg font-black text-orange-600">{summary.pendingOrders}</p>
              <p className="text-[9px] text-gray-500 font-medium uppercase tracking-wide">Pending</p>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = item.exact ? location === item.href : location.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer group ${active ? "bg-[#0c831f] text-white shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
                  <Icon className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-gray-400 group-hover:text-gray-600"}`} />
                  <span className="text-sm font-semibold">{item.label}</span>
                  {item.href === "/admin/orders" && summary && summary.pendingOrders > 0 && !active && (
                    <span className="ml-auto bg-orange-100 text-orange-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{summary.pendingOrders}</span>
                  )}
                </div>
              </Link>
            );
          })}

          <div className="pt-3 border-t border-gray-100 mt-3">
            <Link href="/">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-700 cursor-pointer transition-all group">
                <Store className="w-4 h-4 group-hover:text-gray-600" />
                <span className="text-sm font-semibold">View Store</span>
                <ExternalLink className="w-3 h-3 ml-auto" />
              </div>
            </Link>
            <Link href="/admin/analytics">
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-700 cursor-pointer transition-all group">
                <BarChart3 className="w-4 h-4 group-hover:text-gray-600" />
                <span className="text-sm font-semibold">Analytics</span>
              </div>
            </Link>
          </div>
        </nav>

        {/* User + logout */}
        <div className="p-3 border-t border-gray-100">
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1 bg-gray-50 rounded-xl">
            <div className="w-7 h-7 bg-[#0c831f]/10 rounded-lg flex items-center justify-center text-xs font-black text-[#0c831f]">
              {user?.name?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-800 truncate">{user?.name ?? "Admin"}</p>
              <p className="text-[10px] text-gray-400">+91 {user?.mobile}</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-xl w-full transition-colors font-semibold">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50 flex items-center justify-between px-4 h-14 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#0c831f] rounded-xl flex items-center justify-center font-black text-white text-xs">UK</div>
          <span className="font-black text-sm text-gray-900">Admin Panel</span>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-xl hover:bg-gray-100">
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setMenuOpen(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-white p-4 space-y-1 pt-16 shadow-xl" onClick={(e) => e.stopPropagation()}>
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = item.exact ? location === item.href : location.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <div onClick={() => setMenuOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer ${active ? "bg-[#0c831f] text-white" : "text-gray-500 hover:bg-gray-50"}`}>
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-semibold">{item.label}</span>
                  </div>
                </Link>
              );
            })}
            <button onClick={() => { logout(); setMenuOpen(false); }} className="flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl w-full transition-colors mt-4 font-semibold">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 lg:ml-60 pt-14 lg:pt-0 min-h-screen">
        {children}
      </div>
    </div>
  );
}
