import { useState } from "react";
import { useGetCart, useAddToCart, useUpdateCartItem, getGetCartQueryKey, type Product } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { data: cart } = useGetCart();
  const addToCart = useAddToCart();
  const updateCartItem = useUpdateCartItem();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const cartItem = cart?.items?.find((i) => i.productId === product.id);
  const quantity = cartItem?.quantity ?? 0;
  const invalidate = () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });

  const handleAdd = () => {
    if (loading) return;
    setLoading(true);
    if (quantity === 0) {
      addToCart.mutate(
        { data: { productId: product.id, quantity: 1 } },
        { onSuccess: () => { invalidate(); setLoading(false); }, onError: () => { toast({ title: "Failed to add", variant: "destructive" }); setLoading(false); } }
      );
    } else {
      updateCartItem.mutate(
        { productId: product.id, data: { productId: product.id, quantity: quantity + 1 } },
        { onSuccess: () => { invalidate(); setLoading(false); }, onError: () => { setLoading(false); } }
      );
    }
  };

  const handleRemove = () => {
    if (loading || quantity === 0) return;
    setLoading(true);
    updateCartItem.mutate(
      { productId: product.id, data: { productId: product.id, quantity: quantity - 1 } },
      { onSuccess: () => { invalidate(); setLoading(false); }, onError: () => { setLoading(false); } }
    );
  };

  const hasDiscount = product.discount && product.discount > 0;
  const outOfStock = product.stock === 0;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group border border-gray-100 flex flex-col">
      {/* Image */}
      <div className="relative overflow-hidden bg-gray-50" style={{ paddingTop: "70%" }}>
        <div className="absolute inset-0">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <ShoppingCart className="w-10 h-10 text-gray-300" />
            </div>
          )}
          {/* Badges */}
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-sm">
              {product.discount}% OFF
            </div>
          )}
          {outOfStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1 rounded-full shadow">Out of Stock</span>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-[11px] text-gray-400 font-medium mb-0.5">{product.unit}</p>
        <h3 className="font-semibold text-sm text-gray-900 leading-snug line-clamp-2 flex-1 mb-2">{product.name}</h3>

        <div className="flex items-center justify-between gap-2 mt-auto">
          <div>
            <span className="font-bold text-gray-900 text-base">₹{product.price}</span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-[11px] text-gray-400 line-through ml-1.5">₹{product.mrp}</span>
            )}
          </div>

          {quantity > 0 ? (
            <div className="flex items-center gap-0 bg-[#0c831f] rounded-xl overflow-hidden h-8 shadow-sm">
              <button
                onClick={handleRemove}
                disabled={loading}
                className="w-8 h-full flex items-center justify-center hover:bg-black/10 transition-colors disabled:opacity-60"
              >
                <Minus className="w-3.5 h-3.5 text-white" />
              </button>
              <span className="w-7 text-center text-white text-sm font-bold leading-none">{quantity}</span>
              <button
                onClick={handleAdd}
                disabled={loading}
                className="w-8 h-full flex items-center justify-center hover:bg-black/10 transition-colors disabled:opacity-60"
              >
                <Plus className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={loading || outOfStock}
              className="h-8 px-4 bg-white border-2 border-[#0c831f] text-[#0c831f] rounded-xl text-xs font-bold hover:bg-[#0c831f] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {outOfStock ? "Sold Out" : "ADD"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
