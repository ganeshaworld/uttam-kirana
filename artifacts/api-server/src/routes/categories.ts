import { Router } from "express";
import { db, categoriesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticate, requireRole } from "../middlewares/auth";

const router = Router();

router.get("/categories", async (_req, res) => {
  const categories = await db.select().from(categoriesTable).orderBy(categoriesTable.name);
  res.json(categories);
});

router.post("/categories", authenticate, requireRole("admin"), async (req, res) => {
  const { name, slug, icon, color } = req.body as { name: string; slug: string; icon?: string; color?: string };
  if (!name || !slug) { res.status(400).json({ message: "name and slug are required" }); return; }
  const existing = await db.select().from(categoriesTable).where(eq(categoriesTable.slug, slug));
  if (existing.length > 0) { res.status(409).json({ message: "Category slug already exists" }); return; }
  const [cat] = await db.insert(categoriesTable).values({ name, slug, icon, color }).returning();
  res.status(201).json(cat);
});

router.patch("/categories/:categoryId", authenticate, requireRole("admin"), async (req, res) => {
  const id = Number(req.params["categoryId"]);
  const { name, slug, icon, color } = req.body as { name?: string; slug?: string; icon?: string; color?: string };
  const [cat] = await db.update(categoriesTable).set({ ...(name && { name }), ...(slug && { slug }), ...(icon !== undefined && { icon }), ...(color !== undefined && { color }) }).where(eq(categoriesTable.id, id)).returning();
  if (!cat) { res.status(404).json({ message: "Category not found" }); return; }
  res.json(cat);
});

router.delete("/categories/:categoryId", authenticate, requireRole("admin"), async (req, res) => {
  const id = Number(req.params["categoryId"]);
  await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
  res.json({ message: "Category deleted" });
});

export default router;
