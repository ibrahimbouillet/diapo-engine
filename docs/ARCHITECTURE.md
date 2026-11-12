# Architecture du projet

## Objectif

Créer un moteur de présentations écrites en code. Le même moteur doit pouvoir jouer des exposés différents, chacun avec son scénario, ses ressources et sa direction artistique. Le premier exposé porte sur la drépanocytose.

Une présentation peut associer textes, images, modèles 3D, vidéos et sons. L'application finale doit s'ouvrir sur une brève séquence de lancement, puis afficher la présentation dans une fenêtre immersive, avec des commandes discrètes.

## Vocabulaire

| Terme | Rôle |
| --- | --- |
| Présentation | Scénario complet, catalogue des éléments, ressources et pages. |
| Page ou scène | Composition animée correspondant à un moment de l'exposé. C'est l'unité que l'on appelle souvent une diapositive. |
| État ou étape | Composition cible atteinte à l'intérieur d'une page, sur commande de l'orateur. |
| Transition | Passage animé entre deux états, dans une page ou entre deux pages. |
| Frame rendue | Image calculée par le moteur graphique. Le nombre de frames par seconde ne détermine pas la navigation. |

Les durées du scénario servent à préparer et répéter l'oral. Elles ne déclenchent aucun passage automatique dans ce premier contrat.

## Séparation des responsabilités

| Partie | Emplacement | État initial |
| --- | --- | --- |
| Contrat et navigation | `packages/core/` | Implémentation initiale, sans dépendance graphique. |
| Scénarios et ressources propres à chaque exposé | `presentations/<identifiant>/` | Premier scénario drépanocytose, textes structurels uniquement. |
| Validation d'un scénario | `scripts/` | Contrôle du contrat et de la durée prévue. |
| Rendu 2D/3D et lecture des médias | Futur `packages/renderer/` | À développer. |
| Fenêtre et distribution Windows | `apps/desktop/` et `electron-builder.yml` | Application dédiée La drépanocytose : chargement, puis page noire temporaire. |

Le noyau ne connaît ni les globules rouges, ni Electron, ni Three.js. Un scénario déclare ce qui doit être présent ; le futur rendu créera et animera les objets correspondants. Les deux objectifs du dépôt et leur état sont détaillés dans [PROJECTS.md](PROJECTS.md).

## Application actuelle : du lancement à la page noire

La fenêtre actuelle est le lecteur dédié à la présentation **La drépanocytose**. L'éditeur de création Diapo Engine n'est pas encore une application distincte. Le démarrage de ce lecteur ne joue pas encore les pages du noyau TypeScript.

| Fichier | Responsabilité |
| --- | --- |
| `presentations/drepanocytose/metadata.json` | Identifiant, titre et sous-titre publics de la présentation. Source commune au lecteur et au scénario TypeScript. |
| `apps/desktop/main.cjs` | Processus principal Electron : fenêtre native, titre, icône, politique réseau, visibilité et diagnostic. |
| `apps/desktop/preload.cjs` | Pont limité entre Electron et le document : exposition de `presentationHost.whenShown()`. |
| `apps/desktop/index.html` | Structure des deux sections : `section#loading` et `main#presentation`. |
| `apps/desktop/styles.css` | Apparence et mouvement du petit flux sanguin centré sur fond blanc, puis contenu noir. |
| `apps/desktop/renderer.js` | Passage du chargement à la page normale, repères temporels et échantillonnage des frames pour le diagnostic. |
| `apps/desktop/preparation.js` | Tâches de préparation séquentielles et ouverture après préparation réussie et durée visible minimale. |
| `electron-builder.yml` | Identité de la distribution dédiée, liste des fichiers inclus et cible portable Windows x64. |
| `scripts/check-desktop.cjs` | Lancement du diagnostic en développement ou sur un exécutable construit. |

Le fonctionnement suit cette séquence :

