# Deployment Guide — EngineerYa (Phase 0–11 complete)

This is the concrete "how to actually publish this" checklist. I've prepared everything that can be prepared without your credentials; the steps below are what you do with those credentials.

---

## Step 0 — Before you start: what you need to create accounts for

| Service | What it's for | Where |
|---|---|---|
| A VPS (DigitalOcean, Hetzner, etc.) **or** Railway/Render | Hosts the API, Postgres, Redis, Meilisearch, and the rendering worker | — |
| Vercel | Hosts the Next.js frontend | vercel.com |
| Cloudflare | R2 bucket for book files/pages | dash.cloudflare.com |
| Google Cloud Console | OAuth login | console.cloud.google.com |
| Midtrans | Payments | midtrans.com |
| A domain name | e.g. `engineerya.com` | any registrar |

---

## Step 1 — Get the code onto a server

```bash
git init && git add -A && git commit -m "EngineerYa Phase 0-11"
git remote add origin <your-empty-github-repo-url>
git push -u origin main
```

(If you don't have a GitHub repo yet, create an empty one first — don't initialize it with a README, or the push will conflict.)

---

## Step 2 — Provision Cloudflare R2

1. Cloudflare dashboard → R2 → Create bucket → name it `engineerya-books`
2. R2 → Manage API tokens → Create API token (Object Read & Write, scoped to that bucket)
3. Note down: Account ID, Access Key ID, Secret Access Key

---

## Step 3 — Set up Google OAuth

1. Google Cloud Console → APIs & Services → Credentials → Create OAuth client ID (Web application)
2. Authorized redirect URI: `https://api.yourdomain.com/api/v1/auth/google/callback`
3. Note down: Client ID, Client Secret

---

## Step 4 — Set up Midtrans

1. Register at midtrans.com, get your **Sandbox** keys first (switch to production keys later once you've tested end-to-end)
2. Settings → Configuration → Payment Notification URL: `https://api.yourdomain.com/api/v1/payments/webhook`

---

## Step 5 — Deploy the backend (VPS, recommended)

On a fresh VPS (Ubuntu 22.04+):

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Clone your repo
git clone <your-repo-url> engineerya && cd engineerya

# Configure environment
cp .env.example .env
nano .env   # fill in every value from Steps 2-4, plus:
            # JWT_ACCESS_SECRET / JWT_REFRESH_SECRET: generate with
            # `openssl rand -base64 48` (do this twice, once for each)
            # DATABASE_URL: leave as-is if using the bundled Postgres,
            # or point to a managed DB
            # API_URL / WEB_URL: your real domains

# Bring up the stack
docker compose up -d --build

# Apply the database schema
docker compose exec api npx prisma migrate deploy --schema=/app/packages/database/prisma/schema.prisma
```

Put a reverse proxy in front for TLS (Caddy is the simplest — it gets Let's Encrypt certs automatically):

```bash
# /etc/caddy/Caddyfile
api.yourdomain.com {
  reverse_proxy localhost:4000
}
```

`sudo systemctl reload caddy` after editing. Point your domain's DNS A record at the VPS's IP first.

---

## Step 6 — Deploy the frontend (Vercel)

1. vercel.com → New Project → import your GitHub repo
2. **Root Directory**: `apps/web`
3. Environment variables: `API_URL=https://api.yourdomain.com`
4. Deploy. Point `yourdomain.com` at Vercel via the DNS instructions it gives you.

---

## Step 7 — Verify it actually works, in this order

1. `curl https://api.yourdomain.com/api/v1/health` → should return `{"status":"ok",...}`
2. Register a user via the frontend → check `docker compose logs api` for errors
3. Log in as that user, promote them to ADMIN directly in the DB for your first admin:
   ```bash
   docker compose exec postgres psql -U engineerya -d engineerya \
     -c "UPDATE users SET role='ADMIN' WHERE email='you@example.com';"
   ```
4. As admin: create a category, upload a book (PDF), trigger rendering, confirm pages appear
5. Make a **sandbox** Midtrans purchase end-to-end, confirm the webhook fires and entitlement is granted (check `docker compose logs api` for "Purchase ... paid")
6. Only after that works: switch Midtrans to production keys in `.env`, `docker compose up -d` to restart with the new config

---

## Step 8 — Ongoing

- CI (`.github/workflows/ci.yml`) already lints/builds/tests every push. Tell me your hosting choice and I'll add a deploy job that runs automatically on merge to `main`.
- Set up backups for Postgres (most managed DB providers do this automatically; on a raw VPS, `pg_dump` on a cron job).
- Monitor `docker compose logs -f` initially; consider adding a log aggregator (even just shipping to a file + `logrotate`) before real traffic.

---

## What I genuinely cannot do for you
Every step above that says "note down your keys" or "create an account" requires you to click through a UI with your own identity and payment method. I can't do that from here — but I can debug any specific error you hit while following these steps, or write the exact CI/CD job once you've picked a host.
