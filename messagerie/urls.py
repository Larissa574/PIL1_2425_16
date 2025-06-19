from django.urls import path
from . import views

app_name = 'messagerie'

urlpatterns = [
    path('', views.conversation_list, name='conversation_list'),
    path('conversation/<int:conversation_id>/', views.conversation_detail, name='conversation_detail'),
    path('nouvelle-conversation/<int:user_id>/', views.nouvelle_conversation, name='nouvelle_conversation'),
    
    # APIs pour la messagerie AJAX
    path('api/users/', views.api_users_list, name='api_users_list'),
    path('api/messages/<int:user_id>/', views.api_messages, name='api_messages'),
    path('api/unread-count/', views.api_unread_count, name='api_unread_count'),
] 