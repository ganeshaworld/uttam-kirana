import { Router } from "express";
import { db, ordersTable, usersTable } from "@workspace/db";
import { eq, gte } from "drizzle-orm";
import { authenticate, requireRole } from "../middlewares/auth";

const router = Router();

router.get("/analytics/summary", authenticate, requireRole("admin"), async (_req, res) => {
  const allOrders = await db.select().from(ordersTable);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayOrders = allOrders.filter((o) => new Date(o.createdAt) >= today);
  const totalCustomers = await db.select().from(usersTable).where(eq(usersTable.role, "customer"));
  const pendingOrders = allOrders.filter((o) => ["placed", "confirmed", "packed"].includes(o.status));
  const outOrders = allOrders.filter((o) => o.status === "out_for_delivery");
  const totalRevenue = allOrders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + Number(o.total), 0);
  const todayRevenue = todayOrders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + Number(o.total), 0);
  res.json({
    totalOrders: allOrders.length,
    totalRevenue,
    todayOrders: todayOrders.length,
    todayRevenue,
    totalCustomers: totalCustomers.length,
    pendingOrders: pendingOrders.length,
    outForDeliveryOrders: outOrders.length,
    averageOrderValue: allOrders.length ? totalRevenue / allOrders.length : 0,
  });
});

router.get("/analytics/top-products", authenticate, requireRole("admin"), async (req, res) => {
  const { limit = "10" } = req.query as { limit?: string };
  const orders = await db.select().from(ordersTable).where(eq(ordersTable.status, "delivered"));
  const productStats: Record<number, { productName: string; totalSold: number; revenue: number; imageUrl: string | null }> = {};

  for (const order of orders) {
    const items = order.items as Array<{ productId: number; productName: string; price: number; quantity: number; subtotal: number; imageUrl?: string }>;
    for (const item of items) {
      if (!productStats[item.productId]) {
        productStats[item.productId] = { productName: item.productName, totalSold: 0, revenue: 0, imageUrl: item.imageUrl ?? null };
      }
      productStats[item.productId]!.totalSold += item.quantity;
      productStats[item.productId]!.revenue += item.subtotal;
    }
  }

  const sorted = Object.entries(productStats)
    .map(([id, s]) => ({ productId: Number(id), ...s }))
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, Number(limit));

  res.json(sorted);
});

router.get("/analytics/orders-by-status", authenticate, requireRole("admin"), async (_req, res) => {
  const orders = await db.select().from(ordersTable);
  const counts: Record<string, number> = {};
  for (const o of orders) {
    counts[o.status] = (counts[o.status] ?? 0) + 1;
  }
  res.json(Object.entries(counts).map(([status, count]) => ({ status, count })));
});

export default router;
