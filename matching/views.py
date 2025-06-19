from django.http import JsonResponse
from .models import Trajet
from core.models import OffreCovoiturage
from .utils import trouver_meilleure_correspondance
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import json


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

@csrf_exempt
@require_http_methods(["POST"])
def api_rechercher_trajets(request):
    """Retourne les trajets conducteurs correspondant aux critères du passager"""
    try:
        data = json.loads(request.body.decode('utf-8'))
        depart = data.get('depart', '').strip()
        arrivee = data.get('arrivee', '').strip()
        heure = data.get('heure', '').strip()

        if not depart:
            return JsonResponse({'success': False, 'error': 'Point de départ manquant'}, status=400)

        # Récupérer les offres de covoiturage actives
        from datetime import date
        offres = OffreCovoiturage.objects.filter(
            active=True,
            places_disponibles__gt=0,
            date_depart__gte=date.today()
        )
        
        # Filtrer par point de départ
        if depart:
            offres = offres.filter(point_depart__icontains=depart)
            
        # Filtrer par point d'arrivée
        if arrivee:
            offres = offres.filter(point_arrivee__icontains=arrivee)

        # Optionnel : filtrage heure proche (±1h)
        if heure:
            from datetime import datetime, timedelta
            try:
                h_ref = datetime.strptime(heure, '%H:%M').time()
                delta = timedelta(hours=1)
                offres_filtrees = []
                for offre in offres:
                    diff = abs(datetime.combine(date.today(), offre.heure_depart) - datetime.combine(date.today(), h_ref))
                    if diff <= delta:
                        offres_filtrees.append(offre)
                offres = offres_filtrees
            except ValueError:
                pass

        # Formater la réponse
        resultat = []
        for offre in offres:
            resultat.append({
                'conducteur_id': offre.conducteur.id,
                'conducteur': f"{offre.conducteur.prenom} {offre.conducteur.nom}",
                'Départ': offre.point_depart,
                'Arrivée': offre.point_arrivee,
                'Heure de départ': offre.heure_depart.strftime('%H:%M'),
                'Places disponibles': offre.places_disponibles,
                'Prix': str(offre.prix),
                'Description': offre.description,
                'lat_depart': offre.lat_depart,
                'lon_depart': offre.lon_depart,
                'lat_arrivee': offre.lat_arrivee,
                'lon_arrivee': offre.lon_arrivee
            })

        return JsonResponse({'success': True, 'matchs': resultat})

    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)