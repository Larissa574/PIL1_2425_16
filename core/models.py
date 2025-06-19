from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import secrets


class UtilisateurManager(BaseUserManager):
    def create_user(self, email, telephone, nom, prenom, role, password=None):
        if not email:
            raise ValueError("L'email est requis.")
        if not telephone:
            raise ValueError("Le numéro de téléphone est requis.")
        user = self.model(
            email=self.normalize_email(email),
            telephone=telephone,
            nom=nom,
            prenom=prenom,
            role=role
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, telephone, nom, prenom, password):
        user = self.create_user(
            email=email,
            telephone=telephone,
            nom=nom,
            prenom=prenom,
            role='admin',
            password=password
        )
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user


class Utilisateur(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('conducteur', 'Conducteur'),
        ('passager', 'Passager'),
        ('admin', 'Administrateur'),
    ]

    nom = models.CharField(max_length=150)
    prenom = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    telephone = models.CharField(max_length=15, unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    photo = models.ImageField(upload_to='photos_profil/', null=True, blank=True)
    date_naissance = models.DateField(null=True, blank=True)
    
    # Champs profil conducteur
    depart_habituel = models.CharField(max_length=255, null=True, blank=True, default="Non renseigné")
    horaire_debut = models.TimeField(null=True, blank=True)
    horaire_fin = models.TimeField(null=True, blank=True)
    
    # Champs véhicule
    vehicule_marque = models.CharField(max_length=100, null=True, blank=True, default="Marque de voiture")
    vehicule_modele = models.CharField(max_length=100, null=True, blank=True, default="Modèle de voiture")
    vehicule_couleur = models.CharField(max_length=50, null=True, blank=True, default="Couleur du véhicule")
    vehicule_places = models.PositiveIntegerField(null=True, blank=True, default=4)
    
    # Champs préférences passager
    heure_depart_habituel = models.TimeField(null=True, blank=True)
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    derniere_connexion = models.DateTimeField(null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['telephone', 'nom', 'prenom']

    objects = UtilisateurManager()

    def __str__(self):
        return f"{self.prenom} {self.nom} ({self.role})"

    def get_full_name(self):
        return f"{self.prenom} {self.nom}"

    def get_short_name(self):
        return self.prenom


class PasswordResetCode(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    code = models.CharField(max_length=6)
    creer_le = models.DateTimeField(auto_now_add=True)
    utiliser = models.BooleanField(default=False)
    tentatives = models.PositiveIntegerField(default=0)

    @staticmethod
    def generate_code(user):
        PasswordResetCode.objects.filter(user=user).delete()
        code = secrets.randbelow(1000000)
        code_str = str(code).zfill(6)
        return PasswordResetCode.objects.create(user=user, code=code_str)

    def is_valid(self):
        temps_expiration = self.creer_le + timedelta(minutes=15)
        return timezone.now() < temps_expiration and not self.utiliser

    def __str__(self):
        return f"{self.user.email} - {self.code}"


class OffreCovoiturage(models.Model):
    conducteur = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='offres')
    point_depart = models.CharField(max_length=255)
    point_arrivee = models.CharField(max_length=255)
    date_depart = models.DateField()
    heure_depart = models.TimeField()
    places_disponibles = models.PositiveIntegerField()
    prix = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Coordonnées GPS
    lat_depart = models.FloatField(null=True, blank=True)
    lon_depart = models.FloatField(null=True, blank=True)
    lat_arrivee = models.FloatField(null=True, blank=True)
    lon_arrivee = models.FloatField(null=True, blank=True)

    class Meta:
        ordering = ['-date_depart', '-heure_depart']

    def __str__(self):
        return f"{self.conducteur.get_full_name()} - {self.point_depart} vers {self.point_arrivee}"


class DemandeCovoiturage(models.Model):
    passager = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='demandes')
    point_depart = models.CharField(max_length=255)
    point_arrivee = models.CharField(max_length=255)
    date_souhaitee = models.DateField()
    heure_souhaitee = models.TimeField()
    nombre_places = models.PositiveIntegerField(default=1)
    description = models.TextField(blank=True)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Coordonnées GPS
    lat_depart = models.FloatField(null=True, blank=True)
    lon_depart = models.FloatField(null=True, blank=True)
    lat_arrivee = models.FloatField(null=True, blank=True)
    lon_arrivee = models.FloatField(null=True, blank=True)

    class Meta:
        ordering = ['-date_souhaitee', '-heure_souhaitee']

    def __str__(self):
        return f"{self.passager.get_full_name()} - {self.point_depart} vers {self.point_arrivee}"


class ReservationCovoiturage(models.Model):
    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('confirmee', 'Confirmée'),
        ('annulee', 'Annulée'),
        ('terminee', 'Terminée'),
    ]

    offre = models.ForeignKey(OffreCovoiturage, on_delete=models.CASCADE, related_name='reservations')
    passager = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reservations')
    nombre_places = models.PositiveIntegerField(default=1)
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='en_attente')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['offre', 'passager']

    def __str__(self):
        return f"Réservation de {self.passager.get_full_name()} pour le trajet de {self.offre.conducteur.get_full_name()}"