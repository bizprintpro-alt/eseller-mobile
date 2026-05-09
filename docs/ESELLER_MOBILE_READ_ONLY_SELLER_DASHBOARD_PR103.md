# eSeller Mobile Read-Only Seller Dashboard Integration (PR103)

Status: **Mobile implementation PR (read-only UI + API client, no schema, no mutation)**
Repository: `bizprintpro-alt/eseller-mobile`
Branch: `feature/mobile-read-only-seller-dashboard-pr103`
Authors: eSeller Mobile Team
Related upstream PRs:
- Negd PR98 — Read-Only Seller Dashboard API (cookie session)
- Negd PR101 — Internal eSeller S2S Read-Only Seller Adapter
- Sarana PR102 — eSeller BFF Read-Only Seller Proxy Routes

This is the **mobile-side** implementation of the seller-network read-only
dashboard. Mobile keeps its existing `expo-secure-store` Bearer-token flow
to `eseller.mn/api`; new screens consume the Sarana BFF routes added in
PR102, which themselves call the Negd internal S2S adapter from PR101.

---

## A. Executive summary

**Purpose:**

- Render a read-only seller-network dashboard inside the existing
  `(seller)` Expo Router group.
- Consume the Sarana BFF routes (`/api/seller/{me, dashboard,
  wallet-summary, referral-summary, lead-summary, commission-summary}`).
- Preserve the existing affiliate / `(customer)/wallet.tsx` flows
  unchanged.

**Strict invariants honored:**

- Mobile keeps its existing Bearer-token flow against `eseller.mn/api`
  via the shared `src/services/api.ts` axios client.
- Mobile MUST NOT call Negd directly. Verified by guardrail grep
  (`PR103-F002` HIGH).
- Mobile MUST NOT store or even reference the S2S key. Verified
  (`PR103-F004` HIGH).
- Mobile MUST NOT display payout / withdraw UI in any seller flow.
  Verified (`PR103-F003` HIGH). The buyer-facing
  `app/(customer)/wallet.tsx` payout tab is unchanged.
- Mobile MUST NOT call Sarana wallet endpoints from seller flow. Verified.
- Mobile MUST NOT mutate any seller dashboard data. No `useMutation`
  hook is exported from PR103 files. Verified.
- Mobile MUST NOT compute wallet / commission values client-side. The
  four bucket values are rendered as integers from the BFF response.
- Lead summaries show NO customer PII (phone / email / name / note are
  not in the BFF response).
- Offline / stale state is clearly labelled in Mongolian.

**Explicit non-goals:**

- No Negd code changes.
- No Sarana code changes.
- No schema changes / migrations / seed.
- No payout / withdraw UI / route handler.
- No referral rotation / invite creation / lead mutation.
- No commission calculation / posting / run creation.
- No provider calls beyond the existing axios client → Sarana BFF.
- No secrets committed.

---

## B. Implemented mobile files

| File | Purpose | Read/Write | Notes |
|------|---------|-----------|-------|
| `src/api/sellerDashboard.ts` | Typed API client + envelope handling. 6 GET helpers + `SellerApiError` + `describeSellerError`. | Read-only | NO mutation helpers. NO direct Negd URL. Uses shared `get()` from `src/services/api.ts`. |
| `src/hooks/useSellerDashboard.ts` | 6 react-query hooks with appropriate `staleTime`. | Read-only | No `useMutation`. Wallet/commission `staleTime: 30s`; referral/lead/me `staleTime: 60s`. |
| `src/features/sellerNetwork/SellerNetworkSection.tsx` | Composed read-only dashboard cards (profile, wallet, commission, referral, lead, next actions). | Read-only | Owns offline / stale / error UX. Uses existing `C/R/F` design tokens. NO withdraw button. `payableMnt` rendered DISABLED with "not available yet" label. |
| `app/(seller)/dashboard.tsx` | Existing seller dashboard screen — extended. | Read-only addition | Adds `<SellerNetworkSection />` ABOVE the existing `LogoutButton`. Existing `/affiliate/earnings` query and recent-commissions list are UNCHANGED. |
| `app/(seller)/earnings.tsx` | Existing earnings screen — extended. | Read-only addition | Adds a new `SellerNetworkCommissionSection` ABOVE the existing commission history list. The existing `/affiliate/commissions` query is UNCHANGED. The new section labels every amount as dry-run and shows `payableMnt = 0` disabled. |
| `app/(seller)/profile.tsx` | Existing seller profile screen — extended. | Read-only addition | Adds a "Худалдагчийн сүлжээний статус" card sourced from `/api/seller/me`. Status badge + KYC + identity link summary + finance eligibility. NO mutation buttons. |
| `docs/ESELLER_MOBILE_READ_ONLY_SELLER_DASHBOARD_PR103.md` | This document. | Read-only | — |