1. Electron crée une fenêtre initialement masquée, avec le titre des métadonnées et l'icône locale. Il charge le document local.
2. Le script du document appelle `presentationHost.whenShown()`. Le pont utilise l'appel IPC `presentation:when-shown` et attend que la fenêtre soit visible.
3. Le processus principal renvoie uniquement les métadonnées publiques et la durée `loadingDurationMs: 1000`.
4. Le rendu attend le décodage de l'image locale, puis deux `requestAnimationFrame`. Il pose le repère `loading-visible`, démarre le mouvement et le minimum visible d'une seconde. Le minimum commence donc après l'affichage de la fenêtre et la préparation de l'image d'introduction, pas pendant la préparation cachée de la fenêtre.
5. Le rendu lance aussi la préparation initiale et attend deux conditions : préparation réussie et minimum visible écoulé. Une préparation plus longue prolonge le chargement ; le minuteur ne force pas l'ouverture d'une page incomplète.
6. Lorsque les deux conditions sont remplies, le rendu arrête l'échantillonnage `requestAnimationFrame`, cache le chargement et supprime ses enfants avec `replaceChildren()`. Les cellules, l'image et le libellé ne restent pas animés derrière la page normale. Le rendu affiche ensuite la page principale noire et vide ; le repère `normal-visible` permet de mesurer le passage.

Le chargement contient un petit flux sanguin animé : quatre globules normaux et une cellule en faucille traversent une illustration de vaisseau centrée sur fond blanc. Le cadre mesure au maximum 242 × 96 pixels CSS et s'adapte à une fenêtre plus étroite. La mention discrète « Chargement… » apparaît sous le flux pour rendre sa fonction explicite. L'icône et le titre demeurent dans l'en-tête Windows. La page principale est temporairement noire afin de contrôler ce changement d'état.

Les globules normaux sont des illustrations CSS donnant un aspect de disque creusé au centre. Le globule en faucille utilise le PNG transparent issu du modèle Blender approuvé. CSS anime principalement les transformations et l'opacité de ces éléments pour limiter le travail de mise en page et de peinture pendant le mouvement. Il s'agit d'une composition 2D avec un élément prérendu en 3D, pas d'un maillage, d'une caméra ou d'un éclairage calculés en temps réel.

La préférence système `prefers-reduced-motion` remplace la traversée par un déplacement plus lent et limité. Les éléments sont préparés en pause ; le mouvement commence avec le repère de chargement visible.

L'objectif de fluidité est 60 images par seconde, avec 30 comme seuil de repli pour une machine plus limitée. La cadence doit être mesurée sur le poste réellement utilisé : la présence d'une animation CSS ou d'un appel `requestAnimationFrame` ne prouve pas à elle seule ce niveau de fluidité. Les intervalles de frames mesurés pendant le chargement complètent l'observation à l'écran ; ils ne constituent pas une garantie pour tous les PC.

Le rendu enregistre `performance.measure('loading-animation')`. Son champ `detail` contient `frameCount`, `averageFps`, `p95FrameMs` et `maxFrameMs`, calculés à partir des appels `requestAnimationFrame` reçus pendant le chargement. Ces valeurs décrivent la cadence observée de ces appels sur le poste testé ; elles ne prouvent pas que chaque image a été physiquement présentée à l'écran.

Le diagnostic courant évite de capturer et d'encoder une image pendant l'animation, pour ne pas perturber cette mesure courte. L'option `--capture-loading` produit une image de contrôle visuel, mais le résultat de cadence de cette exécution ne doit pas servir de mesure de référence. La capture de la page noire est réalisée après la fin du mouvement.

La suppression du contenu animé réduit le travail restant après le chargement ; elle ne garantit pas une restitution immédiate de toute la mémoire au système, car Chromium peut conserver des caches. Le diagnostic récupère aussi les métriques des processus Electron avec `app.getAppMetrics()` : `totalWorkingSetMiB` et `totalPrivateCommittedMiB`. Le total des ensembles de travail agrège des processus et peut compter de la mémoire partagée plusieurs fois ; il n'équivaut pas à une mesure unique de mémoire physique exclusivement occupée.

