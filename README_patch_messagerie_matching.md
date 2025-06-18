# Patch Messagerie et Tableau de Bord (Matching)

Ce patch contient tous les changements nécessaires pour implémenter :
- Le système de messagerie en temps réel
- L'algorithme de matching pour le covoiturage  
- Les interfaces utilisateur associées

## Contenu du patch

### Backend
- **Models** : Ajout des modèles `OffreCovoiturage`, `DemandeCovoiturage`, `ReservationCovoiturage`
- **Views** : Nouvelles vues pour la gestion du covoiturage et le matching
- **Matching** : Algorithme de matching basé sur la géolocalisation et les horaires
- **Messagerie** : Application complète pour la messagerie WebSocket

### Frontend  
- **JavaScript** : Mise à jour de `page_principale.js` avec les fonctionnalités de covoiturage
- **CSS** : Styles pour les nouvelles interfaces
- **Templates** : Mise à jour du template principal

### Configuration
- Configuration de Redis pour les WebSockets
- Configuration des channels Django
- Ajout des dépendances nécessaires

## Instructions d'utilisation

1. **Placer le patch** : Mettez le fichier `messagerie_matching_patch.patch` à la racine de votre projet

2. **Vérifier le patch** (optionnel mais recommandé) :
   ```bash
   git apply --check messagerie_matching_patch.patch
   ```

3. **Appliquer le patch** :
   ```bash
   git apply messagerie_matching_patch.patch
   ```

4. **Installer les dépendances** :
   ```bash
   pip install -r requirements.txt
   ```

5. **Appliquer les migrations** :
   ```bash
   python manage.py migrate
   ```

6. **Installer et démarrer Redis** (nécessaire pour la messagerie) :
   - Télécharger Redis depuis : https://github.com/microsoftarchive/redis/releases
   - Extraire et lancer `redis-server.exe`

7. **Committer les changements** :
   ```bash
   git add .
   git commit -m "Ajout système de messagerie et algorithme de matching"
   ```

## Fonctionnalités implémentées

### Pour les conducteurs
- Publier des offres de covoiturage
- Gérer les demandes de réservation
- Voir l'historique des trajets

### Pour les passagers  
- Rechercher des trajets avec matching intelligent
- Réserver des places
- Messagerie avec les conducteurs

### Algorithme de matching
- Matching par proximité géographique
- Matching par horaires compatibles
- Score de pertinence pour classer les résultats

## Problèmes potentiels

1. **Conflits de merge** : Si vous avez déjà modifié certains fichiers, vous devrez résoudre les conflits manuellement

2. **Base de données** : Assurez-vous que les paramètres de base de données dans `settings.py` correspondent à votre configuration locale

3. **Redis** : La messagerie nécessite Redis. Sans Redis, l'application fonctionnera mais sans la messagerie temps réel

## Support

En cas de problème avec l'application du patch, contactez la personne qui vous l'a envoyé avec le message d'erreur complet. 