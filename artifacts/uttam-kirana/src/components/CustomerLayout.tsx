import { BottomNav } from "./BottomNav";
import { Header } from "./Header";

export function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f0f2f5]">
      <Header />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-5 pb-24 lg:pb-8">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
