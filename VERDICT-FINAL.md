# Verdict final — Le Petit Monde de Line

## Prêt à déployer
Le site est compatible GitHub Pages et contient `.nojekyll`. Les pages Invité, Organisation et Administration utilisent une mise en page responsive de 320 px aux grands écrans 4K/8K.

## Plan de salle
- Création, modification et suppression de tables par l'Administrateur et l'Organisateur.
- Placement des familles confirmées depuis la vue Liste.
- Déplacement des tables à la souris ou au doigt dans la vue Plan.
- Un simple clic/toucher sur une table ouvre sa modification.
- Placement automatique, remise à zéro et export JSON du plan.

## Volume de données
- Recherche, filtres, tri et pagination limitent l'affichage à 20 invités par page.
- Les tableaux deviennent des cartes sur téléphone.
- Le code peut afficher plusieurs centaines d'invités sans allonger une seule page.

## Limite importante du site statique
GitHub Pages ne fournit pas de base de données. Les données Admin et le plan de salle sont stockés dans le navigateur utilisé. Les confirmations sont également envoyées par email via FormSubmit, mais elles ne synchronisent pas automatiquement le tableau de bord entre plusieurs appareils.

Pour éviter toute perte :
1. Activer l'adresse FormSubmit lors du premier email reçu.
2. Utiliser régulièrement « Sauvegarder toutes les données » dans l'espace Admin.
3. Conserver le fichier JSON téléchargé.
4. Pour une synchronisation multi-appareils en temps réel, connecter ultérieurement Firebase, Supabase ou une API PHP/MySQL.
