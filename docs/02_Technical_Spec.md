DROPSHIPPING СИСТЕМИЙН
ТЕХНИКИЙН ТОДОРХОЙЛОЛТ
Олон улсын стандартын дагуу
Энэхүү баримт бичиг нь eseller.mn платформ дээр dropshipping функцийг олон улсын стандартын дагуу хэрэгжүүлэхэд шаардлагатай data model, sync flow, API структур, болон data validation-ийн шаардлагыг нарийвчлан тодорхойлно.
Энэ нь Amazon, AliExpress, Shopee зэрэг олон улсын томоохон e-commerce платформуудын нээлттэй документаци болон Baymard Institute, Schema.org Product spec, GS1 стандартуудын шилдэг туршлагад тулгуурласан.
1. Dropshipping системийн үндсэн архитектур
Dropshipping гэдэг нь борлуулагч өөрөө нөөцгүйгээр, supplier-ийн бараагаа захиалагчид шууд хүргэх бизнесийн загвар юм. Энэхүү загвар нь дараах 3 гол оролцогчдоос бүрдэнэ:
Supplier — Барааг үйлдвэрлэж, хадгалж, хүргэдэг тал (ихэнхдээ Хятад, Турк, АНУ).
Платформ (eseller.mn) — Supplier болон борлуулагчийг холбож, барааны мэдээлэл sync хийж, захиалгыг дамжуулдаг тал.
Борлуулагч (reseller) — Өөрийн дэлгүүр дээр supplier-ийн бараагаа нэмж, маркетинг хийж, захиалга авах тал.
Платформын үүрэг нь supplier-ийн data-г хэрэглэгчид зөв, бүрэн, шинэхэн хэлбэрээр харуулах явдал юм. Энэ нь 3 үндсэн давхаргаас бүрдэнэ:
Data sync layer — Supplier API-аас data татаж, validation, enrichment хийх.
Storage layer — Database, cache, CDN (images).
Presentation layer — Борлуулагчийн дэлгүүр, үндсэн платформ дээр харуулах.
2. Шаардлагатай data fields
Олон улсын стандартын дагуу барааны мэдээлэл доорх бүтэцтэй байх ёстой. Заавал шаардлагатай field-үүдийг улаан “✓” тэмдэгээр, үнэ/хүргэлттэй холбоотой field-үүдийг өнгөөр ялгасан.
Field нэр
Төрөл
Заавал
Тайлбар
product_id
string
✓
Барааны өвөрмөц ID (supplier_id + sku-г хослуулсан)
sku
string
✓
Supplier-ийн SKU код
gtin / barcode
string
—
GTIN, UPC, EAN, ISBN — олон улсын стандарт
title
string
✓
Барааны бүрэн нэр (max 150-200 тэмдэгт)
title_mn
string
—
Монгол хэл рүү орчуулагдсан нэр (auto-translate + хянагч)
description
html/text
✓
Барааны дэлгэрэнгүй тайлбар, HTML формат
images[]
array<url>
✓
Хамгийн багадаа 3 зураг, CDN дээр cache хийх
category
object
✓
Ангилал — шаталсан (parent/child), ID-той
brand
string
—
Брэнд нэр (байгаа бол)
price
decimal
✓
Эцсийн борлуулах үнэ (MNT)
original_price
decimal
—
Хямдралын өмнөх үнэ (strikethrough-р харуулах)
supplier_cost
decimal
✓
Supplier-ийн үнэ (USD/CNY) — зөвхөн админд
supplier_currency
string
✓
USD, CNY, EUR гэх мэт ISO 4217 код
margin_percent
decimal
✓
Борлуулагчийн нэмэх margin (%)
stock_quantity
integer
✓
Нөөцийн тоо — real-time sync хийх
is_available
boolean
✓
Одоо авах боломжтой эсэх
variants[]
array
—
Өнгө, хэмжээний варьянт — тус бүр өөрийн SKU, зураг, үнэ, нөөцтэй
shipping_from
string
✓
Илгээгдэх улс/хот (ISO country code)
shipping_cost
decimal
✓
Хүргэлтийн үнэ (MNT)
shipping_days_min/max
integer
✓
Хүргэлтийн дундаж хугацаа (өдрөөр)
weight_g
integer
—
Барааны жин (г) — хүргэлтийн тооцоо хийхэд
dimensions
object
—
Хэмжээ (урт, өргөн, өндөр, см)
return_policy
object
✓
Буцаах хугацаа, нөхцөл, хэн хариуцах
warranty_months
integer
—
Баталгаат хугацаа (сараар)
supplier_id
string
✓
Supplier-ийн ID
supplier_rating
decimal
—
Supplier-ийн үнэлгээ (0-5)
2.1. JSON schema жишээ
Доорх нь нэг product-ийн бүрэн JSON structure:
{
  "product_id": "SUP001-ABC123",
  "sku": "TRIPOD-55-ALU",
  "gtin": "6901234567890",
  "title": "Phone Travel Self Tripod Aluminum 55\" 140CM",
  "title_mn": "Гар утасны трипод 55 дюйм 140см",
  "description": "<p>Хөнгөн хөнгөн цагаан...</p>",
  "images": [
    "https://cdn.eseller.mn/products/.../img1.webp",
    "https://cdn.eseller.mn/products/.../img2.webp"
  ],
  "category": { "id": 142, "path": "Electronics > Photo > Tripods" },
  "brand": "ETYOOCE",
  "price": 89000,
  "original_price": 120000,
  "supplier_cost": 12.50,
  "supplier_currency": "USD",
  "margin_percent": 35,
  "stock_quantity": 45,
  "is_available": true,
  "variants": [
    { "sku": "TRIPOD-55-ALU-BLACK", "color": "Black", "stock": 20 },
    { "sku": "TRIPOD-55-ALU-SILVER", "color": "Silver", "stock": 25 }
  ],
  "shipping_from": "CN",
  "shipping_cost": 15000,
  "shipping_days_min": 10,
  "shipping_days_max": 20,
  "weight_g": 850,
  "dimensions": { "length_cm": 55, "width_cm": 8, "height_cm": 8 },
  "return_policy": { "days": 14, "who_pays": "buyer" },
  "warranty_months": 12,
  "supplier_id": "SUP001",
  "supplier_rating": 4.7,
  "last_synced_at": "2026-04-17T10:30:00Z"
}
3. Data sync flow (9 үе шат)
Supplier-аас ирж буй data-г eseller.mn платформ дээр бүрэн, зөв харуулахын тулд дараах 9 үе шатны pipeline ажиллах ёстой:
№
Үе шат
Үйлдэл
Validation
1
Fetch from supplier
Supplier API-аас барааны raw data татах
API response 200, schema valid
2
Data validation
Шаардлагатай бүх field байгаа эсэхийг шалгах
price > 0, images.length >= 1, title.length >= 10
3
Currency conversion
USD/CNY үнийг MNT руу хөрвүүлэх, margin нэмэх
Ханш cache < 1 цаг, margin >= 10%
4
Translation
Барааны нэр, тайлбарыг Монгол хэл рүү орчуулах
Auto-translate + хүний хянагч
5
Image processing
Зургуудыг CDN дээр байршуулах, resize хийх
Бүх зураг accessible, webp format
6
Content moderation
Spam, хориотой бараа, утгагүй нэрийг шүүх
Quality score >= 0.7
7
Database insert
Шалгагдсан барааг main DB-д хадгалах
ACID транзакшн, duplicate шалгах
8
Search index update
Elasticsearch/Algolia-д шинэчлэх
Индекс sync хугацаа < 1 минут
9
Scheduled re-sync
Үнэ, нөөцийг тогтмол хугацаанд шинэчлэх
Өдөрт 4-6 удаа stock, price sync
4. Sync хугацаа болон давтамж
Barааны төрлөөс хамаарч sync-ийн давтамж өөр байх ёстой:
Үнэ (price) — 4-6 цаг тутамд. Валютын ханш өөрчлөгдвөл тухай бүр.
Нөөц (stock) — 30 минут - 1 цаг тутамд. Захиалга орох үед real-time шалгах.
Description, images — 24 цаг тутамд.
Категори, brand, supplier info — 7 хоног тутамд.
Энэ нь CRON job эсвэл event-driven queue system (RabbitMQ, AWS SQS) ашиглан хийгдэх ёстой. Webhook дэмждэг supplier-ууд (AliExpress Open Platform, CJ Dropshipping) нь push notification-аар өөрчлөлтийг шууд мэдээлдэг.
5. Үнийн тооцоолол ба валют хөрвүүлэлт
Одоогийн eseller.mn дээр 24₮ гэх мэт буруу үнэ харагдаж байгаа нь валют хөрвүүлэлтийн алдаа юм. Зөв формула дараах байдалтай:
final_price_MNT = round(supplier_cost × exchange_rate × (1 + margin_percent/100) + shipping_cost)
Жишээ нь:
Supplier cost: 12.50 USD
Exchange rate: 1 USD = 3,450 MNT
Margin: 35%
Shipping: 15,000 MNT
final_price = (12.50 × 3450 × 1.35) + 15000 = 58,218 + 15,000 ≈ 73,000 MNT
Валютын ханшийг доорх эх үүсвэрээс авч болно:
Монголбанк (https://www.mongolbank.mn) — албан ёсны ханш.
OpenExchangeRates, Fixer.io — олон улсын live rate.
Арилжааны банкны API (Хаан банк, Голомт банк).
Ханшийг өдөрт 3-4 удаа шинэчилж, cache-д хадгалах (Redis) хэрэгтэй.
6. Контентийн чанарын хяналт
“Hhh” гэх мэт утгагүй бараа платформ дээр гарч ирэхгүй байхын тулд дараах quality score-ийн systems байх ёстой:
Title check — Нэр 10-аас дээш тэмдэгт, танигдахуйц үг агуулсан эсэх.
Image check — Хамгийн багадаа 1, дээд тал нь 10 зураг, тус бүр 500x500 пиксельээс дээш.
Description check — Тайлбар 50 тэмдэгтээс урт байх.
Price sanity check — 100₮-өөс доош эсвэл market average-ийн 10 дахин үнэ байвал автоматаар flag хийх.
Duplicate detection — Supplier ID + SKU давхцвал шинээр оруулахгүй, шинэчлэх.
Prohibited items — Зэвсэг, хар тамхи, хуулиар хориглогдсон зүйлсийн keyword-ийн жагсаалттай таарах эсэхийг шалгах.
Quality score < 0.7 бараануудыг админы хянагчид илгээх. Автомат шалгалтад унасан бараа production-д гарахгүй.
7. API endpoints (борлуулагчдад зориулсан)
Борлуулагчид өөрийн сайтдаа барааг нэмэхийн тулд доорх REST API endpoints ашиглана:
GET    /api/v1/dropshipping/products              # Барааны жагсаалт
GET    /api/v1/dropshipping/products/{id}         # Барааны дэлгэрэнгүй
POST   /api/v1/dropshipping/products/{id}/import  # Өөрийн дэлгүүрт нэмэх
GET    /api/v1/dropshipping/imported              # Нэмсэн бараануудын жагсаалт
PATCH  /api/v1/dropshipping/imported/{id}         # Үнэ/тайлбар өөрчлөх
DELETE /api/v1/dropshipping/imported/{id}         # Устгах
POST   /api/v1/dropshipping/orders                # Захиалга илгээх
GET    /api/v1/dropshipping/orders/{id}/status    # Захиалгын статус
Authentication: OAuth 2.0 эсвэл API key + secret. Rate limit: 1000 req/hour.
Response-ийг заавал стандарт формат руу оруулах (JSON:API spec). Error handling нь HTTP status code + error object-той.
8. Мөрдөх ёстой олон улсын стандартууд
Product data стандартууд
Schema.org Product — https://schema.org/Product. Google, Bing search-д зөв индексжихэд шаардлагатай.
GS1 (GTIN, UPC, EAN, ISBN) — Олон улсын bar code стандарт.
OpenGraph + Twitter Cards — Нийгмийн сүлжээнд share хийхэд preview зөв харагдах.
Аюулгүй байдлын стандартууд
PCI DSS — Төлбөрийн картын мэдээлэл хадгалахад заавал мөрдөх.
ISO 27001 — Мэдээллийн аюулгүй байдлын удирдлагын систем.
GDPR (EU) / PDPA — Хэрэглэгчийн хувийн мэдээлэл хамгаалах.
Монгол Улсын “Хувь хүний мэдээлэл хамгаалах тухай” хууль (2021).
API & integration стандартууд
OpenAPI 3.0 (Swagger) — API документаци.
REST / GraphQL — API архитектур.
OAuth 2.0 + JWT — Authentication.
JSON:API spec — Response format.
Webhook standard — Push notification.
UX стандартууд
Baymard Institute — Дэлхийн хамгийн нэр хүндтэй e-commerce UX судалгаа. Product page-д 20+ заавал элемент байх ёстой гэж тогтоосон.
WCAG 2.1 AA — Accessibility стандарт (хөгжлийн бэрхшээлтэй хэрэглэгчдэд зориулсан).
Core Web Vitals (Google) — LCP < 2.5s, FID < 100ms, CLS < 0.1.
9. Launch-ийн өмнөх шалгах жагсаалт
Production-ready болохын тулд дараах бүх зүйл ✓ байх ёстой:
Бүх product-д зөв үнэ харагдаж байна (24₮, 1₮ гэх мэт байхгүй).
Бүх product-д хамгийн багадаа 1 зураг харагдаж байна.
Product detail page дээр бүх заавал field бөглөгдсөн.
Хүргэлтийн хугацаа, үнэ тодорхой.
Буцаалтын бодлого харагдаж байна.
Барааны нэр бүрэн харагддаг (taslagdah bolomjgui).
“Hhh” гэх мэт spam бараа автоматаар шүүгдэж байна.
Валют хөрвүүлэлт тогтмол ажиллаж байна.
API документаци бэлэн.
Борлуулагчдад зориулсан import flow тестлэгдсэн.
Захиалга supplier руу автоматаар дамждаг.
Tracking number автоматаар sync хийгдэж байна.
Load test хийгдсэн (10,000+ concurrent users).
Security audit (OWASP Top 10) хийгдсэн.
10. Ашигласан эх үүсвэр
Baymard Institute — Product Page UX Research (baymard.com/research)
Schema.org Product specification (schema.org/Product)
Google Merchant Center product data specification
AliExpress Open Platform API документаци
Shopify Dropshipping best practices
GS1 Mongolia — GTIN, barcode стандарт
ISO 27001:2022 — Information security management
 
— Баримт бичгийн төгсгөл —