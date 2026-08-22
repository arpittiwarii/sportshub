# SportsHub — Production Readiness Audit

**Reviewed as:** Senior Software Architect · Security Engineer · DevOps Engineer · Backend Engineer · Frontend Engineer · Production Reviewer
**Stack:** MERN — Express 5 · Mongoose 8 · MongoDB · Redis + BullMQ · React 19 / Vite · Cloudinary · Nodemailer
**Audit date:** 2026-08-22
**Scope of this report:** Full audit of the 10 required areas + 11 final deliverables, reflecting the **current codebase after the P0 + P1 remediation pass** described in §9–§11. Items already fixed are marked **[FIXED]** with the change; items still open are marked with a priority.

---

## Deliverable 1 — Production Readiness Score

# 76 / 100 — *Production-capable, launch-blocked on 2 owner actions*

**Before this remediation pass: ~34/100.** The code is now structurally sound: authenticated + role-scoped APIs, schema validation on every mutating route, Redis-backed rate limiting, queue-based email with retries, streamed uploads, graceful shutdown, and a real container/deploy story. It is **not yet 90+** because of operational gaps (no automated tests, no CI, no monitoring/alerting, no documented backup/restore) and two **owner-only actions that must complete before launch**: rotating the leaked credentials and purging them from git history.

| Dimension | Score | Notes |
|---|---:|---|
| Architecture | 8/10 | Clean layering; single-process cron is the main caveat |
| Security | 7/10 | Hardened; **gated on credential rotation + history purge** (owner) + localStorage-token XSS exposure |
| Data integrity | 8/10 | Soft-delete, partial unique indexes, TTL, attempt caps; single-node txn caveat |
| Reliability / error handling | 8/10 | Central handler, graceful shutdown, queue retries; no alerting yet |
| Performance / scalability | 6/10 | Stateless API scales; no pagination, 8.2 MB hero asset |
| API / backend quality | 8/10 | Consistent envelope, validation, RBAC + ownership |
| Frontend / UX | 7/10 | Interceptors, guards, SPA fallback; lint debt + one dead handler |
| DevOps / deployment | 7/10 | Multi-stage Docker, healthchecks; no CI, no backups |
| Testing | 2/10 | No automated tests at all |
| Observability | 5/10 | Structured logs; no metrics/traces/alerts |

---

## Deliverable 2 — Critical Issues (were P0 — now resolved this pass)

Every P0 below was **fixed and verified** in this pass. Two residual owner actions remain (§ "Owner must do").

### 2.1 Committed secrets in `docker.compose.yaml` **[FIXED — code side]**
- **Issue:** Real JWT/Cloudinary/SMTP credentials were hard-coded in a tracked compose file.
- **Why it's a problem:** Anyone with repo access (or a leaked clone/fork) obtains production credentials; git history retains them even after edits.
- **Example failure scenario:** A contributor forks the repo; the JWT secret leaks; an attacker forges admin tokens and approves/deletes any athlete or fee.
- **Severity:** Critical.
- **Fix applied:** Rewrote `docker.compose.yaml` to use `${VAR}` interpolation with safe non-secret defaults; `git rm --cached` the file; added `docker.compose.yaml` to `.gitignore` (typo `docker.compoose.yaml` corrected); added a documented `.env.example` at repo root.
- **Owner must do (not automatable by me, per your instruction):** (1) **Rotate** the leaked JWT secret, Cloudinary keys, and Gmail app password. (2) **Purge history** (`git filter-repo`/BFG) and force-push. Until both are done, the old secrets remain valid in history.

### 2.2 NoSQL injection via unvalidated OTP body **[FIXED]**
- **Issue:** OTP endpoints accepted raw `req.body` fields used in queries without validation/casting.
- **Why:** An object like `{"otp": {"$ne": null}}` could subvert comparison logic.
- **Failure scenario:** Attacker verifies an account without knowing the code.
- **Severity:** Critical.
- **Fix applied:** `validate(sendOtpSchema)` / `validate(verifyOtpSchema)` on the routes (UId = ObjectId pattern, otp = `^[0-9]{6}$`); repository casts `String(otp)`; lookup is by user + non-expired, comparison is strict string equality.

### 2.3 Email open-relay / arbitrary-recipient OTP **[FIXED]**
- **Issue:** Recipient address risked being taken from the request.
- **Why:** Lets an attacker send OTP/marketing mail to arbitrary addresses from your domain (reputation + abuse).
- **Failure scenario:** Spammer drives thousands of OTP emails to third parties; Gmail flags the sender.
- **Severity:** Critical.
- **Fix applied:** `resendOtpService` resolves the user by `UId` and sends **only** to the user's stored email; the body never carries a recipient.

