# Feuille de route

Cette feuille de route distingue la présentation dédiée et le futur logiciel de création. Les fonctionnalités projetées ne sont pas des fonctionnalités livrées.

## Base déjà construite

- Noyau TypeScript : contrat des présentations, validation, navigation et plans de transition.
- Scénario pédagogique de huit chapitres, prévu pour douze minutes plus les questions.
- Fenêtre Electron avec en-tête et commandes natifs Windows.
- Logo original créé dans Blender, PNG transparent et ICO à plusieurs résolutions.
- Construction d'un exécutable Windows x64 portable.

Les preuves disponibles et leurs limites figurent dans [VALIDATION.md](VALIDATION.md).

## Présentation La drépanocytose

### Étape actuelle : lancement et remise en place

- Utiliser le titre de la présentation dans la fenêtre et les métadonnées de distribution.
- Séparer le chargement et la page principale.
- Afficher un petit flux sanguin animé centré sur fond blanc, avec la mention « Chargement… » ; ouvrir la page noire après au moins une seconde visible et la préparation initiale réussie.
- Utiliser les cellules normales illustrées en CSS et la faucille prérendue dans Blender ; vérifier le mouvement et les intervalles de frames observés.
- Préparer réellement l'image d'introduction et les polices, et maintenir le chargement si une tâche prend plus de temps que le minimum visible.
- Arrêter les callbacks et retirer le contenu animé au passage à la page normale.
- Mesurer la mémoire de l'ensemble des processus et vérifier la cible Windows 10 à mémoire limitée du collège.
- Documenter le fonctionnement, les deux objectifs du dépôt et la procédure de reprise.

### Prochain incrément visuel

- Définir précisément la première scène et ses points d'arrêt oral.
- Ajouter les vraies tâches de préparation de ses modèles, textures et rendu ; conserver la scène masquée jusqu'à leur réussite.
- Afficher un vaisseau et des globules rouges en mouvement.
- Isoler une cellule et la conserver pendant le passage à l'explication suivante.
- Vérifier la navigation et les interruptions de transition à l'écran.

Le fond noir actuel reste un témoin temporaire jusqu'à la mise en scène demandée. La réalisation de cette première scène constituera un incrément séparé.

La page noire actuelle n'a aucune ressource 3D. La préparation future doit porter d'abord sur les ressources utiles à la première scène, puis avancer progressivement. Le préchargement de toutes les textures 4K ou le précalcul de toutes les frames ne sont pas des objectifs de cette étape.

Le chargement actuel vise 60 images par seconde, ou au moins 30 sur une machine plus limitée. Ce flux compact ne remplace pas la future scène 3D du vaisseau ; les mesures locales n'en garantissent pas les performances sur l'ordinateur du collège.

### Exposé complet

- Relire les formulations scientifiques et préparer les textes projetés.
- Produire et vérifier les modèles et illustrations utiles.
- Mettre en scène les huit chapitres et leurs transitions.
- Ajouter les sons ou vidéos qui servent l'explication.
- Répéter l'exposé pour ajuster le rythme aux douze minutes prévues.
- Tester l'exécutable sur l'ordinateur du collège, avec ses ressources locales et ses commandes de présentation.

## Diapo Engine

### Construire le moteur de lecture réutilisable

- Relier le noyau à un rendu 2D/3D.
- Définir la frise temporelle et les mouvements qui peuvent boucler pendant une pause orale.
- Définir les règles de lecture des médias et leur continuité entre les pages.
- Vérifier l'identité des objets conservés, la libération des objets sortants et le retour en arrière.
- Ajouter un catalogue de ressources contrôlé à la construction.

### Généraliser à partir d'un deuxième sujet

- Ajouter une autre présentation sans modifier le noyau pour son thème.
- Ajuster les abstractions à partir des besoins observés dans les deux présentations.
- Stabiliser le format de projet, les métadonnées et les conventions de programmation.

### Construire l'application de création Windows

- Concevoir l'interface de composition et d'organisation des scènes.
- Définir les outils de code et leur API, ainsi que l'isolation du code d'une présentation.
- Ajouter la prévisualisation et les outils de vérification du scénario.
- Préparer l'export d'une présentation avec ses ressources.
- Rédiger le guide utilisateur lorsque ces fonctions sont disponibles.

Les choix détaillés de l'éditeur viendront après la validation des mécanismes de lecture. La présentation dédiée reste le premier livrable concret.
