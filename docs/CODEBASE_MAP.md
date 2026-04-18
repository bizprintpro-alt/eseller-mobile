# eseller-mobile — Codebase Map

> Output of **PROMPT 1 — Codebase Discovery** from `04_Claude_Code_Integration_Prompt.docx`.
> Written before adding the "Малчнаас шууд" (Direct-from-Herder) shop type.
> No new code written — read-only analysis.

Last updated: 2026-04-18

---

## 1. Stack & Structure

| Layer | Tech |
|-------|------|
| Framework | Expo 54 + React Native 0.81 + React 19 |
| Routing | `expo-router` 6 (file-based, route groups) |
| State | `zustand` (auth, cart) + `@tanstack/react-query` v5 (server data) |
| HTTP | `axios` via `src/services/api.ts` (single base URL, JWT interceptor) |
| Forms | `react-hook-form` + `zod` |
| Storage | `expo-secure-store` (token), `@react-native-async-storage/async-storage` (cart) |
| Sockets | `socket.io-client` 4.8 |
| Lang | TypeScript 5.9 |

### Folder layout

```
eseller-mobile/
├── app/                      # expo-router routes
│   ├── (auth)/               # login, otp, register, forgot-password
│   ├── (customer)/           # buyer-facing screens (30+ screens)
│   ├── (seller)/             # seller dashboard (catalog, earnings, leaderboard)
│   ├── (owner)/              # shop owner dashboard (POS, orders, analytics)
│   ├── (driver)/             # driver: deliveries, earnings, profile
│   ├── (tabs)/               # bottom tabs: home, store, search, orders, feed, chat, gold, profile
│   ├── chat/[id].tsx         # chat detail
│   ├── order/[id].tsx        # order detail
│   ├── product/[id].tsx      # product detail
│   ├── storefront/[slug].tsx # shop page
│   ├── track/[code].tsx      # tracking
│   ├── components/           # shared UI (home/, BarcodeScanner, LiveCarousel, …)
│   └── _layout.tsx           # providers (QueryClient, Auth, theme)
├── src/
│   ├── services/api.ts       # axios client + domain APIs (Social, Wallet, POS, Live, Order)
│   ├── store/auth.ts         # zustand auth store (login, logout, role)
│   ├── store/cart.ts         # zustand cart (persisted)
│   ├── shared/design.ts      # C (colors), R (radii), F (fonts), S (spacing)
│   ├── shared/ui/            # Skeleton, etc.
│   └── features/             # auth, cart, chat, driver, feed, gold, seller, store
└── package.json
```

### Routing

- `expo-router` uses filesystem for routes. Parenthesised folders = route groups (no URL segment).
- Tabs live in `app/(tabs)/_layout.tsx`.
- Role gates happen inside screens (conditional render based on `useAuth().user.role`), not in route config.

---

## 2. Shop Types (existing)

**Source of truth**: `app/(customer)/register-shop.tsx:9-17` — `TYPES` array is the "Борлуулагч болох" wizard step-1 card set.

```ts
const TYPES = [
  { key: 'GENERAL',      label: 'Ерөнхий' },     // #1 Дэлгүүр
  { key: 'PREORDER',     label: 'Preorder' },    // #2 Захиалгын дэлгүүр (dropshipping)
  { key: 'REAL_ESTATE',  label: 'Үл хөдлөх' },    // #3 Үл хөдлөхийн агент
  { key: 'CONSTRUCTION', label: 'Барилга' },     // #4 Барилгын компани
  { key: 'AUTO',         label: 'Авто' },         // #5 Авто худалдаа
  { key: 'SERVICE',      label: 'Үйлчилгээ' },   // #6 Үйлчилгээ
  { key: 'DIGITAL',      label: 'Дижитал' },     // #7 Файл/Дижитал бараа
];
```

Home-page picker (`app/(tabs)/index.tsx:71-79`, `ENTITY_TYPES`) mirrors the 7 types with icons + brand colors.

**"Become Seller" wizard** (4 steps): type → name/phone → about/logo → bank → `POST /shops`.

---

## 3. Product/Listing Model

**Mobile doesn't define its own product schema** — it consumes backend response shapes loosely via `any`. Representative shape (inferred from `app/(customer)/herder.tsx:37-51` + shop pages):

```ts
interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number | null;
  images: string[];
  category?: string | null;
  // Herder-specific (already present but partial):
  herder?: {
    herderName: string;
    province: string;       // code, e.g. "AKH"
    provinceName: string;   // display, "Архангай"
    district: string;
    isVerified: boolean;
  } | null;
}
```

### Backend API surface consumed

Documented via `src/services/api.ts` named exports. Examples:

