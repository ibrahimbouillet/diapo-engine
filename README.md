# Diapo Engine et La drépanocytose

Ce dépôt public réunit deux objectifs : **La drépanocytose**, première présentation à réaliser, et **Diapo Engine**, futur outil de création de diaporamas avancés et programmables.

## Version actuelle : une page web

La version 0.3.0 utilise **HTML, CSS et JavaScript dans le navigateur**. La couche Electron, son pont de préchargement et la construction d'exécutables ne font plus partie de cette version. Aucun composant Rust n'est introduit à cette étape.

Le démarrage conserve deux états :

1. Un flux sanguin animé sur fond blanc, avec quatre globules normaux illustrés en CSS, une cellule en faucille issue du rendu Blender et la mention « Chargement… ».
2. Une page principale entièrement noire et vide, temporaire.

L'ouverture attend **au moins une seconde visible et la préparation initiale réussie**. Le chargement prépare actuellement le PNG et les polices ; aucun modèle 3D n'est encore intégré à la page noire. Après ouverture, les callbacks sont arrêtés et le contenu animé est retiré du document.

L'onglet porte le titre **La drépanocytose**, à partir des métadonnées de la présentation, et utilise le logo comme favicon. Les commandes de fenêtre sont celles du navigateur : la page n'imite pas une barre Windows.

## Travailler sur la page

Node 24 et npm servent aux outils de développement et aux tests. Ils ne sont pas chargés dans la page.

~~~powershell
npm ci
npm run dev
~~~

Le serveur local fournit la page à [http://127.0.0.1:4173](http://127.0.0.1:4173). La construction statique se fait avec `npm run build` et produit `dist/`, qui contient les fichiers web et les ressources nécessaires. L'ouverture par double-clic d'un fichier HTML n'est pas le mode de lancement pris en charge : les modules et les métadonnées sont servis en HTTP.

La page n'a ni bibliothèque d'interface ni dépendance à un CDN. Le navigateur existant réalise l'affichage ; aucun moteur Chromium supplémentaire n'est distribué par le projet. Cela ne signifie pas que la page ou les futures scènes 3D ne consomment aucune mémoire.

## Suite du projet

Le premier exposé est prévu pour une classe de troisième : **12 minutes de présentation et jusqu'à 3 minutes de questions**. Son scénario de huit chapitres reste un document de travail, non joué par la page actuelle.

Le noyau TypeScript de `packages/core/` est conservé comme contrat et outil de test du futur moteur. Il n'est pas chargé par cette page. Les modèles 3D, les médias, les transitions de présentation et l'éditeur de création restent à développer.

L'intention pour une phase native ultérieure est une application Windows en Rust. Elle n'est pas implémentée maintenant ; les ressources, le rendu et la mémoire devront toujours être mesurés.

## Documentation

- [Les deux projets et leurs objectifs](docs/PROJECTS.md)
- [Architecture actuelle](docs/ARCHITECTURE.md)
- [Feuille de route](docs/ROADMAP.md)
- [Reprise par Claude ou une autre IA](docs/HANDOFF.md)
- [Scénario de la drépanocytose](presentations/drepanocytose/STORYBOARD.md)
- [Logo Blender et références](art/logo/ART_NOTES.md)
- [Vérifications et limites](docs/VALIDATION.md)

Les résultats des anciennes versions Electron sont historiques et ne qualifient pas les performances de cette version web.
