-- Feedback Ilan — quantité par article + boxes (lots) avec marge par box.
-- À exécuter dans Supabase → SQL Editor → Run.

-- === Table box (lot d'achat) ===
create table if not exists public.box (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade default auth.uid(),
  nom               text not null,
  prix_achat_cents  int,
  created_at        timestamptz not null default now()
);

alter table public.box enable row level security;

create policy "box_select_own" on public.box
  for select to authenticated using ( (select auth.uid()) = user_id );
create policy "box_insert_own" on public.box
  for insert to authenticated with check ( (select auth.uid()) = user_id );
create policy "box_update_own" on public.box
  for update to authenticated using ( (select auth.uid()) = user_id )
  with check ( (select auth.uid()) = user_id );
create policy "box_delete_own" on public.box
  for delete to authenticated using ( (select auth.uid()) = user_id );

-- === Ajouts sur piece : quantité + rattachement à une box ===
alter table public.piece
  add column if not exists quantite int not null default 1 check (quantite >= 1);

alter table public.piece
  add column if not exists box_id uuid references public.box (id) on delete set null;

create index if not exists piece_box_id_idx on public.piece (box_id);
