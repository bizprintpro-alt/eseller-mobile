# PRODUCT REQUIREMENTS DOCUMENT

## "Malchnaas Shuud" — Direct-from-Herder Marketplace

| Field | Value |
|-------|-------|
| Feature name | Malchnaas Shuud — Direct-from-Herder Marketplace |
| Platform | eseller.mn (web) + eseller-mobile (Android / iOS) |
| Document type | Product Requirements Document (PRD) |
| Version | v1.0 — Initial Draft |
| Scope | Full system — listing, order, payment, delivery, review |

> English translation of [PRD_Malchnaas_Shuud.md](PRD_Malchnaas_Shuud.md). Source document is the authoritative version. For investor / external-partner briefings only.

---

## 1. Executive Summary

"Malchnaas Shuud" is a direct-from-herder marketplace built on the eseller.mn platform. It connects rural Mongolian herders with urban consumers directly, without middlemen, enabling the sale of natural products (meat, wool, leather, dairy) at fair prices.

**Goal**: Create a digital ecosystem for Mongolia's traditional livestock products that bypasses intermediary supply chains.

---

## 2. Problem Statement

Mongolian livestock products (meat, wool, leather, dairy) move through a 4–5 tier traditional supply chain:

> **Herder → Aggregator → Wholesaler → Consolidator → Retailer → Consumer**

This creates several problems:

- **Herders receive only 25–30% of the final price**; most margin is captured by intermediaries.
- **Consumers pay 2–3× the fair price** and cannot verify origin.
- **Quality degrades** as goods pass through many hands.
- **"Direct-from-herder" claims are often fraudulent** — no verification.
- **Herders have no direct digital sales channel.**

---

## 3. Goals & Success Metrics

### 3.1 Business goals

- Increase herder income by **40–60%** (bypassing intermediaries).
- Reduce consumer price by **15–25%**.
- Establish a **unique value proposition** for eseller.mn.
- Contribute to Mongolia's rural digital economy.

### 3.2 Success metrics (KPIs)

| KPI | 3-month target | 12-month target |
|-----|---------------:|----------------:|
| Registered herders | 500+ | 5,000+ |
| Monthly active users (MAU) | 10,000+ | 100,000+ |
| Monthly orders | 1,000+ | 20,000+ |
| Average order value (AOV) | 80,000 ₮ | 120,000 ₮ |
| Delivery success rate | ≥ 85% | ≥ 95% |
| Customer satisfaction (CSAT) | ≥ 4.2 / 5 | ≥ 4.5 / 5 |
| Return / complaint rate | < 8% | < 3% |

---

## 4. User Personas

| | Herder (seller) | Buyer | Local coordinator |
|---|---|---|---|
| **Age** | 25–55 | 25–45 | 30–50 |
| **Location** | Rural sum / bag | Ulaanbaatar, major cities | Sum center |
| **Tech** | Android phone, 4G | Mobile-app native | — |
| **Need** | Access to market, fair pricing | Organic, quality products | Supplementary income |
| **Challenge** | Limited digital literacy | Trust, quality assurance | Training, commission scheme |

---

## 5. User Stories

| ID | Actor | User story |
|----|-------|------------|
| US-01 | Herder | As a herder, I want to register on the platform with my national ID and livestock count so I can be verified. |
| US-02 | Herder | As a herder, I want to list my products (meat, wool, leather, dairy) with photos, descriptions, prices, size and availability. |
| US-03 | Herder | As a herder, I want to view incoming orders, accept or reject them, and update their status. |
| US-04 | Herder | As a herder, I want to see my income, commission breakdown and payment history. |
| US-05 | Buyer | As a buyer, I want to filter by aimag (province) and see which herder the goods come from and when delivery arrives. |
| US-06 | Buyer | As a buyer, I want to view herder profiles (photo, rating, experience) to choose a trusted seller. |
| US-07 | Buyer | As a buyer, I want my payment held in escrow until delivery is confirmed, then released to the herder. |
| US-08 | Buyer | As a buyer, I want to track my order status in real time (received → preparing → shipped → delivered). |
| US-09 | Buyer | As a buyer, I want to rate products and herders after delivery. |
| US-10 | Coordinator | As a coordinator, I want to help herders in my sum register and create listings, and earn a commission. |
| US-11 | Admin | As an admin, I want to verify herders, handle product-quality complaints and resolve order disputes. |

---

## 6. Functional Requirements

### 6.1 Herder registration & verification

- Phone-OTP verification
- ID card verification (national-ID number + photo)
- Livestock registry ("А данс" — livestock account + registration number with the Livestock Agency)
- GPS geotagging + delivery-accessible address
- Bank account linking (Khan Bank, Golomt, TDB APIs)
- Bag-governor (village head) certification upload, via letter or QR code
- Admin review within **24–48 hours**

