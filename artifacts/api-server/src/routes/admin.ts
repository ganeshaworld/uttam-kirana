import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticate, requireRole } from "../middlewares/auth";

const router = Router();

function formatUser(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id,
    mobile: u.mobile,
    name: u.name,
    role: u.role,
    address: u.address,
    city: u.city,
    pincode: u.pincode,
    walletBalance: Number(u.walletBalance),
    rewardPoints: u.rewardPoints,
    createdAt: u.createdAt,
  };
}

router.get("/admin/users", authenticate, requireRole("admin"), async (_req, res) => {
  const users = await db.select().from(usersTable);
  res.json(users.map(formatUser));
});

router.get("/admin/delivery-boys", authenticate, requireRole("admin"), async (_req, res) => {
  const boys = await db.select().from(usersTable).where(eq(usersTable.role, "delivery"));
  res.json(boys.map(formatUser));
});

export default router;
