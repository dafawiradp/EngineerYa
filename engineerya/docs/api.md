# API Reference — EngineerYa

> Base URL: `https://api.yourdomain.com/api/v1`  
> All request bodies use `Content-Type: application/json`.  
> All authenticated endpoints require `Authorization: Bearer <accessToken>`.

---

## Table of Contents

- [Authentication](#authentication)
  - [Register](#post-authregister)
  - [Login](#post-authlogin)
  - [Refresh Tokens](#post-authrefresh)
  - [Google OAuth](#get-authgoogle)
  - [Current User](#get-authme)
- [Catalog](#catalog)
  - [List Books](#get-books)
  - [Get Book by Slug](#get-booksslug)
  - [List Categories](#get-categories)
- [Search](#search)
  - [Full-text Search](#get-search)
- [Storage (Admin)](#storage-admin)
  - [Generate Upload URL](#post-adminstoragebooksidupload-url)
  - [Trigger Rendering](#post-adminstoragebooksidrender)
- [Reader](#reader)
  - [Get Manifest](#get-readerbookidmanifest)
  - [Stream Page](#get-readerbookidpagespage)
  - [Get Progress](#get-readerbookidprogress)
  - [Update Progress](#patch-readerbookidprogress)
  - [List Bookmarks](#get-readerbookidbookmarks)
  - [Create Bookmark](#post-readerbookidbookmarks)
- [Commerce](#commerce)
  - [Create Purchase](#post-purchases)
  - [My Purchases](#get-purchasesme)
  - [Download PDF](#get-downloadsbookid)
- [Payments](#payments)
  - [Webhook](#post-paymentswebhook)
- [Memberships](#memberships)
  - [Subscribe](#post-membershipssubscribe)
  - [My Membership](#get-membershipsme)
- [Admin](#admin)
  - [Books CRUD](#admin-books)
  - [Categories CRUD](#admin-categories)
  - [Users](#admin-users)
  - [Analytics](#get-adminanalyticsoverview)
  - [Audit Logs](#get-adminaudit-logs)
- [Health Check](#get-health)
- [Error Format](#error-format)
- [Rate Limits](#rate-limits)

---

## Authentication

All authentication endpoints are prefixed with `/auth`.

---

### POST /auth/register

Create a new user account with email and password.

**Request body:**
```json
{
  "email": "alice@example.com",
  "name": "Alice Engineer",
  "password": "minimum8chars"
}
```

**Response `201`:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…",
  "user": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "email": "alice@example.com",
    "name": "Alice Engineer",
    "role": "USER",
    "createdAt": "2026-07-26T12:00:00.000Z"
  }
}
```

---

### POST /auth/login

Authenticate with email + password.

**Request body:**
```json
{
  "email": "alice@example.com",
  "password": "minimum8chars"
}
```

**Response `200`:** Same shape as `/auth/register`.

**Errors:** `401 Unauthorized` — invalid credentials.

---

### POST /auth/refresh

Rotate the refresh token and obtain a fresh access token.

**Request body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…"
}
```

**Response `200`:**
```json
{
  "accessToken": "…new access token…",
  "refreshToken": "…new refresh token (old one is now revoked)…"
}
```

**Errors:** `401 Unauthorized` — token expired, revoked, or invalid.

---

### GET /auth/google

Initiates Google OAuth flow. Browser is redirected to Google's consent screen.

**No request body.** Handler body never runs — the Passport guard performs the redirect.

---

### GET /auth/google/callback

Google redirects here after consent. Returns a token pair.

**Response `200`:** Same shape as `/auth/register`.

---

### GET /auth/me

Returns the currently authenticated user.

**Auth required:** ✅

**Response `200`:**
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "email": "alice@example.com",
  "name": "Alice Engineer",
  "role": "USER",
  "createdAt": "2026-07-26T12:00:00.000Z"
}
```

---

## Catalog

---

### GET /books

List published books with optional filters and pagination.

**Query parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `category` | `uuid` | — | Filter by category ID |
| `discipline` | `string` | — | Filter by discipline string |
| `page` | `number` | `1` | Page number |
| `pageSize` | `number` | `20` | Items per page (max `50`) |

**Response `200`:**
```json
{
  "items": [
    {
      "id": "…",
      "title": "Modern Database Internals",
      "slug": "modern-database-internals",
      "coverUrl": "https://r2.yourdomain.com/covers/…",
      "discipline": "Software",
      "categoryId": "…",
      "priceCents": 4900,
      "status": "PUBLISHED"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 142
}
```

---

### GET /books/:slug

Get full book detail by slug. Returns `404` for drafts/archived books.

**Response `200`:**
```json
{
  "id": "…",
  "title": "Modern Database Internals",
  "slug": "modern-database-internals",
  "description": "An in-depth guide to storage engines…",
  "authorNames": ["Alex Petrov"],
  "discipline": "Software",
  "coverUrl": "https://…",
  "categoryId": "…",
  "priceCents": 4900,
  "pageCount": 384,
  "publishedAt": "2024-03-12T00:00:00.000Z",
  "status": "PUBLISHED"
}
```

> ⚠️ `fileKey` is intentionally absent from this response at the type level.

---

### GET /categories

Returns the flat list of all categories. Clients construct the tree using `parentId`.

**Response `200`:**
```json
[
  { "id": "…", "name": "Engineering", "slug": "engineering", "parentId": null },
  { "id": "…", "name": "Software", "slug": "software", "parentId": "…" }
]
```

---

## Search

---

### GET /search

Meilisearch-backed typo-tolerant full-text search. Sub-300 ms at scale.

**Query parameters:**

| Parameter | Type | Description |
|---|---|---|
| `q` | `string` | Search query |
| `category` | `uuid` | Optional category filter |
| `discipline` | `string` | Optional discipline filter |
| `page` | `number` | Page number |
| `pageSize` | `number` | Items per page |

**Response `200`:** Same shape as `GET /books`.

---

## Storage (Admin)

All `/admin/storage/…` endpoints require `ADMIN` or `EDITOR` role.

---

### POST /admin/storage/books/:id/upload-url

Generate a short-lived signed PUT URL. The client uploads the raw PDF **directly to Cloudflare R2** — the file never transits the API process.

**Auth required:** ✅ `ADMIN | EDITOR`

**Response `200`:**
```json
{
  "uploadUrl": "https://r2.cloudflarestorage.com/engineerya-books/…?X-Amz-Signature=…",
  "expiresInSeconds": 120
}
```

---

### POST /admin/storage/books/:id/render

Enqueue a background BullMQ job to rasterize the uploaded PDF. The worker downloads the PDF, shells out to `pdftoppm`, uploads each page PNG to R2, and writes `Book.pageCount`.

**Auth required:** ✅ `ADMIN | EDITOR`

**Response `202 Accepted`:**
```json
{ "jobId": "render:abc123", "bookId": "…" }
```

> ⚙️ **Deployment requirement:** The API container needs `poppler-utils` installed. The provided `Dockerfile` already includes `apk add poppler-utils`.

---

## Reader

All reader endpoints require a valid JWT. Full content additionally requires an active entitlement (checked by `EntitlementGuard`).

---

### GET /reader/:bookId/manifest

Returns page count and table of contents.

**Auth required:** ✅ + Entitlement

**Response `200`:**
```json
{
  "bookId": "…",
  "pageCount": 384,
  "tableOfContents": []
}
```

> 📝 ToC extraction from PDF outline is a planned future enhancement. Currently returns `[]`.

---

### GET /reader/:bookId/pages/:page

Streams a **per-request watermarked JPEG**. Each call composites a fresh watermark (user email + timestamp + session ID, diagonally tiled) via `sharp`. Nothing watermarked is cached.

**Auth required:** ✅ + Entitlement  
**Rate limit:** 60 requests / minute (stricter than baseline to impede bulk scraping)

**Response:** `image/jpeg` stream

---

### GET /reader/:bookId/progress

**Auth required:** ✅

**Response `200`:**
```json
{ "lastPage": 42, "percentComplete": 11.5 }
```

---

### PATCH /reader/:bookId/progress

**Auth required:** ✅

**Request body:**
```json
{ "lastPage": 43, "percentComplete": 11.7 }
```

**Response `200`:** Updated progress object.

---

### GET /reader/:bookId/bookmarks

**Auth required:** ✅

**Response `200`:** Array of bookmark objects.

---

### POST /reader/:bookId/bookmarks

**Auth required:** ✅

**Request body:**
```json
{ "page": 42, "note": "Important derivation here" }
```

**Response `201`:** Created bookmark.

---

## Commerce

---

### POST /purchases

Initiate a book purchase. Creates a `PENDING` purchase and returns a Midtrans Snap token.

**Auth required:** ✅

**Request body:**
```json
{ "bookId": "3fa85f64-5717-4562-b3fc-2c963f66afa6" }
```

**Response `201`:**
```json
{
  "purchaseId": "…",
  "snapToken": "…",
  "redirectUrl": "https://app.midtrans.com/snap/v2/vtweb/…"
}
```

---

### GET /purchases/me

List the authenticated user's purchases.

**Auth required:** ✅

**Response `200`:** Array of purchase objects.

---

### GET /downloads/:bookId

Stream a **per-user watermarked PDF** built on demand by `pdf-lib`. Requires `DOWNLOAD` entitlement.

**Auth required:** ✅ + `DOWNLOAD` Entitlement  
**Rate limit:** 10 requests / minute

**Response:** `application/pdf` stream

---

## Payments

---

### POST /payments/webhook

Midtrans server-to-server payment notification. **No auth guard** — trust is established by verifying `signature_key` (SHA-512 of `orderId + statusCode + grossAmount + serverKey`).

Routes by order-id prefix:
- `book-{purchaseId}` → updates `Purchase` + grants `Entitlement`
- `membership-{membershipId}` → activates `Membership`

**Response `200`:**
```json
{ "received": true }
```

---

## Memberships

---

### POST /memberships/subscribe

Initiate a membership subscription. Returns a Midtrans Snap token.

**Auth required:** ✅

**Request body:**
```json
{ "planId": "professional" }
```

**Response `201`:**
```json
{
  "membershipId": "…",
  "snapToken": "…",
  "redirectUrl": "…"
}
```

---

### GET /memberships/me

Returns the authenticated user's current membership.

**Auth required:** ✅

**Response `200`:**
```json
{
  "id": "…",
  "plan": "professional",
  "status": "ACTIVE",
  "startsAt": "2026-07-26T00:00:00.000Z",
  "expiresAt": "2026-08-26T00:00:00.000Z"
}
```

---

## Admin

All `/admin/…` endpoints require `ADMIN` role unless stated otherwise.

### Admin Books

| Method | Path | Role | Description |
|---|---|---|---|
| `GET` | `/admin/books` | ADMIN, EDITOR | List all books (including drafts) |
| `POST` | `/admin/books` | ADMIN, EDITOR | Create a new book |
| `PATCH` | `/admin/books/:id` | ADMIN, EDITOR | Update book fields |
| `DELETE` | `/admin/books/:id` | ADMIN | Delete book (blocked if purchases exist — use archive instead) |

### Admin Categories

| Method | Path | Role | Description |
|---|---|---|---|
| `GET` | `/admin/categories` | ADMIN, EDITOR | List all categories |
| `POST` | `/admin/categories` | ADMIN, EDITOR | Create category |
| `PATCH` | `/admin/categories/:id` | ADMIN, EDITOR | Update category |
| `DELETE` | `/admin/categories/:id` | ADMIN | Delete category (blocked if books reference it — `409 Conflict`) |

### Admin Users

| Method | Path | Role | Description |
|---|---|---|---|
| `GET` | `/admin/users` | ADMIN | Paginated user list |
| `PATCH` | `/admin/users/:id` | ADMIN | Update user role |

---

### GET /admin/analytics/overview

**Auth required:** ✅ `ADMIN`

**Response `200`:**
```json
{
  "totalUsers": 1240,
  "publishedBooks": 87,
  "totalPurchases": 4231,
  "revenueLastThirtyDays": 1284900,
  "activeMemberships": 312
}
```

---

### GET /admin/audit-logs

**Auth required:** ✅ `ADMIN`

**Query parameters:** `page`, `pageSize`, `actorId`, `targetType`

**Response `200`:** Paginated array of audit log entries.

---

## Health Check

### GET /health

No authentication required.

**Response `200`:**
```json
{
  "status": "ok",
  "timestamp": "2026-07-26T12:00:00.000Z",
  "uptime": 3600
}
```

---

## Error Format

All errors follow a consistent JSON envelope:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "email must be an email"
}
```

In production, `500`-level errors return a generic message; the full stack trace is logged server-side only.

---

## Rate Limits

| Route | Limit | Window |
|---|---|---|
| All routes (default) | 120 requests | 60 seconds |
| `GET /reader/:bookId/pages/:page` | 60 requests | 60 seconds |
| `GET /downloads/:bookId` | 10 requests | 60 seconds |

Rate limit responses use HTTP `429 Too Many Requests`.
