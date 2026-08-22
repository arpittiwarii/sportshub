# SportsHub — Production Readiness Audit

Audited: 2026-08-22 · Stack: Express 5 + Mongoose 8 + BullMQ/Redis + Cloudinary · React 19 + Vite 8

Verdict: **not deployable as-is.** Good bones (layered repo/service/controller, helmet, rate limits, AJV
validation, env validation, soft deletes, BullMQ queue) but there are 4 confirmed broken features and
5 security blockers.

---

## P0 — Blockers

### 1. Live secrets committed to git
`docker.compose.yaml` is **tracked** and contains real credentials:
- `CLOUDINARY_API_SECRET: aByXkq...` (line 27)
- `EMAIL_PASS: qopmrateglnjyalt` — Gmail app password (line 35)
- `JWT_SECRET_KEY: supersecretjwtkey12345` (line 32)

Root cause: `.gitignore:19` says `docker.compoose.yaml` (three `o`s) — never matched.

Fix:
1. Rotate all three credentials **now** (Cloudinary key, Gmail app password, JWT secret).
   Rotating JWT_SECRET invalidates all live sessions — that is the desired outcome.
2. `git rm --cached docker.compose.yaml`
3. Fix the `.gitignore` typo.
4. Purge from history (`git filter-repo --path docker.compose.yaml --invert-paths`) and force-push.
5. Replace every literal with `${VAR}` refs sourced from a non-tracked `.env`.

Note: `backend/.env` was never committed — verified clean.

### 2. NoSQL injection → OTP verification bypass
`src/routes/otpRoutes.js` has **no `validate()` middleware**. `src/repositories/Otp.repository.js:14`
runs `OTP.findOne({ UId: uid, otp })` with `otp` straight from the request body.

`POST /api/otps/verify` with `{"uid":"<any user id>","otp":{"$gte":""}}` matches any OTP document for
that user. Fix: add an AJV schema for both OTP routes (`otp` = `{type:"string", pattern:"^[0-9]{4}$"}`,
`uid` = `{type:"string", pattern:"^[a-f0-9]{24}$"}`), and cast with `String(otp)` in the repository.

### 3. Open email relay (unauthenticated)
`src/controllers/otp.controller.js:5` passes `req.body` directly into `createOtpService`, which sends
mail to a caller-supplied `email` with a caller-supplied `name`. `POST /api/otps/send` is public.

Anyone can send arbitrary-recipient mail from your Gmail account. Consequence: account suspension and
burnt sender reputation. Fix: accept only `uid`, look up the user server-side, and derive `email`/`name`
from the DB record. Never accept `session` from the body.

### 4. Every Cloudinary upload throws (verified)
`src/services/cloudinaryUpload.js:2`
```js
const cloudinary = require('../config/cloudinary');   // → { cloudinary, verifyCloudinaryConnection }
```
`cloudinary.uploader` is `undefined`. Confirmed at runtime.

Breaks 4 endpoints: `PUT /api/athlete/:id/documents`, `PUT /api/athlete/:id/profile-image`,
`PUT /api/admin/profile`, `PUT /api/admin/students/:id/profile-image`.

Fix: `const { cloudinary } = require('../config/cloudinary');`

### 5. Payment proof upload is stubbed out
- `src/routes/feeRoutes.js:31` — multer middleware commented out; route is `PUT /:id/approve`, not `/upload`
- `src/services/fee.service.js:57-62` — upload call commented out, writes `screenshot: null`

The core payment flow accepts no screenshot. Frontend has `UploadModal`/`ScreenshotModal` wired for a
feature the backend dropped. Also: the controller JSDoc, the route path, and the Postman collection
disagree on the URL.

### 6. Payment reminder cron never sends anything
`src/jobs/paymentReminder.js:13` — `pendingPayments.lenth` (typo). `undefined >= 0` → `false`, so the
loop never executes. Fix the typo, use `.length > 0`, and add `{ timezone: 'Asia/Kolkata' }` to
`cron.schedule` so 9am means 9am.

### 7. `backend/Dockerfile` does not exist
`docker.compose.yaml` builds `context: ./backend, dockerfile: Dockerfile`. `docker compose up` fails
immediately. Need a multi-stage Dockerfile (`node:22-alpine`, `npm ci --omit=dev`, non-root user,
`CMD ["node","src/app.js"]`) plus one for the frontend or a static host.

