import { useState, useEffect } from "react";
import { useSearch } from "wouter";
import { useGetProducts, useGetCategories } from "@workspace/api-client-react";
import { ProductCard } from "@/components/ProductCard";
import { Input } from "@/components/ui/input";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Products() {
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const initialCategory = params.get("category") ?? "";

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  const { data: categories } = useGetCategories();
  const { data, isLoading } = useGetProducts(
    { search: search || undefined, category: selectedCategory || undefined, limit: 60, offset: 0 },
    { query: { queryKey: ["products", search, selectedCategory] as unknown[] } }
  );

  const products = data?.products ?? [];

  return (
    <div className="flex gap-6">
      {/* Desktop sidebar for categories */}
      <aside className="hidden lg:block w-52 shrink-0">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sticky top-24">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Categories
          </p>
          <div className="space-y-0.5">
            <button
              onClick={() => setSelectedCategory("")}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${!selectedCategory ? "bg-[#0c831f] text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"}`}
            >
              All Products
            </button>
            {(categories ?? []).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.slug ? "" : cat.slug)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${selectedCategory === cat.slug ? "bg-[#0c831f] text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            data-testid="input-search"
            type="search"
            placeholder="Search for groceries, brands…"
            className="pl-10 pr-10 h-12 rounded-2xl bg-white border-gray-200 shadow-sm focus-visible:ring-[#0c831f] text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="absolute right-3.5 top-1/2 -translate-y-1/2" onClick={() => setSearch("")}>
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Mobile category chips */}
        <div className="lg:hidden flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory("")}
            className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${!selectedCategory ? "bg-[#0c831f] text-white border-[#0c831f]" : "bg-white text-gray-600 border-gray-200"}`}
          >
            All
          </button>
          {(categories ?? []).map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(selectedCategory === cat.slug ? "" : cat.slug)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${selectedCategory === cat.slug ? "bg-[#0c831f] text-white border-[#0c831f]" : "bg-white text-gray-600 border-gray-200"}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Page title + count */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {selectedCategory
                ? (categories ?? []).find((c) => c.slug === selectedCategory)?.name ?? "Products"
                : "All Products"}
            </h2>
            {!isLoading && (
              <p className="text-sm text-gray-400 mt-0.5">{data?.total ?? 0} items</p>
            )}
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-60 rounded-2xl" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-4 text-4xl">🔍</div>
            <h3 className="font-bold text-gray-800 text-lg">No products found</h3>
            <p className="text-sm text-gray-500 mt-1">Try a different search or category</p>
            <button onClick={() => { setSearch(""); setSelectedCategory(""); }} className="mt-4 text-sm font-semibold text-[#0c831f] hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="h-4" />
      </div>
    </div>
  );
}
