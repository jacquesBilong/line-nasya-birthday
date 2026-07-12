# Line Nasya — V15 Ultimate

Site d'invitation privé niveau studio pour le 1er anniversaire de Line Nasya Bilong.
15 août 2026 · Parochiezaal Ter Krokegem, Asse · Confirmation avant le 31 juillet 2026.

## Architecture
```
index.html
css/  main.css (base)  pages.css (sections V15)  responsive.css (1600/900/390)
js/   animations.js (apparitions au scroll)  app.js (application)
assets/img/  gate-cover.jpg (connexion)  line-hero.jpg  og-cover.jpg
             section-soft.jpg  gallery/g1..g6.jpg
```
Note : l'application reste une SPA (une seule page HTML). C'est volontaire :
l'accès par code, l'identité verrouillée et l'état partagé entre les vues
fonctionnent sans serveur. Les styles et scripts sont séparés par rôle
comme demandé — un éclatement en pages HTML distinctes reste possible plus tard.

## Expérience invité (une page fluide)
Hero (photo, compte à rebours, « Plus que X jours ») → Informations pratiques
(adresse, date, heure, dress code, repas, contact) → Confirmation intégrée
(identité verrouillée, accompagnants + âges + repas par personne, boissons,
allergies, message) → Galerie façon Pinterest → Programme sur fond doux → Footer.
Animations discrètes à l'apparition, respect de prefers-reduced-motion.

## Administration (testée avec 550+ invités)
- Recherche instantanée (nom, prénom, code)
- Filtres : Tous / Confirmés / En attente / Refusés
- Tri par nom A→Z / Z→A, pagination 20 par page
- Tableau de bord : Invités / Présents / Absents / En attente
  + graphiques (réponses, adultes-enfants-bébés, repas, allergies, taux de réponse)
- Onglet Codes (admin) : création, génération de 50 codes, message WhatsApp par invité

## Codes
Invités démo : TOM · BILONG · CECILIA · LINE
Organisateur : Lineorganisation — Admin : LineAdminVIP2026

## Lancer
`python -m http.server 8000` puis ouvrir http://localhost:8000

## Prochaine étape critique
Centraliser les confirmations (Google Sheets / Formspree / MySQL) :
aujourd'hui elles restent dans le navigateur de chaque invité.

## Contact professionnel et crédit

Le contact officiel du créateur du site est : **jacques@bilongdigital.com**  
Conception et développement : **Bilong Digital** — https://bilongdigital.com

## Ajouter ou remplacer des photos

Le guide détaillé se trouve dans `AJOUTER-MES-PHOTOS.txt`.

La méthode la plus simple consiste à remplacer les fichiers `g1.jpg` à `g6.jpg` dans `assets/img/gallery/` en conservant exactement leurs noms. Pour ajouter davantage de photos, ajoute le fichier dans ce dossier puis complète la liste `galleryPhotos` au début de `js/app.js`.

## Version officielle — Le Petit Monde de Line
- Responsive de 320 px aux écrans TV 4K/8K.
- Confirmations envoyées à jacques@bilongdigital.com via FormSubmit (activation unique requise).
- Galerie extensible automatiquement avec photo1.jpg à photo24.jpg.
- CSS final : `css/responsive-tv-final.css`.
