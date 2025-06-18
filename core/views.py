from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, get_user_model, logout
from django.contrib.auth.decorators import login_required
from django.core.files.storage import default_storage
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_http_methods
# Importations pour la demande de réinitialisation
from django.contrib.auth.views import PasswordResetConfirmView
from django.core.mail import send_mail
from django.urls import reverse_lazy
from django.views.generic import FormView
from django.conf import settings
from django.contrib import messages
from django.utils import timezone
from django.db.models import Q
from .forms import EmailValidationForm, CodeVerificationForm, CustomSetPasswordForm
from .models import PasswordResetCode, OffreCovoiturage, DemandeCovoiturage, ReservationCovoiturage
from .matching import match_offres, geocode_address
import datetime
import re


def accueil(request):
    return render(request, 'index.html')


def mot_de_passe_oublié_views(request):
    return render(request,'password_reset.html')  

def connexion_views(request):
    if request.user.is_authenticated:
        return redirect('page_principale')

    error = None
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        user = authenticate(request, username=email, password=password)
        if user is not None:
            login(request, user)
            user.derniere_connexion = timezone.now()
            user.save()
            return redirect('page_principale')
        else:
            error = 'Identifiants invalides'
    return render(request, 'login.html', {'error': error})

def deconnexion_views(request):
    logout(request)
    return redirect('connexion')

@login_required
def profil_views(request):
    return render(request, 'profile.html')

def inscription_views(request):
    if request.user.is_authenticated:
        return redirect('page_principale')

    if request.method == 'POST':
        nom = request.POST.get('nom', '').strip()
        prenom = request.POST.get('prenom', '').strip()
        email = request.POST.get('email', '').strip()
        telephone = request.POST.get('telephone', '').strip()
        mot_de_passe = request.POST.get('mot_de_passe', '').strip()
        role = request.POST.get('role', '').strip()

        erreurs = []

        if not all([nom, prenom, email, telephone, mot_de_passe, role]):
            erreurs.append("Tous les champs sont requis.")

        if Utilisateur.objects.filter(email=email).exists():
            erreurs.append("Cet email est déjà utilisé.")

        if Utilisateur.objects.filter(telephone=telephone).exists():
            erreurs.append("Ce numéro est déjà utilisé.")

        if not re.match(r'^01\d{8}$', telephone):
            erreurs.append("Le numéro doit commencer par 01 et contenir 10 chiffres.")

        if len(mot_de_passe) < 8 or len(mot_de_passe) > 15:
            erreurs.append("Le mot de passe doit contenir entre 8 et 15 caractères.")
        if not re.search(r'[A-Za-z]', mot_de_passe):
            erreurs.append("Le mot de passe doit contenir au moins une lettre.")
        if not re.search(r'\d', mot_de_passe):
            erreurs.append("Le mot de passe doit contenir au moins un chiffre.")
        if not re.search(r'[\W_]', mot_de_passe):
            erreurs.append("Le mot de passe doit contenir un caractère spécial.")

        if erreurs:
            return render(request, 'register.html', {
                'erreurs': erreurs,
                'donnees': request.POST
            })

        utilisateur = Utilisateur(
            nom=nom,
            prenom=prenom,
            email=email,
            telephone=telephone,
            role=role
        )
        utilisateur.set_password(mot_de_passe)
        utilisateur.save()
        login(request, utilisateur)
        return redirect('page_principale')

    return render(request, 'register.html')

@login_required
def page_principale_views(request):
    utilisateur = request.user
    offres = OffreCovoiturage.objects.filter(active=True).select_related('conducteur')
    demandes = DemandeCovoiturage.objects.filter(active=True).select_related('passager')
    
    if utilisateur.role == 'passager':
        # Pour les passagers, on montre les offres correspondant à leurs demandes
        demandes_utilisateur = demandes.filter(passager=utilisateur)
        offres_match = []
        for demande in demandes_utilisateur:
            offres_match.extend(match_offres(demande, exclude_user=utilisateur))
    else:
        # Pour les conducteurs, on montre leurs offres et les demandes correspondantes
        offres_utilisateur = offres.filter(conducteur=utilisateur)
        offres_match = []
        for offre in offres_utilisateur:
            demandes_match = DemandeCovoiturage.objects.filter(
                active=True,
                date_souhaitee=offre.date_depart,
                heure_souhaitee__hour=offre.heure_depart.hour
            ).exclude(passager=utilisateur)
            for demande in demandes_match:
                offres_match.extend(match_offres(demande, exclude_user=utilisateur))

    return render(request, 'page_principale.html', {
        'utilisateur': utilisateur,
        'offres': offres,
        'demandes': demandes,
        'offres_match': offres_match
    })

