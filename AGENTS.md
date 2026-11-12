# Consignes de travail

## Lire avant de modifier

- Commencer par `git status --short --branch` et préserver les changements présents.
- Lire `docs/HANDOFF.md`, `docs/PROJECTS.md` et `docs/ARCHITECTURE.md`.
- Vérifier les fichiers réels ; les anciens comptes rendus ne prouvent pas le comportement actuel.

## Périmètre actuel

- La version actuelle est une **page web HTML/CSS/JavaScript** dans `apps/web/`. Ne pas réintroduire Electron, un pont natif, un exécutable ou Rust pour cette étape.
- Le dépôt contient la présentation dédiée **La drépanocytose** et un noyau réutilisable. Le futur éditeur général Diapo Engine n'est pas construit.
- Le titre et l'identifiant proviennent de `presentations/drepanocytose/metadata.json`, copié dans la construction sous `dist/presentation.json`.
- Garder `packages/core/` indépendant du navigateur, du rendu et du contenu médical. Ce noyau TypeScript n'est pas chargé par la page actuelle.
- Le titre, la favicon et les commandes de fenêtre appartiennent à l'onglet et au navigateur. Ne pas dessiner de faux boutons Windows dans la page.
- Respecter le contenu minimal demandé. Les chapitres, la 3D et les médias s'intègrent par incréments explicites.
- Préserver le logo Blender approuvé, ses proportions et ses sources. Les ressources web du logo sont dans `apps/web/assets/`.
- Décrire le chargement comme une composition 2D avec un PNG prérendu dans Blender, pas une scène 3D temps réel.
- Conserver la mention « Chargement… ». Ouvrir la page seulement après le minimum visible et la préparation réelle réussie. Le délai ne remplace pas le décodage ou la préparation graphique.
- Après ouverture, arrêter les callbacks et retirer le contenu du chargement ; la page noire doit rester sans animation active.
- Préparer d'abord les ressources utiles au début de l'exposé, puis progressivement les suivantes. Ne pas charger tout l'exposé en textures 4K par défaut.
- Écrire la documentation en français et distinguer fonctionnalités présentes, objectifs et résultats vérifiés.

## Vérifications

- Utiliser `npm run check`, `npm test`, `npm run validate` et `npm run build` selon la modification.
- Lancer `npm run dev` et observer la page en HTTP dans un navigateur. Le double-clic HTML n'est pas le mode pris en charge.
- Vérifier titre/favicon, chargement, passage au noir, absence de défilement et nettoyage des animations.
- Vérifier qu'une préparation retardée maintient le chargement et qu'un échec n'ouvre pas une page incomplète.
- La cible du collège est un navigateur sur Windows 10 avec mémoire limitée. Mesurer la cadence et la mémoire sur ce poste ; les anciennes mesures Electron et celles d'un autre navigateur ne le qualifient pas.
- Une animation CSS ne prouve pas 60 images/s. Distinguer l'objectif de cadence, les mesures RAF et l'affichage réellement observé.
- Mettre à jour les documents concernés avec les vérifications réellement réalisées. Les validations des anciennes versions sont historiques.
