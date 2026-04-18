# Dropshipping Fix — Technical Prompt (for backend team)

> Self-contained prompt. Designed to be pasted into Claude Code running in the **eseller.mn backend repo** (not this mobile repo).
> Source: [01_Feedback_Report.md](01_Feedback_Report.md) + [02_Technical_Spec.md](02_Technical_Spec.md).
> Priority: **P0 — production-blocker**. Must land before Malchnaas launch (which depends on the same product pipeline).

---

## Context

`eseller.mn` has a dropshipping shop type (called `PREORDER` / "Захиалгын дэлгүүр"). A feedback report from an active seller flagged multiple P0 bugs on the main feed and product detail page:

### P0 — Critical

1. **Prices display as 24₮, 1₮** — obvious currency conversion failure. Supplier prices in USD/CNY are being stored or rendered without proper MNT conversion. Example product: "Phone Travel Self Tripod Aluminum Tall 55" 140CM" shows **24₮**. Another: "RP01-B Heavy Duty" shows **1₮**. Real-world equivalent should be ~70,000–150,000 MNT.
2. **Product images do not render** — product detail page shows a blank white area where images should be. Feed cards also miss images for some products. Possibly broken CDN mapping or unescaped URL.

### P1 — High

3. **Product title truncation** — feed cards show "Phone Travel Self Tr..." with ellipsis. No way to see full title without opening detail.
4. **Product detail is empty** — description, specifications, seller info, reviews, shipping details, return policy, warranty, variants, stock all missing.
5. **Spam content unfiltered** — a product titled just "Hhh" with no image appears in the feed. No moderation rule filtered it.

### Platform stack (known)

- Backend: Node.js (likely NestJS or Express — detect on analysis).
- DB: PostgreSQL or MongoDB — detect.
- Hosting: probably Vercel (web) + Railway (API).
- Image CDN: likely Cloudinary.

### Mobile client behavior

See [CODEBASE_MAP.md §3](CODEBASE_MAP.md). Mobile treats prices as integer MNT. Mobile renders `product.images[0]` directly via `<Image source={{ uri }} />`. Mobile expects `price` already MNT. **So the bug is backend-side** — either the sync pipeline or the API response mapping.

---

## Your Task

Work in **3 phases**. Do NOT jump ahead. Commit after each phase, on a branch `fix/dropshipping-p0`.

### Phase 0 — Map the pipeline (no code changes)

Produce `docs/DROPSHIPPING_AUDIT.md` answering:

1. What is the shop-type enum in the DB? Which value represents the dropshipping type?
2. Where does supplier data enter the system? (CRON? webhook? manual import? What's the supplier — AliExpress / CJ / DHGate / custom?)
3. What table/collection stores products? Show the schema for fields: `price`, `currency`, `original_currency`, `supplier_cost`, `images`, `title`, `description`.
4. Where is currency conversion done? (If anywhere.)
5. Where are product images transformed/uploaded? Is there a Cloudinary/CDN layer, or are raw supplier URLs stored?
6. What validates a product before it goes public? Is there a moderation hook?
7. Produce a sequence diagram (Mermaid) of one product's lifecycle: supplier → DB → API → client.

**Stop. Wait for review.** Do not write fixes until the audit is approved.

### Phase 1 — Fix P0 (price + images)

Implement in this order:

#### 1a. Price conversion

Target formula (from `02_Technical_Spec.md §5`):

```
final_price_MNT = round(
  supplier_cost × exchange_rate × (1 + margin_percent / 100)
  + shipping_cost_MNT
)
```

Deliverables:

- **Exchange rate service**: fetches from Mongolbank (https://www.mongolbank.mn/exchange.aspx) or OpenExchangeRates as fallback. Cache in Redis for 6h. Fail loud if stale >24h.
- **Migration**: add columns if missing — `supplier_cost DECIMAL(10,4)`, `supplier_currency VARCHAR(3)` (ISO 4217), `margin_percent DECIMAL(5,2) DEFAULT 25.0`, `shipping_cost_mnt INT DEFAULT 0`.
- **Backfill script**: for every existing dropshipping product with `price < 1000`, flag it as `needs_reprice=true` and recompute from `supplier_cost`. If `supplier_cost` missing, leave quarantined (hide from public feed).
- **Sync job fix**: whenever supplier data is pulled, always run the formula. Write unit tests covering: USD→MNT, CNY→MNT, missing rate (should error, not default to 1.0), margin=0, shipping=0.
- **API response**: return integer MNT only. Never expose supplier_cost/supplier_currency to buyer endpoints.

#### 1b. Images

- **Audit missing images**: SQL query for products where `jsonb_array_length(images) = 0 OR images IS NULL`. Count by shop.
- **Root cause**: check if sync job is silently skipping Cloudinary upload on error. Look for try/catch swallowing errors.
- **Fix**: if Cloudinary upload fails, retry 3× with exponential backoff. If still fails, don't insert the product (don't publish an imageless product). Log to error-tracking.
- **Backfill**: for existing imageless products, re-fetch from supplier URL and upload. If source is also dead, mark `status='archived'`.
- **Placeholder**: even after fix, the mobile [app/(customer)/herder.tsx:178-180](../app/(customer)/herder.tsx) and product card already handle missing image gracefully. No mobile change needed; just ensure API doesn't return products with `images: []` to public endpoints.

### Phase 2 — Fix P1 (content quality + detail completeness)

#### 2a. Content moderation

From `02_Technical_Spec.md §6`, quality score rules. Implement as a pre-publish hook:

```ts
function qualityScore(p: Product): number {
  let score = 1.0;
  if (!p.title || p.title.length < 10) score -= 0.4;
  if (!p.images || p.images.length === 0) score -= 0.5;
  if (!p.description || p.description.length < 50) score -= 0.2;
  if (!p.price || p.price < 1000 || p.price > 100_000_000) score -= 0.3;
  if (!/[а-яА-ЯёЁa-zA-Z]{3,}/.test(p.title || '')) score -= 0.5; // gibberish check
  return Math.max(0, score);
}
```

Products with `score < 0.7` → `status='pending_review'`. Never show on public feed.

Add a cron to re-score daily in case rules tighten.

#### 2b. Product detail completeness

Required fields on every dropshipping product (per `02_Technical_Spec.md §2`):

- `title`, `images` (≥1), `description`, `price`, `category`, `stock_quantity`, `shipping_from` (country), `shipping_cost`, `shipping_days_min/max`, `return_policy`, `supplier_id`.

Schema migration: add any missing columns. Nullable for legacy but required on new insert.

API `/products/:id` response: include all fields. Mobile will progressively adopt. Do not break existing mobile clients — add fields, don't remove.

#### 2c. Title truncation

That's a **frontend** fix, not backend. Ignore on backend. Flag for mobile and web repos:

- Mobile fix: `numberOfLines={2}` in product card title. Currently `numberOfLines={1}` or unset.
- Web fix: CSS `-webkit-line-clamp: 2`.

### Phase 3 — Verify + close

1. Run `SELECT COUNT(*) FROM products WHERE shop_type='PREORDER' AND price < 1000` — must be 0.
2. Run `SELECT COUNT(*) FROM products WHERE shop_type='PREORDER' AND (images IS NULL OR jsonb_array_length(images) = 0)` — must be 0 for `status='active'`.
3. Run quality-score cron once; confirm suspicious items moved to `pending_review`.
4. Hit `GET /api/products?shop_type=PREORDER&limit=20`. Manually verify: every product has image, price ≥ 1000, title ≥ 10 chars.
5. Update [01_Feedback_Report.md](01_Feedback_Report.md) with a "Resolved" section listing which bugs were fixed with commit hashes.

---

## Strict rules

- **Do not** touch the Malchnaas herder pipeline. That's a separate project; work on the dropshipping (`PREORDER`) shop type only.
- **Do not** downgrade price precision: store `supplier_cost` as DECIMAL (not FLOAT). Final MNT price is INT.
- **Do not** silently catch errors. If sync fails, raise. Let the CRON log scream.
- **Do not** introduce a new ORM / query layer. Match existing backend conventions.
- **Do not** bypass content moderation with a "just mark it as reviewed" hack. If it needs a human, it needs a human.
- **Do** add integration tests for the sync pipeline. Mock supplier API responses.
- **Do** add a feature flag `DROPSHIPPING_V2_ENABLED` gating the new pipeline. Default OFF until Phase 3 passes.
- **Do** log every quarantine + requalify action to an audit table.

## Deliverables at the end

- Branch `fix/dropshipping-p0` with commits per phase
- `docs/DROPSHIPPING_AUDIT.md` (Phase 0)
- Migrations for price/image/moderation columns
- Unit + integration tests
- Manually-run queries showing zero-state for P0 bugs
- Updated feedback report with resolution
- PR description linking this prompt + the original feedback report

## Out of scope for this ticket

- Translation (English/Chinese/Russian UI) — separate task.
- Reviews & ratings system — separate task.
- Schema.org / GS1 / PCI DSS compliance work — separate task.
- Subscription-box model — later phase.

---

— End of DROPSHIPPING_FIX_PROMPT —