- `SocialAPI` — feed, posts, likes, comments
- `WalletAPI` — wallet, topup, transactions, withdraw
- `POSAPI` — searchProducts, createOrder, checkPayment
- `LiveAPI` — active/scheduled streams, messages, purchase
- `OrderAPI` — role-aware `/orders` (buyer/seller/driver)
- `LoyaltyAPI` — loyalty points
- Ad-hoc: `GET /herder/products`, `GET /products`, `POST /shops`, `GET /seller/analytics`

All REST. Base URL `http://192.168.1.9:3000/api` (dev) / `https://eseller.mn/api` (prod) — `src/services/api.ts:5-8`.

---

## 4. Order / Payment / Escrow Flow

Traced via `src/services/api.ts:274-293` (`OrderAPI`) and payment screens.

### Cart → Checkout → Order

1. `app/(tabs)/store.tsx` / product screens → `useCart().add()` (local, zustand, AsyncStorage persisted) — [src/store/cart.ts](src/store/cart.ts)
2. `app/cart.tsx` — review
3. `app/checkout.tsx` — address + payment method
4. `POST /orders` → order created, status `pending`
5. Status pipeline (seen in `app/(tabs)/orders.tsx:6-15`):
   `pending → confirmed → preparing → ready → handed_to_driver → delivering → delivered` (or `cancelled`)

### Payment

- **QPay**: via `POSAPI.createQPayInvoice`, invoice id returned, client polls `GET /payment/qpay/check/:invoiceId`
- **SocialPay**: backend-initiated (not traced in mobile)
- Wallet top-ups: `POST /wallet/topup` with `{ amount, method, reference }`

### Escrow ("Дундын данс")

- **No explicit mobile code** — escrow is a backend concept. Mobile trusts the backend order lifecycle.
- User-visible trigger: customer pays at checkout → status advances only when driver marks delivered → vendor payout released after TBD hold period.
- See `returns.tsx:21` — `POST /orders/:id/return` hits the return endpoint which presumably reverses escrow.

**Gap for Malchnaas**: no mobile-side escrow hold UI (e.g. "funds released in X days" on the order detail). Same backend escrow engine will be reused.

---

## 5. Delivery / Driver System

- Dedicated role group `app/(driver)/` — `deliveries.tsx`, `earnings.tsx`, `profile.tsx`.
- Driver APIs via `OrderAPI`:
  - `GET /driver/orders?type=available|mine`
  - `POST /driver/orders/:id/accept`
  - `POST /driver/orders/:id/deliver`
- Tracking screen: `app/track/[code].tsx` — public (takes `code` param), polls `GET /tracking/:code` every 30s.
- No multi-leg consolidation today. Aimag-level hubs are PRD-only.

---

## 6. Commission & Payout

- **Commission**: 5% default — see `become-seller.tsx:13` (referral mode). Backend presumably holds per-vendor commission rates.
- **Payout request**: `WalletAPI.requestPayout` → `POST /wallet/withdraw { amount, bankName, bankAccount }`.
- **Admin approval flow**: backend has `approveWithdraw/rejectWithdraw` (seen via Stage B audit). No mobile UI for admin approval — web only.
- **Seller earnings screen**: `app/(seller)/earnings.tsx` shows totals (presumably unblocked by delivered orders past the hold window).

---

## 7. Malchнаас шууд — Already Partially Built ⚠

This is the critical finding. A first-pass implementation exists. Scope of what's done / what's missing:

| Area | Status | Path |
|------|--------|------|
| Customer discovery screen | ✅ Done (UI + API) | [app/(customer)/herder.tsx](app/(customer)/herder.tsx) |
| Home page entry card | ✅ Done ("Малчны Шинэ бараа") | [app/(tabs)/index.tsx:55-61](app/(tabs)/index.tsx) |
| Home horizontal carousel | ✅ Done | [app/components/home/HerderRow.tsx](app/components/home/HerderRow.tsx) |
| Backend `GET /herder/products` | ✅ Live (served at eseller.mn) | — |
| Province filter (19 aimag) | ⚠ Incomplete: missing **Баян-Өлгий, Дорноговь** | `herder.tsx:13-33` |
| Category filter (8 categories) | ✅ Done: мах, ноос, арьс, сүү, бяслаг, дэгэл, аарц, тараг | `herder.tsx:35` |
| "Шууд захиалах" button | ❌ **No onPress handler — dead button** | `herder.tsx:215-221` |
| Herder product detail page | ❌ Falls through to generic `/product/[id]` — no А-данс badge, no cold-chain warning, no cert viewer | — |
| Herder becomes-seller flow | ❌ Missing (no 8th card in register-shop wizard) | — |
| Herder dashboard (orders, payouts) | ❌ Missing | — |
| А-данс (livestock registry) upload | ❌ Missing | — |
| Vet certificate upload | ❌ Missing | — |
| Cold-chain product flag in UI | ❌ Missing | — |
| Coordinator role/dashboard | ❌ Missing | — |
| Aimag delivery config | ⚠ Hardcoded in `herder.tsx` — should come from DB | — |
| Feature flag (`MALCHNAAS_ENABLED`) | ❌ Missing | — |
| Escrow hold display on order | ❌ Missing | — |

