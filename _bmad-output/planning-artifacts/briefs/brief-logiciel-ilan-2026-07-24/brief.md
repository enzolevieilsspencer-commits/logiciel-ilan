---
title: "Product Brief — App de gestion de stock & marge Vinted (logiciel-ilan)"
status: final
created: 2026-07-24
updated: 2026-07-24
---

# Product Brief : App de gestion de stock & marge Vinted

## Résumé exécutif

Ilan revend des vêtements sur Vinted. Aujourd'hui, son suivi est éparpillé — un peu dans l'app Vinted, un peu dans ses notes, beaucoup dans sa tête. Résultat : il n'a **aucune vision claire** de ce qu'il possède, de ce qu'il gagne réellement, ni de l'argent immobilisé dans ses invendus.

Ce produit est une **PWA** (application web installable, utilisable sur téléphone et sur Mac) qui **centralise tout** au même endroit. Ilan ajoute chaque pièce avec son prix d'achat, indique son prix de vente, et l'app calcule automatiquement sa marge. Un tableau de bord lui donne en trois secondes les seuls chiffres qui comptent : **combien il a gagné**, **combien d'argent dort dans son stock invendu**, et **sa marge moyenne**.

La force du produit tient dans sa **simplicité assumée** : on ne suit que le prix d'achat et le prix de vente — pas les frais Vinted, pas les négociations, pas les commissions. C'est ce choix radical qui rend l'outil réellement utilisable au quotidien (et réellement livrable). L'objectif n'est pas de faire une comptabilité parfaite, mais de donner à Ilan **une vision d'ensemble qu'il n'a jamais eue**.

## Le problème

Ilan achète des vêtements (friperies, brocantes, déstockage) pour les revendre sur Vinted. Son activité grossit, mais son suivi ne suit pas :

- **Les prix d'achat vivent dans sa tête** ou sur un bout de papier — impossible de savoir précisément sa marge sur une pièce.
- **Les ventes sont dans Vinted**, la rentabilité nulle part. Il sait ce qu'il encaisse, pas ce qu'il *gagne*.
- **Aucune vision de l'argent immobilisé** : des pièces achetées dorment dans son stock sans qu'il le réalise.
- Quand le stock grossit (il démarre autour de 20 pièces, mais ça monte), **retrouver ou piloter une pièce précise devient un casse-tête**.

Le coût du statu quo : des décisions à l'aveugle (quoi brader ? quoi racheter ?), du temps perdu, et l'impossibilité de savoir si son activité est vraiment rentable.

## La solution

Une PWA mobile-first (aussi confortable sur Mac) qui tient sur une boucle simple :

1. **Ajouter une pièce** — une fiche « style Vinted » : photo, catégorie, couleur, taille (+ marque), et le **prix d'achat**.
2. **Suivre son statut** — chaque pièce est *en stock* puis *vendue*. Cet unique interrupteur est le cœur du système : il répartit l'argent entre « ce qui dort » et « ce qui a rapporté ».
3. **Calculer la marge automatiquement** — dès qu'un prix de vente est renseigné, la marge se calcule. Le prix de vente reste **modifiable a posteriori** (si Ilan a vendu à un autre prix) → la marge se recalcule seule.
4. **Voir l'essentiel d'un coup d'œil** — un tableau de bord à trois chiffres, dans l'ordre : **bénéfices** → **argent qui dort en stock** → **marge moyenne**.

L'expérience visée : ouvrir l'app le matin, voir sa situation en trois secondes, ajouter une pièce en quinze secondes.

## Ce qui le distingue

Soyons honnêtes : il ne s'agit pas d'une technologie révolutionnaire, mais d'un **outil taillé sur mesure** pour un besoin réel et mal servi.

- **La simplicité comme parti pris** — les outils de compta sont trop lourds, Excel est trop manuel, Vinted ne montre pas la marge. Ici, tout est réduit à l'essentiel : achat, vente, marge. C'est le principal avantage, et il est délibéré.
- **Pensé pour le geste réel** — ajout ultra-rapide depuis le téléphone, y compris sur le terrain (brocante).
- **Une vision que Vinted ne donne pas** — l'argent dormant et la marge réelle, deux angles morts du vendeur, deviennent visibles.

## Pour qui

**Utilisateur unique : Ilan**, revendeur de vêtements sur Vinted (particulier, activité en croissance). Il a besoin de rapidité (ajouter sans friction), de clarté (savoir où il en est sans réfléchir) et de pilotage (quoi brader, quoi racheter). Pour lui, réussir c'est **arrêter de piloter à l'aveugle**.

L'app est **mono-utilisateur** pour l'instant : pas de gestion de comptes multiples. Une **authentification est néanmoins requise** — Ilan doit se connecter pour être le seul à accéder à ses données (ce sont des informations de business, et l'app pourra s'ouvrir à d'autres plus tard).

## Critères de succès

Le succès est **l'adoption quotidienne** : Ilan ouvre et utilise l'app **tous les jours**, et elle remplace ses notes / sa tête / son éventuel Excel.

Signaux concrets :
- Ilan **ajoute ses nouvelles pièces dans l'app** plutôt que sur papier.
- Il **consulte son tableau de bord régulièrement** pour connaître sa marge et ses bénéfices.
- Il **met à jour le statut** de ses pièces quand elles se vendent.
- À terme : il prend des **décisions guidées par l'app** (brader une pièce qui stagne, savoir ce qui est rentable).

## Périmètre (MoSCoW)

**MUST — le MVP, l'app n'existe pas sans ça**
- Authentification : Ilan se connecte pour accéder à ses données (sécurité)
- Ajouter une pièce : photo + prix d'achat + prix de vente + catégorie / couleur / taille
- Statut de la pièce : *en stock → vendue* (+ historique des pièces vendues conservé)
- Calcul automatique de la marge (prix de vente modifiable → recalcul)
- Tableau de bord 3 chiffres : bénéfices / argent dormant / marge moyenne

**SHOULD — juste après, gros confort**
- Filtres du stock (catégorie / couleur / taille / marque)
- Sélecteur de période sur les bénéfices (ce mois / cette année / depuis le début)

**COULD — bonus si le temps le permet**
- Alertes sur les pièces qui stagnent (> 60 jours = argent dormant à activer)
- Mode hors-ligne (PWA utilisable en brocante sans réseau)

**WON'T (pas cette fois) — exclu volontairement**
- Frais Vinted, négociation, commissions (choix KISS assumé)
- Multi-utilisateurs / comptes / version publique

## Contraintes & notes techniques

- **Forme** : PWA responsive, **mobile-first** (téléphone) et confortable sur **Mac**.
- **Données** : l'historique des pièces vendues est **conservé** (il alimente les stats de bénéfices par période).
- **Réalisation** : développement **solo** (Exzodev), pas de deadline dure.

## Vision

Pour l'instant, un outil personnel qui fait gagner à Ilan une clarté qu'il n'avait pas. **Si ça marche**, l'ambition naturelle est d'en faire un outil **ouvert à d'autres revendeurs Vinted** — la douleur d'Ilan (suivi éparpillé, marge invisible) est partagée par des milliers de vendeurs. La simplicité du produit est justement ce qui pourrait le rendre attractif au-delà de son premier utilisateur. Cette ouverture reste hors du périmètre actuel : on valide d'abord la valeur sur un utilisateur réel.
