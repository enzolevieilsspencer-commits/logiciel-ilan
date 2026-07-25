---
baseline_commit: 66dd1c0e56c5a3da7c6157fb604763b73d6c692f
---

# Story 3.2: Voir la marge d'une pièce

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Ilan,
I want voir la marge (€ et %) de ma pièce se calculer automatiquement,
so that je sais immédiatement combien elle m'a rapporté.

## Acceptance Criteria

1. **Calcul de la marge.** Pour une pièce avec **prix d'achat ET prix de vente** présents, la marge est calculée : **marge € = prix vente − prix achat** ; **marge % = marge € ÷ prix achat × 100**. (FR5)
2. **Affichée en grand.** La marge s'affiche de façon proéminente sur la fiche (ex. « +19 €, 76 % »), positive en vert, négative en couleur d'alerte. (FR5, UX)
3. **Recalcul live.** Modifier le prix d'achat ou le prix de vente **recalcule immédiatement** la marge affichée (avant même d'enregistrer). (FR5)
4. **Jamais stockée.** La marge est **dérivée** (calculée à la lecture), jamais persistée en base. (AD-2)
5. **Cas limites.** Si prix d'achat ou prix de vente absent → pas de marge affichée. Si prix d'achat = 0 → afficher la marge € mais pas le % (division impossible). Marge négative gérée proprement.
6. **Fonction pure + testée.** Le calcul vit dans `src/lib/derive.ts` (fonction pure, en centimes) et est couvert par un **test unitaire Vitest** (premier test du projet).
7. **Qualité.** `npm run build`, `npm run lint`, `npm run test` OK ; aucune régression.

## Tasks / Subtasks