@login_required
@require_POST
def update_profil_ajax(request):
    utilisateur = request.user
    try:
        utilisateur.nom = request.POST.get('nom', utilisateur.nom)
        utilisateur.prenom = request.POST.get('prenom', utilisateur.prenom)
        utilisateur.telephone = request.POST.get('telephone', utilisateur.telephone)
        utilisateur.role = request.POST.get('role', utilisateur.role)
        nouvel_email = request.POST.get('email', utilisateur.email)
        if nouvel_email != utilisateur.email:
            if Utilisateur.objects.filter(email=nouvel_email).exclude(pk=utilisateur.pk).exists():
                return JsonResponse({'success': False, 'error': "Cet email est déjà utilisé."})
            utilisateur.email = nouvel_email
        if 'photo' in request.FILES:
            utilisateur.photo = request.FILES['photo']
        utilisateur.save()
        return JsonResponse({
            'success': True,
            'nom': utilisateur.nom,
            'prenom': utilisateur.prenom,
            'telephone': utilisateur.telephone,
            'role': utilisateur.role,
            'email': utilisateur.email,
            'photo_url': utilisateur.photo.url if utilisateur.photo else None
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)})
    

# vue pour gérer la demande de réinitialissation
User = get_user_model()
@require_POST
def password_reset_request(request):
    if request.method == "POST":
        form = EmailValidationForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data["email"]
            try:
                user = User.objects.get(email__iexact=email)
                # Génération d'un code aléatoire de 6 chiffres
                reset_code =PasswordResetCode.generate_code(user)
                # Envoie de l'email avec le code 
                subject = 'Réinitialisation de votre mot de passe'
                message = f"Bonjour,\n\nVous avez fait une demande de réinitialisation de votre mot de passe.\nSi c'est bien le cas votre code de réinitialisation est: {reset_code}\nCe code n'est valable que durant 15 minutes.\n\nSi vous n'êtes pas auteur de cette demande ou que vous jugez qu'elle ne vous concerne pas vous pouvez tout simplement l'ignorer.\n\nCordialement,\nL'équipe Campus Comotorage"
                email_from = settings.EMAIL_HOST_USER
                recipient_list = [email]
                send_mail(subject, message, email_from, recipient_list)

                # Stocker l'ID de l'utilisateur dans la session pour l'étape suivante
                request.session['reset_user_id'] = user.id
                # Redirection vers la page de confirmation du code
                return redirect("password_reset_verify")
            except User.DoesNotExist:
                messages.error(request, "Aucun utilisateur trouvé avec cet e-mail.")
    else:
        form = EmailValidationForm()
    return render(request, "core/password_reset.html", {"form": form})


# vue pour la validation du code de réinitialisation
@require_http_methods(["GET", "POST"])
def password_reset_verify(request):
    # Vérifier que l'utilisateur a bien commencé le processus
    if 'reset_user_id' not in request.session:
        messages.error(request, "Session invalide ou expirée. Veuillez refaire la demande")
        return redirect('password_reset')
    
    user_id = request.session['reset_user_id']
    user = User.objects.get(id= user_id)

    if request.method == 'POST':
        form = CodeVerificationForm(request.POST)
        if form.is_valid():
            code = form.cleaned_data['code']
            try:
                reset_code = PasswordResetCode.objects.get(user=user, code=code)
                if reset_code.is_valid():
                    # si le code est valide on passe à l'étape de changement de mot de passe
                    request.session['reset_code'] = code # On stocke le code pour la prochaine étape
                    return redirect('password_reset_confirm')
                else:
                    form.add_error('code', 'Le code a expiré. Demandez-en un nouveau')
            except PasswordResetCode.DoesNotExist:
                form.add_error('code', 'Code invalide.')
    else:
        form = CodeVerificationForm()
    return render(request, 'password_reset_verify.html', {'form': form})


class CustomPasswordResetConfirmView(PasswordResetConfirmView):
    template_name = 'password_reset_confirm.html'
    form_class = CustomSetPasswordForm
    success_url = reverse_lazy('password_reset_complete')

    def get_user(self, uidb64=None):
        # Récupération de l'utilisateur depuis la session
        user_id = self.request.session.get('reset_user_id')
        if user_id:
            return get_object_or_404(User, id=user_id)
        return None
    
    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        kwargs['user'] = self.get_user()
        return kwargs
    
    def form_valid(self, form):
        # Supression du code après réinitialisation réussie
        user = self.get_user()
        PasswordResetCode.objects.filter(user=user).delete()

        # Nettoyer la session 
        if 'reset_user_id' in self.request.session:
            del self.request.session['reset_user_id']
        if 'reset_code' in self.request.session:
            del self.request.session['reset_code']    
        return super().form_valid(form)
    
