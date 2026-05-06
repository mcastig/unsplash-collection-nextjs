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
- **Redux Toolkit** + **react-redux** (`src/store/`)
- **CSS Modules** (`.module.css` per component) — no Tailwind, no CSS-in-JS
- **PostgreSQL** via Neon (cloud) or Docker local — `DATABASE_URL` in `.env.local`
- **Unsplash API** — `UNSPLASH_ACCESS_KEY` (server) + `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY` (client)
- Font: **Be Vietnam Pro** via `@import` in `globals.css`

## Path alias

`@/*` → `src/*` (configured in `tsconfig.json`).

## Environment files

| File | Loaded when |
|---|---|
| `.env.development` | `npm run dev` — points to local Docker DB |
| `.env.production` | `npm run build` / `npm run start` — points to Neon |
| `.env.local` | Always, overrides both — holds the active `DATABASE_URL` |

`.env.local` is gitignored. The other two are committed as templates.

## Database

Two tables. Schema lives in `init.sql` (auto-run by Docker on first start).

```sql
collections (id, name, created_at)
collection_images (id, collection_id, image_id, image_url, image_thumb_url, image_small_url,
                   photographer_name, photographer_username, photographer_avatar,
                   published_at, created_at, UNIQUE(collection_id, image_id))
```

**Local Docker:** `docker compose up -d` → PostgreSQL on `localhost:5432`.  
**Neon:** connection string format: `postgresql://...@...neon.tech/neondb?sslmode=require`.  
`src/lib/db.ts` skips SSL automatically when `DATABASE_URL` contains `localhost`.

## Architecture

### Pages

| Route | File | Purpose |
|---|---|---|
| `/` | `src/app/page.tsx` | Homepage — `hero-image.png` background, centered search input |
| `/search` | `src/app/search/page.tsx` | Search results — gradient sticky banner, masonry grid |
| `/images/[id]` | `src/app/images/[id]/page.tsx` | Image detail — author, date, collections, add/remove/download |
| `/collections` | `src/app/collections/page.tsx` | Collections grid — create, delete (hover trash icon) |
| `/collections/[id]` | `src/app/collections/[id]/page.tsx` | Collection detail — masonry photo grid |

### API Routes (`src/app/api/`)

| Endpoint | Purpose |
|---|---|
| `GET/POST /api/collections` | List all / create collection |
| `GET/DELETE /api/collections/[id]` | Fetch or delete a collection |
| `GET/POST /api/collections/[id]/images` | List / add images in collection |
| `DELETE /api/collections/[id]/images/[imageId]` | Remove image from collection |
| `GET /api/collections/by-image/[imageId]` | All collections containing an image |
| `GET /api/unsplash/search?q=&page=` | Proxy Unsplash search |
| `GET /api/unsplash/photos/[id]` | Proxy Unsplash photo detail |
| `GET /api/unsplash/photos/[id]/download` | Trigger Unsplash download event |

### Redux Store (`src/store/`)

- `searchSlice` — query string, search results, loading/error state
- `collectionsSlice` — collections list, selected collection, collection images; thunks for all CRUD
- `imageSlice` — current image detail, which collections it belongs to
- `StoreProvider.tsx` — wraps the app in `<Provider>`, mounted in `layout.tsx`

### Components (`src/components/`)

Each lives in its own folder: `Component.tsx` + `Component.module.css` + `Component.test.tsx`.

| Component | Description |
|---|---|
| `Header` | Sticky nav — logo, Home/Collections links, light/dark toggle |
| `SearchInput` | Controlled input; submits on Enter if value is non-empty |
| `ImageCard` | Photo tile with hover overlay; links to `/images/[id]` |
| `ImageGrid` | 3-column masonry layout using CSS `columns` |
| `CollectionCard` | Collection tile with cover image; hover shows trash delete button |
| `HeroBackground` | Decorative tile grid (homepage background) |
| `AddToCollectionModal` | Searchable collection list; hides collections the image already belongs to |
| `NewCollectionModal` | Name input form to create a new collection |

### Theming

Toggle via `data-theme` attribute on `<html>`, set in `Header.tsx`, persisted in `localStorage`.

CSS variables in `globals.css`:

```css
--color-bg      /* page background   */
--color-surface /* cards, inputs     */
--color-border  /* dividers          */
--color-text    /* primary text      */
--color-muted   /* secondary text    */
```

Gradient: `linear-gradient(to right, #F2C593, #8A3282)` — use the `.gradient-text` utility class for text.

### CSS conventions

- All component styles use **CSS Modules** (`.module.css`) — never plain `.css` imports inside components
- Global styles and utility classes live in `src/app/globals.css`
- No Tailwind, no inline styles, no CSS-in-JS
