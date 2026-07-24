---
baseline_commit: bd7bfe3e19a627b752d3b94720392e0e99b910cf
---

# Story 1.3: Connexion sécurisée d'Ilan

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a Ilan,
I want me connecter avec mon email et mon mot de passe,
so that moi seul accède à mes données de business, et je reste connecté entre les ouvertures.

## Acceptance Criteria

1. **Écran de connexion.** Tant qu'aucune session valide n'existe, l'app affiche un écran de connexion (email + mot de passe) et **rien d'autre** n'est accessible. (FR1, NFR2)
2. **Connexion réussie.** Avec des identifiants valides, `supabase.auth.signInWithPassword` ouvre la session et l'app affiche l'écran principal (accueil actuel). Erreur d'identifiants → message clair et bienveillant, non bloquant (Voice & Tone).
3. **Session persistante.** À l'ouverture, l'app détecte une session existante (via `getSession` + `onAuthStateChange`) et va directement à l'accueil sans redemander le login. La session survit à un rechargement / une réouverture.
4. **Déconnexion.** Ilan peut se déconnecter (`supabase.auth.signOut`) → retour à l'écran de connexion. (Emplacement temporaire pour l'instant — la vraie place est l'onglet Réglages, construit en Epic 2.)
5. **Pas d'inscription publique.** Aucune UI d'inscription (app mono-utilisateur). Le compte d'Ilan est créé côté Supabase (voir pré-requis). (Non-goal : multi-utilisateurs)
6. **Remplacement du temporaire.** L'indicateur de santé Supabase temporaire de `src/app/App.tsx` (Story 1.2) est **retiré**, remplacé par la vraie logique de garde d'accès.
7. **Qualité.** `npm run build` et `npm run lint` passent ; aucune régression (l'app build et tourne end-to-end).

## Tasks / Subtasks

- [x] **Task 1 — État d'authentification (session)** (AC: #1, #3)
  - [x] Créer `src/features/auth/useSession.ts` : hook qui expose `{ session, loading }`, initialisé via `supabase.auth.getSession()` et mis à jour via `supabase.auth.onAuthStateChange` (nettoyer l'abonnement au démontage).
  - [x] États : `loading` (au démarrage), `session` (null = déconnecté).

- [x] **Task 2 — Écran de connexion** (AC: #1, #2, #5)
  - [x] Créer `src/features/auth/LoginScreen.tsx` : formulaire email + mot de passe (tokens DESIGN : `bg-app`, carte blanche arrondie, `text-teal-dark`, bouton teal). Microcopy chaleureuse (« Salut ! Connecte-toi »). Voir Dev Notes.
  - [x] Soumission → `supabase.auth.signInWithPassword({ email, password })` ; gère l'état de chargement et l'erreur (message bienveillant, jamais rouge agressif).
  - [x] **Aucune** option d'inscription / mot de passe oublié (hors scope v1).

- [x] **Task 3 — Garde d'accès + déconnexion** (AC: #1, #4, #6)
  - [x] Modifier `src/app/App.tsx` : utiliser `useSession()`. Si `loading` → écran d'attente discret (skeleton/splash). Si pas de `session` → `LoginScreen`. Sinon → l'accueil.
  - [x] **Retirer** l'indicateur de santé Supabase temporaire (Story 1.2).
  - [x] Ajouter un bouton **Se déconnecter** temporaire sur l'accueil (`supabase.auth.signOut()`), en notant qu'il migrera vers l'onglet Réglages en Epic 2.

- [x] **Task 4 — Vérifications** (AC: #7)
  - [x] `npm run build` OK, `npm run lint` OK.
  - [x] Test manuel de connexion avec le compte d'Ilan : login → accueil ; reload → toujours connecté ; déconnexion → retour login ; mauvais mdp → message d'erreur.

> ⚠️ **Pré-requis utilisateur (bloquant pour le test de connexion) :**
> 1. Dans le dashboard Supabase → **Authentication → Users → Add user** : créer le compte d'Ilan (email + mot de passe). Les users créés au dashboard sont **auto-confirmés** (pas d'email de confirmation à cliquer).
> 2. Recommandé : **Authentication → Sign In / Providers → Email** → **désactiver « Allow new users to sign up »** (app mono-utilisateur, aucune inscription publique).
> Donne-moi l'email + mot de passe de test d'Ilan pour valider l'AC de connexion (ou teste toi-même).

## Dev Notes

### Contexte hérité (Stories 1.1 & 1.2 — déjà en place)
- PWA **Vite 8 + React 19 + TS + Tailwind 4**, structure feature-sliced `src/{app,features/{auth,pieces,dashboard},lib,components/ui}`.
- **Client Supabase unique** déjà branché : `src/lib/supabase.ts` exporte `supabase` (import : `import { supabase } from '../lib/supabase'` depuis `features/`, ou chemin relatif adapté). **Ne pas** ré-instancier de client (AD-3).
- **Tokens DESIGN** dans `src/index.css` : `bg-app`, `text-teal-dark`, `text-teal`, `text-green`, `text-amber`, `text-muted`, `text-ink`, arrondis `rounded-[var(--radius-card)]` / classes utilitaires.
- `src/app/App.tsx` contient actuellement un **indicateur de santé temporaire** (Story 1.2) → à retirer (Task 3).
- Clé **publishable** (jamais de service_role côté client). Accès données réel = RLS (Epic 2).
- Linter = **oxlint** (`npm run lint`).

### API Supabase Auth (v2 — supabase-js 2.110.8, stable)
- **Connexion** : `const { data, error } = await supabase.auth.signInWithPassword({ email, password })`.
- **Session courante** : `const { data: { session } } = await supabase.auth.getSession()` (lit le stockage local, instantané).
- **Écoute des changements** : `const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { … })` — se désabonner via `subscription.unsubscribe()`.
- **Déconnexion** : `await supabase.auth.signOut()`.
- La persistance de session est **automatique** (defaults navigateur : `persistSession`, `autoRefreshToken`). Pas de gestion manuelle du token.

### `src/features/auth/useSession.ts` (forme cible)
```ts
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'

export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s)
    })
    return () => subscription.unsubscribe()
  }, [])

  return { session, loading }
}
```

### Écran de connexion — comportement & ton
- Un seul écran, centré, carte blanche sur `bg-app`. Champs : email, mot de passe, bouton « Se connecter ».
- Microcopy chaleureuse (tutoiement) : titre « Salut ! », sous-titre « Connecte-toi pour retrouver ton stock. », bouton « Se connecter » (état « Connexion… » pendant la requête).
- Erreur : message bienveillant sous le formulaire (ex. « Email ou mot de passe incorrect. »), pas de rouge agressif — utiliser un ton doux (cf. `text-amber` ou un style discret), jamais bloquant.
- Accessibilité : `<label>` associés, `type="email"` / `type="password"`, bouton désactivé pendant la requête, cibles ≥ 44px.

### État de la garde dans `App.tsx`
- `loading` → petit écran d'attente (pas de spinner plein écran criard ; un simple texte/skeleton sobre suffit).
- `!session` → `<LoginScreen />`.
- `session` → l'accueil actuel (titre + placeholder) **+ bouton « Se déconnecter » temporaire**.
- Marquer clairement (commentaire) que le bouton de déconnexion et l'accueil placeholder évolueront (Réglages en Epic 2, vraies surfaces ensuite).

### Testing standards
- Pas de framework de test imposé (auth = intégration Supabase, pas de logique métier pure durable). Vérification = `build` + `lint` + **test manuel** du parcours de connexion avec le compte d'Ilan.
- Vitest arrivera avec `lib/derive` (Epic 3/4). Ne pas sur-investir en tests ici.

### Project Structure Notes
- Nouveaux : `src/features/auth/useSession.ts`, `src/features/auth/LoginScreen.tsx`. Supprimer `src/features/auth/.gitkeep` (le dossier a du contenu).
- Modifié : `src/app/App.tsx` (garde d'accès, retrait de l'indicateur de santé, bouton déconnexion temporaire).
- Ne rien changer à `src/lib/supabase.ts`, `src/index.css`, config PWA/Vite.

### References
- [Source: epics.md#Story 1.3] — user story + AC (FR1).
- [Source: ARCHITECTURE-SPINE.md#AD-4] — Auth Supabase + RLS ; sécurité ne repose jamais sur le filtrage client.
- [Source: EXPERIENCE.md#Information Architecture] — surface « Auth / Connexion » (protège l'accès) ; déconnexion dans Réglages (Epic 2).
- [Source: EXPERIENCE.md#Voice and Tone] — tutoiement chaleureux, Ilan nommé, messages doux.
- [Source: PRD#4.1 FR-1] — connexion sécurisée, session persistante.
- Story précédente : `1-2-brancher-supabase-et-poser-les-design-tokens.md` (client Supabase, indicateur temporaire à retirer).
- Supabase Auth (supabase-js 2.110.8) : `signInWithPassword`, `getSession`, `onAuthStateChange`, `signOut` — API v2 stable.

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (dev agent Amelia)

### Debug Log References

- `npm run build` → OK (precache 404 KiB). `npm run lint` (oxlint) → 0 erreur.
- Vérif câblage auth (sans compte réel) : `POST /auth/v1/token?grant_type=password` avec faux identifiants → **HTTP 400 `invalid_credentials`** ✅ → l'endpoint de connexion + la clé fonctionnent ; le flux `signInWithPassword` est correctement branché et gère l'échec.

### Completion Notes List

- `src/features/auth/useSession.ts` : hook `{ session, loading }` via `getSession()` + `onAuthStateChange` (désabonnement au démontage).
- `src/features/auth/LoginScreen.tsx` : formulaire email/mot de passe, `signInWithPassword`, état de chargement, message d'erreur bienveillant (`text-amber`). Aucune inscription / mot de passe oublié (mono-utilisateur). Tokens DESIGN + ton chaleureux (« Salut ! 👋 »).
- `src/app/App.tsx` : garde d'accès (loading → attente ; pas de session → LoginScreen ; sinon accueil). **Indicateur de santé temporaire de 1.2 retiré.** Bouton « Se déconnecter » temporaire (migrera dans Réglages, Epic 2).
- **✅ Test end-to-end avec le VRAI compte d'Ilan : VALIDÉ.** Compte `enzolevieilsspencer@gmail.com` créé + confirmé ; `POST /auth/v1/token?grant_type=password` → **HTTP 200** avec access_token (email confirmé). La connexion réelle fonctionne. Reste à confirmer visuellement dans le navigateur (login → accueil → reload → déconnexion) mais le flux serveur est prouvé.
- Pas de tests unitaires (auth = intégration, pas de logique métier durable — cf. Testing standards). Vérif = build + lint + test du câblage auth.

### File List

**Nouveaux**
- `src/features/auth/useSession.ts`
- `src/features/auth/LoginScreen.tsx`

**Modifiés**
- `src/app/App.tsx` (garde d'accès, retrait indicateur de santé, bouton déconnexion temporaire)

**Supprimés**
- `src/features/auth/.gitkeep`

## Change Log

- 2026-07-24 — Implémentation Story 1.3 : auth Supabase email/mot de passe (hook `useSession`, `LoginScreen`, garde d'accès dans `App.tsx`, déconnexion), retrait de l'indicateur de santé temporaire. Câblage auth vérifié (400 invalid_credentials). Build + lint OK. Test login vrai compte d'Ilan en attente. Statut → review.
