# Malchnaas Shuud — Integration Plan (Mobile)

> Output of **PROMPT 2 — Integration plan** from `04_Claude_Code_Integration_Prompt.docx`.
> Based on [CODEBASE_MAP.md](CODEBASE_MAP.md) + [PRD_Malchnaas_Shuud.md](PRD_Malchnaas_Shuud.md).
> Scope: **eseller-mobile only**. Backend + web work tracked separately.
> Feature flag for the whole thing: `MALCHNAAS_ENABLED` (default off).

Last updated: 2026-04-18

---

## 0. Operating Principles

1. **Reuse existing infra** — auth, cart, checkout, QPay/SocialPay, escrow, driver, commission are already built. We extend, we do not duplicate.
2. **Feature flag** — every new branch/file/screen is gated on `MALCHNAAS_ENABLED` (env + remote config). Rollback = flip flag to false.
3. **Match code style exactly** — same zustand/react-query patterns, same design tokens (`C/R/F/S`), same axios interceptor, same route-group layout.
4. **One milestone = one PR** — small, independently deployable, reviewable in under 30 min.
5. **Mongolian UI** — primary language stays Mongolian. English strings only for developer-facing tooling.
6. **No backend work in this plan** — this plan only covers what mobile does. Backend changes are listed as *preconditions*.

---

## 1. ADDITIONS — new files

Estimated **16 new files**, ~1,900 lines total.

| # | Path | Purpose | Approx LOC |
|---|------|---------|------------|
| A1 | `src/config/flags.ts` | Feature-flag reader (`MALCHNAAS_ENABLED`, `DROPSHIPPING_V2_ENABLED`, etc.) | 40 |
| A2 | `src/features/herder/types.ts` | `HerderProfile`, `HerderProduct`, `HerderCert`, `AimagConfig` interfaces | 60 |
| A3 | `src/features/herder/api.ts` | `HerderAPI` object — list, detail, my-listings, cert-upload, aimag-config | 80 |
| A4 | `src/features/herder/store.ts` | zustand store for herder-filter state (province, category, sort) with AsyncStorage persist | 70 |
| A5 | `src/features/herder/constants.ts` | 21 aimags (add missing 2), 8 categories, cold-chain category list, unit types | 80 |
| A6 | `app/(customer)/become-herder.tsx` | Landing page (mirrors `become-seller.tsx`) | 40 |
| A7 | `app/(customer)/register-herder.tsx` | 6-step wizard: basics → А-данс → GPS → bank → cert upload → review | 280 |
| A8 | `app/(customer)/herder-product/[id].tsx` | Herder-specific product detail (cert badge, cold-chain, herder profile card) | 240 |
| A9 | `app/(customer)/herder-profile/[id].tsx` | Public herder profile page (rating, since, listings, map) | 180 |
| A10 | `app/(herder)/_layout.tsx` | Herder role tab layout (dashboard, listings, orders, earnings, profile) | 40 |
| A11 | `app/(herder)/dashboard.tsx` | KPI cards (revenue, orders, listings), recent activity | 130 |
| A12 | `app/(herder)/listings.tsx` | CRUD for herder's own products | 200 |
| A13 | `app/(herder)/orders.tsx` | Herder order queue, state transitions (confirm → preparing → ready-for-pickup) | 180 |
| A14 | `app/(herder)/earnings.tsx` | Payout history, escrow-held balance, bank details | 120 |
| A15 | `app/(coordinator)/dashboard.tsx` | Coordinator role — onboarded herders list, commission earned | 140 |
| A16 | `src/features/herder/useHerderFeed.ts` | React Query hooks for feed + detail with pagination | 80 |

---

## 2. MODIFICATIONS — existing files

**Minimize these. Prefer additive changes.**

