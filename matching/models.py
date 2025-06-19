from django.db import models
from core.models import Utilisateur


class Trajet(models.Model):
    conducteur = models.ForeignKey(Utilisateur, on_delete=models.CASCADE, related_name="trajets_offerts", blank=True, null=True)
    passager = models.ForeignKey(Utilisateur, on_delete= models.CASCADE, related_name= "trajets_demandes", blank=True, null= True)
    pointDeDepart = models.CharField(max_length=255)  # Format "latitude , longitude"
    pointDeArrivee = models.CharField(max_length= 255)
    heureDeDepart = models.TimeField()
    places_disponibles = models.PositiveIntegerField(blank=True, null=True) # section pour les conducteurs uniquement

    def __str__(self):
        return f"{self.pointDeDepart} ==>> {self.pointDeArrivee} à {self.heureDeDepart}"