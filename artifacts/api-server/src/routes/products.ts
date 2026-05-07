import { Router } from "express";
import { db, productsTable, categoriesTable } from "@workspace/db";
import { eq, like, and, gte, lte, type SQL } from "drizzle-orm";
import { authenticate, requireRole } from "../middlewares/auth";

const router = Router();

router.get("/products", async (req, res) => {
  const { search, category, inStock, minPrice, maxPrice, limit = "50", offset = "0" } = req.query as Record<string, string>;

  const cats = await db.select().from(categoriesTable);
  const catMap = Object.fromEntries(cats.map((c) => [c.id, c.name]));
  const conditions: SQL[] = [eq(productsTable.isActive, true)];
  if (search) conditions.push(like(productsTable.name, `%${search}%`));
  if (category) {
    const cat = cats.find((c) => c.slug === category || c.name.toLowerCase() === category.toLowerCase());
    if (cat) conditions.push(eq(productsTable.categoryId, cat.id));
  }
  if (inStock === "true") conditions.push(gte(productsTable.stock, 1));
  if (minPrice) conditions.push(gte(productsTable.price, minPrice));
  if (maxPrice) conditions.push(lte(productsTable.price, maxPrice));

  const products = await db
    .select()
    .from(productsTable)
    .where(and(...conditions))
    .limit(Number(limit))
    .offset(Number(offset));

  const allCount = await db.select().from(productsTable).where(and(...conditions));
  res.json({
    products: products.map((p) => ({
      ...p,
      price: Number(p.price),
      mrp: p.mrp ? Number(p.mrp) : null,
      categoryName: catMap[p.categoryId] ?? null,
    })),
    total: allCount.length,
  });
});

router.get("/products/featured", async (_req, res) => {
  const cats = await db.select().from(categoriesTable);
  const catMap = Object.fromEntries(cats.map((c) => [c.id, c.name]));
  const featured = await db
    .select()
    .from(productsTable)
    .where(and(eq(productsTable.isFeatured, true), eq(productsTable.isActive, true)));
  res.json(
    featured.map((p) => ({
      ...p,
      price: Number(p.price),
      mrp: p.mrp ? Number(p.mrp) : null,
      categoryName: catMap[p.categoryId] ?? null,
    }))
  );
});

router.get("/products/:productId", async (req, res) => {
  const id = Number(req.params.productId);
  const cats = await db.select().from(categoriesTable);
  const catMap = Object.fromEntries(cats.map((c) => [c.id, c.name]));
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id)).limit(1);
  if (!product) {
    res.status(404).json({ message: "Product not found" });
    return;
  }
  res.json({ ...product, price: Number(product.price), mrp: product.mrp ? Number(product.mrp) : null, categoryName: catMap[product.categoryId] ?? null });
});

router.post("/products", authenticate, requireRole("admin"), async (req, res) => {
  const body = req.body as {
    name: string; description?: string; price: number; mrp?: number; unit: string;
    stock: number; categoryId: number; imageUrl?: string; isFeatured?: boolean; discount?: number;
  };
  const [product] = await db.insert(productsTable).values({
    name: body.name,
    description: body.description,
    price: String(body.price),
    mrp: body.mrp ? String(body.mrp) : null,
    unit: body.unit,
    stock: body.stock,
    categoryId: body.categoryId,
    imageUrl: body.imageUrl,
    isFeatured: body.isFeatured ?? false,
    discount: body.discount,
  }).returning();
  const cats = await db.select().from(categoriesTable);
  const catMap = Object.fromEntries(cats.map((c) => [c.id, c.name]));
  res.status(201).json({ ...product, price: Number(product.price), mrp: product.mrp ? Number(product.mrp) : null, categoryName: catMap[product.categoryId] ?? null });
});

router.put("/products/:productId", authenticate, requireRole("admin"), async (req, res) => {
  const id = Number(req.params.productId);
  const body = req.body as Partial<{
    name: string; description: string; price: number; mrp: number; unit: string;
    stock: number; categoryId: number; imageUrl: string; isActive: boolean; isFeatured: boolean; discount: number;
  }>;
  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.description !== undefined) updates.description = body.description;
  if (body.price !== undefined) updates.price = String(body.price);
  if (body.mrp !== undefined) updates.mrp = String(body.mrp);
  if (body.unit !== undefined) updates.unit = body.unit;
  if (body.stock !== undefined) updates.stock = body.stock;
  if (body.categoryId !== undefined) updates.categoryId = body.categoryId;
  if (body.imageUrl !== undefined) updates.imageUrl = body.imageUrl;
  if (body.isActive !== undefined) updates.isActive = body.isActive;
  if (body.isFeatured !== undefined) updates.isFeatured = body.isFeatured;
  if (body.discount !== undefined) updates.discount = body.discount;
  const [product] = await db.update(productsTable).set(updates).where(eq(productsTable.id, id)).returning();
  if (!product) {
    res.status(404).json({ message: "Product not found" });
    return;
  }
  const cats = await db.select().from(categoriesTable);
  const catMap = Object.fromEntries(cats.map((c) => [c.id, c.name]));
  res.json({ ...product, price: Number(product.price), mrp: product.mrp ? Number(product.mrp) : null, categoryName: catMap[product.categoryId] ?? null });
});

router.delete("/products/:productId", authenticate, requireRole("admin"), async (req, res) => {
  const id = Number(req.params.productId);
  await db.update(productsTable).set({ isActive: false }).where(eq(productsTable.id, id));
  res.json({ message: "Product deleted" });
});

router.patch("/products/:productId/stock", authenticate, requireRole("admin"), async (req, res) => {
  const id = Number(req.params.productId);
  const { stock } = req.body as { stock: number };
  const [product] = await db.update(productsTable).set({ stock }).where(eq(productsTable.id, id)).returning();
  if (!product) {
    res.status(404).json({ message: "Product not found" });
    return;
  }
  const cats = await db.select().from(categoriesTable);
  const catMap = Object.fromEntries(cats.map((c) => [c.id, c.name]));
  res.json({ ...product, price: Number(product.price), mrp: product.mrp ? Number(product.mrp) : null, categoryName: catMap[product.categoryId] ?? null });
});

export default router;
