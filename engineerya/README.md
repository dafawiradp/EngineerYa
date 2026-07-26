# EngineerYa

Digital engineering library platform. Monorepo (npm workspaces).

## Structure

- `apps/web` — Next.js frontend
- `apps/api` — NestJS backend (Clean Architecture, modules under `src/modules`)
- `packages/database` — Prisma schema + client
- `packages/shared-types` — DTOs shared between web and api
- `packages/config` — validated environment config

## Getting started (Phase 0)

```bash
cp .env.example .env        # adjust secrets as needed
npm install
docker compose up -d postgres redis meilisearch
npm run db:generate
npm run db:migrate
npm run dev:api              # http://localhost:4000/api/v1/health
npm run dev:web              # http://localhost:3000
```

## Identity module (Phase 1)

Location: `apps/api/src/modules/identity` — layered as domain → application → infrastructure → presentation.

Endpoints (`/api/v1/auth/...`):

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/auth/register` | none | email + password (min 8 chars) + name |
| POST | `/auth/login` | none | returns access + refresh token pair |
| POST | `/auth/refresh` | refresh token in body | rotates the refresh token (old one is revoked) |
| GET | `/auth/google` | none | redirects to Google consent screen |
| GET | `/auth/google/callback` | none | Google redirects here; issues token pair |
| GET | `/auth/me` | access token (Bearer) | returns the current user |

Key design points:
- Access and refresh tokens are signed with **different secrets** — a leaked access token can't be replayed as a refresh token.
- Refresh tokens are stored **hashed** (`RefreshToken.tokenHash`), never raw, and rotated on every use, so reuse of a stolen-but-superseded token is detectable later.
- `@Roles(UserRole.ADMIN)` + `@UseGuards(JwtAuthGuard, RolesGuard)` is the pattern every future protected/admin route will use.
- `BookDetailDto`-style leakage isn't possible for user rows either: the domain `UserEntity` and `UserDto` never carry `passwordHash` outward.

To set up Google OAuth locally, fill `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in `.env` — until then, the strategy loads with `"not-configured"` placeholders so the app still boots.

## Catalog module (Phase 2)

Location: `apps/api/src/modules/catalog` — same domain → application → infrastructure → presentation layering as Identity.

Public endpoints (`/api/v1/...`):

| Method | Path | Notes |
|---|---|---|
| GET | `/books` | `?category=<uuid>&discipline=&page=&pageSize=` — published books only |
| GET | `/books/:slug` | 404s on draft/archived books, not just unlisted |
| GET | `/categories` | flat list; `parentId` lets the client build the tree |

Admin endpoints (JWT + role-gated):

| Method | Path | Role |
|---|---|---|
| GET / POST | `/admin/books` | ADMIN, EDITOR |
| PATCH | `/admin/books/:id` | ADMIN, EDITOR |
| DELETE | `/admin/books/:id` | ADMIN only |
| GET / POST | `/admin/categories` | ADMIN, EDITOR |
| PATCH | `/admin/categories/:id` | ADMIN, EDITOR |
| DELETE | `/admin/categories/:id` | ADMIN only — blocked (409) while books still reference the category |

Key design points:
- **`fileKey` never leaves the database via a controller.** The Prisma repository uses one explicit `select` (`PUBLIC_BOOK_SELECT`) for every read path, and that select has no `fileKey` field — so it can't be returned even by an admin route, even by accident. The one exception, `findFileKeyById()`, is a narrow method reserved for the Storage/Reader modules landing in Phase 4.
- The domain `BookEntity` itself has no `fileKey` property, so this isn't just a query-time filter — there's no in-memory object anywhere in application/presentation code that could carry the key even if a `select` were later loosened.
- `GetBookBySlugUseCase` takes an explicit `includeUnpublished` flag; only admin controllers ever pass `true`, so a draft book's slug can't be guessed and read from the public route.
- Slugs are generated server-side (`SlugService`) and de-duplicated automatically — clients never supply or fight over a slug.
- Category deletion is blocked while books still reference it, to avoid silently orphaning book rows.
- Full-text/typo-tolerant search (`?q=`) is intentionally **not** in `/books` yet — that's Meilisearch's job in Phase 3, so this endpoint stays a simple filtered/paginated Postgres query.

## Search module (Phase 3)

`GET /search?q=&category=&discipline=&page=&pageSize=` — Meilisearch-backed, sub-300ms typo-tolerant search.

Kept in sync via **domain events**, not a direct call: Catalog's book use cases emit `book.upserted` / `book.deleted`; `BookIndexListener` (in the Search module) reacts and updates the index. Catalog has zero awareness Search exists — a one-way dependency, no circular imports. An unpublished book is **removed from the index entirely** on the same event, not just filtered at query time, so a draft title can't surface via search suggestions either.

## Storage module (Phase 4)

`R2ClientService` is the *only* place in the codebase that talks to object storage — every other module goes through it, never the S3 client directly.

Upload flow (admin):
1. `POST /admin/storage/books/:id/upload-url` → short-lived signed PUT URL. The browser uploads the raw PDF **directly to R2**, never through the API process.
2. `POST /admin/storage/books/:id/render` → enqueues a BullMQ job.
3. `BookRenderingProcessor` (background worker) downloads the PDF, shells out to `pdftoppm` (poppler-utils) to rasterize every page to PNG at 150 DPI, uploads each page to R2, and writes `Book.pageCount` back.

