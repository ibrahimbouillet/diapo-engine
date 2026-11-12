# Reprendre le projet

Ce document est destiné à Claude, à une autre IA ou à un développeur qui reprend le dépôt. Il décrit la base à vérifier avant de poursuivre, sans supposer que des fonctionnalités futures sont déjà disponibles.

## 1. Comprendre les deux objectifs

Lire [PROJECTS.md](PROJECTS.md), puis [ARCHITECTURE.md](ARCHITECTURE.md).

Le livrable actuel est une application Windows dédiée à **La drépanocytose**. Le produit final **Diapo Engine** sera une application publique de création de présentations, avec des outils de code, des scènes avancées, de la 3D et des médias. Cet éditeur reste à développer.

Le noyau TypeScript existe déjà, mais il n'est pas encore relié à un rendu de présentation. Le scénario de huit pages et de 720 secondes reste un squelette pédagogique, avec un [storyboard](../presentations/drepanocytose/STORYBOARD.md). Aucun chapitre ne doit être supposé visible dans l'application actuelle.

## 2. État de reprise : version 0.2.0

- Le titre de fenêtre est **La drépanocytose**, depuis `presentations/drepanocytose/metadata.json`.
- L'en-tête clair utilise les commandes natives Windows et le logo approuvé.
- Le contenu démarre sur un écran de chargement blanc avec un petit flux sanguin animé centré : des globules normaux illustrés en CSS et la faucille issue du PNG Blender, accompagnés de la mention « Chargement… ».
- La page principale s'ouvre seulement après au moins une seconde visible et la réussite de la préparation initiale. Les callbacks sont alors arrêtés et les enfants de la section de chargement sont supprimés. La page devient entièrement noire et vide, sans animation active cachée.
- Ce fond noir est un état de contrôle temporaire, pas la direction artistique finale de toutes les pages.
- La distribution dédiée est prévue sous le nom `release/0.2.0/Drepanocytose-0.2.0-Windows-x64.exe`.

Les preuves de vérification doivent être lues dans [VALIDATION.md](VALIDATION.md), puis confrontées au code et à l'exécutable présents. Le dépôt peut évoluer après ce document.

## 3. Cartographie rapide

| À modifier | Point d'entrée |
| --- | --- |
| Nom de la présentation | `presentations/drepanocytose/metadata.json` |
| Fenêtre et cycle de vie Electron | `apps/desktop/main.cjs` |
| API de démarrage accessible au document | `apps/desktop/preload.cjs` |
| Structure, apparence et passage entre états | `apps/desktop/index.html`, `styles.css`, `renderer.js` |
| Préparation des ressources et conditions d'ouverture | `apps/desktop/preparation.js` et la liste de tâches de `renderer.js` |
| Règles de présentation et navigation | `packages/core/src/` |
| Contenu et durée pédagogique | `presentations/drepanocytose/presentation.ts` et `STORYBOARD.md` |
| Identité et fichiers du `.exe` portable | `electron-builder.yml` |
| Diagnostic de l'application | `scripts/check-desktop.cjs` |
| Logo et ses sources | `art/logo/` et `apps/desktop/assets/` |

La séquence de démarrage s'appuie sur `presentationHost.whenShown()` et un seul appel IPC, `presentation:when-shown`. Le minimum `loadingDurationMs` vaut 1000 dans le démarrage Electron. Les repères `loading-visible` et `normal-visible` servent à observer le délai réellement rendu. Ne pas démarrer une attente indépendante qui pourrait ouvrir la page avant la fin de sa préparation.

`preparation.js` expose `prepareResources(tasks)`, `minimumVisibleTime(milliseconds)` et `showWhenReady({ preparation, minimumVisible, show })`. Les tâches `{ id, prepare }` sont exécutées successivement. La page s'ouvre uniquement si leur préparation et la durée minimale sont toutes deux terminées. Un échec empêche l'ouverture et les tâches suivantes ne sont pas lancées ; l'interface affiche alors « Chargement impossible » avec le mouvement arrêté.

