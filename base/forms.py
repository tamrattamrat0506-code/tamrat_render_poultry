# C:\Users\Na\Desktop\firaol\project\base\forms.py
from django import forms

class MessageForm(forms.Form):
    phone = forms.CharField(max_length=15, required=True)
    message = forms.CharField(widget=forms.Textarea, required=True)