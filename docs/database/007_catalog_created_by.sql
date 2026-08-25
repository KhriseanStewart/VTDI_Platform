-- track which admin added a place or event (seed rows stay null)

alter table public.places
  add column if not exists created_by uuid references auth.users (id) on delete set null;

alter table public.events
  add column if not exists created_by uuid references auth.users (id) on delete set null;

create index if not exists places_created_by_idx
  on public.places (created_by, created_at desc);

create index if not exists events_created_by_idx
  on public.events (created_by, created_at desc);

create or replace function public.set_catalog_created_by()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.created_by is null then
    new.created_by := auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists places_set_created_by on public.places;
create trigger places_set_created_by
  before insert on public.places
  for each row execute function public.set_catalog_created_by();

drop trigger if exists events_set_created_by on public.events;
create trigger events_set_created_by
  before insert on public.events
  for each row execute function public.set_catalog_created_by();
