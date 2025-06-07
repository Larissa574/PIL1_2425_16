from django.shortcuts import render
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login


def accueil(request):
    return render(request, 'index.html')
def inscription_views(request):
    return render(request, 'register.html')

def mot_de_passe_oublié_views(request):
    return render(request,'password_reset.html')

def connexion_views(request):
    if request.method == 'POST':
        identifier = request.POST.get('identifier')
        password = request.POST.get('password')
        user = authenticate(request, username=identifier, password=password)
        if user is not None:
            login(request, user)
            return redirect('profil')  # nom de la route du profil
        else:
            return render(request, 'login.html', {'error': 'Identifiants invalides'})
    return render(request, 'login.html')

def profil_views(request):
    return render(request, 'profile.html')
