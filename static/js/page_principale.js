let roleActuel = 'driver';

// Variables globales pour la messagerie
let chatSocket = null;
let currentRecipientId = null;
let currentRecipientName = null;

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
    mettreAJourTitreMessagerie();
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
    initialiserPageAccueil();
    initialiserBoutonMessagerie();
    mettreAJourTitreMessagerie();
    initialiserMessagerie();
    // Connexion WebSocket avec l'ID de l'utilisateur actuel
    if (typeof currentUserId !== 'undefined') {
        connecterWebSocket(currentUserId);
    }
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

    // Affiche la section accueil par défaut au chargement
    document.querySelectorAll('.section-contenu').forEach(section => {
        section.style.display = 'none';
    });
    const sectionAccueil = document.getElementById('sectionAccueil');
    if (sectionAccueil) {
        sectionAccueil.style.display = 'block';
    }
    // Active le lien accueil
    const lienAccueil = document.querySelector('[data-section=\"sectionAccueil\"]');
    if (lienAccueil) {
        document.querySelectorAll('.element-navigation').forEach(nav => nav.classList.remove('actif'));
        lienAccueil.classList.add('actif');
    }
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

function envoyerProfilAJAX(data, onSuccess, onError) {
    const formData = new FormData();
    for (const key in data) {
        if (data[key] !== undefined && data[key] !== null) {
            formData.append(key, data[key]);
        }
    }
    fetch('/ajax/update_profil/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: formData
    })
    .then(response => response.json())
    .then(json => {
        if (json.success) {
            if (onSuccess) onSuccess(json);
        } else {
            if (onError) onError(json.error);
        }
    })
    .catch(err => { if (onError) onError(err); });
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function activerEditionSectionProfil(sectionId, bouton) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    const spans = section.querySelectorAll('span[data-field]');
    const estEnEdition = bouton.innerHTML.includes('Sauvegarder');
    if (estEnEdition) {
        // Collecte les valeurs modifiées
        let data = {};
        spans.forEach(span => {
            const field = span.getAttribute('data-field');
            if (field === 'nomComplet') {
                // Ajoute deux inputs pour prénom et nom
                const nomComplet = span.textContent.trim().split(' ');
                const prenom = nomComplet.slice(0, -1).join(' ');
                const nom = nomComplet.slice(-1).join(' ');
                span.innerHTML = '';
                const inputPrenom = document.createElement('input');
                inputPrenom.type = 'text';
                inputPrenom.value = prenom;
                inputPrenom.placeholder = 'Prénom';
                inputPrenom.className = 'champ-edition';
                inputPrenom.setAttribute('data-field', 'prenom');
                span.appendChild(inputPrenom);
                const inputNom = document.createElement('input');
                inputNom.type = 'text';
                inputNom.value = nom;
                inputNom.placeholder = 'Nom';
                inputNom.className = 'champ-edition';
                inputNom.setAttribute('data-field', 'nom');
                span.appendChild(inputNom);
            } else if (field === 'email') {
                const input = document.createElement('input');
                input.type = 'email';
                input.value = span.textContent;
                input.className = 'champ-edition';
                input.setAttribute('data-field', 'email');
                span.innerHTML = '';
                span.appendChild(input);
            } else if (field === 'role') {
                const select = span.querySelector('select[data-field="role"]');
                if (select) data['role'] = select.value;
            } else {
                const input = document.createElement('input');
                input.type = 'text';
                input.value = span.textContent;
                input.className = 'champ-edition';
                span.innerHTML = '';
                span.appendChild(input);
            }
        });
        // Ajoute un input file pour la photo si besoin
        const photoDiv = document.querySelector('.conteneur-photo-principale');
        if (photoDiv && !photoDiv.querySelector('input[type="file"][name="photo"]')) {
            const inputPhoto = document.createElement('input');
            inputPhoto.type = 'file';
            inputPhoto.name = 'photo';
            inputPhoto.accept = 'image/*';
            inputPhoto.style.display = 'block';
            photoDiv.appendChild(inputPhoto);
        }
        bouton.innerHTML = '<i class="fas fa-save"></i>Sauvegarder';
        envoyerProfilAJAX(data, function(json) {
            // Met à jour l'affichage avec les nouvelles valeurs
            spans.forEach(span => {
                const field = span.getAttribute('data-field');
                if (field === 'nomComplet') {
                    span.textContent = (json.prenom || '') + ' ' + (json.nom || '');
                } else if (json[field]) {
                    span.textContent = json[field];
                }
            });
            if (json.photo_url) {
                const img1 = document.getElementById('photoProfilPrincipalePassager');
                const img2 = document.getElementById('photoProfilPrincipale');
                const imgSidebar = document.querySelector('.conteneur-photo-profil img');
                if (img1) img1.src = json.photo_url;
                if (img2) img2.src = json.photo_url;
                if (imgSidebar) imgSidebar.src = json.photo_url;
            }
            // Barre latérale (synchronisation robuste)
            const sidebar = document.querySelector('.entete-barre-laterale');
            if (sidebar) {
                const sidebarName = sidebar.querySelector('h3');
                const sidebarEmail = sidebar.querySelectorAll('p')[0];
                const sidebarRole = sidebar.querySelectorAll('p')[1];
                if (sidebarName) sidebarName.textContent = (json.prenom || '') + ' ' + (json.nom || '');
                if (sidebarEmail) sidebarEmail.textContent = json.email || '';
                if (sidebarRole) sidebarRole.textContent = 'Rôle : ' + (json.role || '');
                console.log('Barre latérale synchronisée:', sidebarName.textContent, sidebarEmail.textContent, sidebarRole.textContent);
            }
            // En-tête accueil
            const accueilTitle = document.querySelector('#sectionAccueil h2');
            if (accueilTitle) accueilTitle.textContent = 'Bienvenue ' + (json.prenom || '') + ' ' + (json.nom || '') + ' !';
            bouton.innerHTML = '<i class="fas fa-edit"></i>Modifier mes informations';
            afficherNotification('Profil mis à jour !', 'success');
            setTimeout(() => { window.location.reload(); }, 800);
        }, function(error) {
            alert('Erreur lors de la sauvegarde du profil : ' + error);
            afficherNotification('Erreur lors de la sauvegarde : ' + error, 'error');
        });
    } else {
        // Passe en mode édition (inchangé)
        spans.forEach(span => {
            const texteActuel = span.textContent;
            const field = span.getAttribute('data-field');
            const input = document.createElement('input');
            input.type = (field === 'email') ? 'email' : 'text';
            input.value = texteActuel;
            span.innerHTML = '';
            span.appendChild(input);
        });
        // Ajoute un input file pour la photo si besoin
        const photoDiv = document.querySelector('.conteneur-photo-principale');
        if (photoDiv && !photoDiv.querySelector('input[type="file"][name="photo"]')) {
            const inputPhoto = document.createElement('input');
            inputPhoto.type = 'file';
            inputPhoto.name = 'photo';
            inputPhoto.accept = 'image/*';
            inputPhoto.style.display = 'block';
            photoDiv.appendChild(inputPhoto);
        }
        bouton.innerHTML = '<i class="fas fa-save"></i>Sauvegarder';
    }
}

