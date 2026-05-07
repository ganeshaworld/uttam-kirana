import { useState } from "react";
import { Link } from "wouter";
import { useGetCategories, useGetFeaturedProducts, useGetProducts } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Clock, Star, Shield } from "lucide-react";

const BANNERS = [
  {
    title: "Fresh Vegetables",
    subtitle: "Farm-fresh produce delivered in 10 minutes",
    cta: "Shop Vegetables",
    href: "/products?category=vegetables",
    bg: "from-emerald-600 to-teal-700",
    img: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Seasonal Fruits",
    subtitle: "Hand-picked, naturally sweet & nutritious",
    cta: "Shop Fruits",
    href: "/products?category=fruits",
    bg: "from-orange-500 to-amber-600",
    img: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Dairy Essentials",
    subtitle: "Milk, paneer, curd & more — always fresh",
    cta: "Shop Dairy",
    href: "/products?category=dairy",
    bg: "from-blue-500 to-cyan-600",
    img: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=900&q=80",
  },
];

const CATEGORY_IMAGES: Record<string, string> = {
  fruits: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=200&q=80",
  vegetables: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=200&q=80",
  dairy: "https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=200&q=80",
  snacks: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?auto=format&fit=crop&w=200&q=80",
  beverages: "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=200&q=80",
  "personal-care": "https://images.unsplash.com/photo-1607006344380-b6775a0824a7?auto=format&fit=crop&w=200&q=80",
};

export default function Home() {
  const [bannerIdx, setBannerIdx] = useState(0);
  const { data: categories, isLoading: catsLoading } = useGetCategories();
  const { data: featured, isLoading: featLoading } = useGetFeaturedProducts();
  const { data: snacksData } = useGetProducts({ category: "snacks", limit: 4, offset: 0 });
  const { data: beveragesData } = useGetProducts({ category: "beverages", limit: 4, offset: 0 });

  const banner = BANNERS[bannerIdx % BANNERS.length]!;

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div
        className="relative rounded-3xl overflow-hidden cursor-pointer group"
        style={{ minHeight: 220 }}
        onClick={() => setBannerIdx((i) => i + 1)}
      >
        <img
          src={banner.img}
          alt={banner.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className={`absolute inset-0 bg-gradient-to-r ${banner.bg} opacity-80`} />
        <div className="relative z-10 p-7 md:p-10 max-w-xl">
          <div className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3 backdrop-blur-sm">
            <Clock className="w-3 h-3" /> 10 Min Delivery
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-tight mb-2">
            {banner.title}
          </h2>
          <p className="text-white/90 text-sm md:text-base mb-5">{banner.subtitle}</p>
          <Link href={banner.href} onClick={(e) => e.stopPropagation()}>
            <span className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors shadow-lg">
              {banner.cta} <ChevronRight className="w-4 h-4" />
            </span>
          </Link>
        </div>
        {/* Dots */}
        <div className="absolute bottom-4 right-5 flex gap-1.5">
          {BANNERS.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setBannerIdx(i); }}
              className={`h-1.5 rounded-full transition-all ${i === bannerIdx % BANNERS.length ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
            />
          ))}
        </div>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Clock, title: "10 Min Delivery", sub: "Lightning fast" },
          { icon: Star, title: "Fresh Products", sub: "Farm to door" },
          { icon: Shield, title: "Secure Payment", sub: "100% safe" },
        ].map(({ icon: Icon, title, sub }) => (
          <div key={title} className="bg-white rounded-2xl p-3 md:p-4 text-center border border-gray-100 shadow-sm">
            <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Icon className="w-4 h-4 text-[#0c831f]" />
            </div>
            <p className="font-bold text-xs md:text-sm text-gray-900">{title}</p>
            <p className="text-[10px] md:text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg md:text-xl font-bold text-gray-900">Shop by Category</h3>
          <Link href="/products">
            <span className="text-sm text-[#0c831f] font-semibold flex items-center gap-1 hover:underline">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
        {catsLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {(categories ?? []).map((cat) => (
              <Link key={cat.id} href={`/products?category=${cat.slug}`}>
                <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer">
                  <div className="relative overflow-hidden" style={{ paddingTop: "65%" }}>
                    <img
                      src={CATEGORY_IMAGES[cat.slug] ?? ""}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                  <div className="p-2.5 text-center">
                    <p className="text-xs font-bold text-gray-900 leading-tight">{cat.name}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Featured / Hot Deals */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <h3 className="text-lg md:text-xl font-bold text-gray-900">Hot Deals</h3>
            <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full animate-pulse">SALE</span>
          </div>
          <Link href="/products">
            <span className="text-sm text-[#0c831f] font-semibold flex items-center gap-1 hover:underline">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
        {featLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {(featured ?? []).slice(0, 10).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Snacks Section */}
      {snacksData && snacksData.products.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg md:text-xl font-bold text-gray-900">Snacks & Munchies</h3>
            <Link href="/products?category=snacks">
              <span className="text-sm text-[#0c831f] font-semibold flex items-center gap-1 hover:underline">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {snacksData.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Beverages Section */}
      {beveragesData && beveragesData.products.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg md:text-xl font-bold text-gray-900">Beverages</h3>
            <Link href="/products?category=beverages">
              <span className="text-sm text-[#0c831f] font-semibold flex items-center gap-1 hover:underline">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {beveragesData.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* Free Delivery Banner */}
      <div className="relative rounded-3xl overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80"
          alt="Fresh groceries"
          className="w-full h-40 md:h-52 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0c831f]/90 to-[#0c831f]/60 flex items-center px-7 md:px-10">
          <div>
            <p className="text-2xl md:text-3xl font-black text-white mb-1">🚀 Free Delivery</p>
            <p className="text-white/90 text-sm md:text-base">On all orders above ₹500. Fresh groceries, delivered fast.</p>
            <Link href="/products">
              <span className="inline-block mt-3 bg-white text-[#0c831f] font-bold text-sm px-5 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                Start Shopping
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="h-2" />
    </div>
  );
}
