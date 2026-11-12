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
| Fenêtre et distribution Windows | `apps/desktop/` et `electron-builder.yml` | Fenêtre native blanche, distribution portable x64. |

Le noyau ne connaît ni les globules rouges, ni Electron, ni Three.js. Un scénario déclare ce qui doit être présent ; le futur rendu crée et anime les objets correspondants.

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

La fenêtre initiale utilise **Electron** et son cadre natif Windows (`frame: true`). L'icône et le titre sont dans l'en-tête du système ; le document affiché est vide et blanc. Le menu applicatif est supprimé. Les commandes de fenêtre sont celles de Windows, y compris les fonctions Snap disponibles sur Windows 11.

Electron embarque son moteur Chromium. La cible `portable` d'electron-builder produit un `.exe` sans installation, incluant ce moteur et les ressources locales. La première cible est Windows 10/11 x64. Three.js reste la piste retenue pour le futur rendu 3D ; il n'est pas encore intégré à l'application.

Objectifs de livraison :

- Fonctionnement hors connexion, sans compte ni téléchargement au lancement.
- Aucun Node.js, Python, outil de développement ou navigateur à installer par le présentateur.
- Textes, polices, modèles, sons et vidéos inclus dans la distribution.
- Aucune demande d'élévation administrateur prévue par l'application.
- Qualité graphique adaptable à un ordinateur de collège.
- Écran de lancement bref, autour d'une seconde lorsque les ressources sont prêtes ; durée réelle à mesurer sur la machine cible.

L'autonomie concerne les dépendances de l'application. Le système Windows, les pilotes graphiques et les règles d'exécution du collège restent des conditions de fonctionnement. Le prototype doit être testé tôt sur l'ordinateur qui servira à présenter. Un fichier portable peut décompresser son contenu dans un dossier temporaire au lancement ; un fichier unique ne garantit pas un démarrage instantané.

## Vérification

Les tests du noyau couvrent la validation, les limites de navigation, le retour arrière, l'absence de mutation du scénario et le plan de transition d'éléments partagés. Le premier exposé doit totaliser exactement 720 secondes prévues.

Le diagnostic de la fenêtre contrôle réellement son document vide et les pixels de la zone de contenu, qui doivent tous être blancs. Ce contrôle ne capture pas l'en-tête système ; l'icône et les commandes natives demandent un essai visuel séparé.

La validation du futur rendu demandera des captures, une vérification des transitions et des essais de navigation pendant la lecture. Les essais sur un compte utilisateur standard sans outils de développement et sur la machine du collège restent nécessaires avant qualification pour l'exposé.

## Références techniques

- [Three.js](https://threejs.org/) : bibliothèque de rendu 3D.
- [Documentation Electron](https://www.electronjs.org/docs/latest) : moteur embarqué et application de bureau.
- [Cibles de distribution electron-builder](https://www.electron.build/v26/docs/targets/) : exécutable portable.
- [Options du format portable](https://www.electron.build/docs/api/app-builder-lib.interface.portableoptions/) : décompression au lancement.
