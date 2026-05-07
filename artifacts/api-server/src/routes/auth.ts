import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { authenticate, signToken } from "../middlewares/auth";

const router = Router();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post("/auth/send-otp", async (req, res) => {
  const { mobile } = req.body as { mobile: string };
  if (!mobile) {
    res.status(400).json({ message: "Mobile number required" });
    return;
  }
  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  const existing = await db.select().from(usersTable).where(eq(usersTable.mobile, mobile)).limit(1);
  if (existing.length > 0) {
    await db.update(usersTable).set({ otp, otpExpiresAt: expiresAt }).where(eq(usersTable.mobile, mobile));
  } else {
    await db.insert(usersTable).values({ mobile, otp, otpExpiresAt: expiresAt, role: "customer" });
  }
  req.log.info({ mobile }, "OTP sent");
  res.json({ message: "OTP sent successfully", otp });
});

router.post("/auth/verify-otp", async (req, res) => {
  const { mobile, otp, name } = req.body as { mobile: string; otp: string; name?: string };
  if (!mobile || !otp) {
    res.status(400).json({ message: "Mobile and OTP required" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.mobile, mobile)).limit(1);
  if (!user) {
    res.status(400).json({ message: "User not found" });
    return;
  }
  if (user.otp !== otp) {
    res.status(400).json({ message: "Invalid OTP" });
    return;
  }
  if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
    res.status(400).json({ message: "OTP expired" });
    return;
  }
  const updates: Partial<typeof user> = { otp: null, otpExpiresAt: null };
  if (name && !user.name) updates.name = name;
  const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, user.id)).returning();
  const token = signToken(updated.id, updated.role);
  res.json({
    token,
    user: {
      id: updated.id,
      mobile: updated.mobile,
      name: updated.name,
      role: updated.role,
      address: updated.address,
      city: updated.city,
      pincode: updated.pincode,
      walletBalance: Number(updated.walletBalance),
      rewardPoints: updated.rewardPoints,
      createdAt: updated.createdAt,
    },
  });
});

router.get("/auth/me", authenticate, async (req, res) => {
  const userId = (req as typeof req & { user: { userId: number } }).user.userId;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user) {
    res.status(404).json({ message: "User not found" });
    return;
  }
  res.json({
    id: user.id,
    mobile: user.mobile,
    name: user.name,
    role: user.role,
    address: user.address,
    city: user.city,
    pincode: user.pincode,
    walletBalance: Number(user.walletBalance),
    rewardPoints: user.rewardPoints,
    createdAt: user.createdAt,
  });
});

router.put("/auth/me/address", authenticate, async (req, res) => {
  const userId = (req as typeof req & { user: { userId: number } }).user.userId;
  const { address, city, pincode } = req.body as { address: string; city?: string; pincode?: string };
  const [updated] = await db
    .update(usersTable)
    .set({ address, city, pincode })
    .where(eq(usersTable.id, userId))
    .returning();
  res.json({
    id: updated.id,
    mobile: updated.mobile,
    name: updated.name,
    role: updated.role,
    address: updated.address,
    city: updated.city,
    pincode: updated.pincode,
    walletBalance: Number(updated.walletBalance),
    rewardPoints: updated.rewardPoints,
    createdAt: updated.createdAt,
  });
});

export default router;
