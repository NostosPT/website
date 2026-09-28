# Nostos — Roadmap

## Phase 1 — Foundation

Define:

- Brand positioning
- Information architecture
- Data model
- Categories
- Photographer roles
- Photo ID format
- Basic legal/privacy requirements

## Phase 2 — Archive

Build:

- Homepage
- Archive
- Categories
- Individual photo pages
- Photo metadata
- Photo IDs
- Watermarked previews
- Admin upload/management

## Phase 3 — Studio

Build:

- Service catalogue
- Service onboarding
- Estimate logic
- Request submission
- Admin request management
- Quote workflow

## Phase 4 — Commerce

Build:

- Digital purchases
- Prints
- Licensing
- Checkout
- Downloads/order management

## Phase 5 — Growth

Consider:

- Photographer profiles
- Collections
- Search
- Client accounts
- Client portal
- Booking/deposits
- Social integrations

Do not build these before the core Archive + Studio experience is solid.

---

## Deferred Backend Work (Intentionally Not Implemented)

These items are **planned/future**, not forgotten or accidentally missing:

### 1. Payments
- No online payment provider yet.
- No Stripe / MBWay / Eupago integration.
- No payment webhooks.
- No automated checkout.
- Payments will be designed and implemented later with manual review/care.

### 2. Storage
- SeaweedFS/S3-compatible production storage is not implemented yet.
- No production original-file storage pipeline yet.
- No presigned upload implementation yet.
- No production download URLs yet.

### 3. Image Processing
- Thumbnail generation
- Display renditions
- Watermark generation
- RAW processing/derivatives
- Background processing/worker pipeline

### 4. Purchases / Automated Entitlements
- Do not implement checkout.
- Do not implement automated payment confirmation.
- Existing purchase schema/domain may remain as future groundwork, but do not build a customer-facing payment flow.

### 5. 2FA
- Still deferred.

### 6. Analytics
- Still deferred.

### 7. Claim / Visual Similarity
- Still deferred.

### 8. Email Provider
- Transactional email integration remains deferred.