def password_reset_complete(request):
    return render(request, 'password_reset_complete.html')

    
# Vues pour le covoiturage
@login_required
def creer_offre(request):
    if request.method == 'POST':
        point_depart = request.POST.get('point_depart')
        point_arrivee = request.POST.get('point_arrivee')
        date_depart = request.POST.get('date_depart')
        heure_depart = request.POST.get('heure_depart')
        places_disponibles = request.POST.get('places_disponibles')
        prix = request.POST.get('prix')
        description = request.POST.get('description', '')

        # Géocodage des adresses
        lat_depart, lon_depart = geocode_address(point_depart)
        lat_arrivee, lon_arrivee = geocode_address(point_arrivee)

        offre = OffreCovoiturage.objects.create(
            conducteur=request.user,
            point_depart=point_depart,
            point_arrivee=point_arrivee,
            date_depart=date_depart,
            heure_depart=heure_depart,
            places_disponibles=places_disponibles,
            prix=prix,
            description=description,
            lat_depart=lat_depart,
            lon_depart=lon_depart,
            lat_arrivee=lat_arrivee,
            lon_arrivee=lon_arrivee
        )
        return redirect('page_principale')
    return render(request, 'creer_offre.html')


@login_required
def creer_demande(request):
    if request.method == 'POST':
        point_depart = request.POST.get('point_depart')
        point_arrivee = request.POST.get('point_arrivee')
        date_souhaitee = request.POST.get('date_souhaitee')
        heure_souhaitee = request.POST.get('heure_souhaitee')
        nombre_places = request.POST.get('nombre_places', 1)
        description = request.POST.get('description', '')

        # Géocodage des adresses
        lat_depart, lon_depart = geocode_address(point_depart)
        lat_arrivee, lon_arrivee = geocode_address(point_arrivee)

        demande = DemandeCovoiturage.objects.create(
            passager=request.user,
            point_depart=point_depart,
            point_arrivee=point_arrivee,
            date_souhaitee=date_souhaitee,
            heure_souhaitee=heure_souhaitee,
            nombre_places=nombre_places,
            description=description,
            lat_depart=lat_depart,
            lon_depart=lon_depart,
            lat_arrivee=lat_arrivee,
            lon_arrivee=lon_arrivee
        )
        return redirect('page_principale')
    return render(request, 'creer_demande.html')


@login_required
def reserver_trajet(request, offre_id):
    offre = get_object_or_404(OffreCovoiturage, id=offre_id)
    if request.method == 'POST':
        nombre_places = int(request.POST.get('nombre_places', 1))
        
        if nombre_places > offre.places_disponibles:
            messages.error(request, "Il n'y a pas assez de places disponibles.")
            return redirect('page_principale')
        
        reservation = ReservationCovoiturage.objects.create(
            offre=offre,
            passager=request.user,
            nombre_places=nombre_places
        )
        
        offre.places_disponibles -= nombre_places
        offre.save()
        
        messages.success(request, "Réservation effectuée avec succès.")
        return redirect('page_principale')
    
    return render(request, 'reserver_trajet.html', {'offre': offre})


@login_required
def gerer_reservation(request, reservation_id):
    reservation = get_object_or_404(ReservationCovoiturage, id=reservation_id)
    
    # Vérifier que l'utilisateur est soit le conducteur soit le passager
    if request.user != reservation.offre.conducteur and request.user != reservation.passager:
        messages.error(request, "Vous n'avez pas l'autorisation de gérer cette réservation.")
        return redirect('page_principale')
    
    if request.method == 'POST':
        action = request.POST.get('action')
        if action == 'confirmer' and request.user == reservation.offre.conducteur:
            reservation.statut = 'confirmee'
        elif action == 'annuler':
            reservation.statut = 'annulee'
            # Remettre les places à disposition
            reservation.offre.places_disponibles += reservation.nombre_places
            reservation.offre.save()
        elif action == 'terminer' and request.user == reservation.offre.conducteur:
            reservation.statut = 'terminee'
        
        reservation.save()
        messages.success(request, "Statut de la réservation mis à jour.")
        return redirect('page_principale')
    
    return render(request, 'gerer_reservation.html', {'reservation': reservation})

    