### 6.2 Product listing

- **Categories**: Meat (beef, mutton, goat, horse, camel), Wool, Leather, Dairy, Fermented dairy
- **Images**: minimum 1, maximum 8 (of product, animal, farm)
- **Description**: age, weight, breed, preparation method, distinctive features
- **Price**: per kg, per piece, per litre
- **Stock** / minimum order size
- Cold-chain required flag (for meat / dairy)
- Preparation and dispatch lead time
- Veterinary certificate upload (required for meat and dairy)

### 6.3 Discovery

- Filter by aimag (matches existing UI)
- Advanced filter by sum
- Filter by category (meat / wool / leather / dairy)
- Price range filter
- Sort by fastest delivery
- Sort by highest-rated herder
- Filter by tags (organic, certified)
- Map view

### 6.4 Order & payment

- Add-to-cart, multi-herder orders in one checkout
- Payment methods: QPay, SocialPay, Khan Bank, Golomt, TDB, card
- **Escrow**: funds held by the platform until delivery is confirmed, then released
- Notification to herder on order confirmation
- Auto-cancellation if herder does not respond within 24 hours → refund

### 6.5 Delivery & logistics

- Options: Mongol Shuudan (national post), private carriers (Nomin, Toson, Ochir-Undraa), public transport
- **Consolidation**: goods aggregated at aimag center, dispatched to Ulaanbaatar twice weekly
- Auto tracking-number generation, real-time tracking
- Status pipeline: received → packed → dispatched → at aimag center → in UB → delivered
- Cold-chain logistics for perishable goods
- Failure-liability policy (herder vs platform vs buyer)

### 6.6 Reviews & ratings

- Product rating (1–5 stars) + written review + photo upload
- Separate herder rating (communication, punctuality, quality)
- Return request + dispute-resolution flow
- Reviews only allowed on delivered orders (anti-fake-review)
- Herder public stats: overall rating, delivery success rate, order count

### 6.7 Herder dashboard

- Order list with status filter
- Income report (daily, weekly, monthly)
- Commission + platform-fee breakdown
- Payout request to bank account, T+3 business days
- Listing analytics: views, add-to-carts, purchases

### 6.8 Local coordinator

- 1–2 coordinators per sum
- Role: assist new herders with registration, photography, listing creation
- Separate admin dashboard + referral code
- Commission: **2–3% of onboarded herder's sales**

---

## 7. Non-Functional Requirements

| Property | Target |
|----------|--------|
| Performance | LCP < 2.5 s, API response < 500 ms |
| Offline capability | Herders on 2G/3G can create listings and sync later |
| Localization | Mongolian + English (later Russian, Chinese) |
| Accessibility | WCAG 2.1 AA; usable by older herders |
| Security | OWASP Top 10, PCI DSS (payments), Mongolia Personal Data Law |
| Scalability | 10,000 concurrent users at launch, scale to 100,000 |
| Uptime SLA | 99.5% |

---

## 8. Phased Rollout

### Phase 1 — MVP (6–8 weeks)

- Basic registration + KYC
- Listing creation + browse
- Order + QPay / SocialPay payment
- Mongol-Shuudan delivery
- Basic review system
- **Pilot in 3 aimags: Arkhangai, Töv, Selenge**

### Phase 2 — Scale-up (3–4 months)

- Nationwide coverage (all 21 aimags)
- Escrow + dispute-resolution flow
- Coordinator system
- Multi-carrier integration
- Advanced search + map view
- Analytics dashboard

### Phase 3 — Premium features (6–12 months)

- Subscription model (monthly delivery of dairy, yoghurt)
- Cold-chain integration
- Bulk B2B orders (restaurants, hotels)
- B2B portal
- International export (China, Korea for wool + leather)

---

## 9. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Food-safety incidents | MoU with General Agency for Specialized Inspection (МХЕГ); mandatory vet certs |
| Logistics failures | SLA contracts with carriers; insurance |
| Herder tech literacy | Coordinator system; video guides; call centre |
| Payment disputes | Escrow; clear policy; arbitration |
| Fake listings | Strict KYC; admin moderation; buyer complaint channel |
| Seasonal variance (winter / zud) | Cold-storage strategy; contingency plan |

---

## 10. Business Model

Revenue streams:

- **Commission**: 8–12% per sale (comparable to Amazon, Shopee)
- **Promoted listings**: paid visibility boost
- **Premium features**: advanced analytics, professional photography service
- **Logistics margin**: volume rebate from carriers
- **Subscription box**: 15% margin on monthly-delivery orders

---

*End of PRD*
