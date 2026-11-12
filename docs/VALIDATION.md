# Première fenêtre — validation 0.1.0

Vérifications du 12 novembre 2026 sur Windows 11 Professionnel x64, version 10.0.26300.

## Exécutable construit

- Fichier : `Diapo-Engine-0.1.0-Windows-x64.exe`.
- Format portable, 111 265 194 octets, moteur Electron 45.3.1 inclus.
- SHA-256 : `ab2e6c80730b2b2946163b4f7d2d62ff772c7025a572064de77112dfb4e65394`.
- Métadonnées : nom Diapo Engine, version 0.1.0.
- Manifeste du programme : `requestedExecutionLevel="asInvoker"`.
- Icône extraite de l'exécutable et inspectée : globule rouge en faucille, distinct de l'icône Electron.

Le fichier a été copié seul dans un nouveau dossier temporaire contenant espaces et caractères accentués. Il a été exécuté avec un nouveau profil applicatif et un `PATH` limité aux répertoires Windows, sans accès à Node ou npm par ce chemin. Le diagnostic de l'application empaquetée a réussi.

## Fenêtre

- Titre et logo présents dans l'en-tête natif Windows ; menu applicatif supprimé.
- Zone de contenu : aucun texte, aucun élément enfant, aucun défilement.
- Capture de la zone de contenu : tous les pixels RGBA valent 255.
- Agrandissement, restauration, réduction et fermeture essayés avec les boutons natifs à l'écran.
- Les commandes de fenêtre et les coins suivent le comportement du système.

L'application charge uniquement son fichier local. Elle refuse les requêtes HTTP, HTTPS et WebSocket. Aucun service distant n'est nécessaire à cette fenêtre.

## Logo

Modèle original créé et rendu dans Blender 5.2.3 LTS. Références photographiques et observations : [notes artistiques](../art/logo/ART_NOTES.md).

- PNG RGBA transparent 1024 × 1024.
- Marges gauche/droite : 110/111 pixels ; haut/bas : 71/71 pixels.
- Centre des limites visibles : (511,5 ; 512).
- Dimension maximale visible : 86,13 % du côté du carré.
- ICO : 16, 24, 32, 48, 64, 128 et 256 pixels.
- Lisibilité inspectée sur fond blanc et sombre : [planche de contrôle](../art/logo/icon-contact-sheet.png).

## Noyau et limites

Le contrôle TypeScript et les huit tests du noyau passent. Le scénario pédagogique conserve ses huit pages et sa durée prévue de 720 secondes, mais il n'est pas affiché par cette première application.

La cible de livraison est Windows 10/11 x64. Le test décrit ici ne remplace pas un essai sur une installation Windows vierge ni sur l'ordinateur du collège. Les politiques d'exécution de l'établissement et le menu Snap propre à ses réglages ne sont pas qualifiés ici.
