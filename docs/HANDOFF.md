# Reprendre la version web

Ce document s'adresse à Claude, à une autre IA ou à un développeur qui reprend le dépôt. Lire aussi [AGENTS.md](../AGENTS.md), [PROJECTS.md](PROJECTS.md) et [ARCHITECTURE.md](ARCHITECTURE.md).

## État de reprise : version 0.3.0

Le livrable actuel est une **page web HTML/CSS/JavaScript**, dédiée à La drépanocytose. La version Electron et ses exécutables ne constituent plus la base active. Aucun composant Rust n'est introduit.

Le démarrage conserve le flux de globules et « Chargement… », puis la page noire temporaire. La page s'ouvre seulement après au moins une seconde visible et la préparation réussie. Le mouvement est arrêté et les éléments de chargement sont retirés à l'ouverture. Le titre de l'onglet et la favicon sont propres à l'exposé ; les commandes de fenêtre sont celles du navigateur.

Le scénario pédagogique de huit pages et de 720 secondes n'est pas encore rendu. Le noyau TypeScript est conservé comme contrat et outil de test, mais n'est pas chargé par la page actuelle. Le futur éditeur Diapo Engine reste à construire.

Les résultats de [VALIDATION.md](VALIDATION.md) doivent être lus par version. Les mesures Electron 0.1.0/0.2.0 sont historiques et ne prouvent pas la cadence ou la mémoire du navigateur actuel.

## Cartographie

| Sujet | Point d'entrée |
| --- | --- |
| Métadonnées de l'exposé | `presentations/drepanocytose/metadata.json` |
| Structure et apparence | `apps/web/index.html`, `apps/web/styles.css` |
| Démarrage et étapes visibles | `apps/web/renderer.js` |
| Préparation et condition d'ouverture | `apps/web/preparation.js` |
| Tests du démarrage | `apps/web/tests/` |
| Assemblage statique | `scripts/build-web.mjs` |
| Serveur local | `scripts/serve-web.mjs` |
| Règles du moteur | `packages/core/src/` |
| Scénario | `presentations/drepanocytose/presentation.ts` et `STORYBOARD.md` |
| Logo | `apps/web/assets/` et sources `art/logo/` |

Le build copie les métadonnées sous `dist/presentation.json`. Ne pas remplacer le titre de l'exposé par le nom Diapo Engine.

## Développement local

Depuis la racine, avec Node 24 :

~~~powershell
git status --short --branch
npm ci
npm run dev
~~~

Le serveur local construit la page puis la sert à [http://127.0.0.1:4173](http://127.0.0.1:4173). Suivre l'adresse réellement affichée par le script si sa configuration change. Le mode pris en charge est HTTP ; ne pas promettre le fonctionnement par double-clic d'un fichier HTML.

Pour régénérer le résultat statique :

~~~powershell
npm run build
~~~

Le résultat est `dist/`, ignoré par Git. Les ressources et métadonnées nécessaires doivent y être présentes. Les sources du navigateur restent dans `apps/web/` ; ne pas faire d'une correction manuelle dans `dist/` la seule version d'un changement. Après une modification des sources, reconstruire et recharger la page.

Aucun binaire Electron n'est nécessaire. Aucun service cloud n'est requis pour travailler localement. Node sert à l'auteur pour les outils ; il ne fait pas partie des ressources exécutées par le navigateur d'un visiteur.

## Vérifier l'incrément

~~~powershell
npm run check
npm test
npm run validate
npm run build
~~~

- `check` contrôle les types du noyau et du scénario TypeScript.
- `test` vérifie les règles du noyau et le mécanisme de préparation.
- `validate` contrôle le scénario de la drépanocytose et ses 720 secondes prévues.
- `build` assemble les fichiers web à servir.

Observer la page dans un navigateur : titre, favicon, chargement biologique, libellé, passage au noir, absence de défilement et nettoyage des animations. Vérifier qu'une préparation retardée maintient le chargement et qu'un échec empêche l'ouverture.

Conserver les mesures réellement obtenues dans `docs/VALIDATION.md`, avec le navigateur, le système, les conditions et leurs limites. Les captures pendant l'animation peuvent perturber les mesures courtes. Les mesures RAF ne certifient pas à elles seules les images physiquement présentées.

Pour lire un résumé après le mouvement, ouvrir `http://127.0.0.1:4173/?diagnostics` et consulter le message console `[Diapo startup]`. Il rapporte la durée, la cadence, les tâches préparées et le nettoyage ; aucune capture ne doit accompagner une mesure de référence.

## Ressources et future 3D

Les tâches actuelles sont le décodage du PNG d'introduction et la disponibilité des polices. La page noire ne comporte aucun modèle, texture de scène ou shader. Le minimum visible ne réalise aucune de ces opérations à leur place.

Ajouter les tâches de la première scène dans la liste de `prepareResources` de `renderer.js` quand les ressources et le renderer existent réellement : lecture/décodage, préparation GPU, compilation et rendu masqué si nécessaire. Le mécanisme doit attendre leur réussite avant d'ouvrir la scène.

Le PNG de la faucille est un rendu Blender ; les cellules normales sont des illustrations CSS. Le chargement actuel est une composition 2D, sans moteur 3D temps réel. Le logo approuvé et ses proportions doivent être préservés.

Préparer les ressources utiles au début, puis progressivement les suivantes. Éviter de charger tout l'exposé en textures 4K ou de précalculer toutes ses frames. La cible du collège est un navigateur sous Windows 10 avec mémoire limitée : mesurer ce poste, sans lui attribuer les résultats d'un autre environnement.

## Suite du travail

La scène candidate suivante est la circulation du sang, puis une cellule conservée pendant une transition vers son explication. Le besoin exact dépend de la demande en cours ; la feuille de route n'autorise pas à intégrer tous les chapitres d'un seul coup.

L'intention pour la phase native ultérieure est une application Windows en Rust. Ne pas l'ajouter pendant cette étape web et ne pas déduire une optimisation mémoire du seul langage choisi. Le futur éditeur se construira à partir des mécanismes de lecture vérifiés et d'une deuxième présentation réelle.
