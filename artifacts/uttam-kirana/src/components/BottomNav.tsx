import { Link, useLocation } from "wouter";
import { Home, ShoppingBag, ShoppingCart, Clock, User } from "lucide-react";
import { useGetCart } from "@workspace/api-client-react";

export function BottomNav() {
  const [location] = useLocation();
  const { data: cart } = useGetCart();

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/products", label: "Shop", icon: ShoppingBag },
    { href: "/cart", label: "Cart", icon: ShoppingCart, badge: cart?.itemCount || 0 },
    { href: "/orders", label: "Orders", icon: Clock },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-2 py-1 flex justify-around items-center shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
      {navItems.map((item) => {
        const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href}>
            <div className={`flex flex-col items-center justify-center w-16 h-14 rounded-2xl transition-all duration-200 cursor-pointer ${isActive ? "text-[#0c831f]" : "text-gray-400"}`}>
              <div className="relative">
                {isActive && <div className="absolute -inset-1 bg-[#0c831f]/10 rounded-xl" />}
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5px]" : "stroke-[1.8px]"}`} />
                  {item.badge ? (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {item.badge > 9 ? "9+" : item.badge}
                    </span>
                  ) : null}
                </div>
              </div>
              <span className={`text-[10px] font-semibold mt-0.5 ${isActive ? "text-[#0c831f]" : "text-gray-400"}`}>{item.label}</span>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
