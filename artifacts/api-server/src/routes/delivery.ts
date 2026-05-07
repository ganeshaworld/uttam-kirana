import { Router } from "express";
import { db, ordersTable, usersTable } from "@workspace/db";
import { eq, desc, inArray } from "drizzle-orm";
import { authenticate, requireRole } from "../middlewares/auth";

const router = Router();

router.get("/delivery/orders", authenticate, requireRole("delivery"), async (req, res) => {
  const { userId } = (req as typeof req & { user: { userId: number } }).user;
  const orders = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.deliveryBoyId, userId))
    .orderBy(desc(ordersTable.createdAt));

  const userIds = [...new Set([...orders.map((o) => o.userId), userId])];
  const users = await db.select().from(usersTable).where(inArray(usersTable.id, userIds));
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  res.json(
    orders.map((o) => ({
      ...o,
      subtotal: Number(o.subtotal),
      deliveryCharge: Number(o.deliveryCharge),
      total: Number(o.total),
      userName: userMap[o.userId]?.name ?? null,
      userMobile: userMap[o.userId]?.mobile ?? null,
      deliveryBoyName: userMap[userId]?.name ?? null,
    }))
  );
});

export default router;