| # | Path | Change | Reason |
|---|------|--------|--------|
| M1 | `app/(customer)/register-shop.tsx:9` | Add 8th entry `{ key: 'HERDER', icon: 'leaf-outline', label: 'Малчин' }` — wrapped in `flags.MALCHNAAS_ENABLED` | PRD §6.1 — herder registers via same wizard |
| M2 | `app/(customer)/register-shop.tsx:45` | Branch submit: if `shopType === 'HERDER'`, `router.push('/(customer)/register-herder')` instead of POST | Herder has 6 steps vs 4, different payload |
| M3 | `app/(customer)/herder.tsx:13-33` | Add **Баян-Өлгий (BOL)** + **Дорноговь (DOR2)** to `PROVINCES`. Move list to `src/features/herder/constants.ts` (A5) and import | PRD §6.3 — must support all 21 aimags |
| M4 | `app/(customer)/herder.tsx:55` | Replace inline `fetch` with `HerderAPI.list` from A3 | Use the shared axios interceptor (JWT + 401 redirect) |
| M5 | `app/(customer)/herder.tsx:215-221` | Wire "Шууд захиалах" button → `useCart().add({ productId, quantity: 1, source: 'herder' })` + haptic + `router.push('/cart')` | **Dead button today — P0 bug fix** |
| M6 | `app/(customer)/herder.tsx:172` | Change `<View>` wrapping product card to `<TouchableOpacity onPress={() => router.push(\`/(customer)/herder-product/\${product.id}\`)}>` | Route to new detail page (A8) instead of generic `/product/[id]` |
| M7 | `app/(tabs)/index.tsx:55-61` | Gate "Малчны Шинэ бараа" entry on `flags.MALCHNAAS_ENABLED` | Allow controlled rollout |
| M8 | `app/components/home/HerderRow.tsx:19` | Same feature-flag gate | Hide carousel if flag off |
| M9 | `src/services/api.ts:274` | Add note pointing to `src/features/herder/api.ts` | Discoverability |
| M10 | `src/store/auth.ts` | Extend role union with `'herder' \| 'coordinator'` | Role gating |
| M11 | `app/_layout.tsx` | Register `(herder)` and `(coordinator)` route groups | expo-router requires explicit registration for non-default groups? (verify — most route groups are auto-discovered) |
| M12 | `src/shared/design.ts` | Add `C.herder = '#059669'` (already used ad-hoc as `BRAND` in `herder.tsx:10`) | Consolidate |

---

## 3. DATABASE MIGRATIONS — backend precondition

Mobile owns no DB. These migrations must land on **eseller.mn backend** before M2 mobile ship.

```sql
-- 2026_04_XX_herder_shop_type.sql
ALTER TYPE shop_type ADD VALUE 'HERDER';

-- 2026_04_XX_herder_profiles.sql  (from Tech Spec doc 04 §4)
CREATE TABLE herder_profiles (
  shop_id UUID PRIMARY KEY REFERENCES shops(id),
  livestock_registry VARCHAR(50) NOT NULL,
  national_id_verified BOOLEAN DEFAULT false,
  aimag_id VARCHAR(10) NOT NULL,
  sum_id VARCHAR(10) NOT NULL,
  bag_name VARCHAR(100),
  gps_lat DECIMAL(10,6),
  gps_lng DECIMAL(10,6),
  livestock_count INT,
  verification_status VARCHAR(20) DEFAULT 'PENDING',
  coordinator_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE herder_certifications (
  id UUID PRIMARY KEY,
  herder_id UUID REFERENCES herder_profiles(shop_id),
  cert_type VARCHAR(30),          -- VET | ORGANIC | CUSTOMS_READY | A_DANS
  cert_url TEXT,
  issued_at DATE,
  expires_at DATE,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP
);

ALTER TABLE products
  ADD COLUMN requires_cold_chain BOOLEAN DEFAULT false,
  ADD COLUMN herder_category VARCHAR(20),
  ADD COLUMN unit_type VARCHAR(10),
  ADD COLUMN livestock_type VARCHAR(20),
  ADD COLUMN certificate_id UUID REFERENCES herder_certifications(id);

CREATE TABLE aimag_delivery_config (
  aimag_id VARCHAR(10) PRIMARY KEY,
  aimag_name VARCHAR(50),
  min_delivery_days INT,
  max_delivery_days INT,
  cold_chain_available BOOLEAN DEFAULT false
);

-- Seed aimag_delivery_config with all 21 aimags
```

---

## 4. API ENDPOINTS — backend precondition

All new endpoints follow existing conventions: REST, JWT, `{ success, data }` wrapper (axios interceptor unwraps).

