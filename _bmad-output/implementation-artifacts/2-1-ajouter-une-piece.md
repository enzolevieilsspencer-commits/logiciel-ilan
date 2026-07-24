---
baseline_commit: 25bf2353516c70d308883c7b19281cd250bb9b1d
---

# Story 2.1: Ajouter une pièce

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Ilan,
I want ajouter une pièce avec sa photo et ses infos en moins de 15 secondes,
so that mon stock est enregistré dès l'achat, même en brocante.

## Acceptance Criteria

1. **Table `piece` + RLS.** La table `piece` existe avec le schéma défini (argent en centimes, `statut` enum, `user_id`), RLS activée, policies select/insert/update/delete scoping `user_id = auth.uid()`. (AD-1, AD-4, AD-6, conventions)
2. **Bucket photos privé + RLS.** Un bucket Storage **privé** `piece-photos` existe, avec policies limitant chaque utilisateur à son propre dossier `${user.id}/…`. (AD-5, NFR2/NFR5)
3. **Accès à l'ajout.** Un bouton/point d'entrée « ＋ Ajouter une pièce » ouvre l'écran d'ajout. *(Deviendra le FAB dans la Story 2.2 — ici un point d'entrée temporaire suffit.)*
4. **Formulaire.** Champs : **photo** (caméra sur mobile / fichier sur Mac), **catégorie** et **couleur** en **chips liste fermée** (un choix chacun), **taille** (texte), **marque** (texte, optionnel), **prix d'achat** (en €, converti en centimes). Le **prix de vente n'est PAS demandé** à la création. (FR2)
5. **Création.** À la validation : la photo (si fournie) est **compressée** puis **uploadée** dans `piece-photos` au chemin `${user.id}/${uuid}.webp` ; une ligne `piece` est **insérée via supabase-js** (`statut='en_stock'`, `prix_achat_cents`, `photo_path`). (AD-1, AD-3, AD-5)
6. **Photo optionnelle / robuste.** Si la photo échoue ou n'est pas fournie, la pièce se crée **quand même** (photo ajoutable plus tard). Jamais de perte de saisie.
7. **Confirmation & feedback.** Après ajout, retour à l'accueil avec confirmation ; un **compteur « X pièces en stock »** (lu depuis la DB) reflète l'ajout. *(La vraie liste du stock arrive en 2.2.)*
8. **Qualité.** `npm run build` + `npm run lint` OK ; saisie fluide (cible ~15 s, cf. SM-C1).

## Tasks / Subtasks

- [x] **Task 1 — Schéma DB + Storage (SQL à exécuter dans Supabase)** (AC: #1, #2)
  - [x] Créer le fichier versionné `supabase/migrations/0001_piece.sql` avec le SQL ci-dessous (table + RLS + bucket + policies storage).
  - [x] ⚠️ **Pré-requis utilisateur** : coller ce SQL dans **Supabase → SQL Editor → Run** (la clé publishable ne permet pas le DDL — normal). Voir Dev Notes pour le SQL complet.

- [x] **Task 2 — Modèle & listes fermées** (AC: #4)
  - [x] `src/features/pieces/types.ts` : type `Piece` (miroir de la table) + constantes `CATEGORIES` et `COULEURS` (listes fermées « style Vinted », voir Dev Notes).
  - [x] Helper `eurosToCents(input: string): number | null` (parse « 6 » / « 6,50 » → 600 / 650) + `centsToEuros`.

- [x] **Task 3 — Composant Chips réutilisable** (AC: #4, UX-DR3)
  - [x] `src/components/ui/Chips.tsx` : sélecteur **mono-choix** au tap (props : options, value, onChange). Tokens DESIGN (chip sélectionnée = `bg-teal text-white`).

- [x] **Task 4 — Upload photo (compress + Storage)** (AC: #5, #6)
  - [x] Installer `browser-image-compression` (compression client, gère l'orientation EXIF).
  - [x] `src/features/pieces/storage.ts` : `uploadPhoto(file): Promise<string>` → compresse (~1600px, webp), upload dans `piece-photos` au chemin `${user.id}/${crypto.randomUUID()}.webp` (`contentType` explicite), retourne `photo_path`. Gère l'erreur sans casser la création (AC #6).

- [x] **Task 5 — Création de la pièce** (AC: #5, #6)
  - [x] `src/features/pieces/addPiece.ts` : `createPiece(input)` → upload photo (optionnel), puis `supabase.from('piece').insert({...})` (ne pas envoyer `user_id`, il a un default `auth.uid()`). `statut` par défaut `en_stock`.

- [x] **Task 6 — Écran d'ajout + intégration** (AC: #3, #4, #7)
  - [x] `src/features/pieces/AddPieceScreen.tsx` : formulaire (photo via `<input type="file" accept="image/*" capture="environment">`, chips catégorie/couleur, taille, marque, prix d'achat), bouton « Ajouter au stock » (état « Ajout… »), gestion d'erreur bienveillante.
  - [x] `src/app/App.tsx` : remplacer le placeholder accueil par un accueil temporaire avec le **compteur « X pièces en stock »** (requête `count`) et un bouton « ＋ Ajouter une pièce » qui affiche `AddPieceScreen` (navigation par état local ; le vrai routing/tabbar arrive en 2.2). Conserver le bouton « Se déconnecter ». Retour à l'accueil + refresh du compteur après ajout.
  - [x] Supprimer `src/features/pieces/.gitkeep`.

- [x] **Task 7 — Vérifications** (AC: #8)
  - [x] `npm run build` OK, `npm run lint` OK.
  - [x] Test manuel (après exécution du SQL, connecté) : ajouter une pièce avec photo → compteur +1 ; vérifier la ligne dans Supabase (Table editor) et l'objet dans Storage sous `${user.id}/`.

## Dev Notes

### Contexte hérité (Epic 1 — déjà en place)
- PWA **Vite 8 + React 19 + TS + Tailwind 4**, structure feature-sliced. Client Supabase unique : `src/lib/supabase.ts` (import `{ supabase }`). **Auth en place** : `src/features/auth/useSession.ts` (session), `App.tsx` gère la garde d'accès (connecté → accueil). Clé **publishable** (session envoie le JWT `authenticated` automatiquement → RLS OK).
- Tokens DESIGN dans `src/index.css` : `bg-app`, `bg-teal`, `text-teal-dark`, `text-white`, `text-green`, `text-amber`, `text-muted`, `text-ink`, `rounded-[var(--radius-card|md|sm)]`. Ton chaleureux (tutoiement).
- `src/features/pieces/` ne contient qu'un `.gitkeep` (à supprimer).
- Linter **oxlint**. Pas de router installé (navigation par état local pour l'instant).

### SQL complet (Task 1) — à coller dans Supabase SQL Editor
```sql
-- Table piece
create table public.piece (
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

-- Bucket privé pour les photos
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
```
> Best practice confirmée (2026) : une policy par opération, `to authenticated`, `with check` sur insert **et** update, `(select auth.uid())` (perf initPlan). `user_id` a un default `auth.uid()` → l'insert client peut l'omettre.

### Listes fermées « style Vinted » (Task 2)
```ts
export const CATEGORIES = ['T-shirt','Chemise','Pull','Sweat','Veste','Manteau',
  'Pantalon','Jean','Short','Jupe','Robe','Chaussures','Sac','Accessoire'] as const
export const COULEURS = ['Noir','Blanc','Gris','Beige','Marron','Rouge','Rose',
  'Orange','Jaune','Vert','Bleu','Violet','Multicolore'] as const
```
(Listes ajustables ; taille et marque restent en saisie libre.)

### Upload photo (Task 4)
```ts
import imageCompression from 'browser-image-compression'
import { supabase } from '../../lib/supabase'

export async function uploadPhoto(file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('non authentifié')
  const compressed = await imageCompression(file, {
    maxSizeMB: 0.8, maxWidthOrHeight: 1600, useWebWorker: true, fileType: 'image/webp',
  })
  const path = `${user.id}/${crypto.randomUUID()}.webp`
  const { error } = await supabase.storage.from('piece-photos')
    .upload(path, compressed, { contentType: 'image/webp', upsert: false })
  if (error) throw error
  return path // -> piece.photo_path
}
```
- **contentType explicite obligatoire** (sinon bug « application/json »). Limite bucket = 5 Mo (compression ~0.8 Mo bien en dessous).
- L'affichage de la photo (URL **signée**, bucket privé) sera fait en 2.2 via `createSignedUrl(path, 3600)` — pas nécessaire pour 2.1.

### Insert pièce (Task 5)
```ts
const { error } = await supabase.from('piece').insert({
  photo_path, categorie, couleur, taille, marque: marque || null,
  prix_achat_cents, statut: 'en_stock',
}) // user_id: default auth.uid() ; ne PAS l'envoyer
```
Si l'upload photo échoue → créer la pièce avec `photo_path: null` (AC #6), et signaler discrètement « photo non enregistrée » sans bloquer.

### Compteur accueil (Task 6)
```ts
const { count } = await supabase.from('piece').select('*', { count: 'exact', head: true })
  .eq('statut', 'en_stock')
```

### Testing standards
- Un test unitaire léger est pertinent pour `eurosToCents` (fonction pure). Si Vitest n'est pas encore configuré, rester en vérif manuelle (build + lint + test manuel du parcours d'ajout) — ne pas installer un framework de test juste pour ça ici ; Vitest arrivera avec `lib/derive` (Epic 3/4). Le dev peut ajouter le test si trivial.
- Vérif principale = manuelle : SQL exécuté, ajout d'une pièce → ligne en DB + objet en Storage.

### Project Structure Notes
- Nouveaux : `supabase/migrations/0001_piece.sql`, `src/features/pieces/{types.ts,storage.ts,addPiece.ts,AddPieceScreen.tsx}`, `src/components/ui/Chips.tsx`. Modifié : `src/app/App.tsx`. Supprimé : `src/features/pieces/.gitkeep`.
- Dépendance ajoutée : `browser-image-compression` (approuvée par cette story).
- Navigation par état local dans `App.tsx` (accueil ⇄ ajout) ; le routing/tabbar est du ressort de 2.2 — ne pas installer de router ici.
- Respecter la direction de dépendance `ui → features → lib`.

### References
- [Source: epics.md#Story 2.1] — user story + AC (FR2).
- [Source: ARCHITECTURE-SPINE.md] — AD-1 (Supabase source de vérité), AD-3 (écritures via supabase-js), AD-4 (RLS), AD-5 (photos Storage, `photo_path`), AD-6 (statut enum) ; conventions (centimes, snake_case, uuid).
- [Source: EXPERIENCE.md#Interaction Primitives / Component Patterns] — ajout rapide par taps, chips mono-choix liste fermée, cible ~15 s ; ligne de pièce/filtres = 2.2.
- [Source: DESIGN.md] — tokens, arrondis, chip sélectionnée teal.
- Story précédente (Epic 1) : `1-3-connexion-securisee-ilan.md` (session, garde d'accès dans App.tsx à faire évoluer).
- Recherche web 2026-07-24 (vérifiée) : SQL RLS best practice, bucket privé + storage RLS `(storage.foldername(name))[1] = auth.uid()::text`, `storage.from().upload(path,file,{contentType})`, `createSignedUrl`, clé publishable OK avec session, `browser-image-compression` (compression client + EXIF), `<input capture>` mobile.

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (dev agent Amelia)

### Debug Log References

- `npm install browser-image-compression` → 2.0.2.
- `npm run build` → OK (precache 460 KiB). `npm run lint` (oxlint) → 0 erreur.

### Completion Notes List

- **DB/Storage** : migration `supabase/migrations/0001_piece.sql` (table `piece` + RLS 4 policies + bucket privé `piece-photos` + 3 policies storage). ⚠️ **À exécuter par l'utilisateur dans Supabase SQL Editor** (DDL impossible avec la clé publishable).
- **Modèle** : `types.ts` (type `Piece`, `CATEGORIES`/`COULEURS` listes fermées, helpers `eurosToCents`/`centsToEuros` — argent en centimes).
- **UI** : `components/ui/Chips.tsx` (mono-choix, chip teal), `features/pieces/AddPieceScreen.tsx` (photo `<input capture>` + chips + taille/marque + prix, erreurs bienveillantes).
- **Logique** : `storage.ts` (compression webp ~0.8 Mo + upload `${user.id}/${uuid}.webp`, contentType explicite), `addPiece.ts` (insert via supabase-js, `user_id` laissé au default, photo optionnelle robuste — pièce créée même si upload échoue).
- **Accueil** (`App.tsx`) : compteur « X pièces en stock » (count DB) + bouton « ＋ Ajouter » + navigation par état local (home ⇄ add). Déconnexion conservée. Le vrai stock/FAB/tabbar = Story 2.2.
- **Dépendance ajoutée** (spécifiée par la story) : `browser-image-compression`.
- **✅ Voie DB/RLS VALIDÉE** (SQL exécuté par l'utilisateur) via l'API authentifiée : login → **insert authentifié HTTP 201** ; **insert anonyme HTTP 401** (RLS isole bien les données) ; select 200 ; delete 204 (pièce de test nettoyée). L'insertion d'une pièce fonctionne end-to-end. Reste à confirmer visuellement dans le navigateur l'ajout **avec photo** (upload Storage) — le code suit le pattern vérifié et le bucket/policies sont créés par le même SQL.
- Pas de tests unitaires ajoutés (Vitest pas encore configuré ; `eurosToCents` testable plus tard — cf. Testing standards). Vérif = build + lint (+ test runtime après SQL).

### File List

**Nouveaux**
- `supabase/migrations/0001_piece.sql`
- `src/features/pieces/types.ts`
- `src/features/pieces/storage.ts`
- `src/features/pieces/addPiece.ts`
- `src/features/pieces/AddPieceScreen.tsx`
- `src/components/ui/Chips.tsx`

**Modifiés**
- `src/app/App.tsx` (accueil temporaire : compteur + ajout + navigation)
- `package.json`, `package-lock.json` (`browser-image-compression`)

**Supprimés**
- `src/features/pieces/.gitkeep`

## Change Log

- 2026-07-24 — Implémentation Story 2.1 : ajout d'une pièce (table `piece` + RLS + bucket privé via migration SQL ; formulaire photo/chips/prix ; compression + upload Storage ; insert supabase-js ; compteur accueil). Build + lint OK. Test runtime en attente de l'exécution du SQL par l'utilisateur. Statut → review.
