from django.contrib.auth.backends import BaseBackend
from .models import CustomUser

class UsernamePhoneBackend(BaseBackend):
    def authenticate(self, request, username=None, phone_number=None, **kwargs):
        try:
            return CustomUser.objects.get(username=username, phone_number=phone_number)
        except CustomUser.DoesNotExist:
            return None

    def get_user(self, user_id):
        try:
            return CustomUser.objects.get(pk=user_id)
        except CustomUser.DoesNotExist:
            return None
