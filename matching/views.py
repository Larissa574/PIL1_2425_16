from django.http import JsonResponse
from .models import Trajet
from .utils import trouver_meilleure_correspondance


def recherche_covoiturage(request):
    passager = request.user # pour les utilisateurs
    meilleure_correspondance = trouver_meilleure_correspondance(passager)
    data = []
    for trajet in meilleure_correspondance:
        data.append({
            "conducteur": trajet.conducteur.username,
            "Départ": trajet.pointDeDepart,
            "Arrivée":trajet.pointDeArrivee,
            "Heure de départ":trajet.heureDeDepart,
            "Nombre de place disponibles":trajet.place_disponibles 
        })
    return JsonResponse ({"matchs": data})