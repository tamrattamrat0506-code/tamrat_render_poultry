# items/api/views.py

from rest_framework import generics
from poultryitems.models import Item
from poultryitems.api.serializers import ItemSerializer

class ItemListAPIView(generics.ListAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer

class ItemDetailAPIView(generics.RetrieveAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
