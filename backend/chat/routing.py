from django.urls import re_path
from . import consumers

chat_websocket_patterns = [
    re_path(r'ws/chat/(?P<id>\d+)/$', consumers.ChatConsumer.as_asgi()),
]