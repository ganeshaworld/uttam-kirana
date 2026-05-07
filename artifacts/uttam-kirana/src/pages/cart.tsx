import { Link } from "wouter";
import { useGetCart, useUpdateCartItem, useRemoveCartItem, useClearCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Cart() {
  const { data: cart, isLoading } = useGetCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();
  const clearCart = useClearCart();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });

  const handleQuantity = (productId: number, qty: number) => {
    if (qty <= 0) {
      removeItem.mutate({ productId }, { onSuccess: invalidate });
    } else {
      updateItem.mutate({ productId, data: { productId, quantity: qty } }, { onSuccess: invalidate });
    }
  };

  const handleClear = () => {
    clearCart.mutate(undefined, { onSuccess: () => { invalidate(); toast({ title: "Cart cleared" }); } });
  };

  if (isLoading) return (
    <div className="max-w-4xl mx-auto space-y-3">
      {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
    </div>
  );

  if (!cart || cart.items.length === 0) return (
    <div className="flex flex-col items-center justify-center py-24 text-center max-w-xs mx-auto">
      <div className="w-24 h-24 bg-green-50 rounded-3xl flex items-center justify-center mb-5 shadow-sm">
        <ShoppingBag className="w-11 h-11 text-[#0c831f]" />
      </div>
      <h2 className="text-xl font-black text-gray-900 mb-2">Your cart is empty</h2>
      <p className="text-sm text-gray-500 mb-6 leading-relaxed">Add fresh groceries from our store to get them delivered in 10 minutes!</p>
      <Link href="/products">
        <Button className="rounded-2xl px-8 h-12 bg-[#0c831f] hover:bg-[#0a6e19] font-bold text-sm gap-2">
          Start Shopping <ArrowRight className="w-4 h-4" />
        </Button>
      </Link>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Items column */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">My Cart <span className="text-gray-400 font-normal text-base">({cart.itemCount} items)</span></h2>
            <button onClick={handleClear} className="text-xs text-red-500 font-semibold flex items-center gap-1 hover:text-red-600 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Clear all
            </button>
          </div>

          <div className="space-y-3">
            {cart.items.map((item) => (
              <div key={item.productId} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
                <div className="w-18 h-18 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden border border-gray-100" style={{ width: 72, height: 72 }}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                  ) : (
                    <ShoppingBag className="w-8 h-8 text-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900 leading-tight truncate">{item.productName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.unit}</p>
                  <p className="text-sm font-bold text-[#0c831f] mt-1">₹{item.price} <span className="text-gray-400 font-normal">each</span></p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <p className="text-sm font-bold text-gray-900">₹{item.subtotal}</p>
                  <div className="flex items-center gap-0 bg-[#0c831f] rounded-xl overflow-hidden h-8 shadow-sm">
                    <button
                      onClick={() => handleQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-full flex items-center justify-center hover:bg-black/10 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5 text-white" />
                    </button>
                    <span className="w-7 text-center text-white text-sm font-bold">{item.quantity}</span>
                    <button
                      onClick={() => handleQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-full flex items-center justify-center hover:bg-black/10 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary column */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm sticky top-24">
            <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#0c831f]" /> Price Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal ({cart.itemCount} items)</span>
                <span className="font-semibold text-gray-900">₹{cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery Charge</span>
                {cart.deliveryCharge === 0 ? (
                  <span className="text-green-600 font-bold">FREE</span>
                ) : (
                  <span className="font-semibold text-gray-900">₹{cart.deliveryCharge}</span>
                )}
              </div>
              {cart.subtotal < 500 && (
                <div className="bg-green-50 border border-green-100 rounded-xl px-3 py-2">
                  <p className="text-xs text-green-700 font-medium">
                    🎉 Add <span className="font-bold">₹{(500 - cart.subtotal).toFixed(0)}</span> more for free delivery!
                  </p>
                </div>
              )}
              <div className="border-t border-gray-100 pt-3 flex justify-between">
                <span className="font-bold text-gray-900">Total Amount</span>
                <span className="font-black text-[#0c831f] text-lg">₹{cart.total.toFixed(2)}</span>
              </div>
            </div>

            <Link href="/checkout">
              <Button className="w-full h-12 mt-5 text-sm font-bold rounded-2xl bg-[#0c831f] hover:bg-[#0a6e19] gap-2 shadow-md">
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <p className="text-xs text-gray-400 text-center mt-3">Secure checkout · COD available</p>
          </div>
        </div>
      </div>
    </div>
  );
}