Les tâches réelles actuelles sont `intro-images` et `fonts`. Le PNG nécessaire à l'introduction est décodé avant le début du minimum visible ; la liste de préparation attend ce résultat et `document.fonts.ready`. `performance.measure('resource-preparation').detail.completed` consigne les identifiants terminés. La page noire ne comporte aucun modèle 3D, texture de scène ni shader : ne pas les déclarer préchargés.

Le chargement est une composition 2D animée, associant des dessins CSS et un prérendu Blender. Il ne faut pas le décrire comme une scène 3D temps réel. Le mouvement repose sur des transformations et de l'opacité CSS ; il vise 60 images par seconde, ou au moins 30 sur une machine plus limitée. Lire les mesures de frames dans le diagnostic et vérifier le mouvement visuellement avant de qualifier la fluidité.

La mesure `loading-animation` expose dans son champ `detail` le nombre de frames échantillonnées (`frameCount`), la cadence moyenne (`averageFps`), le 95e percentile des intervalles (`p95FrameMs`) et l'intervalle maximal (`maxFrameMs`). Il s'agit d'un échantillonnage des appels `requestAnimationFrame` ; distinguer ces observations d'une preuve de présentation physique de chaque image.

Le poste du collège est sous Windows 10 avec une mémoire limitée. Lire les métriques mémoire de l'ensemble des processus Electron dans le diagnostic, pas uniquement celles du document. `totalWorkingSetMiB` est une somme d'ensembles de travail qui peut compter plusieurs fois des pages partagées ; `totalPrivateCommittedMiB` décrit la mémoire privée engagée. Les résultats du poste de développement ne remplacent pas le test de la machine cible.

## 4. Travailler sur le dépôt

Commencer par `git status --short --branch`, puis lire `AGENTS.md` et les fichiers concernés. Préserver les modifications déjà présentes, y compris celles d'un autre agent. Le dépôt GitHub est `ibrahimbouillet/diapo-engine` ; le nom du dépôt et celui de l'exécutable ont des rôles différents.

Les dépendances de développement sont verrouillées dans `package-lock.json`. Node 24 et npm servent à travailler sur les sources. L'ordinateur qui lance le `.exe` final n'a pas besoin de ces outils. Une installation de dépendances peut nécessiter le réseau, alors que le fonctionnement de l'application livrée repose sur ses ressources embarquées.

Commandes de travail depuis la racine :

```powershell
npm ci
npm run dev
```

`npm run dev` ouvre la version de développement. Cela ne prouve pas qu'une nouvelle distribution portable fonctionne ; il faut construire et tester cette distribution après une modification livrée.

Si l'installation npm a été faite avec les scripts désactivés, vérifier la présence du binaire dans `node_modules/electron/dist/`. Le script du paquet Electron verrouillé peut installer ce binaire avec `node node_modules/electron/install.js`. Ce téléchargement concerne le poste de développement, pas le lancement du `.exe` livré.

## 5. Vérifier l'incrément

Exécuter les vérifications adaptées, sans confondre leurs rôles :

```powershell
npm run check
npm test
npm run validate
npm run check:desktop
```

- `check` contrôle les types du noyau, du scénario et des scripts TypeScript.
- `test` vérifie les règles et la navigation du noyau, dont la durée du premier scénario, ainsi que les deux conditions d'ouverture et les échecs de préparation.
- `validate` contrôle le scénario de la drépanocytose et ses 720 secondes prévues.
- `check:desktop` lance le diagnostic réel de la fenêtre en développement.

Par défaut, le diagnostic ne capture pas d'image pendant le chargement afin de limiter la perturbation des mesures de cadence. Pour obtenir une image du flux uniquement à des fins visuelles :

```powershell
npm run check:desktop -- --capture-loading
```

