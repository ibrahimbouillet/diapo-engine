# Diapo Engine et La drépanocytose

Ce dépôt public réunit deux projets liés : **Diapo Engine**, futur logiciel Windows pour créer des présentations avec du code, et **La drépanocytose**, premier diaporama développé avec cette méthode.

Aujourd'hui, l'application livrée est dédiée à l'exposé sur la drépanocytose. L'éditeur général de présentations reste à construire. Le noyau réutilisable commence à prendre forme à partir de ce premier cas concret.

## Application actuelle

La fenêtre porte le titre **La drépanocytose**, défini dans les métadonnées de la présentation. Son démarrage comporte deux états :

1. Un écran de chargement blanc avec un petit flux sanguin animé centré et la mention « Chargement… », visible pendant au moins une seconde et jusqu'à la fin de la préparation initiale.
2. Une page principale entièrement noire et vide, temporaire, affichée une fois ces deux conditions remplies.

Le titre, le logo et les commandes de fenêtre restent dans l'en-tête natif Windows. Le logo est un globule rouge en faucille, modélisé et rendu dans Blender avec fond transparent.

L'affichage de cette étape utilise HTML et CSS, avec du JavaScript pour le changement d'état. Le chargement associe des globules normaux dessinés en CSS et le rendu PNG Blender du globule en faucille, déplacés dans une petite illustration de vaisseau. Ce mouvement n'est pas une scène 3D calculée en temps réel. Electron fournit la fenêtre Windows et embarque son moteur d'affichage.

Le mouvement vise 60 images par seconde, ou au moins 30 sur une machine plus limitée ; les mesures réelles sont à consulter dans la validation. À l'ouverture de la page, les callbacks d'animation sont arrêtés et le contenu du chargement est retiré du document. La lecture des médias et le scénario pédagogique ne sont pas encore intégrés à cette fenêtre.

La préparation actuelle vérifie le décodage du PNG d'introduction et la disponibilité des polices. La page noire n'a encore aucune ressource 3D. Les futurs modèles, textures et préparations du rendu devront être ajoutés comme de vraies tâches avant de pouvoir annoncer qu'ils sont prêts ; l'attente d'une seconde seule ne les prépare pas.

La distribution vise un `.exe` portable pour **Windows 10/11 x64**, avec ses ressources incluses et sans installation nécessaire au lancement. Le minimum d'une seconde visible ne comprend pas la préparation du processus et la décompression éventuelle du fichier portable.

L'ordinateur du collège étant sous Windows 10 avec une mémoire limitée, la cadence et la mémoire de l'ensemble de l'application doivent être vérifiées sur ce poste. Les mesures du poste de développement ne suffisent pas à le qualifier.

Les constructions locales sont rangées par version dans `release/<version>/`. Le livrable de cette étape est `release/0.2.0/Drepanocytose-0.2.0-Windows-x64.exe` ; les vérifications effectivement réalisées sont consignées dans la documentation de validation.

## Direction du projet

- Des pages vivantes associant textes, images, vidéos, sons et 3D.
- Des étapes que l'orateur déclenche à son rythme.
- Des éléments qui restent présents et se transforment entre les pages.
- Un retour en arrière qui restitue un état défini.
- À terme, une application Windows de création avec des outils visuels et la possibilité de coder dans les présentations.

Le premier exposé est prévu pour une classe de troisième : **12 minutes de présentation et jusqu'à 3 minutes de questions**. Son scénario de huit chapitres est un document de travail ; il n'est pas encore joué par l'application.

## Documentation

- [Les deux projets et leurs objectifs](docs/PROJECTS.md)
- [Architecture et fonctionnement actuel](docs/ARCHITECTURE.md)
- [Feuille de route](docs/ROADMAP.md)
- [Reprise du travail par Claude ou une autre IA](docs/HANDOFF.md)
- [Scénario de la drépanocytose](presentations/drepanocytose/STORYBOARD.md)
- [Source et références du logo](art/logo/ART_NOTES.md)
- [Vérifications et limites connues](docs/VALIDATION.md)

Le guide destiné aux futurs utilisateurs de l'éditeur viendra lorsque ce produit existera.
