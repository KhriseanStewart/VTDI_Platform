-- Post moderation status + authenticated submissions
alter table public.posts
  add column if not exists status text not null default 'approved'
    check (status in ('pending', 'approved', 'rejected')),
  add column if not exists submitted_by uuid references auth.users (id) on delete set null;

create index if not exists posts_status_idx on public.posts (status, posted_at desc);

-- Public only sees approved posts
drop policy if exists "Posts public read" on public.posts;
create policy "Posts public read"
  on public.posts for select
  using (
    status = 'approved'
    or public.is_admin()
    or (auth.uid() is not null and submitted_by = auth.uid())
  );

drop policy if exists "Posts admin write" on public.posts;
create policy "Posts admin write"
  on public.posts for all
  using (public.is_admin())
  with check (public.is_admin());

-- Signed-in users can submit pending photo posts
drop policy if exists "Posts user submit" on public.posts;
create policy "Posts user submit"
  on public.posts for insert
  with check (
    auth.uid() is not null
    and submitted_by = auth.uid()
    and status = 'pending'
  );

-- Authenticated users may upload into media/submissions/*
drop policy if exists "Media user submission upload" on storage.objects;
create policy "Media user submission upload"
  on storage.objects for insert
  with check (
    bucket_id = 'media'
    and auth.uid() is not null
    and (storage.foldername(name))[1] = 'submissions'
  );