| Method | Path | Auth | Payload | Purpose |
|--------|------|------|---------|---------|
| GET | `/herder/products` | optional | `?province&category&page&limit` | **exists** — keep |
| GET | `/herder/products/:id` | optional | — | Herder-enriched detail |
| GET | `/herder/profiles/:shopId` | optional | — | Public profile |
| POST | `/herder/register` | JWT | `HerderProfile` payload | Register herder shop |
| POST | `/herder/certifications` | JWT + role=herder | multipart/form-data | Upload cert |
| GET | `/herder/me/listings` | JWT + role=herder | — | My products |
| GET | `/herder/me/orders` | JWT + role=herder | `?status` | My orders |
| GET | `/herder/me/earnings` | JWT + role=herder | — | Balance + payout history |
| GET | `/aimag/config` | optional | — | Delivery days per aimag |
| GET | `/coordinator/me/herders` | JWT + role=coordinator | — | Onboarded herders |

Rate limit: same 1000 req/hour as `/dropshipping/*` (doc 02 §7).

---

## 5. UI ADDITIONS

### New screens (10)

1. `become-herder` — landing (mirrors `become-seller`)
2. `register-herder` — 6-step wizard
3. `herder-product/[id]` — detail page
4. `herder-profile/[id]` — public profile
5. `(herder)/dashboard` — KPIs
6. `(herder)/listings` — CRUD
7. `(herder)/orders` — state transitions
8. `(herder)/earnings` — payouts
9. `(coordinator)/dashboard` — onboarded herders
10. (reuse) `/cart`, `/checkout`, `/order/[id]`, `/track/[code]` — unchanged

### Modified screens (7)

- `register-shop.tsx` — 8th card
- `herder.tsx` — 21 aimags, wire order button, route to new detail
- `(tabs)/index.tsx` — flag gate on service card
- `components/home/HerderRow.tsx` — flag gate

### Design tokens

- `C.herder = '#059669'` — already used inline, formalize
- Cold-chain badge: snowflake icon + text "Хөргөлттэй хүргэлт шаардлагатай"
- Verified badge: green checkmark (already exists in `herder.tsx:182`)

---

## 6. REUSE INVENTORY

| Area | Strategy | File |
|------|----------|------|
| Auth | ✅ REUSE as-is. Add `'herder' \| 'coordinator'` to role union | `src/store/auth.ts` |
| Cart | ✅ REUSE as-is (herder is just another source) | `src/store/cart.ts` |
| Checkout | ✅ REUSE as-is | `app/checkout.tsx` |
| Payment (QPay/SocialPay) | ✅ REUSE as-is | `src/services/api.ts` |
| Escrow (Дундын данс) | ✅ REUSE backend as-is; add mobile UI showing "Хүргэлтээс 48 цагийн дараа шилжинэ" | new in `herder-orders.tsx` |
| Commission engine | ✅ REUSE. Backend adjusts rate per shop_type. PRD suggests 8-12% for herder | backend |
| Driver assignment | ✅ REUSE — same pipeline, just cold-chain flag added | `app/(driver)/` |
| Order state machine | ✅ REUSE 7 states | `app/(tabs)/orders.tsx:6-15` |
| Dashboard/analytics | ✅ REUSE pattern from `(owner)/analytics.tsx` | — |
| Notifications | ✅ REUSE `expo-notifications` — add new notification types | — |

**Zero net-new: no new auth, payment, escrow, driver, or notification system.**

---

## 7. RISK AREAS

### What could break

1. **`herder.tsx` replaces inline fetch with shared axios** (M4). The inline version has no 401 redirect. Migrating to `api.ts` adds one — verify no silent session expiry issue.
2. **Adding 8th role to auth store** (M10) — screens that use `switch(role)` must handle the new cases. Grep before shipping: `grep -rn "role ===" app/ src/`.
3. **Cart `source` metadata** (M5) — if backend doesn't yet accept `source` in cart item body, either add it on backend first or omit the field on mobile. Soft-add.
4. **"Бүгд" toggle interaction with new aimags** — adding 2 aimags widens the grid; verify no overflow on small screens.
5. **Coordinator role gating** — make sure a herder can't access `/coordinator/*` routes and vice versa. Centralize check in `(herder)/_layout.tsx` and `(coordinator)/_layout.tsx`.

### What needs careful testing

- Submitting a herder registration on a flaky network (6-step form; resume if dropped out)
- Cold-chain product blocked from standard shipping methods — error copy must be clear
- Feature flag OFF verifies: no herder link appears anywhere in UI; deep link `/(customer)/herder` should 404 or redirect
- Offline listing create (PRD §6.1: herders often on 2G/3G) — out of scope for M1, tracked as M6

---

## 8. MILESTONES

