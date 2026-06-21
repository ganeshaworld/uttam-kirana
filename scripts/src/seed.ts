/**
 * Seed script — populates the database with demo categories, products, and users.
 * Safe to run multiple times (skips if data already exists).
 *
 * Usage:
 *   pnpm --filter @workspace/scripts run seed
 */
import "dotenv/config";
import { db, categoriesTable, productsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

// ── Categories ────────────────────────────────────────────────────────────────
const CATEGORIES = [
  { name: "Fruits & Vegetables", slug: "fruits-vegetables", icon: "🥦", color: "#16a34a" },
  { name: "Dairy & Eggs",        slug: "dairy-eggs",        icon: "🥛", color: "#3b82f6" },
  { name: "Snacks",              slug: "snacks",            icon: "🍿", color: "#f97316" },
  { name: "Beverages",           slug: "beverages",         icon: "🥤", color: "#06b6d4" },
  { name: "Bakery",              slug: "bakery",            icon: "🍞", color: "#f59e0b" },
  { name: "Grains & Pulses",     slug: "grains-pulses",     icon: "🌾", color: "#84cc16" },
  { name: "Household",           slug: "household",         icon: "🏠", color: "#8b5cf6" },
  { name: "Personal Care",       slug: "personal-care",     icon: "🧴", color: "#ec4899" },
  { name: "Meat & Fish",         slug: "meat-fish",         icon: "🐟", color: "#ef4444" },
  { name: "Frozen Foods",        slug: "frozen-foods",      icon: "🧊", color: "#0ea5e9" },
];

// ── Products (indexed by category slug) ──────────────────────────────────────
const PRODUCTS: Array<{
  name: string; description?: string; price: number; mrp?: number;
  unit: string; stock: number; categorySlug: string; imageUrl: string;
  isFeatured?: boolean; discount?: number;
}> = [
  // Fruits & Vegetables
  { name: "Fresh Tomatoes",     price: 35,  mrp: 45,  unit: "500 g",   stock: 80,  categorySlug: "fruits-vegetables", imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80", isFeatured: true,  discount: 22 },
  { name: "Baby Spinach",       price: 29,  mrp: 39,  unit: "200 g",   stock: 60,  categorySlug: "fruits-vegetables", imageUrl: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80" },
  { name: "Alphonso Mangoes",   price: 149, mrp: 199, unit: "1 kg",    stock: 40,  categorySlug: "fruits-vegetables", imageUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=80", isFeatured: true,  discount: 25 },
  { name: "Green Capsicum",     price: 45,  mrp: 55,  unit: "250 g",   stock: 50,  categorySlug: "fruits-vegetables", imageUrl: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&q=80" },

  // Dairy & Eggs
  { name: "Amul Full Cream Milk", price: 68, mrp: 72, unit: "1 L",    stock: 120, categorySlug: "dairy-eggs",        imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80", isFeatured: true },
  { name: "Farm Fresh Eggs",    price: 90,  mrp: 100, unit: "12 pieces", stock: 75, categorySlug: "dairy-eggs",      imageUrl: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&q=80", discount: 10 },
  { name: "Britannia Paneer",   price: 85,  mrp: 95,  unit: "200 g",   stock: 45,  categorySlug: "dairy-eggs",        imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80" },

  // Snacks
  { name: "Lay's Classic Salted", price: 20, mrp: 20, unit: "1 piece", stock: 200, categorySlug: "snacks",           imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80", isFeatured: true },
  { name: "Haldiram's Namkeen", price: 60,  mrp: 65,  unit: "200 g",   stock: 90,  categorySlug: "snacks",            imageUrl: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&q=80" },

  // Beverages
  { name: "Coca-Cola",          price: 40,  mrp: 40,  unit: "500 ml",  stock: 150, categorySlug: "beverages",         imageUrl: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&q=80", isFeatured: true },
  { name: "Real Mixed Fruit Juice", price: 75, mrp: 89, unit: "1 L",   stock: 60,  categorySlug: "beverages",         imageUrl: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&q=80", discount: 16 },
  { name: "Bisleri Water",      price: 20,  mrp: 20,  unit: "1 L",     stock: 200, categorySlug: "beverages",         imageUrl: "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400&q=80" },

  // Bakery
  { name: "Britannia Bread",    price: 45,  mrp: 50,  unit: "400 g",   stock: 55,  categorySlug: "bakery",            imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80", discount: 10 },
  { name: "Croissant (Pack of 4)", price: 89, mrp: 99, unit: "4 pieces", stock: 30, categorySlug: "bakery",           imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80" },

  // Grains & Pulses
  { name: "Tata Salt",          price: 28,  mrp: 30,  unit: "1 kg",    stock: 100, categorySlug: "grains-pulses",     imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80" },
  { name: "India Gate Basmati Rice", price: 120, mrp: 140, unit: "1 kg", stock: 80, categorySlug: "grains-pulses",   imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80", isFeatured: true, discount: 14 },
  { name: "Toor Dal",           price: 95,  mrp: 110, unit: "500 g",   stock: 70,  categorySlug: "grains-pulses",     imageUrl: "https://images.unsplash.com/photo-1610725664285-7c57e6eeac3f?w=400&q=80" },

  // Household
  { name: "Surf Excel Matic",   price: 175, mrp: 199, unit: "1 kg",    stock: 60,  categorySlug: "household",         imageUrl: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&q=80", discount: 12 },
  { name: "Lizol Floor Cleaner", price: 110, mrp: 130, unit: "500 ml", stock: 45,  categorySlug: "household",         imageUrl: "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=400&q=80" },

  // Personal Care
  { name: "Dove Soap",          price: 55,  mrp: 60,  unit: "1 piece", stock: 90,  categorySlug: "personal-care",     imageUrl: "https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=400&q=80" },
  { name: "Colgate MaxFresh",   price: 85,  mrp: 95,  unit: "150 g",   stock: 75,  categorySlug: "personal-care",     imageUrl: "https://images.unsplash.com/photo-1559591937-edd6e86c5ed5?w=400&q=80", discount: 11 },
];

// ── Users ─────────────────────────────────────────────────────────────────────
const USERS = [
  { mobile: "9999999999", name: "Admin User",    role: "admin",    walletBalance: "0" },
  { mobile: "8888888888", name: "Ravi Kumar",    role: "delivery", walletBalance: "0" },
  { mobile: "7777777777", name: "Priya Sharma",  role: "customer", walletBalance: "150" },
];

// ── Main ──────────────────────────────────────────────────────────────────────
async function seed() {
  console.log("🌱  Starting seed…\n");

  // 1. Users
  let usersSeeded = 0;
  for (const u of USERS) {
    const existing = await db.select().from(usersTable).where(eq(usersTable.mobile, u.mobile));
    if (existing.length === 0) {
      await db.insert(usersTable).values(u as typeof usersTable.$inferInsert);
      usersSeeded++;
    }
  }
  console.log(`✅  Users:      ${usersSeeded} inserted, ${USERS.length - usersSeeded} already existed`);

  // 2. Categories
  const existingCats = await db.select().from(categoriesTable);
  const catsBySlug = new Map(existingCats.map(c => [c.slug, c]));
  let catsSeeded = 0;
  for (const cat of CATEGORIES) {
    if (!catsBySlug.has(cat.slug)) {
      const [c] = await db.insert(categoriesTable).values(cat).returning();
      catsBySlug.set(c!.slug, c!);
      catsSeeded++;
    }
  }
  console.log(`✅  Categories: ${catsSeeded} inserted, ${CATEGORIES.length - catsSeeded} already existed`);

  // 3. Products
  const existingProds = await db.select().from(productsTable);
  const existingNames = new Set(existingProds.map(p => p.name));
  let prodsSeeded = 0;
  for (const p of PRODUCTS) {
    if (existingNames.has(p.name)) continue;
    const cat = catsBySlug.get(p.categorySlug);
    if (!cat) { console.warn(`  ⚠️  Category "${p.categorySlug}" not found, skipping "${p.name}"`); continue; }
    const { categorySlug: _, ...rest } = p;
    await db.insert(productsTable).values({ ...rest, categoryId: cat.id, price: String(p.price), mrp: p.mrp ? String(p.mrp) : undefined });
    prodsSeeded++;
  }
  console.log(`✅  Products:   ${prodsSeeded} inserted, ${PRODUCTS.length - prodsSeeded} already existed`);

  console.log("\n🎉  Seed complete!\n");
  console.log("   Demo credentials:");
  console.log("   👑 Admin:    9999999999");
  console.log("   🚴 Delivery: 8888888888");
  console.log("   🛒 Customer: 7777777777  (or any 10-digit number)\n");
  console.log("   OTP is shown in the API response in development mode.\n");
  process.exit(0);
}

seed().catch((err) => { console.error("Seed failed:", err); process.exit(1); });
