# base/views.py
from django.shortcuts import render, redirect
from django.contrib.auth import get_user_model
from django.contrib import messages as django_messages
from poultryitems.models import Item 
from conversation.models import Conversation 
from .forms import MessageForm
from .models import Message
from houses.models import House
from vehicles.models import Vehicle
from electronics.models import Product as ElectronicsProduct
from clothings.models import ClothingItem as Clothing
from poultryitems.models import Item as PoultryItem

def base(request):
    User = get_user_model()
    users_count = User.objects.count()
    active_users_count = User.objects.filter(is_active=True).count()
    items_count = Item.objects.count() 
    conversations_count = Conversation.objects.count()
    featured_houses = House.objects.filter(is_featured=True).prefetch_related('images')[:4]
    featured_vehicles = Vehicle.objects.filter(is_featured=True).prefetch_related('images')[:4]
    featured_electronics = ElectronicsProduct.objects.filter(is_featured=True).prefetch_related('images')[:4]
    featured_clothing = Clothing.objects.filter(is_featured=True).prefetch_related('images')[:4]
    featured_poultry = PoultryItem.objects.filter(is_featured=True)[:4]
    
    for house in featured_houses:
        house.product_type = 'house'
    
    for vehicle in featured_vehicles:
        vehicle.product_type = 'vehicle'
    
    for electronics in featured_electronics:
        electronics.product_type = 'electronics'
    
    for clothing in featured_clothing:
        clothing.product_type = 'clothing'
    
    for poultry in featured_poultry:
        poultry.product_type = 'poultry'
    
    all_featured = list(featured_houses) + list(featured_vehicles) + list(featured_electronics) + list(featured_clothing) + list(featured_poultry)
    
    if request.method == 'POST':
        form = MessageForm(request.POST)
        if form.is_valid():
            Message.objects.create(
                phone=form.cleaned_data['phone'],
                message=form.cleaned_data['message']
            )
            django_messages.success(request, 'Message sent successfully!')
            return redirect('base:index')
    else:
        form = MessageForm()

    context = {
        'users_count': users_count,
        'active_users_count': active_users_count,
        'items_count': items_count,
        'conversations_count': conversations_count,
        'form': form,
        'all_featured': all_featured,
    }

    return render(request, 'base/index.html', context)

def message_list(request):
    all_messages = Message.objects.all().order_by('-created_at')
    return render(request, 'base/messages.html', {'messages': all_messages})

def about_us(request):
    return render(request, 'base/about_us.html')
def admin_links(request):
    return render(request, 'base/admin_links.html')

def terms(request):
    return render(request, 'base/terms.html')