import { useState } from "react";
import { useGetOrders, useUpdateOrderStatus, useAssignDelivery, useGetDeliveryBoys, getGetOrdersQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Package, User, Search, ChevronDown, ChevronUp, MapPin, Clock, CreditCard, Truck, CheckCircle2, XCircle, Phone } from "lucide-react";
import type { Order } from "@workspace/api-client-react";

const STATUSES = ["placed", "confirmed", "packed", "out_for_delivery", "delivered", "cancelled"] as const;
type Status = typeof STATUSES[number];
const STATUS_LABELS: Record<string, string> = { placed: "Placed", confirmed: "Confirmed", packed: "Packed", out_for_delivery: "Out for Delivery", delivered: "Delivered", cancelled: "Cancelled" };
const STATUS_BG: Record<string, string> = { placed: "bg-blue-100 text-blue-700", confirmed: "bg-indigo-100 text-indigo-700", packed: "bg-purple-100 text-purple-700", out_for_delivery: "bg-orange-100 text-orange-700", delivered: "bg-green-100 text-green-700", cancelled: "bg-red-100 text-red-700" };
const STATUS_DOT: Record<string, string> = { placed: "bg-blue-400", confirmed: "bg-indigo-400", packed: "bg-purple-400", out_for_delivery: "bg-orange-400", delivered: "bg-green-500", cancelled: "bg-red-400" };
const NEXT_STATUS: Record<string, Status | null> = { placed: "confirmed", confirmed: "packed", packed: "out_for_delivery", out_for_delivery: "delivered", delivered: null, cancelled: null };
const NEXT_LABEL: Record<string, string> = { placed: "Confirm Order", confirmed: "Mark as Packed", packed: "Out for Delivery", out_for_delivery: "Mark Delivered" };

const STATUS_TABS = [{ key: "", label: "All" }, { key: "placed", label: "New" }, { key: "confirmed", label: "Confirmed" }, { key: "packed", label: "Packed" }, { key: "out_for_delivery", label: "On Way" }, { key: "delivered", label: "Delivered" }, { key: "cancelled", label: "Cancelled" }];

