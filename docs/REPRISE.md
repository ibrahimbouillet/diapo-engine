# Reprendre le diaporama

## Périmètre actuel — version 0.3.1

Le projet actif est **La drépanocytose**, une page HTML/CSS/JavaScript. Il ne comporte plus de couche Electron, de noyau TypeScript à développer séparément ni de construction d'exécutable.

Le chargement montre seulement le grand logo approuvé, sans texte ou indicateur ajouté. Il reste visible pendant au moins 1000 ms et jusqu'à la préparation réussie des ressources, puis un fondu d'opacité de 320 ms laisse place à une page entièrement noire et vide. Le fond noir est un état de contrôle temporaire.

Le scénario scientifique de douze minutes, suivi de trois minutes de questions au maximum, est conservé dans [SCENARIO.md](SCENARIO.md). Il n'est pas encore joué par la page.

## Démarrer et vérifier

Depuis la racine, avec Node 24 :

~~~powershell
git status --short --branch
npm run dev
npm test
~~~

Le serveur fournit la page à [http://127.0.0.1:4173](http://127.0.0.1:4173). Il sert directement les fichiers du projet ; il n'y a pas de build ou de dossier de distribution à maintenir. Le double-clic sur le HTML n'est pas le mode pris en charge, car les modules et les métadonnées sont servis en HTTP.

Aucune dépendance de projet n'est nécessaire au serveur ou aux tests. Node sert au développement local ; il n'est pas chargé dans le navigateur d'un visiteur d'une page servie par un hébergement.

Les tests vérifient le mécanisme du chargement. Ils ne remplacent pas l'observation du résultat dans le navigateur : titre de l'onglet, favicon, logo, attente, fondu, noir final, absence de défilement et nettoyage des éléments animés. Une préparation retardée doit maintenir le chargement ; un échec ne doit pas ouvrir une page incomplète.

Les résultats de vérification doivent correspondre à cette version et préciser le navigateur et le système utilisés. Les anciennes mesures Electron ne décrivent pas la page actuelle.

Contrôle du 12 novembre 2026 dans le navigateur intégré : maintien du logo 1010 ms, fondu 320 ms, puis page noire vide. Le profilage optionnel `?diagnostics` a observé environ 30 appels RAF/s pendant ce court fondu, sans animation ni logo restant après sa fin. Les quatre tests du chargement et les contrôles de syntaxe passent. Ces mesures locales ne qualifient pas encore l'ordinateur Windows 10 du collège.

## Où modifier

| Fichier | Rôle |
| --- | --- |
| `index.html` | Structure du chargement et de la présentation. |
| `styles.css` | Taille du logo, disposition, couleurs et fondu. |
| `app.js` | Métadonnées, visibilité et passage entre les états. |
| `preparation.js` | Préparation des ressources et conditions d'ouverture. |
| `presentation.json` | Identifiant, titre et sous-titre du diaporama. |
| `assets/logo.png` et `assets/favicon.ico` | Ressources visuelles utilisées par la page. |
| `assets/source/` | Logo Blender et scripts de reproduction ; non chargés dans la page. |
| `scripts/serve.mjs` | Serveur HTTP local. |
| `tests/preparation.test.js` | Tests du chargement. |

Le déroulement est : **métadonnées → logo prêt et visible → préparation réussie + minimum visible → fondu → page noire**. Le titre provient de `presentation.json` ; le navigateur fournit ses propres commandes de fenêtre.

## Préparer la future 3D

Le chargement doit attendre les vraies ressources nécessaires avant d'ouvrir une scène. Aujourd'hui, le logo et les ressources de démarrage sont les seuls éléments visuels à préparer ; aucune scène 3D n'est encore présente dans la page noire.

Lorsqu'une scène sera créée, ajouter sa lecture et son décodage, la préparation de ses textures et, si nécessaire, la compilation des matériaux et un premier rendu masqué. Ces opérations devront préparer le renderer et les ressources réellement affichés. Un délai seul ne remplace aucune de ces étapes.

Préparer d'abord le nécessaire au début de l'exposé, puis charger progressivement les scènes suivantes. Les modèles, textures et ressources GPU devront être adaptés à la mémoire limitée du navigateur du collège sous Windows 10. Ne pas charger tout l'exposé en textures 4K ni précalculer toutes les frames par défaut.

## Suite du projet

L'étape suivante dépend de la demande en cours : construire une scène du diaporama, la vérifier puis continuer progressivement. Le moteur général et Rust seront étudiés ensuite, à partir de la structure et des besoins réellement établis dans cet exposé. Aucun travail sur ce moteur n'est demandé maintenant.
