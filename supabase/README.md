# Supabase setup (OutYah)

Updated: **19 August 2026**

## 1. Run schema (required once)

1. Open your project: https://supabase.com/dashboard/project/ervmrunpppfhogopjfcf/sql
2. Apply migrations in order:
   - [`migrations/001_init.sql`](./migrations/001_init.sql)
   - [`migrations/002_events_schedule.sql`](./migrations/002_events_schedule.sql)
   - [`migrations/003_place_reviews.sql`](./migrations/003_place_reviews.sql)
   - [`migrations/004_shared_plans.sql`](./migrations/004_shared_plans.sql)
   - [`migrations/005_post_moderation.sql`](./migrations/005_post_moderation.sql)
   - [`migrations/006_event_chat.sql`](./migrations/006_event_chat.sql)
   - [`migrations/007_catalog_created_by.sql`](./migrations/007_catalog_created_by.sql)
   - [`migrations/008_user_moderation.sql`](./migrations/008_user_moderation.sql)

   **Or** paste and run [`full_setup.sql`](./full_setup.sql) (schema + legacy sample seed + migrations 002/003), then apply 004–008 on top.

After 006, confirm Realtime is on for the table: **Database → Replication → `supabase_realtime`** should list `event_messages`. The migration adds it automatically; the dashboard is just a sanity check.

This creates tables, RLS policies, the `media` storage bucket, and optional legacy sample rows.

## 2. Populate live catalog (recommended)

The production app uses real Jamaica data via seed scripts — see [`docs/database/CATALOG.md`](../docs/database/CATALOG.md).

```bash
bun scripts/seed_jamaica_catalog.mjs          # 49 places + 53 events
bun scripts/seed_jamaica_island_photos.mjs    # Google photos (island)
bun scripts/seed_place_photos_from_google.mjs # Google photos (Kingston)
bun scripts/seed_real_place_reviews.mjs       # Google reviews
```

Requires `SUPABASE_SERVICE_ROLE_KEY` and `VITE_GOOGLE_MAPS_API_KEY` in `.env`.

## 3. Auth settings

In **Authentication → Providers → Email**:

- Enable Email provider
- For local/demo speed, you can disable **Confirm email**

## 4. Create an admin

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

3. Open `/admin`

## 5. Vercel env vars

Add these in the Vercel project settings (Production + Preview):

- `VITE_SUPABASE_URL` = `https://ervmrunpppfhogopjfcf.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = (your anon key)
- `VITE_GOOGLE_MAPS_API_KEY` = (your Maps key)

Redeploy after saving.

Never commit the service role key. The anon key is safe for the browser when RLS is enabled.