La seconde est une durée minimale visible, pas une échéance d'ouverture. La préparation, l'ordonnancement du système ou une fenêtre en arrière-plan peuvent prolonger le chargement. Le temps avant l'apparition de la fenêtre — notamment la décompression du `.exe` portable — n'est pas compris dans ce minimum.

## Préparation réelle des ressources

Le module `preparation.js` expose trois opérations indépendantes du thème de la présentation :

- `prepareResources(tasks)` exécute successivement des tâches `{ id, prepare }` et renvoie les identifiants terminés. Un échec arrête la séquence ; les tâches suivantes ne sont pas lancées.
- `minimumVisibleTime(milliseconds)` attend une durée minimale en utilisant l'horloge monotone `performance.now()`.
- `showWhenReady({ preparation, minimumVisible, show })` appelle `show` seulement après la réussite des deux promesses. Si l'une échoue, la page n'est pas ouverte.

La liste de tâches est actuellement définie dans `renderer.js` : `intro-images` attend le décodage de l'image réellement utilisée par l'introduction ; `fonts` attend `document.fonts.ready`. Le décodage du PNG est déjà attendu avant le début du minimum visible pour que l'introduction soit prête. Le repère `resource-preparation` mesure donc la séquence de tâches après cette étape, pas tout le temps écoulé depuis le lancement du processus.

`performance.measure('resource-preparation').detail.completed` contient les identifiants des tâches réellement terminées. La page normale actuelle est noire et vide : aucun modèle, texture de scène ou shader 3D n'est encore préparé. La structure du chargement fournit le point d'intégration de ces travaux, sans les simuler ni les déclarer terminés par un simple délai.

En cas d'échec de préparation ou de décodage initial, la page normale n'est pas ouverte. Le mouvement est arrêté et la mention devient « Chargement impossible ». Il n'existe pas encore de commande de reprise dans cette interface minimale.

### Intégrer la future première scène 3D

Quand le rendu existera, ajouter des tâches réelles à la liste de préparation du renderer : lecture des fichiers utiles à la première scène, décodage des modèles et des images, préparation des textures pour le GPU, compilation des matériaux/shaders et rendu de chauffe masqué si nécessaire. Le résultat de chaque tâche devra correspondre au renderer, aux matériaux et à la scène qui seront effectivement affichés.

Ces étapes restent à implémenter et à vérifier avec Three.js. Charger un fichier de modèle ne prouve pas que ses textures sont décodées ou que ses shaders ont été compilés. De même, un rendu de chauffe ne remplace pas l'observation de la première image visible et la recherche de ressources qui apparaîtraient en retard.

Pour l'ordinateur du collège à mémoire limitée, préparer d'abord le strict nécessaire de la première scène, puis charger progressivement les ressources suivantes. Les tâches séquentielles actuelles évitent de démarrer toutes les allocations simultanément, mais ne constituent pas encore un budget mémoire complet. Les résolutions de textures, la conservation des ressources partagées et la libération des ressources inutiles devront être mesurées et définies. Ne pas charger tout l'exposé en textures 4K ni précalculer toutes les frames par défaut.

## Pourquoi HTML, CSS, JavaScript et Electron

HTML décrit les sections affichées ; CSS détermine leur disposition, leurs couleurs, l'apparence des cellules et leur mouvement ; JavaScript gère l'état et son rythme. Le PNG de la faucille contient le volume, la matière et l'éclairage déjà rendus dans Blender. Electron fournit la fenêtre Windows et son moteur Chromium embarqué. Le résultat reste une application de bureau distribuable en `.exe` : l'utilisateur n'a pas à ouvrir un site ni à installer un navigateur pour cette présentation.

La 3D temps réel demandera un composant de rendu adapté, avec Three.js comme piste retenue. Le HTML ne remplace pas une scène 3D : les modèles, caméras, matériaux et animations seront pris en charge par ce futur rendu. Le noyau TypeScript décrira la navigation et la continuité des éléments sans dépendre de la bibliothèque graphique choisie.

## Limite entre les processus

