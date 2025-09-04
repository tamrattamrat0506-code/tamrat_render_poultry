# users\consumers.py
import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from django.contrib.auth import get_user_model
from conversation.models import Conversation, ConversationMessage
from asgiref.sync import sync_to_async


logger = logging.getLogger(__name__)
User = get_user_model()

class UserNotificationsConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            if not self.scope["user"].is_authenticated:
                await self.close(code=4001) 
                return

            self.user_id = str(self.scope["user"].id)
            self.room_group_name = f'user_{self.user_id}'
            
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            await self.accept()
            
            await self.send_unread_count()
            
            logger.info(f"WebSocket connected for user {self.user_id}")

        except Exception as e:
            logger.error(f"Connection error: {e}")
            await self.close(code=4003) 

    async def disconnect(self, close_code):
        try:
            if hasattr(self, 'room_group_name'):
                await self.channel_layer.group_discard(
                    self.room_group_name,
                    self.channel_name
                )
            logger.info(f"WebSocket disconnected (code: {close_code})")
        except Exception as e:
            logger.error(f"Disconnection error: {e}")

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            
            if data.get('type') == 'mark_read':
                conversation_id = data.get('conversation_id')
                if conversation_id:
                    await self.mark_messages_read(conversation_id)
                    
        except json.JSONDecodeError:
            await self.send_error("Invalid JSON format")
        except Exception as e:
            logger.error(f"Message handling error: {e}")
            await self.send_error("Internal error")

    async def send_unread_count(self):
        """Send current unread message count to client"""
        try:
            count = await self.get_unread_count()
            await self.send(text_data=json.dumps({
                'type': 'unread_count',
                'count': count
            }))
        except Exception as e:
            logger.error(f"Error sending unread count: {e}")

    @sync_to_async
    def get_unread_count(self):
        """Sync function to get unread count (Django ORM is sync)"""
        return ConversationMessage.objects.filter(
            conversation__members__id=self.user_id,
            is_read=False
        ).exclude(created_by_id=self.user_id).count()

    @sync_to_async
    def mark_messages_read(self, conversation_id):
        """Mark messages as read for a conversation"""
        ConversationMessage.objects.filter(
            conversation__id=conversation_id,
            conversation__members__id=self.user_id,
            is_read=False
        ).exclude(created_by_id=self.user_id).update(is_read=True)

    async def unread_count_update(self, event):
        """Handle unread count update events from signals"""
        try:
            await self.send(text_data=json.dumps({
                'type': 'unread_update',
                'count': event['count']
            }))
        except Exception as e:
            logger.error(f"Error sending update: {e}")

    async def send_error(self, message):
        """Send error message to client"""
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': message
        }))



class UserConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        # Add your logic here

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        pass