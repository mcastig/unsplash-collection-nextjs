# UnsplashBox

A multi-page photo collection app built with Next.js 16, React 19, Redux Toolkit, and PostgreSQL. Search high-resolution images from Unsplash, organize them into collections, and manage everything through a clean light/dark UI.

## Features

- **Search** — search Unsplash by keyword; results appear on Enter
- **Image detail** — view author, published date, and which collections an image belongs to
- **Collections** — create, browse, and delete collections
- **Add to collection** — add any image to one or more collections; already-added collections are filtered out
- **Remove from collection** — remove images from collections on the image detail page
- **Download** — download any image directly from the detail page
- **Light / Dark theme** — toggle from the header; preference persisted in `localStorage`; logo inverts to white in dark mode
- **404 page** — custom not-found page with gradient code and Go Home link

## Tech Stack

| Layer     | Technology                                        |
| --------- | ------------------------------------------------- |
| Framework | Next.js 16 (App Router)                           |
| UI        | React 19, TypeScript 5                            |
| State     | Redux Toolkit + react-redux                       |
| Styling   | CSS Modules, Be Vietnam Pro font                  |
| Database  | PostgreSQL (Neon cloud or Docker local)           |
| API       | Unsplash REST API                                 |
| Testing   | Jest + Testing Library (248 tests, 100% coverage) |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy the right template for your environment and fill in your real credentials:

```bash
# Development (uses local Docker PostgreSQL by default)
cp .env.development .env.local

# Production (uses Neon cloud PostgreSQL)
cp .env.production .env.local
```

Fill in your values in `.env.local` — at minimum `DATABASE_URL` and the Unsplash keys.  
**Never commit `.env.local`** — it is gitignored. The `.env.development` and `.env.production` files are placeholder templates only.

### 3. Start the database

**Option A — Docker (recommended for local dev)**

```bash
docker compose up -d
```

This spins up PostgreSQL on `localhost:5432` and auto-runs `init.sql` to create the schema.

**Option B — Neon (cloud)**

Create a project at [neon.tech](https://neon.tech), copy the connection string into `DATABASE_URL` in `.env.local`, and run `init.sql` once against your database.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploying to Vercel

The app is live at **[unsplash-collection-nextjs.vercel.app](https://unsplash-collection-nextjs.vercel.app)**.

To deploy your own instance:

1. Push the repo to GitHub and import it in [vercel.com](https://vercel.com).
2. Add all required environment variables in **Vercel → Project → Settings → Environment Variables**:

| Variable | Description |
| --- | --- |
| `DATABASE_URL` | Neon connection string: `postgresql://...@...neon.tech/neondb?sslmode=require` |
| `UNSPLASH_ACCESS_KEY` | Unsplash API access key (server-only) |
| `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY` | Same key, exposed to the browser |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL, e.g. `https://your-app.vercel.app` |

3. Apply the database schema to your Neon project once — paste `init.sql` into the Neon SQL editor or run:

```bash
psql "postgresql://...@...neon.tech/neondb?sslmode=require" -f init.sql
```

4. Redeploy (or trigger a new deployment) — Vercel will pick up the env vars automatically.

> **`NEXT_PUBLIC_APP_URL` is required.** The CSRF middleware uses it to validate the `Origin` header on all mutating requests. Without it, every `POST` and `DELETE` from the browser will be rejected with 403.

## Scripts

```bash
npm run dev          # start dev server (http://localhost:3000)
npm run build        # production build
npm run start        # serve production build
npm run lint         # ESLint
npm test             # Jest unit tests
npm test -- --coverage  # tests with coverage report
```

## Project Structure

```
src/
├── app/
│   ├── api/                  # API routes (collections CRUD + Unsplash proxy)
│   ├── collections/          # Collections list and detail pages
│   ├── images/[id]/          # Image detail page
│   ├── search/               # Search results page
│   ├── globals.css           # CSS variables, theme, global reset
│   ├── layout.tsx            # Root layout (StoreProvider + Header)
│   ├── not-found.tsx         # Custom 404 page
│   └── page.tsx              # Homepage
├── components/               # UI components (each with .tsx, .module.css, .test.tsx)
├── lib/
│   ├── db.ts                 # PostgreSQL connection pool (SSL-validated)
│   ├── logger.ts             # Server-side error logger
│   ├── rateLimit.ts          # In-memory rate limiter (per client IP)
│   └── unsplash.ts           # Unsplash API client (server-only key)
├── store/                    # Redux store and slices
└── types/                    # Shared TypeScript types
middleware.ts                 # CSRF origin-checking middleware for all API mutations
```

## Environment Variables

| Variable                          | Used by | Description                                    |
| --------------------------------- | ------- | ---------------------------------------------- |
| `DATABASE_URL`                    | Server  | PostgreSQL connection string                   |
| `UNSPLASH_ACCESS_KEY`             | Server  | Unsplash API key (server-side only)            |
| `UNSPLASH_SECRET_KEY`             | Server  | Unsplash secret (for future OAuth flows)       |
| `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY` | Client  | Unsplash API key (exposed to the browser)      |
| `NEXT_PUBLIC_APP_URL`             | Both    | App base URL — used for CSRF origin validation |

## Database Schema

```sql
collections (id, name, created_at)

collection_images (
  id, collection_id, image_id,
  image_url, image_thumb_url, image_small_url,
  photographer_name, photographer_username, photographer_avatar,
  published_at, created_at,
  UNIQUE(collection_id, image_id)
)
```

## API Endpoints

| Method   | Endpoint                               | Description                               |
| -------- | -------------------------------------- | ----------------------------------------- |
| `GET`    | `/api/collections`                     | List all collections                      |
| `POST`   | `/api/collections`                     | Create a collection                       |
| `GET`    | `/api/collections/:id`                 | Get collection with cover image and count |
| `DELETE` | `/api/collections/:id`                 | Delete a collection                       |
| `GET`    | `/api/collections/:id/images`          | List images in a collection               |
| `POST`   | `/api/collections/:id/images`          | Add an image to a collection              |
| `DELETE` | `/api/collections/:id/images/:imageId` | Remove an image from a collection         |
| `GET`    | `/api/collections/by-image/:imageId`   | Collections containing a specific image   |
| `GET`    | `/api/unsplash/search?q=&page=`        | Proxy Unsplash search                     |
| `GET`    | `/api/unsplash/photos/:id`             | Proxy Unsplash photo detail               |
| `GET`    | `/api/unsplash/photos/:id/download`    | Trigger Unsplash download event           |

All mutating endpoints (`POST`, `DELETE`) are protected by CSRF origin validation and rate limiting.

## Security

| Measure          | Implementation                                                                                              |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| CSRF protection  | `middleware.ts` checks `Origin` header on all `POST`/`DELETE` requests                                      |
| Rate limiting    | In-memory limiter per client IP (reads: 30/min, writes: 10/min, search: 20/min)                             |
| Security headers | CSP, HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, Referrer-Policy, Permissions-Policy  |
| SSL              | Database connections enforce certificate validation (`ssl: true`)                                           |
| Input validation | Collection name capped at 100 chars; image fields type-checked; photo IDs validated against `[a-zA-Z0-9_-]` |
| Error handling   | Errors logged server-side in development only; clients receive generic messages                             |
| Secrets          | All credentials in `.env.local` (gitignored) — never in committed files                                     |
