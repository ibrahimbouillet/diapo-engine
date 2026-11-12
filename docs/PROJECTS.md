# Deux projets, un même dépôt

## La drépanocytose : la présentation

**Livrable actuel :** une page web dédiée à un exposé de SVT de troisième, intitulée **La drépanocytose**.

L'exposé doit expliquer le rôle des globules rouges et de l'hémoglobine, les mécanismes de la drépanocytose, sa transmission, ses conséquences et sa prise en charge. Le scénario de travail comporte huit chapitres, pour douze minutes d'exposé puis jusqu'à trois minutes de questions.

La direction visuelle reste celle d'un documentaire piloté par l'orateur : circulation du sang en 3D, changements d'échelle, explications progressives et transitions continues. Ces scènes ne sont pas encore intégrées.

| Horizon | Résultat attendu |
| --- | --- |
| Étape actuelle | Page web : chargement biologique reconnaissable, au moins une seconde visible et préparation réussie, puis page noire temporaire. |
| Construction du contenu | Mettre en scène les chapitres progressivement, en commençant par la circulation du sang et la continuité d'un globule. |
| Livraison de l'exposé | Présentation relue scientifiquement, répétée à l'oral et testée dans le navigateur de l'ordinateur du collège. |

Le logo rouge en faucille a été créé dans Blender et approuvé. Le chargement utilise son PNG transparent, avec des globules normaux illustrés en CSS. Le PNG et les polices sont les ressources réellement préparées aujourd'hui ; la page noire ne contient pas encore de modèle 3D.

## Diapo Engine : l'outil de création futur

**Objectif final :** un outil permettant de composer, programmer, prévisualiser et préparer des présentations avancées.

L'auteur pourra associer textes, images, son, vidéo et 3D, organiser des états et des transitions, puis conserver ou transformer un élément entre deux pages. L'interface de création, les outils de code intégrés et l'export restent à construire.

| Horizon | Résultat attendu |
| --- | --- |
| Étape actuelle | Vérifier les règles de navigation et de continuité dans le noyau, puis développer le rendu web à partir du premier exposé. |
| Généralisation | Utiliser le même moteur avec une deuxième présentation et ajuster les abstractions à partir de besoins réels. |
| Produit de création | Construire les outils de composition, de programmation et de prévisualisation, puis définir la distribution du produit. |

L'intention exprimée pour une étape ultérieure est une application Windows utilisant Rust. Il n'existe pas de composant Rust dans la version actuelle et aucun exécutable n'est construit. L'intégration native et son budget de ressources devront être conçus à partir des besoins observés et des mesures.

## Organisation commune

Le dépôt `ibrahimbouillet/diapo-engine` contient pour l'instant :

- La page dédiée dans `apps/web/`.
- Le noyau TypeScript dans `packages/core/`, conservé comme contrat et outil de test, hors de la page actuelle.
- Le scénario et ses métadonnées dans `presentations/drepanocytose/`.
- Les sources du logo et la documentation.

La présentation fournit les besoins concrets. Le moteur doit conserver les mécanismes réutilisables, tandis que le contenu médical et les ressources propres à l'exposé restent séparés.

## Contraintes à conserver

- Titre de l'onglet et favicon propres à la présentation.
- Minimum de chargement visible et préparation réelle réussie avant affichage.
- Chargement progressif des ressources ; pas de préchargement de tout l'exposé en 4K.
- Mouvements de fond discrets et étapes importantes sous contrôle de l'orateur.
- Vérification sur le navigateur Windows 10 du collège, dont la mémoire disponible exacte reste à connaître.
- Mesures des anciennes versions Electron conservées comme historique, sans les attribuer à la page web.
