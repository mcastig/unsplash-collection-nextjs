# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # start dev server at http://localhost:3000
npm run build    # production build
npm run start    # serve production build
npm run lint     # run ESLint
```

No test runner is configured yet (test files are scaffolded but Jest/Vitest is not installed).

## Stack

- **Next.js 16** App Router (`src/app/`)
- **React 19**, **TypeScript 5** (strict mode)
- **Redux Toolkit** + **react-redux** for state management (`src/store/`)
- **CSS Modules** (`.module.css` per component) — no Tailwind, no CSS-in-JS
- **PostgreSQL** via **Neon** serverless — connection string in `.env.local` as `DATABASE_URL`
- **Unsplash API** — `UNSPLASH_ACCESS_KEY` (server) + `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY` (client) in `.env.local`
- Font: **Be Vietnam Pro** loaded via `@import` in `globals.css`

## Path alias

`@/*` maps to `src/*`.

## Architecture

### Pages
| Route | File | Purpose |
|---|---|---|
| `/` | `src/app/page.tsx` | Homepage with hero background and search input |
| `/search` | `src/app/search/page.tsx` | Search results grid (reads `?q=` param) |
| `/images/[id]` | `src/app/images/[id]/page.tsx` | Image detail — author, collections, add/remove/download |
| `/collections` | `src/app/collections/page.tsx` | Collections grid, create new collection |
| `/collections/[id]` | `src/app/collections/[id]/page.tsx` | Collection detail — photos in collection |

### API Routes (`src/app/api/`)
| Endpoint | Purpose |
|---|---|
| `GET/POST /api/collections` | List all / create collection |
| `GET /api/collections/[id]` | Single collection with cover image & count |
| `GET/POST /api/collections/[id]/images` | List images in collection / add image |
| `DELETE /api/collections/[id]/images/[imageId]` | Remove image from collection |
| `GET /api/collections/by-image/[imageId]` | All collections containing a specific image |
| `GET /api/unsplash/search` | Proxy Unsplash search (`?q=&page=`) |
| `GET /api/unsplash/photos/[id]` | Proxy Unsplash photo detail |
| `GET /api/unsplash/photos/[id]/download` | Trigger Unsplash download event |

### Redux Store (`src/store/`)
- `searchSlice` — Unsplash search query, results, loading state
- `collectionsSlice` — collections list, selected collection, collection images, CRUD actions
- `imageSlice` — current image detail, which collections it belongs to
- `StoreProvider.tsx` — wraps the app in `<Provider>` (mounted in `layout.tsx`)

### Components (`src/components/`)
Each component lives in its own folder with `ComponentName.tsx`, `ComponentName.module.css`, and `ComponentName.test.tsx`.

- `Header` — sticky nav bar with logo, Home/Collections links, theme toggle
- `SearchInput` — controlled input that submits on Enter if non-empty
- `ImageCard` — image tile with hover overlay; links to `/images/[id]`
- `ImageGrid` — masonry 3-column layout using CSS columns
- `CollectionCard` — collection tile with cover image; links to `/collections/[id]`
- `HeroBackground` — decorative full-screen tile grid shown on the homepage
- `AddToCollectionModal` — searchable list of collections; filters out ones the image already belongs to
- `NewCollectionModal` — simple name-input form to create a new collection

### Database Schema (Neon PostgreSQL)
```sql
collections (id, name, created_at)
collection_images (id, collection_id, image_id, image_url, image_thumb_url, image_small_url,
                   photographer_name, photographer_username, photographer_avatar, published_at, created_at)
-- UNIQUE(collection_id, image_id) prevents duplicates
```

### Theming
Light/dark theme is toggled via `data-theme` attribute on `<html>`. CSS variables are defined in `globals.css`:
- `--color-bg`, `--color-surface`, `--color-border`, `--color-text`, `--color-muted`
- Gradient text: `background: linear-gradient(to right, #F2C593, #8A3282)`; apply `.gradient-text` utility class

### CSS conventions
- Component styles use CSS Modules (`.module.css`); global/utility styles live in `src/app/globals.css`
- Do not add Tailwind or inline styles — use module classes
