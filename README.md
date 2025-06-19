# IFRI Covoiturage

Application web de covoiturage pour l'Université d'Abomey-Calavi (UAC) développée avec Django.

## 🚀 Fonctionnalités

### 👥 Gestion des utilisateurs
- **Inscription et connexion** sécurisées
- **Profils conducteur/passager** avec changement de rôle dynamique
- **Gestion des photos de profil**
- **Réinitialisation de mot de passe** par email

### 🚗 Covoiturage
- **Publication d'offres** de covoiturage par les conducteurs
- **Recherche de trajets** avec géolocalisation
- **Carte interactive** avec Leaflet.js pour visualiser les trajets
- **Système de matching** intelligent entre conducteurs et passagers

### 💬 Messagerie
- **Chat en temps réel** entre utilisateurs
- **Notifications** de nouveaux messages
- **Filtrage par rôle** (conducteurs/passagers)
- **Historique des conversations**

### 🎨 Interface utilisateur
- **Design moderne** et responsive
- **Navigation intuitive** avec barre latérale
- **Animations fluides** et transitions
- **Optimisé mobile** pour tous les écrans

## 🛠️ Technologies utilisées

- **Backend**: Django 5.2.3, Python 3.11+
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Base de données**: SQLite (développement)
- **Cartes**: Leaflet.js + OpenStreetMap
- **Géocodage**: Nominatim API
- **Icons**: Font Awesome 6

## 📋 Prérequis

- Python 3.11 ou supérieur
- pip (gestionnaire de packages Python)
- Git

## ⚡ Installation rapide

1. **Cloner le projet**
```bash
git clone <url-du-repo>
cd PIL1_2425_16
```

2. **Créer un environnement virtuel**
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate     # Windows
```

3. **Installer les dépendances**
```bash
pip install -r requirements.txt
```

4. **Configurer la base de données**
```bash
python manage.py makemigrations
python manage.py migrate
```

5. **Créer un superutilisateur**
```bash
python manage.py createsuperuser
```

6. **Lancer le serveur**
```bash
python manage.py runserver
```

L'application sera accessible à l'adresse : http://127.0.0.1:8000

## 🏗️ Structure du projet

```
PIL1_2425_16/
├── core/                   # Application principale
│   ├── models.py          # Modèles (Utilisateur, OffreCovoiturage)
│   ├── views.py           # Vues et API endpoints
│   ├── forms.py           # Formulaires Django
│   └── matching.py        # Algorithme de matching
├── messagerie/            # Application de chat
│   ├── models.py          # Modèles (Conversation, Message)
│   ├── views.py           # API de messagerie
│   └── consumers.py       # WebSocket handlers
├── matching/              # Application de recherche
│   ├── models.py          # Modèles de matching
│   ├── views.py           # API de recherche
│   └── utils.py           # Utilitaires
├── templates/             # Templates HTML
├── static/               # Fichiers statiques (CSS, JS, images)
└── covoiturage/          # Configuration Django
```

## 🔧 Configuration

### Variables d'environnement

Créer un fichier `.env` (optionnel) :
```env
DJANGO_DEBUG=False
DJANGO_SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Base de données

Pour la production, modifier `settings.py` pour utiliser PostgreSQL :
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'covoiturage_db',
        'USER': 'your_user',
        'PASSWORD': 'your_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

## 🚀 Déploiement

### Avec Gunicorn (recommandé)

1. **Installer Gunicorn**
```bash
pip install gunicorn
```

2. **Lancer l'application**
```bash
gunicorn covoiturage.wsgi:application --bind 0.0.0.0:8000
```

### Avec Docker

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["gunicorn", "covoiturage.wsgi:application", "--bind", "0.0.0.0:8000"]
```

## 🧪 Tests

```bash
python manage.py test
```

## 📱 API Endpoints

### Authentification
- `POST /login/` - Connexion
- `POST /register/` - Inscription
- `POST /logout/` - Déconnexion

### Covoiturage
- `GET /core/api/mes-offres/` - Mes offres
- `POST /core/api/publier-offre/` - Publier une offre
- `POST /matching/api/rechercher-trajets/` - Rechercher des trajets

### Messagerie
- `GET /messagerie/api/users/` - Liste des utilisateurs
- `GET /messagerie/api/messages/<user_id>/` - Messages d'une conversation
- `POST /messagerie/api/messages/<user_id>/` - Envoyer un message
- `GET /messagerie/api/unread-count/` - Nombre de messages non lus

## 🎯 Fonctionnalités avancées

### Algorithme de matching
- **Score de compatibilité** basé sur la distance et l'heure
- **Géocodage automatique** des adresses
- **Filtrage intelligent** des résultats

### Système de notifications
- **Badge de notifications** en temps réel
- **Mise en surbrillance** des conversations non lues
- **Son de notification** (optionnel)

### Responsive design
- **Mobile-first** approach
- **Breakpoints** adaptatifs
- **Touch-friendly** sur mobile

## 🛡️ Sécurité

- **CSRF Protection** activée
- **Validation** des formulaires côté serveur
- **Échappement** automatique des templates
- **Hashage sécurisé** des mots de passe
- **Protection** contre les injections SQL

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -am 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

Développé pour l'IFRI (Institut de Formation et de Recherche en Informatique) - UAC

## 🆘 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Contacter l'équipe de développement

---

**Version**: 1.0.0  
**Dernière mise à jour**: Décembre 2024 