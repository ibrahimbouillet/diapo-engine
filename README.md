# La drépanocytose

Diaporama de SVT de troisième, développé en **HTML, CSS et JavaScript**.

La version 0.3.2 prépare la navigation manuelle : le grand logo apparaît seul, reste visible pendant au moins une seconde et jusqu'à la fin de la préparation, puis disparaît par un fondu de 320 ms. Le titre « La drépanocytose » apparaît ensuite seul sur fond noir. Deux scènes de test, verte puis rouge, permettent de vérifier les commandes avant de construire les animations du récit.

## Commandes de présentation

| Commande | Action |
| --- | --- |
| **F** sur le titre | Passer en plein écran et démarrer sur la scène verte. |
| **F** dans les scènes | Entrer ou sortir du plein écran sans changer de scène. |
| **Échap** en plein écran | Sortir du plein écran en gardant sa position. |
| **Flèche droite** dans les scènes | Avancer vers la scène rouge. |
| **Flèche gauche** dans les scènes | Reculer ; depuis la verte, revenir au titre. |
| **Clic gauche** dans les scènes | Avancer, sauf près du bord gauche où il fait reculer. |

Le bord gauche occupe 12 % de la largeur de la page, avec un maximum de 120 px. Le bord droit fait avancer. Le survol ne change rien, la dernière scène ne boucle pas et aucun délai ne fait avancer le diaporama. Le titre attend **F** : les flèches et les clics n'y démarrent pas la présentation. Aucun raccourci **S** n'est prévu. Les raccourcis ne capturent pas les touches maintenues, les combinaisons avec modificateur ou la saisie dans un contrôle interactif.

Le plein écran dépend de la prise en charge et de l'autorisation du navigateur. Si son activation échoue, le titre reste affiché et un message court explique comment réessayer ; la scène verte ne démarre pas silencieusement en fenêtre. Aucun personnage ni modèle 3D n'est encore affiché.

## Ouvrir la page

Avec Node 24 pour le serveur local et les tests :

~~~powershell
npm run dev
npm test
~~~

La page est accessible à [http://127.0.0.1:4173](http://127.0.0.1:4173). Aucune dépendance de projet n'est à installer. Le navigateur suffit pour consulter une version servie en HTTP ; le double-clic HTML n'est pas le mode pris en charge.

## Fichiers utiles

~~~text
index.html          Structure de la page
styles.css          Logo, titre, scènes de test et fondu
app.js              Démarrage et préparation de la présentation
navigation.js       Commandes et navigation manuelle
preparation.js      Préparation et conditions d'ouverture
presentation.json   Métadonnées du diaporama
assets/             Logo, favicon et sources Blender
docs/               Reprise et scénario
scripts/            Serveur local
tests/              Tests du chargement et de la navigation
~~~

- [Reprendre le travail](docs/REPRISE.md)
- [Scénario de l'exposé : 12 minutes puis les questions](docs/SCENARIO.md)

Le projet se concentre maintenant sur ce diaporama. Le passage en Rust et le moteur général viendront plus tard, à partir de sa structure.
