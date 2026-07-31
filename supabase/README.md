# Supabase setup (OutYah)

## 1. Run schema + seed (required once)

1. Open your project: https://supabase.com/dashboard/project/ervmrunpppfhogopjfcf/sql
2. Paste and run the contents of [`full_setup.sql`](./full_setup.sql)
   - Or run [`migrations/001_init.sql`](./migrations/001_init.sql) then [`seed.sql`](./seed.sql)

This creates tables, RLS policies, the `media` storage bucket, and seeds places/events/posts.

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

3. Open `/admin`

## 4. Vercel env vars

Add these in the Vercel project settings (Production + Preview):

- `VITE_SUPABASE_URL` = `https://ervmrunpppfhogopjfcf.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = (your anon key)
- `VITE_GOOGLE_MAPS_API_KEY` = (your Maps key)

Redeploy after saving.

## 5. Regenerate seed from mock data

```bash
bun run scripts/generate_seed_sql.mjs
cat supabase/migrations/001_init.sql supabase/seed.sql > supabase/full_setup.sql
```

Never commit the service role key. The anon key is safe for the browser when RLS is enabled.