**Deployment requirement:** the API image needs `poppler-utils` installed — already added to `apps/api/Dockerfile` (`apk add poppler-utils`). If you run the API outside Docker, install it on the host (`apt-get install poppler-utils` / `brew install poppler`).

## Reader, Watermark, Progress & Bookmarks (Phases 5–7)

- `GET /reader/:bookId/manifest` — page count + table of contents (ToC extraction from the PDF outline is a follow-up enhancement; currently returns an empty array).
- `GET /reader/:bookId/pages/:page` — **streams a watermarked JPEG directly**, not a signed URL to a static file. Each request re-fetches the unwatermarked base page from R2 and composites a fresh, per-user watermark (email, timestamp, session id, diagonally tiled + footer strip) via `sharp`. Nothing watermarked is ever cached or written back to storage, so the same page produces a different image for every request. A `WatermarkToken` row is logged on every page view for traceability. Rate-limited tighter than the API default (60/min) specifically to slow down bulk scraping.
- `PATCH /reader/:bookId/progress`, `GET /reader/:bookId/progress` — last page + percent complete.
- `GET`/`POST /reader/:bookId/bookmarks`.

**Known gap, tracked deliberately:** these routes currently only check that the user is logged in (`JwtAuthGuard`) — not that they've actually purchased or have a membership covering this book. Real entitlement checking is Phase 8's job, added as an additional guard layered on top of what's here, not a rewrite.

## Entitlements & Commerce (Phase 8)

- `POST /purchases {bookId}` → creates a `Purchase` (PENDING), returns a Midtrans Snap token/redirect URL
- `POST /payments/webhook` → Midtrans server-to-server callback. Trust comes entirely from verifying `signature_key` (SHA-512 of order details + server key) — there's no auth guard on this route because Midtrans can't send a user's bearer token. Routes by an explicit `book-`/`membership-` order-id prefix to the right domain.
- `GET /purchases/me`, `GET /downloads/:bookId` (streams a **freshly per-user watermarked PDF** via `pdf-lib`, not a cached file — mirrors the reader's per-request image watermarking philosophy)
- `EntitlementGuard` + `@RequireEntitlement()` — the guard referenced as a TODO throughout Phases 5–7 is now live on Reader and Downloads routes
- Entitlement grants are **idempotent** (unique constraint + catch-and-ignore on conflict) — safe against Midtrans's webhook retries
- On book deletion, a `Purchase` foreign-key restriction is translated into a clear `409 Conflict` ("archive it instead") rather than a raw DB error leaking through

## Membership (Phase 9)

- `POST /memberships/subscribe {planId}`, `GET /memberships/me` — same Midtrans Snap flow as book purchases, routed via the `membership-` order-id prefix
- Membership-based READ access is checked **live** against `Membership.status`/`expiresAt` in `EntitlementGuard`, not pre-granted as thousands of per-book `Entitlement` rows — avoids unbounded writes per subscriber. DOWNLOAD access has no membership fallback, matching the original spec (downloads always come from an actual purchase)
- A subscription's paid duration window starts at **payment confirmation**, not at checkout initiation — so a slow payment doesn't quietly eat into the paid period
- Architecture note: `MidtransService` was extracted into its own standalone `PaymentGatewayModule` specifically so Commerce and Membership could both depend on it without creating a circular module dependency between them

## Admin & Analytics (Phase 10)

- `GET/PATCH /admin/users`, `GET /admin/analytics/overview` (users, published books, purchases, revenue, active memberships), `GET /admin/audit-logs`
- Every mutating `/admin/...` request is automatically logged (actor, action, target, redacted request body, IP) by a global interceptor — no per-controller boilerplate needed
- `AnalyticsService` is a documented, deliberate exception to "only repositories touch Prisma": cross-domain aggregate reporting doesn't belong inside any single domain's repository interface

## Hardening (Phase 11)

- `helmet()` for standard security headers (CSP, X-Frame-Options, HSTS in production, etc.)
- A global exception filter gives every error a consistent JSON shape and — critically — **hides internal error details in production**, logging the real stack trace server-side instead of returning it to the client
- CSRF middleware was deliberately **not** added: auth is Bearer-token-in-header (not cookies), which is inherently CSRF-resistant since browsers don't auto-attach `Authorization` headers cross-origin
- Rate limiting: global baseline (120/min) plus tighter per-route limits on reader pages (60/min) and downloads (10/min) to slow bulk scraping

## Roadmap status

- [x] Phase 0 — Monorepo scaffold, Docker Compose, CI
- [x] Phase 1 — Identity (JWT, Google OAuth, RBAC)
- [x] Phase 2 — Catalog (books, categories)
- [x] Phase 3 — Search (Meilisearch)
- [x] Phase 4 — Storage & rendering (R2, PDF page rendering)
- [x] Phase 5 — Reader
- [x] Phase 6 — Watermarking
- [x] Phase 7 — Progress & bookmarks
- [x] Phase 8 — Entitlements & commerce (Midtrans)
- [x] Phase 9 — Membership
- [x] Phase 10 — Admin & analytics
- [x] Phase 11 — Hardening
