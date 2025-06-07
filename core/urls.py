from django.contrib import admin
from django.urls import path
from core import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.accueil, name='accueil'),
    path("inscription/", views.inscription_views , name='inscription'),
    path("connexion/", views.connexion_views ,name='connexion'),
    path("mot_de_passe_oublié/", views.mot_de_passe_oublié_views, name='mot_de_passe_oublié'),
    path('profil/', views.profil_views, name='profil'),
]


