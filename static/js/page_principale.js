let roleActuel = 'driver';

function basculerRole(role) {
    roleActuel = role;
    
    document.querySelectorAll('.bouton-role').forEach(btn => {
        btn.classList.remove('actif');
    });
    
    const boutonActif = document.querySelector(`[data-role="${role}"]`);
    if (boutonActif) {
        boutonActif.classList.add('actif');
    }
    
    const titreTablleauBord = document.getElementById('titreTablleauBord');
    const sousTitreTablleauBord = document.getElementById('sousTitreTablleauBord');
    const titreProfilRole = document.getElementById('titreProfilRole');
    const sousTitreProfilRole = document.getElementById('sousTitreProfilRole');
    
    if (titreTablleauBord && sousTitreTablleauBord) {
        if (role === 'driver') {
            titreTablleauBord.textContent = 'Tableau de bord conducteur';
            sousTitreTablleauBord.textContent = 'Gérez vos offres et trouvez des passagers';
        } else {
            titreTablleauBord.textContent = 'Tableau de bord passager';
            sousTitreTablleauBord.textContent = 'Trouvez des trajets et gérez vos demandes';
        }
    }
    
    if (titreProfilRole && sousTitreProfilRole) {
        if (role === 'driver') {
            titreProfilRole.textContent = 'Profil Conducteur';
            sousTitreProfilRole.textContent = 'Gérez vos informations de conducteur';
        } else {
            titreProfilRole.textContent = 'Profil Passager';
            sousTitreProfilRole.textContent = 'Gérez vos informations de passager';
        }
    }
    
    const interfaceConducteur = document.getElementById('interfaceConducteur');
    const interfacePassager = document.getElementById('interfacePassager');
    const profilConducteurSection = document.getElementById('profilConducteurSection');
    const profilPassagerSection = document.getElementById('profilPassagerSection');
    
    if (interfaceConducteur && interfacePassager) {
        if (role === 'driver') {
            interfaceConducteur.style.display = 'grid';
            interfacePassager.style.display = 'none';
        } else {
            interfaceConducteur.style.display = 'none';
            interfacePassager.style.display = 'grid';
        }
    }
    
    if (profilConducteurSection && profilPassagerSection) {
        if (role === 'driver') {
            profilConducteurSection.style.display = 'block';
            profilPassagerSection.style.display = 'none';
        } else {
            profilConducteurSection.style.display = 'none';
            profilPassagerSection.style.display = 'block';
        }
    }
    
    document.querySelectorAll('.badge-carte').forEach(badge => {
        if (role === 'driver') {
            badge.classList.remove('passager');
        } else {
            badge.classList.add('passager');
        }
    });
    
    document.querySelectorAll('form').forEach(form => form.reset());
    
    const profilStatutConducteur = document.querySelectorAll('#profilStatutConducteur');
    const profilStatutPassager = document.querySelectorAll('#profilStatutPassager');
    if (role === 'driver') {
        profilStatutConducteur.forEach(b => b.classList.add('actif'));
        profilStatutPassager.forEach(b => b.classList.remove('actif'));
    } else {
        profilStatutConducteur.forEach(b => b.classList.remove('actif'));
        profilStatutPassager.forEach(b => b.classList.add('actif'));
    }
    
    // Synchronise l'affichage du statut dans la barre du haut
    const statutBarre = document.getElementById('statutBarreAffiche');
    const texteStatutBarre = document.getElementById('texteStatutBarre');
    const iconeStatutBarre = document.getElementById('iconeStatutBarre');
    if (statutBarre && texteStatutBarre && iconeStatutBarre) {
        if (role === 'driver') {
            texteStatutBarre.textContent = 'Conducteur';
            iconeStatutBarre.className = 'fas fa-car';
        } else {
            texteStatutBarre.textContent = 'Passager';
            iconeStatutBarre.className = 'fas fa-user';
        }
    }
}

function afficherMenuProfil() {
    const menu = document.getElementById('menuDeroulantProfil');
    if (menu) {
        menu.classList.toggle('show');
    }
}

