import { useState, useRef } from "react";
import {
  useGetProducts, useGetCategories, useCreateProduct, useUpdateProduct, useDeleteProduct,
  useUpdateStock, useCreateCategory, useDeleteCategory,
  getGetProductsQueryKey, getGetCategoriesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit2, Trash2, Search, Package, ImageIcon, Tag, Star, ToggleLeft, ToggleRight, X, FolderPlus } from "lucide-react";
import type { Product } from "@workspace/api-client-react";

type ProductForm = {
  name: string; description: string; price: string; mrp: string; unit: string;
  stock: string; categoryId: string; imageUrl: string; isFeatured: boolean; discount: string; isActive: boolean;
};
type CatForm = { name: string; slug: string; icon: string; color: string };

const EMPTY_FORM: ProductForm = { name: "", description: "", price: "", mrp: "", unit: "", stock: "0", categoryId: "", imageUrl: "", isFeatured: false, discount: "", isActive: true };
const EMPTY_CAT: CatForm = { name: "", slug: "", icon: "🛍️", color: "#0c831f" };

const UNIT_PRESETS = ["1 kg", "500 g", "250 g", "1 L", "500 ml", "250 ml", "1 piece", "6 pieces", "12 pieces", "1 dozen", "100 g", "200 g"];
const COLOR_PRESETS = ["#0c831f", "#3b82f6", "#8b5cf6", "#f97316", "#ef4444", "#06b6d4", "#f59e0b", "#ec4899"];

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data, isLoading } = useGetProducts({ limit: 100, offset: 0 });
  const { data: categories } = useGetCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const updateStock = useUpdateStock();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  const [dialog, setDialog] = useState<"create" | "edit" | "stock" | "newcat" | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [catForm, setCatForm] = useState<CatForm>(EMPTY_CAT);
  const [stockVal, setStockVal] = useState("");
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [imgError, setImgError] = useState(false);

  const invalidateProducts = () => queryClient.invalidateQueries({ queryKey: getGetProductsQueryKey() });
  const invalidateCategories = () => queryClient.invalidateQueries({ queryKey: getGetCategoriesQueryKey() });

  const openCreate = () => { setForm(EMPTY_FORM); setImgError(false); setDialog("create"); };
  const openEdit = (p: Product) => {
    setSelected(p);
    setForm({ name: p.name, description: p.description ?? "", price: String(p.price), mrp: String(p.mrp ?? ""), unit: p.unit, stock: String(p.stock), categoryId: String(p.categoryId), imageUrl: p.imageUrl ?? "", isFeatured: p.isFeatured, discount: String(p.discount ?? ""), isActive: p.isActive });
    setImgError(false);
    setDialog("edit");
  };
  const openStock = (p: Product) => { setSelected(p); setStockVal(String(p.stock)); setDialog("stock"); };

  const handleCreate = () => {
    if (!form.name || !form.price || !form.unit || !form.categoryId) { toast({ title: "Fill required fields", variant: "destructive" }); return; }
    createProduct.mutate({ data: { name: form.name, description: form.description || undefined, price: Number(form.price), mrp: form.mrp ? Number(form.mrp) : undefined, unit: form.unit, stock: Number(form.stock), categoryId: Number(form.categoryId), imageUrl: form.imageUrl || undefined, isFeatured: form.isFeatured, discount: form.discount ? Number(form.discount) : undefined } }, {
      onSuccess: () => { invalidateProducts(); setDialog(null); toast({ title: "✅ Product created!" }); },
      onError: (e: unknown) => toast({ title: "Error", description: e instanceof Error ? e.message : "Failed", variant: "destructive" }),
    });
  };

  const handleEdit = () => {
    if (!selected) return;
    updateProduct.mutate({ productId: selected.id, data: { name: form.name, description: form.description || undefined, price: Number(form.price), mrp: form.mrp ? Number(form.mrp) : undefined, unit: form.unit, stock: Number(form.stock), categoryId: Number(form.categoryId), imageUrl: form.imageUrl || undefined, isFeatured: form.isFeatured, discount: form.discount ? Number(form.discount) : undefined, isActive: form.isActive } }, {
      onSuccess: () => { invalidateProducts(); setDialog(null); toast({ title: "✅ Product updated!" }); },
    });
  };

  const handleDelete = (p: Product) => {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    deleteProduct.mutate({ productId: p.id }, { onSuccess: () => { invalidateProducts(); toast({ title: "Product deleted" }); } });
  };

  const handleStock = () => {
    if (!selected) return;
    updateStock.mutate({ productId: selected.id, data: { stock: Number(stockVal) } }, {
      onSuccess: () => { invalidateProducts(); setDialog(null); toast({ title: "Stock updated" }); },
    });
  };

  const handleCreateCategory = () => {
    if (!catForm.name || !catForm.slug) { toast({ title: "Name and slug required", variant: "destructive" }); return; }
    createCategory.mutate({ data: { name: catForm.name, slug: catForm.slug, icon: catForm.icon || undefined, color: catForm.color || undefined } }, {
      onSuccess: (newCat) => { invalidateCategories(); setForm(f => ({ ...f, categoryId: String(newCat.id) })); setDialog(dialog === "newcat" ? "create" : dialog); toast({ title: `Category "${newCat.name}" created!` }); },
      onError: (e: unknown) => toast({ title: "Error", description: e instanceof Error ? e.message : "Slug may already exist", variant: "destructive" }),
    });
  };

  const products = (data?.products ?? []).filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || String(p.categoryId) === filterCat;
    return matchSearch && matchCat;
  });

  const FormContent = ({ onSubmit, isPending }: { onSubmit: () => void; isPending: boolean }) => (
    <div className="space-y-4 pt-2">
      <div className="grid grid-cols-2 gap-4">
        {/* Left: form fields */}
        <div className="space-y-3 col-span-2 sm:col-span-1">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Product Name *</label>
            <Input placeholder="e.g. Fresh Amul Milk" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Description</label>
            <Input placeholder="Short description..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Sell Price (₹) *</label>
              <Input placeholder="49" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">MRP (₹)</label>
              <Input placeholder="59" type="number" value={form.mrp} onChange={(e) => setForm({ ...form, mrp: e.target.value })} className="rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Unit *</label>
              <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select unit" /></SelectTrigger>
                <SelectContent>
                  {UNIT_PRESETS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  <SelectItem value="custom">Custom…</SelectItem>
                </SelectContent>
              </Select>
              {form.unit === "custom" && (
                <Input placeholder="e.g. 300 ml" className="rounded-xl mt-1" onChange={(e) => setForm({ ...form, unit: e.target.value })} />
              )}
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Stock (units)</label>
              <Input placeholder="50" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="rounded-xl" />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-gray-600">Category *</label>
              <button type="button" onClick={() => { setCatForm(EMPTY_CAT); setDialog("newcat"); }} className="flex items-center gap-1 text-[10px] font-bold text-[#0c831f] hover:underline">
                <FolderPlus className="w-3 h-3" /> New Category
              </button>
            </div>
            <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
              <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                {(categories ?? []).map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.icon ? `${c.icon} ` : ""}{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Discount %</label>
              <Input placeholder="0" type="number" min="0" max="90" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-600 block">Flags</label>
              <div className="flex gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="accent-[#0c831f]" />
                  <span className="text-xs font-medium text-gray-700 flex items-center gap-1"><Star className="w-3 h-3 text-amber-500" /> Featured</span>
                </label>
                {dialog === "edit" && (
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-[#0c831f]" />
                    <span className="text-xs font-medium text-gray-700">Active</span>
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: image */}
        <div className="col-span-2 sm:col-span-1 space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Image URL</label>
            <Input placeholder="https://images.unsplash.com/…" value={form.imageUrl} onChange={(e) => { setForm({ ...form, imageUrl: e.target.value }); setImgError(false); }} className="rounded-xl text-xs" />
            <p className="text-[10px] text-gray-400 mt-1">Paste any image URL (Unsplash, etc.)</p>
          </div>
          {/* Image Preview */}
          <div className="w-full aspect-square rounded-2xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center">
            {form.imageUrl && !imgError ? (
              <img src={form.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={() => setImgError(true)} />
            ) : (
              <div className="text-center">
                <ImageIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400">{imgError ? "Invalid image URL" : "Image preview"}</p>
              </div>
            )}
          </div>
          {/* Unsplash suggestion */}
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Tip: Go to <a href="https://unsplash.com" target="_blank" rel="noreferrer" className="text-[#0c831f] underline">unsplash.com</a>, right-click a photo → "Copy image address" and paste it here.
          </p>
        </div>
      </div>

      <Button className="w-full h-11 text-sm font-bold rounded-xl bg-[#0c831f] hover:bg-[#0a6e19]" onClick={onSubmit} disabled={isPending}>
        {isPending ? "Saving…" : dialog === "create" ? "Create Product" : "Update Product"}
      </Button>
    </div>
  );

  return (
    <div className="p-5 lg:p-7 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Products</h1>
          <p className="text-sm text-gray-400">{data?.total ?? 0} products in catalogue</p>
        </div>
        <div className="sm:ml-auto flex gap-2">
          <Button onClick={openCreate} className="gap-2 rounded-xl bg-[#0c831f] hover:bg-[#0a6e19] shadow-sm">
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search products…" className="pl-9 rounded-xl bg-white border-gray-200" value={search} onChange={(e) => setSearch(e.target.value)} />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-4 h-4 text-gray-400" /></button>}
        </div>
        <Select value={filterCat || "__all__"} onValueChange={(v) => setFilterCat(v === "__all__" ? "" : v)}>
          <SelectTrigger className="w-full sm:w-44 rounded-xl bg-white border-gray-200">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All categories</SelectItem>
            {(categories ?? []).map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">Product</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide hidden sm:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">Price</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">Stock</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide hidden md:table-cell">Status</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-400 font-semibold uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                          {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Package className="w-4 h-4 text-gray-300" /></div>}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm leading-none">{p.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{p.unit}{p.isFeatured ? " · ⭐ Featured" : ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs bg-gray-100 text-gray-600 font-medium px-2 py-1 rounded-lg">{p.categoryName}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-gray-900">₹{p.price}</p>
                      {p.mrp && p.mrp > p.price && <p className="text-xs text-gray-400 line-through">₹{p.mrp}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => openStock(p)} className="text-sm font-semibold hover:text-[#0c831f] transition-colors">
                        <span className={p.stock <= 5 ? "text-red-600" : p.stock <= 20 ? "text-amber-600" : "text-gray-800"}>{p.stock}</span>
                        <span className="text-xs text-gray-400"> units</span>
                      </button>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        {p.isActive
                          ? <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full"><div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Active</span>
                          : <span className="flex items-center gap-1 text-xs bg-red-100 text-red-700 font-semibold px-2 py-0.5 rounded-full"><div className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Inactive</span>
                        }
                        {p.discount ? <span className="text-xs bg-orange-100 text-orange-700 font-semibold px-2 py-0.5 rounded-full">{p.discount}% off</span> : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(p)} className="p-2 hover:bg-blue-50 rounded-xl transition-colors" title="Edit">
                          <Edit2 className="w-3.5 h-3.5 text-blue-500" />
                        </button>
                        <button onClick={() => handleDelete(p)} className="p-2 hover:bg-red-50 rounded-xl transition-colors" title="Delete">
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && (
              <div className="py-16 text-center text-gray-400">
                <Package className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                <p className="font-semibold">No products found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Category Dialog */}
      <Dialog open={dialog === "newcat"} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><FolderPlus className="w-4 h-4" /> New Category</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Category Name *</label>
              <Input placeholder="e.g. Bakery" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") })} className="rounded-xl" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Slug (URL key) *</label>
              <Input placeholder="e.g. bakery" value={catForm.slug} onChange={(e) => setCatForm({ ...catForm, slug: e.target.value.toLowerCase() })} className="rounded-xl font-mono text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Icon (emoji)</label>
                <Input placeholder="🥦" value={catForm.icon} onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })} className="rounded-xl text-center text-lg" maxLength={4} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Colour</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {COLOR_PRESETS.map(c => (
                    <button key={c} onClick={() => setCatForm({ ...catForm, color: c })} className={`w-6 h-6 rounded-lg border-2 transition-all ${catForm.color === c ? "border-gray-800 scale-110" : "border-transparent"}`} style={{ background: c }} />
                  ))}
                </div>
              </div>
            </div>
            {catForm.name && (
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                <span className="text-xl">{catForm.icon}</span>
                <span className="font-semibold text-sm text-gray-900">{catForm.name}</span>
                <span className="ml-auto text-xs font-mono text-gray-400">/{catForm.slug}</span>
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setDialog(null)}>Cancel</Button>
              <Button className="flex-1 rounded-xl bg-[#0c831f] hover:bg-[#0a6e19]" onClick={handleCreateCategory} disabled={createCategory.isPending}>
                {createCategory.isPending ? "Creating…" : "Create Category"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create / Edit Dialog */}
      <Dialog open={dialog === "create" || dialog === "edit"} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              {dialog === "create" ? "Add New Product" : `Edit — ${selected?.name}`}
            </DialogTitle>
          </DialogHeader>
          <FormContent onSubmit={dialog === "create" ? handleCreate : handleEdit} isPending={createProduct.isPending || updateProduct.isPending} />
        </DialogContent>
      </Dialog>

      {/* Stock Dialog */}
      <Dialog open={dialog === "stock"} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Update Stock</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
              {selected?.imageUrl && <img src={selected.imageUrl} alt={selected.name} className="w-12 h-12 rounded-xl object-cover" />}
              <div>
                <p className="font-bold text-gray-900">{selected?.name}</p>
                <p className="text-xs text-gray-400">{selected?.unit}</p>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">New stock quantity</label>
              <Input type="number" min="0" value={stockVal} onChange={(e) => setStockVal(e.target.value)} className="rounded-xl text-2xl font-bold text-center h-14" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[0, 10, 25, 50, 100].map(n => (
                <button key={n} onClick={() => setStockVal(String(n))} className={`px-3 py-1.5 rounded-xl text-sm font-semibold border transition-all ${stockVal === String(n) ? "border-[#0c831f] bg-green-50 text-[#0c831f]" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>{n}</button>
              ))}
            </div>
            <Button className="w-full h-11 rounded-xl bg-[#0c831f] hover:bg-[#0a6e19]" onClick={handleStock} disabled={updateStock.isPending}>
              Update Stock
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
