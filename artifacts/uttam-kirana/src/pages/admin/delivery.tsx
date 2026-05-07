import { useGetDeliveryBoys, useGetOrders, useAssignDelivery, useUpdateOrderStatus, getGetOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Truck, Package, MapPin, Clock, User, CheckCircle2, Star } from "lucide-react";
import type { Order } from "@workspace/api-client-react";

const STATUS_BG: Record<string, string> = { placed: "bg-blue-100 text-blue-700", confirmed: "bg-indigo-100 text-indigo-700", packed: "bg-purple-100 text-purple-700", out_for_delivery: "bg-orange-100 text-orange-700", delivered: "bg-green-100 text-green-700", cancelled: "bg-red-100 text-red-700" };
const STATUS_LABELS: Record<string, string> = { placed: "Placed", confirmed: "Confirmed", packed: "Packed", out_for_delivery: "Out for Delivery", delivered: "Delivered", cancelled: "Cancelled" };
const STATUSES = ["placed", "confirmed", "packed", "out_for_delivery", "delivered", "cancelled"] as const;

export default function AdminDelivery() {
  const { data: boys, isLoading: boysLoading } = useGetDeliveryBoys();
  const { data: allOrders, isLoading: ordersLoading } = useGetOrders({ limit: 200, offset: 0 });
  const assignDelivery = useAssignDelivery();
  const updateStatus = useUpdateOrderStatus();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getGetOrdersQueryKey() });

  const handleAssign = (orderId: number, boyId: string) => {
    assignDelivery.mutate({ orderId, data: { deliveryBoyId: Number(boyId) } }, {
      onSuccess: () => { invalidate(); toast({ title: "Delivery assigned" }); }
    });
  };

  const handleStatus = (orderId: number, status: string) => {
    updateStatus.mutate({ orderId, data: { status: status as typeof STATUSES[number] } }, {
      onSuccess: () => { invalidate(); toast({ title: `Order #${orderId} updated` }); }
    });
  };

  const orders = allOrders ?? [];
  const activeOrders = orders.filter(o => o.status !== "delivered" && o.status !== "cancelled");
  const unassigned = activeOrders.filter(o => !o.deliveryBoyId);

  return (
    <div className="p-5 lg:p-7 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-gray-900">Delivery Management</h1>
        <p className="text-sm text-gray-400 mt-0.5">{activeOrders.length} active · {unassigned.length} unassigned</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Active Orders", value: activeOrders.length, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
          { label: "Unassigned", value: unassigned.length, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
          { label: "Out for Delivery", value: orders.filter(o => o.status === "out_for_delivery").length, color: "text-orange-600", bg: "bg-orange-50 border-orange-100" },
          { label: "Delivered Today", value: orders.filter(o => o.status === "delivered" && new Date(o.updatedAt).toDateString() === new Date().toDateString()).length, color: "text-[#0c831f]", bg: "bg-green-50 border-green-100" },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} border rounded-2xl p-4`}>
            <p className={`text-2xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Unassigned Orders */}
      {unassigned.length > 0 && (
        <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            Unassigned Orders ({unassigned.length})
          </h3>
          <div className="space-y-3">
            {unassigned.map(order => (
              <div key={order.id} className="flex items-center gap-3 p-3 bg-amber-50 rounded-2xl border border-amber-100">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm">#{order.id}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${STATUS_BG[order.status] ?? ""}`}>{STATUS_LABELS[order.status]}</span>
                  </div>
                  <p className="text-xs text-gray-500">{order.userName} · ₹{Number(order.total).toFixed(0)}</p>
                  <p className="text-xs text-gray-400 truncate flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3 shrink-0" />{order.deliveryAddress}</p>
                </div>
                <Select value="" onValueChange={(v) => handleAssign(order.id, v)}>
                  <SelectTrigger className="w-44 h-9 rounded-xl text-xs border-amber-200 bg-white">
                    <SelectValue placeholder="Assign boy" />
                  </SelectTrigger>
                  <SelectContent>
                    {(boys ?? []).map(b => <SelectItem key={b.id} value={String(b.id)}>{b.name ?? `Boy #${b.id}`}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delivery Boys */}
      <div>
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Truck className="w-4 h-4 text-[#0c831f]" /> Delivery Team
        </h3>
        {boysLoading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}</div>
        ) : !boys || boys.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 py-12 text-center text-gray-400">
            <Truck className="w-10 h-10 mx-auto mb-2 text-gray-200" />
            <p className="text-sm font-semibold">No delivery boys found</p>
            <p className="text-xs mt-1">Add delivery boys from the Users section</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {boys.map(boy => {
              const assigned = orders.filter(o => o.deliveryBoyId === boy.id && o.status !== "delivered" && o.status !== "cancelled");
              const delivered = orders.filter(o => o.deliveryBoyId === boy.id && o.status === "delivered");
              const onRoute = orders.find(o => o.deliveryBoyId === boy.id && o.status === "out_for_delivery");
              return (
                <div key={boy.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-[#0c831f]/10 rounded-2xl flex items-center justify-center font-black text-[#0c831f] text-lg">
                        {boy.name?.[0]?.toUpperCase() ?? <User className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{boy.name ?? `Delivery #${boy.id}`}</p>
                        <p className="text-xs text-gray-400">+91 {boy.mobile}</p>
                      </div>
                      <div className={`ml-auto w-2.5 h-2.5 rounded-full ${onRoute ? "bg-green-500 animate-pulse" : assigned.length > 0 ? "bg-amber-400" : "bg-gray-300"}`} />
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-gray-50 rounded-xl p-2 text-center">
                        <p className="font-black text-gray-900">{assigned.length}</p>
                        <p className="text-[9px] text-gray-400 uppercase font-semibold">Active</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-2 text-center">
                        <p className="font-black text-[#0c831f]">{delivered.length}</p>
                        <p className="text-[9px] text-gray-400 uppercase font-semibold">Done</p>
                      </div>
                      <div className="bg-orange-50 rounded-xl p-2 text-center">
                        <p className="font-black text-orange-600">{onRoute ? 1 : 0}</p>
                        <p className="text-[9px] text-gray-400 uppercase font-semibold">On Way</p>
                      </div>
                    </div>

                    {assigned.length > 0 ? (
                      <div className="space-y-2">
                        {assigned.map(order => (
                          <div key={order.id} className="bg-gray-50 rounded-xl p-2.5">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-xs text-gray-900">Order #{order.id}</span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${STATUS_BG[order.status]}`}>{STATUS_LABELS[order.status]}</span>
                            </div>
                            <p className="text-[10px] text-gray-500 truncate"><MapPin className="w-2.5 h-2.5 inline mr-0.5" />{order.deliveryAddress}</p>
                            <div className="flex gap-1 mt-2">
                              {order.status === "packed" && (
                                <button onClick={() => handleStatus(order.id, "out_for_delivery")} className="flex items-center gap-1 text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded-lg hover:bg-orange-200 transition-colors">
                                  <Truck className="w-3 h-3" /> Dispatch
                                </button>
                              )}
                              {order.status === "out_for_delivery" && (
                                <button onClick={() => handleStatus(order.id, "delivered")} className="flex items-center gap-1 text-[10px] font-bold bg-green-100 text-[#0c831f] px-2 py-1 rounded-lg hover:bg-green-200 transition-colors">
                                  <CheckCircle2 className="w-3 h-3" /> Delivered
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-3 text-xs text-gray-400">No active orders assigned</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
