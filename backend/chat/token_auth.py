from rest_framework.authtoken.models import Token
from django.contrib.auth.models import AnonymousUser
from channels.auth import AuthMiddlewareStack
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async
from urllib.parse import parse_qs

class   TokenAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query_string = scope['query_string'].decode('utf-8')
        query_dic = parse_qs(query_string)

        if 'Token' in query_dic:
            try:
                token_key = query_dic['Token'][0]
                token = await database_sync_to_async(Token.objects.get)(key=token_key)
                scope['user'] = await sync_to_async(lambda: token.user)()
            except Token.DoesNotExist:
                scope['user'] = AnonymousUser()
        return await self.inner(scope, receive, send)

TokenAuthMiddlewareStack = lambda inner: TokenAuthMiddleware(AuthMiddlewareStack(inner))