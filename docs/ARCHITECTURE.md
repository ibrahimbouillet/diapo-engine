# Architecture de la version web

## Étape actuelle

La version 0.3.0 est une page HTML/CSS/JavaScript exécutée par le navigateur. Elle reprend le chargement biologique puis la page noire temporaire. La couche Electron, le processus principal, le preload et la construction de fichiers exécutables sont retirés de cette étape. Aucun composant Rust n'est ajouté.

Le navigateur fournit son onglet, sa fenêtre, ses commandes et son moteur d'affichage. La page ne distribue pas un second moteur Chromium et n'imite pas les contrôles Windows.

## Responsabilités

| Emplacement | Rôle |
| --- | --- |
| `apps/web/index.html` | Structure du chargement et de la page de présentation, titre initial et favicon. |
| `apps/web/styles.css` | Apparence du flux sanguin et de la page noire, mouvement réduit. |
| `apps/web/renderer.js` | Métadonnées, visibilité, démarrage, préparation et passage entre états. |
| `apps/web/preparation.js` | Tâches séquentielles, durée minimale et condition d'ouverture. |
| `apps/web/assets/` | PNG et ICO du logo approuvé. |
| `apps/web/tests/` | Tests du mécanisme de préparation. |
| `presentations/drepanocytose/metadata.json` | Identifiant, titre et sous-titre de l'exposé. |
| `scripts/build-web.mjs` | Copie statique vers `dist/` et création de `dist/presentation.json` depuis les métadonnées. |
| `scripts/serve-web.mjs` | Construction puis serveur HTTP local sur `127.0.0.1:4173`. |
| `packages/core/` | Contrat TypeScript, validation, navigation et plans de transition ; non chargé dans la page actuelle. |
| `art/logo/` | Source Blender, scripts et preuves du logo. |

La construction ne nécessite pas de framework d'interface ou de compilation du JavaScript de la page. Elle assemble les fichiers statiques et les ressources. `dist/` est un résultat régénérable, ignoré par Git.

## Lancement et préparation

1. Le navigateur charge la page en HTTP, ses styles et ses modules JavaScript.
2. Le renderer lit `presentation.json` et utilise le titre de l'exposé. Il attend que le document soit visible, puis que l'image d'introduction soit décodée.
3. Après deux `requestAnimationFrame`, le renderer pose le repère `loading-visible`, démarre le mouvement et la durée visible minimale de 1000 ms.
4. La préparation initiale exécute de vraies tâches. Aujourd'hui, `intro-images` attend le PNG utilisé par le chargement et `fonts` attend `document.fonts.ready`.
5. La page normale reste cachée tant que la préparation n'a pas réussi et que le minimum visible n'est pas écoulé.
6. Lorsque ces conditions sont réunies, les callbacks sont arrêtés et les enfants du chargement sont retirés. La page principale devient noire et vide.

Le PNG est déjà décodé avant le début du minimum visible pour que l'introduction soit prête. La tâche `intro-images` attend ce même résultat ; elle ne décode pas une seconde copie du visuel. Le chargement peut dépasser une seconde si une vraie préparation prend plus de temps. Le temps de démarrage du serveur et le transfert initial de la page ne sont pas compris dans ce minimum.

Le module de préparation expose :

- `prepareResources(tasks)` : exécution successive des tâches `{ id, prepare }`, arrêt à la première erreur.
- `minimumVisibleTime(milliseconds)` : attente minimale avec l'horloge monotone `performance.now()`.
- `showWhenReady({ preparation, minimumVisible, show })` : ouverture seulement après la réussite des deux promesses.

Un échec ne doit pas ouvrir une page incomplète. Le démarrage affiche « Chargement impossible » et arrête le mouvement. Les requêtes des fichiers locaux nécessaires sont réelles ; il n'y a plus de pont IPC natif ni de fonction `presentationHost`.

## Affichage du chargement

Le flux compact contient quatre globules normaux illustrés par des gradients CSS et une cellule en faucille provenant du PNG Blender. La mention « Chargement… » rend sa fonction explicite. Le mouvement utilise des transformations et de l'opacité, avec une variante plus douce pour la préférence système de mouvement réduit.

