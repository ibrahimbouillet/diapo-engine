# Consignes du diaporama

- Commencer par `git status --short --branch` et préserver les changements présents.
- Lire `docs/REPRISE.md`, puis vérifier les fichiers réels avant de modifier le projet.
- Se concentrer sur **La drépanocytose**. Ne pas construire maintenant de moteur général, de noyau séparé, d'application Electron ou de composant Rust.
- Garder la page en HTML/CSS/JavaScript, sans dépendance de navigateur ni CDN à ajouter pour cette étape.
- Le titre et les métadonnées du diaporama ont pour source `presentation.json`.
- Conserver la structure simple : fichiers web à la racine, puis `assets/`, `docs/`, `scripts/` et `tests/`.
- Le chargement nominal montre seulement le grand logo approuvé. Aucun flux de globules, libellé visible ou indicateur supplémentaire n'est demandé.
- Garder le logo visible au moins 1000 ms et attendre la préparation réelle avant le fondu de 320 ms vers le noir.
- Le délai ne prépare pas les ressources à leur place. Ne pas annoncer de modèle, texture ou shader prêt tant que sa préparation n'existe pas réellement.
- Après le fondu, retirer le contenu du chargement et arrêter ses callbacks et animations.
- Préserver le logo approuvé, ses proportions et ses sources Blender dans `assets/source/`. Les sources ne sont pas chargées par la page.
- Intégrer les scènes pédagogiques et la 3D progressivement, selon la demande en cours.
- Préparer d'abord les ressources utiles au début de l'exposé, puis les suivantes progressivement ; ne pas charger tout l'exposé en 4K par défaut.
- Utiliser `npm test` et observer la page servie par `npm run dev` après un changement du chargement ou de l'affichage.
- Vérifier titre/favicon, durée minimale, attente des ressources, fondu, page noire sans défilement et nettoyage.
- La cible du collège est un navigateur sous Windows 10 avec mémoire limitée. Les mesures d'un autre environnement ne le qualifient pas.
- Écrire la documentation en français et distinguer ce qui fonctionne, ce qui reste à faire et ce qui a réellement été vérifié.
