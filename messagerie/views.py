from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import get_user_model
from django.db.models import Q
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