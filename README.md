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

## Vercel

Set the same `VITE_*` variables in the Vercel project, then redeploy. SPA rewrites live in `vercel.json`.

## Course deliverables (through July 31)

PDFs and database scripts live in [`docs/`](docs/):

| Week | Deliverable | File |
|------|-------------|------|
| 1 | Project Proposal | `docs/01_OutYah_Project_Proposal.pdf` |
| 2 | SRS | `docs/02_OutYah_Software_Requirements_Specification.pdf` |
| 3 | System Design | `docs/03_OutYah_System_Design_Document.pdf` |
| 4–5 | Prototype → Beta | live app + `docs/05_OutYah_Beta_Version_Notes.pdf` |
| Practice | Weekly reports 1–5 | `docs/04_OutYah_Weekly_Progress_Reports_Weeks_1-5.pdf` |
| — | Database script | `docs/database/full_setup.sql` |

Regenerate docs: `python scripts/generate_course_docs.py` (needs fpdf2).
