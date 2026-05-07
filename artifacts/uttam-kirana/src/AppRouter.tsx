import { Switch, Route, Redirect } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { CustomerLayout } from "@/components/CustomerLayout";
import { AdminLayout } from "@/components/AdminLayout";

import Login from "@/pages/login";
import Home from "@/pages/home";
import Products from "@/pages/products";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Orders from "@/pages/orders";
import OrderDetail from "@/pages/order-detail";
import Profile from "@/pages/profile";

import AdminDashboard from "@/pages/admin/dashboard";
import AdminOrders from "@/pages/admin/orders";
import AdminProducts from "@/pages/admin/products";
import AdminUsers from "@/pages/admin/users";
import AdminDelivery from "@/pages/admin/delivery";

import DeliveryDashboard from "@/pages/delivery/dashboard";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-primary">
      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center font-bold text-primary text-xl shadow-lg">UK</div>
      <div className="w-8 h-1 bg-white/30 rounded-full overflow-hidden">
        <div className="h-full bg-white rounded-full animate-pulse w-1/2" />
      </div>
    </div>
  );
}

function ProtectedRoute({ component: Component, allowedRoles, layout }: { component: React.ComponentType; allowedRoles?: string[]; layout?: "customer" | "admin" | "none" }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!user) return <Redirect to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "admin") return <Redirect to="/admin" />;
    if (user.role === "delivery") return <Redirect to="/delivery" />;
    return <Redirect to="/" />;
  }
  if (layout === "customer") return <CustomerLayout><Component /></CustomerLayout>;
  if (layout === "admin") return <AdminLayout><Component /></AdminLayout>;
  return <Component />;
}

export function AppRouter() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;

  return (
    <Switch>
      <Route path="/login">
        {user ? (
          user.role === "admin" ? <Redirect to="/admin" /> :
          user.role === "delivery" ? <Redirect to="/delivery" /> :
          <Redirect to="/" />
        ) : <Login />}
      </Route>

      {/* Customer routes */}
      <Route path="/" component={() => <ProtectedRoute component={Home} allowedRoles={["customer", "admin", "delivery"]} layout="customer" />} />
      <Route path="/products" component={() => <ProtectedRoute component={Products} allowedRoles={["customer", "admin", "delivery"]} layout="customer" />} />
      <Route path="/cart" component={() => <ProtectedRoute component={Cart} allowedRoles={["customer", "admin", "delivery"]} layout="customer" />} />
      <Route path="/checkout" component={() => <ProtectedRoute component={Checkout} allowedRoles={["customer", "admin", "delivery"]} layout="customer" />} />
      <Route path="/orders" component={() => <ProtectedRoute component={Orders} allowedRoles={["customer", "admin", "delivery"]} layout="customer" />} />
      <Route path="/orders/:orderId" component={() => <ProtectedRoute component={OrderDetail} allowedRoles={["customer", "admin", "delivery"]} layout="customer" />} />
      <Route path="/profile" component={() => <ProtectedRoute component={Profile} allowedRoles={["customer", "admin", "delivery"]} layout="customer" />} />

      {/* Admin routes */}
      <Route path="/admin" component={() => <ProtectedRoute component={AdminDashboard} allowedRoles={["admin"]} layout="admin" />} />
      <Route path="/admin/orders" component={() => <ProtectedRoute component={AdminOrders} allowedRoles={["admin"]} layout="admin" />} />
      <Route path="/admin/products" component={() => <ProtectedRoute component={AdminProducts} allowedRoles={["admin"]} layout="admin" />} />
      <Route path="/admin/users" component={() => <ProtectedRoute component={AdminUsers} allowedRoles={["admin"]} layout="admin" />} />
      <Route path="/admin/delivery" component={() => <ProtectedRoute component={AdminDelivery} allowedRoles={["admin"]} layout="admin" />} />

      {/* Delivery routes */}
      <Route path="/delivery" component={() => <ProtectedRoute component={DeliveryDashboard} allowedRoles={["delivery", "admin"]} layout="none" />} />

      <Route component={() => <Redirect to="/" />} />
    </Switch>
  );
}
