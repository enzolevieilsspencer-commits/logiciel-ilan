---
baseline_commit: 181c9cadec81a16f83ab1f988082482e28565825
---

# Story 3.1: Passer une pièce en vendue

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Ilan,
I want basculer une pièce de *en stock* à *vendue* en confirmant son prix de vente,
so that ma vente est enregistrée et alimente mon historique.

## Acceptance Criteria

1. **Bascule vers vendue.** Sur la fiche d'une pièce *en stock*, une action « Marquer comme vendue » exige/confirme le **prix de vente** puis enregistre `statut='vendue'`, `prix_vente_cents` et `sold_at` (date du jour). (FR4, AD-6)
2. **Prix de vente requis.** Impossible de marquer vendue sans prix de vente : si le champ est vide, message clair invitant à le renseigner (pas d'enregistrement). (FR4)
3. **Quitte le Stock → Historique.** Une pièce *vendue* disparaît de l'onglet Stock (qui ne liste que `en_stock`) et est **conservée durablement** (elle réapparaîtra dans l'Historique en Epic 4). (NFR4)
4. **Réversible.** Sur une pièce *vendue*, une action « Remettre en stock » repasse `statut='en_stock'` et **efface `sold_at`** (correction d'erreur). (AD-6)
5. **État visible.** La fiche indique clairement le statut courant (*en stock* / *vendue*), et la date de vente si vendue.
6. **Retour & rafraîchissement.** Après bascule (vente ou remise en stock), retour au Stock avec liste rafraîchie.
7. **Hors scope.** Le calcul/affichage de la **marge** est la Story 3.2 — ne pas l'implémenter ici (juste la transition de statut). (dépendance)
8. **Qualité.** `npm run build` + `npm run lint` OK ; aucune régression (édition/suppression de pièce, stock, filtres).

## Tasks / Subtasks

- [x] **Task 1 — Helpers de transition de statut** (AC: #1, #4)
  - [x] Dans `src/features/pieces/updatePiece.ts` : ajouter `sellPiece(id, prixVenteCents)` → `update({ statut: 'vendue', prix_vente_cents: prixVenteCents, sold_at: new Date().toISOString() })` ; et `restockPiece(id)` → `update({ statut: 'en_stock', sold_at: null })`.

- [x] **Task 2 — Bascule de statut sur la fiche** (AC: #1, #2, #4, #5)
  - [x] `src/features/pieces/PieceDetailScreen.tsx` : ajouter une **section Statut** (au-dessus ou sous le formulaire) :
    - Si `piece.statut === 'en_stock'` : bouton « Marquer comme vendue ». Au clic : si le champ **prix de vente** (déjà présent dans le formulaire) est vide/invalide → message « Indique le prix de vente pour marquer comme vendue » ; sinon `sellPiece(piece.id, prixVenteCents)` → `onChanged()`.
    - Si `piece.statut === 'vendue'` : afficher le tag « vendu » + la date (`sold_at`), et un bouton « Remettre en stock » → `restockPiece(piece.id)` → `onChanged()`.
  - [x] La bascule utilise le prix de vente **courant** du formulaire (l'utilisateur peut l'ajuster avant de vendre). Ne pas dupliquer un second champ prix.

- [x] **Task 3 — Vérifications** (AC: #8)
  - [x] `npm run build` OK, `npm run lint` OK.
  - [x] Test manuel : ouvrir une pièce en stock → saisir prix de vente → « Marquer comme vendue » → elle disparaît du Stock ; rouvrir depuis (Historique à venir / DB) → « Remettre en stock » la refait apparaître ; vendre sans prix → message d'erreur.

## Dev Notes

### Contexte hérité (Epic 2 — déjà en place)
- Table `piece` : `statut` (`en_stock`/`vendue`, check + default en 2.1), `prix_vente_cents`, `sold_at timestamptz`. RLS update **déjà** en place.
- **`src/features/pieces/PieceDetailScreen.tsx`** (à modifier) : fiche avec formulaire pré-rempli, dont un champ **prix de vente** (`prixVente` state, `eurosToCents`/`centsToEuros`). L'« Enregistrer » fait un `updatePiece` des champs. → Ajouter une **section Statut** qui réutilise le state `prixVente` existant (ne pas créer de 2ᵉ champ).
- **`src/features/pieces/updatePiece.ts`** (à modifier) : `updatePiece(id, patch)`, `deletePiece(id)` existent. Ajouter `sellPiece`/`restockPiece`.
- `usePieces` liste `statut='en_stock'` → une pièce vendue quitte le Stock automatiquement. L'onglet **Stats/Historique** (affichage des vendues) = Epic 4, hors scope ici. `AppShell` `onChanged` fait déjà `refresh()` + retour au Stock.
- Tokens DESIGN (tag *vendu* = vert `text-green`/`bg` ; *en stock* = menthe). Ton chaleureux. Linter oxlint.

### Patterns (déjà validés)
```ts
// vendre
await supabase.from('piece').update({ statut: 'vendue', prix_vente_cents, sold_at: new Date().toISOString() }).eq('id', id)
// remettre en stock (réversible)
await supabase.from('piece').update({ statut: 'en_stock', sold_at: null }).eq('id', id)
```
- RLS filtre par utilisateur. `sold_at` = ISO string (`new Date().toISOString()`).
- Le prix de vente vient du champ existant → `eurosToCents(prixVente)` ; si `null`/vide → bloquer la vente (AC #2).
- **Ne pas** calculer/afficher la marge (Story 3.2).

### UX
- Section Statut nette : un encart avec le statut courant. En stock → bouton teal « Marquer comme vendue ». Vendue → tag vert « Vendu le JJ/MM/AAAA » + bouton discret « Remettre en stock ».
- Formatage date : afficher `sold_at` en date locale FR (ex. `new Date(piece.sold_at).toLocaleDateString('fr-FR')`).
- Messages d'erreur doux (`text-amber`).

### Testing standards
- Pas de framework de test imposé (transition = update Supabase, couvert par RLS validée). Vérif = build + lint + test manuel (+ possible vérif API : update statut/sold_at). Vitest arrivera avec le calcul de marge (`lib/derive`, Story 3.2/Epic 4).

### Project Structure Notes
- Modifiés : `src/features/pieces/updatePiece.ts` (+`sellPiece`/`restockPiece`), `src/features/pieces/PieceDetailScreen.tsx` (section Statut). Aucun nouveau fichier nécessaire, aucune modif DB (colonnes déjà présentes).
- Réutiliser le state `prixVente` et les helpers existants — ne rien dupliquer.

### References
- [Source: epics.md#Story 3.1] — user story + AC (FR4).
- [Source: ARCHITECTURE-SPINE.md#AD-6] — `statut ∈ {en_stock,vendue}` ; vendue ⇒ prix_vente non nul + sold_at ; réversible efface sold_at. [AD-3] écritures via supabase-js.
- [Source: EXPERIENCE.md#Component Patterns / Interaction Primitives] — bascule de statut sur la fiche, exige/confirme le prix de vente, réversible ; tag *vendu* vert.
- [Source: PRD#FR4, NFR4] — vente, historique conservé durablement.
- Story précédente : `2-3-consulter-modifier-et-supprimer-une-piece.md` (PieceDetailScreen, champ prix de vente, updatePiece).

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (dev agent Amelia)

### Debug Log References

- `npm run build` → OK (precache 478 KiB). `npm run lint` (oxlint) → 0 erreur.
- Vérif transitions via API authentifiée : vendre → **204** (`statut=vendue`, `prix_vente_cents=2500`, `sold_at` posé) ; remettre en stock → **204** (`statut=en_stock`, `sold_at=null`) ; cleanup delete → 204. Réversibilité confirmée.

### Completion Notes List

- `updatePiece.ts` : ajout `sellPiece(id, prixVenteCents)` (statut vendue + prix_vente + sold_at=now ISO) et `restockPiece(id)` (statut en_stock + sold_at=null).
- `PieceDetailScreen.tsx` : section **Statut** — si *en stock* : bouton vert « Marquer comme vendue » (utilise le champ prix de vente existant ; bloque si vide → message doux) ; si *vendue* : « Vendu le JJ/MM/AAAA ✓ » + bouton « Remettre en stock ». `onChanged()` après transition (retour Stock + refresh).
- Une pièce vendue quitte automatiquement l'onglet Stock (usePieces filtre `en_stock`) ; conservée en DB (Historique = Epic 4).
- Marge **non** implémentée (Story 3.2). Aucune modif DB (colonnes déjà présentes).
- Pas de tests unitaires (transition = update Supabase, vérifié via API). Vitest arrive avec le calcul de marge (3.2/Epic 4).

### File List

**Modifiés**
- `src/features/pieces/updatePiece.ts` (+ `sellPiece`, `restockPiece`)
- `src/features/pieces/PieceDetailScreen.tsx` (section Statut : vendre / remettre en stock)

## Change Log

- 2026-07-25 — Implémentation Story 3.1 : bascule de statut sur la fiche (marquer vendue avec prix de vente requis + sold_at ; réversible remettre en stock). Build + lint OK ; transitions vérifiées (204). Statut → review.
