# RentGuard Stage 1 — Build Guideline Alignment

This repo implements the **Stage 1** product spec using **NestJS + Next.js** (not Express monorepo). The architecture matches the guideline’s intent.

## Two decisions that shape everything

### 1. Provider-abstracted verification

- Interface: `backend/src/modules/identity/providers/verification-provider.interface.ts`
- v1 implementation: `ManualVerificationProvider` — no autonomous NID OCR or face-match decisions
- NID verification UI is **deferred**; Stage 1 only requires a **selfie at registration**
- Future: swap in a licensed KYC partner via `VERIFICATION_PROVIDER` token

### 2. Explainable, disputable credit scoring

- Immutable `ScoreEvent` records in Postgres (`score_events` table)
- Each event has `evidenceUrl`, `tenantResponse`, and status (`ACTIVE` | `DISPUTED` | `OVERTURNED`)
- `ScoreEventService.recalculateScore()` recomputes from active events only
- Protects legally and supports tenant right-of-reply

## Stage 1 registration flow

| Step | Endpoint | Description |
|------|----------|-------------|
| 1 | `POST /api/v1/auth/register-init` | Create pending user (`isActive: false`), return `registrationToken` (30 min JWT) |
| 2 | `POST /api/v1/auth/register-selfie` | Multipart: `registrationToken` + `selfie` file → profile created, account activated, JWT issued |

**Hard rule:** No selfie → no active account.

Frontend: `/auth/register` — two-step form with live camera (`SelfieCapture` component).

## Schema additions (Stage 1)

- `User.subscriptionTier` — `FREE` default
- `TenantProfile.selfieUrl`, `profileVerificationStatus` (`SELFIE_ONLY` default)
- `LandlordProfile.selfieUrl`, `ownershipDocUrl`, `profileVerificationStatus`
- `ScoreEvent` — explainable scoring events

Run after pulling:

```bash
cd backend
npx prisma migrate dev --name stage1_selfie_and_score_events
# or for quick dev:
npx prisma db push
```

## Local dev without AWS S3

If `AWS_ACCESS_KEY_ID=changeme`, selfies are stored under `backend/uploads/selfies/` and served at `http://localhost:3001/uploads/...`.

## What’s deferred (later stages)

- NID upload + licensed KYC provider swap-in via `VerificationProvider`
- bKash/Nagad/Stripe payment webhooks (tier guard + `User.subscriptionTier` are ready)
- ML recommendation / fraud models (rules-based recommendation module exists as a hook)

## Stage 2 API endpoints

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/credit-score/events` | Landlord | Submit score event |
| GET | `/credit-score/events/me` | Tenant | List my score events |
| POST | `/credit-score/events/:id/dispute` | Tenant | Right-of-reply dispute |
| POST | `/credit-score/events/:id/overturn` | Admin | Overturn disputed event |
| GET | `/admin/verification/pending` | Admin | Selfie review queue |
| POST | `/admin/verification/:userId/approve` | Admin | Approve after manual review |

## Build order (recommended Cursor prompts)

1. ✅ Stage 1 — Auth + selfie registration + profiles (this doc)
2. ✅ Listings + free-tier limit (2 active listings for FREE landlords)
3. ✅ Score events API + tenant dispute UI + admin overturn
4. ✅ Admin manual verification queue (selfie review)
5. Payments + premium subscriptions
6. Notifications (SMS/push)

## Important legal disclaimer (show in UI)

> RentGuard is **not** a government verification service. Identity checks are for platform trust and may include manual review.
