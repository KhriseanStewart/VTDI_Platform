# Supabase setup (OutYah)

Updated: **19 August 2026**

## 1. Run schema (required once)

1. Open your project SQL editor in the [Supabase dashboard](https://supabase.com/dashboard).
2. Apply migrations **in order**:

| File | Purpose |
|------|---------|
| [`001_init.sql`](./001_init.sql) | Core tables, RLS, `media` storage bucket |
| [`002_events_schedule.sql`](./002_events_schedule.sql) | Event `starts_at` / `ends_at` / recurring columns |
| [`003_place_reviews.sql`](./003_place_reviews.sql) | `place_reviews` table + review_count trigger |
| [`004_shared_plans.sql`](./004_shared_plans.sql) | Public share links for outing plans |

**Or** paste [`full_setup.sql`](./full_setup.sql) for schema + legacy sample rows + migrations 002/003 appended.

> **For course submission:** submit `full_setup.sql` and this folder. The live production app uses the seed scripts below, not the legacy mock rows in `seed.sql`.

See [`CATALOG.md`](./CATALOG.md) for current live data totals (49 places, 53 events, 198 reviews).

## 2. Auth settings

In **Authentication → Providers → Email**:

- Enable Email provider
- For local/demo speed, you can disable **Confirm email**

## 3. Create an admin

1. Sign up in the app at `/auth`
2. In SQL Editor:

```sql
update profiles
set role = 'admin'
where id = '<your-user-uuid>';
```

Or by email:

```sql
update profiles
set role = 'admin'
where id = (
  select id from auth.users where email = 'you@example.com'
);
```

3. Open `/admin` (admin links also appear in the main nav when `role = admin`)

## 4. Vercel env vars

Add these in the Vercel project settings (Production + Preview):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GOOGLE_MAPS_API_KEY`

Server-only (local scripts — **never** ship to the browser):

- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL` (optional, for DDL migration scripts)

Redeploy after saving.

## 5. Live data scripts (production catalog)

```bash
# Island-wide places (Negril, MoBay, Ochi, Portland, etc.) + 6-month events
bun scripts/seed_jamaica_catalog.mjs

# Google photos → Supabase Storage (island venues)
bun scripts/seed_jamaica_island_photos.mjs

# Google photos (Kingston metro venues)
bun scripts/seed_place_photos_from_google.mjs

# Google-only reviews → place_reviews
bun scripts/seed_real_place_reviews.mjs
```

Legacy Kingston-only scripts (still valid):

```bash
bun scripts/seed_kingston_places.mjs
bun scripts/seed_jamaica_events.mjs
```

## 6. Database tables

| Table | Description |
|-------|-------------|
| `profiles` | User profile + `role` (`user` \| `admin`), 1:1 with `auth.users` |
| `places` | Venues: lat/lng, images, hours, rating, parish (`area`) |
| `place_reviews` | Source-tagged reviews (`google`, `outyah`, etc.) |
| `events` | Scheduled events; optional FK to `places` |
| `posts` | Instagram-style media posts |
| `post_comments` | Comments on posts |
| `favorites` | User ↔ place saves |
| `plan_stops` | Ordered outing plan stops |

## 7. Review model notes

- `place_reviews.source` ∈ `outyah`, `google`, `instagram`, `tripadvisor`, `yelp`
- Public can read all reviews; authenticated users may insert **OutYah** reviews only
- Venue UI badges show **via Google** / **via OutYah**, etc.
- Instagram has no public venue-review API — IG remains posts/media only
- No invented RSVP, like, or attendee counts on events

Never commit the service role key. The anon key is safe for the browser when RLS is enabled.
