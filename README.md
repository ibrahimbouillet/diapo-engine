# La drépanocytose

Diaporama de SVT de troisième, développé en **HTML, CSS et JavaScript**.

L'étape actuelle reste volontairement simple : le grand logo apparaît seul, reste visible pendant au moins une seconde et jusqu'à la fin de la préparation, puis disparaît par un fondu de 320 ms vers une page noire vide.

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
styles.css          Logo, apparence et fondu
app.js              Démarrage et passage au noir
preparation.js      Préparation et conditions d'ouverture
presentation.json   Métadonnées du diaporama
assets/             Logo, favicon et sources Blender
docs/               Reprise et scénario
scripts/            Serveur local
tests/              Tests du chargement
~~~

- [Reprendre le travail](docs/REPRISE.md)
- [Scénario de l'exposé : 12 minutes puis les questions](docs/SCENARIO.md)

Le projet se concentre maintenant sur ce diaporama. Le passage en Rust et le moteur général viendront plus tard, à partir de sa structure.
