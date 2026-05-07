# Uttam Kirana 🛒

A full-stack grocery shop management web app inspired by Blinkit, built for small local kirana (grocery) stores. Supports three roles — **Customer**, **Admin**, and **Delivery Boy** — with a modern, mobile-first responsive UI.

---

## Features

### Customer
- Browse products by category with search and filters
- Hero banners + featured product sections on homepage
- Add to cart, manage quantities, checkout (COD or online)
- Real Unsplash food images across all products
- Order tracking with live status
- Profile page with wallet balance and reward points

### Admin Panel
- **Dashboard** — Revenue, order counts, top products, orders-by-status chart, recent orders table, pending-order alert
- **Products** — Full CRUD with live image URL preview, category filter, stock management, discount/featured flags
- **Categories** — Create new categories inline (emoji icon + colour picker + auto slug) without leaving the product form
- **Orders** — Status tabs (New / Confirmed / Packed / On Way / Delivered / Cancelled), search by ID/name/phone, expandable order cards, one-click status advancement, delivery boy assignment
- **Delivery** — Team card view with active/delivered stats, unassigned order queue with quick-assign, per-order dispatch and mark-delivered buttons
- **Users** — Filterable by role with order counts, join date, wallet balance

### Delivery Boy
- View assigned orders
- Update status: Packed → Out for Delivery → Delivered

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, shadcn/ui, Wouter |
| Backend | Node.js 24, Express 5, Pino logger |
| Database | PostgreSQL + Drizzle ORM |
| Auth | JWT (jsonwebtoken) + simulated OTP flow |
| API contract | OpenAPI 3 → Orval codegen (React Query hooks + Zod schemas) |
| Monorepo | pnpm workspaces |
| Language | TypeScript 5.9 (strict) |

---

## Project Structure

```
uttam-kirana/
├── artifacts/
│   ├── api-server/          # Express REST API
│   │   └── src/routes/      # auth, products, categories, orders, cart, analytics, delivery, admin
│   └── uttam-kirana/        # React + Vite frontend
│       └── src/
│           ├── pages/       # customer, admin/*, delivery/*
│           └── components/  # CustomerLayout, AdminLayout, Header, ProductCard, …
├── lib/
│   ├── api-spec/            # openapi.yaml  ← single source of truth for API
│   ├── api-client-react/    # generated React Query hooks (do not edit)
│   ├── api-zod/             # generated Zod schemas (do not edit)
│   └── db/                  # Drizzle schema + migrations
├── scripts/                 # utility scripts (seed, etc.)
├── pnpm-workspace.yaml
└── tsconfig.json
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+ (`npm install -g pnpm`)
- PostgreSQL 14+

### 1. Clone & Install

```bash
git clone https://github.com/your-username/uttam-kirana.git
cd uttam-kirana
pnpm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env and set DATABASE_URL and SESSION_SECRET
```

### 3. Push Database Schema

```bash
pnpm --filter @workspace/db run push
```

### 4. Seed Demo Data (optional)

```bash
pnpm --filter @workspace/scripts run seed
```

This creates:
- **Admin**: `9999999999` (OTP shown in API response)
- **Delivery Boy**: `8888888888`
- **Customer**: any 10-digit number
- 10 categories + 21 products with real food images

### 5. Start Dev Servers

Open two terminals:

```bash
# Terminal 1 — API server (http://localhost:8080)
pnpm --filter @workspace/api-server run dev

# Terminal 2 — Frontend (http://localhost:5173)
pnpm --filter @workspace/uttam-kirana run dev
```

Then open http://localhost:5173 in your browser.

---

## API Overview

The API follows a **contract-first** approach — `lib/api-spec/openapi.yaml` is the single source of truth.

After modifying the spec, regenerate client code:

```bash
pnpm --filter @workspace/api-spec run codegen
```

### Key Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/send-otp` | — | Send OTP (returned in response in dev) |
| POST | `/api/auth/verify-otp` | — | Verify OTP, returns JWT |
| GET | `/api/categories` | — | List all categories |
| POST | `/api/categories` | Admin | Create category |
| GET | `/api/products` | — | List products (filter, search, paginate) |
| POST | `/api/products` | Admin | Create product |
| PATCH | `/api/products/:id` | Admin | Update product |
| GET | `/api/cart` | Customer | Get cart |
| POST | `/api/cart` | Customer | Add/update cart item |
| POST | `/api/orders` | Customer | Place order |
| GET | `/api/orders` | Admin/Delivery | List orders |
| PATCH | `/api/orders/:id/status` | Admin/Delivery | Update status |
| PATCH | `/api/orders/:id/assign` | Admin | Assign delivery boy |
| GET | `/api/analytics/summary` | Admin | Revenue & order stats |
| GET | `/api/admin/users` | Admin | All users |
| GET | `/api/admin/delivery-boys` | Admin | Delivery team |

---

## Development

### Typecheck

```bash
pnpm run typecheck
```

### Build

```bash
pnpm run build
```

### Add a new API endpoint

1. Edit `lib/api-spec/openapi.yaml`
2. Run `pnpm --filter @workspace/api-spec run codegen`
3. Add route handler in `artifacts/api-server/src/routes/`
4. Use the generated hook in the frontend

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | JWT signing secret (use a long random string) |
| `PORT` | No | API server port (default: 8080) |
| `NODE_ENV` | No | `development` or `production` |

---

## Notes

- OTP is **returned in the API response** in development — no SMS provider is needed.
- Online payment is mock (Razorpay-ready but not integrated).
- Free delivery on orders above ₹500; ₹30 delivery charge otherwise.
- Product images use Unsplash URLs stored in the database.

---

## License

MIT