### 8. Worker ignores Redis config
`src/workers/email.worker.js:47-48` hardcodes `host: "127.0.0.1", port: 6379`, while compose sets
`REDIS_HOST: redis`. The worker never connects → **no emails at all** (OTP, welcome, approval,
reminders). Fix: use `config.redis` from `src/env.js`, same as `src/queues/email.queue.js`.

### 9. Production would run in development mode
`docker.compose.yaml:31` sets `NODE_TYPE: DEVELOPMENT`. `src/env.js:23` lowercases it → `development`.
Effects: `helmet` CSP disabled (`app.js:57`), HSTS off (`app.js:60`), rate limits 5× looser
(`app.js:30,38,48`), and full error messages + `console.error(err)` returned to clients
(`errorHandler.js:27-33`). Set `NODE_ENV=production`.

---

## P1 — Security & correctness

### 10. Internal error messages leak to clients in production
`Error/InternalServerError.js` extends `AppError`, which sets `isOperational = true`
(`Error/AppError.js:5`). So `errorHandler.js:13-18` returns `err.message` verbatim with a 500 — the
production guard at line 27 is never reached for these.

Services wrap raw errors: `throw new InternalServerError(\`Server error, error: ${error.message}\`)`
(9 occurrences). Mongo driver errors, Cloudinary errors, and connection details reach the client.

Fix: `isOperational = false` for 5xx errors, or have the handler check `statusCode >= 500` before
echoing `message`.

### 11. OTP design
- No expiry — `models/otp.model.js` has no TTL index. OTPs are valid forever.
- No attempt counter — only IP rate limiting (5/10min in prod), trivially distributed.
- Only 4 digits (`services/otp.service.js:9`) → 10,000-value space.
- No index on `UId` → collection scan per verify.

Fix: 6 digits, `expiresAt` + `{ expireAfterSeconds: 0 }` TTL index, `attempts` field capped at 5,
invalidate previous OTPs on resend, index `{ UId: 1 }`.

### 12. Rate limiting is per-process, in-memory
`express-rate-limit` defaults to a memory store (`app.js:28-50`). With 2+ instances or a restart, the
limits effectively vanish — and these limits are the only thing standing between the OTP endpoint and
brute force. Redis is already provisioned: add `rate-limit-redis`. Also set `app.set('trust proxy', 1)`
if behind a load balancer, or client IPs all collapse to the proxy's.

### 13. No graceful shutdown or crash handlers
No `SIGTERM`/`SIGINT` handler, no `unhandledRejection`, no `uncaughtException` anywhere in `src/`.
Under Docker/K8s/Render, every deploy kills in-flight requests and leaves Mongo/Redis connections open.

Fix: capture `server = app.listen(...)`, then on SIGTERM → `server.close()` →
`mongoose.connection.close()` → `worker.close()` → exit, with a ~10s force-exit timer.

### 14. `npm start` runs nodemon
`backend/package.json:8`. Nodemon is a dev file-watcher — it must not be the production entrypoint.
Make `start` = `node src/app.js`, `dev` = `nodemon src/app.js`, and add
`worker` = `node src/workers/email.worker.js`. Move `nodemon` to `devDependencies` (it is currently in
neither — it is an undeclared dependency, so `npm ci --omit=dev` produces an image where `start` fails).

### 15. No health endpoint, no JSON 404
Load balancers, Docker `HEALTHCHECK`, and uptime monitors all need `GET /health`. And unmatched
`/api/*` paths fall through to Express's default HTML 404, which breaks JSON clients. Add both.

### 16. Blog author is caller-controlled
`src/services/blog.service.js:12` takes `userId` from the request body. Use `req.user.id`. Blog routes
also have no AJV schema and no length caps on `title`/`content`.

### 17. Schema inconsistencies
- Password: `schemas/user.schema.js:29` allows 6 chars; `services/register.service.js:14` requires 8 +
  letter + digit. A 7-char password passes validation then fails in the service.
- `updateSchema` (`user.schema.js:105-115`) permits `role` and `password`. The service currently ignores
  both, so there is no live escalation — but it is one careless `...req.body` away from one. Remove them.
- `schemas/user.schema.js:1` destructures from `fees.schema` and never uses it — dead, misleading.
- `registerSchema` doesn't require `afiId`/`school`, but `registerUser` does.
- `fees.schema.js` and `fee.service.js:70` both accept `REJECT` and `REJECTED`. Pick one.
- `fees.schema.js:32` hardcodes `year >= 2026` — a fixed floor that will need editing.
- AJV constructed without `allErrors`/`removeAdditional` (`middleware/validate.js:4`), and raw
  `validator.errors` is returned to the client (line 12) — leaks internal schema structure.
  Also `addFormats(ajv)` is called *after* `validate` is defined (line 18) — it works today only because
  of require ordering. Move it directly under `new Ajv()`.

