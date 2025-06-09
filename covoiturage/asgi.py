from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter 
import os
import messagerie.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'covoiturage.settings')

application = ProtocolTypeRouter({
    "http":get_asgi_application()
    "websocket": URLRouter(messagerie.routing.websocket_urlpatterns),
})