Each milestone is one PR, one feature-flag-safe deploy.

| M | Title | Files | Dep | Ships if flag OFF? | Status |
|---|-------|-------|-----|--------------------|--------|
| **M0** | `MALCHNAAS_ENABLED` flag + `src/features/herder/` skeleton (A1, A2, A3, A5, M12) | 5 new + 1 mod | — | ✅ yes (no user-visible) | ✅ done |
| **M1** | Wire discovery screen (M3, M4, M5, M6) — fixes dead "Шууд захиалах" button, routes to new detail | 4 mods | M0 | ✅ yes (flag guards A8 route; button still wires but product detail falls back) | ✅ done |
| **M2** | Herder product detail (A8) + herder public profile (A9) | 2 new | M0 | ✅ yes | ✅ done |
| **M3** | Home flag gates (M7, M8) | 2 mods | M0 | ✅ yes | ✅ done |
| **M4** | Become-herder landing + wizard (A6, A7) — depends on backend POST /herder/register | 2 new | backend | ✅ yes | ✅ done |
| **M5** | Herder dashboard + listings CRUD (A10, A11, A12, M10) | 3 new + 1 mod | M4 | ✅ yes | ✅ done |
| **M6** | Herder orders + state transitions + earnings (A13, A14) | 2 new | M5 | ✅ yes | ✅ done |
| **M7** | Coordinator dashboard (A15) | 1 new | M5 | ✅ yes | ✅ done |
| **M8** | 8th card in register-shop wizard (M1, M2) — opens the funnel | 1 mod | M4 | ✅ yes | ✅ done |
| **M9** | Pilot enable: flip `MALCHNAAS_ENABLED=true` for 3 aimags (Архангай/Төв/Сэлэнгэ) | config only | M1-M8 | N/A | ✅ done |
| **M10** | Polish pass: role union type (`AppRole` / `BackendRole`) + doc hygiene. Offline-first listing create deferred to Phase-2. | 4 mods | M5-M9 | ✅ yes | ✅ done |

### Order of work

Critical path: **M0 → M1 → M2 → M3 → (M4 → M5 → M6 → M8) || M7 → M9 → M10**

Parallel-friendly: M1, M2, M3 independent after M0. M4-M8 form seller-side chain. M7 can go any time after M5.

### Time estimate

Assuming 1 dev, 3-5 days per milestone (M1-M3 smaller, M5/M6 larger):
- M0-M3 (customer side): 1.5 weeks
- M4-M8 (seller side): 2.5-3 weeks
- M9 (pilot launch): 0.5 week
- M10 (offline): 1 week

**Total mobile: 5-6 weeks for full PRD v1.0 Phase-1 parity.** (Backend + web work parallel.)

---

## 9. Rollback Plan

Every milestone ships behind `MALCHNAAS_ENABLED`. To roll back:

1. Flip flag to `false` in prod config → all herder UI vanishes within one app restart (or 60s if remote-config).
2. Existing data untouched. Users with in-flight herder orders continue via backend-only paths.
3. Code stays in the tree — no revert needed. Next milestone proceeds once the issue is resolved.

---

## 10. Open Questions for PM / Tech Lead

1. **Commission rate** — PRD §10 says 8-12%; existing affiliate is 5%. Final number?
2. **Coordinator commission** — PRD §6.8 says 2-3% of onboarded herder's sales. Confirm + time window (forever? N months?).
3. **Hold period** — Escrow holds funds for how long post-delivery before releasing to herder? (48h? 72h? PRD doesn't say.)
4. **КYC SLA** — PRD §6.1 says 24-48h admin review. Who reviews? Admin tool in web, or human team?
5. **Cold-chain logistics partner** — Only available in 3 pilot aimags? All 21?
6. **Pilot aimags final** — PRD v1.0 says Архангай / Төв / Сэлэнгэ. Confirm before M9.
7. **Launch date target** — Phase 1 MVP is 6-8 weeks per PRD §8. Target date?
8. **Coordinator recruitment** — Who hires them? What % of 330 sums are covered at launch?

---

## 11. Sign-off

- [ ] PM review (PRD owner)
- [ ] Tech Lead review (architecture)
- [ ] Mobile lead review (this doc)
- [ ] Backend lead review (§3-§4 preconditions)
- [ ] QA review (test matrix)

Do NOT start writing code until all four boxes checked.

---

— End of INTEGRATION_PLAN —