**No removed files.** **No renamed files.** **No deleted code paths.**

---

## C. API client and auth

### C.1 Base URL

The shared axios client in `src/services/api.ts` already points at
`eseller.mn/api` (or `EXPO_PUBLIC_API_BASE_URL` for dev). New API calls
in `src/api/sellerDashboard.ts` use the relative paths `/seller/me`,
`/seller/dashboard`, etc. — these resolve to
`eseller.mn/api/seller/*` (Sarana BFF), NOT to Negd directly.

### C.2 Auth

Mobile sends its existing Bearer token via the request interceptor in
`src/services/api.ts` (line 19–25). The token is stored in
`expo-secure-store` and read on every request. **PR103 introduces no
new auth code.**

### C.3 No Negd direct URL

Verified by grep: `negd-superapp`, `negd.app`, `negd-app`,
`negd.vercel` — zero matches in PR103 files (`PR103-F002` HIGH).

### C.4 No S2S key

Verified by grep: `ESELLER_S2S_INTEGRATION_KEY` — zero matches in
PR103 files (`PR103-F004` HIGH). The S2S key lives only in Sarana
infrastructure per PR102.

### C.5 No AsyncStorage token usage

Verified by grep: `AsyncStorage` — zero matches in the new PR103
files. Tokens stay in `expo-secure-store` per existing convention.

### C.6 Response envelope handling

The Sarana BFF emits `{ ok: true, data, correlationId,
responseVersion: "seller-dashboard.v1", bff: "sarana-eseller",
upstream: "negd" }`. The legacy axios response interceptor only
unwraps `{ success: bool }` envelopes, so the new `{ ok }` shape passes
through unchanged. The PR103 helpers read `.data` from the envelope and
throw `SellerApiError` on `{ ok: false, error: { code, message, ... } }`.

---

## D. Screens updated

| Screen | What changed | What was preserved |
|--------|--------------|--------------------|
| `app/(seller)/dashboard.tsx` | Added `<SellerNetworkSection />` import + render below the existing recent-commissions list. | Existing affiliate stats card grid, low-stock alert, quick actions, recent commissions. Existing `/affiliate/earnings` query. |
| `app/(seller)/earnings.tsx` | Added new function `SellerNetworkCommissionSection` and small `KvBox` helper. New section rendered ABOVE the existing commission history. Imports react-query hook + error helper. | Existing balance card, existing `/affiliate/commissions` query, existing commission history list. |
| `app/(seller)/profile.tsx` | Added new "Худалдагчийн сүлжээний статус" `Card` after "Борлуулагчийн мэдээлэл". Imports `useSellerMe`, `StatusBadge`, and 3 small Mongolian-status helpers. | Profile header, all existing menu rows, referral code display, leaderboard / settings links, logout. |

**Screens deferred:**

- `app/(seller)/leaderboard.tsx` — out of scope; no PR98 seller-network
  leaderboard endpoint exists.
- `app/(seller)/influencer.tsx` — out of scope; influencer is its own
  flow.
- `app/(seller)/catalog.tsx` and `products.tsx` — existing Sarana
  product flow; not seller-network dashboard surface.
- Notifications-summary surface — deferred at the BFF level (PR102
  passes through `{ deferred: true }` placeholder); mobile renders
  nothing for it in PR103.

---

## E. Wallet / commission display rules

### E.1 Four-bucket model

