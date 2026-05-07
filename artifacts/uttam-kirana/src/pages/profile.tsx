import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useUpdateAddress, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { User, MapPin, Phone, Star, Wallet, LogOut, ChevronRight, Edit2 } from "lucide-react";

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const updateAddress = useUpdateAddress();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [editing, setEditing] = useState(false);
  const [address, setAddress] = useState(user?.address ?? "");
  const [city, setCity] = useState(user?.city ?? "");
  const [pincode, setPincode] = useState(user?.pincode ?? "");

  const handleSave = () => {
    updateAddress.mutate(
      { data: { address, city, pincode } },
      {
        onSuccess: (updated) => {
          updateUser(updated);
          queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
          setEditing(false);
          toast({ title: "Address updated" });
        },
      }
    );
  };

  if (!user) return null;

  return (
    <div className="space-y-4">
      {/* Profile Card */}
      <div className="bg-gradient-to-br from-primary to-emerald-600 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center font-bold text-2xl">
            {user.name ? user.name[0]!.toUpperCase() : "U"}
          </div>
          <div>
            <h2 className="text-lg font-bold">{user.name ?? "User"}</h2>
            <div className="flex items-center gap-1 text-white/80 text-sm">
              <Phone className="w-3.5 h-3.5" />
              <span>+91 {user.mobile}</span>
            </div>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full capitalize font-medium mt-1 inline-block">{user.role}</span>
          </div>
        </div>
      </div>

      {/* Wallet & Points */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-card-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground font-medium">Wallet Balance</span>
          </div>
          <p className="text-xl font-bold text-foreground">₹{Number(user.walletBalance).toFixed(2)}</p>
        </div>
        <div className="bg-card border border-card-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Star className="w-4 h-4 text-amber-500" />
            <span className="text-xs text-muted-foreground font-medium">Reward Points</span>
          </div>
          <p className="text-xl font-bold text-foreground">{user.rewardPoints}</p>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="bg-card border border-card-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="font-bold text-sm">Delivery Address</span>
          </div>
          <button onClick={() => setEditing(!editing)} data-testid="button-edit-address" className="text-primary">
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
        {editing ? (
          <div className="space-y-2">
            <Input placeholder="Full address" value={address} onChange={(e) => setAddress(e.target.value)} className="rounded-xl" data-testid="input-address" />
            <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="rounded-xl" data-testid="input-city" />
            <Input placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} className="rounded-xl" data-testid="input-pincode" />
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 rounded-xl" onClick={handleSave} disabled={updateAddress.isPending}>Save</Button>
              <Button size="sm" variant="outline" className="flex-1 rounded-xl" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{user.address ? `${user.address}${user.city ? ", " + user.city : ""}${user.pincode ? " - " + user.pincode : ""}` : "No address saved"}</p>
        )}
      </div>

      {/* Menu Items */}
      <div className="bg-card border border-card-border rounded-xl overflow-hidden">
        {[
          { label: "My Orders", href: "/orders", icon: "📦" },
          { label: "Notifications", href: "#", icon: "🔔" },
          { label: "Help & Support", href: "#", icon: "💬" },
        ].map((item) => (
          <a key={item.label} href={item.href} className="flex items-center gap-3 px-4 py-3.5 hover:bg-muted/50 border-b border-border last:border-0 transition-colors">
            <span className="text-lg">{item.icon}</span>
            <span className="flex-1 text-sm font-medium">{item.label}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </a>
        ))}
      </div>

      {/* Logout */}
      <Button variant="destructive" className="w-full rounded-xl" onClick={logout} data-testid="button-logout">
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
    </div>
  );
}
