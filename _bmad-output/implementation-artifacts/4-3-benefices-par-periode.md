---
baseline_commit: 285435b0b561d311443ec7cf132d8bc1b803bda0
---

# Story 4.3: Bénéfices par période

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Ilan,
I want basculer mes bénéfices entre ce mois, cette année et depuis le début,
so that je mesure ma performance sur la fenêtre qui m'intéresse.

## Acceptance Criteria

1. **Sélecteur de période.** La carte Bénéfices propose 3 périodes : **ce mois** / **cette année** / **depuis le début**. (FR7)
2. **Recalcul par période.** Changer de période recalcule les **Bénéfices** ET la **Marge moyenne pondérée** sur la fenêtre choisie, à partir de `sold_at` (une vente compte si `sold_at` est dans la fenêtre). (FR7)
3. **Argent dormant non affecté.** L'**Argent dormant** (pièces en stock) ne dépend PAS de la période. (FR6)
4. **Recalcul instantané.** Le changement de période recalcule **côté client** sans refetch (les lignes sont déjà chargées).
5. **Fonction pure + testée.** Le filtrage par période vit dans `computeDashboard` (paramètre borne `soldAfter`) et est couvert par des **tests Vitest**.
6. **Défaut.** Période par défaut = **depuis le début** (comportement actuel de 4.1 préservé).
7. **Qualité.** `npm run test`, `npm run build`, `npm run lint` OK ; aucune régression.

## Tasks / Subtasks

