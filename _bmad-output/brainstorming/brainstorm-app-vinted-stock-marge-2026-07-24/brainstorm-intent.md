# Intent — App de gestion de stock & marge Vinted

PWA de gestion de stock de vêtements et de calcul de marge (prix d'achat vs prix de vente) pour un vendeur Vinted.

## Problème / contexte

Ilan revend des vêtements sur Vinted. Aujourd'hui son suivi est éparpillé (entre Vinted, ses notes et sa tête) : il n'a pas de vision d'ensemble claire de ce qu'il possède, de ce qu'il gagne, ni de ce qui bloque. Il veut TOUT centraliser au même endroit.

## Objectif (le pourquoi)

Suivre le stock et la rentabilité par article : savoir en un coup d'œil combien il gagne, combien d'argent dort dans l'invendu, et quelle est sa marge.

## Concept central (boucle MVP)

- **Ajouter** une pièce : fiche « style Vinted » = photo + prix d'achat + prix de vente + catégorie + couleur + taille (+ marque).
- **Statut** de la pièce : `en stock → vendu`.
- **Marge auto** : calculée à partir du prix d'achat et du prix de vente ; le prix de vente reste modifiable a posteriori → l'app recalcule la marge automatiquement.
- **Dashboard 3 chiffres** : 1) bénéfices (chiffre principal), 2) argent qui dort en stock invendu, 3) marge moyenne (agrégée depuis la marge de chaque vêtement).

## Décisions de scope (MoSCoW)

- **MUST** : ajouter une pièce (photo + prix achat + prix vente + catégorie/couleur/taille) ; statut `en stock → vendu` ; calcul auto de la marge (prix de vente modifiable) ; dashboard 3 chiffres (bénéfices / argent dormant / marge moyenne).
- **SHOULD** : filtres (catégorie / couleur / taille / marque) ; toggle de période sur les bénéfices.
- **COULD** : alertes sur pièces qui stagnent (>60 j) ; mode offline PWA.
- **WON'T (pas cette fois)** : frais Vinted, négociation, commissions.

## Insights clés / mécaniques non évidentes

- **Le statut `en stock → vendu` est le pivot invisible** : c'est lui qui alimente les 2 chiffres phares du dashboard (argent dormant vs bénéfices).
- **« Argent dormant » (dashboard) et « alertes pièces stagnantes >60 j » = la même idée sous 2 angles.** Ilan veut ce mode « nounou proactive » qui lui met sous le nez les pièces à baisser/brader. Filtres + argent dormant sont reliés.
- **Le KISS rend l'app livrable** : on ne tracke QUE prix d'achat et prix de vente, pas les frais/commissions. C'est ce choix de simplicité qui garde le MVP buildable.
- **Idée-mère** : tout centraliser pour la vision d'ensemble.

## Contrainte technique

C'est une **PWA** (le mode offline est prévu en COULD).
