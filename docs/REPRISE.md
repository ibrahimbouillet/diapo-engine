# Reprendre le diaporama

## Périmètre actuel — version 0.3.2

Le projet actif est **La drépanocytose**, une page HTML/CSS/JavaScript. Il ne comporte plus de couche Electron, de noyau TypeScript à développer séparément ni de construction d'exécutable.

Le chargement montre seulement le grand logo approuvé, sans texte ou indicateur ajouté. Il reste visible pendant au moins 1000 ms et jusqu'à la préparation réussie des ressources, puis un fondu d'opacité de 320 ms laisse place au titre « La drépanocytose », seul sur fond noir. Le titre provient de `presentation.json`.

Deux scènes unies, verte puis rouge, servent de démonstration de navigation. Elles ne représentent pas les scènes scientifiques finales. Aucun personnage, animation de l'enfant ou modèle 3D n'est encore intégré.

Le scénario scientifique de douze minutes, suivi de trois minutes de questions au maximum, est conservé dans [SCENARIO.md](SCENARIO.md). Il n'est pas encore joué par la page. La direction narrative discutée ensuite suit un enfant fictif, Dieu le veut : vie quotidienne, découverte de la maladie, explications scientifiques, soins et retour à sa vie. Cette intention devra être développée avec un texte oral pour chaque étape ; le scénario existant reste une base de travail à réviser.

## Navigation manuelle

- **F** depuis le titre active le véritable plein écran via l'API du navigateur, puis démarre sur la scène verte après réussite. Si le plein écran est déjà actif, la présentation démarre en le conservant.
- **F** dans une scène bascule le plein écran sans redémarrer ni changer de scène. **Échap** laisse le navigateur quitter le plein écran sans changer de scène.
- **Flèche droite** avance dans les scènes, **flèche gauche** recule. Depuis la verte, reculer revient au titre. Depuis la rouge, avancer conserve la dernière scène ; il n'y a pas de boucle.
- Un **clic gauche** dans une scène avance, sauf dans la bande du bord gauche où il recule. Cette bande occupe 12 % de la largeur de la page et ne dépasse pas 120 px. Le bord droit fait avancer. Le survol seul ne déclenche aucune navigation.
- Le titre attend **F** : les flèches et les clics n'y démarrent pas les scènes. Aucun raccourci **S** n'est prévu.
- Les touches répétées, les raccourcis avec modificateurs et les événements issus de champs éditables ou de contrôles interactifs sont ignorés.

Il n'y a aucun changement de scène chronométré. Les temporisations du chargement et son fondu ne commandent pas la suite du diaporama. Une future animation pourra évoluer dans une scène, mais la scène suivante devra toujours attendre une action de l'orateur. Si le navigateur refuse le plein écran au démarrage, rester sur le titre et afficher un message court permettant de réessayer. La scène verte ne doit pas démarrer silencieusement en fenêtre. Une sortie ou un refus du plein écran dans les scènes conserve leur position.

## Démarrer et vérifier

Depuis la racine, avec Node 24 :

~~~powershell
git status --short --branch
npm run dev
npm test
~~~

Le serveur fournit la page à [http://127.0.0.1:4173](http://127.0.0.1:4173). Il sert directement les fichiers du projet ; il n'y a pas de build ou de dossier de distribution à maintenir. Le double-clic sur le HTML n'est pas le mode pris en charge, car les modules et les métadonnées sont servis en HTTP.

Aucune dépendance de projet n'est nécessaire au serveur ou aux tests. Node sert au développement local ; il n'est pas chargé dans le navigateur d'un visiteur d'une page servie par un hébergement.

Les tests vérifient le chargement et la navigation. Ils ne remplacent pas l'observation du résultat dans le navigateur : titre de l'onglet, favicon, logo, attente, fondu, titre initial, commandes, couleurs des scènes, absence de défilement et nettoyage des éléments animés. Une préparation retardée doit maintenir le chargement ; un échec ne doit pas ouvrir une page incomplète.

Les résultats de vérification doivent correspondre à cette version et préciser le navigateur et le système utilisés. Les anciennes mesures Electron ne décrivent pas la page actuelle.

Validation du 12 novembre 2026 pour la version 0.3.2 : les sept tests automatisés du chargement et de la navigation ainsi que les contrôles de syntaxe passent. Dans le navigateur intégré, le titre seul sur fond noir a été observé ; S, la flèche droite et un clic sur le titre ne démarrent pas les scènes. Le refus du plein écran dans ce navigateur conserve le titre et affiche l'explication prévue.

Après son essai manuel, Ibrahim a confirmé : « J'ai testé, tout fonctionne bien. » Cette confirmation valide l'étape pour poursuivre le projet. Le détail des commandes essayées et l'environnement de cet essai n'ont pas été précisés ; ne pas présenter cette confirmation comme une vérification exhaustive effectuée par l'assistant, ni comme une qualification du PC Windows 10 du collège. Le contrôle de Chrome par l'assistant a été interrompu avant la fin de sa vérification du plein écran.

## Où modifier

| Fichier | Rôle |
| --- | --- |
| `index.html` | Structure du chargement et de la présentation. |
| `styles.css` | Taille du logo, titre, scènes de test, couleurs et fondu. |
| `app.js` | Métadonnées, chargement, événements clavier/souris et API de plein écran. |
| `navigation.js` | État des scènes de test et orchestration des changements manuels. |
| `preparation.js` | Préparation des ressources et conditions d'ouverture. |
| `presentation.json` | Identifiant, titre et sous-titre du diaporama. |
| `assets/logo.png` et `assets/favicon.ico` | Ressources visuelles utilisées par la page. |
| `assets/source/` | Logo Blender et scripts de reproduction ; non chargés dans la page. |
| `scripts/serve.mjs` | Serveur HTTP local. |
| `tests/preparation.test.js` | Tests du chargement. |
| `tests/navigation.test.js` | Tests des commandes et limites de navigation. |

Le déroulement est : **métadonnées → logo prêt et visible → préparation réussie + minimum visible → fondu → titre → F et plein écran accepté → vert → action suivante → rouge**. Le navigateur fournit ses propres commandes de fenêtre et son plein écran.

## Préparer la future 3D

Le chargement doit attendre les vraies ressources nécessaires avant d'ouvrir une scène. Aujourd'hui, le logo et les ressources de démarrage sont les seuls éléments visuels à préparer ; les deux aplats de couleur ne chargent aucune scène 3D.

Lorsqu'une scène sera créée, ajouter sa lecture et son décodage, la préparation de ses textures et, si nécessaire, la compilation des matériaux et un premier rendu masqué. Ces opérations devront préparer le renderer et les ressources réellement affichés. Un délai seul ne remplace aucune de ces étapes.

Préparer d'abord le nécessaire au début de l'exposé, puis charger progressivement les scènes suivantes. Les modèles, textures et ressources GPU devront être adaptés à la mémoire limitée du navigateur du collège sous Windows 10. Ne pas charger tout l'exposé en textures 4K ni précalculer toutes les frames par défaut.

## Suite du projet

L'étape suivante dépend de la demande en cours : construire une scène du diaporama, la vérifier puis continuer progressivement. Le moteur général et Rust seront étudiés ensuite, à partir de la structure et des besoins réellement établis dans cet exposé. Aucun travail sur ce moteur n'est demandé maintenant.
