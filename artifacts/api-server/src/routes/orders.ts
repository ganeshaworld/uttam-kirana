import { Router } from "express";
import { db, ordersTable, usersTable, cartItemsTable, productsTable } from "@workspace/db";
import { eq, and, desc, inArray } from "drizzle-orm";
import { authenticate, requireRole } from "../middlewares/auth";

const router = Router();
const DELIVERY_CHARGE = 30;
const FREE_DELIVERY_ABOVE = 500;

type OrderItem = {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
  unit: string;
};

function enrichOrder(order: typeof ordersTable.$inferSelect, userMap: Record<number, typeof usersTable.$inferSelect>) {
  const user = userMap[order.userId];
  const deliveryBoy = order.deliveryBoyId ? userMap[order.deliveryBoyId] : null;
  return {
    ...order,
    subtotal: Number(order.subtotal),
    deliveryCharge: Number(order.deliveryCharge),
    total: Number(order.total),
    userName: user?.name ?? null,
    userMobile: user?.mobile ?? null,
    deliveryBoyName: deliveryBoy?.name ?? null,
  };
}

router.get("/orders", authenticate, async (req, res) => {
  const { userId, role } = (req as typeof req & { user: { userId: number; role: string } }).user;
  const { status, limit = "20", offset = "0" } = req.query as Record<string, string>;

  let orders;
  if (role === "admin") {
    orders = status
      ? await db.select().from(ordersTable).where(eq(ordersTable.status, status)).orderBy(desc(ordersTable.createdAt)).limit(Number(limit)).offset(Number(offset))
      : await db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)).limit(Number(limit)).offset(Number(offset));
  } else {
    orders = status
      ? await db.select().from(ordersTable).where(and(eq(ordersTable.userId, userId), eq(ordersTable.status, status))).orderBy(desc(ordersTable.createdAt))
      : await db.select().from(ordersTable).where(eq(ordersTable.userId, userId)).orderBy(desc(ordersTable.createdAt));
  }

  const userIds = [...new Set([...orders.map((o) => o.userId), ...orders.filter((o) => o.deliveryBoyId).map((o) => o.deliveryBoyId!)])];
  const users = userIds.length > 0 ? await db.select().from(usersTable).where(inArray(usersTable.id, userIds)) : [];
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  res.json(orders.map((o) => enrichOrder(o, userMap)));
});

router.post("/orders", authenticate, async (req, res) => {
  const { userId } = (req as typeof req & { user: { userId: number } }).user;
  const { paymentMethod, deliveryAddress, notes } = req.body as { paymentMethod: string; deliveryAddress: string; notes?: string };

  const cartItems = await db.select().from(cartItemsTable).where(eq(cartItemsTable.userId, userId));
  if (cartItems.length === 0) {
    res.status(400).json({ message: "Cart is empty" });
    return;
  }
  const productIds = cartItems.map((i) => i.productId);
  const products = await db.select().from(productsTable).where(inArray(productsTable.id, productIds));
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

  const items: OrderItem[] = cartItems.map((ci) => {
    const p = productMap[ci.productId]!;
    const price = Number(p.price);
    return { productId: ci.productId, productName: p.name, price, quantity: ci.quantity, subtotal: price * ci.quantity, unit: p.unit };
  });

  const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
  const deliveryCharge = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_CHARGE;
  const total = subtotal + deliveryCharge;

  const [order] = await db.insert(ordersTable).values({
    userId,
    items,
    status: "placed",
    paymentMethod,
    paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
    subtotal: String(subtotal),
    deliveryCharge: String(deliveryCharge),
    total: String(total),
    deliveryAddress,
    notes,
  }).returning();

  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));
  for (const ci of cartItems) {
    const p = productMap[ci.productId];
    if (p) {
      await db.update(productsTable).set({ stock: Math.max(0, p.stock - ci.quantity) }).where(eq(productsTable.id, p.id));
    }
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  const userMap = user ? { [user.id]: user } : {};
  res.status(201).json(enrichOrder(order, userMap));
});

router.get("/orders/:orderId", authenticate, async (req, res) => {
  const orderId = Number(req.params.orderId);
  const { userId, role } = (req as typeof req & { user: { userId: number; role: string } }).user;
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId)).limit(1);
  if (!order) {
    res.status(404).json({ message: "Order not found" });
    return;
  }
  if (role === "customer" && order.userId !== userId) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }
  const userIds = [order.userId, ...(order.deliveryBoyId ? [order.deliveryBoyId] : [])];
  const users = await db.select().from(usersTable).where(inArray(usersTable.id, userIds));
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));
  res.json(enrichOrder(order, userMap));
});

router.patch("/orders/:orderId/status", authenticate, async (req, res) => {
  const orderId = Number(req.params.orderId);
  const { status } = req.body as { status: string };
  const { role, userId } = (req as typeof req & { user: { userId: number; role: string } }).user;

  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, orderId)).limit(1);
  if (!order) {
    res.status(404).json({ message: "Order not found" });
    return;
  }
  if (role === "delivery" && order.deliveryBoyId !== userId) {
    res.status(403).json({ message: "Not your order" });
    return;
  }

  const updates: Record<string, unknown> = { status };
  if (status === "delivered" && order.paymentMethod === "cod") updates.paymentStatus = "paid";

  const [updated] = await db.update(ordersTable).set(updates).where(eq(ordersTable.id, orderId)).returning();
  const userIds = [updated.userId, ...(updated.deliveryBoyId ? [updated.deliveryBoyId] : [])];
  const users = await db.select().from(usersTable).where(inArray(usersTable.id, userIds));
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));
  res.json(enrichOrder(updated, userMap));
});

router.post("/orders/:orderId/assign", authenticate, requireRole("admin"), async (req, res) => {
  const orderId = Number(req.params.orderId);
  const { deliveryBoyId } = req.body as { deliveryBoyId: number };
  const [updated] = await db.update(ordersTable).set({ deliveryBoyId, status: "confirmed" }).where(eq(ordersTable.id, orderId)).returning();
  if (!updated) {
    res.status(404).json({ message: "Order not found" });
    return;
  }
  const userIds = [updated.userId, deliveryBoyId];
  const users = await db.select().from(usersTable).where(inArray(usersTable.id, userIds));
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));
  res.json(enrichOrder(updated, userMap));
});

export default router;
