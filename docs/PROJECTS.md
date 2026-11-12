# Deux projets, un même dépôt

## 1. La drépanocytose : la présentation à réaliser

**Livrable :** une application Windows autonome dédiée à un exposé de SVT de troisième. Son nom visible est celui du diaporama, **La drépanocytose**. Le nom du moteur de création ne doit pas remplacer ce titre.

L'exposé doit expliquer le rôle des globules rouges et de l'hémoglobine, les mécanismes de la drépanocytose, sa transmission, ses conséquences et sa prise en charge. Le scénario de travail comporte huit chapitres, calibrés pour douze minutes d'exposé, puis jusqu'à trois minutes de questions.

La direction visuelle est celle d'un documentaire que l'orateur pilote : circulation du sang en 3D, changements d'échelle, explications progressives et transitions continues. Le mouvement peut se poursuivre discrètement pendant la parole ; les étapes importantes attendent une action du présentateur.

### Objectifs par étape

| Horizon | Résultat attendu |
| --- | --- |
| Étape actuelle | Une fenêtre nommée La drépanocytose, un petit flux sanguin animé sur fond blanc avec la mention « Chargement… », puis une page noire vide. L'ouverture attend au moins une seconde visible et la préparation initiale réussie. Ce fond noir est un état de contrôle temporaire. |
| Construction du contenu | Mettre en scène les chapitres un à un, à commencer par la circulation du sang et la continuité d'un globule entre deux pages. |
| Livraison de l'exposé | Une présentation complète, relue scientifiquement, répétée à l'oral et testée sur l'ordinateur du collège. |

Le logo rouge en faucille a déjà été créé dans Blender et approuvé. Ses sources, rendus et contrôles de cadrage sont conservés dans le dépôt.

Le premier chargement utilise son PNG transparent pour la cellule en faucille et des illustrations CSS pour les cellules normales. Ce choix permet de tester un mouvement biologique simple avant la future scène 3D temps réel. La fluidité visée est 60 images par seconde, avec 30 comme seuil de repli ; elle reste à mesurer sur chaque machine cible.

Le chargement prépare actuellement l'image utilisée dans l'introduction et les polices. Les futurs modèles, textures, shaders et préparations du rendu devront constituer des tâches réelles avant l'ouverture de la première scène. La page noire actuelle ne contient aucune ressource 3D à précharger. Si une préparation demande plus d'une seconde, le chargement doit rester visible jusqu'à sa réussite.

La machine de présentation du collège fonctionne sous Windows 10 avec une mémoire limitée. L'animation de lancement est arrêtée et retirée du document lorsque la page s'ouvre ; l'utilisation mémoire et la cadence de l'application complète doivent néanmoins être mesurées sur cette machine. Les scènes suivantes devront être préparées progressivement, avec des ressources adaptées à ce budget mémoire.

## 2. Diapo Engine : le futur logiciel de création

**Livrable final visé :** une véritable application Windows publique dans laquelle on crée, prévisualise et prépare des diaporamas avancés, avec la possibilité d'y écrire du code.

L'auteur doit pouvoir composer des scènes, organiser des états et des transitions, importer des ressources et programmer des comportements visuels. Les présentations pourront associer 2D, 3D en temps réel, vidéo et son. Un élément pourra persister entre deux pages et changer de position, de taille, d'apparence ou de forme.

L'interface de création, l'éditeur de code intégré, la prévisualisation et l'export de présentations autonomes sont des objectifs du produit. Ils ne sont pas encore implémentés. Les modalités de programmation, l'API d'extension, l'isolation du code et le format de projet doivent être conçus avant d'ajouter ces fonctions.

### Objectifs par étape

| Horizon | Résultat attendu |
| --- | --- |
| Étape actuelle | Extraire des règles réutilisables du premier diaporama : états, identité des éléments, navigation et transitions. Documenter les choix et les limites. |
| Généralisation | Ajouter un rendu réutilisable, une gestion des médias et des ressources, puis vérifier le moteur avec une deuxième présentation sur un autre sujet. |
| Produit de création | Construire l'éditeur Windows : composition des scènes, outils de code, prévisualisation et production d'un exécutable de présentation. |

## Ce qui relie les projets

La présentation sur la drépanocytose fournit des besoins concrets et des preuves visuelles. Le moteur conserve les mécanismes utiles à plusieurs sujets ; le scénario, le contenu scientifique et les ressources de l'exposé restent propres à la présentation.

Le terme « moteur » peut donc désigner deux choses qu'il faut distinguer :

- Le **noyau TypeScript existant**, une bibliothèque de règles et de navigation sans rendu graphique.
- Le **futur produit Diapo Engine**, une application complète de création, qui utilisera ce noyau et d'autres composants.

Un dépôt commun est utilisé pour le moment : `ibrahimbouillet/diapo-engine`. Il contient une application dédiée et un noyau en préparation, pas deux logiciels terminés. La séparation en dépôts ou en distributions indépendantes pourra être décidée lorsque les besoins réels le justifieront.

## Choix à conserver

- Le titre de la fenêtre de présentation provient de ses métadonnées.
- Le noyau ne dépend pas de la drépanocytose et ne contient pas de logique médicale.
- Les ressources nécessaires au fonctionnement sont incluses dans la distribution.
- Les contrôles de fenêtre sont ceux de Windows.
- Les états montrés à l'écran suivent l'étape de travail demandée ; le contenu pédagogique est intégré progressivement.
- Les affirmations scientifiques, les performances et la compatibilité sont qualifiées à partir de vérifications distinctes.
