from django.db import models
from django.contrib.auth.models import User

class   Conversations(models.Model):
    user1_id = models.ForeignKey(User, related_name='user1', on_delete=models.CASCADE)
    user2_id = models.ForeignKey(User, related_name='user2', on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.user1_id.username} and {self.user2_id.username}'

class   Messages(models.Model):
    content = models.TextField()
    sender_id = models.ForeignKey(User, on_delete=models.CASCADE)
    conversation_id = models.ForeignKey(Conversations, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'message of {self.sender_id.username}'

class   BlockList(models.Model):
    blocker = models.ForeignKey(User, related_name='blocker', on_delete=models.CASCADE) # the block action taker
    blocked = models.ForeignKey(User, related_name='blocked', on_delete=models.CASCADE) # the one who was blocked
    conversation_id = models.ForeignKey(Conversations, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.blocker} blocked {self.blocked}'