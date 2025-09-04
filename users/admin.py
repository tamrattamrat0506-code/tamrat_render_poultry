from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, Profile

class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'phone_number', 'is_staff')
    fieldsets = (
        (None, {'fields': ('username', 'phone_number')}), 
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'phone_number'),
        }),
    )

class ProfileAdmin(admin.ModelAdmin):
    list_display = ('get_username', 'get_phone_number', 'bio_short', 'location')
    search_fields = ('user__username', 'user__phone_number') 
    list_filter = ('location',)
    
    def get_username(self, obj):
        return obj.user.username
    get_username.short_description = 'Username'
    
    def get_phone_number(self, obj):
        return obj.user.phone_number
    get_phone_number.short_description = 'Phone'
    
    def bio_short(self, obj):
        return obj.bio[:50] + '...' if obj.bio else ''
    bio_short.short_description = 'Bio'

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Profile, ProfileAdmin)