function initialiserPageAccueil() {
    const boutonPublierOffre = document.getElementById('boutonPublierOffre');
    const boutonLancerRecherche = document.getElementById('boutonLancerRecherche');
    const statutBarre = document.getElementById('statutBarreAffiche');
    const texteBienvenue = document.getElementById('texteBienvenueAccueil');

    // Fonction pour mettre à jour l'affichage des boutons et du texte
    function mettreAJourBoutonsAccueil() {
        const estConducteur = statutBarre.textContent.includes('Conducteur');
        if (estConducteur) {
            boutonPublierOffre.style.display = 'flex';
            boutonLancerRecherche.style.display = 'none';
            texteBienvenue.textContent = "Commencez à utiliser la plateforme en publiant une offre de covoiturage.";
        } else {
            boutonPublierOffre.style.display = 'none';
            boutonLancerRecherche.style.display = 'flex';
            texteBienvenue.textContent = "Commencez à utiliser la plateforme en recherchant un trajet disponible.";
        }
    }

    // Mettre à jour l'affichage initial
    mettreAJourBoutonsAccueil();

    // Ajouter les écouteurs d'événements pour les boutons
    boutonPublierOffre.addEventListener('click', () => {
        // Basculer vers le tableau de bord
        const lienTableauBord = document.querySelector('[data-section="sectionTableauBord"]');
        if (lienTableauBord) {
            lienTableauBord.click();
            // S'assurer que le mode conducteur est actif
            basculerRole('driver');
        }
    });

    boutonLancerRecherche.addEventListener('click', () => {
        // Basculer vers le tableau de bord
        const lienTableauBord = document.querySelector('[data-section="sectionTableauBord"]');
        if (lienTableauBord) {
            lienTableauBord.click();
            // S'assurer que le mode passager est actif
            basculerRole('passenger');
        }
    });

    // Observer les changements de statut
    const observer = new MutationObserver(mettreAJourBoutonsAccueil);
    observer.observe(statutBarre, { childList: true, subtree: true });
}

