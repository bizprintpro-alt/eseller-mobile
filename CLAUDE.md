# eseller-mobile — Malchnaas Shuud Integration

## Repo Purpose

Mobile app for eseller.mn multi-vertical marketplace.
Serves customers, sellers (7 shop types), drivers.

## Current Active Work

Adding **"Малчнаас шууд"** (Direct-from-Herder) as an 8th shop type.
Tracking: see [docs/INTEGRATION_PLAN.md](docs/INTEGRATION_PLAN.md).
Feature flag: `MALCHNAAS_ENABLED` (default off).

Also in progress (backend-side, separate repo): fixing existing dropshipping (`PREORDER`) shop type bugs — prices rendering as 24₮/1₮ and images missing. See [docs/DROPSHIPPING_FIX_PROMPT.md](docs/DROPSHIPPING_FIX_PROMPT.md).

## Read Before Working

- [docs/CODEBASE_MAP.md](docs/CODEBASE_MAP.md) — structure + key paths (PROMPT 1 output)
- [docs/PRD_Malchnaas_Shuud.md](docs/PRD_Malchnaas_Shuud.md) — product requirements
- [docs/INTEGRATION_PLAN.md](docs/INTEGRATION_PLAN.md) — implementation plan (PROMPT 2 output)
- [docs/01_Feedback_Report.md](docs/01_Feedback_Report.md) — dropshipping bug report
- [docs/02_Technical_Spec.md](docs/02_Technical_Spec.md) — international spec dropshipping must meet
- [docs/04_Claude_Code_Integration_Prompt.md](docs/04_Claude_Code_Integration_Prompt.md) — the 3-prompt workflow

## Strict Rules

- DO NOT create parallel infrastructure — reuse existing.
- DO NOT invent new API conventions — follow what's there (REST, JWT via axios interceptor, `{ success, data }` wrapper).
- DO NOT modify unrelated files.
- All new herder-specific code must be behind `MALCHNAAS_ENABLED`.
- Monetary values: integer MNT. No floats, no currency conversion on mobile.
- Match existing commit format, ESLint config, Prettier config.
- Mongolian is primary language. All user-visible strings in Mongolian (no i18n system today).
- Offline-first for listing CRUD (PRD §7) — herders often on 2G/3G.

## Domain Concepts

- **Shop Type**: `GENERAL | PREORDER | REAL_ESTATE | CONSTRUCTION | AUTO | SERVICE | DIGITAL` — enum in [app/(customer)/register-shop.tsx:9-17](app/(customer)/register-shop.tsx). Adding `HERDER` as 8th.
- **Herder (Малчин)**: verified individual with livestock registration (А данс). Lives in хөдөө (rural). Sells meat, wool, leather, dairy, butter, cheese, yoghurt.
- **Aimag**: administrative region (21 total). Delivery time depends on it. Source of truth should be DB `aimag_delivery_config` table.
- **Coordinator (Орон нутгийн координатор)**: local helper onboarding herders in a sum/district. Earns 2-3% commission on herder sales.
- **Cold chain**: required for meat/dairy; restricts shipping options. Herder products tagged `requires_cold_chain: true`.
- **А данс**: livestock registry at Mal Aj Ahuin Gazar (МЭАЖГ). Required for herder KYC.
- **Escrow (Дундын данс)**: existing backend feature. Customer pays → platform holds → delivery confirmed → 48-72h → released to herder.

## Integration Surface

### Reuse, don't rewrite

- Auth / User store — [src/store/auth.ts](src/store/auth.ts)
- Cart / Checkout / Order — [src/store/cart.ts](src/store/cart.ts), [app/cart.tsx](app/cart.tsx), [app/checkout.tsx](app/checkout.tsx)
- QPay / SocialPay / Wallet — [src/services/api.ts](src/services/api.ts) (`POSAPI`, `WalletAPI`)
- Escrow — backend only, no mobile UI today
- Driver assignment — [app/(driver)/](app/(driver)/)
- Order state machine — [app/(tabs)/orders.tsx:6-15](app/(tabs)/orders.tsx)
- Dashboard/analytics pattern — [app/(owner)/analytics.tsx](app/(owner)/analytics.tsx)
- Design tokens — [src/shared/design.ts](src/shared/design.ts) (`C`, `R`, `F`, `S`)

### Extend only these

- Shop type enum + registration wizard — add 8th card ([app/(customer)/register-shop.tsx](app/(customer)/register-shop.tsx))
- Product model — add herder-specific fields (backend schema)
- Discovery UI — add province picker, cert badge, category (`app/(customer)/herder.tsx` — partial exists)
- Shipping calc — handle cold chain + aimag-based ETA (backend)
- Role union — add `'herder' | 'coordinator'` to auth store

## Tech Stack Pinned

- Expo 54 / React Native 0.81 / React 19
- expo-router 6 (file-based routing)
- zustand 5 + @tanstack/react-query 5
- axios 1.15 (one base URL, one interceptor)
- zod 4 for DTO validation
- react-hook-form 7 for forms
- TypeScript 5.9

Do not introduce new state libs, routing libs, or HTTP clients.

## Git Workflow

- Branch per milestone: `feat/malchnaas-m1-discovery`, `feat/malchnaas-m2-detail`, etc.
- Commit format: `feat(malchnaas): <short desc>` / `fix(malchnaas): <short desc>`.
- One milestone = one PR. Small, independently deployable. All behind flag.
- Merge into `master` only after tests pass + review.
- Rollback = flip `MALCHNAAS_ENABLED=false`. Code stays.

## Testing

- Run `npx tsc --noEmit` before committing.
- Expo start on device: `npx expo start --clear`.
- No unit test runner configured today — if tests are added, use `jest` + `@testing-library/react-native`.

## Contact / Ownership

- Backend repo owner: **unknown — awaiting user to share Sarana eseller backend clone path**.
- Web repo owner: **unknown — awaiting user**.
- Mobile (this repo): `github.com/bizprintpro-alt/eseller-mobile`.
