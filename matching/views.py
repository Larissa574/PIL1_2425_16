# from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.
def migration_view(request):
    return HttpResponse('Ceci est la page du matching') 