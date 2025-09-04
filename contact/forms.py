from django import forms
from django.utils.translation import gettext_lazy as _
from .models import ContactMessage

class ContactForm(forms.ModelForm):
    class Meta:
        model = ContactMessage
        fields = ['name', 'email', 'subject', 'message']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': _('Your Name')
            }),
            'email': forms.EmailInput(attrs={
                'class': 'form-control',
                'placeholder': _('Your Email')
            }),
            'subject': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': _('Subject')
            }),
            'message': forms.Textarea(attrs={
                'class': 'form-control',
                'placeholder': _('Your Message'),
                'rows': 5
            }),
        }
        labels = {
            'name': _('Your Name'),
            'email': _('Your Email'),
            'subject': _('Subject'),
            'message': _('Your Message'),
        }