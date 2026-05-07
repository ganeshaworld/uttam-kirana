import { useState } from "react";
import { useLocation } from "wouter";
import { useGetCart, useCreateOrder, useClearCart, getGetCartQueryKey, getGetOrdersQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth-context";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, MapPin, CreditCard, Banknote } from "lucide-react";

export default function Checkout() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: cart } = useGetCart();
  const createOrder = useCreateOrder();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [address, setAddress] = useState(user?.address ?? "");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [notes, setNotes] = useState("");
  const [orderId, setOrderId] = useState<number | null>(null);

  const handlePlaceOrder = () => {
    if (!address.trim()) {
      toast({ title: "Address required", description: "Please enter your delivery address", variant: "destructive" });
      return;
    }
    createOrder.mutate(
      { data: { paymentMethod, deliveryAddress: address, notes: notes || undefined } },
      {
        onSuccess: (order) => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetOrdersQueryKey() });
          setOrderId(order.id);
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : "Failed to place order";
          toast({ title: "Error", description: msg, variant: "destructive" });
        },
      }
    );
  };

  if (orderId) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Order Placed!</h2>
        <p className="text-muted-foreground text-sm mb-1">Your order #{orderId} has been placed</p>
        <p className="text-muted-foreground text-sm mb-6">We'll notify you when it's on the way</p>
        <div className="space-y-2 w-full">
          <Button className="w-full rounded-xl" onClick={() => setLocation(`/orders/${orderId}`)} data-testid="button-track-order">
            Track Order
          </Button>
          <Button variant="outline" className="w-full rounded-xl" onClick={() => setLocation("/")} data-testid="button-continue-shopping">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-base font-bold">Checkout</h2>

      {/* Order Summary */}
      {cart && (
        <div className="bg-card border border-card-border rounded-xl p-4">
          <h3 className="font-bold text-sm mb-3">Order Summary ({cart.itemCount} items)</h3>
          <div className="space-y-1.5 max-h-36 overflow-y-auto">
            {cart.items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-muted-foreground truncate flex-1">{item.productName} x{item.quantity}</span>
                <span className="font-medium shrink-0 ml-2">₹{item.subtotal}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-3 pt-3 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-primary">₹{cart.total.toFixed(2)}</span>
          </div>
        </div>
      )}

      {/* Delivery Address */}
      <div className="bg-card border border-card-border rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-sm">Delivery Address</h3>
        </div>
        <Textarea
          data-testid="input-address"
          placeholder="Enter your full delivery address..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="rounded-xl resize-none"
          rows={3}
        />
        <Input
          data-testid="input-notes"
          placeholder="Delivery instructions (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="rounded-xl"
        />
      </div>

      {/* Payment Method */}
      <div className="bg-card border border-card-border rounded-xl p-4 space-y-3">
        <h3 className="font-bold text-sm">Payment Method</h3>
        <div className="space-y-2">
          <button
            data-testid="payment-cod"
            onClick={() => setPaymentMethod("cod")}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border"}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${paymentMethod === "cod" ? "bg-primary text-white" : "bg-muted"}`}>
              <Banknote className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">Cash on Delivery</p>
              <p className="text-xs text-muted-foreground">Pay when your order arrives</p>
            </div>
            {paymentMethod === "cod" && <CheckCircle className="ml-auto w-5 h-5 text-primary" />}
          </button>
          <button
            data-testid="payment-online"
            onClick={() => setPaymentMethod("online")}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${paymentMethod === "online" ? "border-primary bg-primary/5" : "border-border"}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${paymentMethod === "online" ? "bg-primary text-white" : "bg-muted"}`}>
              <CreditCard className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">Online Payment</p>
              <p className="text-xs text-muted-foreground">UPI / Card (Razorpay-ready)</p>
            </div>
            {paymentMethod === "online" && <CheckCircle className="ml-auto w-5 h-5 text-primary" />}
          </button>
        </div>
      </div>

      <Button
        data-testid="button-place-order"
        className="w-full h-12 text-base font-bold rounded-xl"
        onClick={handlePlaceOrder}
        disabled={createOrder.isPending}
      >
        {createOrder.isPending ? "Placing Order..." : `Place Order — ₹${cart?.total.toFixed(2) ?? "0"}`}
      </Button>
    </div>
  );
}
