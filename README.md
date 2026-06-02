# Line Nasya Bilong — Version Pro Complète Fonctionnelle

Site statique complet prêt pour GitHub Pages / Netlify.

## Ouvrir
Double-cliquez `index.html` ou lancez :

```bash
python -m http.server 8000
```

Puis ouvrez `http://localhost:8000`.

## Codes de test

### Invités
- Code : `LINE001` — mot de passe : `1234`
- Code : `LINE002` — mot de passe : `1234`
- Code : `LINE003` — mot de passe : `1234`
- Code ancien compatible : `ALAIN-ASSOMO` — mot de passe : `1234`

### Organisateur
- Code : `Lineorganisation`

### Admin
- Code : `LineAdminVIP2026`
- Ancien accès compatible : `ADMIN` / `admin`

## Fonctionnalités
- Accès par code + mot de passe optionnel
- Réservation avec présence, accompagnants, âge, catégorie automatique, repas, boissons, retard, allergies
- Galerie professionnelle : albums, recherche, masonry, lightbox, ajout photo
- Livre d’or
- Dashboard organisateur/admin
- Export global CSV
- Export traiteur CSV
- Impression des codes
- Copie de tous les codes
- WhatsApp par invité
- Agenda `.ics`
- Responsive mobile/tablette/desktop

## Photos de Line
Remplacez les SVG dans `assets/img/` par vos vraies images en gardant les mêmes noms :

- `line-hero.svg` ou mieux `line-hero.jpg` puis modifier le CSS si besoin
- `gallery-1.svg` à `gallery-8.svg`
- `og-cover.svg`

Pour des centaines de photos, la version statique sert de test. La vraie version production devra utiliser Hostinger/MySQL + stockage fichiers.


## Version simplifiée
Cette version retire le Livre d’or public et la page Photos/Galerie publique. Le menu final contient : Accueil, Programme, Réservation et Organisateur.
