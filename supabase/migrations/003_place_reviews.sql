-- Place reviews with cross-platform sources
create table if not exists public.place_reviews (
  id text primary key,
  place_id text not null references public.places (id) on delete cascade,
  source text not null check (source in ('outyah', 'google', 'instagram', 'tripadvisor', 'yelp')),
  author text not null,
  avatar text,
  rating numeric(2,1) not null check (rating >= 1 and rating <= 5),
  body text not null,
  business_reply text,
  posted_at timestamptz not null default now(),
  user_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists place_reviews_place_id_idx on public.place_reviews (place_id, posted_at desc);
create index if not exists place_reviews_source_idx on public.place_reviews (source);

alter table public.place_reviews enable row level security;

drop policy if exists "Reviews public read" on public.place_reviews;
create policy "Reviews public read"
  on public.place_reviews for select using (true);

drop policy if exists "Reviews user insert" on public.place_reviews;
create policy "Reviews user insert"
  on public.place_reviews for insert
  with check (
    auth.uid() is not null
    and source = 'outyah'
    and user_id = auth.uid()
  );

drop policy if exists "Reviews admin write" on public.place_reviews;
create policy "Reviews admin write"
  on public.place_reviews for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Reviews owner delete" on public.place_reviews;
create policy "Reviews owner delete"
  on public.place_reviews for delete
  using (auth.uid() is not null and user_id = auth.uid());

-- Keep places.review_count in sync; rating stays the Google (or admin) aggregate
create or replace function public.refresh_place_review_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_id text;
begin
  target_id := coalesce(new.place_id, old.place_id);
  update public.places p
  set
    review_count = (
      select count(*)::int from public.place_reviews r where r.place_id = target_id
    ),
    updated_at = now()
  where p.id = target_id;
  return coalesce(new, old);
end;
$$;

drop trigger if exists place_reviews_stats_aiud on public.place_reviews;
create trigger place_reviews_stats_aiud
  after insert or update or delete on public.place_reviews
  for each row execute function public.refresh_place_review_stats();