| Bucket | Source | Rendering |
|--------|--------|-----------|
| `estimatedMnt` | `walletSummary.estimatedMnt` | Blue tone (info), labelled "Тооцоолсон" + hint "Dry-run, төлөгдөх биш". |
| `inReviewMnt` | `walletSummary.inReviewMnt` | Yellow tone (warning), labelled "Хяналтанд" + hint "Шалгаж байна". |
| `approvedNotPayableMnt` | `walletSummary.approvedNotPayableMnt` | Blue tone (info), labelled "Зөвшөөрөгдсөн (төлөгдөөгүй)" + hint "Хүлээгдэж байна". |
| `payableMnt` | `walletSummary.payableMnt` | **DISABLED bucket**. Dashed border, 60% opacity, labelled "Олгогдох (төлөх)" + bold "Одоогоор боломжгүй". **NO `TouchableOpacity` wrapper.** |

### E.2 No payout / withdraw

No `TouchableOpacity` is rendered around the payable bucket. No
`payoutAction` field is read from the response. No `withdrawUrl` is
computed or navigated to. Verified by guardrail grep: every
`withdraw|payout` match in PR103 files is in a comment block
explicitly listing the pattern as **forbidden**.

### E.3 Dry-run warning

Wallet card shows "Серверээс тооцоологдсон. Гар утаснаас тооцохгүй."
plus per-bucket hints. The commission card shows "Бүх мөр dry-run,
төлөгдөх биш. effective=false." The earnings-screen new section
labels every amount as dry-run and renders `payableAmountMnt` inside
a dashed box with "effective=false invariant" hint.

### E.4 No client-side wallet computation

The four bucket integers are read directly from the BFF response and
rendered as-is. No summing, no fallback computation, no derived
"available balance" anywhere in PR103 code.

---

## F. Offline / stale / error states

| State | UX |
|-------|----|
| Loading | `<ActivityIndicator color={C.seller}>` + "Ачааллаж байна…". |
| Stale (react-query `isStale && data`) | Yellow "ХУУЧИРСАН" badge in the section header. Last-computed timestamp shown on the wallet card. |
| Re-fetching | Small spinner + "Шинэчилж байна…" in the section header. |
| Offline (`ApiError.isOffline`) | Red `ErrorCard` with "Офлайн горим" + Mongolian message + "Дахин оролдох" retry button. |
| Unauthenticated (HTTP 401) | The shared axios interceptor at `src/services/api.ts:62-75` already handles 401: it deletes the token and redirects to `/(auth)/login`. PR103 inherits this. |
| `NO_IDENTITY_LINK` (HTTP 404 with code) | Mongolian "Бүртгэл холбогдоогүй байна. Дэмжлэгийн багтай холбогдоно уу." + correlation id. |
| `NO_SELLER_PROFILE` (HTTP 404 with code) | "Худалдагчийн профайл олдсонгүй." |
| `SELLER_SUSPENDED` (HTTP 403) | "Худалдагчийн профайл түр түдгэлзүүлэгдсэн." |
| `DASHBOARD_NOT_READY` (HTTP 503) | "Самбар бэлдэгдэж байна." (auto-retry via react-query). |
| Server error | Generic Mongolian message + correlation id displayed for support tracing. |

---

## G. Guardrail results

Run from repo root after the changes:

```bash
PR103_FILES="src/api/sellerDashboard.ts src/hooks/useSellerDashboard.ts src/features/sellerNetwork/SellerNetworkSection.tsx app/(seller)/dashboard.tsx app/(seller)/earnings.tsx app/(seller)/profile.tsx"

# 1. withdraw / payout in PR103 files
grep -niE "withdraw|payout" $PR103_FILES
#   Matches: 6 lines — all comment blocks explicitly listing the
#   pattern as forbidden, plus the read-only `paidOutMnt` field name
#   (always 0; not an action).

# 2. wallet/withdraw / api/wallet
grep -niE "wallet/withdraw|api/wallet|/wallet/" $PR103_FILES
#   no matches.

# 3. direct Negd URL / negd-superapp
grep -niE "negd-superapp|negd\.app|negd-app|negd\.vercel" $PR103_FILES
#   no matches.

# 4. ESELLER_S2S_INTEGRATION_KEY in mobile
grep -nE "ESELLER_S2S_INTEGRATION_KEY" $PR103_FILES
#   no matches — S2S key never appears in the mobile repo.

# 5. useMutation in API/hook/feature files
grep -nE "useMutation" src/api/sellerDashboard.ts src/hooks/useSellerDashboard.ts \
                       src/features/sellerNetwork/SellerNetworkSection.tsx
#   2 matches — both comment lines explicitly stating "no useMutation".

# 6. AsyncStorage in NEW PR103 files
grep -nE "AsyncStorage" src/api/sellerDashboard.ts src/hooks/useSellerDashboard.ts \
                        src/features/sellerNetwork/SellerNetworkSection.tsx
#   no matches.
```

