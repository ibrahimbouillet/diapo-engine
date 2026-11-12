# Feuille de route

Les deux objectifs du dépôt évoluent ensemble : réaliser l'exposé La drépanocytose et construire progressivement les mécanismes réutilisables de Diapo Engine.

## Base conservée

- Scénario de huit chapitres pour douze minutes d'exposé, puis les questions.
- Noyau TypeScript : contrat, validation, navigation et plans de transition.
- Logo Blender approuvé et ressources transparentes.
- Chargement biologique, préparation réelle et nettoyage des animations.

Les anciennes étapes Electron restent dans l'historique Git et la validation par version ; elles ne sont plus la base de développement active.

## Étape actuelle : page web 0.3.0

- Développer l'affichage en HTML, CSS et JavaScript dans le navigateur.
- Retirer les composants et dépendances Electron ainsi que la construction d'exécutables.
- Conserver le titre La drépanocytose et le logo comme favicon.
- Afficher le flux sanguin et « Chargement… », puis le noir après le minimum visible et la préparation réussie.
- Servir les fichiers localement en HTTP et produire une construction statique dans `dist/`.
- Vérifier le comportement et les ressources dans un navigateur.
- Actualiser la documentation de reprise ; ne pas ajouter Rust à cette étape.

Le fond noir reste un témoin temporaire, pas la direction artistique finale de toutes les pages.

## Première scène de l'exposé

- Définir la scène, ses informations projetées et ses points d'arrêt oral.
- Choisir un rendu 3D adapté au navigateur.
- Préparer réellement les modèles, textures et premier affichage avant ouverture.
- Montrer la circulation du sang, puis isoler une cellule.
- Conserver cette cellule pendant la transition vers l'explication.
- Vérifier le retour en arrière et les interruptions de transition.

Le chargement actuel prépare seulement ses ressources 2D et les polices. Il ne remplace pas cette scène. Les objectifs de cadence 60/30 images par seconde et le budget mémoire devront être vérifiés sur le navigateur du collège sous Windows 10.

## Exposé complet

- Relire les formulations scientifiques et préparer les textes projetés.
- Produire et vérifier les modèles et illustrations utiles.
- Mettre en scène les huit chapitres progressivement.
- Ajouter les sons et vidéos utiles à l'explication.
- Répéter l'oral pour ajuster le rythme aux douze minutes prévues.
- Tester la présentation sur la machine du collège et définir sa méthode de diffusion.

## Moteur réutilisable

- Relier le noyau au rendu web sans y introduire de logique médicale.
- Définir la frise temporelle, les mouvements de fond et les règles des médias.
- Vérifier identité des éléments conservés, libération des sortants et restitution des états.
- Ajouter un catalogue de ressources et un budget de préparation progressive.
- Utiliser le même moteur avec un deuxième sujet, puis stabiliser le format et les API.

## Futur outil de création

- Concevoir les outils de composition et d'organisation des scènes.
- Définir l'API de programmation et l'isolation du code des présentations.
- Ajouter la prévisualisation, les vérifications et les modes de distribution.
- Concevoir ultérieurement l'application Windows en Rust envisagée, à partir des besoins et mesures de la version web.
- Rédiger le guide utilisateur lorsque ces fonctions existent.

La consommation des modèles, textures et ressources GPU devra être maîtrisée quelle que soit la technologie native finalement retenue.
