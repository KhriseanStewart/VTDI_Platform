-- Shared outing plans (public share links)
create table if not exists public.shared_plans (
  id text primary key,
  title text,
  place_ids jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists shared_plans_created_at_idx
  on public.shared_plans (created_at desc);

alter table public.shared_plans enable row level security;

drop policy if exists "Shared plans public read" on public.shared_plans;
create policy "Shared plans public read"
  on public.shared_plans for select using (true);

-- Anyone can create a share link (guests + signed-in users)
drop policy if exists "Shared plans public insert" on public.shared_plans;
create policy "Shared plans public insert"
  on public.shared_plans for insert
  with check (
    jsonb_typeof(place_ids) = 'array'
    and jsonb_array_length(place_ids) > 0
    and jsonb_array_length(place_ids) <= 30
  );

drop policy if exists "Shared plans owner delete" on public.shared_plans;
create policy "Shared plans owner delete"
  on public.shared_plans for delete
  using (auth.uid() is not null and created_by = auth.uid());