Cette composition est une animation 2D avec un élément prérendu en 3D. Elle ne contient pas de maillage, caméra ou éclairage calculé en temps réel. La page noire n'a pas encore de modèle ou de shader à préparer.

Le mouvement vise 60 images/s, avec 30 comme seuil de repli. Ces chiffres sont des objectifs à vérifier, pas une propriété garantie par CSS. Les repères `loading-visible`, `normal-visible`, `loading-animation` et `resource-preparation` permettent d'inspecter le déroulement réel. Les mesures RAF décrivent les callbacks reçus, sans prouver l'affichage physique de chaque image.

Après ouverture, il ne doit rester ni cellule, ni boucle de mesure, ni animation active cachée. Le navigateur peut conserver des caches : retirer un élément ne garantit pas une restitution immédiate de toute sa mémoire.

## Servir les fichiers

Le mode local pris en charge est `npm run dev`, puis l'adresse HTTP fournie par le serveur. Le serveur dessert la construction statique sur l'interface de boucle locale. L'ouverture par double-clic HTML n'est pas prise en charge : les modules et la lecture des métadonnées nécessitent les règles normales d'une origine HTTP.

La page n'utilise pas de CDN, de compte ou de service externe pour son fonctionnement actuel. Les fichiers de `dist/` peuvent ultérieurement être servis par un hébergement statique adapté. Aucun hébergement cloud ni déploiement public n'est créé par cette migration locale.

Node 24 sert aux outils de développement, à la construction et aux tests. Un visiteur d'une page servie par un hébergement n'a besoin que d'un navigateur compatible. Le noyau TypeScript demeure hors du code actuellement exécuté par le navigateur.

## Préparer les futures scènes 3D

La future scène devra ajouter des tâches réelles de lecture et de décodage des modèles/images, préparation des textures pour le GPU, compilation des matériaux et premier rendu masqué si nécessaire. Elles devront préparer la scène et le renderer qui seront effectivement utilisés à l'écran.

Ces opérations ne sont pas encore implémentées dans la page actuelle. Avec un rendu comme Three.js, les points d'intégration possibles incluent le chargement glTF, la préparation des textures, la compilation asynchrone et le rendu de chauffe. Cela ne précalcule pas toutes les images futures : une scène interactive continue d'être calculée en direct.

Préparer d'abord le nécessaire à la première scène, puis les scènes proches. La conservation des ressources partagées, les résolutions de textures et la libération des ressources inutilisées devront faire l'objet d'un budget mesuré. Les tâches séquentielles évitent de démarrer toutes les allocations à la fois ; elles ne constituent pas encore un gestionnaire de mémoire complet.

## Noyau et continuité

Une présentation a un `schemaVersion`, un identifiant, un titre, un catalogue d'éléments et des pages. Chaque page contient au moins un état et une durée de répétition. Ces durées servent à préparer l'oral, sans passage automatique.

Un état décrit entièrement les éléments présents et leurs propriétés cibles. L'identifiant d'un élément conserve son identité ; son type reste stable. Le noyau produit un plan avec les éléments conservés, entrants et sortants. Le futur rendu devra animer ces états, garder la même instance pour les éléments conservés, libérer les sortants après transition et restituer les états lors du retour arrière.

Ces règles TypeScript sont testées séparément du navigateur. Elles ne prouvent pas encore une continuité visuelle 3D.

## Mesures et suite native éventuelle

La cible concrète est le navigateur d'un ordinateur de collège sous Windows 10, avec mémoire limitée. Les mesures de l'ancienne application Electron ne décrivent pas cette page. Le coût du navigateur, ses autres onglets, les pilotes et les ressources influencent les résultats.

Une intégration Windows en Rust est l'intention pour la phase native ultérieure, sans implémentation à cette étape. Les ressources 3D et GPU devront toujours être gérées et mesurées ; le langage ne suffit pas à garantir une faible consommation.

## Références

- [Three.js](https://threejs.org/)
- [WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html)
- [GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html)
- [Libération des ressources graphiques](https://threejs.org/manual/pages/cleanup.html)
- [Deux projets](PROJECTS.md), [reprise](HANDOFF.md), [validation](VALIDATION.md)