document.addEventListener('click', function(event) {
    const sectionProfil = document.querySelector('.section-profil');
    const menu = document.getElementById('menuDeroulantProfil');
    
    if (sectionProfil && menu && !sectionProfil.contains(event.target)) {
        menu.classList.remove('show');
    }
});

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const boutonRoles = document.querySelectorAll('.bouton-role');
        boutonRoles.forEach((btn) => {
            btn.removeEventListener('click', gererClicRole);
            btn.addEventListener('click', gererClicRole);
        });
        // Gestion des boutons de statut pour les deux profils
        const profilStatutConducteur = document.querySelectorAll('#profilStatutConducteur');
        const profilStatutPassager = document.querySelectorAll('#profilStatutPassager');
        profilStatutConducteur.forEach(btn => {
            btn.style.display = 'inline-flex';
            btn.addEventListener('click', function() {
                if (!this.classList.contains('actif')) {
                    profilStatutConducteur.forEach(b => b.classList.add('actif'));
                    profilStatutPassager.forEach(b => b.classList.remove('actif'));
                    basculerRole('driver');
                }
            });
        });
        profilStatutPassager.forEach(btn => {
            btn.style.display = 'inline-flex';
            btn.addEventListener('click', function() {
                if (!this.classList.contains('actif')) {
                    profilStatutPassager.forEach(b => b.classList.add('actif'));
                    profilStatutConducteur.forEach(b => b.classList.remove('actif'));
                    basculerRole('passenger');
                }
            });
        });
        // Gestion du bouton de déconnexion
        const boutonDeconnexion = document.getElementById('boutonDeconnexion');
        if (boutonDeconnexion) {
            boutonDeconnexion.addEventListener('click', function() {
                window.location.href = 'deconnexion.html';
            });
        }
    }, 200);
    
    initialiserFormulaires();
    initialiserNavigation();
    initialiserEditionProfil();
    preremplirDates();
});

function gererClicRole(event) {
    const role = event.currentTarget.getAttribute('data-role');
    basculerRole(role);
}

function initialiserFormulaires() {
    const boutonOffre = document.querySelector('#interfaceConducteur .bouton-carte');
    if (boutonOffre && boutonOffre.textContent.includes('Publier')) {
        boutonOffre.addEventListener('click', function(e) {
            e.preventDefault();
            afficherNotification('Offre publiée !', 'success');
        });
    }
    
    const boutonRecherche = document.querySelector('#interfacePassager .bouton-carte');
    if (boutonRecherche && boutonRecherche.textContent.includes('Rechercher')) {
        boutonRecherche.addEventListener('click', function(e) {
    e.preventDefault();
            afficherNotification('Recherche effectuée !', 'success');
        });
    }
    
    document.querySelectorAll('.bouton-accepter').forEach(btn => {
        btn.addEventListener('click', function() {
            afficherNotification('Demande acceptée !', 'success');
            this.closest('.element-demande').remove();
        });
    });
    
    document.querySelectorAll('.bouton-refuser').forEach(btn => {
        btn.addEventListener('click', function() {
            afficherNotification('Demande refusée.', 'info');
            this.closest('.element-demande').remove();
        });
    });
    
    document.querySelectorAll('.bouton-demander').forEach(btn => {
        btn.addEventListener('click', function() {
            afficherNotification('Demande envoyée !', 'success');
            this.textContent = 'Demandé';
            this.disabled = true;
        });
    });
}

function initialiserNavigation() {
    document.querySelectorAll('.element-navigation').forEach(element => {
        element.addEventListener('click', function(e) {
            e.preventDefault();
            
            const sectionCible = this.getAttribute('data-section');
            
            document.querySelectorAll('.element-navigation').forEach(nav => nav.classList.remove('actif'));
            this.classList.add('actif');
            
            document.querySelectorAll('.section-contenu').forEach(section => {
                section.style.display = 'none';
            });
            
            const sectionAAfficher = document.getElementById(sectionCible);
            if (sectionAAfficher) {
                sectionAAfficher.style.display = 'block';
            }
        });
    });
}

function afficherNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        z-index: 3000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        ${type === 'success' ? 'background: linear-gradient(135deg, #43e97b, #38f9d7);' : ''}
        ${type === 'error' ? 'background: linear-gradient(135deg, #ff6b6b, #ee5a24);' : ''}
        ${type === 'info' ? 'background: linear-gradient(135deg, #4facfe, #00f2fe);' : ''}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function initialiserEditionProfil() {
    const boutonModifierProfilComplet = document.getElementById('boutonModifierProfilComplet');
    const boutonModifierProfilCompletPassager = document.getElementById('boutonModifierProfilCompletPassager');
    const boutonModifierProfil = document.getElementById('boutonModifierProfil');
    const boutonModifierVehicule = document.getElementById('boutonModifierVehicule');
    const boutonModifierProfilPassager = document.getElementById('boutonModifierProfilPassager');
    const boutonModifierProfilConducteurProfil = document.getElementById('boutonModifierProfilConducteurProfil');
    const boutonModifierVehiculeProfil = document.getElementById('boutonModifierVehiculeProfil');
    const boutonModifierProfilPassagerProfil = document.getElementById('boutonModifierProfilPassagerProfil');
    const boutonModifierPreferences = document.getElementById('boutonModifierPreferences');
    
    if (boutonModifierProfilComplet) {
        boutonModifierProfilComplet.addEventListener('click', function() {
            activerEditionSectionProfil('infosUtilisateurComplet', this);
        });
    }
    if (boutonModifierProfilCompletPassager) {
        boutonModifierProfilCompletPassager.addEventListener('click', function() {
            activerEditionSectionProfil('infosUtilisateurCompletPassager', this);
        });
    }
    
    if (boutonModifierProfil) {
        boutonModifierProfil.addEventListener('click', function() {
            activerEditionSection('infosProfilConducteur', this);
        });
    }
    
    if (boutonModifierVehicule) {
        boutonModifierVehicule.addEventListener('click', function() {
            activerEditionSection('infosVehicule', this);
        });
    }
    
    if (boutonModifierProfilPassager) {
        boutonModifierProfilPassager.addEventListener('click', function() {
            activerEditionSection('infosProfilPassager', this);
        });
    }
    
    if (boutonModifierProfilConducteurProfil) {
        boutonModifierProfilConducteurProfil.addEventListener('click', function() {
            activerEditionSection('infosProfilConducteurProfil', this);
        });
    }
    
    if (boutonModifierVehiculeProfil) {
        boutonModifierVehiculeProfil.addEventListener('click', function() {
            activerEditionSection('infosVehiculeProfil', this);
        });
    }
    
    if (boutonModifierProfilPassagerProfil) {
        boutonModifierProfilPassagerProfil.addEventListener('click', function() {
            activerEditionSection('infosProfilPassagerProfil', this);
        });
    }
    
    if (boutonModifierPreferences) {
        boutonModifierPreferences.addEventListener('click', function() {
            activerEditionSectionProfil('infosPreferences', this);
        });
    }
    
    const boutonModifierPhoto = document.querySelector('.bouton-modifier-photo');
    const conteneurPhoto = document.querySelector('.conteneur-photo-principale');
    
    if (boutonModifierPhoto) {
        boutonModifierPhoto.addEventListener('click', function() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.style.display = 'none';
            
            input.addEventListener('change', function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const photoProfilPrincipale = document.getElementById('photoProfilPrincipale');
                        if (photoProfilPrincipale) {
                            photoProfilPrincipale.src = e.target.result;
                            afficherNotification('Photo de profil mise à jour !', 'success');
                        }
                    };
                    reader.readAsDataURL(file);
                }
            });
            
            document.body.appendChild(input);
            input.click();
            document.body.removeChild(input);
        });
    }
    
    if (conteneurPhoto) {
        conteneurPhoto.addEventListener('click', function() {
            if (boutonModifierPhoto) {
                boutonModifierPhoto.click();
            }
        });
    }
}

function preremplirDates() {
    const dateAujourdhui = new Date().toISOString().split('T')[0];
    
    const champsDate = document.querySelectorAll('input[type="date"]');
    champsDate.forEach(champ => {
        if (!champ.value) {
            champ.value = dateAujourdhui;
        }
    });
}