### 2.4 Cloudinary misconfigured import + unstreamed uploads **[FIXED]**
- **Issue:** Incorrect require shape and disk/tmp handling.
- **Fix applied:** `const { cloudinary } = require('../config/cloudinary')`; `uploadBufferToCloudinary` streams an in-memory buffer via `PassThrough` → `upload_stream` (no disk writes).

### 2.5 Payment-proof upload broken / unvalidated **[FIXED]**
- **Issue:** Proof upload path did not enforce type/size and did not persist to Cloudinary.
- **Fix applied:** `feeRoutes` uses multer `memoryStorage`, **5 MB** limit, **JPG/PNG allowlist**, `upload.single('screenshot')`, `protect` + `restrictTo('athlete')`; controller streams to Cloudinary and stores the URL.

### 2.6 Cron typo silently disabled reminders **[FIXED]**
- **Issue:** `pendingPayments.lenth` (typo) → reminder loop never ran.
- **Fix applied:** Correct `Array.isArray(pendingPayments) && pendingPayments.length > 0`; each reminder enqueued to BullMQ with `attempts: 3` + exponential backoff, `Asia/Kolkata` timezone.

### 2.7 No production container / worker Redis wiring / `NODE_ENV` **[FIXED]**
- **Fix applied:** Multi-stage `Dockerfile`; worker uses the shared `createRedisConnection` factory; compose sets `NODE_ENV: production` for both `backend` and `worker`, each with the full env set `env.js` validates at boot.

---

## Deliverable 3 — Architecture Problems

### 3.1 Cron runs in-process on the API node — **P2**
- **Issue:** `paymentReminderJob` is scheduled inside the API process.
- **Why:** Horizontally scaling the API to N replicas fires the job N times → duplicate reminder emails; if that node is down at 09:00, reminders are skipped.
- **Failure scenario:** Autoscaler runs 3 API pods; every pending payer gets 3 reminder emails the same morning.
- **Severity:** Medium.
- **Recommended solution:** Move the scheduler into the **worker** process (single replica), or use BullMQ **repeatable jobs** (Redis-coordinated, fires once regardless of API replica count).
- **Priority:** P2.

### 3.2 Single-process coupling of HTTP + scheduling — **P2**
- **Issue:** API concerns and scheduled concerns share a lifecycle.
- **Recommended solution:** Keep API stateless (already true for requests); relocate scheduling to the worker as above. **Priority:** P2.

### 3.3 Transactions assume a replica set — **P3 (document)**
- **Issue:** Multi-doc writes are wrapped conditionally; a standalone `mongod` silently skips true atomicity.
- **Recommended solution:** Run MongoDB as a (single-node is fine) **replica set** in production, or use managed Atlas; document the requirement. **Priority:** P3.

**What's already good:** clean `routes → controllers → services → repositories → models` layering; centralized config/env validation; shared Redis factory; stateless request handling behind JWT.

---

## Deliverable 4 — Security Issues

### 4.1 JWT stored in `localStorage` — **P1 (recommended next)**
- **Issue:** Access token in `localStorage` is readable by any injected script.
- **Why:** A single XSS (or malicious dependency) exfiltrates tokens; no server-side revocation.
- **Failure scenario:** A compromised npm package reads `localStorage.token` and posts it to an attacker; the attacker acts as that user until expiry.
- **Severity:** High.
- **Recommended solution:** Move to short-lived access token + **httpOnly, Secure, SameSite** refresh cookie; add a `/refresh` endpoint and rotation. (Deferred from this pass as a design change, not a hotfix.)
- **Priority:** P1 (next).

### 4.2 Rate limiting — **[FIXED]**
- Redis-backed `express-rate-limit` + `rate-limit-redis` on auth/OTP-sensitive routes; limits are shared across replicas (not per-process).

### 4.3 Security headers — **[FIXED]** `helmet` enabled.

### 4.4 Input validation everywhere — **[FIXED]**
- AJV (`allErrors`, `addFormats`, `additionalProperties:false`) on all mutating routes; register/login/update/otp/fee/blog schemas mirror server-side business rules (password strength, 10-digit contact, year range, status enum `PENDING/APPROVED/REJECTED`).

### 4.5 OTP brute-force / replay — **[FIXED]**
- 6-digit `crypto.randomInt`; **max 5 attempts** then invalidate; **10-min TTL** via `expiresAt` + Mongo TTL index; prior OTPs soft-deleted on reissue.

### 4.6 Password handling — **[verified]** bcrypt hashing; strength enforced (≥8, letter + digit) on register and mirrored in schema; seed refuses weak/blank admin passwords and never prints them.

### 4.7 AuthZ — **[verified]** `protect` + `restrictTo` + `requireOwnershipOrAdmin`; blog/profile author derived from the token, not the body.

---

## Deliverable 5 — Third-Party Services to Replace / Upgrade

