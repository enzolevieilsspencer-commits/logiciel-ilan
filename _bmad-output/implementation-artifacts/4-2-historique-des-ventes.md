---
baseline_commit: 51dc2d0b3c1ca4ade1493d9c2c8ff7b39e7a01a0
---

# Story 4.2: Historique des ventes

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Ilan,
I want consulter mes pièces vendues dans l'onglet Stats,
so that je garde une trace de mes ventes et de leurs marges.

## Acceptance Criteria

1. **Onglet Stats = Historique.** L'onglet **Stats** liste les pièces **vendues** (`statut='vendue'`), triées par **date de vente** décroissante (`sold_at` desc). Remplace le placeholder Stats. (FR4)
2. **Ligne de pièce vendue.** Chaque ligne : vignette photo (URL **signée**), méta (catégorie · couleur · taille), **tag « vendu » (vert)** et la **marge €** de la pièce (via `computeMargin`, positive en vert / négative en ambre). (FR4, AD-5)
3. **État vide.** Aucune vente → message chaleureux (« Pas encore de vente. Ta première marge s'affichera ici. »), distinct d'un stock vide. (UX-DR8)
4. **Chargement.** Skeleton discret (comme le Stock).
5. **Mise à jour.** Après une vente / remise en stock / modif, l'historique reflète le changement.
6. **Qualité.** `npm run test`, `npm run build`, `npm run lint` OK ; aucune régression (Stock, dashboard, fiche).

## Tasks / Subtasks

- [x] **Task 1 — Généraliser `usePieces` par statut** (AC: #1, #5)
  - [x] `src/features/pieces/usePieces.ts` : accepter un paramètre `statut: Statut` (défaut `'en_stock'` pour ne pas casser le Stock). Filtrer `.eq('statut', statut)` ; trier par `sold_at` desc si `vendue`, sinon `created_at` desc. Le reste (URLs signées, refresh) inchangé.

- [x] **Task 2 — `PieceRow` conscient du statut** (AC: #2)
  - [x] `src/features/pieces/PieceRow.tsx` : si `piece.statut === 'vendue'` → tag « vendu » vert (`bg` menthe/`text-green`) + **marge €** à droite (calculée via `computeMargin(prix_achat_cents, prix_vente_cents)`, formatée `+X,XX €` / `−X,XX €`, vert si ≥ 0 sinon ambre). Sinon comportement actuel (tag « en stock », pas de marge). Ne pas casser l'usage existant dans le Stock.

- [x] **Task 3 — Écran Historique** (AC: #1, #3, #4)
  - [x] `src/features/pieces/HistoryScreen.tsx` : mêmes props que `StockScreen` (`pieces, urls, loading, error, onSelect`) ; titre « Historique » ; skeleton ; **état vide** dédié ; liste de `PieceRow` (des vendues). Tap → `onSelect` (ouvre la fiche, réversible depuis 3.1).

- [x] **Task 4 — Intégration AppShell** (AC: #1, #5)
  - [x] `src/app/AppShell.tsx` : `const stock = usePieces('en_stock')` (adapter la destructuration existante) ; ajouter `const history = usePieces('vendue')`. Onglet **Stats** → `<HistoryScreen ... onSelect={setSelected} />`. `refreshAll()` rafraîchit stock + **history** + dashboard.

- [x] **Task 5 — Vérifications** (AC: #6)
  - [x] `npm run test`, `npm run build`, `npm run lint` OK.
  - [x] Test manuel : vendre une pièce → apparaît dans Stats avec sa marge ; onglet Stats vide → état vide ; tri par date de vente.

## Dev Notes

### Contexte hérité (à réutiliser / modifier)
- **`src/features/pieces/usePieces.ts`** : actuellement hardcode `statut='en_stock'` + tri `created_at`. Le généraliser (param `statut`). `Statut` est exporté de `types.ts`.
- **`src/features/pieces/PieceRow.tsx`** : actuellement tag « en stock » en dur, pas de marge. Le rendre conscient du statut (sans casser le Stock). `computeMargin` est dans `src/lib/derive.ts` (retourne `{ margeCents, pct }` ou `null`).
- **`src/features/pieces/StockScreen.tsx`** : bon modèle pour `HistoryScreen` (skeleton, état vide, liste). Ne PAS le modifier.
- **`src/app/AppShell.tsx`** : appelle `usePieces()` (→ `usePieces('en_stock')`), a `useDashboard`, `refreshAll()`. Onglet `stats` = placeholder « Bientôt » à remplacer. `selected`/`setSelected` gère l'ouverture de fiche.
- Tokens DESIGN (tag vendu vert), bucket privé (URLs signées déjà gérées par `usePieces`). Linter oxlint.

### Formatage marge (Task 2)
```ts
import { computeMargin } from '../../lib/derive'
const m = computeMargin(piece.prix_achat_cents, piece.prix_vente_cents)
// m?.margeCents : formater +X,XX € / −X,XX € ; couleur text-green si >= 0 sinon text-amber
```
Réutiliser la même logique de format que la fiche (signe + valeur absolue en €). Si `m` est `null` (prix manquant), ne pas afficher de marge.

### Récupération (rappel)
```ts
// dans usePieces généralisé
.eq('statut', statut)
.order(statut === 'vendue' ? 'sold_at' : 'created_at', { ascending: false })
```
RLS filtre déjà par utilisateur. Deux instances de `usePieces` dans AppShell (stock + history) → deux fetchs indépendants ; c'est acceptable (volume faible) et cohérent avec le pattern existant.

### Testing standards
- Pas de nouveau test unitaire requis (réutilise `computeMargin` déjà testé, et de la lecture Supabase). Vérif = `test` (non-régression) + `build` + `lint` + test manuel. (Si le format de marge est extrait en helper pur, un petit test est bienvenu mais non obligatoire.)

### Project Structure Notes
- Nouveau : `src/features/pieces/HistoryScreen.tsx`. Modifiés : `src/features/pieces/usePieces.ts` (param statut), `src/features/pieces/PieceRow.tsx` (statut-aware), `src/app/AppShell.tsx` (history + onglet Stats + refresh). Aucune modif DB.
- Direction `ui → features → lib` respectée (features → lib pour `computeMargin`).

### References
- [Source: epics.md#Story 4.2] — user story + AC (FR4, historique conservé).
- [Source: PRD#4.4 FR-6 / NFR4] — historique des ventes durable, marge par pièce.
- [Source: EXPERIENCE.md#Information Architecture / Component Patterns / State Patterns] — onglet Stats = Historique, ligne de pièce vendue (tag vendu vert + marge €), état vide « Ta première marge s'affichera ici ».
- [Source: ARCHITECTURE-SPINE.md] — AD-1/AD-5 (lecture via supabase-js, URLs signées), AD-2 (marge dérivée `lib/derive`).
- Stories précédentes : `2-2` (usePieces, PieceRow, StockScreen), `3-1` (sold_at), `3-2` (computeMargin), `4-1` (AppShell dashboard + refreshAll).

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (dev agent Amelia)

### Debug Log References

- `npm run test` → 7 tests passent (non-régression). `npm run build` → OK. `npm run lint` (oxlint) → 0 erreur.

### Completion Notes List

- **`usePieces.ts`** généralisé : param `statut: Statut = 'en_stock'` (défaut inchangé), `.eq('statut', statut)`, tri `sold_at` desc si vendue sinon `created_at` desc, `statut` en dépendance du `useCallback`. Le Stock reste identique.
- **`PieceRow.tsx`** conscient du statut : vendue → tag « vendu » vert + **marge €** (via `computeMargin`, vert si ≥ 0 sinon ambre) ; en stock → comportement inchangé.
- **`HistoryScreen.tsx`** (nouveau) : liste des vendues (skeleton, état vide « Pas encore de vente », tap → fiche).
- **`AppShell.tsx`** : `usePieces('en_stock')` + `usePieces('vendue')` (history) + `useDashboard` ; onglet Stats = `HistoryScreen` ; `refreshAll()` rafraîchit les trois.
- Aucune modif DB. Réutilisation maximale (usePieces, PieceRow, computeMargin, pattern StockScreen).

### File List

**Nouveaux**
- `src/features/pieces/HistoryScreen.tsx`

**Modifiés**
- `src/features/pieces/usePieces.ts` (param statut + tri)
- `src/features/pieces/PieceRow.tsx` (statut-aware + marge €)
- `src/app/AppShell.tsx` (history hook, onglet Stats → HistoryScreen, refresh)

## Change Log

- 2026-07-25 — Implémentation Story 4.2 : historique des ventes (onglet Stats) — usePieces généralisé par statut, PieceRow conscient du statut (tag vendu + marge €), HistoryScreen, branchement AppShell. test + build + lint OK. Statut → review.
