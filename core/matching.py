import math
import requests
from datetime import datetime, timedelta
from django.db.models import Q
import re


def normalize_text(text):
    """Normalise le texte pour la comparaison (minuscules, sans accents, etc.)"""
    if not text:
        return ""
    # Convertir en minuscules et supprimer les espaces en trop
    text = text.lower().strip()
    # Remplacer les caractères accentués
    replacements = {
        'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
        'à': 'a', 'â': 'a', 'ä': 'a',
        'ô': 'o', 'ö': 'o',
        'ù': 'u', 'û': 'u', 'ü': 'u',
        'ç': 'c',
        'î': 'i', 'ï': 'i'
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text


def text_similarity(text1, text2):
    """Vérifie si text1 est contenu dans text2 ou vice versa (insensible à la casse)"""
    text1_norm = normalize_text(text1)
    text2_norm = normalize_text(text2)
    
    # Vérifier si l'un contient l'autre
    return text1_norm in text2_norm or text2_norm in text1_norm


def time_difference_minutes(time1, time2):
    """Calcule la différence en minutes entre deux objets time"""
    # Créer des datetime pour aujourd'hui avec ces heures
    today = datetime.today().date()
    datetime1 = datetime.combine(today, time1)
    datetime2 = datetime.combine(today, time2)
    
    # Calculer la différence absolue en minutes
    diff = abs((datetime1 - datetime2).total_seconds() / 60)
    return diff


def haversine_distance(lat1, lon1, lat2, lon2):
    """Calcule la distance en kilomètres entre deux points GPS"""
    if not all([lat1, lon1, lat2, lon2]):
        return float('inf')
    
    # Rayon de la Terre en kilomètres
    R = 6371.0
    
    # Convertir en radians
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    # Différences
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    # Formule de Haversine
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    distance = R * c
    
    return distance


def geocode_address(address):
    """
    Convertit une adresse en coordonnées GPS en utilisant Nominatim
    Retourne (latitude, longitude) ou (None, None) si échec
    """
    if not address:
        return None, None
    
    try:
        # Ajouter "Benin" pour améliorer la précision
        full_address = f"{address}, Benin"
        
        # URL de l'API Nominatim
        url = "https://nominatim.openstreetmap.org/search"
        params = {
            'q': full_address,
            'format': 'json',
            'limit': 1,
            'countrycodes': 'bj'  # Limiter au Bénin
        }
        headers = {
            'User-Agent': 'IFRI_Covoiturage/1.0'  # Important pour Nominatim
        }
        
        response = requests.get(url, params=params, headers=headers, timeout=5)
        response.raise_for_status()
        
        data = response.json()
        if data and len(data) > 0:
            lat = float(data[0]['lat'])
            lon = float(data[0]['lon'])
            return lat, lon
    except Exception as e:return None, None


def match_offres(demande, exclude_user=None):
    """
    Trouve les offres de covoiturage correspondant à une demande
    
    Args:
        demande: Instance de DemandeCovoiturage
        exclude_user: Utilisateur dont les offres doivent être exclues (généralement le demandeur)
    
    Returns:
        QuerySet d'OffreCovoiturage triées par pertinence
    """
    from .models import OffreCovoiturage
    
    # Récupérer toutes les offres actives pour la même date
    offres_query = OffreCovoiturage.objects.filter(
        active=True,
        date_depart=demande.date_souhaitee,
        places_disponibles__gt=0
    ).select_related('conducteur')
    
    # Exclure les offres de l'utilisateur spécifié (pour éviter qu'un conducteur se voie lui-même)
    if exclude_user:
        offres_query = offres_query.exclude(conducteur=exclude_user)
    
    offres = offres_query
    
    # Liste pour stocker les offres avec leur score
    offres_scorees = []
    
    for offre in offres:
        score = 0
        match_info = {
            'offre': offre,
            'score': 0,
            'distance_depart': None,
            'distance_arrivee': None,
            'diff_temps': None,
            'match_depart': False,
            'match_arrivee': False,
            'match_temps': False
        }
        
        # 1. Vérifier la correspondance des lieux de départ (texte inclusif)
        if text_similarity(demande.point_depart, offre.point_depart):
            match_info['match_depart'] = True
            score += 40  # Points importants pour le départ
        
        # 2. Vérifier la correspondance des lieux d'arrivée
        if text_similarity(demande.point_arrivee, offre.point_arrivee):
            match_info['match_arrivee'] = True
            score += 30  # Points pour l'arrivée
        
        # 3. Vérifier la différence d'heure (≤ 30 minutes)
        diff_minutes = time_difference_minutes(demande.heure_souhaitee, offre.heure_depart)
        match_info['diff_temps'] = diff_minutes
        
        if diff_minutes <= 30:
            match_info['match_temps'] = True
            # Plus c'est proche, plus le score est élevé
            score += 30 * (1 - diff_minutes / 30)
        
        # 4. Vérifier la distance géographique si les coordonnées sont disponibles
        if all([demande.lat_depart, demande.lon_depart, offre.lat_depart, offre.lon_depart]):
            distance_depart = haversine_distance(
                demande.lat_depart, demande.lon_depart,
                offre.lat_depart, offre.lon_depart
            )
            match_info['distance_depart'] = distance_depart
            
            # Bonus de score pour la proximité (max 10 points)
            if distance_depart <= 5:  # 5 km
                score += 10 * (1 - distance_depart / 5)
        
        if all([demande.lat_arrivee, demande.lon_arrivee, offre.lat_arrivee, offre.lon_arrivee]):
            distance_arrivee = haversine_distance(
                demande.lat_arrivee, demande.lon_arrivee,
                offre.lat_arrivee, offre.lon_arrivee
            )
            match_info['distance_arrivee'] = distance_arrivee
            
            # Bonus de score pour la proximité (max 10 points)
            if distance_arrivee <= 5:  # 5 km
                score += 10 * (1 - distance_arrivee / 5)
        
        # Mettre à jour le score final
        match_info['score'] = score
        offres_scorees.append(match_info)
    
    # Trier les offres par score décroissant
    offres_scorees.sort(key=lambda x: x['score'], reverse=True)
    
    # Retourner uniquement les offres avec un score > 0
    return [match_info for match_info in offres_scorees if match_info['score'] > 0] 