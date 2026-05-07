import { useRoute } from "wouter";
import { useGetOrder } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, MapPin, Phone, Truck } from "lucide-react";

const STEPS = [
  { status: "placed", label: "Order Placed" },
  { status: "confirmed", label: "Confirmed" },
  { status: "packed", label: "Packed" },
  { status: "out_for_delivery", label: "Out for Delivery" },
  { status: "delivered", label: "Delivered" },
];

const STATUS_IDX: Record<string, number> = { placed: 0, confirmed: 1, packed: 2, out_for_delivery: 3, delivered: 4, cancelled: -1 };

export default function OrderDetail() {
  const [, params] = useRoute("/orders/:orderId");
  const orderId = Number(params?.orderId);
  const { data: order, isLoading } = useGetOrder(orderId, { query: { enabled: !!orderId, queryKey: ["order", orderId] as unknown[] } });

  if (isLoading) return <div className="space-y-3">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>;
  if (!order) return <div className="text-center py-16 text-muted-foreground">Order not found</div>;

  const currentStep = STATUS_IDX[order.status] ?? 0;
  const items = order.items as Array<{ productId: number; productName: string; price: number; quantity: number; subtotal: number; unit: string }>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold">Order #{order.id}</h2>
        <span className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
      </div>

      {/* Status Timeline */}
      {order.status !== "cancelled" ? (
        <div className="bg-card border border-card-border rounded-xl p-4">
          <h3 className="font-bold text-sm mb-4">Order Status</h3>
          <div className="space-y-0">
            {STEPS.map((step, idx) => {
              const done = idx <= currentStep;
              const active = idx === currentStep;
              return (
                <div key={step.status} className="flex items-start gap-3" data-testid={`status-step-${step.status}`}>
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${done ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                      {done ? "✓" : idx + 1}
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className={`w-0.5 h-8 ${idx < currentStep ? "bg-primary" : "bg-muted"}`} />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className={`text-sm font-semibold ${active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"}`}>
                      {step.label}
                    </p>
                    {active && <p className="text-xs text-muted-foreground">Current status</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 font-semibold text-sm text-center">
          This order was cancelled
        </div>
      )}

      {/* Delivery Info */}
      {order.deliveryBoyName && (
        <div className="bg-card border border-card-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <Truck className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Delivery Partner</p>
            <p className="font-semibold text-sm">{order.deliveryBoyName}</p>
          </div>
        </div>
      )}

      {/* Items */}
      <div className="bg-card border border-card-border rounded-xl p-4">
        <h3 className="font-bold text-sm mb-3">Items Ordered</h3>
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm">
              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="text-xs text-muted-foreground">{item.unit} × {item.quantity}</p>
              </div>
              <p className="font-bold">₹{item.subtotal}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-border mt-3 pt-3 space-y-1.5">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>₹{Number(order.subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery</span>
            <span>{Number(order.deliveryCharge) === 0 ? "FREE" : `₹${order.deliveryCharge}`}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span className="text-primary">₹{Number(order.total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="bg-card border border-card-border rounded-xl p-4 flex gap-3">
        <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Delivery Address</p>
          <p className="text-sm font-medium">{order.deliveryAddress}</p>
        </div>
      </div>

      {/* Payment */}
      <div className="bg-card border border-card-border rounded-xl p-4 flex justify-between items-center">
        <div>
          <p className="text-xs text-muted-foreground">Payment Method</p>
          <p className="font-semibold text-sm">{order.paymentMethod === "cod" ? "Cash on Delivery" : "Online Payment"}</p>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
          {order.paymentStatus === "paid" ? "Paid" : "Pending"}
        </span>
      </div>
    </div>
  );
}
