import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ShoppingCart, Search, Menu, X, User, Package, LogOut, LayoutDashboard, Truck } from "lucide-react";
import { useGetCart } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth-context";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/orders", label: "Orders" },
];

export function Header() {
  const { data: cart } = useGetCart();
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const cartCount = cart?.itemCount ?? 0;

  return (
    <header className="sticky top-0 z-50 bg-[#0c831f] shadow-lg">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 h-16">
          {/* Logo */}
          <Link href={user?.role === "admin" ? "/admin" : user?.role === "delivery" ? "/delivery" : "/"}>
            <div className="flex items-center gap-2.5 shrink-0 cursor-pointer select-none">
              <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-md">
                <span className="font-black text-[#0c831f] text-base tracking-tighter">UK</span>
              </div>
              <div className="hidden sm:block">
                <p className="font-bold text-white leading-none text-[15px] tracking-tight">Uttam Kirana</p>
                <p className="text-[10px] text-white/70 font-medium tracking-widest uppercase">10 min delivery</p>
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-4">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                <span className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${location === link.href ? "bg-white/20 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"}`}>
                  {link.label}
                </span>
              </Link>
            ))}
            {user?.role === "admin" && (
              <Link href="/admin">
                <span className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${location.startsWith("/admin") ? "bg-white/20 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"}`}>
                  <LayoutDashboard className="w-3.5 h-3.5" /> Admin
                </span>
              </Link>
            )}
            {user?.role === "delivery" && (
              <Link href="/delivery">
                <span className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${location === "/delivery" ? "bg-white/20 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"}`}>
                  Deliveries
                </span>
              </Link>
            )}
          </nav>

          {/* Search bar — desktop */}
          <Link href="/products" className="hidden md:flex flex-1 max-w-lg mx-4">
            <div className="w-full flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 cursor-text shadow-sm hover:shadow-md transition-shadow">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-sm text-gray-400 flex-1">Search for groceries, brands…</span>
            </div>
          </Link>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-1">
            {/* Cart */}
            <Link href="/cart">
              <button className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors text-white">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-white text-[#0c831f] text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>
            </Link>

            {/* Profile dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-white/10 transition-colors text-white"
              >
                <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center font-bold text-sm">
                  {user?.name?.[0]?.toUpperCase() ?? <User className="w-4 h-4" />}
                </div>
                <span className="text-sm font-medium max-w-[100px] truncate hidden lg:block">{user?.name ?? "Account"}</span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <p className="font-bold text-sm text-gray-900">{user?.name ?? "User"}</p>
                    <p className="text-xs text-gray-500">+91 {user?.mobile}</p>
                  </div>
                  <div className="py-1">
                    <Link href="/profile" onClick={() => setProfileOpen(false)}>
                      <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 font-medium">
                        <User className="w-4 h-4 text-gray-400" /> My Profile
                      </div>
                    </Link>
                    <Link href="/orders" onClick={() => setProfileOpen(false)}>
                      <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 font-medium">
                        <Package className="w-4 h-4 text-gray-400" /> My Orders
                      </div>
                    </Link>
                    {user?.role === "admin" && (
                      <Link href="/admin" onClick={() => setProfileOpen(false)}>
                        <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 font-medium">
                          <LayoutDashboard className="w-4 h-4 text-gray-400" /> Admin Panel
                        </div>
                      </Link>
                    )}
                    {user?.role === "delivery" && (
                      <Link href="/delivery" onClick={() => setProfileOpen(false)}>
                        <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 font-medium">
                          <Truck className="w-4 h-4 text-gray-400" /> My Deliveries
                        </div>
                      </Link>
                    )}
                    <button onClick={() => { logout(); setProfileOpen(false); }} className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 cursor-pointer text-sm text-red-600 font-medium w-full border-t border-gray-100 mt-1">
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="sm:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors text-white">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden pb-3">
          <Link href="/products">
            <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 cursor-text shadow-sm">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-sm text-gray-400">Search groceries…</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-white/20 bg-[#0c831f] px-4 py-3 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
              <div className={`px-4 py-3 rounded-xl text-sm font-semibold ${location === link.href ? "bg-white/20 text-white" : "text-white/80"}`}>
                {link.label}
              </div>
            </Link>
          ))}
          <div className="border-t border-white/20 pt-2 mt-2">
            <div className="flex items-center gap-3 px-4 py-2 text-white/80 text-sm">
              <User className="w-4 h-4" />
              <span>{user?.name ?? "Account"} · {user?.role}</span>
            </div>
            <button onClick={() => { logout(); setMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm text-white/80 font-semibold flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
