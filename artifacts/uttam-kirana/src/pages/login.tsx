import { useState } from "react";
import { useLocation } from "wouter";
import { useSendOtp, useVerifyOtp } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, ChevronLeft, ShieldCheck } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<1 | 2>(1);
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);

  const sendOtp = useSendOtp();
  const verifyOtp = useVerifyOtp();

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobile.length !== 10) {
      toast({ title: "Invalid number", description: "Enter a 10-digit mobile number", variant: "destructive" });
      return;
    }
    sendOtp.mutate({ data: { mobile } }, {
      onSuccess: (data) => {
        setStep(2);
        if (data.otp) setOtp(data.otp);
        if (data.message.toLowerCase().includes("new")) setIsNewUser(true);
        toast({ title: "OTP sent", description: `Code: ${data.otp ?? "check your phone"}` });
      },
      onError: (err: unknown) => toast({ title: "Error", description: err instanceof Error ? err.message : "Failed", variant: "destructive" }),
    });
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    verifyOtp.mutate({ data: { mobile, otp, name: isNewUser ? name : undefined } }, {
      onSuccess: (data) => {
        login(data.token, data.user);
        if (data.user.role === "admin") setLocation("/admin");
        else if (data.user.role === "delivery") setLocation("/delivery");
        else setLocation("/");
      },
      onError: (err: unknown) => toast({ title: "Invalid OTP", description: err instanceof Error ? err.message : "Try again", variant: "destructive" }),
    });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — hero image (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80"
          alt="Fresh groceries"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c831f]/95 via-[#0c831f]/80 to-emerald-800/70" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <span className="font-black text-[#0c831f] text-lg">UK</span>
            </div>
            <div>
              <p className="font-black text-white text-xl">Uttam Kirana</p>
              <p className="text-white/70 text-xs font-medium tracking-widest uppercase">10 Min Delivery</p>
            </div>
          </div>

          {/* Tagline */}
          <div>
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-4">
              Fresh groceries,<br />at your door in<br />
              <span className="text-yellow-300">10 minutes.</span>
            </h1>
            <p className="text-white/80 text-base max-w-sm leading-relaxed">
              Order from 500+ fresh products — fruits, vegetables, dairy, snacks and more — delivered straight to you.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              {["🥦 Farm Fresh", "🚀 10 Min", "✅ 500+ Products", "💳 Safe Payment"].map((badge) => (
                <span key={badge} className="bg-white/15 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/20">
                  {badge}
                </span>
              ))}
            </div>
          </div>

          <p className="text-white/40 text-xs">© 2025 Uttam Kirana. All rights reserved.</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <div className="lg:hidden bg-[#0c831f] px-6 py-8 text-center">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="font-black text-[#0c831f] text-xl">UK</span>
          </div>
          <h1 className="text-2xl font-black text-white">Uttam Kirana</h1>
          <p className="text-white/70 text-sm mt-1">Fresh groceries, 10 min delivery</p>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-10 bg-gray-50 lg:bg-white">
          <div className="w-full max-w-sm">
            {step === 2 && (
              <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6 font-medium transition-colors">
                <ChevronLeft className="w-4 h-4" /> Change number
              </button>
            )}

            <div className="mb-8">
              <h2 className="text-2xl font-black text-gray-900">
                {step === 1 ? "Sign in to continue" : "Verify your number"}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {step === 1 ? "Enter your mobile number to get started" : `OTP sent to +91 ${mobile}`}
              </p>
            </div>

            {step === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Number</label>
                  <div className="flex gap-2">
                    <div className="flex items-center justify-center bg-gray-100 border border-gray-200 rounded-xl px-3 h-12 text-sm font-semibold text-gray-600 shrink-0">
                      +91
                    </div>
                    <Input
                      type="tel"
                      placeholder="10-digit number"
                      className="h-12 rounded-xl border-gray-200 bg-gray-50 focus-visible:bg-white text-base font-medium"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      maxLength={10}
                      autoFocus
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-bold rounded-xl bg-[#0c831f] hover:bg-[#0a6e19] gap-2"
                  disabled={sendOtp.isPending || mobile.length !== 10}
                >
                  {sendOtp.isPending ? "Sending…" : <>Get OTP <ArrowRight className="w-4 h-4" /></>}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                {isNewUser && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Name</label>
                    <Input
                      type="text"
                      placeholder="Full name"
                      className="h-12 rounded-xl border-gray-200 bg-gray-50 focus-visible:bg-white text-base font-medium"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">OTP Code</label>
                  <Input
                    type="text"
                    placeholder="Enter OTP"
                    className="h-12 rounded-xl border-gray-200 bg-gray-50 focus-visible:bg-white text-center text-xl font-bold tracking-[0.3em] focus-visible:bg-white"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    maxLength={6}
                    autoFocus={!isNewUser}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-bold rounded-xl bg-[#0c831f] hover:bg-[#0a6e19] gap-2"
                  disabled={verifyOtp.isPending || otp.length < 4}
                >
                  {verifyOtp.isPending ? "Verifying…" : <>Verify & Continue <ArrowRight className="w-4 h-4" /></>}
                </Button>
              </form>
            )}

            <div className="flex items-center gap-2 mt-6 text-xs text-gray-400">
              <ShieldCheck className="w-4 h-4 text-gray-300 shrink-0" />
              <span>Your number is safe with us. We never share your data.</span>
            </div>

            {/* Demo credentials */}
            <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-200">
              <p className="text-xs font-bold text-amber-800 mb-2">Demo Credentials</p>
              <div className="space-y-1 text-xs text-amber-700">
                <p>👑 Admin: <span className="font-mono font-bold">9999999999</span></p>
                <p>🚚 Delivery: <span className="font-mono font-bold">8888888888</span></p>
                <p>🛒 Customer: any 10-digit number</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