function activerEditionSection(sectionId, bouton) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    
    const spans = section.querySelectorAll('span[data-field]');
    const estEnEdition = bouton.innerHTML.includes('Sauvegarder');
    
    if (estEnEdition) {
        spans.forEach(span => {
            const field = span.getAttribute('data-field');
            if (field === 'horaire') {
                if (sectionId === 'infosProfilPassager') {
                    const input = span.querySelector('input');
                    if (input) {
                        const heure = input.value.replace(':', 'h');
                        span.textContent = heure;
                    }
                } else {
                    const inputs = span.querySelectorAll('input[type="time"]');
                    if (inputs.length === 2) {
                        const heureDebut = inputs[0].value.replace(':', 'h');
                        const heureFin = inputs[1].value.replace(':', 'h');
                        span.textContent = `${heureDebut} - ${heureFin}`;
                    } else {
                        const input = span.querySelector('input');
                        if (input) {
                            span.textContent = input.value;
                        }
                    }
                }
            } else {
                const input = span.querySelector('input');
                if (input) {
                    span.textContent = input.value;
                }
            }
        });
        
        bouton.innerHTML = '<i class="fas fa-edit"></i>' + 
            (sectionId === 'infosVehicule' ? 'Modifier le véhicule' : 'Modifier mes infos');
        
        afficherNotification('Informations sauvegardées !', 'success');
    } else {
        spans.forEach(span => {
            const texteActuel = span.textContent;
            const field = span.getAttribute('data-field');
            const input = document.createElement('input');
            
            if (field === 'horaire') {
                if (sectionId === 'infosProfilPassager') {
                    input.type = 'time';
                    input.value = texteActuel.includes('h') ? texteActuel.replace('h', ':') : '08:00';
                } else {
                    const heures = texteActuel.match(/(\d{2}h\d{2})/g);
                    if (heures && heures.length >= 2) {
                        const labelDebut = document.createElement('span');
                        labelDebut.textContent = 'Début: ';
                        labelDebut.style.marginRight = '5px';
                        
                        const inputDebut = document.createElement('input');
                        inputDebut.type = 'time';
                        inputDebut.value = heures[0].replace('h', ':');
                        inputDebut.className = 'champ-edition';
                        inputDebut.style.cssText = `
                            background: #f8f9fa;
                            border: 1px solid #4facfe;
                            border-radius: 4px;
                            padding: 0.25rem 0.5rem;
                            font-size: 0.9rem;
                            width: 80px;
                            display: inline-block;
                            margin-right: 15px;
                        `;
                        
                        const labelFin = document.createElement('span');
                        labelFin.textContent = 'Fin: ';
                        labelFin.style.marginRight = '5px';
                        
                        const inputFin = document.createElement('input');
                        inputFin.type = 'time';
                        inputFin.value = heures[1].replace('h', ':');
                        inputFin.className = 'champ-edition';
                        inputFin.style.cssText = `
                            background: #f8f9fa;
                            border: 1px solid #4facfe;
                            border-radius: 4px;
                            padding: 0.25rem 0.5rem;
                            font-size: 0.9rem;
                            width: 80px;
                            display: inline-block;
                        `;
                        
                        span.innerHTML = '';
                        span.appendChild(labelDebut);
                        span.appendChild(inputDebut);
                        span.appendChild(labelFin);
                        span.appendChild(inputFin);
                        return;
                    }
                    input.type = 'text';
                    input.value = texteActuel;
                }
            } else if (field === 'telephone') {
                input.type = 'tel';
                input.value = texteActuel;
            } else {
                input.type = 'text';
                input.value = texteActuel;
            }
            
            input.className = 'champ-edition';
            input.style.cssText = `
                background: #f8f9fa;
                border: 1px solid #4facfe;
                border-radius: 4px;
                padding: 0.25rem 0.5rem;
                font-size: 0.9rem;
                width: 100%;
            `;
            
            span.innerHTML = '';
            span.appendChild(input);
        });
        
        bouton.innerHTML = '<i class="fas fa-save"></i>Sauvegarder';
    }
}

