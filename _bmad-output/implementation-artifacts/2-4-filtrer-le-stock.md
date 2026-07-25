---
baseline_commit: e4511d71ee2ebd34cda87bc62e837bd982089b6f
---

# Story 2.4: Filtrer le stock

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Ilan,
I want filtrer mes pièces par catégorie, couleur, taille et marque,
so that je retrouve une pièce précise quand mon stock grossit.

## Acceptance Criteria

1. **Bouton « Filtrer ».** L'écran Stock a un bouton « Filtrer » (avec un indicateur du nombre de filtres actifs) qui ouvre un panneau de filtres. (FR8, UX-DR)
2. **Filtres par facette.** Le panneau permet de filtrer par **catégorie, couleur, taille, marque** — catégorie/couleur en **chips** ; les valeurs proposées sont celles **réellement présentes** dans le stock (pas d'option morte). (FR8)
3. **Combinables (ET).** Plusieurs filtres se combinent : la liste n'affiche que les pièces correspondant à **toutes** les facettes actives. (FR8)
4. **Effacer.** Un moyen d'**effacer** tous les filtres restaure la liste complète. (FR8)
5. **Résultat vide filtré.** Si aucun résultat ne correspond aux filtres, un message clair « Aucune pièce ne correspond à tes filtres » (distinct de l'état « stock vide »).
6. **Périmètre.** Filtrage du **Stock** (pièces *en stock*) côté client, sur la liste déjà chargée (volume faible). Le filtrage de l'**Historique** (vendues) viendra avec l'écran Stats/Historique (Epic 4) — hors scope ici.
7. **Qualité.** `npm run build` + `npm run lint` OK ; aucune régression (liste, fiche, ajout).

## Tasks / Subtasks

- [x] **Task 1 — Modèle & logique de filtrage** (AC: #2, #3, #4)
  - [x] `src/features/pieces/filters.ts` :
    - type `PieceFilters = { categorie: string | null; couleur: string | null; taille: string | null; marque: string | null }`.
    - `EMPTY_FILTERS`, `activeFilterCount(filters)`.
    - `applyFilters(pieces, filters)` → ne garde que les pièces qui matchent **toutes** les facettes non nulles (comparaison stricte sur le champ ; ignore les facettes `null`).
    - `distinctValues(pieces, key)` → valeurs distinctes non nulles présentes pour une facette (triées), pour peupler les chips.

- [x] **Task 2 — Panneau de filtres** (AC: #1, #2, #4)
  - [x] `src/features/pieces/FilterPanel.tsx` : props `{ pieces, filters, onChange, onClose }`. Pour chaque facette (catégorie, couleur, taille, marque) : des **chips mono-choix** construites à partir de `distinctValues(pieces, facette)` (retaper une chip active la désélectionne → repasse à `null`). Bouton « Effacer les filtres » (→ `EMPTY_FILTERS`) et « Fermer ».
  - [x] Réutiliser le style chips (peut réutiliser `Chips` si adapté, ou un petit rendu local qui autorise la désélection). Panneau en overlay/feuille au-dessus du Stock.

- [x] **Task 3 — Intégration dans l'écran Stock** (AC: #1, #3, #5)
  - [x] `src/features/pieces/StockScreen.tsx` : ajouter l'état `filters` + `showFilters`. Bouton « 🔎 Filtrer » (badge du nombre de filtres actifs) qui ouvre `FilterPanel`. Appliquer `applyFilters(pieces, filters)` avant le rendu de la liste.
  - [x] Distinguer les deux états vides : **stock vide** (aucune pièce du tout) vs **aucun résultat filtré** (pièces existent mais aucune ne matche → message + action « Effacer les filtres »).

- [x] **Task 4 — Vérifications** (AC: #7)
  - [x] `npm run build` OK, `npm run lint` OK.
  - [x] Test manuel (≥2 pièces de catégories/couleurs différentes) : filtrer par une facette réduit la liste ; combiner deux facettes ; effacer restaure ; filtre sans résultat → message dédié.

## Dev Notes

### Contexte hérité (Stories 2.1→2.3 — déjà en place)
- `src/features/pieces/types.ts` : `Piece`, `CATEGORIES`, `COULEURS`, helpers prix. `Chips.tsx` (mono-choix, **ne gère pas** la désélection actuellement — pour les filtres, autoriser le re-tap pour désélectionner : soit étendre `Chips` avec une prop optionnelle `allowDeselect`, soit un petit rendu local dans `FilterPanel`).
- **`src/features/pieces/StockScreen.tsx`** (à modifier) : reçoit `{ pieces, urls, loading, error, onSelect }` du shell (via `usePieces`). Affiche titre « Mon stock », skeleton, **état vide** si `pieces.length === 0`, sinon la liste de `PieceRow`. → Ajouter ici l'état des filtres + le bouton + l'application des filtres. Ne pas casser le passage des props ni `onSelect`.
- `usePieces` (dans le shell) fournit déjà toutes les pièces *en stock* ; **le filtrage est purement côté client** — ne pas retoucher la requête Supabase.
- Tokens DESIGN, ton chaleureux, linter oxlint, pas de router.

### Détails de filtrage
- Comparaison stricte par facette : `filters.categorie == null || piece.categorie === filters.categorie` (idem couleur/taille/marque), toutes en **ET**.
- `distinctValues` : `[...new Set(pieces.map(p => p[key]).filter(Boolean))].sort()` — n'affiche que les valeurs présentes (ex. si aucune pièce n'a de marque, la facette Marque est vide → la masquer).
- Masquer une facette dont `distinctValues` est vide (évite un groupe de chips vide).
- `activeFilterCount` = nombre de facettes non nulles (pour le badge du bouton).

### UX
- Bouton « Filtrer » en haut de l'écran Stock (près du titre « Mon stock »), avec un petit badge teal si des filtres sont actifs.
- Panneau : overlay simple (au-dessus du Stock) ou section dépliable ; chips par facette ; « Effacer » (retrait `text-amber`/discret) + « Fermer » (bouton teal). Ton chaleureux.
- Chip active du filtre = teal plein (comme ailleurs) ; re-tap = désélection.
- Deux états vides bien distincts (AC #5) : « Ton stock est vide » (déjà là) vs « Aucune pièce ne correspond à tes filtres » + bouton « Effacer les filtres ».

### Testing standards
- Un test unitaire de `applyFilters` / `distinctValues` (fonctions pures) serait pertinent, mais Vitest n'est pas encore configuré → rester en vérif manuelle (build + lint + test manuel). Ne pas installer Vitest juste pour ça ici (arrive Epic 3/4). Le dev peut ajouter un test si trivial et sans nouvelle dépendance lourde.

### Project Structure Notes
- Nouveaux : `src/features/pieces/filters.ts`, `src/features/pieces/FilterPanel.tsx`. Modifiés : `src/features/pieces/StockScreen.tsx` (+ éventuellement `Chips.tsx` si on ajoute `allowDeselect`).
- Direction `ui → features → lib`. Filtrage 100% client, aucune modif DB/requête.

### References
- [Source: epics.md#Story 2.4] — user story + AC (FR8, SHOULD).
- [Source: EXPERIENCE.md#Component Patterns / Information Architecture] — bouton « Filtrer », chips liste fermée, filtres combinables (Stock / Historique).
- [Source: PRD#FR8] — filtrer par catégorie/couleur/taille/marque, combinables.
- [Source: ARCHITECTURE-SPINE.md] — lecture via supabase-js déjà faite (usePieces) ; filtrage présentation côté client.
- Stories précédentes : `2-2-parcourir-son-stock.md` (StockScreen, usePieces, PieceRow), `2-1-ajouter-une-piece.md` (Chips, listes fermées).

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (dev agent Amelia)

### Debug Log References

- `npm run build` → OK (precache 476 KiB). `npm run lint` (oxlint) → 0 erreur.
- Filtrage 100% client (fonctions pures) — pas de voie DB à vérifier.

### Completion Notes List

- `filters.ts` : `PieceFilters`, `EMPTY_FILTERS`, `activeFilterCount`, `applyFilters` (ET sur facettes non nulles), `distinctValues` (valeurs présentes triées, locale FR).
- `FilterPanel.tsx` : overlay plein écran, une section de chips par facette (catégorie/couleur/taille/marque) peuplée par `distinctValues` (facette masquée si aucune valeur) ; re-tap = désélection ; boutons « Effacer » / « Fermer ».
- `StockScreen.tsx` : état `filters` + `showFilters` ; bouton « 🔎 Filtrer » avec badge du nombre de filtres actifs ; `applyFilters` avant rendu ; **deux états vides distincts** (stock vide vs aucun résultat filtré + « Effacer les filtres »).
- Aucune modif DB/requête ni dépendance. Pas de tests unitaires (Vitest pas encore configuré ; `applyFilters`/`distinctValues` testables plus tard). Vérif = build + lint + test manuel.

### File List

**Nouveaux**
- `src/features/pieces/filters.ts`
- `src/features/pieces/FilterPanel.tsx`

**Modifiés**
- `src/features/pieces/StockScreen.tsx` (bouton Filtrer + badge, application des filtres, états vides distincts)

## Change Log

- 2026-07-25 — Implémentation Story 2.4 : filtres du Stock (catégorie/couleur/taille/marque, combinables, effacer) côté client ; panneau de filtres à chips ; états vides distincts. Build + lint OK. Statut → review.
