---
baseline_commit: c7b08c56998b6fb5854450d3a02ff82aec15664f
---

# Story 4.4: Alerte pièces qui stagnent

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Ilan,
I want que l'app mette en évidence les pièces *en stock* depuis plus de 60 jours,
so that je pense à les baisser ou les brader.

## Acceptance Criteria

1. **Mise en évidence des pièces stagnantes.** Dans le Stock, une pièce *en stock* depuis **plus de 60 jours** (calculé depuis `created_at`) est **mise en évidence** par un indicateur discret (« à brader » / stagnation). (FR9, UX-DR12)
2. **Seuil.** Seuil par défaut **60 jours**, **non configurable** en v1.
3. **Uniquement le stock.** L'indicateur ne concerne que les pièces *en stock* (pas les vendues).
4. **Fonction pure + testée.** La détection vit dans `src/lib/derive.ts` (helper pur, ex. `isStale` / `daysSince`) et est couverte par un **test Vitest**.
5. **Discret & bienveillant.** L'indicateur est un **nudge** discret (pas alarmant) — cohérent avec le ton chaleureux (« argent dormant à activer »). N'altère pas la lisibilité de la ligne.
6. **Qualité.** `npm run test`, `npm run build`, `npm run lint` OK ; aucune régression (Stock, Historique, dashboard).

## Tasks / Subtasks

- [x] **Task 1 — Helper de stagnation (pur) + test** (AC: #1, #2, #4)
  - [x] `src/lib/derive.ts` : `STALE_THRESHOLD_DAYS = 60` ; `daysSince(iso: string, now?: Date): number` (jours écoulés) et/ou `isStale(createdAtISO: string, thresholdDays = STALE_THRESHOLD_DAYS, now = new Date()): boolean`.
  - [x] `src/lib/derive.test.ts` : cas — pièce créée il y a 70 j ⇒ stale (avec `now` injecté) ; 10 j ⇒ non stale ; exactement au seuil ⇒ définir le comportement (> strict).

- [x] **Task 2 — Badge sur `PieceRow`** (AC: #1, #3, #5)
  - [x] `src/features/pieces/PieceRow.tsx` : si `piece.statut === 'en_stock'` **et** `isStale(piece.created_at)` → afficher un petit indicateur discret (ex. pastille/texte ambre « 💤 +60j » ou « à brader ») près du tag « en stock », sans casser la mise en page. Ne rien afficher pour les vendues ni les pièces récentes.

- [x] **Task 3 — Vérifications** (AC: #6)
  - [x] `npm run test`, `npm run build`, `npm run lint` OK.
  - [x] Test manuel : une pièce ancienne (>60 j) montre l'indicateur dans le Stock ; une récente non ; l'Historique n'est pas affecté. *(Astuce test : si aucune vieille pièce, on peut vérifier via un test unitaire ou en changeant temporairement le seuil ; ne pas laisser de modif de seuil dans le code final.)*

## Dev Notes

### Helper (Task 1)
```ts
export const STALE_THRESHOLD_DAYS = 60

export function daysSince(iso: string, now: Date = new Date()): number {
  return (now.getTime() - new Date(iso).getTime()) / 86_400_000
}

export function isStale(
  createdAtISO: string,
  thresholdDays: number = STALE_THRESHOLD_DAYS,
  now: Date = new Date(),
): boolean {
  return daysSince(createdAtISO, now) > thresholdDays
}
```
- Pur, testable (injecter `now` dans les tests). `created_at` de la pièce est un ISO string (`timestamptz` → ISO via PostgREST).
- « plus de 60 jours » = strictement supérieur (`>`).

### Badge (Task 2)
- Dans `PieceRow`, la branche *en stock* affiche déjà le tag « en stock ». Ajouter, quand `isStale(piece.created_at)`, un petit élément ambre discret (ex. sous le tag ou à côté). Ton : nudge, pas alarme.
- Ne pas modifier la branche *vendue* (Historique) ni ajouter de coût de rendu notable.
- `PieceRow` importe déjà `computeMargin` de `../../lib/derive` → ajouter `isStale` au même import.

### Contexte hérité
- `src/features/pieces/PieceRow.tsx` (à modifier) : statut-aware depuis 4.2 (tag « en stock » / « vendu » + marge €). `piece.created_at` disponible (type `Piece`).
- `src/lib/derive.ts` (à étendre) : contient `computeMargin`, `computeDashboard`. Vitest en place (`derive.test.ts`).
- Tokens DESIGN (ambre pour l'argent dormant). Linter oxlint. Aucune modif DB (pas de nouvelle colonne : on se base sur `created_at`).

### Note produit
- Approximation assumée : « depuis plus de 60 jours en stock » = depuis la **création** de la pièce (`created_at`). Une pièce remise en stock (3.1) garde son `created_at` d'origine — acceptable pour ce nudge COULD.

### Testing standards
- Test unitaire de `isStale`/`daysSince` (pur, `now` injecté). `npm run test`. Badge vérifié visuellement / logiquement.

### Project Structure Notes
- Aucun nouveau fichier ni dépendance ni modif DB. Extensions de `src/lib/derive.ts` (+ test) et `src/features/pieces/PieceRow.tsx`. Direction `ui → features → lib` respectée.

### References
- [Source: epics.md#Story 4.4] — user story + AC (FR9, COULD, seuil 60j).
- [Source: PRD#4.6 FR-9] — signaler les pièces *en stock* > 60 j (seuil par défaut) ; hypothèse : seuil non configurable en v1.
- [Source: EXPERIENCE.md#State Patterns] — pièce qui stagne (>60 j) mise en évidence, nudge « à brader ».
- [Source: ARCHITECTURE-SPINE.md] — AD-2 (dérivé, `lib/derive`) ; conventions (dates ISO).
- Stories précédentes : `4-2` (PieceRow statut-aware), `3-2`/`4-1`/`4-3` (lib/derive, Vitest).

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (dev agent Amelia)

### Debug Log References

- `npm run test` → **12 tests passent** (+3 : stagnation à 70j vraie, 10j fausse, seuil exact 60j faux car strictement supérieur). `npm run build` → OK. `npm run lint` → 0 erreur.

### Completion Notes List

- **`src/lib/derive.ts`** : `STALE_THRESHOLD_DAYS = 60` (non configurable v1), `daysSince(iso, now?)`, `isStale(createdAtISO, thresholdDays?, now?)` — purs, `now` injectable pour les tests. « plus de 60 j » = strictement supérieur.
- **`src/features/pieces/PieceRow.tsx`** : pour une pièce *en stock* qui stagne (`isStale(piece.created_at)`), badge discret ambre « 💤 à brader » sous le tag « en stock ». Aucun impact sur les vendues (Historique) ni les pièces récentes.
- Approximation assumée : stagnation basée sur `created_at`. Aucune modif DB, aucune dépendance.

### File List

**Modifiés**
- `src/lib/derive.ts` (+ `STALE_THRESHOLD_DAYS`, `daysSince`, `isStale`)
- `src/lib/derive.test.ts` (+ 3 tests stagnation)
- `src/features/pieces/PieceRow.tsx` (badge « à brader » sur les pièces en stock > 60 j)

## Change Log

- 2026-07-25 — Implémentation Story 4.4 : alerte pièces qui stagnent (>60 j) — helper pur `isStale`/`daysSince` + tests, badge discret sur PieceRow. test + build + lint OK. Statut → review. **Dernière story du produit MoSCoW.**
