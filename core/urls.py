from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.urls import path, reverse_lazy
from core import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.accueil, name='accueil'),
    path("inscription/", views.inscription_views , name='inscription'),
    path("connexion/", views.connexion_views ,name='connexion'),
    path("password_reset/", auth_views.PasswordResetView.as_view(
        template_name = 'password_reset.html',
        success_url = '/password_reset_verify/'
    ) , name='password_reset'),
    path("password_reset_verify/", auth_views.PasswordChangeDoneView.as_view(
        template_name = 'password_reset_verify.html'
    ), name='password_reset_verify'),
    path("reset/<uidb64>/<code>/", views.CustomPasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path("password_reset/complete/", auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),
    path('profil/', views.profil_views, name='profil'),
    path('page_principale/', views.page_principale_views, name='page_principale'),
    path('ajax/update_profil/', views.update_profil_ajax, name='update_profil_ajax'),
    path('deconnexion/', views.deconnexion_views, name='deconnexion'),
    path('mot-de-passe-oublie/', views.mot_de_passe_oublié_views, name='password_reset'),
    path('password-reset-request/', views.password_reset_request, name='password_reset_request'),
    path('password-reset-verify/', views.password_reset_verify, name='password_reset_verify'),
    path('password-reset-confirm/', views.CustomPasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('password-reset-complete/', views.password_reset_complete, name='password_reset_complete'),
    
    # URLs pour le covoiturage
    path('creer-offre/', views.creer_offre, name='creer_offre'),
    path('creer-demande/', views.creer_demande, name='creer_demande'),
    path('reserver-trajet/<int:offre_id>/', views.reserver_trajet, name='reserver_trajet'),
    path('gerer-reservation/<int:reservation_id>/', views.gerer_reservation, name='gerer_reservation'),

    # API pour les offres et demandes
    path('api/publier-offre/', views.api_publier_offre, name='api_publier_offre'),
    path('api/mes-offres/', views.api_mes_offres, name='api_mes_offres'),
    path('api/demandes-recues/', views.api_demandes_recues, name='api_demandes_recues'),
    path('api/mes-demandes/', views.api_mes_demandes, name='api_mes_demandes'),
]


