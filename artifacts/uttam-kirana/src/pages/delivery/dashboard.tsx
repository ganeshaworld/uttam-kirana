import { useGetDeliveryOrders, useUpdateOrderStatus, getGetDeliveryOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Truck, MapPin, Phone, CheckCircle } from "lucide-react";

const STATUS_NEXT: Record<string, { label: string; next: "placed" | "confirmed" | "packed" | "out_for_delivery" | "delivered" | "cancelled" }> = {
  confirmed: { label: "Mark Packed", next: "packed" },
  packed: { label: "Out for Delivery", next: "out_for_delivery" },
  out_for_delivery: { label: "Mark Delivered", next: "delivered" },
};

const STATUS_BG: Record<string, string> = {
  confirmed: "bg-indigo-100 text-indigo-700", packed: "bg-purple-100 text-purple-700",
  out_for_delivery: "bg-orange-100 text-orange-700", delivered: "bg-green-100 text-green-700",
};

export default function DeliveryDashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: orders, isLoading } = useGetDeliveryOrders();
  const updateStatus = useUpdateOrderStatus();

  const handleStatus = (orderId: number, status: "placed" | "confirmed" | "packed" | "out_for_delivery" | "delivered" | "cancelled") => {
    updateStatus.mutate(
      { orderId, data: { status } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetDeliveryOrdersQueryKey() });
          toast({ title: status === "delivered" ? "Order delivered!" : "Status updated" });
        },
      }
    );
  };

  if (isLoading) return (
    <div className="p-6 space-y-3">
      {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)}
    </div>
  );

  const active = (orders ?? []).filter((o) => o.status !== "delivered" && o.status !== "cancelled");
  const done = (orders ?? []).filter((o) => o.status === "delivered");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
          <Truck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold">My Deliveries</h1>
          <p className="text-sm text-muted-foreground">{active.length} active · {done.length} delivered</p>
        </div>
      </div>

      {orders?.length === 0 ? (
        <div className="text-center py-16">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold">All caught up!</h2>
          <p className="text-sm text-muted-foreground">No deliveries assigned yet</p>
        </div>
      ) : (
        <>
          {active.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-bold text-sm uppercase tracking-wide text-muted-foreground">Active</h2>
              {active.map((order) => {
                const items = order.items as Array<{ productName: string; quantity: number }>;
                const next = STATUS_NEXT[order.status];
                return (
                  <div key={order.id} data-testid={`delivery-order-${order.id}`} className="bg-card border border-card-border rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold">Order #{order.id}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_BG[order.status] ?? "bg-gray-100 text-gray-700"}`}>
                        {order.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <p className="text-muted-foreground">{order.deliveryAddress}</p>
                    </div>
                    {order.userMobile && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{order.userName} · +91 {order.userMobile}</span>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {items.slice(0, 3).map((i) => `${i.productName} ×${i.quantity}`).join(", ")}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-primary">₹{Number(order.total).toFixed(2)}</span>
                      {next && (
                        <Button size="sm" className="rounded-xl" onClick={() => handleStatus(order.id, next.next)} disabled={updateStatus.isPending}>
                          {next.label}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {done.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-bold text-sm uppercase tracking-wide text-muted-foreground">Delivered Today</h2>
              {done.slice(0, 5).map((order) => (
                <div key={order.id} className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">Order #{order.id}</p>
                    <p className="text-xs text-muted-foreground">{order.userName}</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