### 18. Auth model
`JWT_EXPIRE_IN` is `1h` by default (`env.js:40`) but `7d` in compose. No refresh token, no revocation
list — a leaked 7-day token cannot be invalidated short of rotating the secret. Token lives in
`localStorage` (`frontend/src/services/api.js:14`), readable by any XSS. Consider short-lived access
token + httpOnly refresh cookie before you handle real payment data.

### 19. Dead code and stale credentials
Tracked but unused (project moved from Sequelize/Postgres to Mongoose; `sequelize` isn't even a
dependency):
- `src/migrations/` — 4 files
- `src/seeders/20260621191653-seed-blogs.js`
- `src/config/config.json` — Postgres credentials `postgres`/`root`
- `src/utils/demo.js` — fully commented out, contains a personal email
- `app.js:82` serves `/uploads` from `src/uploads`, which does not exist (all uploads go to Cloudinary)

Delete all of it.

### 20. Seed script ships a known admin password
`backend/seed.js:12,19` hardcodes `admin@sportshub.com` / `password123` and prints the credentials to
stdout. Meanwhile `.env` defines `ADMIN_EMAIL`/`ADMIN_PASS`, which nothing reads. Read from env, refuse
to run if unset, and never log the password.

---

## P2 — Scale, observability, quality

| # | Issue | Location |
|---|---|---|
| 21 | No pagination — returns every row | `findAllAthletes`, `findAllWithAthlete`, `findAllBlogs` |
| 22 | N+1 sequential writes in a request | `fee.service.js:31-38` → use `bulkWrite` |
| 23 | Mongo connect has no `maxPoolSize` / `serverSelectionTimeoutMS` / retry | `config/db.js:11` |
| 24 | `console.*` only — 19 in backend, 8 in frontend; no request IDs, no levels | use `pino` + `pino-http` |
| 25 | Logs full objects incl. user PII | `authController.js:9`, `fee.service.js:47`, `feeController.js:40` |
| 26 | Zero tests; `npm test` exits 1 | `package.json:6` |
| 27 | No CI (no `.github/`), no lint on backend | repo root |
| 28 | Compose: obsolete `version: "3.9"`, no healthchecks, no resource limits, Mongo+Redis published to host | `docker.compose.yaml` |
| 29 | Single-node Mongo → `isReplicaSetReady()` is false → registration runs **without a transaction**, so a failed OTP insert leaves an orphan user | `register.service.js:60,95` |
| 30 | Filename `docker.compose.yaml` should be `docker-compose.yml` | repo root |
| 31 | No error tracking (Sentry) or uptime monitoring | — |
| 32 | No `engines` field pinning Node 22 | `backend/package.json` |
| 33 | `PublicRoute` wraps `/`, so logged-in users can't reach the homepage | `frontend/src/App.jsx:120` |
| 34 | Frontend has no `_redirects`/`vercel.json` for SPA fallback → hard refresh on `/dashboard` 404s | `frontend/` |
| 35 | Stale `frontend/dist/` on disk (untracked — fine, but delete it) | `frontend/dist` |
| 36 | Missing DB indexes for common filters: `{role,status}` on users, `{status,submittedAt}` on fees | models |

Positives worth keeping: `backend/.env` was never committed; `npm audit` → 0 vulnerabilities; frontend
builds clean; `helmet` + CORS allowlist + AJV + env validation at boot are all already in place;
`protect` re-reads the user from the DB so role/status changes take effect immediately; `restrictTo`
normalizes case, so the mixed `'admin'`/`'ADMIN'` usage across routes is not a bug.

---

## Suggested order

1. **Today:** rotate the 3 leaked credentials, untrack `docker.compose.yaml`, purge history. (#1)
2. **Security:** #2, #3, #10, #11, #12. Then re-run the Postman collection.
3. **Un-break features:** #4, #5, #6, #8. These are one-to-ten-line fixes each.
4. **Deployability:** #7, #9, #13, #14, #15.
5. **Cleanup:** #16–#20.
6. **Then ship**, with #24 (logging), #31 (Sentry), and smoke tests for auth + payments in place.
7. **After launch:** #21–#23, #26, #27, #29.
