# Uttam Kirana 🛒

A full-stack grocery shop management web app inspired by Blinkit, built for small local kirana stores. Three roles: **Customer**, **Admin**, and **Delivery Boy** — fully responsive on desktop and mobile.

---

## Quick Start (Windows)

**Prerequisites:** [Node.js LTS](https://nodejs.org) · [PostgreSQL](https://www.postgresql.org/download/windows/)

```
1. Extract the ZIP / clone the repo
2. Double-click  setup.bat       ← installs everything, creates DB tables, seeds demo data
3. Double-click  start.bat       ← opens API + frontend in two windows
4. Open  http://localhost:5173   ← you're live!
```

Or with PowerShell (right-click → "Run with PowerShell"):
```powershell
.\setup.ps1
.\start.ps1
```

### PostgreSQL setup (Windows)

1. Install from https://www.postgresql.org/download/windows/
2. Open **pgAdmin** → create a database called `uttam_kirana`
3. Set `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/uttam_kirana
   ```

---

## Quick Start (Mac / Linux)

```bash
# 1 — Install pnpm if you don't have it
npm install -g pnpm

# 2 — Install dependencies
pnpm install

# 3 — Configure environment
cp .env.example .env
# Edit .env → set DATABASE_URL and SESSION_SECRET

# 4 — Create tables
pnpm --filter @workspace/db run push

# 5 — Seed demo data
pnpm --filter @workspace/scripts run seed

# 6 — Start servers (two terminals)
pnpm --filter @workspace/api-server run dev    # http://localhost:8080
pnpm --filter @workspace/uttam-kirana run dev  # http://localhost:5173
```

---

## Demo Credentials

| Role     | Mobile       | OTP |
|----------|-------------|-----|
| Admin    | 9999999999  | shown in API server terminal |
| Delivery | 8888888888  | shown in API server terminal |
| Customer | 7777777777  | shown in API server terminal |

> Any 10-digit number works as a customer. OTP is printed in the API terminal — no SMS needed.

---

## Features

### Customer
- Browse by category, search, filter products
- Add to cart, checkout (Cash on Delivery or Online)
- Order tracking with live status updates
- Profile page with wallet balance and reward points

### Admin Panel
- **Dashboard** — Revenue, orders, top products, status chart, pending-order alert
- **Products** — CRUD with live image preview, stock management, discount/featured flags
- **Categories** — Create inline (emoji + colour + auto slug) without leaving the product form
- **Orders** — Status tabs, search, expandable cards, one-click advancement, delivery assignment
- **Delivery** — Team cards, unassigned queue, dispatch/delivered buttons per order
- **Users** — Role filter, order counts, wallet balance, join date

### Delivery Boy
- See assigned orders · Mark Packed → Out for Delivery → Delivered

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, shadcn/ui, Wouter |
| Backend | Node.js, Express 5, Pino logger |
| Database | PostgreSQL + Drizzle ORM |
| Auth | JWT + simulated OTP (no SMS needed in dev) |
| API contract | OpenAPI 3 → Orval codegen (React Query hooks + Zod) |
| Monorepo | pnpm workspaces |
| Language | TypeScript 5.9 strict |

---

## Project Structure

```
uttam-kirana/
├── artifacts/
│   ├── api-server/          # Express REST API (port 8080)
│   │   └── src/routes/      # auth, products, categories, orders, cart, analytics, admin
│   └── uttam-kirana/        # React + Vite frontend (port 5173)
│       └── src/
│           ├── pages/       # home, products, cart, orders, admin/*, delivery/*
│           └── components/  # CustomerLayout, AdminLayout, Header, ProductCard…
├── lib/
│   ├── api-spec/            # openapi.yaml  ← API source of truth
│   ├── api-client-react/    # generated React Query hooks (do not edit)
│   ├── api-zod/             # generated Zod schemas (do not edit)
│   └── db/                  # Drizzle schema + DB connection
├── scripts/
│   └── src/seed.ts          # database seeder
├── setup.bat                # Windows one-click setup
├── start.bat                # Windows one-click start
├── setup.ps1                # PowerShell setup
├── start.ps1                # PowerShell start
├── .env.example             # environment variable template
└── pnpm-workspace.yaml      # monorepo config
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `SESSION_SECRET` | ✅ | JWT signing secret (any long random string) |
| `PORT` | — | API port, default `8080` |
| `NODE_ENV` | — | `development` or `production` |

---

## Useful Commands

```bash
# Typecheck everything
pnpm run typecheck

# Regenerate API client after editing openapi.yaml
pnpm --filter @workspace/api-spec run codegen

# Re-seed the database
pnpm --filter @workspace/scripts run seed

# Push schema changes to DB
pnpm --filter @workspace/db run push
```

---

## Deployment

| Platform | Notes |
|---|---|
| **Railway** | Easiest full-stack: deploy API + DB together, then frontend as second service |
| **Render** | Free tier available; deploy API as Web Service + PostgreSQL |
| **Netlify** | Frontend only — pair with Railway/Render for the backend |
| **Replit** | One-click deploy from Replit with built-in DB |

---

## Notes

- OTP is **printed in the API terminal** in development — no SMS provider needed.
- Online payment is mock/Razorpay-ready (not connected to a real gateway).
- Free delivery on orders above ₹500; ₹30 charge otherwise.

---

## License

MIT
