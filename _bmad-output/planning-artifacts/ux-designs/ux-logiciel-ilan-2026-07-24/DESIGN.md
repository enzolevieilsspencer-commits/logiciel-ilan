---
title: "DESIGN — App stock & marge Vinted"
status: final
created: 2026-07-24
updated: 2026-07-24
name: "Ilan — Stock & Marge"
description: "Direction « Vinted-friendly » — vert menthe/teal + blanc, gros arrondis, convivial et chaleureux, chiffres mis en avant dans des cartes arrondies."
colors:
  teal: '#09B1BA'
  teal-dark: '#007782'
  mint: '#E6F7F8'
  green: '#22A45D'
  green-soft: '#E4F6EC'
  amber: '#E8A13A'
  bg: '#F4FBFB'
  white: '#FFFFFF'
  ink: '#1E2A2B'
  muted: '#6B7B7C'
  border-hairline: '#EAF3F3'
  chip-border: '#D6E7E7'
  placeholder: '#A9B8B8'
typography:
  greet:
    note: 'Platform native — iOS Title 3 gras · titre d''accueil « Salut Ilan »'
    fontSize: 18px
    fontWeight: 700
  hero-number:
    fontSize: 30px
    fontWeight: 800
    letterSpacing: '-0.5px'
  stat-number:
    fontSize: 24px
    fontWeight: 800
  marge-number:
    fontSize: 28px
    fontWeight: 800
  item-name:
    fontSize: 14px
    fontWeight: 700
  label:
    fontSize: 12px
    fontWeight: 700
  meta:
    fontSize: 12px
    fontWeight: 400
  body:
    note: 'Platform native — iOS Body · système -apple-system / Segoe UI / Roboto'
    fontSize: 14px
rounded:
  sm: 14px
  md: 18px
  card: 22px
  phone: 38px
  full: 9999px
spacing:
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 14px
  '5': 16px
  '6': 18px
  card-gap: 14px
  screen-margin: 4px
components:
  card:
    background: '{colors.white}'
    radius: '{rounded.card}'
    padding: 16px 18px
    shadow: '0 6px 20px rgba(9,177,186,.12)'
  card-hero:
    background: 'linear-gradient(135deg, {colors.teal}, {colors.teal-dark})'
    text: '{colors.white}'
    radius: '{rounded.card}'
    shadow: '0 8px 24px rgba(0,119,130,.35)'
  card-dormant:
    number-color: '{colors.amber}'
    label-color: '{colors.muted}'
  item-row:
    background: '{colors.white}'
    radius: '{rounded.md}'
    padding: 10px
    thumb-radius: '{rounded.sm}'
    thumb-bg: '{colors.mint}'
    shadow: '{components.card.shadow}'
  tag-stock:
    background: '{colors.mint}'
    text: '{colors.teal-dark}'
    radius: '{rounded.full}'
  tag-sold:
    background: '{colors.green-soft}'
    text: '{colors.green}'
    radius: '{rounded.full}'
  chip:
    background: '{colors.white}'
    border: '1.5px solid {colors.chip-border}'
    text: '{colors.muted}'
    radius: '{rounded.full}'
    padding: 7px 13px
  chip-selected:
    background: '{colors.teal}'
    text: '{colors.white}'
    border: '{colors.teal}'
    fontWeight: 700
  fab:
    background: '{colors.teal}'
    text: '{colors.white}'
    size: 58px
    radius: '{rounded.full}'
    shadow: '0 8px 20px rgba(9,177,186,.5)'
  tabbar:
    background: '{colors.white}'
    radius: 24px
    active-color: '{colors.teal}'
    off-color: '#B7C6C6'
    shadow: '{components.card.shadow}'
  input:
    background: '{colors.white}'
    radius: '{rounded.sm}'
    padding: 12px 14px
    text: '{colors.ink}'
    placeholder: '{colors.placeholder}'
    shadow: '{components.card.shadow}'
  button-primary:
    background: '{colors.teal}'
    text: '{colors.white}'
    radius: '{rounded.md}'
    padding: 15px
    fontWeight: 800
    shadow: '0 8px 20px rgba(9,177,186,.4)'
  button-secondary:
    background: '{colors.white}'
    text: '{colors.teal-dark}'
    radius: '{rounded.md}'
    shadow: '0 4px 14px rgba(0,0,0,.08)'
  marge-box:
    background: '{colors.green-soft}'
    number-color: '{colors.green}'
    radius: '{rounded.card}'
