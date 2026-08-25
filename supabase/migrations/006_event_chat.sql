-- Per-user event RSVPs + an RSVP-gated realtime chat room per event.
--
-- The gate lives in RLS, not in the UI: a signed-in user can only read or post
-- messages for an event they have actually RSVPed to. Hiding the panel client
-- side would still leave the rows readable with the anon key.

-- 1. RSVPs -------------------------------------------------------------------

create table if not exists public.event_rsvps (
  event_id text not null references public.events (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'going' check (status in ('going', 'interested')),
  created_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create index if not exists event_rsvps_event_idx
  on public.event_rsvps (event_id, status);

alter table public.event_rsvps enable row level security;

-- Attendee counts are public, consistent with public.profiles being public read.
drop policy if exists "Event rsvps public read" on public.event_rsvps;
create policy "Event rsvps public read"
  on public.event_rsvps for select
  using (true);

-- A user may only create, change, or drop their own RSVP.
drop policy if exists "Event rsvps owner write" on public.event_rsvps;
create policy "Event rsvps owner write"
  on public.event_rsvps for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- 2. Chat --------------------------------------------------------------------

create table if not exists public.event_messages (
  id uuid primary key default gen_random_uuid(),
  event_id text not null references public.events (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Author display fields are denormalised (as on posts / place_reviews) so a
  -- realtime payload renders without a follow-up join. Set by trigger below.
  author text not null default '',
  avatar text,
  body text not null check (char_length(btrim(body)) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists event_messages_event_idx
  on public.event_messages (event_id, created_at);

alter table public.event_messages enable row level security;

-- Has the current user RSVPed to this event? security definer so the check
-- does not itself depend on the caller's read access to event_rsvps.
create or replace function public.has_rsvp(target_event text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.event_rsvps r
    where r.event_id = target_event
      and r.user_id = auth.uid()
  );
$$;

-- Read the room only if you are in it.
drop policy if exists "Event messages rsvp read" on public.event_messages;
create policy "Event messages rsvp read"
  on public.event_messages for select
  using (public.has_rsvp(event_id) or public.is_admin());

-- Post as yourself, only in a room you joined.
drop policy if exists "Event messages rsvp insert" on public.event_messages;
create policy "Event messages rsvp insert"
  on public.event_messages for insert
  with check (
    user_id = auth.uid()
    and public.has_rsvp(event_id)
  );

-- Authors can retract; admins can moderate. Deliberately no update policy, so
-- message history cannot be silently rewritten.
drop policy if exists "Event messages author delete" on public.event_messages;
create policy "Event messages author delete"
  on public.event_messages for delete
  using (user_id = auth.uid() or public.is_admin());

-- Stamp the author server side so a display name cannot be spoofed by a
-- hand-rolled insert. Falls back to the email local part, matching how the
-- app derives names elsewhere.
create or replace function public.set_event_message_author()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select
    coalesce(nullif(btrim(p.name), ''), split_part(u.email, '@', 1), 'Guest'),
    p.avatar_url
  into new.author, new.avatar
  from auth.users u
  left join public.profiles p on p.id = u.id
  where u.id = new.user_id;

  if new.author is null or btrim(new.author) = '' then
    new.author := 'Guest';
  end if;

  return new;
end;
$$;

drop trigger if exists event_messages_set_author on public.event_messages;
create trigger event_messages_set_author
  before insert on public.event_messages
  for each row execute function public.set_event_message_author();

-- 3. Realtime ----------------------------------------------------------------

-- Postgres Changes still applies the select policy above per subscriber, so
-- only RSVPed users receive inserts for a room.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'event_messages'
     )
  then
    alter publication supabase_realtime add table public.event_messages;
  end if;
end
$$;
