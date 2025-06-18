from django.urls import path
from . import views

app_name = 'messagerie'

urlpatterns = [
    path('', views.conversation_list, name='conversation_list'),
    path('conversation/<int:conversation_id>/', views.conversation_detail, name='conversation_detail'),
    path('nouvelle-conversation/<int:user_id>/', views.nouvelle_conversation, name='nouvelle_conversation'),
] 