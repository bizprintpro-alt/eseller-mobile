CLAUDE CODE TECHNICAL PROMPT
Малчнаас шууд — Integration Guide
Одоо байгаа eseller.mn + eseller-mobile код дээр нэмэх
Web Platform:
https://eseller.mn/ — Монголын нэгдсэн цахим зах
Mobile Repo:
https://github.com/bizprintpro-alt/eseller-mobile
Хамрах хүрээ:
Хоёр суурь codebase дээр нэмэлт feature болгон хэрэгжүүлэх
Feature төрөл:
Shop type — одоо байгаа "Захиалгын дэлгүүр", "Үйлчилгээ" гэх мэт shop type-уудтай зэрэгцэн нэмэгдэх
Integration point:
Одоогийн QPay, SocialPay, Жолооч, Дундын данс, Gold, Комисс систем зэргийг дахин ашиглах
⚠ ЧУХАЛ: ЭНЭ НЬ ТУСДАА ПРОЕКТ БИШ
“Малчнаас шууд” нь тусдаа monorepo, тусдаа backend, тусдаа мобайл апп ХИЙХ ЁСГҮЙ. Энэ нь eseller.mn-ий одоогийн shop type-уудын (Дэлгүүр, Захиалгын дэлгүүр, Үйлчилгээ, гэх мэт) нэг нэмэлт төрөл болно.
Одоо байгаа систем дахь дараах модулиудыг дахин ашиглана:
Authentication (User бүртгэл, Login)
Shop / Store management — shop_type = 'herder' нэмж үүсгэх
Product / Listing CRUD — шинэ product category нэмэх
Cart, Checkout, Order управление
Payment (QPay, SocialPay) — шинэчлэхгүй
Дундын данс (Escrow) систем — аль хэдийн бий
Жолооч / Хүргэлт модуль
Gold гишүүнчлэл, комисс систем
Дашбоард, аналитик
1. eseller.mn платформын одоогийн байдал
https://eseller.mn/ -ийг шалгасны үндсэн дээр платформ дараах архитектуртай:
Multi-vertical marketplace — 7 shop type одоогоор идэвхтэй байна.
“Борлуулагч болох” flow — 5 алхамтай, shop төрлийг эхэнд нь сонгуулдаг.
Дэлгүүр + Зарын булан (feed) — 2 тусдаа sub-platform.
Gold гишүүнчлэл — 200K+ хэмнэлт, үнэгүй хүргэлт.
Өөрийн жолооч систем — тусдаа "Жолооч болох" flow.
Дундын данс (Escrow) — "Мөнгө аюулгүй хамгаалагдана" функц.
Өгөгдлүүд: 10,000+ бараа, 500+ дэлгүүр, 50,000+ хэрэглэгч.
1.1. Shop Type-уудын жагсаалт
№
Одоо байгаа Shop Types
Онцлог
Status
1
Дэлгүүр
Онлайн барааны дэлгүүр
✓ Идэвхтэй
2
Захиалгын дэлгүүр
Гадаадаас захиалж оруулах (dropshipping)
✓ Идэвхтэй
3
Үл хөдлөхийн агент
Орон сууц, газар зуучлал
✓ Идэвхтэй
4
Барилгын компани
Шинэ барилга, орон сууц
✓ Идэвхтэй
5
Авто худалдаа
Шинэ, хуучин автомашин
✓ Идэвхтэй
6
Үйлчилгээ
Салон, засвар, хэвлэл, сургалт
✓ Идэвхтэй
7
Файл / Дижитал бараа
PDF, ZIP, видео, license key
✓ Идэвхтэй
8
Малчнаас шууд
Direct-from-herder байгалийн бүтээгдэхүүн
⚠ Шинээр нэмэх
1.2. Хоёр суурь кодын сан (Two repos)
eseller.mn (web, backend) — магадгүй one repo-д Next.js + Node.js API.
eseller-mobile (mobile) — github.com/bizprintpro-alt/eseller-mobile, Android/iOS.
Backend API-г хоёр талаас хоёулаа ашиглах магадлалтай.
2. Claude Code ашиглах үе шат
Claude Code-ыг 3 үе шаттай ашиглана. Эхний 2 шатыг заавал өнгөрүүлэх ёстой — ингэснээр Claude Code кодын санг ойлгож, зөв газарт нэмэлт оруулах боломжтой болно.
Шат 1: Codebase Discovery (заавал)
Claude Code эхлээд одоогийн кодын санг ойлгох ёстой. Энэ шатанд шинэ код бичихгүй.
▼ PROMPT 1 — Codebase analysis
I need you to analyze this codebase before we write any new code.
 
