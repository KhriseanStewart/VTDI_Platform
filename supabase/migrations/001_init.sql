-- OutYah initial schema + RLS
-- Run in Supabase SQL Editor, then run supabase/seed.sql

create extension if not exists "pgcrypto";

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  handle text unique,
  avatar_url text,
  bio text default '',
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.places (
  id text primary key,
  name text not null,
  category text not null,
  neighborhood text,
  area text,
  image text,
  images jsonb not null default '[]'::jsonb,
  rating numeric(3,1) default 0,
  review_count integer default 0,
  price_range integer default 1,
  currency text default 'JMD',
  tags jsonb not null default '[]'::jsonb,
  open_until text,
  open_now boolean default true,
  description text,
  amenities jsonb not null default '[]'::jsonb,
  address text,
  phone text,
  lat double precision,
  lng double precision,
  hours jsonb not null default '[]'::jsonb,
  special text,
  reviews jsonb not null default '[]'::jsonb,
  slots jsonb,
  slot_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id text primary key,
  title text not null,
  type text,
  date_label text,
  time_label text,
  venue_name text,
  place_id text references public.places (id) on delete set null,
  area text,
  image text,
  description text,
  going integer default 0,
  interested integer default 0,
  price text,
  attendees jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id text primary key,
  place_id text references public.places (id) on delete set null,
  username text not null,
  user_avatar text,
  caption text,
  media_url text not null,
  media_type text default 'IMAGE',
  permalink text,
  posted_at timestamptz default now(),
  like_count integer default 0,
  comments_count integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.post_comments (
  id text primary key,
  post_id text not null references public.posts (id) on delete cascade,
  username text not null,
  body text not null,
  posted_at timestamptz default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  place_id text not null references public.places (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, place_id)
);

create table if not exists public.plan_stops (
  user_id uuid not null references auth.users (id) on delete cascade,
  place_id text not null references public.places (id) on delete cascade,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (user_id, place_id)
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, handle, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'handle', '@' || split_part(new.email, '@', 1)),
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=' || coalesce(new.email, new.id::text)
    ),
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.places enable row level security;
alter table public.events enable row level security;
alter table public.posts enable row level security;
alter table public.post_comments enable row level security;
alter table public.favorites enable row level security;
alter table public.plan_stops enable row level security;

-- Profiles
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update using (auth.uid() = id);

drop policy if exists "Admins update any profile" on public.profiles;
create policy "Admins update any profile"
  on public.profiles for update using (public.is_admin());

-- Places / events / posts / comments: public read, admin write
drop policy if exists "Places public read" on public.places;
create policy "Places public read" on public.places for select using (true);
drop policy if exists "Places admin write" on public.places;
create policy "Places admin write" on public.places for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Events public read" on public.events;
create policy "Events public read" on public.events for select using (true);
drop policy if exists "Events admin write" on public.events;
create policy "Events admin write" on public.events for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Posts public read" on public.posts;
create policy "Posts public read" on public.posts for select using (true);
drop policy if exists "Posts admin write" on public.posts;
create policy "Posts admin write" on public.posts for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Comments public read" on public.post_comments;
create policy "Comments public read" on public.post_comments for select using (true);
drop policy if exists "Comments admin write" on public.post_comments;
create policy "Comments admin write" on public.post_comments for all using (public.is_admin()) with check (public.is_admin());

-- Favorites / plan: own rows
drop policy if exists "Favorites own select" on public.favorites;
create policy "Favorites own select" on public.favorites for select using (auth.uid() = user_id);
drop policy if exists "Favorites own insert" on public.favorites;
create policy "Favorites own insert" on public.favorites for insert with check (auth.uid() = user_id);
drop policy if exists "Favorites own delete" on public.favorites;
create policy "Favorites own delete" on public.favorites for delete using (auth.uid() = user_id);

drop policy if exists "Plan own select" on public.plan_stops;
create policy "Plan own select" on public.plan_stops for select using (auth.uid() = user_id);
drop policy if exists "Plan own insert" on public.plan_stops;
create policy "Plan own insert" on public.plan_stops for insert with check (auth.uid() = user_id);
drop policy if exists "Plan own update" on public.plan_stops;
create policy "Plan own update" on public.plan_stops for update using (auth.uid() = user_id);
drop policy if exists "Plan own delete" on public.plan_stops;
create policy "Plan own delete" on public.plan_stops for delete using (auth.uid() = user_id);

-- Allow anon seed via temporary policy? Prefer service role / SQL editor for seed.
-- Grant temporary public insert for bootstrap seed when table empty (optional):
-- Skipped for security; use SQL Editor with seed.sql

-- Storage bucket for media (run once; ignore if exists)
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "Media public read" on storage.objects;
create policy "Media public read"
  on storage.objects for select using (bucket_id = 'media');

drop policy if exists "Media admin upload" on storage.objects;
create policy "Media admin upload"
  on storage.objects for insert with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "Media admin update" on storage.objects;
create policy "Media admin update"
  on storage.objects for update using (bucket_id = 'media' and public.is_admin());

drop policy if exists "Media admin delete" on storage.objects;
create policy "Media admin delete"
  on storage.objects for delete using (bucket_id = 'media' and public.is_admin());
