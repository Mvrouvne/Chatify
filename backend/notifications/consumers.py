import json
from channels.generic.websocket import AsyncWebsocketConsumer

class   NotificationsConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        self.user_notification_id = f'user_notification_{self.user.id}'
        print ('user ===> ', self.user.id)

        if not self.user.is_authenticated:
            print ("USER is NOT authenticated")
            await self.close()
        else:
            await self.channel_layer.group_add(self.user_notification_id, self.channel_name)
            await self.accept()
    
    async def disconnect(self, code):
        await self.channel_layer.group_discard(
            self.user_notification_id, self.channel_name,
        )

    async def receive(self, text_data):
        text_data_dic = json.loads(text_data)
        print ('RECIEVA')

        if 'message_notification' in text_data_dic:
            receiver_id = text_data_dic['receiver_id']
            await self.channel_layer.group_send(
                f'user_notification_{receiver_id}',
                {
                    'type': 'send_message_notification',
                    'receiver': receiver_id,
                }
            )

        elif 'game_request_notification' in text_data_dic:
            receiver_id = text_data_dic['receiver_id']
            await self.channel_layer.group_send(
                f'user_notification_{receiver_id}',
                {
                    'type': 'game_request_notification',
                    'receiver': receiver_id,
                }
            )

    async def send_message_notification(self, event):
        await self.send(text_data=json.dumps(
            {
                'type': 'send_message_notification',
                'receiver': event['receiver']
            }
        ))

    async def game_request_notification(self, event):
        await self.send(text_data=json.dumps(
            {
                'type': 'game_request_notification',
                'receiver': event['receiver']
            }
        ))