Ne pas utiliser la cadence issue de cette exécution avec capture comme mesure de référence. Vérifier aussi que la page normale annonce zéro animation active et que le contenu du chargement a été supprimé, au lieu d'être seulement masqué.

Observer ensuite l'application à l'écran : titre, icône, flux sanguin en mouvement, passage à la page noire et commandes natives. Une capture du contenu web ne contient pas l'en-tête Windows. Le respect de la durée minimale et la cadence d'affichage ne doivent pas être déduits uniquement des valeurs d'un minuteur ou d'une animation CSS. Distinguer les objectifs de cadence des mesures observées sur le poste. Vérifier aussi que la préparation réussit avant l'ouverture et qu'une tâche retardée prolonge bien le chargement au-delà d'une seconde.

Construire et vérifier le livrable :

```powershell
npm run package:win
node scripts/check-desktop.cjs "release/0.2.0/Drepanocytose-0.2.0-Windows-x64.exe"
```

L'option `--capture-loading` peut également être ajoutée après ce chemin pour un contrôle visuel de l'exécutable construit.

Adapter le dossier et le nom à la version réellement construite : la configuration utilise `directories.output: release/${version}`. Pour tester l'autonomie, copier seulement le `.exe` dans un autre dossier et le lancer depuis cet emplacement. Le diagnostic sur un exécutable utilise un nouveau profil et limite le chemin d'exécution aux répertoires Windows. Conserver le résultat, la version et les limites dans `docs/VALIDATION.md`.

Une mise à jour de l'interface doit être incluse dans une nouvelle construction. Modifier les sources sans reconstruire ne met pas à jour les anciens `.exe` présents dans `release/`.

## 6. Préserver les décisions utiles

- Garder le noyau indépendant du contenu médical et d'Electron.
- Garder une source commune pour le titre, afin que fenêtre et scénario ne divergent pas.
- Garder les boutons natifs Windows ; ne pas les remplacer par une imitation HTML.
- Conserver l'icône approuvée et ses fichiers Blender. Les références photographiques ont servi à l'analyse des formes ; leurs pixels ne composent pas le logo.
- Respecter la distinction page, état, transition et frame rendue décrite dans l'architecture.
- Garder les étapes de l'oral sous commande du présentateur ; les durées de répétition ne déclenchent pas les pages.
- Écrire les fonctionnalités futures comme des objectifs et les validations comme des résultats observés.

## 7. Poursuivre sans sauter d'étape

La prochaine scène candidate est le sang en mouvement, puis une cellule qui reste visible pendant la transition vers son explication. Le besoin exact de l'incrément suivant dépend de la demande en cours ; la feuille de route ne déclenche pas à elle seule l'ajout de toutes les fonctionnalités.

Pour cette suite, le point à prouver sera visuel : une même instance 3D doit être conservée et animée entre deux compositions, avec un retour en arrière cohérent. Le noyau décrit déjà les identifiants et les états cibles ; il reste à écrire le rendu, la gestion des ressources et l'interpolation.

Ajouter les tâches de la première scène dans la liste `prepareResources` de `renderer.js` à mesure que les ressources et le renderer existent réellement : lecture et décodage des modèles/images, préparation des textures pour le GPU, compilation des shaders et rendu masqué de chauffe si nécessaire. Garder la page de présentation cachée jusqu'à leur réussite. Le délai minimal ne fait aucune de ces opérations à leur place.

Préparer le strict nécessaire de la première scène, puis charger progressivement le reste. Pour la mémoire limitée du collège, éviter de charger tout l'exposé en textures 4K ou de précalculer toutes ses frames. La conservation des ressources partagées et leur libération explicite devront suivre les besoins réels du rendu. Voir la [section sur la préparation 3D](ARCHITECTURE.md#intégrer-la-future-première-scène-3d) et ses références Three.js.

Le futur éditeur Windows devra être conçu à partir de ces mécanismes vérifiés et d'un deuxième sujet réel. Une fenêtre Electron dédiée, même autonome, n'est pas encore l'éditeur général Diapo Engine.
