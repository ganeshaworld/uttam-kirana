import { Router } from "express";
import { db, cartItemsTable, productsTable } from "@workspace/db";
import { eq, and, inArray } from "drizzle-orm";
import { authenticate } from "../middlewares/auth";

const router = Router();
const DELIVERY_CHARGE = 30;
const FREE_DELIVERY_ABOVE = 500;

async function buildCart(userId: number) {
  const items = await db.select().from(cartItemsTable).where(eq(cartItemsTable.userId, userId));
  if (items.length === 0) {
    return { items: [], itemCount: 0, subtotal: 0, deliveryCharge: 0, total: 0 };
  }
  const productIds = [...new Set(items.map((i) => i.productId))];
  const products = await db.select().from(productsTable).where(
    productIds.length === 1
      ? eq(productsTable.id, productIds[0]!)
      : inArray(productsTable.id, productIds)
  );
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));
  const cartItems = items
    .map((item) => {
      const product = productMap[item.productId];
      if (!product) return null;
      const price = Number(product.price);
      return {
        productId: item.productId,
        productName: product.name,
        price,
        imageUrl: product.imageUrl,
        unit: product.unit,
        quantity: item.quantity,
        subtotal: price * item.quantity,
      };
    })
    .filter(Boolean);
  const subtotal = cartItems.reduce((sum, i) => sum + (i?.subtotal ?? 0), 0);
  const deliveryCharge = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_CHARGE;
  return {
    items: cartItems,
    itemCount: cartItems.reduce((sum, i) => sum + (i?.quantity ?? 0), 0),
    subtotal,
    deliveryCharge,
    total: subtotal + deliveryCharge,
  };
}

router.get("/cart", authenticate, async (req, res) => {
  const userId = (req as typeof req & { user: { userId: number } }).user.userId;
  const cart = await buildCart(userId);
  res.json(cart);
});

router.post("/cart/items", authenticate, async (req, res) => {
  const userId = (req as typeof req & { user: { userId: number } }).user.userId;
  const { productId, quantity } = req.body as { productId: number; quantity: number };
  const [existing] = await db
    .select()
    .from(cartItemsTable)
    .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, productId)));
  if (existing) {
    await db
      .update(cartItemsTable)
      .set({ quantity: existing.quantity + quantity })
      .where(eq(cartItemsTable.id, existing.id));
  } else {
    await db.insert(cartItemsTable).values({ userId, productId, quantity });
  }
  const cart = await buildCart(userId);
  res.json(cart);
});

router.put("/cart/items/:productId", authenticate, async (req, res) => {
  const userId = (req as typeof req & { user: { userId: number } }).user.userId;
  const productId = Number(req.params.productId);
  const { quantity } = req.body as { quantity: number };
  if (quantity <= 0) {
    await db.delete(cartItemsTable).where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, productId)));
  } else {
    await db
      .update(cartItemsTable)
      .set({ quantity })
      .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, productId)));
  }
  res.json(await buildCart(userId));
});

router.delete("/cart/items/:productId", authenticate, async (req, res) => {
  const userId = (req as typeof req & { user: { userId: number } }).user.userId;
  const productId = Number(req.params.productId);
  await db.delete(cartItemsTable).where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, productId)));
  res.json(await buildCart(userId));
});

router.delete("/cart", authenticate, async (req, res) => {
  const userId = (req as typeof req & { user: { userId: number } }).user.userId;
  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));
  res.json({ message: "Cart cleared" });
});

export default router;
