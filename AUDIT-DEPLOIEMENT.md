# Verdict de l'audit

Version corrigée pour GitHub Pages.

## Contrôles effectués
- `index.html` à la racine et `.nojekyll` présents.
- viewport mobile correct.
- JavaScript vérifié syntaxiquement.
- suppression des largeurs bloquantes sur GSM/tablette.
- pages Invité, Organisateur et Administration adaptées de 320 px aux grands écrans.
- tableaux Admin transformés en cartes sous 720 px.
- menu Admin horizontal et tactile sous 992 px.
- formulaire, fenêtres modales, galerie, carte et plan de salle redimensionnables.
- zones tactiles d'au moins 46 px et focus clavier visible.
- bouton de retour en haut ajouté.

## Mise en ligne
Déposer le contenu de ce dossier à la racine du dépôt GitHub Pages, sans conserver d'anciens fichiers CSS/JS. Recharger ensuite avec cache vidé.

## Limite importante
Les confirmations restent dans le navigateur (`localStorage`). Pour un usage réel multi-appareils, connecter le site à une base de données ou à un formulaire centralisé.
