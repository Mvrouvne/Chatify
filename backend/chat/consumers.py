import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Conversations, Messages
from django.contrib.auth.models import User
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async

class   ChatConsumer(AsyncWebsocketConsumer):
    async def   connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['id']
        print ("=======> ", self.conversation_id)
        try:
            self.conversation = await database_sync_to_async(Conversations.objects.get)(id=self.conversation_id)
        except Conversations.DoesNotExist:
            print ("Conv Does not exist")
            await self.close()
            return
        
        self.user = self.scope['user']
        user1_id = await sync_to_async(lambda: self.conversation.user1_id)()
        user2_id = await sync_to_async(lambda: self.conversation.user2_id)()

        # I think i should check if user is blocked
        print ("selfUser = ", self.user)

        if self.user.is_authenticated and self.user in [user1_id, user2_id]:
            print ("USER is authenticated")
            await self.channel_layer.group_add(self.conversation_id, self.channel_name)
        
            await self.accept()
        else:
            print ("USER is NOT authenticated")
            await self.close()
    
    async def   disconnect(self, code):
        await self.channel_layer.group_discard(
            self.conversation_id, self.channel_name,
        )

    async def   receive(self, text_data):
        text_data_dic = json.loads(text_data)
        print('hhhhhnnnnanaa: ', text_data_dic)

        ### Deleting messages action ###
        if 'action' in text_data_dic and text_data_dic['action'] == 'delete':
            sender_id = text_data_dic['sender_id']
            user = self.scope['user'].username
            print('±-------->', sender_id)
            await database_sync_to_async(lambda: Messages.objects.filter(conversation_id=self.conversation_id, sender_id=sender_id).delete())()

            await self.channel_layer.group_send(
                self.conversation_id,
                {
                    'type': 'delete_message',
                    'sender': sender_id,
                    'user': user,
                }
        )
        ### Blocking a user action ###
        elif 'action' in text_data_dic and text_data_dic['action'] == 'block':
            await self.channel_layer.group_send(
                self.conversation_id,
                {
                    'type': 'block_user',
                }
            )

        ### Sending messages action ###
        elif 'message' in text_data_dic:
            message = text_data_dic['message']
            # user = text_data_dic['user']
            user = self.scope['user'].username
            print ("UUSER = ", user)

            # DB saving///////////////////////////
            received_message = Messages(
                content = message,
                sender_id = await database_sync_to_async(User.objects.get)(username=user),
                conversation_id = await database_sync_to_async(Conversations.objects.get)(id=self.conversation_id),
            )
            await database_sync_to_async(received_message.save)()

            await self.channel_layer.group_send(
                self.conversation_id,
                {
                    'type': 'send_message',
                    'message': message,
                    'user': user,
                }
            )
    
    async def   send_message(self, event):
        await self.send(text_data=json.dumps(
            {
                'type': 'send_message',
                'message': event['message'],
                'user': event['user'],
            }
        ))

    async def   delete_message(self, event):
        await self.send(text_data=json.dumps(
            {
                'type': 'delete_message',
                'sender': event['sender'],
                'user': event['user'],
            }
        ))

    async def   block_user(self, event):
        await self.send(text_data=json.dumps(
            {
                'type': 'block_user',
            }
        ))