All six guardrails pass. Matches in (1) and (5) are documentation-only
comments asserting these patterns are forbidden; the `paidOutMnt`
field is a read-only number (always 0), not an actionable button.

The unscoped grep over the entire repo would surface the existing
`(customer)/wallet.tsx` payout flow — that file is intentionally NOT
modified by PR103 and is out of scope for the seller flow.

---

## H. Validation

### H.1 Available scripts

`package.json` has only `start`, `android`, `ios`, `web` (no
`typecheck` / `lint` / `build` / `test` scripts). Validation was
performed via direct invocations.

### H.2 Type-check

```bash
npx tsc --noEmit
```

Result: clean (no output = no errors). One iteration was needed to
fix a `StatusBadge` prop name (`state` → `status`); after fix,
type-check is green.

### H.3 Build / Expo

`npm run build` and `expo export` were not run in this PR — the project
does not include a build step in CI. The Expo dev workflow (`expo
start`) will pick up the changes on next launch.

### H.4 Tests

The mobile repo has no test runner (no `jest.config.*`, no `*.test.ts`).
Adding test infrastructure is out of scope for PR103.

---

## I. Deferred items

| Item | Reason | Future PR |
|------|--------|-----------|
| Payout / withdraw UI | Forbidden by PR103 invariant. Requires the future "guarded payout" PR (post-ledger design + admin review) on Negd. | Future. |
| Seller-network notifications | Deferred at BFF level (PR98 returns `{ deferred: true }`); needs seller-scope notification design. | Future. |
| Invite-link creation | No mutation in PR103. Mobile would need a Sarana mutation route + Negd write surface. | Future. |
| Referral-code rotation | Same. Requires admin-side endpoint design. | Future. |
| Lead conversion / mutation | Same. Read-only here. | Future. |
| Admin review | Out of scope (admin surface lives elsewhere). | Future. |
| Push notifications for seller events | No FCM / APNs hook added. | Future. |
| Stronger BFF S2S signature (HMAC) | PR101 deferred this; mobile is unaffected. | Future hardening PR. |

---

## J. PR104 inputs

PR104 should be **Seller Dashboard End-to-End Smoke Test and Launch
Pack** — a cross-repo verification effort, not a code PR.

Inputs from PR103:

- Negd PR101 endpoint deployed at production.
- Sarana PR102 endpoint deployed at production with
  `NEGD_INTERNAL_BASE_URL` and `ESELLER_S2S_INTEGRATION_KEY` env vars
  set.
- Mobile PR103 build installed (TestFlight / EAS internal distribution).
- A test user exists with:
  - eSeller user identity (existing flow).
  - Negd `User` + `ResellerProfile(status = ACTIVE)`.
  - `IdentityLink(provider = ESELLER_MOBILE, externalUserId = <test
    user id>, linkStatus = VERIFIED)` row.
- Verification steps include:
  1. Login on mobile with the test user; reach `(seller)/dashboard`.
  2. Confirm new section renders all six cards.
  3. Confirm `payableMnt` bucket is rendered DISABLED.
  4. Confirm NO withdraw / payout button appears anywhere.
  5. Confirm offline mode hides payable bucket.
  6. Confirm `correlationId` propagates: any error is shown with
     correlation id; Negd `AdminLog` (when wired) shows the matching
     S2S request id.
  7. Network proxy inspection confirms ZERO requests to
     `eseller.mn/api/wallet*` from the seller flow.
  8. Network proxy confirms only GET requests on the seller flow.

---

## K. Findings