Le document n'a pas d'accès Node.js : `nodeIntegration` est désactivé, `contextIsolation` et la sandbox sont activés. Le pont de préchargement expose une opération ciblée de démarrage, pas un accès général aux fichiers ou à tous les canaux IPC. Les nouvelles fenêtres, la navigation externe et les requêtes réseau ne servent pas cette étape et restent refusées.

Cette limite concerne le lecteur actuel. Le futur éditeur capable d'exécuter du code de présentation devra définir séparément son API et son isolation ; le pont de démarrage ne constitue pas déjà cette architecture d'extension.

## Contrat initial

Une présentation a un `schemaVersion`, un identifiant, un titre, un catalogue d'éléments et une liste de pages. `schemaVersion` désigne la version du format, distincte de la version du logiciel et de la révision éditoriale du contenu.

Chaque page annonce une durée de répétition en secondes et contient au moins un état. Un état décrit entièrement les éléments présents et leurs propriétés cibles. Un élément absent de cet état doit sortir de la composition. Il n'hérite pas accidentellement des propriétés d'un état visité plus tôt.

Les éléments sont déclarés une seule fois dans le catalogue de la présentation. Leur identifiant assure leur continuité. Leur type reste stable : texte, modèle 3D, image, vidéo ou audio. Les ressources peuvent être référencées par identifiants dans un catalogue de chemins locaux relatifs à la présentation.

Les valeurs par défaut des transformations sont explicites : position et rotation nulles, échelle unitaire et opacité égale à un. Les propriétés additionnelles décrivent des valeurs sérialisables ; elles ne constituent pas du code exécuté implicitement.

La validation initiale contrôle les références déclarées et les chemins locaux. La présence réelle des fichiers, leurs formats, codecs, licences et leur prise en charge graphique seront vérifiés avec le futur chargement des ressources et la distribution. Un scénario valide selon le contrat n'est donc pas encore une présentation visuellement validée.

## Navigation et continuité

Le curseur indique une page et un état. « Suivant » avance d'un état, puis rejoint le premier état de la page suivante. « Précédent » revient à l'état précédent, puis au dernier état de la page précédente. Les limites restent stables au début et à la fin de la présentation.

Pour un passage donné, le noyau produit un plan de transition :

- **Conservés** : identifiants présents avant et après le passage.
- **Entrants** : identifiants présents uniquement dans l'état cible.
- **Sortants** : identifiants présents uniquement dans l'état de départ.

Le futur rendu devra conserver la même instance pour un élément conservé et interpoler ses propriétés. Il devra garder les sortants disponibles jusqu'à la fin de leur animation, puis les libérer. Le noyau décrit cette continuité ; il n'instancie encore aucun objet graphique.

Exemple prévu : un globule quitte le flux, se rapproche de la caméra et reste visible lorsque la page suivante ajoute une explication sur l'hémoglobine. Le changement de page n'impose pas un écran vide ou le rechargement du modèle.

Un retour arrière calcule directement la composition cible depuis le scénario. Il ne dépend pas de l'inversion d'une suite d'effets impératifs. L'interruption d'une transition en cours et le rétablissement d'une scène seront définis et testés dans le rendu.

## Animations et médias à développer

Le contrat actuel décrit les compositions cibles et la durée d'une transition. La frise temporelle, les mouvements d'ambiance en boucle, les morphings de maillage, les caméras et les sous-titres synchronisés restent à concevoir.

Les médias devront déclarer une politique de lecture : démarrage, pause, fin et retour arrière. Un son ou une vidéo conservé entre deux pages devra continuer sans double lecture. Une commande globale permettra de couper le son. Ces règles sont des exigences de conception, pas des fonctionnalités déjà implémentées.

## Cible Windows autonome

La fenêtre utilise **Electron** et son cadre natif Windows (`frame: true`). Son nom visible est **La drépanocytose**, issu des métadonnées de la présentation ; le titre HTML ne doit pas remplacer cette source. L'icône et le titre sont dans l'en-tête du système, qui reste clair même lorsque la page principale est noire. Le menu applicatif est supprimé. Les commandes de fenêtre sont celles de Windows, y compris les fonctions Snap disponibles sur Windows 11.

