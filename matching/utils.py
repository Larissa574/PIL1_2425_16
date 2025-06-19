from geopy.distance import geodesic
from datetime import datetime
from .models import Trajet

def calculer_distance(trajet_conducteur, trajet_passager, max_distance=5, max_ecart_temps=30):
    """
    Calcule la distance entre le point de départ du conducteur et le point de départ du passager.
    - max_distance: distance maximale en km pour être considéré comme proche.
    - max_ecart_temps: différence maximale en minutes entre les heures de départ.
    """
    if not trajet_conducteur or not trajet_passager:
        return None

    try:
        # Extraction des coordonnées du point de départ
        coord_conducteur = tuple(map(float, trajet_conducteur.pointDeDepart.split(',')))
        coord_passager = tuple(map(float, trajet_passager.pointDeDepart.split(',')))
        # Calcul de la distance en geographique en kilomètres
        distance = geodesic(coord_conducteur, coord_passager).kilometers
        # Vérification de la compatibilité horaire
        ecart_temps = abs((datetime.combine(datetime.today(), trajet_conducteur.heureDeDepart) - 
                         datetime.combine(datetime.today(), trajet_passager.heureDeDepart)).total_seconds() / 60)
        # calcul d'un score de compatibilité
        if distance<= max_distance and ecart_temps <= max_ecart_temps:
            score = (max_distance - distance) + (max_ecart_temps - ecart_temps)
            return score
        return 0 # Si la distance ou l'écart de temps est trop grand, retourner 0 donc pas de correspondance
    except ValueError:
        return None
    
def trouver_meilleure_correspondance(passager):
    # Trouve le conducteur le plus proche pour un passager donné
    trajets_conducteurs = Trajet.objects.filter(conducteur__isnull=False, places_disponibles__gt=0)
    trajets_passagers = Trajet.objects.filter(passager=passager)

    correspondances = []
    for trajet_passager in trajets_passagers:
        for trajet_conducteur in trajets_conducteurs:
            score = calculer_distance(trajet_conducteur, trajet_passager)
            if score and score > 0:
                correspondances.append({
                    'conducteur': trajet_conducteur.conducteur,
                    'trajet_conducteur': trajet_conducteur,
                    'trajet_passager': trajet_passager,
                    'score': score
                })

    # Trier les correspondances par score décroissant
    correspondances.sort(key=lambda c: c['score'], reverse=True)

    # Retourner la liste ordonnée des trajets conducteurs correspondant
    return [c['trajet_conducteur'] for c in correspondances]