- [x] **Task 1 — Étendre `computeDashboard` (borne temporelle) + tests** (AC: #2, #3, #5)
  - [x] `src/lib/derive.ts` : ajouter `sold_at: string | null` à `PriceRow`. `computeDashboard(pieces, soldAfterISO: string | null = null)` : une vendue compte dans bénéfices & marge moyenne **uniquement si** `sold_at != null && (soldAfterISO === null || sold_at >= soldAfterISO)`. Argent dormant inchangé (pas de filtre). Défaut `null` = tout (rétro-compatible).
  - [x] `src/lib/derive.test.ts` : cas — vente avant la borne exclue / après incluse ; `soldAfter = null` = total ; argent dormant non affecté par la borne.

- [x] **Task 2 — Exposer les lignes brutes depuis `useDashboard`** (AC: #4)
  - [x] `src/features/dashboard/useDashboard.ts` : ajouter `sold_at` au `select`. Exposer les **lignes brutes** `rows: PriceRow[]` (+ `empty, loading, error, refresh`) au lieu de `data` précalculé — le calcul par période se fait dans l'écran.

- [x] **Task 3 — Sélecteur + calcul dans `DashboardScreen`** (AC: #1, #2, #6)
  - [x] `src/features/dashboard/DashboardScreen.tsx` : props `rows` (au lieu de `data`). État `period: 'mois' | 'annee' | 'total'` (défaut `'total'`). Calcule la borne (`boundaryISO(period)`) puis `computeDashboard(rows, borne)`. Petit sélecteur segmenté sur/sous la carte Bénéfices (chips « Mois / Année / Total »), actif en teal. La Marge moyenne accolée suit la période.

- [x] **Task 4 — AppShell** (AC: #4)
  - [x] `src/app/AppShell.tsx` : passer `rows={dashboard.rows}` (adapter à la nouvelle sortie de `useDashboard`).

- [x] **Task 5 — Vérifications** (AC: #7)
  - [x] `npm run test`, `npm run build`, `npm run lint` OK.
  - [x] Test manuel : vendre une pièce aujourd'hui → visible en « Mois » ; basculer « Année » / « Total » ; l'argent dormant ne bouge pas selon la période.

## Dev Notes

### Calcul de la borne (Task 3)
```ts
function boundaryISO(period: 'mois' | 'annee' | 'total'): string | null {
  const now = new Date()
  if (period === 'mois') return new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  if (period === 'annee') return new Date(now.getFullYear(), 0, 1).toISOString()
  return null // total
}
```
- Comparaison `sold_at >= soldAfterISO` en chaînes ISO (ordre lexicographique = ordre chronologique pour l'ISO 8601 en UTC). `sold_at` est stocké en `timestamptz` et renvoyé en ISO par PostgREST — comparaison de chaînes correcte. Simple et suffisant pour l'usage (mono-utilisateur, faible volume).

### `computeDashboard` (rappel + extension)
- Déjà présent (4.1) : bénéfices = Σ marge € vendues ; marge moyenne pondérée = Σ marge € ÷ Σ prix d'achat vendues × 100 ; argent dormant = Σ prix d'achat en stock. **Ajouter** le filtre `soldAfterISO` sur les vendues UNIQUEMENT. Reste dérivé (AD-2), pur, jamais stocké.

### Refactor `useDashboard` → lignes brutes
- Aujourd'hui `useDashboard` renvoie `{ data, empty, loading, error, refresh }` (data = `computeDashboard(rows)`).
- **Changer** pour renvoyer `{ rows, empty, loading, error, refresh }` (rows = `PriceRow[]`). Le calcul (avec période) se fait dans `DashboardScreen`. `empty` = `rows.length === 0`.
- Ajouter `sold_at` au `.select('prix_achat_cents, prix_vente_cents, statut, sold_at')`.

### UX (sélecteur)
- Petit segment de 3 chips (« Mois », « Année », « Total ») lié à la carte Bénéfices. Actif = teal plein (cohérent avec les chips du reste de l'app), sur fond de la carte héro (contraste : chips claires sur le gradient, actif en blanc/teal). Ton court. Libellés visibles (a11y).
- Défaut « Total » (préserve 4.1). Le changement est instantané (state local, pas de fetch).

### Contexte hérité (fichiers modifiés)
- `src/lib/derive.ts` (+ `sold_at` sur `PriceRow`, borne sur `computeDashboard`), `src/lib/derive.test.ts` (+ cas période).
- `src/features/dashboard/useDashboard.ts` (expose `rows` + `sold_at`).
- `src/features/dashboard/DashboardScreen.tsx` (props `rows`, état période, calcul + sélecteur).
- `src/app/AppShell.tsx` (passe `rows`).
- Vitest configuré, `computeMargin`/`computeDashboard` déjà testés. Linter oxlint.

### Testing standards
- Étendre `derive.test.ts` (filtrage période). `npm run test`. Le reste vérifié manuellement.

### Project Structure Notes
- Aucun nouveau fichier ni dépendance ni modif DB. Extensions/refactor des fichiers dashboard + derive. Direction `ui → features → lib` préservée (`computeDashboard` reste dans `lib`, type structural local).

### References
- [Source: epics.md#Story 4.3] — user story + AC (FR7, SHOULD).
- [Source: PRD#4.4 FR-7] — bascule ce mois / cette année / depuis le début, à partir de la date de vente.
- [Source: EXPERIENCE.md#Component Patterns] — carte chiffre, sélecteur de période sur les bénéfices.
- [Source: ARCHITECTURE-SPINE.md#AD-2] — métriques dérivées (lib/derive), jamais stockées.
- Stories précédentes : `4-1` (computeDashboard, useDashboard, DashboardScreen), `3-1` (sold_at), `3-2` (Vitest, computeMargin).

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (dev agent Amelia)

### Debug Log References

- `npm run test` → **9 tests passent** (dont 2 nouveaux : borne période, `soldAfter=null` rétro-compatible). `npm run build` → OK. `npm run lint` → 0 erreur.

### Completion Notes List

- **`src/lib/derive.ts`** : `PriceRow` + `sold_at`. `computeDashboard(pieces, soldAfterISO = null)` : une vente compte dans bénéfices/marge moyenne **seulement si** `sold_at != null && (soldAfterISO === null || sold_at >= soldAfterISO)` ; argent dormant jamais borné. Comparaison de chaînes ISO (ordre chrono).
- **`src/features/dashboard/useDashboard.ts`** : expose les **lignes brutes** `rows` (+ `sold_at` au select) au lieu de `data` précalculé → recalcul par période côté écran, sans refetch.
- **`src/features/dashboard/DashboardScreen.tsx`** : props `rows` ; état `period` (défaut `total`) ; `boundaryISO()` (début du mois / début de l'année / null) ; `computeDashboard(rows, borne)` ; sélecteur segmenté « Mois / Année / Total » sur la carte héro (actif blanc/teal). Bénéfices + Marge moyenne suivent la période ; argent dormant non affecté.
- **`src/app/AppShell.tsx`** : passe `rows` au dashboard.
- Aucune modif DB ni dépendance. AD-2 respecté (dérivé, pur).

### File List

**Modifiés**
- `src/lib/derive.ts` (`sold_at` + borne `soldAfterISO`)
- `src/lib/derive.test.ts` (+ 2 tests période, `sold_at` sur les cas existants)
- `src/features/dashboard/useDashboard.ts` (expose `rows` + `sold_at`)
- `src/features/dashboard/DashboardScreen.tsx` (sélecteur période + calcul)
- `src/app/AppShell.tsx` (passe `rows`)

## Change Log

- 2026-07-25 — Implémentation Story 4.3 : sélecteur de période (mois/année/total) sur les bénéfices, recalcul client sans refetch, borne `soldAfter` dans `computeDashboard` (dérivé) + 2 tests. test + build + lint OK. Statut → review.
