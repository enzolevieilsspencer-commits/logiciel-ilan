---
baseline_commit: aa2fb0fdc36d1a326dc196d8e0e11c9af0e76254
---

# Story 4.1: Tableau de bord — bénéfices, marge moyenne, argent dormant

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Ilan,
I want voir sur l'accueil mes bénéfices avec ma marge moyenne pondérée accolée, et mon argent dormant,
so that je connais ma situation en trois secondes.

## Acceptance Criteria

1. **Carte Bénéfices (héro).** L'accueil affiche une carte proéminente **Bénéfices** = Σ des marges € des pièces *vendues* (depuis le début), avec la **Marge moyenne pondérée accolée** = `Σ marge € ÷ Σ prix d'achat (vendues) × 100`. (FR6, AD-2)
2. **Carte Argent dormant.** Une carte **Argent dormant** = Σ des prix d'achat des pièces *en stock*. (FR6, AD-2)
3. **Tout dérivé.** Bénéfices, marge moyenne, argent dormant sont **calculés à la lecture** (via `lib/derive`), **jamais stockés**. (AD-2)
4. **Fonction pure + testée.** L'agrégation vit dans `src/lib/derive.ts` (`computeDashboard`, pure) et est couverte par des **tests Vitest**.
5. **Mise à jour.** Les chiffres se mettent à jour après tout **ajout / vente / modification / suppression** de pièce.
6. **Libellés (a11y).** Chaque valeur est accompagnée de son **libellé** (« Bénéfices », « Marge moyenne », « Argent dormant ») — jamais la couleur seule. (UX-DR10)
7. **État vide.** Sans aucune donnée pertinente, un état vide chaleureux invite à ajouter une première pièce (pas de « 0 € » sec et froid). (UX-DR8)
8. **Périmètre.** Bénéfices **total (depuis le début)** ici ; le **sélecteur de période** (ce mois / cette année / total) est la Story 4.3. La liste de l'Historique est la Story 4.2.
9. **Qualité.** `npm run test`, `npm run build`, `npm run lint` OK ; aucune régression.

## Tasks / Subtasks

- [x] **Task 1 — Agrégation dashboard (pure) + tests** (AC: #1, #2, #3, #4)
  - [x] `src/lib/derive.ts` : ajouter `DashboardData` + `computeDashboard(pieces)` → `{ beneficesCents, margeMoyennePct: number | null, argentDormantCents }`. Voir Dev Notes pour les formules exactes (réutiliser l'esprit de `computeMargin`).
  - [x] `src/lib/derive.test.ts` : ajouter des cas — bénéfices/marge moyenne pondérée sur 2 pièces vendues, argent dormant sur pièces en stock, aucun vendu ⇒ `margeMoyennePct = null` & bénéfices 0, prix nuls ignorés proprement.

- [x] **Task 2 — Récupération des données** (AC: #5)
  - [x] `src/features/dashboard/useDashboard.ts` : hook qui récupère les pièces nécessaires (`select('prix_achat_cents, prix_vente_cents, statut')`, tous statuts — RLS filtre par utilisateur), calcule via `computeDashboard`, expose `{ data, loading, error, refresh }`.
  - [x] Supprimer `src/features/dashboard/.gitkeep`.

- [x] **Task 3 — Écran dashboard (Accueil)** (AC: #1, #2, #6, #7)
  - [x] `src/features/dashboard/DashboardScreen.tsx` : carte héro Bénéfices (gradient teal, gros chiffre) + Marge moyenne pondérée accolée ; carte Argent dormant (ambre) ; libellés visibles ; état vide chaleureux ; skeleton au chargement.
  - [x] `src/app/AppShell.tsx` : remplacer le **placeholder** de l'onglet Accueil (« Salut Ilan / X pièces en stock ») par `<DashboardScreen>`. Rafraîchir le dashboard **et** le stock après ajout/vente/modif/suppression (appeler les deux `refresh`).

- [x] **Task 4 — Vérifications** (AC: #9)
  - [x] `npm run test` (nouveaux cas passent), `npm run build` OK, `npm run lint` OK.
  - [x] Test manuel : vendre une pièce → Bénéfices + Marge moyenne se mettent à jour ; ajouter une pièce en stock → Argent dormant augmente ; sans données → état vide.

## Dev Notes

### Formules (Task 1) — dans `src/lib/derive.ts`
```ts
import type { Piece } from '../features/pieces/types' // (ou déplacer le type — voir note)