function initialiserBoutonMessagerie() {
    const boutonMessagerie = document.getElementById('boutonMessagerieFlottant');
    
    // Fonction pour vérifier si on est dans la section messagerie
    function verifierSectionMessagerie() {
        const sectionMessagerie = document.getElementById('sectionMessagerie');
        if (sectionMessagerie && window.getComputedStyle(sectionMessagerie).display !== 'none') {
            boutonMessagerie.classList.add('masque');
        } else {
            boutonMessagerie.classList.remove('masque');
        }
    }

    // Ajouter le click listener
    boutonMessagerie.addEventListener('click', () => {
        document.querySelector('[data-section="sectionMessagerie"]').click();
    });

    // Observer les changements de section
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.classList.contains('section-contenu')) {
                verifierSectionMessagerie();
            }
        });
    });

    // Observer toutes les sections
    document.querySelectorAll('.section-contenu').forEach(section => {
        observer.observe(section, { attributes: true, attributeFilter: ['style'] });
    });

    // Vérification initiale
    verifierSectionMessagerie();
}

function mettreAJourTitreMessagerie() {
    const titre = document.getElementById('messagerieTitreDynamique');
    if (!titre) return;
    if (roleActuel === 'driver') {
        titre.textContent = 'Rester en contact avec vos clients';
    } else {
        titre.textContent = 'Rester en contact avec vos conducteurs';
    }
}

function initialiserMessagerie() {
    const formChat = document.getElementById('formChat');
    const inputMessage = document.getElementById('inputMessage');
    const chatMessages = document.getElementById('chatMessages');
    const listeConversations = document.getElementById('listeConversations');
    const nomChat = document.querySelector('.nom-chat');
    const avatarChat = document.querySelector('.avatar-chat');

    // Charger dynamiquement la liste des utilisateurs
    fetch('/messagerie/api/users/')
        .then(response => response.json())
        .then(data => {
            if (listeConversations) {
                listeConversations.innerHTML = '';
                if (data.users.length === 0) {
                    listeConversations.innerHTML = '<li style="padding:2rem;color:#888;text-align:center;">Aucun autre utilisateur</li>';
                } else {
                    data.users.forEach(user => {
                        const li = document.createElement('li');
                        li.className = 'conversation';
                        li.dataset.userId = user.id;
                        li.innerHTML = `
                            <div style="display:flex;align-items:center;gap:1rem;width:100%">
                                <img src="${user.avatar}" class="avatar-conv" alt="Avatar" style="border-radius:50%;width:48px;height:48px;object-fit:cover;box-shadow:0 2px 8px #4facfe22;">
                                <div class="infos-conv" style="flex:1;display:flex;flex-direction:column;gap:0.2rem;">
                                    <span class="nom-conv" style="font-weight:700;color:#222;font-size:1.12rem;line-height:1.2;">${user.username}</span>
                                </div>
                            </div>`;
                        listeConversations.appendChild(li);
                    });
                }
            }
        });

    // Sélection de conversation
    if (listeConversations) {
        listeConversations.addEventListener('click', function(e) {
            const conversation = e.target.closest('.conversation');
            if (conversation) {
                // Effet actif
                document.querySelectorAll('.conversation').forEach(c => c.classList.remove('active'));
                conversation.classList.add('active');
                // Charger la conversation
                const userId = conversation.dataset.userId;
                const userName = conversation.querySelector('.nom-conv').textContent;
                const avatarUrl = conversation.querySelector('.avatar-conv').src;
                chargerConversation(userId, userName, avatarUrl);
            }
        });
    }

    // Gestion de l'envoi de message
    if (formChat && inputMessage && chatMessages) {
        formChat.addEventListener('submit', function(e) {
            e.preventDefault();
            const message = inputMessage.value.trim();
            if (message && currentRecipientId) {
                envoyerMessage(message);
                inputMessage.value = '';
            } else if (!currentRecipientId) {
                afficherNotification('Sélectionnez une conversation avant d\'envoyer un message.', 'info');
            }
        });
    }

    // Affichage d'accueil si aucune conversation sélectionnée
    afficherAccueilMessagerie();
}

