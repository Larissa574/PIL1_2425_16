from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from .models import Conversation, Message

User = get_user_model()


@login_required
def conversation_list(request):
    conversations = request.user.conversations.all()
    return render(request, 'messagerie/conversation_list.html', {
        'conversations': conversations
    })


@login_required
def conversation_detail(request, conversation_id):
    conversation = get_object_or_404(Conversation, id=conversation_id)
    
    # Vérifier que l'utilisateur fait partie de la conversation
    if request.user not in conversation.participants.all():
        return redirect('messagerie:conversation_list')
    
    # Marquer les messages comme lus
    conversation.messages.filter(is_read=False).exclude(sender=request.user).update(is_read=True)
    
    messages = conversation.messages.all()
    other_participant = conversation.participants.exclude(id=request.user.id).first()
    
    return render(request, 'messagerie/conversation_detail.html', {
        'conversation': conversation,
        'messages': messages,
        'other_participant': other_participant
    })


@login_required
def nouvelle_conversation(request, user_id):
    other_user = get_object_or_404(User, id=user_id)
    
    # Vérifier si une conversation existe déjà
    existing_conversation = Conversation.objects.filter(
        participants=request.user
    ).filter(
        participants=other_user
    ).first()
    
    if existing_conversation:
        return redirect('messagerie:conversation_detail', conversation_id=existing_conversation.id)
    
    # Créer une nouvelle conversation
    conversation = Conversation.objects.create()
    conversation.participants.add(request.user, other_user)
    
    return redirect('messagerie:conversation_detail', conversation_id=conversation.id)


@login_required
@require_http_methods(["GET"])
def api_users_list(request):
    """API pour récupérer la liste des utilisateurs disponibles pour la messagerie"""
    try:
        # Récupérer tous les utilisateurs sauf l'utilisateur actuel
        users = User.objects.exclude(id=request.user.id)
        
        users_data = []
        for user in users:
            # URL de la photo de profil
            if user.photo:
                avatar_url = user.photo.url
            else:
                avatar_url = '/static/css/images/defaut_profile.png'
            
            # Chercher la conversation existante avec cet utilisateur
            conversation = Conversation.objects.filter(
                participants=request.user
            ).filter(
                participants=user
            ).first()
            
            # Récupérer le dernier message de la conversation
            dernier_message = None
            dernier_message_timestamp = None
            message_non_lu = False
            
            if conversation:
                derniere_msg = conversation.messages.order_by('-timestamp').first()
                if derniere_msg:
                    dernier_message = derniere_msg.content
                    dernier_message_timestamp = derniere_msg.timestamp.isoformat()
                    # Vérifier si ce message est non lu et pas envoyé par l'utilisateur actuel
                    message_non_lu = not derniere_msg.is_read and derniere_msg.sender != request.user
            
            users_data.append({
                'id': user.id,
                'nom': f"{user.prenom} {user.nom}",
                'email': user.email,
                'role': user.get_role_display(),
                'avatar': avatar_url,
                'dernier_message': dernier_message,
                'dernier_message_timestamp': dernier_message_timestamp,
                'message_non_lu': message_non_lu
            })
        
        return JsonResponse({
            'success': True,
            'users': users_data
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@login_required
@require_http_methods(["GET"])
def api_unread_count(request):
    """API pour récupérer le nombre de messages non lus"""
    try:
        # Compter les messages non lus pour l'utilisateur actuel
        unread_count = Message.objects.filter(
            conversation__participants=request.user,
            is_read=False
        ).exclude(sender=request.user).count()
        
        return JsonResponse({
            'success': True,
            'unread_count': unread_count
        })
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)


@login_required
@require_http_methods(["GET", "POST"])
def api_messages(request, user_id):
    """API pour récupérer ou envoyer des messages avec un utilisateur"""
    try:
        other_user = get_object_or_404(User, id=user_id)
        
        if request.method == 'GET':
            # Récupérer l'historique des messages
            # Chercher la conversation existante
            conversation = Conversation.objects.filter(
                participants=request.user
            ).filter(
                participants=other_user
            ).first()
            
            messages_data = []
            if conversation:
                # Marquer les messages comme lus côté backend
                conversation.messages.filter(is_read=False).exclude(sender=request.user).update(is_read=True)
                messages = conversation.messages.all().order_by('timestamp')
                for message in messages:
                    messages_data.append({
                        'id': message.id,
                        'contenu': message.content,
                        'expediteur_id': message.sender.id,
                        'expediteur_nom': f"{message.sender.prenom} {message.sender.nom}",
                        'timestamp': message.timestamp.isoformat(),
                        'is_read': message.is_read
                    })
            
            return JsonResponse({
                'success': True,
                'messages': messages_data
            })
        
        elif request.method == 'POST':
            # Envoyer un nouveau message
            import json
            data = json.loads(request.body)
            message_content = data.get('message', '').strip()
            
            if not message_content:
                return JsonResponse({
                    'success': False,
                    'error': 'Le message ne peut pas être vide'
                }, status=400)
            
            # Créer ou récupérer la conversation
            conversation = Conversation.objects.filter(
                participants=request.user
            ).filter(
                participants=other_user
            ).first()
            
            if not conversation:
                conversation = Conversation.objects.create()
                conversation.participants.add(request.user, other_user)
            
            # Créer le message
            message = Message.objects.create(
                conversation=conversation,
                sender=request.user,
                content=message_content
            )
            
            # Mettre à jour la conversation (sans utiliser timestamp)
            conversation.save()  # updated_at sera mis à jour automatiquement
            
            return JsonResponse({
                'success': True,
                'message': {
                    'id': message.id,
                    'contenu': message.content,
                    'expediteur_id': message.sender.id,
                    'expediteur_nom': f"{message.sender.prenom} {message.sender.nom}",
                    'timestamp': message.timestamp.isoformat()
                }
            })
    
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500) 