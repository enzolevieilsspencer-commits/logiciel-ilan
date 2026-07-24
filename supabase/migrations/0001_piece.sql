-- Story 2.1 — Table piece + RLS + bucket photos privé + policies Storage.
-- À exécuter dans Supabase → SQL Editor → Run.

-- === Table piece ===
create table if not exists public.piece (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade default auth.uid(),
  photo_path        text,
  categorie         text,
  couleur           text,
  taille            text,
  marque            text,
  prix_achat_cents  int,
  prix_vente_cents  int,
  statut            text not null default 'en_stock' check (statut in ('en_stock','vendue')),
  created_at        timestamptz not null default now(),
  sold_at           timestamptz
);

alter table public.piece enable row level security;

create policy "piece_select_own" on public.piece
  for select to authenticated using ( (select auth.uid()) = user_id );
create policy "piece_insert_own" on public.piece
  for insert to authenticated with check ( (select auth.uid()) = user_id );
create policy "piece_update_own" on public.piece
  for update to authenticated using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );
create policy "piece_delete_own" on public.piece
  for delete to authenticated using ( (select auth.uid()) = user_id );

-- === Bucket privé pour les photos ===
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('piece-photos', 'piece-photos', false, 5242880,
        array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "piece_photos_insert_own" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'piece-photos' and (storage.foldername(name))[1] = auth.uid()::text );
create policy "piece_photos_select_own" on storage.objects
  for select to authenticated using (
    bucket_id = 'piece-photos' and (storage.foldername(name))[1] = auth.uid()::text );
create policy "piece_photos_delete_own" on storage.objects
  for delete to authenticated using (
    bucket_id = 'piece-photos' and (storage.foldername(name))[1] = auth.uid()::text );
