# project/houses/views.py
from django.shortcuts import render, get_object_or_404, redirect
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.urls import reverse_lazy
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.messages.views import SuccessMessageMixin
from django.contrib import messages
from .models import House, HouseImage, HouseCategory
from .forms import HouseForm
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from django.contrib.contenttypes.models import ContentType
from django.utils.decorators import method_decorator
from cart.models import CartItem
from cart.views import _get_cart

@require_POST
@csrf_exempt
def like_house(request, house_id):
    try:
        house = House.objects.get(id=house_id)
        new_count = house.increment_likes()
        return JsonResponse({
            'status': 'success',
            'like_count': new_count,
            'house_id': house_id
        })
    except House.DoesNotExist:
        return JsonResponse({'status': 'error'}, status=404)

@require_POST
@csrf_exempt
def share_house(request, house_id):
    try:
        house = House.objects.get(id=house_id)
        new_count = house.increment_shares()
        return JsonResponse({
            'status': 'success', 
            'share_count': new_count,
            'house_id': house_id
        })
    except House.DoesNotExist:
        return JsonResponse({'status': 'error'}, status=404)

class HouseListView(ListView):
    model = House
    template_name = 'houses/house_list.html'
    context_object_name = 'houses'
    paginate_by = 12

    def get_queryset(self):
        queryset = super().get_queryset()
        category_slug = self.kwargs.get('category_slug')
        if category_slug:
            category = get_object_or_404(HouseCategory, slug=category_slug)
            queryset = queryset.filter(category__iexact=category.name)
        return queryset.order_by('-date_added')

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        houses = context['houses']

        cart = _get_cart(self.request)
        house_ct = ContentType.objects.get_for_model(House)
        cart_house_ids = CartItem.objects.filter(
            cart=cart,
            content_type=house_ct,
            object_id__in=houses.values_list('id', flat=True)
        ).values_list('object_id', flat=True)

        for house in houses:
            house.is_carted = house.id in cart_house_ids

        return context
    
class HouseDetailView(DetailView):
    model = House
    template_name = 'houses/house_detail.html'
    context_object_name = 'house'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        house = self.object
        context['images'] = house.images.all()
        context['app_label'] = house._meta.app_label
        context['model_name'] = house._meta.model_name

        cart = _get_cart(self.request)
        house_ct = ContentType.objects.get_for_model(house)
        context['house'].is_carted = CartItem.objects.filter(
            cart=cart,
            content_type=house_ct,
            object_id=house.id
        ).exists()

        return context
    
class HouseCreateView(LoginRequiredMixin, SuccessMessageMixin, CreateView):
    model = House
    form_class = HouseForm
    template_name = 'houses/house_form.html'
    success_url = reverse_lazy('houses:house_list')
    success_message = "House listing created successfully!"

    def form_valid(self, form):
        form.instance.created_by = self.request.user
        response = super().form_valid(form)
        files = self.request.FILES.getlist('images')
        for f in files:
            HouseImage.objects.create(house=self.object, image=f)
        return response

class HouseUpdateView(LoginRequiredMixin, SuccessMessageMixin, UpdateView):
    model = House
    form_class = HouseForm
    template_name = 'houses/house_form.html'
    success_url = reverse_lazy('houses:house_list')
    success_message = "House listing updated successfully!"

    def form_valid(self, form):
        response = super().form_valid(form)
        files = self.request.FILES.getlist('images')
        for f in files:
            HouseImage.objects.create(house=self.object, image=f)
        return response

# project/houses/views.py
class HouseDeleteView(LoginRequiredMixin, SuccessMessageMixin, DeleteView):
    model = House
    success_url = reverse_lazy('houses:house_list')
    success_message = "House listing deleted successfully!"
    
    # Completely disable template rendering by overriding get method
    def get(self, request, *args, **kwargs):
        return redirect(self.success_url)

    @method_decorator(csrf_exempt)
    def dispatch(self, *args, **kwargs):
        return super().dispatch(*args, **kwargs)

    def delete(self, request, *args, **kwargs):
        try:
            self.object = self.get_object()
            self.object.delete()
            
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'status': 'success',
                    'message': self.success_message
                })
            messages.success(self.request, self.success_message)
            return redirect(self.success_url)
            
        except Exception as e:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({
                    'status': 'error',
                    'message': 'Error deleting property: ' + str(e)
                }, status=500)
            
            messages.error(self.request, 'Error deleting property: ' + str(e))
            return redirect(self.success_url)
        
def house_list(request):
    houses = House.objects.all().order_by('-date_added')
    categories = HouseCategory.objects.all()

    cart = _get_cart(request)
    house_ct = ContentType.objects.get_for_model(House)
    cart_house_ids = CartItem.objects.filter(
        cart=cart,
        content_type=house_ct,
        object_id__in=houses.values_list('id', flat=True)
    ).values_list('object_id', flat=True)

    for house in houses:
        house.is_carted = house.id in cart_house_ids

    context = {
        'houses': houses,
        'categories': categories,
    }
    return render(request, 'houses/house_list.html', context)

def house_detail(request, pk):
    house = get_object_or_404(House, pk=pk)
    images = house.images.all()

    cart = _get_cart(request)
    house_ct = ContentType.objects.get_for_model(House)
    house.is_carted = CartItem.objects.filter(
        cart=cart,
        content_type=house_ct,
        object_id=house.id
    ).exists()

    context = {
        'house': house,
        'images': images,
    }
    return render(request, 'houses/house_detail.html', context)