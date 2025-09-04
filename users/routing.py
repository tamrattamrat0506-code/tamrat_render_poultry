# users\routing.py
from django.urls import path
from users import consumers


websocket_urlpatterns = [
    path('ws/notifications/user/<int:user_id>/', consumers.UserNotificationsConsumer.as_asgi()),
    path('ws/user/<int:user_id>/', consumers.UserConsumer.as_asgi()),
]
