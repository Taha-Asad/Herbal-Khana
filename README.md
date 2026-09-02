# Herbal Khana

**Herbal Khana** is a full-featured e-commerce platform for herbal products, built as a modern full-stack web application. It ships with a customer storefront, a role-based administrator dashboard, order & inventory management, payment workflows, transactional email, and a PostgreSQL data layer.

The storefront targets Pakistan (PKR currency, JazzCash / EasyPaisa / Cash-on-Delivery payments) but the architecture is generic enough to adapt to any market.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Authentication & Authorization](#authentication--authorization)
- [Payments](#payments)
- [Email](#email)
- [File Uploads](#file-uploads)
- [Project Structure](#project-structure)
- [Available Scripts](#available-scripts)
- [Configuration Files](#configuration-files)
- [Deployment](#deployment)
- [Customization Notes](#customization-notes)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## Features

### Customer Storefront (`/home/*`)
- **Product catalog** — searchable, filterable product listing with categories, variants (size / scent / concentration), featured & new badges
- **Product detail pages** — image gallery, variant pricing, stock indicators, reviews and comments, related products, view tracking
- **Cart** — guest & signed-in carts, quantity controls, *save for later*, promo codes, shipping method selection, cart notes
- **Checkout** — shipping/billing address management, shipping method selection, order summary, payment method selection
- **Payments** — JazzCash & EasyPaisa (with payment-proof upload) and Cash on Delivery (COD)
- **Order tracking** — track order status with a visual timeline and delivery estimates
- **User accounts** — profile, saved addresses, order history, payments, wishlist (bookmarks), settings, support
- **Auth flows** — registration, login (with *remember me*), email verification, forgot / reset password, unsubscribe from newsletters
- **Content pages** — home, about, blog, FAQ, contact, refund policy, shipping & returns
- **Newsletter** — subscribe / unsubscribe with token-based links

### Admin Dashboard (`/admin/*`)
- **Dashboard analytics** — revenue, orders, top products, recent orders (with charts)
- **Products** — full CRUD, variants, images, stock & low-stock thresholds, featured/active toggles, SEO metadata
- **Categories** — CRUD with drag reordering
- **Orders** — list/detail views, status transitions (PENDING → PAID → PROCESSING → SHIPPED → DELIVERED / CANCELLED / REFUNDED), timeline history, payment-proof review
- **Promo codes** — percentage / fixed / free-shipping discounts, usage limits, first-order-only flags
- **Shipping** — shipping methods (price, free-above threshold, estimates) and shipping zones
- **Users** — user management, activation / ban, roles
- **Messages** — contact form inbox with replies
- **Newsletter** — subscriber list, statuses, email stats
- **Reviews** — moderation (approve / reject)
- **Settings** — key/value site settings

---

## Tech Stack

| Layer          | Technology                                                                  |
| -------------- | --------------------------------------------------------------------------- |
| Framework      | [Next.js 16](https://nextjs.org) (App Router, webpack builds)               |
| UI             | [React 19](https://react.dev), [Tailwind CSS v4](https://tailwindcss.com), RippleUI, `tailwindcss-animate` |
| Language       | [TypeScript](https://www.typescriptlang.org)                                |
| Database       | [PostgreSQL](https://www.postgresql.org) via [Prisma ORM 7](https://www.prisma.io) |
| DB connection  | `pg` connection pool (`@prisma/adapter-pg`) + Prisma Accelerate extension    |
| Auth           | [NextAuth.js v5](https://next-auth.js.org) (Credentials provider, JWT strategy) |
| File uploads   | [UploadThing](https://uploadthing.com) (via `@uploadthing/react`)           |
| Email          | [Nodemailer](https://nodemailer.com) with EJS templates                     |
| State (client) | [Zustand](https://github.com/pmndrs/zustand), React Context                 |
| Carousels      | Embla Carousel                                                              |
| Misc           | `bcryptjs`, `react-hot-toast`, `react-dropzone`, `lucide-react`, `react-icons`, `uuid` |

> **Node version:** `^20.19 || ^22.12 || >=24` (required by Prisma 7 engines). Node 26+ is supported.

---

## Getting Started

### Prerequisites

- Node.js `^20.19 || ^22.12 || >=24`
- npm `>=11` (uses `install-scripts`, `allowScripts`, and `overrides` features)
- A PostgreSQL database (local, [Neon](https://neon.tech), [Supabase](https://supabase.com), etc.)

### 1. Clone the repository

```bash
git clone https://github.com/Taha-Asad/Herbal-Khana.git
cd Herbal-Khana
```

### 2. Configure environment variables

Create a `.env` file in the project root. Copy a template of your own from the [table below](#environment-variables), or use the shell as a guide:

```bash
cp .env.example .env   # if you create one locally
```

> `npm install` triggers `prisma generate`, and `prisma.config.ts` loads the `.env` file — so create `.env` **before** installing dependencies.

### 3. Install dependencies

```bash
npm install
```

The `postinstall` script runs `prisma generate` automatically.

### 4. Set up the database

```bash
# Apply all migrations to your database
npx prisma migrate deploy

# (Optional, local development only) instead of deploy:
# npx prisma migrate dev
```

### 5. Seed the admin user

```bash
npx prisma db seed
```

Creates the admin account from `ADMIN_EMAIL` / `ADMIN_PASSWORD` (defaults: `admin@herbalkhana.com` / `Admin@123`).

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the storefront and [http://localhost:3000/admin](http://localhost:3000/admin) for the admin dashboard.

---

## Environment Variables

| Variable                 | Required | Description                                                                |
| ------------------------ | -------- | -------------------------------------------------------------------------- |
| `DATABASE_URL`           | ✅        | PostgreSQL connection string, e.g. `postgresql://user:pass@host:5432/db`    |
| `AUTH_SECRET`            | ✅        | NextAuth secret for signing JWT sessions (`openssl rand -base64 32`)        |
| `NEXT_PUBLIC_APP_URL`    | ✅        | Public app base URL, e.g. `http://localhost:3000` — used in emails & links  |
| `UPLOADTHING_TOKEN`      | ✅        | UploadThing API token (see [uploadthing.com](https://uploadthing.com))      |
| `EMAIL_USER`             | ✅        | SMTP sender address used by Nodemailer                                      |
| `EMAIL_PASS`             | ✅        | SMTP password / app password                                                |
| `ADMIN_EMAIL`            | ⬜        | Admin account email (seed + admin verification)                             |
| `ADMIN_PASSWORD`         | ⬜        | Admin account password (seed); default `Admin@123`                          |
| `LOGO_URL`               | ⬜        | Logo URL used in transactional email branding                               |
| `FACEBOOK_URL`           | ⬜        | Social link in email footers                                                |
| `INSTAGRAM_URL`          | ⬜        | Social link in email footers                                                |
| `TWITTER_URL`            | ⬜        | Social link in email footers                                                |
| `WHATSAPP_URL`           | ⬜        | Social link in email footers                                                |

---

## Database

The schema lives in [`prisma/schema.prisma`](prisma/schema.prisma) (PostgreSQL provider). Key models:

| Model                | Purpose                                                        |
| -------------------- | -------------------------------------------------------------- |
| `User`               | Customers & admins (roles `USER` / `ADMIN`), verification flags |
| `OAuthAccount`       | Provider accounts for future OAuth providers                   |
| `Session`            | Auth sessions                                                  |
| `Address`            | Saved shipping / billing addresses                             |
| `Category`           | Product categories (active, sort order)                        |
| `Product`            | Catalog products with SKU, SEO, featured/new flags, sales counts |
| `ProductImage`       | Product gallery images (primary, sort order)                   |
| `ProductVariant`     | Size / scent / concentration variants with price & stock       |
| `Cart` / `CartItem`  | Persistent carts (user or guest session), save-for-later items |
| `PromoCode`          | Discount codes (percentage / fixed / free shipping)            |
| `UserPromoCode`      | Tracks promo usage per user                                    |
| `ShippingMethod`     | Shipping options (price, free-above, estimates)                |
| `ShippingZone`       | Region-based shipping rates                                    |
| `Order` / `OrderItem`| Orders with snapshot fields (address, promo, totals, currency) |
| `OrderTimeline`      | Order status history                                           |
| `Review` / `Comment` | Product ratings and comments (review moderation)               |
| `BookmarkedProduct`  | User wishlists                                                 |
| `Setting`            | Key/value site settings                                        |
| `ContactMessage`     | Contact form inbox                                             |
| `NewsletterSubscriber`| Newsletter subscriptions, unsubscribe tokens, email stats      |

### Common Prisma commands

```bash
npx prisma generate     # regenerate the client after schema changes
npx prisma migrate dev  # create + apply a migration (local dev)
npx prisma migrate deploy  # apply migrations (CI / production)
npx prisma db seed      # seed the admin user
npx prisma studio       # browse data via GUI
npx prisma validate     # validate the schema
```

The Prisma client is a singleton backed by a connection pool (`max: 10` connections) defined in `src/lib/prisma.ts`.

---

## Authentication & Authorization

NextAuth v5 with a **Credentials** provider (`src/auth.ts`):

- Passwords hashed with `bcryptjs` + JWT session strategy.
- Session cookie holds `id`, `role`, and `rememberMe`. *Remember me* extends the session to 7 days (default 1 day).
- `src/auth.config.ts` defines NextAuth config; `src/auth.ts` wires the credentials provider.
- `src/proxy.ts` protects `/home/account/*` and `/admin/*` routes (unauthenticated users are redirected home).
- `src/lib/auth/admin-auth.ts` enforces the `ADMIN` role (`requireAdmin` / `checkAdminAccess`).

---

## Payments

Payment methods are configured in `src/lib/payment-config.ts`:

| Method     | Type          | Requires proof |
| ---------- | ------------- | -------------- |
| JazzCash   | Mobile wallet | ✅ screenshot upload |
| EasyPaisa  | Mobile wallet | ✅ screenshot upload |
| COD        | Cash on delivery | ❌            |

- Mobile-wallet payments are confirmed when the customer uploads a payment-proof screenshot (via UploadThing) on `/home/upload-payment-proof`.
- Admins review proofs from the order detail page and advance the order status.
- `ORDER_STATUSES` maps statuses to user-facing messages.

> ⚠️ Update the placeholder business name and account numbers in `src/lib/payment-config.ts` before going live.

---

## Email

Transactional emails are sent with Nodemailer (`src/lib/mailer.ts`) using EJS templates in `src/templates/`:

| Template                    | Event                                    |
| --------------------------- | ---------------------------------------- |
| `email-verification.ejs`    | Account email verification               |
| `reset-password.ejs`        | Password reset                           |
| `order-confirmation.ejs`    | New order placed                         |
| `payment-pending.ejs`       | Payment outstanding / awaiting proof     |
| `payment-proof-received.ejs`| Payment proof received (admin)           |
| `payment-rejected.ejs`      | Payment proof rejected                   |
| `newsletter-welcome.ejs`    | Newsletter signup confirmation           |
| `contact-auto-reply.ejs`    | Auto-reply to contact form               |
| `contact-notification.ejs`  | New contact message (staff)              |

Feeds from `EMAIL_USER` / `EMAIL_PASS` via SMTP. Branding (`LOGO_URL`, social links, `NEXT_PUBLIC_APP_URL`) is applied in `src/lib/email/*`.

---

## File Uploads

Uploads use UploadThing (`src/utils/uploadThing.ts`):

- File router: `src/app/api/uploadthing/core.ts` — auth-guarded `imageUploader` (max `4MB`, 1 file).
- Used for product images, payment-proof screenshots, and profile images.
- Set `UPLOADTHING_TOKEN` and allow the token domains in `next.config.ts` → `images.remotePatterns` (`*.ufs.sh`).

---

## Project Structure

```
├── prisma/
│   ├── schema.prisma          # Data model
│   ├── seed.ts                # Admin seed script
│   ├── migrations/            # SQL migrations
│   └── config via prisma.config.ts  # Prisma datasource + seed config
│
└── src/
    ├── app/
    │   ├── (root pages)       # /, /privacy, /terms
    │   ├── home/              # Storefront (shop, cart, checkout, track, blog, …)
    │   ├── admin/             # Admin dashboard (orders, products, users, …)
    │   ├── account lives under home/account  # Customer account area
    │   ├── auth/              # login, register, verify-email, reset-password
    │   ├── api/
    │   │   ├── auth/          # NextAuth route handler
    │   │   ├── checkout/      # Checkout validation
    │   │   ├── orders/        # Orders, tracking, payment proof
    │   │   └── uploadthing/   # File upload router
    │   └── action/            # Server actions (admin/*, home/*)
    │
    ├── components/
    │   ├── admin/             # Dashboard UI components
    │   ├── layout/            # Navbar, footer, checkout, order-tracking parts
    │   └── ui/                # Reusable UI (cards, forms, filters, cart parts)
    │
    ├── hooks/                 # cart, product, clipboard, intersection observer
    ├── contexts/              # Theme provider
    ├── store/                 # Zustand stores (cart)
    ├── lib/                   # prisma, auth guards, mailer, emails, payment config
    ├── templates/             # EJS email templates
    ├── types/                 # Shared TypeScript types
    └── utils/                 # uploadthing helpers, formatters
```

---

## Available Scripts

| Command            | Description                                   |
| ------------------ | --------------------------------------------- |
| `npm run dev`      | Start the dev server (webpack)                |
| `npm run build`    | Production build (webpack)                    |
| `npm start`        | Start the production server                   |
| `npm run lint`     | Run ESLint                                   |
| `npm install`      | Installs deps + runs `prisma generate` (postinstall) |

`npx prisma db seed` seeds the admin account (`tsx prisma/seed.ts`).

> Note: `overrides` in `package.json` pin patched versions of transitive deps (`effect`, `mysql2`, `deepmerge-ts`), and `.npmrc` sets `legacy-peer-deps=true` to tolerate the optional `nodemailer@^7||^8` peer range declared by `next-auth`. `allowScripts` in `package.json` whitelists postinstall scripts (`prisma`, `esbuild`, `sharp`, etc.). Keep these if you run `npm audit fix`.

---

## Configuration Files

| File                 | Purpose                                                        |
| -------------------- | -------------------------------------------------------------- |
| `next.config.ts`     | Image domains (Unsplash, UploadThing), 10MB server-action limit, console stripping in prod |
| `prisma.config.ts`   | Loads `.env`, sets schema/migrations/seed, reads `DATABASE_URL` |
| `tailwind.config.ts` | Tailwind v4 theme configuration                                |
| `src/proxy.ts`       | Auth-protected route matcher (proxy/middleware)                |
| `src/auth.ts`        | NextAuth credentials provider and JWT/session callbacks        |
| `.npmrc`             | `legacy-peer-deps=true`                                        |
| `package.json`       | Scripts, deps, `allowScripts`, `overrides`                     |

---

## Deployment

### Deploying to Vercel

1. Push the repository to a Git provider and import it into Vercel.
2. Configure all [environment variables](#environment-variables) (`DATABASE_URL`, `AUTH_SECRET`, `UPLOADTHING_TOKEN`, `EMAIL_USER/PASS`, `NEXT_PUBLIC_APP_URL`, …).
3. Add your production `DATABASE_URL` schema/state before first build — or run `npx prisma migrate deploy` against the production database (e.g. in a build step).
4. Deploy. The build command is `npm run build` (already configured via the `build` script).

### Deploying elsewhere (Node.js server)

```bash
npm ci
npm run build
npx prisma migrate deploy
npm start
```

Served on `PORT` (default `3000`). Point `NEXT_PUBLIC_APP_URL` at the public URL and keep the server behind HTTPS (required for secure cookie + OAuth-adjacent flows).

---

## Customization Notes

- **Branding** — edit root metadata in `src/app/layout.tsx`, logo URL in `.env` (`LOGO_URL`), and social links.
- **Payments** — replace account placeholders in `src/lib/payment-config.ts`.
- **AI chat widget** — an optional Zanderio chat widget script is embedded in `src/app/layout.tsx`; remove or replace with your own widget.
- **Fonts** — Inter + Noto Nastaliq Urdu (supports Urdu UI copy) configured via `next/font/google` in the root layout.
- **SEO** — products and categories support `metaTitle` / `metaDescription`.

---

## Troubleshooting

| Issue | Solution |
| ----- | -------- |
| `prisma generate` fails at install | Ensure `.env` exists **before** `npm install` (`DATABASE_URL` required by `prisma.config.ts`). |
| `npm install` reports ERESOLVE | `.npmrc` sets `legacy-peer-deps=true` to handle the `next-auth` ↔ `nodemailer` optional peer range. Do not remove it. |
| Uploaded images don't render | `UPLOADTHING_TOKEN` must match your UploadThing app; the token host must be in `next.config.ts` → `images.remotePatterns`. |
| Emails not sending | Verify `EMAIL_USER` / `EMAIL_PASS` (for Gmail use an app password, not the account password). |
| Login always fails even with right password | Confirm the account is `isActive` and not `isBanned`; OAuth-only (passwordless) accounts can't use credentials login. |
| Admin dashboard redirects home | The account must have `role = "ADMIN"`; seed the admin user or update the role. |

---

## License

License details are not yet declared. Contact the repository maintainers for usage and redistribution terms.

---

_© Herbal Khana. For issues or feature requests, open a ticket in the repository._