-- User moderation: ban accounts and manage roles from the admin portal.
-- Bans are enforced in RLS (not just the UI) via public.is_banned().

alter table public.profiles
  add column if not exists banned_at timestamptz,
  add column if not exists ban_reason text,
  add column if not exists banned_by uuid references auth.users (id) on delete set null;

create index if not exists profiles_banned_idx
  on public.profiles (banned_at desc nulls last);

create index if not exists profiles_role_idx
  on public.profiles (role, created_at desc);

-- True when the signed-in user has an active ban.
create or replace function public.is_banned()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select p.banned_at is not null
      from public.profiles p
      where p.id = auth.uid()
    ),
    false
  );
$$;

-- Admins must not be banned; regular writes require an active account.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
      and p.banned_at is null
  );
$$;

create or replace function public.guard_profile_update()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_count int;
begin
  if public.is_admin() then
    if old.id = auth.uid() and new.banned_at is not null and old.banned_at is null then
      raise exception 'Admins cannot ban their own account';
    end if;

    if old.role = 'admin' and new.role is distinct from 'admin' then
      select count(*)::int into admin_count
      from public.profiles
      where role = 'admin' and banned_at is null and id <> old.id;

      if admin_count = 0 then
        raise exception 'Cannot demote the last active admin';
      end if;
    end if;

    return new;
  end if;

  if new.role is distinct from old.role then
    raise exception 'Cannot change role';
  end if;

  if new.banned_at is distinct from old.banned_at
     or new.ban_reason is distinct from old.ban_reason
     or new.banned_by is distinct from old.banned_by then
    raise exception 'Cannot change ban status';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_guard_update on public.profiles;
create trigger profiles_guard_update
  before update on public.profiles
  for each row execute function public.guard_profile_update();

-- Block banned users from mutating app data ----------------------------------

drop policy if exists "Favorites own insert" on public.favorites;
create policy "Favorites own insert"
  on public.favorites for insert
  with check (auth.uid() = user_id and not public.is_banned());

drop policy if exists "Favorites own delete" on public.favorites;
create policy "Favorites own delete"
  on public.favorites for delete
  using (auth.uid() = user_id and not public.is_banned());

drop policy if exists "Plan own insert" on public.plan_stops;
create policy "Plan own insert"
  on public.plan_stops for insert
  with check (auth.uid() = user_id and not public.is_banned());

drop policy if exists "Plan own update" on public.plan_stops;
create policy "Plan own update"
  on public.plan_stops for update
  using (auth.uid() = user_id and not public.is_banned());

drop policy if exists "Plan own delete" on public.plan_stops;
create policy "Plan own delete"
  on public.plan_stops for delete
  using (auth.uid() = user_id and not public.is_banned());

drop policy if exists "Reviews user insert" on public.place_reviews;
create policy "Reviews user insert"
  on public.place_reviews for insert
  with check (
    auth.uid() is not null
    and not public.is_banned()
    and source = 'outyah'
    and user_id = auth.uid()
  );

drop policy if exists "Reviews owner delete" on public.place_reviews;
create policy "Reviews owner delete"
  on public.place_reviews for delete
  using (auth.uid() is not null and not public.is_banned() and user_id = auth.uid());

drop policy if exists "Shared plans public insert" on public.shared_plans;
create policy "Shared plans public insert"
  on public.shared_plans for insert
  with check (
    jsonb_typeof(place_ids) = 'array'
    and jsonb_array_length(place_ids) > 0
    and jsonb_array_length(place_ids) <= 30
    and (auth.uid() is null or not public.is_banned())
  );

drop policy if exists "Shared plans owner delete" on public.shared_plans;
create policy "Shared plans owner delete"
  on public.shared_plans for delete
  using (auth.uid() is not null and not public.is_banned() and created_by = auth.uid());

drop policy if exists "Posts user submit" on public.posts;
create policy "Posts user submit"
  on public.posts for insert
  with check (
    auth.uid() is not null
    and not public.is_banned()
    and submitted_by = auth.uid()
    and status = 'pending'
  );

drop policy if exists "Event rsvps owner write" on public.event_rsvps;
create policy "Event rsvps owner write"
  on public.event_rsvps for all
  using (user_id = auth.uid() and not public.is_banned())
  with check (user_id = auth.uid() and not public.is_banned());

drop policy if exists "Event messages rsvp insert" on public.event_messages;
create policy "Event messages rsvp insert"
  on public.event_messages for insert
  with check (
    user_id = auth.uid()
    and not public.is_banned()
    and public.has_rsvp(event_id)
  );

drop policy if exists "Event messages author delete" on public.event_messages;
create policy "Event messages author delete"
  on public.event_messages for delete
  using (
    public.is_admin()
    or (user_id = auth.uid() and not public.is_banned())
  );

drop policy if exists "Media user submission upload" on storage.objects;
create policy "Media user submission upload"
  on storage.objects for insert
  with check (
    bucket_id = 'media'
    and auth.uid() is not null
    and not public.is_banned()
    and (storage.foldername(name))[1] = 'submissions'
  );