function afficherAccueilMessagerie() {
    const chatMessages = document.getElementById('chatMessages');
    const nomChat = document.querySelector('.nom-chat');
    const avatarChat = document.querySelector('.avatar-chat');
    if (chatMessages) {
        chatMessages.innerHTML = '<div style="color:#888;text-align:center;margin-top:4rem;font-size:1.1rem;">Sélectionnez une conversation pour commencer à discuter.</div>';
    }
    if (nomChat) nomChat.textContent = "";
    if (avatarChat) avatarChat.src = '../../static/css/images/defaut_profile.png';
}

function chargerConversation(userId, userName, avatarUrl) {
    currentRecipientId = parseInt(userId);
    currentRecipientName = userName;
    // Mettre à jour l'interface
    const chatMessages = document.getElementById('chatMessages');
    const nomChat = document.querySelector('.nom-chat');
    const avatarChat = document.querySelector('.avatar-chat');
    if (chatMessages && nomChat && avatarChat) {
        chatMessages.innerHTML = '<div style="color:#888;text-align:center;margin-top:2rem;">Chargement...</div>';
        nomChat.textContent = userName;
        avatarChat.src = avatarUrl;
    }
    // Charger l'historique des messages
    chargerHistoriqueMessages(userId);
}

function chargerHistoriqueMessages(userId) {
    fetch(`/messagerie/api/messages/${userId}/`)
        .then(response => response.json())
        .then(data => {
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages) {
                chatMessages.innerHTML = '';
                if (data.messages.length === 0) {
                    chatMessages.innerHTML = '<div style="color:#aaa;text-align:center;margin-top:2rem;">Aucun message pour le moment.</div>';
                } else {
                    data.messages.forEach(msg => {
                        const estMoi = msg.expediteur_id === currentUserId;
                        afficherMessage(msg.contenu, msg.expediteur_username, estMoi);
                    });
                }
            }
        })
        .catch(error => {
            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages) chatMessages.innerHTML = '<div style="color:#e74c3c;text-align:center;margin-top:2rem;">Erreur lors du chargement des messages.</div>';
        });
}

function connecterWebSocket(userId) {
    if (chatSocket) {
        chatSocket.close();
    }
    const wsScheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsPath = `${wsScheme}://${window.location.host}/ws/chat/${userId}/`;
    chatSocket = new WebSocket(wsPath);
    chatSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        // Afficher le message uniquement si on est sur la bonne conversation
        if (parseInt(currentRecipientId) === data.expediteur_id || data.expediteur === currentUsername) {
            afficherMessage(data.message, data.expediteur, data.expediteur === currentUsername);
        }
    };
    chatSocket.onclose = function(e) {
        console.error('Chat socket closed unexpectedly');
    };
}

function envoyerMessage(message) {
    if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
        const data = {
            'message': message,
            'recipient_id': currentRecipientId
        };
        chatSocket.send(JSON.stringify(data));
        afficherMessage(message, currentUsername, true);
    }
}

function afficherMessage(message, expediteur, estMoi = false) {
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${estMoi ? 'message-moi' : 'message-autre'}`;
    const contenuDiv = document.createElement('div');
    contenuDiv.className = 'contenu-message';
    if (!estMoi) {
        const nomExpediteur = document.createElement('div');
        nomExpediteur.className = 'nom-expediteur';
        nomExpediteur.textContent = expediteur;
        contenuDiv.appendChild(nomExpediteur);
    }
    const texteMessage = document.createElement('div');
    texteMessage.className = 'texte-message';
    texteMessage.textContent = message;
    contenuDiv.appendChild(texteMessage);
    messageDiv.appendChild(contenuDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
