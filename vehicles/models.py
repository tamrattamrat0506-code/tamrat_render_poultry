# vehicles/models.py
from django.db import models
from django.conf import settings
from django.utils.text import slugify

class VehicleCategory(models.Model):
    name = models.CharField(max_length=50)
    slug = models.SlugField(unique=True)
    icon = models.CharField(max_length=30, help_text="Font Awesome icon class")

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Vehicle(models.Model):
    VEHICLE_TYPES = (
        ('car', 'Car'),
        ('truck', 'Truck'),
        ('motorcycle', 'Motorcycle'),
        ('bicycle', 'Bicycle'),
    )
    
    FUEL_TYPES = (
        ('petrol', 'Petrol'),
        ('diesel', 'Diesel'),
        ('electric', 'Electric'),
        ('hybrid', 'Hybrid'),
        ('none', 'None'),
    )
    CATEGORY_CHOICES = [
        ('car', 'Car'),
        ('truck', 'Truck'),
        ('motorcycle', 'Motorcycle'),
        ('bicycle', 'Bicycle'),
        ('suv', 'SUV'),
        ('van', 'Van'),
        ('bus', 'Bus'),
        ('commercial', 'Commercial Vehicles'),
    ]
    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default='car'
    )
    vehicle_type = models.CharField(max_length=20, choices=VEHICLE_TYPES)
    make = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    year = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=12, decimal_places=2)
    mileage = models.PositiveIntegerField(help_text="In kilometers")
    fuel_type = models.CharField(max_length=10, choices=FUEL_TYPES)
    engine_size = models.CharField(max_length=20, blank=True)
    color = models.CharField(max_length=30)
    description = models.TextField()
    is_featured = models.BooleanField(default=False)
    date_added = models.DateTimeField(auto_now_add=True)
    slug = models.SlugField(unique=True)
    created_by = models.ForeignKey(settings.
    AUTH_USER_MODEL, on_delete=models.CASCADE)
    like_count = models.PositiveIntegerField(default=0)
    share_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def increment_likes(self):
        self.like_count += 1
        self.save()
        return self.like_count
    
    def increment_shares(self):
        self.share_count += 1
        self.save()
        return self.share_count
    
    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(f"{self.year}-{self.make}-{self.model}")
            unique_slug = base_slug
            num = 1
            while Vehicle.objects.filter(slug=unique_slug).exists():
                unique_slug = f"{base_slug}-{num}"
                num += 1
            self.slug = unique_slug
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.year} {self.make} {self.model}"

class VehicleImage(models.Model):
    vehicle = models.ForeignKey(Vehicle, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='vehicle_images/')
    is_featured = models.BooleanField(default=False)
    alt_text = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"Image for {self.vehicle}"
