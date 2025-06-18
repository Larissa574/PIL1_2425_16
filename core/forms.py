from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm, PasswordResetForm, SetPasswordForm
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from .models import Utilisateur

class CustomUserCreationForm(UserCreationForm):
    email = forms.EmailField(required=True)
    phone = forms.CharField(max_length=15, required=True)

    class Meta:
        model = Utilisateur
        fields = ('nom', 'prenom', 'email', 'phone', 'password1', 'password2')

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if Utilisateur.objects.filter(email=email).exists():
            raise forms.ValidationError(_("Email already exists."))
        return email

    def clean_phone(self):
        phone = self.cleaned_data.get('phone')
        if Utilisateur.objects.filter(phone=phone).exists():
            raise forms.ValidationError(_("Phone number already exists."))
        return phone

class CustomAuthenticationForm(AuthenticationForm):
    username = forms.CharField(label=_("Email or Phone"), max_length=254)


class EmailValidationForm(PasswordResetForm):
    email = forms.EmailField(
        widget=forms.EmailInput(attrs={
            'class':'form-control', 
            'placeholder':'Votre email'})
    )
    def clean_email(self):
        email = self.cleaned_data['email']
        if not Utilisateur.objects.filter(email__iexact=email, is_active=True).exists():
            raise ValidationError("Aucun utilisateur n'est enregistré avec cet email.")
        return email


class CodeVerificationForm(forms.Form):
    code = forms.CharField(max_length=6, min_length=6, widget=forms.TextInput(attrs={'autocomplete':'off'}))

class CustomSetPasswordForm(SetPasswordForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['new_password1'].widget.attrs.update({
            'class': 'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
        })
        self.fields['new_password2'].widget.attrs.update({
            'class': 'shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline'
        })
    