export interface DashboardData {
  beneficesCents: number          // Σ (prix_vente − prix_achat) des vendues
  margeMoyennePct: number | null  // Σ marge € ÷ Σ prix d'achat (vendues) × 100 ; null si Σ achat = 0
  argentDormantCents: number      // Σ prix_achat des pièces en stock
}

export function computeDashboard(pieces: Piece[]): DashboardData {
  let beneficesCents = 0
  let sommeAchatVendues = 0
  let argentDormantCents = 0
  for (const p of pieces) {
    if (p.statut === 'vendue' && p.prix_achat_cents != null && p.prix_vente_cents != null) {
      beneficesCents += p.prix_vente_cents - p.prix_achat_cents
      sommeAchatVendues += p.prix_achat_cents
    } else if (p.statut === 'en_stock' && p.prix_achat_cents != null) {
      argentDormantCents += p.prix_achat_cents
    }
  }
  const margeMoyennePct = sommeAchatVendues > 0 ? (beneficesCents / sommeAchatVendues) * 100 : null
  return { beneficesCents, margeMoyennePct, argentDormantCents }
}
```
- **Marge moyenne PONDÉRÉE** (décision produit) : ratio des sommes, PAS la moyenne des %. C'est le point clé de la story.
- Tout dérivé, jamais stocké (AD-2). RLS filtre déjà par utilisateur.
- Note import type : `Piece` vit dans `src/features/pieces/types.ts`. `lib` important d'un `features` va à contre-sens de la direction `ui → features → lib`. **Préférence** : définir un type minimal local dans `derive.ts` (ex. `PiecePricing = Pick<...>`) OU accepter des paramètres primitifs. Le plus propre : `computeDashboard` prend un tableau d'objets `{ statut, prix_achat_cents, prix_vente_cents }` (type structural local à `lib`), sans importer `features`. Choisir cette option pour respecter la direction de dépendance.

### Récupération (Task 2)
```ts
const { data, error } = await supabase
  .from('piece')
  .select('prix_achat_cents, prix_vente_cents, statut')