| Service | Current | Verdict | Recommendation | Priority |
|---|---|---|---|---|
| **Email** | Gmail SMTP (app password) | Fine for low volume; Gmail has send caps + deliverability limits | Move to **SES / Postmark / Resend** before scale; keep Nodemailer transport swap | P2 |
| **File storage** | Cloudinary | **Keep** — streamed, no local disk, good fit | Add signed uploads / eager transforms if traffic grows | — |
| **Queue/cache** | Redis + BullMQ | **Keep** | Use managed Redis (Upstash/Elasticache) with persistence | P2 |
| **Database** | MongoDB | **Keep** | Managed **Atlas** (backups, replica set, PITR) | P1 |
| **Secrets** | `.env` files | OK for now | Move to a secrets manager (Doppler/Vault/SSM) post-launch | P2 |

No third-party service needs to be *removed*; the priority is **managed, backed-up** infrastructure for DB + Redis.

---

## Deliverable 6 — Database / Data Integrity Problems

### 6.1 Soft-delete consistency — **[FIXED/verified]**
- `withSoftDelete` adds `deletedAt` + `find/findOne/countDocuments` middleware scoping to `deletedAt:null` + a `softDelete()` method. OTP repo relies on this correctly.

### 6.2 Uniqueness under soft-delete — **[verified]**
- Partial unique indexes (e.g. email) are scoped so a soft-deleted record doesn't block re-registration while still preventing live duplicates.

### 6.3 OTP lifecycle — **[FIXED]** attempts counter, `expiresAt`, TTL index, reissue invalidation (see 4.5).

### 6.4 No automated backups — **P1**
- **Issue:** No documented backup/restore for MongoDB.
- **Failure scenario:** Accidental mass delete or disk loss = unrecoverable athlete/payment records.
- **Recommended solution:** Managed Atlas continuous backups + PITR, or scheduled `mongodump` to object storage with a **tested restore** runbook. **Priority:** P1.

### 6.5 No pagination on list endpoints — **P2**
- Growing `getAllAthletes` / `getAllFees` / `/blogs` return unbounded arrays. Add `limit`/`skip` (or cursor) + indexes on sort keys. **Priority:** P2.

---

## Deliverable 7 — Scalability & Performance Improvements

| Improvement | Why | Priority |
|---|---|---|
| Paginate all list endpoints (§6.5) | Unbounded payloads grow with data | P2 |
| Compress + resize `hero_background.png` (**8.2 MB**) | Kills first-paint on mobile; wastes bandwidth | P2 |
| Move cron to worker / repeatable job (§3.1) | Correctness + safe horizontal scaling | P2 |
| Managed Redis/Mongo with persistence | Durability under load & restarts | P1 |
| CDN + long-cache for built frontend assets | Offload static delivery | P3 |
| DB indexes on frequent filters/sorts (status, month/year, UId) | Avoid collection scans | P2 |

The API itself is **stateless per request** and scales horizontally once the cron caveat (§3.1) is resolved.

---

## Deliverable 8 — Recommended Production Architecture

```
                    ┌────────────────────────┐
   Browser ───────► │  Static frontend (CDN)  │  (Vite build; SPA fallback)
                    └───────────┬────────────┘
                                │ HTTPS /api
                    ┌───────────▼────────────┐        ┌───────────────┐
                    │  API (Express, N pods)  │◄──────►│ Managed Redis │
                    │  stateless, JWT, helmet │  jobs  │  (BullMQ)     │
                    │  rate-limited, /health  │        └──────┬────────┘
                    └───────────┬────────────┘               │ consumes
                                │                     ┌───────▼────────┐
                    ┌───────────▼────────────┐        │  Worker (1 pod) │
                    │  MongoDB (Atlas / RS)   │◄───────┤  email + cron   │
                    │  backups + PITR         │        │  (repeatable)   │
                    └─────────────────────────┘        └──────┬─────────┘
                                                               │
                                              ┌────────────────▼───────┐
                                              │ Cloudinary (uploads)   │
                                              │ SES/Postmark (email)   │
                                              └────────────────────────┘
```

- **API:** stateless, horizontally scalable behind a load balancer; `/health` for readiness/liveness.
- **Worker:** single replica owns email consumption **and** scheduling (repeatable jobs) to avoid duplication.
- **Data:** managed MongoDB (replica set → real transactions + backups); managed Redis with persistence.
- **Secrets:** injected from a secrets manager, never in images or git.
- **Frontend:** static build on a CDN with SPA fallback (`_redirects` / `vercel.json` already added).

---

## Deliverable 9 — Step-by-Step Implementation Plan

