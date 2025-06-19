# Generated manually to add missing fields

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('messagerie', '0001_initial'),
    ]

    operations = [
        # Ajouter created_at à Conversation avec une valeur par défaut
        migrations.AddField(
            model_name='conversation',
            name='created_at',
            field=models.DateTimeField(auto_now_add=True, null=True),
        ),
        
        # Ajouter updated_at à Conversation  
        migrations.AddField(
            model_name='conversation',
            name='updated_at',
            field=models.DateTimeField(auto_now=True, null=True),
        ),
        
        # Ajouter le champ content à Message s'il n'existe pas
        migrations.AddField(
            model_name='message',
            name='content',
            field=models.TextField(default=''),
            preserve_default=False,
        ),
        
        # Ajouter le champ is_read à Message
        migrations.AddField(
            model_name='message',
            name='is_read',
            field=models.BooleanField(default=False),
        ),
        
        # Ajouter le champ sender à Message (on ne supprime pas expediteur pour éviter des problèmes)
        migrations.AddField(
            model_name='message',
            name='sender',
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='sent_messages',
                to='core.utilisateur'
            ),
        ),
    ] 