# Diapo Engine

Projet de logiciel pour créer des présentations par le code, avec des scènes animées, de la 3D en temps réel, des vidéos, du son et des transitions qui conservent les éléments entre les pages.

La première présentation expliquera la drépanocytose à une classe de troisième : **12 minutes d'exposé et jusqu'à 3 minutes de questions**. Elle sert de premier cas concret pour un moteur réutilisable sur d'autres sujets.

## État du projet

Première application de bureau : fenêtre blanche vide, titre et icône dans l'en-tête natif Windows, commandes système de réduction, agrandissement et fermeture. Le logo est un globule rouge en faucille modélisé et rendu dans Blender, avec fond transparent.

Le noyau TypeScript décrit déjà la navigation, les états et les éléments conservés/entrants/sortants. Il reste séparé de cette fenêtre : aucune présentation, animation ou commande pédagogique n'est affichée pour l'instant. Le rendu 2D/3D et la lecture des médias restent à développer.

La distribution vise un `.exe` portable pour **Windows 10/11 x64**, avec son moteur inclus, sans installation ni connexion nécessaire à son fonctionnement. La compatibilité doit être vérifiée sur la machine du collège ; les règles d'exécution de l'établissement restent applicables. Les coins arrondis et les dispositions Snap suivent les capacités et réglages de Windows.

## Principes

- Une page est une scène vivante qui peut contenir plusieurs types de médias.
- L'orateur déclenche les étapes et garde le temps d'expliquer.
- Un élément identifié peut rester présent et changer d'état entre deux pages.
- Le retour en arrière restitue un état défini par le scénario.
- Le moteur reste indépendant du thème de chaque présentation.
- La cible de distribution est un exécutable Windows portable, utilisable hors connexion, avec ses ressources incluses.

## Conception

- [Architecture et règles du moteur](docs/ARCHITECTURE.md)
- [Étapes de développement](docs/ROADMAP.md)
- [Premier scénario : drépanocytose](presentations/drepanocytose/STORYBOARD.md)
- [Source du logo Blender](art/logo/build_logo.py)
- [Vérifications de la première fenêtre](docs/VALIDATION.md)

Le guide d'utilisation sera rédigé à une étape ultérieure.
