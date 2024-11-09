from rest_framework import serializers
from chat.models import Messages, Conversations

class   ChatOverviewSerializer(serializers.ModelSerializer):
    conversation = serializers.SerializerMethodField()

    class   Meta:
        model = Conversations
        fields = ['id', 'conversation']
    
    def get_conversation(self, conversation):
        selfuser = self.context['request'].user
        if selfuser.username == conversation.user1_id.username:
            print (conversation.user2_id)
            return conversation.user2_id.username
        else:
            return conversation.user1_id.username    

class   ConversationDetailSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()

    class   Meta:
        model = Messages
        fields = ['sender', 'content', 'timestamp', 'sender_id']

    def get_sender(self, messages):
        return messages.sender_id.username
    
class   CreateConversationSerializer(serializers.ModelSerializer):

    class   Meta:
        model = Conversations   
        fields = ['user1_id', 'user2_id']