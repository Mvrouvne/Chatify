# Generated by Django 5.1.1 on 2024-09-08 17:18

from django.conf import settings
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0003_remove_conversation_message_id'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Conversation',
            new_name='Conversations',
        ),
    ]
