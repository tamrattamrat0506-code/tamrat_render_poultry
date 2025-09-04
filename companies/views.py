from django.shortcuts import render
from django.views.generic import TemplateView

def companies_view(request):
    """
    View for companies index page
    """
    context = {
        'title': 'Companies',
        'description': 'List of companies',
        # Add any other context data needed for the template
    }
    return render(request, 'companies/index.html', context)

def alema_view(request):
    """
    View for AlemA company page
    """
    context = {
        'title': 'AlemA Poultry',
        'description': 'Information about AlemA Poultry company',
        # Add any other context data needed for the template
    }
    return render(request, 'companies/alema.html', context)

def ethiochicken_view(request):
    """
    View for EthioChicken company page
    """
    context = {
        'title': 'EthioChicken',
        'description': 'Information about EthioChicken company',
        # Add any other context data needed for the template
    }
    return render(request, 'companies/ethiochicken.html', context)

def nvi_view(request):
    """
    View for NVI company page
    """
    context = {
        'title': 'NVI',
        'description': 'Information about NVI company',
        # Add any other context data needed for the template
    }
    return render(request, 'companies/nvi.html', context)