Context: This is the eseller-mobile repository for eseller.mn,
a Mongolian multi-vertical marketplace platform. We plan to
add a new shop type called "Malchnaas Shuud" (Direct-from-Herder).
 
Please do the following, in order:
 
1. Map out the project structure:
   - What framework is this? (React Native? Flutter? Native?)
   - What is the folder structure?
   - Where do screens live? Where does state management live?
   - How is routing handled?
 
2. Find the shop-type handling logic:
   - Look for existing shop types: store, pre-order shop,
     real estate agent, construction, auto, services, digital.
   - Where are these defined? (enum, config, database model?)
   - How does the "Become Seller" 5-step wizard work?
   - Show me the file paths for each.
 
3. Find the product/listing model:
   - How are products represented in code?
   - What fields exist? (title, price, images, category...)
   - How does the backend API look? (REST? GraphQL?)
   - Are there type definitions? Show them.
 
4. Find the order + payment + escrow flow:
   - Cart → Checkout → Payment → Escrow release — trace it.
   - QPay and SocialPay integration — where?
   - Дундын данс (escrow) — how is it implemented?
 
5. Find the delivery/driver (жолооч) system:
   - How are drivers assigned to orders?
   - Is there a separate driver app?
 
6. Find the commission + payout system:
   - How is the platform commission calculated?
   - How are payouts to sellers scheduled?
 
At the end, produce a single file at docs/CODEBASE_MAP.md
with all findings. Include file paths, key function names,
and a dependency diagram (Mermaid). Do NOT write any new code.
 
If the backend code is NOT in this repo, tell me what you
need access to (API docs, OpenAPI spec, the web repo, etc.).
Шат 2: Integration Plan
Claude Code codebase-ийг судалсны дараа, integration plan гаргуулна.
▼ PROMPT 2 — Integration plan
Now that you have mapped the codebase in docs/CODEBASE_MAP.md,
produce an integration plan for adding "Malchnaas Shuud" as a
new shop type.
 
Read the PRD at docs/PRD_Malchnaas_Shuud.md first.
 
The plan must cover:
 
1. ADDITIONS (new code)
   - List every new file that will be created.
   - For each: path, purpose, approximate line count.
 
2. MODIFICATIONS (existing code changes)
   - List every existing file that needs changes.
   - For each: what changes and why. Minimize these.
   - Examples likely include:
     • Shop type enum — add HERDER value
     • "Become Seller" wizard — add 8th card
     • Product model — add herder-specific fields
     • Shipping calc — add cold-chain handling
 
3. DATABASE MIGRATIONS
   - New tables: herder_profiles, herder_certifications, etc.
   - Altered tables: shops (new type), products (new fields).
   - Write these as proper migrations for the existing ORM.
 
4. API ENDPOINTS
   - Follow the existing API conventions you found in Step 1.
   - Do NOT invent a new API style.
   - List each new endpoint with method, path, auth, payload.
 
5. UI ADDITIONS
   - New screens: Aimag filter, Herder profile, Cert upload, etc.
   - Modified screens: Shop registration wizard.
   - Follow existing component patterns and design system.
 
6. REUSE INVENTORY
   - Cart → REUSE existing
   - Checkout → REUSE existing
   - Escrow (Дундын данс) → REUSE existing
   - Commission → REUSE existing, maybe adjust rate for herders
   - QPay / SocialPay → REUSE existing
   - Жолооч → REUSE for УБ-д хүргэх last-mile step
 
7. RISK AREAS
   - What could break in the existing system?
   - What needs careful testing?
 
8. MILESTONES
   - Break into small PR-sized milestones.
   - Each milestone must be independently deployable.
   - Feature-flag the whole thing behind a "MALCHNAAS_ENABLED" flag.
 
Write this to docs/INTEGRATION_PLAN.md. Stop and wait for my review.
Do NOT start writing code yet.
Шат 3: Milestone-оор хэрэгжүүлэх
Integration plan-ыг батласны дараа, milestone тус бүрээр гүйцэтгэлийн промпт илгээнэ.
▼ PROMPT 3 — Start milestone
Let's start Milestone M{N} from INTEGRATION_PLAN.md.
 
