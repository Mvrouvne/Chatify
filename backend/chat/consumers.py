import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Conversations, Messages, BlockList
from django.contrib.auth.models import User
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
from django.db.models import Q

class   ChatConsumer(AsyncWebsocketConsumer):
    async def   connect(self):
        self.conversation_id = self.scope['url_route']['kwargs']['id']
        try:
            self.conversation = await database_sync_to_async(Conversations.objects.get)(id=self.conversation_id)
        except Conversations.DoesNotExist:
            print ("Conv Does not exist")
            await self.close()
            return
        
        self.user = self.scope['user']
        self.user1_id = await sync_to_async(lambda: self.conversation.user1_id)()
        self.user2_id = await sync_to_async(lambda: self.conversation.user2_id)()

        print ("selfUser = ", self.user)

        if self.user.is_authenticated and self.user in [self.user1_id, self.user2_id]:
            print ("USER is authenticated")
            await self.channel_layer.group_add(self.conversation_id, self.channel_name)
        
            await self.accept()
            existingBlock = await database_sync_to_async(BlockList.objects.filter(
                conversation_id=self.conversation.id
                ).first)()
            if existingBlock:
                block_details = await database_sync_to_async(BlockList.objects.get)(conversation_id=self.conversation_id)
                await self.channel_layer.group_send(
                    self.conversation_id,
                    {
                        'type': 'block_user',
                        'blocker': block_details.blocker_id,
                        'blocked': block_details.blocked_id
                    }
                )
        else:
            print ("USER is NOT authenticated")
            await self.close()
    
    async def   disconnect(self, code):
        await self.channel_layer.group_discard(
            self.conversation_id, self.channel_name,
        )

    async def   receive(self, text_data):
        text_data_dic = json.loads(text_data)

        ### Deleting messages action ###
        if 'action' in text_data_dic and text_data_dic['action'] == 'delete':
            sender_id = text_data_dic['sender_id']
            user = self.scope['user'].username
            existingMessage = await database_sync_to_async(Messages.objects.filter(conversation_id=self.conversation_id, sender_id=sender_id).first)()
            if existingMessage:
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
            try:
                TheBlocker = await database_sync_to_async(User.objects.get)(id=self.scope['user'].id)
                TheBlocked = None
                if TheBlocker.id == self.user1_id.id:
                    TheBlocked = await database_sync_to_async(User.objects.get)(id=self.user2_id.id)
                else:
                    TheBlocked = await database_sync_to_async(User.objects.get)(id=self.user1_id.id)

                block_action = BlockList(
                    blocker = TheBlocker,
                    blocked = TheBlocked,
                    conversation_id = self.conversation
                )

                existingBlock = await database_sync_to_async(BlockList.objects.filter(
                    conversation_id=self.conversation.id
                    ).first)()
                if not existingBlock:
                    await database_sync_to_async(block_action.save)()
                
                block_details = await database_sync_to_async(BlockList.objects.get)(conversation_id=self.conversation_id)
                await self.channel_layer.group_send(
                    self.conversation_id,
                    {
                        'type': 'block_user',
                        'blocker': block_details.blocker_id,
                        'blocked': block_details.blocked_id
                    }
                )
            except Exception as e:
                print(f'Exception raised, reason {e}')

        ### Unblocking a user action ###
        elif 'action' in text_data_dic and text_data_dic['action'] == 'unblock':
            try:
                to_unblock = await database_sync_to_async(BlockList.objects.get)(conversation_id=self.conversation_id)
                if to_unblock:
                    await database_sync_to_async(to_unblock.delete)()
                await self.channel_layer.group_send(
                    self.conversation_id,
                    {
                        'type': 'unblock_user',
                    }
                )
            except Exception as e:
                print(f'Exception raised, reason {e}')

        ### Sending messages action ###
        elif 'message' in text_data_dic:
            message = text_data_dic['message']
            user = self.scope['user'].username

            existingBlock = await database_sync_to_async(BlockList.objects.filter(
                (Q(blocker=self.user1_id.id, blocked=self.user2_id.id)) | (Q(blocker=self.user2_id.id, blocked=self.user1_id.id))
                ).first)()
            if not existingBlock:
                # DB saving ************
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
                'blocker': event['blocker'],
                'blocked': event['blocked']
            }
        ))

    async def   unblock_user(self, event):
        await self.send(text_data=json.dumps(
            {
                'type': 'unblock_user',
            }
        ))