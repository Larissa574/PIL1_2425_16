#  Pour la création d'un profil automatiquement après l'inscription sans que l'utilisateur n'ai a le faire 
# manuellement , toutefois il pourra le modifier à sa guise

from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Utilisateur