Rules:
  1. Behind feature flag MALCHNAAS_ENABLED (default: false).
  2. Match existing code style exactly — check 3 similar
     files before writing a new one, mirror their patterns.
  3. Do NOT touch any file that isn't on the plan.
  4. Write tests matching the project's existing test setup.
  5. Run the tests and show me output before committing.
  6. Commit message format: match the repo's existing style.
  7. If the plan conflicts with what you see in the code
     now, stop and ask — don't silently deviate.
 
At the end, summarize:
  - Files created
  - Files modified (with reason for each)
  - Tests added and their status
  - What's next
3. CLAUDE.md файл
Codebase-ийн үндсэн репозиторууд бүр дээр CLAUDE.md файл үүсгэх. Ингэснээр Claude Code session тус бүрт context-ыг ойлгож байна.
Энэ файл нь Шат 1-ийн үр дүнгээс суурьлан автоматаар баяжуулагдана. Эхний хувилбар:
▼ CLAUDE.md — бэлэн template
# eseller-mobile — Malchnaas Shuud Integration
 
## Repo Purpose
Mobile app for eseller.mn multi-vertical marketplace.
Serves customers, sellers (7 shop types), drivers.
 
## Current Active Work
Adding "Malchnaas Shuud" as an 8th shop type.
Tracking: see docs/INTEGRATION_PLAN.md.
Feature flag: MALCHNAAS_ENABLED.
 
## Read Before Working
- docs/CODEBASE_MAP.md — structure + key paths
- docs/PRD_Malchnaas_Shuud.md — product requirements
- docs/INTEGRATION_PLAN.md — implementation plan
 
## Strict Rules
- DO NOT create parallel infrastructure — reuse existing.
- DO NOT invent new API conventions — follow what's there.
- DO NOT modify unrelated files.
- All new herder-specific code must be behind MALCHNAAS_ENABLED.
- Monetary values: follow the existing convention (likely integer MNT).
- Match existing commit format, ESLint config, Prettier config.
 
## Domain Concepts
- Shop Type: enum including STORE, PREORDER, REAL_ESTATE,
  CONSTRUCTION, AUTO, SERVICE, DIGITAL, and (new) HERDER.
- Herder (Малчин): verified individual with livestock registration
  (А данс). Lives in hödöö (rural). Sells meat, wool, leather, dairy.
- Aimag: administrative region (21 total). Delivery time depends on it.
- Coordinator: local helper onboarding herders, earns % commission.
- Cold chain: required for meat/dairy; restricts shipping options.
 
## Integration Surface
Reuse, don't rewrite:
  - Auth / User (already exists)
  - Cart / Checkout / Order (already exists)
  - QPay / SocialPay (already integrated)
  - Дундын данс / Escrow (already exists)
  - Жолооч / Driver assignment (already exists)
  - Commission engine (already exists)
  - Dashboard + analytics (already exists)
 
Extend only these:
  - Shop type enum + registration wizard (add 8th card)
  - Product model (add herder-specific fields)
  - Discovery UI (add aimag picker, cert badge, category)
  - Shipping calc (handle cold chain + aimag-based ETA)
 
## Localization
Primary: Mongolian (mn). Add new strings to existing i18n system.
Never hardcode user-visible text.
4. Product-д нэмэх herder-specific fields
Одоогийн product table дээр нэмэх field-үүд. Claude Code нь одоогийн ORM / migration tool-ийг шалгаад, тохирох migration бичнэ.
▼ SQL / Migration concept (реaл болгохыг Claude Code хийнэ)
-- Shop types enum-д шинэ утга нэмэх
ALTER TYPE shop_type ADD VALUE 'HERDER';
 