function activerEditionSectionProfil(sectionId, bouton) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    // On sélectionne uniquement les spans .valeur-info pour ne pas toucher à la ligne Statut
    const spans = section.querySelectorAll('.valeur-info[data-field]');
    const estEnEdition = bouton.innerHTML.includes('Sauvegarder');
    
    if (estEnEdition) {
        spans.forEach(span => {
            const field = span.getAttribute('data-field');
            if (!field) return;
            
            if (field === 'rolePrincipal' || field === 'musique' || field === 'fumeur') {
                const select = span.querySelector('select');
                if (select) {
                    span.textContent = select.value;
                }
            } else if (field === 'dateNaissance') {
                const input = span.querySelector('input[type="date"]');
                if (input) {
                    const date = new Date(input.value);
                    span.textContent = date.toLocaleDateString('fr-FR');
                }
            } else if (field === 'horaireHabituel') {
                const input = span.querySelector('input[type="time"]');
                if (input) {
                    span.textContent = input.value.replace(':', 'h');
                }
            } else if (field === 'email') {
                const input = span.querySelector('input[type="email"]');
                if (input) {
                    span.textContent = input.value;
                }
            } else if (field === 'telephone') {
                const input = span.querySelector('input[type="tel"]');
                if (input) {
                    span.textContent = input.value;
                }
            } else {
                const input = span.querySelector('input');
                if (input) {
                    span.textContent = input.value;
                }
            }
        });
        
        bouton.innerHTML = '<i class="fas fa-edit"></i>Modifier';
        if (sectionId === 'infosUtilisateurComplet') {
            bouton.innerHTML += ' mes informations';
        } else if (sectionId === 'infosPreferences') {
            bouton.innerHTML += ' les préférences';
        } else if (sectionId === 'infosVehiculeProfile') {
            bouton.innerHTML += ' le véhicule';
        }
        
        afficherNotification('Informations sauvegardées !', 'success');
    } else {
        spans.forEach(span => {
            const texteActuel = span.textContent;
            const field = span.getAttribute('data-field');
            if (!field) return;
            
            if (field === 'rolePrincipal') {
                const select = document.createElement('select');
                select.className = 'champ-edition-profil';
                select.innerHTML = `
                    <option value="Conducteur" ${texteActuel === 'Conducteur' ? 'selected' : ''}>Conducteur</option>
                    <option value="Passager" ${texteActuel === 'Passager' ? 'selected' : ''}>Passager</option>
                    <option value="Les deux" ${texteActuel === 'Les deux' ? 'selected' : ''}>Les deux</option>
                `;
                span.innerHTML = '';
                span.appendChild(select);
            } else if (field === 'musique') {
                const select = document.createElement('select');
                select.className = 'champ-edition-profil';
                select.innerHTML = `
                    <option value="Autorisée" ${texteActuel === 'Autorisée' ? 'selected' : ''}>Autorisée</option>
                    <option value="Non autorisée" ${texteActuel === 'Non autorisée' ? 'selected' : ''}>Non autorisée</option>
                    <option value="Selon les passagers" ${texteActuel === 'Selon les passagers' ? 'selected' : ''}>Selon les passagers</option>
                `;
                span.innerHTML = '';
                span.appendChild(select);
            } else if (field === 'fumeur') {
                const select = document.createElement('select');
                select.className = 'champ-edition-profil';
                select.innerHTML = `
                    <option value="Non" ${texteActuel === 'Non' ? 'selected' : ''}>Non</option>
                    <option value="Oui" ${texteActuel === 'Oui' ? 'selected' : ''}>Oui</option>
                `;
                span.innerHTML = '';
                span.appendChild(select);
            } else if (field === 'dateNaissance') {
                const input = document.createElement('input');
                input.type = 'date';
                input.className = 'champ-edition-profil';
                const dateParts = texteActuel.split('/');
                if (dateParts.length === 3) {
                    input.value = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
                }
                span.innerHTML = '';
                span.appendChild(input);
            } else if (field === 'horaireHabituel') {
                const input = document.createElement('input');
                input.type = 'time';
                input.className = 'champ-edition-profil';
                input.value = texteActuel.includes('h') ? texteActuel.replace('h', ':') : texteActuel;
                span.innerHTML = '';
                span.appendChild(input);
            } else if (field === 'email') {
                const input = document.createElement('input');
                input.type = 'email';
                input.className = 'champ-edition-profil';
                input.value = texteActuel;
                span.innerHTML = '';
                span.appendChild(input);
            } else if (field === 'telephone') {
                const input = document.createElement('input');
                input.type = 'tel';
                input.className = 'champ-edition-profil';
                input.value = texteActuel;
                span.innerHTML = '';
                span.appendChild(input);
            } else {
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'champ-edition-profil';
                input.value = texteActuel;
                span.innerHTML = '';
                span.appendChild(input);
            }
        });
        
        bouton.innerHTML = '<i class="fas fa-save"></i>Sauvegarder';
    }
} 