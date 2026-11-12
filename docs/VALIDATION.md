# Validation des versions

## Version 0.2.0 — chargement biologique et préparation

Vérifications du 12 novembre 2026 sur Windows 11 Professionnel x64, version 10.0.26300. La cible du collège est Windows 10 x64 ; elle n'a pas encore été testée directement.

### Exécutable et comportement

- Livrable : `release/0.2.0/Drepanocytose-0.2.0-Windows-x64.exe`.
- Taille : 111 193 725 octets ; Electron 45.3.1 embarqué.
- SHA-256 : `32ed5fd0112d0fb40483d15f4efd3a6e5ebe6ee5568cc14b656011b429cd2ddb`.
- Identité dédiée : La drépanocytose, version 0.2.0.
- Observation de l'exécutable à l'écran : titre La drépanocytose et icône dans l'en-tête natif clair, contenu principal noir.
- Copie du seul `.exe` dans un dossier temporaire avec espaces et caractères accentués : diagnostic réussi avec un nouveau profil et un `PATH` limité aux répertoires Windows.
- Chargement : quatre globules normaux CSS et une cellule en faucille PNG, avec le texte « Chargement… ».
- Ouverture après le minimum visible de 1000 ms **et** la préparation réussie. Tâches réelles actuelles : `intro-images` et `fonts` ; aucun modèle 3D n'est encore chargé pour la page noire.
- État final : contenu vide, tous les pixels RGBA de la zone web valent (0, 0, 0, 255), aucun défilement, zéro cellule et zéro animation active restantes.

### Cadence observée

Le diagnostic de développement après intégration de la barrière de préparation a enregistré 60,07 appels RAF/s, un intervalle au 95e percentile de 16,8 ms et un chargement visible de 1015,3 ms.

Sur le portable construit, un premier test instrumenté a enregistré 30,54 appels RAF/s avec un intervalle maximal de 499,5 ms. Un second lancement a enregistré 60,06 appels RAF/s, un intervalle maximal de 17,4 ms et 1013,7 ms de chargement. Le premier écart n'est pas effacé des résultats ; la fenêtre, l'ordonnancement et l'instrumentation peuvent affecter une mesure aussi courte.

Un contrôle supplémentaire du même `.exe`, lancé sans diagnostic mémoire ni capture pendant le mouvement, a lu les mesures après la fin du chargement via une connexion de débogage locale temporaire : 60 frames échantillonnées, 60,06 appels RAF/s, p95 et maximum de 16,8 ms, durée visible de 1011,8 ms. La connexion a été fermée avec l'application à la fin du contrôle ; elle n'est pas activée par le lancement normal.

Ces chiffres décrivent les callbacks `requestAnimationFrame`, pas une certification de chaque image physiquement affichée. La capture PNG du chargement est réservée au contrôle visuel (`--capture-loading`) ; elle perturbe la cadence et n'est pas utilisée comme référence de performance.

### Mémoire et limites

Le test du portable copié seul a observé quatre processus Electron. Au chargement : somme des ensembles de travail 294,2 Mio, mémoire privée engagée 100,9 Mio. Après passage au noir : 312,5 Mio et 116,5 Mio. Le second lancement a observé 303,9 Mio et 112,7 Mio après le passage au noir.

La somme des ensembles de travail peut compter plusieurs fois des pages partagées ; elle ne représente pas une occupation physique exclusive. Ces mesures ne garantissent pas une consommation identique sur le PC du collège. Après le chargement, la boucle de mesure est arrêtée et le contenu animé est retiré du document. Chromium peut néanmoins conserver des caches.

La préparation future des modèles, textures, shaders et du premier rendu devra être mesurée séparément. La stratégie de chargement progressif et le budget des ressources 3D restent à implémenter avec les scènes concernées.

### Contrôles du code

Le contrôle TypeScript, la validation du scénario de 720 secondes et les 11 tests passent : huit tests du noyau, plus trois vérifications de la barrière de préparation. Ces dernières couvrent les deux ordres de résolution des conditions et le refus d'ouvrir après un échec de ressource. Les fichiers JavaScript et CJS passent le contrôle de syntaxe.

## Version 0.1.0 — étape précédente, fenêtre blanche

Vérifications du 12 novembre 2026 sur Windows 11 Professionnel x64, version 10.0.26300.

### Exécutable construit

- Fichier : `Diapo-Engine-0.1.0-Windows-x64.exe`.
- Format portable, 111 265 194 octets, moteur Electron 45.3.1 inclus.
- SHA-256 : `ab2e6c80730b2b2946163b4f7d2d62ff772c7025a572064de77112dfb4e65394`.
- Métadonnées : nom Diapo Engine, version 0.1.0.
- Manifeste du programme : `requestedExecutionLevel="asInvoker"`.
- Icône extraite de l'exécutable et inspectée : globule rouge en faucille, distinct de l'icône Electron.

Le fichier a été copié seul dans un nouveau dossier temporaire contenant espaces et caractères accentués. Il a été exécuté avec un nouveau profil applicatif et un `PATH` limité aux répertoires Windows, sans accès à Node ou npm par ce chemin. Le diagnostic de l'application empaquetée a réussi.

### Fenêtre

- Titre et logo présents dans l'en-tête natif Windows ; menu applicatif supprimé.
- Zone de contenu : aucun texte, aucun élément enfant, aucun défilement.
- Capture de la zone de contenu : tous les pixels RGBA valent 255.
- Agrandissement, restauration, réduction et fermeture essayés avec les boutons natifs à l'écran.
- Les commandes de fenêtre et les coins suivent le comportement du système.

L'application charge uniquement son fichier local. Elle refuse les requêtes HTTP, HTTPS et WebSocket. Aucun service distant n'est nécessaire à cette fenêtre.

### Logo

Modèle original créé et rendu dans Blender 5.2.3 LTS. Références photographiques et observations : [notes artistiques](../art/logo/ART_NOTES.md).

- PNG RGBA transparent 1024 × 1024.
- Marges gauche/droite : 110/111 pixels ; haut/bas : 71/71 pixels.
- Centre des limites visibles : (511,5 ; 512).
- Dimension maximale visible : 86,13 % du côté du carré.
- ICO : 16, 24, 32, 48, 64, 128 et 256 pixels.
- Lisibilité inspectée sur fond blanc et sombre : [planche de contrôle](../art/logo/icon-contact-sheet.png).

### Noyau et limites

Le contrôle TypeScript et les huit tests du noyau passent. Le scénario pédagogique conserve ses huit pages et sa durée prévue de 720 secondes, mais il n'est pas affiché par cette première application.

La cible de livraison est Windows 10/11 x64. Le test décrit ici ne remplace pas un essai sur une installation Windows vierge ni sur l'ordinateur du collège. Les politiques d'exécution de l'établissement et le menu Snap propre à ses réglages ne sont pas qualifiés ici.
