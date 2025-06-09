from django.db import models
from core.models import User

class Conversation(models.Model):
    participants = models.ManyToManyField(User)

    def __str__(self):
        return f"Conversation {self.id}"
    

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    expediteur = models.ForeignKey(User, on_delete=models.CASCADE)
    contenu = models.TextField
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message de {self.expediteur.username} à {self.timestamp}: {self.contenu[:30]}"