# Consignes de travail

## Lire avant de modifier

- Commencer par `git status --short --branch` et préserver les changements présents.
- Lire `docs/HANDOFF.md` pour l'état de reprise, `docs/PROJECTS.md` pour les deux objectifs et `docs/ARCHITECTURE.md` pour les responsabilités des composants.
- Vérifier les fichiers réels : la documentation et les anciens comptes rendus ne prouvent pas le comportement actuel.

## Périmètre et conventions

- Le dépôt `diapo-engine` contient pour l'instant une application dédiée à **La drépanocytose** et un noyau réutilisable. Le futur éditeur Windows Diapo Engine n'est pas encore construit.
- Le titre visible de la présentation provient de `presentations/drepanocytose/metadata.json`, pas du nom du moteur.
- Garder `packages/core/` indépendant d'Electron, du rendu graphique et du contenu médical.
- Conserver l'en-tête et les commandes natifs Windows. Les boutons minimiser, maximiser/restaurer et fermer ne sont pas des boutons HTML.
- Respecter le contenu minimal de l'étape en cours. Le scénario pédagogique, la 3D et les médias s'intègrent par incréments explicites.
- Le chargement utilise un petit flux sanguin animé, avec illustrations CSS et PNG Blender. Le décrire comme une composition 2D avec prérendu 3D, sans le confondre avec le futur rendu 3D temps réel.
- La mention « Chargement… » rend sa fonction explicite. Après ce chargement, arrêter les callbacks, retirer ses enfants du document et garder zéro animation active sur la page noire.
- Ouvrir la page uniquement après la durée visible minimale et la préparation réelle de ses ressources. Le délai ne remplace pas le décodage, la préparation GPU, la compilation des shaders ou un rendu de chauffe. Ne pas annoncer de ressource 3D prête tant qu'elle n'existe pas dans le pipeline.
- Préserver le logo Blender approuvé, ses proportions, ses sources et ses déclinaisons transparentes lors des modifications de la fenêtre.
- Écrire la documentation de projet en français. Distinguer les fonctionnalités implémentées, les objectifs et les vérifications restantes.

## Vérifications

- Exécuter les contrôles adaptés à la modification : `npm run check`, `npm test`, `npm run validate`, puis `npm run check:desktop` pour le démarrage ou l'affichage.
- Une modification de l'application livrée demande une nouvelle construction portable et un test de cet exécutable, pas seulement du mode développement.
- Le contrôle de la zone web ne valide pas l'en-tête natif ; compléter les changements de fenêtre par une observation à l'écran.
- Le chargement visible a un minimum d'une seconde et peut durer plus longtemps si les ressources ne sont pas prêtes. Ce minimum est distinct du temps de décompression et de lancement du `.exe`.
- La fluidité visée est 60 images par seconde, avec 30 comme seuil de repli. Rapporter les intervalles de frames observés et les limites du poste testé ; une animation CSS ne prouve pas la cadence à elle seule.
- Mesurer la cadence sans capture PNG pendant le mouvement ; réserver `--capture-loading` au contrôle visuel. La cible du collège est Windows 10 avec une mémoire limitée : vérifier les métriques de l'ensemble des processus, puis la machine réelle.
- Préparer d'abord les ressources nécessaires à la première scène, puis progressivement les suivantes. Adapter les textures et libérer les ressources inutiles ; ne pas charger tout l'exposé en 4K ou précalculer toutes les frames par défaut.
- Ne pas présenter le noyau comme un moteur graphique, le scénario comme un exposé terminé, ni un test local comme une qualification sur l'ordinateur du collège.
- Mettre à jour les documents concernés avec le comportement réellement constaté et les limites restantes.