- [x] **Task 1 — Mettre en place Vitest** (AC: #6, #7)
  - [x] `npm i -D vitest` (version courante **4.1.10**).
  - [x] Créer `vitest.config.ts` **séparé** (n'importe PAS les plugins de `vite.config.ts` → pas de PWA/tailwind/react dans les tests) : `environment: 'node'`. Voir Dev Notes.
  - [x] Ajouter les scripts `package.json` : `"test": "vitest run"`, `"test:watch": "vitest"`.

- [x] **Task 2 — Calcul de marge (pur) + test** (AC: #1, #4, #5, #6)
  - [x] `src/lib/derive.ts` : `computeMargin(prixAchatCents, prixVenteCents)` → renvoie `{ margeCents, pct }` (ou `null` si un prix manque). `pct = null` si `prixAchatCents <= 0`. Fonction **pure**, en centimes (pas de flottant sur l'argent ; `pct` calculé en number).
  - [x] `src/lib/derive.test.ts` : cas positif (600→2500 ⇒ +1900 cts, 316,67 %… vérifier la formule), négatif, `prixAchat=0` (pct null), un prix `null` ⇒ résultat `null`.

- [x] **Task 3 — Affichage sur la fiche** (AC: #2, #3, #5)
  - [x] `src/features/pieces/PieceDetailScreen.tsx` : calculer la marge **en live** depuis les valeurs courantes du formulaire (`eurosToCents(prixAchat)`, `eurosToCents(prixVente)`) via `computeMargin`, et l'afficher en grand (encart) quand elle existe. Vert si ≥ 0, ambre si < 0. Format : `+X,XX €` et `· Y %` (arrondi entier). Masquer si pas calculable.

- [x] **Task 4 — Vérifications** (AC: #7)
  - [x] `npm run test` (le test passe), `npm run build` OK, `npm run lint` OK.
  - [x] Test manuel : ouvrir une pièce avec prix d'achat + prix de vente → marge affichée ; changer un prix → marge se met à jour ; enlever un prix → marge disparaît.

## Dev Notes

### Vitest (vérifié web 2026-07-25)
- **vitest 4.1.10** (Vitest 4.x ; peer Vite `^6||^7||^8` → OK avec Vite 8). Node 20/22/24+ (on est en 24). ESM natif.
- **Config séparée obligatoire** pour ne pas embarquer les plugins de l'app (PWA/tailwind/react) dans les tests :
```ts
// vitest.config.ts (racine)
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
```
- **Imports explicites** dans les tests (`import { describe, it, expect } from 'vitest'`) → **aucune** modif `tsconfig` nécessaire (les types viennent du package `vitest`). Ne pas activer `globals`.
- Glob par défaut : `**/*.{test,spec}.?(c|m)[jt]s?(x)` ; ici on cible `src/**/*.test.ts`.

### `src/lib/derive.ts` (forme cible)
```ts
export interface Margin {
  margeCents: number      // prix vente − prix achat (centimes)
  pct: number | null      // marge % (null si prix d'achat <= 0)
}

/** Marge dérivée d'une pièce. `null` si un des deux prix manque. Jamais stockée (AD-2). */
export function computeMargin(
  prixAchatCents: number | null,
  prixVenteCents: number | null,
): Margin | null {
  if (prixAchatCents == null || prixVenteCents == null) return null
  const margeCents = prixVenteCents - prixAchatCents
  const pct = prixAchatCents > 0 ? (margeCents / prixAchatCents) * 100 : null
  return { margeCents, pct }
}
```
> Exemple : achat 6,00 € (600) → vente 25,00 € (2500) ⇒ margeCents 1900 (+19,00 €), pct = 1900/600×100 ≈ **316,67 %**. (La maquette « 76 % » correspondait à achat 6 → vente ~10,6 ; peu importe, la **formule** fait foi.)

### Affichage (PieceDetailScreen)
- Calcul **live** à partir des champs du formulaire (state `prixAchat`/`prixVente` déjà présents), pas de `prix_vente_cents` figé : `computeMargin(eurosToCents(prixAchat), eurosToCents(prixVente))`.
- Encart marge quand `!== null` : `margeCents/100` formaté en € (réutiliser un format cohérent avec `centsToEuros`, avec signe `+`/`−`), et `pct` arrondi entier suivi de « % » (masquer le % si `pct === null`).
- Couleur : `text-green` si `margeCents >= 0`, `text-amber` si `< 0`. Placer l'encart en évidence (ex. sous la photo ou en tête de fiche).
- **Ne pas** persister la marge (aucune colonne, aucun champ patché). AD-2.

### Contexte hérité
- `src/features/pieces/PieceDetailScreen.tsx` (à modifier) : a déjà `prixAchat`/`prixVente` (states), `eurosToCents`/`centsToEuros` (depuis `types.ts`), la section Statut (3.1). Ajouter l'encart marge.
- `src/lib/` ne contient que `supabase.ts` → y ajouter `derive.ts` (couche `lib`, conforme AD paradigme : les features consomment `lib`).
- Linter oxlint. Build tsc + vite. Ne pas toucher DB.

### Testing standards
- **Premier test du projet** : `computeMargin` (fonction pure) est le candidat idéal. Couvrir : marge positive, négative, `prixAchat = 0` (pct null), entrée `null`. Lancer via `npm run test`.
- L'affichage reste vérifié manuellement.

### Project Structure Notes
- Nouveaux : `vitest.config.ts`, `src/lib/derive.ts`, `src/lib/derive.test.ts`. Modifiés : `package.json` (+ `vitest` dev, scripts), `src/features/pieces/PieceDetailScreen.tsx` (encart marge).
- Dépendance ajoutée (spécifiée par cette story) : `vitest` (dev).

### References
- [Source: epics.md#Story 3.2] — user story + AC (FR5).
- [Source: ARCHITECTURE-SPINE.md#AD-2] — métriques dérivées, jamais stockées ; calcul dans `lib/derive`. [Testing standards] : Vitest introduit avec `lib/derive`.
- [Source: PRD#FR5] — marge € et %, recalcul immédiat.
- [Source: EXPERIENCE.md#Key Flows UJ-2] — « la Marge s'affiche en grand et fier (+19 €, 76 %) ».
- Story précédente : `3-1-passer-une-piece-en-vendue.md` (fiche, prix de vente, statut).
- Vérifié web 2026-07-25 : vitest 4.1.10, config séparée `vitest/config`, imports explicites (pas de types tsconfig).

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (dev agent Amelia)

### Debug Log References

- `npm run test` (vitest 4.1.10) → **4 tests passent** (computeMargin : positif, négatif, achat=0 → pct null, prix manquant → null).
- `npm run build` → OK. `npm run lint` (oxlint) → 0 erreur.
- Note : `npm i -D vitest` a affiché un avis `npm audit` sur une dépendance transitive de test (dev-only, non embarquée en prod) ; pas de `audit fix --force` appliqué pour ne pas casser des versions.

### Completion Notes List

- **Vitest 4.1.10** installé (dev). `vitest.config.ts` **séparé** (`environment: 'node'`, sans les plugins app) → tests rapides sans PWA/tailwind/react. Scripts `test` / `test:watch`.
- **`src/lib/derive.ts`** : `computeMargin(prixAchatCents, prixVenteCents)` pur → `{ margeCents, pct }` ou `null` ; `pct = null` si achat ≤ 0. **Jamais stockée** (AD-2). Premier module `lib/derive`.
- **`src/lib/derive.test.ts`** : 4 cas (positif, négatif, achat=0, prix manquant).
- **`PieceDetailScreen.tsx`** : encart Marge en grand, calculé **en live** depuis les champs (recalcul immédiat à l'édition), vert si ≥ 0 / ambre si < 0, `+X,XX € · Y %` (% masqué si non calculable), masqué si un prix manque.
- Aucune modif DB.

### File List

**Nouveaux**
- `vitest.config.ts`
- `src/lib/derive.ts`
- `src/lib/derive.test.ts`

**Modifiés**
- `src/features/pieces/PieceDetailScreen.tsx` (encart marge live)
- `package.json`, `package-lock.json` (`vitest` dev + scripts test)

## Change Log

- 2026-07-25 — Implémentation Story 3.2 : calcul & affichage de la marge (fonction pure `lib/derive` dérivée, jamais stockée ; encart live vert/ambre sur la fiche). Vitest 4 introduit + 4 tests unitaires. test + build + lint OK. Statut → review.