| ID | Severity | Title | Detail |
|----|----------|-------|--------|
| `PR103-F001` | INFO | Mobile read-only seller dashboard integrated | 3 new files (`src/api/sellerDashboard.ts`, `src/hooks/useSellerDashboard.ts`, `src/features/sellerNetwork/SellerNetworkSection.tsx`); 3 existing screens extended (`(seller)/dashboard.tsx`, `earnings.tsx`, `profile.tsx`). All read-only; no mutations. |
| `PR103-F002` | HIGH | Mobile does not call Negd directly | Verified by grep — zero references to `negd-superapp` / `negd.app` / `negd.vercel` in PR103 files. All BFF calls go through `eseller.mn/api/seller/*` via the existing shared axios client. |
| `PR103-F003` | HIGH | No payout / withdraw UI in seller flow | Verified by grep + code review. Every match for `withdraw|payout` is inside a comment block explicitly stating the pattern is forbidden, or in the read-only `paidOutMnt` field name. The `payableMnt` bucket is rendered as a DISABLED `View` (no `TouchableOpacity`) with dashed border + "Одоогоор боломжгүй" label. |
| `PR103-F004` | HIGH | No S2S key in mobile | Verified by grep — `ESELLER_S2S_INTEGRATION_KEY` has zero matches in PR103 files (and indeed zero matches in the entire mobile repo). The S2S key lives only in Sarana infrastructure per PR102. |
| `PR103-F005` | MEDIUM | Notifications, payout, lead/referral mutations deferred | These features are deferred per the PR103 spec. The composed dashboard renders nothing for `notificationsSummary.deferred = true`. Future PRs will add notifications first (after seller-scope design), payout last (after guarded-payout design). |

---

## L. Mongolian operator summary

PR103 — **Mobile read-only seller dashboard integration** (eseller-mobile).

**Юу хийсэн:**

- `src/api/sellerDashboard.ts` — Sarana BFF /api/seller/* зүгт хандах
  TypeScript-тэй API client (зөвхөн GET, mutation байхгүй).
- `src/hooks/useSellerDashboard.ts` — react-query hook-ууд:
  `useSellerMe`, `useSellerDashboard`, `useSellerWalletSummary`,
  `useSellerReferralSummary`, `useSellerLeadSummary`,
  `useSellerCommissionSummary`. Wallet/commission staleTime 30
  секунд, бусад нь 60 секунд. **`useMutation` огт байхгүй.**
- `src/features/sellerNetwork/SellerNetworkSection.tsx` — read-only
  dashboard cards (профайлын төлөв, орлогын тооцоо, шимтгэл dry-run,
  урих код / линк, lead).
- `app/(seller)/dashboard.tsx` — өмнөх affiliate flow дээр шинэ
  section нэмэв. Хуучин хэсгийг өөрчлөөгүй.
- `app/(seller)/earnings.tsx` — шинэ "Худалдагчийн сүлжээ — шимтгэл
  (dry-run)" section нэмэв. Хуучин `/affiliate/commissions`
  жагсаалтыг өөрчлөөгүй.
- `app/(seller)/profile.tsx` — "Худалдагчийн сүлжээний статус" card
  нэмэв (`/api/seller/me`-аас).

**Чухал зарчим:**

- Mobile **Sarana BFF**-г л дуудна (`eseller.mn/api/seller/*`).
  Negd рүү шууд дуудлага хийхгүй.
- `ESELLER_S2S_INTEGRATION_KEY` mobile-д огт байхгүй.
- **Гаргах / татах товч огт байхгүй.** `payableMnt` нь disabled
  bucket байдлаар "Одоогоор боломжгүй" гэсэн шошготой харагдана.
- Wallet / commission-г mobile талаас тооцохгүй — серверийн утгыг
  шууд харуулна.
- Lead summary-д хэрэглэгчийн утас / имэйл / нэр / тэмдэглэлийг
  огт харуулахгүй (BFF response-д ч байхгүй).
- Stale / offline / алдааны байдлыг тодорхой харуулна
  (correlationId-той).
- `(customer)/wallet.tsx` буюу buyer-ын payout flow-д өөрчлөлт
  ороогүй.

**Дараагийн алхам:** **PR104** — Cross-repo end-to-end smoke test +
operator launch checklist. Negd / Sarana / mobile бүгд deploy болсны
дараа бодит test seller-р дамжуулан бүх 6 endpoint-ийг шалгана.
