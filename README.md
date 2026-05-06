# UnsplashBox

A multi-page photo collection app built with Next.js 16, React 19, Redux Toolkit, and PostgreSQL. Search high-resolution images from Unsplash, organize them into collections, and manage everything through a clean light/dark UI.

## Features

- **Search** — search Unsplash by keyword; results appear on Enter
- **Image detail** — view author, published date, and which collections an image belongs to
- **Collections** — create, browse, and delete collections
- **Add to collection** — add any image to one or more collections; already-added collections are filtered out
- **Remove from collection** — remove images from collections on the image detail page
- **Download** — download any image directly from the detail page
- **Light / Dark theme** — toggle from the header; preference persisted in `localStorage`

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, TypeScript 5 |
| State | Redux Toolkit + react-redux |
| Styling | CSS Modules, Be Vietnam Pro font |
| Database | PostgreSQL (Neon cloud or Docker local) |
| API | Unsplash REST API |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy the right template for your environment:

```bash
# Development (uses local Docker PostgreSQL by default)
cp .env.development .env.local

# Production (uses Neon cloud PostgreSQL)
cp .env.production .env.local
```

Fill in your values — at minimum `DATABASE_URL` and both Unsplash keys.

### 3. Start the database

**Option A — Docker (recommended for local dev)**

```bash
docker compose up -d
```

This spins up PostgreSQL on `localhost:5432` and auto-runs `init.sql` to create the schema.

**Option B — Neon (cloud)**

Create a project at [neon.tech](https://neon.tech), copy the connection string into `DATABASE_URL`, and run `init.sql` once against your database.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev      # start dev server (http://localhost:3000)
npm run build    # production build
npm run start    # serve production build
npm run lint     # ESLint
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
│   └── page.tsx              # Homepage
├── components/               # UI components (each with .tsx, .module.css, .test.tsx)
├── lib/
│   ├── db.ts                 # PostgreSQL connection pool
│   └── unsplash.ts           # Unsplash API client
├── store/                    # Redux store and slices
└── types/                    # Shared TypeScript types
```

## Environment Variables

| Variable | Used by | Description |
|---|---|---|
| `DATABASE_URL` | Server | PostgreSQL connection string |
| `UNSPLASH_ACCESS_KEY` | Server | Unsplash API key (server-side) |
| `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY` | Client | Unsplash API key (client-side) |
| `NEXT_PUBLIC_APP_URL` | Client | App base URL |

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

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/collections` | List all collections |
| `POST` | `/api/collections` | Create a collection |
| `GET` | `/api/collections/:id` | Get collection with cover image and count |
| `DELETE` | `/api/collections/:id` | Delete a collection |
| `GET` | `/api/collections/:id/images` | List images in a collection |
| `POST` | `/api/collections/:id/images` | Add an image to a collection |
| `DELETE` | `/api/collections/:id/images/:imageId` | Remove an image from a collection |
| `GET` | `/api/collections/by-image/:imageId` | Collections containing a specific image |
| `GET` | `/api/unsplash/search?q=&page=` | Proxy Unsplash search |
| `GET` | `/api/unsplash/photos/:id` | Proxy Unsplash photo detail |
| `GET` | `/api/unsplash/photos/:id/download` | Trigger Unsplash download event |