---

## 8. Dependency Diagram

```mermaid
graph TD
  AuthStore[src/store/auth.ts] --> API[src/services/api.ts]
  CartStore[src/store/cart.ts] --> API
  API --> BE[(eseller.mn backend)]

  HomeTab[(app/(tabs)/index.tsx)] --> HerderRow[app/components/home/HerderRow.tsx]
  HomeTab --> SERVICE_ITEMS
  SERVICE_ITEMS -->|route| HerderScreen[app/(customer)/herder.tsx]
  HerderRow --> HerderScreen
  HerderScreen -->|GET /herder/products| BE

  HerderScreen -.missing.-> ProductDetail[app/product/[id].tsx]
  ProductDetail --> Cart[app/cart.tsx]
  Cart --> Checkout[app/checkout.tsx]
  Checkout --> OrderAPI[OrderAPI.myOrders]
  OrderAPI --> BE

  RegisterShop[app/(customer)/register-shop.tsx] -.missing HERDER card.-> BE
  BecomeSeller[app/(customer)/become-seller.tsx] --> SellerDashboard[app/(seller)/dashboard.tsx]

  Driver[app/(driver)/deliveries.tsx] -->|OrderAPI.availableOrders| BE
```

---

## 9. Things NOT in this repo (need elsewhere)

The mobile repo is **one of three**. The other two are required to finish the full Malchnaas integration:

1. **eseller.mn backend** (likely Node/Express or NestJS — Stage B audit referenced it as "Sarana eseller backend"). Needed for:
   - Dropshipping price/image bug fix (currency conversion, CDN mapping)
   - Herder-specific DB schema (`herder_profiles`, `herder_certifications`, `aimag_delivery_config`)
   - `/api/herder/products` enrichment (verified badge logic, cold-chain flag)
   - Feature flag gate server-side
2. **eseller.mn web** (likely Next.js). Needed for:
   - Product detail hydration (Baymard-style: specs, images, variants, reviews)
   - Admin KYC review UI for herder verification
   - Coordinator admin dashboard
3. **OpenAPI/Swagger spec** — if available, shortens integration plan review from days to hours.

### What we still need from the user

- [ ] Clone path / repo URL for **eseller.mn backend**
- [ ] Clone path / repo URL for **eseller.mn web**
- [ ] Confirmation of commission rate for herders (PRD proposes 8-12%; existing affiliate is 5%)
- [ ] Pilot aimag confirmation (PRD v1.0 says Архангай / Төв / Сэлэнгэ)
- [ ] Access to Supplier API docs (for dropshipping fix — AliExpress/CJ/etc.)

---

## 10. Key Files — Quick Reference

| Purpose | Path |
|---------|------|
| Axios client + JWT + 401 redirect | [src/services/api.ts](../src/services/api.ts) |
| Auth store | [src/store/auth.ts](../src/store/auth.ts) |
| Cart store | [src/store/cart.ts](../src/store/cart.ts) |
| Design tokens | [src/shared/design.ts](../src/shared/design.ts) |
| Home screen + SERVICE_ITEMS | [app/(tabs)/index.tsx](../app/(tabs)/index.tsx) |
| Shop-type wizard | [app/(customer)/register-shop.tsx](../app/(customer)/register-shop.tsx) |
| Herder discovery | [app/(customer)/herder.tsx](../app/(customer)/herder.tsx) |
| Herder home carousel | [app/components/home/HerderRow.tsx](../app/components/home/HerderRow.tsx) |
| Generic product detail | [app/product/[id].tsx](../app/product/[id].tsx) |
| Order detail | [app/order/[id].tsx](../app/order/[id].tsx) |
| Order list (role-aware) | [app/(tabs)/orders.tsx](../app/(tabs)/orders.tsx) |
| Owner orders (state machine transitions) | [app/(owner)/orders.tsx](../app/(owner)/orders.tsx) |
| Driver deliveries | [app/(driver)/deliveries.tsx](../app/(driver)/deliveries.tsx) |
| Tracking | [app/track/[code].tsx](../app/track/[code].tsx) |

---

— End of CODEBASE_MAP —
