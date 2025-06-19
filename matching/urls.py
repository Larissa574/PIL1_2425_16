from django.urls import path 
from . import views

urlpatterns = [
    path("api/matching/", views.recherche_covoiturage, name = "recherche_covoiturage"),
    path('api/rechercher-trajets/', views.api_rechercher_trajets, name='api_rechercher_trajets'),
]