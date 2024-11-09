from django.urls import re_path
from . import consumers

notifications_websocket_patterns = [
    re_path('ws/notification/', consumers.NotificationsConsumer.as_asgi()),
]