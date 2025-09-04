from django.urls import path 
from conversation import routing
from django.contrib.auth import views as auth_views

from . import views

app_name = 'conversation'
 
urlpatterns = [
  path('', views.inbox, name='inbox'),
  path('<int:pk>/', views.detail, name='detail'),
  path('new/<int:item_pk>/', views.new_conversation, name='new'),
  path('api/unread-count/', views.unread_count_api, name='unread_count_api'),
]