---

# Ilan — Stock & Marge · Identité visuelle

> Direction « Vinted-friendly » validée par Exzodev. Maquette de référence : `mockups/key-screens.html` (c'est un test d'ambiance, pas le pixel-perfect). En cas de conflit, ce document et `EXPERIENCE.md` l'emportent sur la maquette.

## Brand & Style

L'app est un outil perso qui doit donner envie de l'ouvrir chaque matin. La posture est **« Vinted-friendly »** : vert menthe/teal et blanc, gros arrondis, convivial, jeune et chaleureux — un clin d'œil assumé à l'univers Vinted où Ilan vend. Ce n'est pas un tableur de comptabilité : c'est un compagnon.

Le principe visuel central : **les chiffres qui comptent sont mis en avant dans des cartes arrondies**. Le bénéfice domine dans une carte teal en dégradé (le héros de l'écran), la Marge d'une Pièce s'affiche en grand et fier. Tout le reste — listes, formulaires — reste léger, aéré, sans bordures dures. Fond clair teinté menthe, cartes blanches qui flottent grâce à des ombres teal douces.

## Colors

- **Teal (`{colors.teal}`)** — accent principal, l'esprit Vinted. Boutons d'action, FAB, onglet actif, chips sélectionnés, dégradé de la carte héro. C'est la couleur signature.
- **Teal foncé (`{colors.teal-dark}`)** — fin du dégradé héro, texte sur fond menthe (tags *en stock*, titres de section), texte des boutons secondaires. Jamais en aplat plein derrière du texte long.
- **Menthe (`{colors.mint}`)** — fond doux : vignettes photo, tags *en stock*, zone photo du formulaire. Réservée aux surfaces calmes, pas aux actions.
- **Vert (`{colors.green}`)** — **le positif et la Marge**. Uniquement pour les valeurs de Marge (€ et %), les tags *vendu*, la carte de marge. Sémantique stricte : vert = gain réalisé.
- **Ambre (`{colors.amber}`)** — **l'Argent dormant**. Réservé au chiffre de l'argent immobilisé dans le Stock. Signal doux, pas une alerte rouge — c'est un rappel, pas une erreur.
- **Fond (`{colors.bg}`)** — fond d'app clair teinté menthe. Les cartes blanches s'y détachent.
- **Encre (`{colors.ink}`)** — texte principal.
- **Atténué (`{colors.muted}`)** — texte secondaire, méta (catégorie · couleur · taille), labels de champs.

À éviter : le **rouge** d'erreur agressif (l'app est bienveillante), la couleur pour décorer sans sens, et le mélange des sémantiques (le vert n'est **que** la Marge, l'ambre **que** l'Argent dormant).

## Typography

Police système native (`-apple-system` / Segoe UI / Roboto) — pas de webfont à charger, l'app reste rapide et se fond dans le système sur mobile comme sur Mac.

La hiérarchie est portée par le **poids et la taille des chiffres**, pas par des familles multiples :
- **Chiffres héros** (`{typography.hero-number}`, 30px/800) — Bénéfices dans la carte héro.
- **Chiffres de stat** (`{typography.stat-number}`, 24px/800) — Argent dormant.
- **Chiffre de marge** (`{typography.marge-number}`, 28px/800) — Marge propre d'une Pièce sur sa fiche.
- **Titre d'accueil** (`{typography.greet}`, « Salut Ilan ») et **noms de Pièces** en 700.
- **Labels et méta** en 12px — atténués, discrets.

Pas de tout-majuscules, pas de display exotique. Les gros chiffres gras suffisent à créer la fierté.

## Layout & Spacing

Échelle : 4 / 8 / 12 / 14 / 16 / 18 px. Colonne unique mobile-first, marges d'écran serrées (`{spacing.screen-margin}`) et gouttière entre cartes de `{spacing.card-gap}`. Sur Mac, la même colonne reste centrée et confortable — on n'étale pas en multi-colonnes.

Ordre vertical du Dashboard fixe et non négociable : **Bénéfices (héro) → Argent dormant → Stock → FAB + tabbar**. Le rythme respire entre les blocs majeurs, se resserre à l'intérieur des lignes de liste.

## Elevation & Depth

L'élévation vient d'**ombres teal douces**, jamais de bordures dures. Ombre de base des cartes : `0 6px 20px rgba(9,177,186,.12)` — teintée teal, pas grise, pour un rendu chaleureux. La carte héro porte une ombre plus profonde et teal-foncé. FAB et boutons primaires ont l'ombre teal la plus saturée (ils appellent l'action). La hiérarchie = taille de carte + intensité d'ombre, pas des traits.

