import { Link } from "wouter";
import { useGetOrders } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, ChevronRight } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  placed: { label: "Order Placed", color: "text-blue-700", bg: "bg-blue-100" },
  confirmed: { label: "Confirmed", color: "text-indigo-700", bg: "bg-indigo-100" },
  packed: { label: "Packed", color: "text-purple-700", bg: "bg-purple-100" },
  out_for_delivery: { label: "Out for Delivery", color: "text-orange-700", bg: "bg-orange-100" },
  delivered: { label: "Delivered", color: "text-green-700", bg: "bg-green-100" },
  cancelled: { label: "Cancelled", color: "text-red-700", bg: "bg-red-100" },
};

export default function Orders() {
  const { data: orders, isLoading } = useGetOrders();

  if (isLoading) return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
    </div>
  );

  if (!orders || orders.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
        <Package className="w-10 h-10 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-bold text-foreground mb-2">No orders yet</h2>
      <p className="text-sm text-muted-foreground">Your past orders will appear here</p>
    </div>
  );

  return (
    <div className="space-y-3">
      <h2 className="text-base font-bold">My Orders</h2>
      {orders.map((order) => {
        const st = STATUS_CONFIG[order.status] ?? { label: order.status, color: "text-gray-700", bg: "bg-gray-100" };
        const items = order.items as Array<{ productName: string; quantity: number }>;
        return (
          <Link key={order.id} href={`/orders/${order.id}`}>
            <div data-testid={`order-card-${order.id}`} className="bg-card border border-card-border rounded-xl p-4 flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer">
              <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center shrink-0">
                <Package className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm">Order #{order.id}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${st.bg} ${st.color}`}>
                    {st.label}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {items.slice(0, 2).map((i) => `${i.productName} x${i.quantity}`).join(", ")}
                  {items.length > 2 ? ` +${items.length - 2} more` : ""}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm font-bold text-primary">₹{Number(order.total).toFixed(2)}</span>
                  <span className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
