from django.urls import path
from . import views

app_name = 'contact'

urlpatterns = [
    path('contact-us/', views.ContactUsView.as_view(), name='contact_us'),
    path('messages/', views.ReceivedMessagesView.as_view(), name='received_messages'),
    path('messages/<int:pk>/', views.ViewMessageView.as_view(), name='view_message'),
    path('messages/<int:pk>/delete/', views.DeleteMessageView.as_view(), name='delete_message'),
]