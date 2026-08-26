# Live catalog (production Supabase)

Updated: **26 August 2026**

The live app at [vtdi-platform.vercel.app](https://vtdi-platform.vercel.app) is populated via seed scripts (not `seed.sql` mock rows).

## Current totals

| Table | Count | Notes |
|-------|------:|-------|
| `places` | **49** | Kingston metro + island-wide tourist attractions |
| `events` | **53** | Aug 2026 – Feb 2027 calendar |
| `place_reviews` | **198** | Google Place Details snippets only |
| `posts` | 0 | Admin-managed Instagram-style posts |

## Places by parish

| Parish | Count | Examples |
|--------|------:|----------|
| Kingston | 16 | Devon House, Bob Marley Museum, Emancipation Park, Fort Charles |
| Westmoreland | 7 | Rick's Café, Seven Mile Beach, The Cliff, Mayfield Falls |
| St. James | 5 | Doctor's Cave, Rose Hall, Margaritaville, Pier 1 |
| St. Ann | 5 | Dunn's River Falls, Mystic Mountain, Dolphin Cove |
| Portland | 5 | Frenchman's Cove, Blue Lagoon, Boston Jerk, Reach Falls |
| St. Elizabeth | 5 | YS Falls, Floyd's Pelican Bar, Treasure Beach, Appleton Estate |
| Trelawny | 3 | Falmouth Historic District, Good Hope Estate, Luminous Lagoon |
| St. Andrew | 2 | Blue Mountain Coffee Tour, Holywell Recreation Area |
| St. Catherine | 1 | Hellshire Beach |

Categories: `restaurant`, `bar`, `cafe`, `attraction`, `beach`, `movies`, `gaming`.

## Events calendar (6 months)

Island-wide festivals and recurring venue nights, including:

- **Negril** — Sunset Festival, Full Moon Beach Party, Reggae Marathon, NYE Cliff Party
- **Montego Bay** — Jerk Festival, Reggae Festival, NYE at Margaritaville
- **Ocho Rios** — Dunn's River concert series, Food & Wine Festival
- **Portland** — Jerk Festival preview + main event, Blue Lagoon tours
- **Kingston** — Restaurant Week, Heroes Day, Christmas Market, Grand Market, Reggae Month
- **South coast** — Rebel Salute, Accompong Maroon Festival, Treasure Beach fish fry
- **Trelawny** — Jazz & Blues Festival, Luminous Lagoon night tours, Falmouth Heritage Day

Events use `starts_at`, `ends_at`, `recurring`, and `recurrence_note` (migration 002). UI shows **Upcoming**, **Happening now**, and **Past** badges.

## Reviews

- Stored in `place_reviews` (migration 003)
- Sources: `google`, `outyah`, `instagram`, `tripadvisor`, `yelp`
- Live data: **Google only** via `scripts/seed_real_place_reviews.mjs`
- Trigger `refresh_place_review_stats` keeps `places.review_count` in sync
- Place card ratings use Google aggregates when synced

## How to reproduce live data

Requires `.env` with `VITE_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VITE_GOOGLE_MAPS_API_KEY`, and optionally `DATABASE_URL`.

```bash
# Schema (once) — run in Supabase SQL Editor or via apply script
# docs/database/001_init.sql → … → 008_user_moderation.sql
# or docs/database/full_setup.sql, then apply 004–008 if needed

# Island-wide catalog (places + events)
bun scripts/seed_jamaica_catalog.mjs

# Google photos for new island venues (Storage bucket: media)
bun scripts/seed_jamaica_island_photos.mjs

# Kingston venue photos (existing script)
bun scripts/seed_place_photos_from_google.mjs

# Google review snippets into place_reviews
bun scripts/seed_real_place_reviews.mjs
```

## Data files (source of truth for seeds)

| File | Purpose |
|------|---------|
| `scripts/data/jamaica_places.mjs` | 36 island tourist places |
| `scripts/data/jamaica_events.mjs` | 48 scheduled events (Aug 2026 – Feb 2027) |
| `scripts/seed_kingston_places.mjs` | Original Kingston metro venues |