-- Herder профайлын нэмэлт талбарууд
CREATE TABLE herder_profiles (
  shop_id UUID PRIMARY KEY REFERENCES shops(id),
  livestock_registry VARCHAR(50) NOT NULL, -- А данс
  national_id_verified BOOLEAN DEFAULT false,
  aimag_id VARCHAR(10) NOT NULL,
  sum_id VARCHAR(10) NOT NULL,
  bag_name VARCHAR(100),
  gps_lat DECIMAL(10, 6),
  gps_lng DECIMAL(10, 6),
  livestock_count INT,
  verification_status VARCHAR(20) DEFAULT 'PENDING',
  coordinator_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
 
-- Мал эмнэлгийн гэрчилгээнүүд
CREATE TABLE herder_certifications (
  id UUID PRIMARY KEY,
  herder_id UUID REFERENCES herder_profiles(shop_id),
  cert_type VARCHAR(30), -- VET, ORGANIC, CUSTOMS_READY
  cert_url TEXT,
  issued_at DATE,
  expires_at DATE,
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP
);
 
-- Products-т нэмэх fields
ALTER TABLE products
  ADD COLUMN requires_cold_chain BOOLEAN DEFAULT false,
  ADD COLUMN herder_category VARCHAR(20), -- MEAT/WOOL/LEATHER/DAIRY
  ADD COLUMN unit_type VARCHAR(10), -- KG/PIECE/LITER
  ADD COLUMN livestock_type VARCHAR(20), -- cattle/sheep/goat/...
  ADD COLUMN certificate_id UUID REFERENCES herder_certifications(id);
 
-- Aimag based shipping times
CREATE TABLE aimag_delivery_config (
  aimag_id VARCHAR(10) PRIMARY KEY,
  aimag_name VARCHAR(50),
  min_delivery_days INT,
  max_delivery_days INT,
  cold_chain_available BOOLEAN DEFAULT false
);
5. UI flow — одоогийн дизайнд нийцүүлэх
5.1. “Борлуулагч болох” wizard-д 8-р карт нэмэх
Одоогоор 7 карттай. 8-р карт болгож “Малчин” нэмэх:
Card #8: Малчин
Subtitle: Байгалийн бүтээгдэхүүн шууд зарах
Features:
  • Малын А данс баталгаажуулалт
  • Мал эмнэлгийн гэрчилгээ
  • Аймгийн хүргэлт
  • Координаторын тусламж
5.2. Нүүр хуудасны feature card нэмэх
Одоогийн нүүр хуудсан дахь "Малчны Шинэ бараа" card-ийг идэвхжүүлэх (скриншотоор харагдаж байсан).
Click хийхэд /malchnaas (эсвэл одоогийн naming convention-ийн дагуу) route рүү шилжинэ.
5.3. Малчнаас шууд хуудас (Discovery)
Одоогийн скриншот дээр байгаа UI pattern-ийг хадгалах:
Аймаг сонгох pill buttons (Бүгд + 21 аймаг) — аль хэдийн байгаа.
Ангилал: Мах, Ноос, Арьс, Сүү.
Доор нь Бүтээгдэхүүн grid.
Аймаг бүр дээр хүргэлтийн өдрүүд — аль хэдийн байгаа.
6. Git workflow & PR strategy
Шинэ branch: feature/malchnaas-shuud
Milestone бүрт тусдаа PR: feat(malchnaas): M1 discovery UI, feat(malchnaas): M2 herder KYC гэх мэт.
PR бүр feature flag-тэй — production-д deploy хийгдсэн ч default OFF.
Тест бүрэн pass хийсний дараа main-д merge.
Rollback plan: feature flag OFF болгож, код хэвээр үлдэнэ.
7. Хөгжүүлэлтийн багийн workflow
Claude Code ашиглах үеийн хамтын ажиллагааны загвар:
Developer Claude Code-ийг local-д ажиллуулна (`claude` command).
Эхлээд PROMPT 1 (Codebase analysis) — Claude Code docs/CODEBASE_MAP.md үүсгэнэ.
Team map-ийг review хийнэ, алдаатай газрыг засна.
PROMPT 2 (Integration plan) — Claude Code docs/INTEGRATION_PLAN.md үүсгэнэ.
PM + Tech Lead план-ыг review хийнэ, батална.
PROMPT 3 (Milestone) — Claude Code M1 хэрэгжүүлнэ, PR үүсгэнэ.
Code review → merge → дараагийн milestone.
8. Анхаарах нэмэлт зүйлс
Репозитор private байна — Claude Code-ыг ашиглахдаа developer өөрийн машин дээр clone хийсэн байх ёстой.
Backend код өөр репозит бол Claude Code-т хоёр репозиторыг хамт өгөх, эсвэл API docs/OpenAPI spec-ийг өгөх.
Одоогийн dropshipping (Захиалгын дэлгүүр)-ийн асуудал (зураг, үнэ буруу)-ийг эхлээд шийдэх — Малчнаас шууд тэрэн рүү л нэмэгдэх.
Малчид ихэвчлэн 2G/3G-тэй учир offline-first подход заавал.
Feature flag strategy — дангаараа ажиллуулах боломжтой (LaunchDarkly, PostHog, эсвэл хамгийн энгийн .env flag).
 
— Integration guide-ын төгсгөл —