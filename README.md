# OutYah

Jamaica outing discovery platform — image-forward feed, map view, favorites, outing planner, events, and a Supabase-backed admin portal.

## Stack

- React + Vite + React Router
- Supabase (Auth, Postgres, RLS, Storage)
- Google Maps (`@react-google-maps/api`)

## Local setup

```bash
bun install
cp .env.example .env   # fill keys
bun run dev
```

Required env vars (see `.env.example`):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GOOGLE_MAPS_API_KEY`

## Supabase (one-time)

Follow **[supabase/README.md](supabase/README.md)**:

1. Run `supabase/full_setup.sql` in the Supabase SQL Editor
2. Sign up at `/auth`
3. Promote yourself to admin with SQL (`profiles.role = 'admin'`)
4. Open `/admin`

Until the SQL is run, the app shows empty states (no local mock database).

### Live catalog (production)

After schema apply, populate island-wide data:

```bash
bun scripts/seed_jamaica_catalog.mjs
bun scripts/seed_jamaica_island_photos.mjs
bun scripts/seed_real_place_reviews.mjs
```

See [`docs/database/CATALOG.md`](docs/database/CATALOG.md) for current totals (49 places, 53 events, 198 reviews).

## Vercel

Set the same `VITE_*` variables in the Vercel project, then redeploy. SPA rewrites live in `vercel.json`.

## Course deliverables (Weeks 3–5)

PDFs and database scripts live in [`docs/`](docs/):

| Week | Deliverable | File |
|------|-------------|------|
| 3 | System Design | `docs/03_OutYah_System_Design_Document.pdf` |
| 4 | Prototype Version 1 | `docs/04_OutYah_Prototype_Version_1.pdf` |
| 5 | Beta Version | `docs/05_OutYah_Beta_Version_Notes.pdf` |
| — | Database script | `docs/database/full_setup.sql` (+ `CATALOG.md`) |

Regenerate docs: `python scripts/generate_course_docs.py` (needs fpdf2).
