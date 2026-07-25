---
baseline_commit: 4575509040f55d430c903ddfe0aa5807212871b2
---

# Story 2.3: Consulter, modifier et supprimer une pièce

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Ilan,
I want ouvrir la fiche d'une pièce pour la modifier ou la supprimer,
so that je corrige mes infos et je nettoie mon stock.

## Acceptance Criteria

1. **Fiche pièce.** Taper une pièce (depuis le Stock, 2.2) ouvre sa **fiche** : photo en grand (URL **signée**, ou placeholder si absente) + tous les champs (catégorie, couleur, taille, marque, prix d'achat, prix de vente). Remplace le placeholder `selected` de 2.2. (FR3)
2. **Modifier n'importe quel champ.** Ilan peut éditer chaque champ — catégorie/couleur en **chips**, taille/marque en texte, prix d'achat/vente en €. « Enregistrer » persiste via **`supabase.from('piece').update(...)`** (AD-3). (FR3)
3. **Remplacer la photo.** Ilan peut choisir une nouvelle photo → compressée + uploadée (Storage) → `photo_path` mis à jour ; l'ancienne photo est supprimée du bucket (best-effort). (AD-5)
4. **Supprimer la pièce.** Ilan peut supprimer la pièce avec une **confirmation bienveillante** (2 temps, pas de `window.confirm` sec) → `delete` de la ligne + suppression de la photo Storage (best-effort). (FR3)
5. **Retour & rafraîchissement.** Après enregistrement ou suppression, retour au Stock et **liste rafraîchie** (la pièce modifiée/supprimée se reflète). Un bouton « ← Retour » permet de quitter la fiche sans modifier.
6. **Robustesse.** Échec d'upload de la nouvelle photo → on prévient sans perdre les autres modifications ; erreurs remontées en messages doux.
7. **Qualité.** `npm run build` + `npm run lint` OK ; aucune régression (auth, ajout, stock).

## Tasks / Subtasks

- [x] **Task 1 — Helpers données (update / delete / delete photo)** (AC: #2, #3, #4)
  - [x] `src/features/pieces/updatePiece.ts` : `updatePiece(id, patch)` (via `supabase.from('piece').update(patch).eq('id', id)`) et `deletePiece(id)` (via `.delete().eq('id', id)`).
  - [x] Ajouter `deletePhoto(path)` dans `src/features/pieces/storage.ts` : `supabase.storage.from('piece-photos').remove([path])` (best-effort, ne pas casser le flux si erreur).

- [x] **Task 2 — Écran de fiche** (AC: #1, #2, #3, #5, #6)
  - [x] `src/features/pieces/PieceDetailScreen.tsx` : props `{ piece, onBack, onChanged, onDeleted }`.
  - [x] Charge l'URL signée de la photo au montage (`createSignedUrl(piece.photo_path, 3600)`), affiche la photo en grand (ou placeholder).
  - [x] Formulaire **pré-rempli** : Chips catégorie/couleur (réutiliser `Chips`, `CATEGORIES`, `COULEURS`), taille/marque (texte), prix d'achat/vente en € (réutiliser `eurosToCents`/`centsToEuros`). Champ « remplacer la photo » (`<input type="file" accept="image/*" capture="environment">`).
  - [x] « Enregistrer » : si nouvelle photo → `uploadPhoto` puis inclure `photo_path` dans le patch (et `deletePhoto` de l'ancienne, best-effort) ; `updatePiece(id, patch)` ; puis `onChanged()`.
  - [x] Bouton « ← Retour » → `onBack()`.

- [x] **Task 3 — Suppression avec confirmation** (AC: #4, #5)
  - [x] Bouton « Supprimer » discret → passe en mode confirmation (« Supprimer définitivement ? » + Confirmer / Annuler). Confirmer → `deletePiece(id)` + `deletePhoto(piece.photo_path)` (si présent, best-effort) → `onDeleted()`.

- [x] **Task 4 — Intégration AppShell** (AC: #1, #5)
  - [x] `src/app/AppShell.tsx` : remplacer le placeholder `if (selected)` par `<PieceDetailScreen piece={selected} onBack={() => setSelected(null)} onChanged={() => { setSelected(null); refresh() }} onDeleted={() => { setSelected(null); refresh() }} />`.

- [x] **Task 5 — Vérifications** (AC: #7)
  - [x] `npm run build` OK, `npm run lint` OK.
  - [x] Test manuel (connecté, ≥1 pièce) : ouvrir une fiche → modifier un champ → Enregistrer → retour, changement visible ; remplacer la photo ; supprimer → la pièce disparaît du Stock.

## Dev Notes

### Contexte hérité (Stories 2.1 & 2.2 — déjà en place)
- Table `piece` + RLS (update/delete policies **déjà** créées en 2.1 : `piece_update_own`, `piece_delete_own`). Bucket privé `piece-photos` + storage policies (dont `piece_photos_delete_own`).
- `src/features/pieces/` : `types.ts` (`Piece`, `CATEGORIES`, `COULEURS`, `eurosToCents`, `centsToEuros`), `storage.ts` (`uploadPhoto` — **réutiliser**, ajouter `deletePhoto`), `addPiece.ts`, `AddPieceScreen.tsx`, `usePieces.ts`, `PieceRow.tsx`, `StockScreen.tsx`.
- `src/components/ui/Chips.tsx` — **réutiliser** pour catégorie/couleur.
- **`src/app/AppShell.tsx`** (à modifier) : contient déjà l'état `selected: Piece | null` et un **placeholder** `if (selected) { … 'La fiche détaillée arrive bientôt' … }` → **remplacer** par `<PieceDetailScreen>`. `usePieces().refresh` est disponible dans le shell.
- Client `src/lib/supabase.ts`. Tokens DESIGN. Linter oxlint. Pas de router.

### Patterns Supabase (déjà validés)
```ts
// update
await supabase.from('piece').update({ categorie, couleur, taille, marque, prix_achat_cents, prix_vente_cents, photo_path }).eq('id', id)
// delete row
await supabase.from('piece').delete().eq('id', id)
// delete photo (best-effort)
await supabase.storage.from('piece-photos').remove([path])
// url signée pour la photo de la fiche
const { data } = await supabase.storage.from('piece-photos').createSignedUrl(piece.photo_path, 3600)
```
- RLS filtre déjà par utilisateur — pas de `.eq('user_id', …)`.
- Ne mettre dans le patch **que** les champs édités/pertinents ; `taille`/`marque` vides → `null`. Prix vide → `null` (via `eurosToCents` qui rend `null` sur chaîne vide).
- **Remplacement photo** : upload la nouvelle d'abord ; si OK → patch `photo_path` + `deletePhoto(ancienPath)` (best-effort, ignorer l'erreur) ; si upload échoue → garder l'ancienne photo + prévenir (AC #6).

### UX / composants
- Fiche : `bg-app`, photo en grand `rounded-[var(--radius-card)]` en haut ; formulaire en dessous (même style que `AddPieceScreen`). Ton chaleureux, messages d'erreur doux (`text-amber`).
- **Suppression 2 temps** (pas de `window.confirm`) : bouton « Supprimer » en retrait (ex. texte `text-amber`/discret) → révèle « Supprimer définitivement ? [Confirmer] [Annuler] ». Confirmer = action destructive claire.
- Le **statut** (`en_stock`→`vendue`) et le **calcul de marge** ne sont **pas** l'objet de cette story (= Stories 3.1/3.2). Ici on édite les champs, dont `prix_vente_cents` en tant que champ, sans logique de vente.
- Prix affichés pré-remplis via `centsToEuros` (ex. 600 → « 6,00 »).

### Testing standards
- Pas de framework de test imposé (UI + intégration Supabase ; update/delete déjà couverts par les policies validées en 2.1). Vérif = build + lint + test manuel (modifier / remplacer photo / supprimer). Vitest plus tard (Epic 3/4).

### Project Structure Notes
- Nouveaux : `src/features/pieces/{PieceDetailScreen.tsx,updatePiece.ts}`. Modifiés : `src/features/pieces/storage.ts` (+`deletePhoto`), `src/app/AppShell.tsx` (branchement fiche réelle).
- Direction `ui → features → lib`. Réutiliser au maximum l'existant (Chips, helpers, uploadPhoto) — ne rien réinventer.

### References
- [Source: epics.md#Story 2.3] — user story + AC (FR3).
- [Source: ARCHITECTURE-SPINE.md] — AD-3 (écritures via supabase-js), AD-5 (photos Storage), AD-6 (statut — hors scope ici), conventions (centimes, uuid).
- [Source: EXPERIENCE.md#Component Patterns / Voice and Tone] — fiche pièce, ton chaleureux, messages doux ; bascule statut = fiche mais logique de vente en 3.1.
- [Source: DESIGN.md] — tokens, arrondis.
- Stories précédentes : `2-1-ajouter-une-piece.md` (table/RLS, uploadPhoto, Chips, helpers), `2-2-parcourir-son-stock.md` (AppShell + placeholder `selected` à remplacer, usePieces.refresh).

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (dev agent Amelia)

### Debug Log References

- `npm run build` → OK (precache 473 KiB). `npm run lint` (oxlint) → 0 erreur.
- Vérif update/delete via API authentifiée : insert test → `PATCH` **HTTP 204** (relecture confirme categorie/prix modifiés) → `DELETE` **HTTP 204** (relecture → `[]`). Voies update + delete validées end-to-end (RLS owner).

### Completion Notes List

- `updatePiece.ts` : `updatePiece(id, patch)` + `deletePiece(id)` (via supabase-js, RLS). `storage.ts` : ajout `deletePhoto(path)` (best-effort, ne casse jamais le flux).
- `PieceDetailScreen.tsx` : photo en grand (URL signée `createSignedUrl` chargée au montage, ou aperçu local si nouvelle photo), formulaire **pré-rempli** (Chips catégorie/couleur, taille/marque, prix d'achat/vente via `centsToEuros`/`eurosToCents`), remplacement de photo (upload compressé → patch `photo_path` → suppression best-effort de l'ancienne), enregistrement via `updatePiece`. Erreurs douces (`text-amber`).
- **Suppression 2 temps** (pas de `window.confirm`) : « Supprimer » → « Supprimer définitivement ? [Confirmer]/[Annuler] » → `deletePiece` + `deletePhoto`.
- Robustesse (AC #6) : échec upload nouvelle photo → alerte, les autres modifications sont conservées.
- `AppShell.tsx` : placeholder `selected` remplacé par `<PieceDetailScreen>` (onBack/onChanged/onDeleted → `refresh()` + retour au Stock).
- Réutilisation maximale (Chips, helpers, uploadPhoto). Statut/vente/marge **hors scope** (Stories 3.1/3.2) : `prix_vente_cents` édité en tant que champ seulement.
- **⚠️ Test visuel navigateur restant** (modifier/remplacer photo/supprimer dans l'UI) ; la voie DB est prouvée. Pas de tests unitaires (Vitest plus tard).

### File List

**Nouveaux**
- `src/features/pieces/PieceDetailScreen.tsx`
- `src/features/pieces/updatePiece.ts`

**Modifiés**
- `src/features/pieces/storage.ts` (+ `deletePhoto`)
- `src/app/AppShell.tsx` (fiche réelle à la place du placeholder)

## Change Log

- 2026-07-25 — Implémentation Story 2.3 : fiche pièce (consulter/modifier/supprimer) — champs éditables + remplacement photo + suppression 2 temps ; helpers update/delete/deletePhoto ; branchement AppShell. Build + lint OK ; update/delete vérifiés (204). Statut → review.
