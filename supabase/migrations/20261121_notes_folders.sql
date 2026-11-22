-- Notes/folders schema used by the PWA (previously created out-of-band).
-- Idempotent: safe to replay on an existing project.

create table if not exists public.folders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Dossier',
  parent_id uuid references public.folders(id) on delete cascade,
  path text not null default '/',
  icon text,
  color text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  content text not null default '',
  folder_id uuid references public.folders(id) on delete set null,
  is_pinned boolean not null default false,
  is_archived boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notes_user_id_updated_at_idx on public.notes (user_id, updated_at desc);
create index if not exists notes_folder_id_idx on public.notes (folder_id);
create index if not exists folders_user_id_idx on public.folders (user_id);
create index if not exists folders_parent_id_idx on public.folders (parent_id);

create or replace function public.wings8note_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists notes_touch_updated_at on public.notes;
create trigger notes_touch_updated_at
before update on public.notes
for each row execute function public.wings8note_touch_updated_at();

drop trigger if exists folders_touch_updated_at on public.folders;
create trigger folders_touch_updated_at
before update on public.folders
for each row execute function public.wings8note_touch_updated_at();

alter table public.notes enable row level security;
alter table public.folders enable row level security;

drop policy if exists "notes_select_own" on public.notes;
create policy "notes_select_own" on public.notes for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "notes_insert_own" on public.notes;
create policy "notes_insert_own" on public.notes for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "notes_update_own" on public.notes;
create policy "notes_update_own" on public.notes for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "notes_delete_own" on public.notes;
create policy "notes_delete_own" on public.notes for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "folders_select_own" on public.folders;
create policy "folders_select_own" on public.folders for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "folders_insert_own" on public.folders;
create policy "folders_insert_own" on public.folders for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "folders_update_own" on public.folders;
create policy "folders_update_own" on public.folders for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "folders_delete_own" on public.folders;
create policy "folders_delete_own" on public.folders for delete to authenticated using ((select auth.uid()) = user_id);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notes'
  ) then
    alter publication supabase_realtime add table public.notes;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'folders'
  ) then
    alter publication supabase_realtime add table public.folders;
  end if;
end;
$$;

grant select, insert, update, delete on public.notes to authenticated;
grant select, insert, update, delete on public.folders to authenticated;