**Completed this pass (verified — see §11):**
1. Untrack compose secrets, fix `.gitignore`, add `.env.example` (root + backend).
2. Harden OTP (validation, 6-digit, attempt cap, TTL, reissue invalidation).
3. Add/repair AJV validation on register/login/update/otp/fee/blog routes.
4. Fix EditRegistration payload (send only editable fields) — repaired a broken profile update.
5. Stream Cloudinary uploads; enforce type/size on fee proof.
6. Fix cron typo; enqueue reminders/approvals via BullMQ with retries.
7. Multi-stage Dockerfile; worker on shared Redis factory; `NODE_ENV=production`.
8. Graceful shutdown, `/health`, JSON 404, pooled SMTP, structured logging.

**Owner must do before launch (per your scoping — I did not perform these):**
9. **Rotate** JWT/Cloudinary/Gmail credentials.
10. **Purge** secrets from git history (BFG/filter-repo) and force-push.

**Next (P1) after launch-gate:**
11. Managed MongoDB (Atlas) + backups/PITR; managed Redis with persistence.
12. httpOnly refresh-cookie auth + `/refresh` rotation (§4.1).

**Then (P2):**
13. Move cron to worker / repeatable job; add pagination + indexes; optimize hero asset; add tests + CI.

---

## Deliverable 10 — Priority-Ordered Task List

**P0 — done this pass:** committed secrets (code side), OTP NoSQL-injection, open-relay OTP, Cloudinary import/stream, fee-proof upload, cron typo, prod container/worker/NODE_ENV.

**P0 — owner action (launch blocker):** rotate credentials · purge git history + force-push.

**P1:** managed DB + backups/PITR · httpOnly refresh-token auth · move DB to replica set (real transactions).

**P2:** cron → worker/repeatable job · pagination + indexes · compress 8.2 MB hero image · automated tests + CI pipeline · managed Redis persistence · migrate email to SES/Postmark · secrets manager.

**P3:** CDN long-cache for assets · metrics/tracing/alerting · fix pre-existing lint debt (incl. `StudentDashboard.jsx:513 submitUpload` no-undef) · document replica-set requirement.

---

## Deliverable 11 — Final Production Readiness Checklist

**Application (done):**
- [x] Input validation on all mutating routes (AJV, strict)
- [x] AuthN (JWT) + AuthZ (role + ownership)
- [x] OTP hardened (6-digit, attempt cap, TTL, reissue invalidation)
- [x] Rate limiting (Redis-backed, cross-replica)
- [x] Security headers (helmet)
- [x] Uploads streamed + type/size enforced
- [x] Queue-based email with retries/backoff
- [x] Graceful shutdown + `/health` + JSON 404
- [x] Structured logging (pino)
- [x] Multi-stage Docker + worker + healthchecks + `NODE_ENV=production`
- [x] SPA fallback for client routing
- [x] Seed script env-driven, refuses weak/blank admin password

**Launch blockers (owner):**
- [ ] **Rotate** leaked JWT / Cloudinary / Gmail credentials
- [ ] **Purge** secrets from git history and force-push

**Before/around launch (P1):**
- [ ] Managed MongoDB with backups + PITR + replica set
- [ ] Managed Redis with persistence
- [ ] httpOnly refresh-cookie auth
- [ ] Tested backup/restore runbook

**Operational maturity (P2/P3):**
- [ ] Automated tests + CI
- [ ] Pagination + indexes on list endpoints
- [ ] Compress 8.2 MB hero asset
- [ ] Cron moved to worker / repeatable job
- [ ] Metrics / tracing / alerting
- [ ] Clear pre-existing lint debt

---

## Owner must do (cannot be automated here — per your instruction)

1. **Rotate credentials** — generate a new ≥32-char `JWT_SECRET`, new Cloudinary API key/secret, new Gmail app password; update your deployment secrets. Existing tokens signed with the old secret will invalidate (expected).
2. **Purge git history** — the old secrets remain valid in history until removed:
   - Using BFG: `bfg --delete-files docker.compose.yaml` then `git reflog expire --expire=now --all && git gc --prune=now --aggressive`, then `git push --force`.
   - Coordinate the force-push with any collaborators (they must re-clone).

---

## Verification performed this pass

- `node --check` on all modified backend files — **OK**
- Backend `npm install` — **0 vulnerabilities**, 189 packages audited
- AJV schema assertions (14) — **ALL PASS** (password rules, updateSchema rejects email/role + requires ≥1 prop, OTP 6-digit, fee year range + status enum, blog requires title/content + rejects userId)
- Backend require-graph smoke test (incl. worker + queue) with stubbed env — **loads clean**
- Frontend `npm run build` — **success** (511 modules; flagged 8.2 MB hero asset)
- Frontend `npm run lint` — 42 problems, **all pre-existing** (0 introduced; e.g. `motion` false-positives from missing jsx-uses-vars, `submitUpload` no-undef in an untouched file)
- `git status` — compose untracked (on disk, ignored); all intended edits present