Electron embarque son moteur Chromium. La cible `portable` d'electron-builder produit un `.exe` sans installation, incluant ce moteur et les ressources locales. La première cible est Windows 10/11 x64. L'identité de cette distribution est dédiée au diaporama (`io.github.ibrahimbouillet.drepanocytose`, produit La drépanocytose), tandis que le dépôt de développement reste `diapo-engine`. Three.js n'est pas encore intégré à l'application.

Les artefacts sont construits dans `release/${version}/`, défini par `directories.output` dans la configuration de construction. Chaque version dispose ainsi de son propre répertoire de préparation. Pour 0.2.0, le fichier attendu est `release/0.2.0/Drepanocytose-0.2.0-Windows-x64.exe`.

Objectifs de livraison :

- Fonctionnement hors connexion, sans compte ni téléchargement au lancement.
- Aucun Node.js, Python, outil de développement ou navigateur à installer par le présentateur.
- Textes, polices, modèles, sons et vidéos inclus dans la distribution.
- Aucune demande d'élévation administrateur prévue par l'application.
- Qualité graphique adaptable à un ordinateur de collège.
- Écran de chargement visible au moins une seconde après apparition de la fenêtre, maintenu jusqu'à la fin de la préparation initiale ; durée réelle à mesurer sur la machine cible.

L'autonomie concerne les dépendances de l'application. Le système Windows, les pilotes graphiques et les règles d'exécution du collège restent des conditions de fonctionnement. Le prototype doit être testé tôt sur l'ordinateur qui servira à présenter. Un fichier portable peut décompresser son contenu dans un dossier temporaire au lancement ; un fichier unique ne garantit pas un démarrage instantané.

La cible concrète est un ordinateur de collège sous Windows 10 avec une mémoire limitée. Les mesures doivent porter sur tous les processus de l'application et sur le mouvement réellement affiché. La mémoire disponible exacte, les pilotes et la cadence de ce poste restent à vérifier ; un bon résultat sous Windows 11 sur le poste de développement ne suffit pas à les déduire.

## Vérification

Les tests du noyau couvrent la validation, les limites de navigation, le retour arrière, l'absence de mutation du scénario et le plan de transition d'éléments partagés. Le premier exposé doit totaliser exactement 720 secondes prévues. Les tests de `apps/desktop/tests/preparation.test.js` vérifient séparément l'attente des deux conditions dans les deux ordres de résolution et l'absence d'ouverture après un échec de préparation.

Le diagnostic de démarrage contrôle les deux états dans le bon ordre, leur visibilité et un intervalle observé d'au moins 1000 ms entre `loading-visible` et `normal-visible`. Il contrôle aussi les tâches réellement terminées, la présence des cellules normales, de la faucille et le chargement des images. Le flux doit être observé en mouvement et sa cadence évaluée à partir des intervalles de frames réellement mesurés. La zone principale finale doit être vide et noire, sans défilement ni animation active (`activeAnimationCount: 0`). La capture de la zone web ne contrôle pas l'en-tête système ; l'icône, le titre et les commandes natives demandent un essai visuel séparé. Les résultats effectivement obtenus figurent dans [VALIDATION.md](VALIDATION.md).

La validation du futur rendu demandera des captures, une vérification des transitions et des essais de navigation pendant la lecture. Les essais sur un compte utilisateur standard sans outils de développement et sur la machine du collège restent nécessaires avant qualification pour l'exposé.

## Références techniques

- [Three.js](https://threejs.org/) : bibliothèque de rendu 3D.
- [WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html) : points d'intégration du rendu et de sa préparation.
- [GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html) : chargement des modèles glTF.
- [Libération des ressources Three.js](https://threejs.org/manual/pages/cleanup.html) : gestion explicite des ressources graphiques.
- [Documentation Electron](https://www.electronjs.org/docs/latest) : moteur embarqué et application de bureau.
- [Cibles de distribution electron-builder](https://www.electron.build/v26/docs/targets/) : exécutable portable.
- [Options du format portable](https://www.electron.build/docs/api/app-builder-lib.interface.portableoptions/) : décompression au lancement.
