from django.urls import path 
from . import views

urlpatterns = [
    path("api/matching/", views.recherche_covoiturage, name = "recherche_covoiturage"),
]