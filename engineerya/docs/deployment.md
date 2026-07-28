# Deployment Guide — EngineerYa

> This guide covers local development setup, production VPS deployment, Vercel frontend hosting, and CI/CD automation.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development](#local-development)
- [Environment Variables Reference](#environment-variables-reference)
- [Production: External Services](#production-external-services)
  - [Cloudflare R2 (Object Storage)](#cloudflare-r2)
  - [Google OAuth](#google-oauth)
  - [Midtrans (Payments)](#midtrans)
- [Production: Backend on a VPS](#production-backend-on-a-vps)
- [Production: Frontend on Vercel](#production-frontend-on-vercel)
- [Production: Smoke Tests](#production-smoke-tests)
- [Alternative: Railway / Render](#alternative-railway--render)
- [CI/CD Pipeline](#cicd-pipeline)
- [Ongoing Operations](#ongoing-operations)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | ≥ 20 | Local development |
| Docker & Compose | Any current | Local service orchestration + production build |
| Git | Any | Source control |
| A domain name | — | Production TLS |

---

## Local Development

```bash
# 1. Clone
git clone https://github.com/dafawiradp/EngineerYa.git
cd EngineerYa/engineerya

# 2. Configure environment
cp .env.example .env
# Edit .env — all default values work for local dev as-is

# 3. Install workspace dependencies
npm install

# 4. Start infrastructure services
docker compose up -d postgres redis meilisearch

# 5. Generate Prisma client and run migrations
npm run db:generate

# Wait for postgres to be healthy, then:
docker compose exec postgres psql -U engineerya -d engineerya -c "SELECT 1"

# 6. Start the API
npm run dev:api        # → http://localhost:4000/api/v1/health

# 7. Start the web portal (new terminal)
npm run dev:web        # → http://localhost:3000
```

> **Poppler requirement:** The PDF rendering worker calls `pdftoppm` (from `poppler-utils`). When running the API **outside Docker**, install it:
> - Ubuntu/Debian: `sudo apt-get install poppler-utils`
> - macOS: `brew install poppler`
> - The provided `apps/api/Dockerfile` already includes `apk add poppler-utils`.

---

## Environment Variables Reference

Copy `.env.example` to `.env` and fill in the values below. Variables marked **required** will cause the API to exit at boot if missing.

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | ✅ | `development` | `development`, `test`, or `production` |
| `API_PORT` | | `4000` | Port the NestJS server listens on |
| `DATABASE_URL` | ✅ | *(see .env.example)* | PostgreSQL connection URL |
| `REDIS_URL` | ✅ | `redis://localhost:6379` | Redis connection URL |
| `MEILISEARCH_HOST` | ✅ | `http://localhost:7700` | Meilisearch host |
| `MEILISEARCH_API_KEY` | ✅ | `engineerya_dev_master_key` | Meilisearch master key |
| `JWT_ACCESS_SECRET` | ✅ | — | Min 16 chars. `openssl rand -base64 48` |
| `JWT_REFRESH_SECRET` | ✅ | — | Min 16 chars. Must differ from access secret |
| `JWT_ACCESS_EXPIRES_IN` | | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | | `7d` | Refresh token lifetime |
| `GOOGLE_CLIENT_ID` | | — | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | | — | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | | — | `https://api.yourdomain.com/api/v1/auth/google/callback` |
| `R2_ACCOUNT_ID` | | — | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | | — | R2 API token access key |
| `R2_SECRET_ACCESS_KEY` | | — | R2 API token secret key |
| `R2_BUCKET_NAME` | | `engineerya-books` | R2 bucket name |
| `R2_SIGNED_URL_TTL_SECONDS` | | `120` | Signed URL expiration |
| `MIDTRANS_SERVER_KEY` | | — | Midtrans server key |
| `MIDTRANS_CLIENT_KEY` | | — | Midtrans client key |
| `MIDTRANS_IS_PRODUCTION` | | `false` | Set to `true` for live payments |

---

## Production: External Services

### Cloudflare R2

1. Dashboard → **R2** → **Create bucket** → name it `engineerya-books`
2. **R2 → Manage API tokens** → Create token with **Object Read & Write** scoped to the bucket
3. Note `Account ID`, `Access Key ID`, `Secret Access Key`

### Google OAuth

1. [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services → Credentials → Create OAuth 2.0 Client ID** (Web application)
2. Add `https://api.yourdomain.com/api/v1/auth/google/callback` to **Authorized redirect URIs**
3. Note `Client ID` and `Client Secret`

### Midtrans

1. Register at [midtrans.com](https://midtrans.com), obtain **Sandbox** keys first
2. **Settings → Configuration → Payment Notification URL**: `https://api.yourdomain.com/api/v1/payments/webhook`
3. Once tested end-to-end, switch to Production keys in `.env`

---

## Production: Backend on a VPS

Tested on **Ubuntu 22.04+** with Docker.

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # log out + back in

# Clone the repository
git clone https://github.com/dafawiradp/EngineerYa.git engineerya
cd engineerya/engineerya

# Configure environment
cp .env.example .env
# Generate strong secrets:
echo "JWT_ACCESS_SECRET=$(openssl rand -base64 48)" >> .env
echo "JWT_REFRESH_SECRET=$(openssl rand -base64 48)" >> .env
# Edit .env and fill in all production values

# Build and start
docker compose up -d --build

# Apply database migrations
docker compose exec api npx prisma migrate deploy \
  --schema=/app/packages/database/prisma/schema.prisma
```

### TLS with Caddy (recommended)

```bash
sudo apt install -y caddy

# /etc/caddy/Caddyfile
cat <<EOF | sudo tee /etc/caddy/Caddyfile
api.yourdomain.com {
  reverse_proxy localhost:4000
}
EOF

sudo systemctl reload caddy
```

Caddy auto-provisions Let's Encrypt certificates. Point your domain's DNS `A` record to the VPS IP before running.

### First admin user

After registering via the frontend or API, promote yourself to ADMIN directly in the database:

```bash
docker compose exec postgres psql -U engineerya -d engineerya \
  -c "UPDATE users SET role='ADMIN' WHERE email='you@example.com';"
```

---

## Production: Frontend on Vercel

1. [vercel.com](https://vercel.com) → **New Project** → import your GitHub repository
2. **Framework Preset**: Next.js
3. **Root Directory**: `apps/web`
4. **Environment Variables**: Add `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`
5. Deploy. Point `yourdomain.com` to Vercel via the DNS CNAME it provides.

---

## Production: Smoke Tests

Run these in order after every deployment:

```bash
# 1. Health check
curl https://api.yourdomain.com/api/v1/health

# 2. Register a user
curl -X POST https://api.yourdomain.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test","password":"password123"}'

# 3. Log in
curl -X POST https://api.yourdomain.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 4. List books (public)
curl https://api.yourdomain.com/api/v1/books

# 5. Create a category (requires ADMIN token from step 2)
curl -X POST https://api.yourdomain.com/api/v1/admin/categories \
  -H "Authorization: Bearer <adminToken>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Software Engineering","slug":"software-engineering"}'
```

---

## Alternative: Railway / Render

Both platforms support Docker-based deployments and can provision PostgreSQL and Redis add-ons.

1. Create a new project and link the GitHub repository
2. Set the **Dockerfile path** to `apps/api/Dockerfile` for the API service
3. Add all environment variables from `.env.example` via the platform's secrets manager
4. For Meilisearch: use a managed [Meilisearch Cloud](https://cloud.meilisearch.com) instance or self-host on a separate container

---

## CI/CD Pipeline

The provided `.github/workflows/ci.yml` runs on every push to `main` or `develop`:

1. **Install**: `npm ci`
2. **Generate Prisma client**: `npm run db:generate`
3. **Lint**: `npm run lint`
4. **Type check**: `npm run typecheck`
5. **Build**: `npm run build`
6. **Test**: `npm run test`

To add automatic deployment on merge to `main`, add a deploy step to the workflow using your hosting provider's CLI or Action (e.g. `vercel/action` for the frontend, or `appleboy/ssh-action` to SSH into the VPS).

---

## Ongoing Operations

| Task | Command / Approach |
|---|---|
| View API logs | `docker compose logs -f api` |
| Database backup | `docker compose exec postgres pg_dump -U engineerya engineerya > backup.sql` |
| Migrate production DB | `docker compose exec api npx prisma migrate deploy --schema=…` |
| Restart services | `docker compose up -d` |
| Update to latest code | `git pull && docker compose up -d --build` |
| Promote user to ADMIN | SQL `UPDATE users SET role='ADMIN' WHERE email='…'` |

---

## Troubleshooting

### API won't start — "Invalid environment configuration"

The Zod config schema (`packages/config/src/index.ts`) rejected one or more environment variables. Check the error output for which field is invalid and compare against the [Environment Variables Reference](#environment-variables-reference).

### `pdftoppm: command not found` in rendering worker

The `poppler-utils` package is not installed in the API environment. If running outside Docker, install it manually. If using Docker, ensure the `Dockerfile` in `apps/api/` includes `apk add poppler-utils`.

### Meilisearch index is empty

Books are indexed via domain events — not on startup. After deployment, any `PATCH /admin/books/:id` that sets `status: PUBLISHED` will trigger the `book.upserted` event and index the book.

### Midtrans webhook not firing locally

Midtrans cannot reach `localhost`. Use [ngrok](https://ngrok.com) or a similar tunneling tool to expose your local API, then update the Payment Notification URL in the Midtrans dashboard.

```bash
ngrok http 4000
# → Copy the https URL and set it as Payment Notification URL in Midtrans
```
