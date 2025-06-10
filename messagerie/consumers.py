import json 
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        #  Utilisation d'un espace de chat unique, peut l'adapter pour des conversations privées
        self.room_group_name = 'chat_global'
        await self.channel_layer.group_add(self.room_group_name,self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name,self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']
        expediteur = data['expediteur']

        # pour envoyer des messages à tous les utilisateurs connectés dans l'espace
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type':'chat_message',
                'message':message,
                'expediteur':expediteur,
            }
        )

    async def chat_message(self,event):
        message = event['message']
        expediteur = event['expediteur']
        await self.send(text_data=json.dumps({
            'message': message,
            'expediteur':expediteur,
        }))
    
    