```
- Tous statuts (vendues + en stock). RLS restreint à l'utilisateur.
- `useDashboard` expose `refresh` ; `AppShell` l'appelle après chaque mutation (comme `usePieces.refresh`).

### Affichage (Task 3)
- **Carte héro Bénéfices** : gradient teal (comme la maquette `mockups/key-screens.html`), gros chiffre `centsToEuros(beneficesCents)` + « € », et à côté la **Marge moyenne** (`Math.round(margeMoyennePct) %` ou « — » si null). Libellés « Bénéfices » / « Marge moyenne ».
- **Carte Argent dormant** : fond blanc, chiffre en ambre (`text-amber`), libellé « Argent qui dort » (ton chaleureux, vocabulaire Glossaire).
- Réutiliser `centsToEuros` (de `types.ts`) pour formater ; attention au signe des bénéfices (peut être négatif). Format € FR.
- **État vide** (aucune pièce du tout) : message chaleureux + invite à ajouter (le FAB est déjà sur l'Accueil).
- Skeleton discret pendant `loading`.

### Contexte hérité
- `src/app/AppShell.tsx` (à modifier) : onglet `accueil` = placeholder actuel (`Salut Ilan` + compteur via `usePieces`). Le FAB est déjà présent sur Accueil. `usePieces` reste pour le Stock. Ajouter `useDashboard` et brancher les refresh sur les mêmes points que `usePieces.refresh` (onAdded/onChanged/onDeleted).
- `src/lib/derive.ts` (à étendre) : contient `computeMargin` (Story 3.2) + son test. Vitest configuré (`vitest.config.ts`, script `test`).
- `src/features/dashboard/` : ne contient qu'un `.gitkeep` (à supprimer). Tokens DESIGN. Linter oxlint.

### Testing standards
- Étendre `src/lib/derive.test.ts` avec les cas `computeDashboard`. `npm run test`. Affichage vérifié manuellement.

### Project Structure Notes
- Nouveaux : `src/features/dashboard/{useDashboard.ts,DashboardScreen.tsx}`. Modifiés : `src/lib/derive.ts` (+`computeDashboard`), `src/lib/derive.test.ts` (+cas), `src/app/AppShell.tsx` (Accueil → dashboard + double refresh). Supprimé : `src/features/dashboard/.gitkeep`.
- Respect direction `ui → features → lib` : `computeDashboard` ne doit PAS importer de `features` (type structural local).

### References
- [Source: epics.md#Story 4.1] — user story + AC (FR6).
- [Source: PRD#4.4 FR-6] — bénéfices + marge moyenne pondérée accolée, argent dormant, mise à jour après tout changement ; marge moyenne = pondérée.
- [Source: ARCHITECTURE-SPINE.md#AD-2] — métriques dérivées (calcul à la lecture, `lib/derive`), jamais stockées ; marge moyenne pondérée `Σ marge € ÷ Σ prix d'achat`.
- [Source: EXPERIENCE.md#Component Patterns / State Patterns / Accessibility Floor] — carte chiffre (bénéfices → marge accolée), argent dormant, libellé + valeur (jamais couleur seule), états vides, ordre de lecture.
- [Source: DESIGN.md] — carte héro teal, ambre pour l'argent dormant.
- [Source: mockups/key-screens.html] — disposition de l'accueil.
- Stories précédentes : `3-2-voir-la-marge-d-une-piece.md` (`lib/derive`, Vitest), `2-2` (AppShell, usePieces, refresh).

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (dev agent Amelia)

### Debug Log References

- `npm run test` → **7 tests passent** (4 computeMargin + 3 computeDashboard : agrégats, marge pondérée 50 %, aucun vendu → null, vendue à prix incomplet ignorée).
- `npm run build` → OK. `npm run lint` (oxlint) → 0 erreur.

### Completion Notes List

- **`src/lib/derive.ts`** : ajout `PriceRow` (type structural local — `lib` n'importe PAS `features`, direction `ui→features→lib` respectée), `DashboardData`, `computeDashboard(pieces)` : bénéfices = Σ marges € vendues ; **marge moyenne PONDÉRÉE** = Σ marge € ÷ Σ prix d'achat vendues × 100 (null si base nulle) ; argent dormant = Σ prix d'achat en stock. Tout dérivé (AD-2).
- **`src/features/dashboard/useDashboard.ts`** : fetch `select('prix_achat_cents, prix_vente_cents, statut')` (tous statuts, RLS), `computeDashboard`, expose `{ data, empty, loading, error, refresh }`.
- **`src/features/dashboard/DashboardScreen.tsx`** : carte héro Bénéfices (gradient teal) + Marge moyenne accolée, carte Argent dormant (ambre), libellés visibles (a11y), état vide chaleureux, skeleton.
- **`src/app/AppShell.tsx`** : onglet Accueil = `DashboardScreen` (placeholder retiré) ; `refreshAll()` rafraîchit stock **et** dashboard après ajout/vente/modif/suppression.
- Bénéfices **total** (période = Story 4.3). Aucune modif DB.

### File List

**Nouveaux**
- `src/features/dashboard/useDashboard.ts`
- `src/features/dashboard/DashboardScreen.tsx`

**Modifiés**
- `src/lib/derive.ts` (+ `PriceRow`, `DashboardData`, `computeDashboard`)
- `src/lib/derive.test.ts` (+ 3 cas `computeDashboard`)
- `src/app/AppShell.tsx` (Accueil → dashboard, double refresh)

**Supprimés**
- `src/features/dashboard/.gitkeep`

## Change Log

- 2026-07-25 — Implémentation Story 4.1 : tableau de bord (bénéfices + marge moyenne pondérée accolée + argent dormant), agrégation pure `computeDashboard` (dérivée, jamais stockée) + 3 tests, `useDashboard`, `DashboardScreen`, branchement Accueil + double refresh. test + build + lint OK. Statut → review.
