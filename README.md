# Diapo Engine

Projet de logiciel pour créer des présentations par le code, avec des scènes animées, de la 3D en temps réel, des vidéos, du son et des transitions qui conservent les éléments entre les pages.

La première présentation expliquera la drépanocytose à une classe de troisième : **12 minutes d'exposé et jusqu'à 3 minutes de questions**. Elle sert de premier cas concret pour un moteur réutilisable sur d'autres sujets.

## État du projet

Fondation initiale : contrat TypeScript, navigation entre états, calcul des éléments conservés/entrants/sortants, validation du scénario et tests du noyau. Le scénario pédagogique est en préparation.

Le rendu 2D/3D, les animations, le logo, les médias et l'application Windows restent à développer. Aucun exécutable n'est encore livré. Les états du premier scénario constituent un squelette de contenu ; ils ne sont pas encore des pages mises en scène.

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

Le guide d'utilisation sera rédigé à une étape ultérieure.
