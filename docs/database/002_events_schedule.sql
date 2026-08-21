-- Event scheduling + recurrence metadata
alter table public.events
  add column if not exists starts_at timestamptz,
  add column if not exists ends_at timestamptz,
  add column if not exists recurring boolean not null default false,
  add column if not exists recurrence_note text;

create index if not exists events_starts_at_idx on public.events (starts_at desc nulls last);
