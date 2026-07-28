# Screenshots & Demo — EngineerYa

> This document contains screenshots, GIF demos, and UI walkthroughs for the EngineerYa platform.

---

## Table of Contents

- [Landing Page & Hero Section](#landing-page--hero-section)
- [Library Catalog](#library-catalog)
- [Book Detail View](#book-detail-view)
- [Secure Document Reader](#secure-document-reader)
- [Membership & Pricing](#membership--pricing)
- [Development Roadmap Timeline](#development-roadmap-timeline)
- [Admin Dashboard](#admin-dashboard)
- [Mobile Responsive Layouts](#mobile-responsive-layouts)

---

> [!NOTE]
> Screenshots will be captured post-launch and published here. The portal is currently live at [http://localhost:3000](http://localhost:3000) when running locally. Follow the [Deployment Guide](deployment.md) to stand up the stack.

---

## Landing Page & Hero Section

The landing page features a full-width dark-mode hero with animated gradient text, call-to-action buttons for the catalog and membership plans, featured textbook grid, pricing tiers, and an interactive development timeline.

```
┌─────────────────────────────────────────────────┐
│  EngineerYa                    Sign In  Get Started │
│─────────────────────────────────────────────────│
│                                                   │
│        Version 0.1.0 Release  •                   │
│                                                   │
│     The Digital Library for                       │
│     Modern Engineers                              │
│                                                   │
│   Discover, read, and own engineering textbooks.  │
│   Secure watermarked reader, offline downloads.   │
│                                                   │
│  ┌──────────────────┐  ┌───────────────────────┐ │
│  │ Explore Catalog  │  │   Membership Plans    │ │
│  └──────────────────┘  └───────────────────────┘ │
└─────────────────────────────────────────────────┘
```

**Design highlights:**
- Radial gradient glow effects behind the hero text
- Indigo/purple/pink gradient text for the headline
- Badge with animated pulse dot for release version
- Smooth hover scale animations on CTAs

---

## Library Catalog

The catalog page (`/books`) provides real-time client-side filtering by discipline and keyword search, a responsive grid layout, and discipline-coded color tags.

```
┌─────────────────────────────────────────────────┐
│  Library Catalog               🔍 Search...       │
│─────────────────────────────────────────────────│
│  [All] [Software] [Electrical] [Mechanical] ...  │
│─────────────────────────────────────────────────│
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐        │
│  │📚    │  │📚    │  │📚    │  │📚    │        │
│  │      │  │      │  │      │  │      │        │
│  │ DB   │  │ MSvc │  │ Sgnl │  │ Flgt │        │
│  │─────│  │─────│  │─────│  │─────│        │
│  │$49   │  │$59   │  │$69   │  │$89   │        │
│  └──────┘  └──────┘  └──────┘  └──────┘        │
└─────────────────────────────────────────────────┘
```

---

## Book Detail View

The book detail page (`/books/:slug`) shows the cover panel, author metadata, page count, a full description, and two call-to-action buttons: **Read Preview Pages** and **Buy Textbook** (integrates with Midtrans Snap popup).

```
┌─────────────────────────────────────────────────┐
│  ← Back to Catalog                               │
│─────────────────────────────────────────────────│
│  ┌──────────┐    [Software]                      │
│  │          │                                    │
│  │  📚      │    Modern Database Internals        │
│  │          │    by Alex Petrov, Martin Kleppmann │
│  │ENGINEERYA│                                    │
│  │TEXTBOOK  │    Pages: 384 | Published: 2024     │
│  │          │                                    │
│  └──────────┘    An in-depth guide to storage    │
│                  engines, index structures...    │
│                                                  │
│  PRICE                                           │
│  $49.00       [Read Preview]  [Buy Textbook]     │
└─────────────────────────────────────────────────┘
```

---

## Secure Document Reader

The reader (`/reader/:bookId`) renders individual book pages as watermarked JPEGs streamed from the API. The watermark is composited server-side using `sharp` — unique per user, per session, per request. A page navigation bar allows moving through pages with keyboard-friendly buttons.

```
┌─────────────────────────────────────────────────┐
│  ← | Book: Modern DB Internals  ◀  pg 7/384  ▶  [Unlock Full] │
│─────────────────────────────────────────────────│
│                                                  │
│     ┌──────────────────────────────────────┐    │
│     │ EngineerYa Academic Preview      Sec 3│    │
│     │─────────────────────────────────────│    │
│     │                                      │    │
│     │  Chapter 2: B-Tree Index Structures  │    │
│     │                                      │    │
│     │  The B-Tree is the default index...  │    │
│     │                                      │    │
│     │   ╱ ╱ demo@engineerya.com ╱ ╱        │    │
│     │   ╱ TRACEID_XYZ ╱ ╱ ╱ ╱ ╱ ╱         │    │
│     │                                      │    │
│     │─────────────────────────────────────│    │
│     │ Page 7 of 384    Session: WS_abc123  │    │
│     └──────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

**Security features visible in the UI:**
- Diagonal watermark tiles (user email + trace ID)
- Session ID footer for traceability
- No download button (prevented at the HTTP response level)
- Rate-limited to 60 page requests / minute

---

## Membership & Pricing

The pricing section (`/#pricing`) displays three tiers: **Student**, **Professional** (highlighted), and **Enterprise**. The most popular tier is visually distinguished with an indigo border and badge.

```
┌─────────────────────────────────────────────────┐
│         Simple, Predictable Memberships           │
│─────────────────────────────────────────────────│
│  ┌───────────┐  ┌────────────┐  ┌────────────┐  │
│  │  Student  │  │ ✦ Popular  │  │ Enterprise │  │
│  │  $9.99/mo │  │Professional│  │   Custom   │  │
│  │           │  │ $24.99/mo  │  │            │  │
│  │ ✓ Reading │  │ ✓ Reading  │  │ ✓ Multi-   │  │
│  │ ✓ Bookmarks│  │ ✓ Bookmarks│  │   seat     │  │
│  │ ✗ Downloads│  │ ✓ 2 DLs/mo│  │ ✓ SSO      │  │
│  │           │  │            │  │            │  │
│  │ Subscribe │  │ Subscribe  │  │ Contact Us │  │
│  └───────────┘  └────────────┘  └────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## Development Roadmap Timeline

The roadmap section (`/#roadmap`) renders a vertical timeline showing all 12 completed phases and the upcoming phases, with an animated pulse indicator on the active phase.

```
      ●  Phase 1-4: Foundational Architecture
      |
      ●  Phase 5-7: Watermarked Reader & Sync
      |
      ●  Phase 8-9: Commerce & Memberships
      |
    ◉ (pulse)  Phase 10-12: Admin & Launch  ← Active
      |
      ○  Phase 13: EPUB Reader Support
      |
      ○  Phase 14: AI Reading Annotations
```

---

## Admin Dashboard

> Available after login with an `ADMIN` role account.

The admin area provides:
- **Book management**: Create, edit, publish/archive books and trigger PDF rendering jobs
- **Category management**: Nested category tree with slug generation
- **User management**: View all users, promote roles
- **Analytics overview**: Revenue, active memberships, purchase counts
- **Audit log viewer**: Filterable log of all admin mutations

---

## Mobile Responsive Layouts

All pages are fully responsive. On mobile:
- Navbar collapses to a hamburger menu
- Catalog grid drops to single column
- Book detail stacks cover above metadata
- Reader controls pin to top with full-width page canvas
- Pricing cards stack vertically

---

## Running the Demo Locally

```bash
# Clone and setup
git clone https://github.com/dafawiradp/EngineerYa.git
cd EngineerYa/engineerya
cp .env.example .env
npm install
docker compose up -d postgres redis meilisearch
npm run db:generate

# Open two terminals:
npm run dev:api   # Terminal 1
npm run dev:web   # Terminal 2

# Visit:
open http://localhost:3000
```

The demo runs entirely locally. No external API keys are required for the catalog and reader preview. Payment flows require Midtrans Sandbox credentials (see [Deployment Guide](deployment.md#midtrans)).