function OrderCard({ order, onStatusChange, onAssign, deliveryBoys, updating }: {
  order: Order;
  onStatusChange: (id: number, status: string) => void;
  onAssign: (id: number, boyId: string) => void;
  deliveryBoys: Array<{ id: number; name?: string | null; mobile: string }>;
  updating: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const items = order.items as Array<{ productName: string; quantity: number; price: number; unit?: string }>;
  const next = NEXT_STATUS[order.status];
  const isTerminal = order.status === "delivered" || order.status === "cancelled";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 flex items-start gap-3">
        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${STATUS_DOT[order.status] ?? "bg-gray-300"}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-gray-900 text-sm">Order #{order.id}</span>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${STATUS_BG[order.status] ?? "bg-gray-100 text-gray-700"}`}>
              {STATUS_LABELS[order.status]}
            </span>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold ${order.paymentMethod === "online" ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-600"}`}>
              {order.paymentMethod === "cod" ? "💵 COD" : "💳 Online"}
            </span>
            {order.paymentStatus === "paid" && <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">Paid</span>}
          </div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-gray-500">
            <span className="flex items-center gap-1"><User className="w-3 h-3" /> {order.userName ?? "Customer"} · {order.userMobile}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(order.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
          </div>
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{order.deliveryAddress}</span>
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-black text-[#0c831f] text-lg">₹{Number(order.total).toFixed(0)}</p>
          <p className="text-xs text-gray-400">{items.length} item{items.length > 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Item summary (collapsed) */}
      <div className="px-5 pb-3 border-b border-gray-100">
        <p className="text-xs text-gray-500 truncate">
          {items.slice(0, 3).map(i => `${i.productName} ×${i.quantity}`).join(", ")}
          {items.length > 3 ? ` +${items.length - 3} more` : ""}
        </p>
      </div>

      {/* Expanded items */}
      {expanded && (
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <div>
                  <p className="font-semibold text-gray-800">{item.productName}</p>
                  <p className="text-xs text-gray-400">×{item.quantity}{item.unit ? ` · ${item.unit}` : ""}</p>
                </div>
                <p className="font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(0)}</p>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-2 flex justify-between text-sm">
              <span className="text-gray-500">Delivery</span>
              <span className={order.deliveryCharge === 0 ? "text-green-600 font-bold" : "text-gray-700"}>{order.deliveryCharge === 0 ? "Free" : `₹${order.deliveryCharge}`}</span>
            </div>
            <div className="flex justify-between font-bold text-sm">
              <span>Total</span>
              <span className="text-[#0c831f]">₹{Number(order.total).toFixed(0)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-5 py-3 flex items-center gap-2 flex-wrap">
        {/* Next-step quick button */}
        {next && NEXT_LABEL[order.status] && (
          <button
            onClick={() => onStatusChange(order.id, next)}
            disabled={updating}
            className="flex items-center gap-1.5 bg-[#0c831f] text-white text-xs font-bold px-3 py-2 rounded-xl hover:bg-[#0a6e19] transition-colors disabled:opacity-60 shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> {NEXT_LABEL[order.status]}
          </button>
        )}
        {!isTerminal && order.status !== "cancelled" && (
          <button
            onClick={() => onStatusChange(order.id, "cancelled")}
            disabled={updating}
            className="flex items-center gap-1.5 bg-red-50 text-red-600 text-xs font-bold px-3 py-2 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-60"
          >
            <XCircle className="w-3.5 h-3.5" /> Cancel
          </button>
        )}
        {/* Status select (full control) */}
        <Select value={order.status} onValueChange={(v) => onStatusChange(order.id, v)}>
          <SelectTrigger className="h-8 text-xs rounded-xl w-40 bg-gray-50 border-gray-200"><SelectValue /></SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
          </SelectContent>
        </Select>

        {/* Assign delivery */}
        {!isTerminal && (
          <Select value={order.deliveryBoyId ? String(order.deliveryBoyId) : ""} onValueChange={(v) => onAssign(order.id, v)}>
            <SelectTrigger className="h-8 text-xs rounded-xl w-44 bg-gray-50 border-gray-200">
              <SelectValue placeholder="Assign delivery boy" />
            </SelectTrigger>
            <SelectContent>
              {deliveryBoys.map((db) => (
                <SelectItem key={db.id} value={String(db.id)}>
                  <span className="flex items-center gap-2"><Truck className="w-3 h-3" /> {db.name ?? `Boy #${db.id}`}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {order.deliveryBoyName && (
          <span className="flex items-center gap-1 text-xs text-gray-500 ml-1">
            <Truck className="w-3 h-3 text-orange-500" /> {order.deliveryBoyName}
          </span>
        )}

        <button onClick={() => setExpanded(!expanded)} className="ml-auto flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
          {expanded ? <><ChevronUp className="w-3.5 h-3.5" /> Less</> : <><ChevronDown className="w-3.5 h-3.5" /> Details</>}
        </button>
      </div>
    </div>
  );
}

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const { data: orders, isLoading } = useGetOrders({ status: activeTab || undefined, limit: 100, offset: 0 });
  const { data: deliveryBoys } = useGetDeliveryBoys();
  const updateStatus = useUpdateOrderStatus();
  const assignDelivery = useAssignDelivery();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getGetOrdersQueryKey() });

  const handleStatus = (orderId: number, status: string) => {
    setUpdatingId(orderId);
    updateStatus.mutate(
      { orderId, data: { status: status as Status } },
      { onSuccess: () => { invalidate(); setUpdatingId(null); toast({ title: `Order #${orderId} → ${STATUS_LABELS[status]}` }); }, onError: () => setUpdatingId(null) }
    );
  };

  const handleAssign = (orderId: number, deliveryBoyId: string) => {
    assignDelivery.mutate(
      { orderId, data: { deliveryBoyId: Number(deliveryBoyId) } },
      { onSuccess: () => { invalidate(); toast({ title: "Delivery assigned" }); } }
    );
  };

  const filtered = (orders ?? []).filter(o => {
    if (!search) return true;
    const s = search.toLowerCase();
    return String(o.id).includes(s) || (o.userName ?? "").toLowerCase().includes(s) || (o.userMobile ?? "").includes(s);
  });

  const tabCounts: Record<string, number> = {};
  (orders ?? []).forEach(o => { tabCounts[o.status] = (tabCounts[o.status] ?? 0) + 1; });

  return (
    <div className="p-5 lg:p-7 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Orders</h1>
          <p className="text-sm text-gray-400">{orders?.length ?? 0} orders total</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {STATUS_TABS.map(tab => {
          const count = tab.key ? (tabCounts[tab.key] ?? 0) : (orders?.length ?? 0);
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${active ? "bg-[#0c831f] text-white shadow-sm" : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"}`}
            >
              {tab.label}
              {count > 0 && <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input placeholder="Search by order ID, customer name or phone…" className="pl-10 rounded-2xl bg-white border-gray-200 shadow-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Orders */}
      {isLoading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
          <Package className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="font-bold text-gray-500">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onStatusChange={handleStatus}
              onAssign={handleAssign}
              deliveryBoys={deliveryBoys ?? []}
              updating={updatingId === order.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
