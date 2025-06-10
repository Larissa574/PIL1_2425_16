from django.contrib import admin
from django.urls import path, include
from django.urls import path


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('core.urls')),
    path('matching/', include('matching.urls')),
    path('messagerie/', include('messagerie.urls')) # Route pour la messagerie
]