## Shapes

**Gros arrondis** — c'est une signature de la direction. Cartes à `{rounded.card}` (22px), lignes de liste et boutons à `{rounded.md}` (18px), champs et vignettes à `{rounded.sm}` (14px). Tags, chips, FAB et pastilles en `{rounded.full}` (cercle/pilule). Les images suivent exactement le rayon de leur conteneur. Rien d'anguleux : l'app est ronde et douce.

## Components

- **Carte** (`card`) — surface blanche, rayon `{rounded.card}`, ombre teal douce. Le conteneur par défaut de tout chiffre ou groupe.
- **Carte héro** (`card-hero`) — dégradé teal → teal-foncé, texte blanc. Réservée aux **Bénéfices**. La **Marge moyenne** pondérée s'affiche accolée dans une pastille translucide, pas dans un bloc séparé.
- **Carte argent dormant** (`card-dormant`) — chiffre en `{colors.amber}`, label atténué. Un seul chiffre, calme.
- **Ligne de pièce** (`item-row`) — vignette menthe + nom + méta (catégorie · couleur · taille · tag Statut). Si *vendu*, la Marge € s'affiche en vert à droite.
- **Tags de statut** — `tag-stock` (menthe / teal-foncé) et `tag-sold` (vert doux / vert). Pilules, toujours en minuscules.
- **Chips** (`chip` / `chip-selected`) — sélecteur à taper pour catégorie/couleur. Non sélectionné : contour fin. Sélectionné : plein teal, texte blanc, gras.
- **FAB** (`fab`) — cercle teal 58px, « + » blanc, ombre teal saturée. Ancré en bas à droite, au-dessus de la tabbar.
- **Tabbar** (`tabbar`) — barre blanche flottante arrondie, 4 onglets (Accueil / Stock / Stats / Réglages). Onglet actif en teal, inactifs en gris menthe.
- **Champ** (`input`) — fond blanc, rayon `{rounded.sm}`, placeholder atténué (« optionnel », « plus tard »).
- **Bouton primaire** (`button-primary`) — teal plein, texte blanc gras (« Ajouter au stock »). **Secondaire** (`button-secondary`) — blanc, texte teal-foncé (« Modifier le prix de vente »).
- **Carte de marge** (`marge-box`) — fond vert doux, Marge € en grand vert centré + « marge de cette pièce : X % » en dessous. Le clou de la fiche.

## Do's and Don'ts

| À faire | À éviter |
|---|---|
| Vert **uniquement** pour la Marge et le positif | Vert décoratif ou sur des éléments neutres |
| Ambre **uniquement** pour l'Argent dormant | Rouge d'alerte agressif pour l'argent dormant |
| Chiffres clés en gros et gras dans des cartes arrondies | Chiffres noyés dans du texte ou des tableaux |
| Ombres teal douces pour la profondeur | Bordures dures et traits gris |
| Gros arrondis partout, cohérents | Coins carrés ou arrondis timides |
| Teal comme seul accent d'action | Multiplier les couleurs d'accent |
| Police système, app légère | Webfonts lourdes, display exotiques |
