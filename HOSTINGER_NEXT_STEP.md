# Prochaine étape Hostinger/MySQL

La version livrée est statique et fonctionne dans le navigateur avec localStorage.

Pour une vraie production avec 200+ invités et beaucoup de photos :

1. Créer base MySQL sur Hostinger.
2. Créer tables : invites, rsvp, companions, gallery, guestbook.
3. Remplacer localStorage par des appels API PHP.
4. Stocker les photos dans `/uploads/` et garder les chemins en base.
5. Ajouter authentification serveur et sessions PHP.

Structure conseillée :

```text
api/login.php
api/rsvp.php
api/gallery.php
api/guestbook.php
api/admin.php
config/db.php
uploads/
```
