// Le rôle sera initialisé dans DOMContentLoaded
let roleActuel = null;

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
    // Initialiser le rôle actuel à partir de la barre du haut
    const texteStatutBarre = document.getElementById('texteStatutBarre');
    if (texteStatutBarre) {
        const statutAffiche = texteStatutBarre.textContent.toLowerCase();
        roleActuel = statutAffiche === 'conducteur' ? 'driver' : 'passenger';} else {
        roleActuel = 'driver'; // valeur par défaut}
    
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
    initialiserBoutonsStatut();
    initialiserNotifications();
    
    // Synchronisation initiale de l'interface
    synchroniserInterfaceInitiale();
    
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
    const lienAccueil = document.querySelector('[data-section="sectionAccueil\"]');
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
    
    // Initialisation pour la section conducteur
    initialiserGestionPhoto('boutonModifierPhoto', 'inputPhoto', 'actionsPhoto', 'photoProfilPrincipale', 'boutonAppliquerPhoto', 'boutonAnnulerPhoto');
    
    // Initialisation pour la section passager
    initialiserGestionPhoto('boutonModifierPhotoPassager', 'inputPhotoPassager', 'actionsPhotoPassager', 'photoProfilPrincipalePassager', 'boutonAppliquerPhotoPassager', 'boutonAnnulerPhotoPassager');
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
        // Mode SAUVEGARDE - Collecte les valeurs et envoie au backend
        let data = {};
        
        spans.forEach(span => {
            const field = span.getAttribute('data-field');
            
            if (field === 'horaire') {
                // Gestion spéciale pour les horaires avec début et fin
                const inputs = span.querySelectorAll('input[type="time"]');
                if (inputs.length >= 2) {
                    data['horaire_debut'] = inputs[0].value;
                    data['horaire_fin'] = inputs[1].value;
                } else if (inputs.length === 1) {
                    // Pour la section passager (une seule heure)
                    data['heure_depart_habituel'] = inputs[0].value;
                }
            } else if (field === 'depart') {
                    const input = span.querySelector('input');
                if (input) data['depart'] = input.value;
            } else if (field === 'marque_modele') {
                // Gestion spéciale pour marque et modèle combinés
                const inputs = span.querySelectorAll('input');
                if (inputs.length >= 2) {
                    data['vehicule_marque'] = inputs[0].value;
                    data['vehicule_modele'] = inputs[1].value;
                }
            } else if (field === 'couleur') {
                const input = span.querySelector('input');
                if (input) data['vehicule_couleur'] = input.value;
            } else if (field === 'places') {
                const input = span.querySelector('input, select');
                if (input) data['vehicule_places'] = input.value;
                } else {
                // Autres champs standards
                        const input = span.querySelector('input');
                        if (input) {
                    data[field] = input.value;
                }
            }
        });// Envoie les données au backend
        envoyerProfilAJAX(data, function(json) {// Met à jour l'affichage avec les nouvelles valeurs
            spans.forEach(span => {
                const field = span.getAttribute('data-field');
                
                if (field === 'horaire') {
                    if (sectionId.includes('Passager')) {
                        // Pour passager : une seule heure
                        const heure = json.heure_depart_habituel || 'Non renseigné';
                        span.textContent = heure;
            } else {
                        // Pour conducteur : horaire début - fin
                        if (json.horaire_debut && json.horaire_fin) {
                            span.textContent = `${json.horaire_debut} - ${json.horaire_fin}`;
                        } else {
                            span.textContent = 'Non renseigné';
                        }
                    }
                } else if (field === 'depart') {
                    span.textContent = json.depart_habituel || 'Non renseigné';
                } else if (field === 'marque_modele') {
                    const marque = json.vehicule_marque || 'Marque de voiture';
                    const modele = json.vehicule_modele || 'Modèle de voiture';
                    span.textContent = `${marque} ${modele}`;
                } else if (field === 'couleur') {
                    span.textContent = json.vehicule_couleur || 'Couleur du véhicule';
                } else if (field === 'places') {
                    span.textContent = json.vehicule_places || '4';
                } else if (field === 'vehicule') {
                    // Mise à jour du véhicule complet
                    const marque = json.vehicule_marque || 'Marque de voiture';
                    const modele = json.vehicule_modele || 'Modèle de voiture';
                    const places = json.vehicule_places || '4';
                    span.textContent = `${marque} ${modele} (${places} places)`;
            }
        });
        
        bouton.innerHTML = '<i class="fas fa-edit"></i>' + 
                (sectionId === 'infosVehiculeProfil' ? 'Modifier le véhicule' : 'Modifier mes infos');
        
        afficherNotification('Informations sauvegardées !', 'success');
            
        }, function(error) {afficherNotification('Erreur lors de la sauvegarde : ' + error, 'error');
        });

    } else {
        // Mode ÉDITION - Convertit les spans en inputs avec sélecteurs automatiques
        spans.forEach(span => {
            const texteActuel = span.textContent;
            const field = span.getAttribute('data-field');
            
            if (field === 'horaire') {
                if (sectionId.includes('Passager')) {
                    // Pour passager : un seul sélecteur d'heure
                    const input = document.createElement('input');
                    input.type = 'time';
                    input.value = texteActuel !== 'Non renseigné' ? texteActuel.replace('h', ':') : '08:00';
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
                } else {
                    // Pour conducteur : deux sélecteurs (début et fin)
                    const heures = texteActuel.match(/(\d{2}:\d{2})/g);
                    
                        const labelDebut = document.createElement('span');
                        labelDebut.textContent = 'Début: ';
                        labelDebut.style.marginRight = '5px';
                        
                        const inputDebut = document.createElement('input');
                        inputDebut.type = 'time';
                    inputDebut.value = heures && heures[0] ? heures[0] : '08:00';
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
                    inputFin.value = heures && heures[1] ? heures[1] : '17:00';
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
                }
            } else if (field === 'marque_modele') {
                // Deux inputs pour marque et modèle
                const parts = texteActuel.split(' ');
                const marque = parts[0] || 'Marque de voiture';
                const modele = parts.slice(1).join(' ') || 'Modèle de voiture';
                
                const labelMarque = document.createElement('span');
                labelMarque.textContent = 'Marque: ';
                labelMarque.style.marginRight = '5px';
                
                const inputMarque = document.createElement('input');
                inputMarque.type = 'text';
                inputMarque.value = marque;
                inputMarque.placeholder = 'Marque';
                inputMarque.className = 'champ-edition';
                inputMarque.style.cssText = `
                    background: #f8f9fa;
                    border: 1px solid #4facfe;
                    border-radius: 4px;
                    padding: 0.25rem 0.5rem;
                    font-size: 0.9rem;
                    width: 45%;
                    display: inline-block;
                    margin-right: 10px;
                `;
                
                const labelModele = document.createElement('span');
                labelModele.textContent = 'Modèle: ';
                labelModele.style.marginRight = '5px';
                
                const inputModele = document.createElement('input');
                inputModele.type = 'text';
                inputModele.value = modele;
                inputModele.placeholder = 'Modèle';
                inputModele.className = 'champ-edition';
                inputModele.style.cssText = `
                    background: #f8f9fa;
                    border: 1px solid #4facfe;
                    border-radius: 4px;
                    padding: 0.25rem 0.5rem;
                    font-size: 0.9rem;
                    width: 45%;
                    display: inline-block;
                `;
                
                span.innerHTML = '';
                span.appendChild(labelMarque);
                span.appendChild(inputMarque);
                span.appendChild(document.createElement('br'));
                span.appendChild(labelModele);
                span.appendChild(inputModele);
                
            } else if (field === 'places') {
                // Sélecteur pour le nombre de places
                const select = document.createElement('select');
                select.className = 'champ-edition';
                select.style.cssText = `
                    background: #f8f9fa;
                    border: 1px solid #4facfe;
                    border-radius: 4px;
                    padding: 0.25rem 0.5rem;
                    font-size: 0.9rem;
                    width: 100%;
                `;
                
                for (let i = 1; i <= 8; i++) {
                    const option = document.createElement('option');
                    option.value = i;
                    option.textContent = i + (i === 1 ? ' place' : ' places');
                    if (i == parseInt(texteActuel) || (i === 4 && texteActuel === 'Non renseigné')) {
                        option.selected = true;
                    }
                    select.appendChild(option);
                }
                
                span.innerHTML = '';
                span.appendChild(select);
                
            } else {
                // Input standard pour les autres champs
                const input = document.createElement('input');
                input.type = (field === 'telephone') ? 'tel' : 'text';
                input.value = texteActuel === 'Non renseigné' ? '' : texteActuel;
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
            }
        });
        
        bouton.innerHTML = '<i class="fas fa-save"></i>Sauvegarder';
    }
}

function envoyerProfilAJAX(data, onSuccess, onError) {
    const formData = new FormData();
    
    // Ajoute chaque donnée au FormData
    for (const key in data) {
        if (data[key] !== undefined && data[key] !== null) {
            if (data[key] instanceof File) {
                // Pour les fichiers (photos)
                formData.append(key, data[key]);
            } else {
                // Pour les données texte
            formData.append(key, data[key]);
        }
    }
    }for (let pair of formData.entries()) {}
    
    fetch('/ajax/update_profil/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
            // Ne pas définir Content-Type pour FormData, le navigateur le fait automatiquement
        },
        body: formData
    })
    .then(response => {return response.json();
    })
    .then(json => {if (json.success) {
            if (onSuccess) onSuccess(json);
        } else {
            if (onError) onError(json.error || 'Erreur inconnue');
        }
    })
    .catch(err => {if (onError) onError('Erreur de connexion: ' + err.message); 
    });
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
        // Mode SAUVEGARDE - Collecte les valeurs des inputs et envoie au backend
        let data = {};
        
        spans.forEach(span => {
            const field = span.getAttribute('data-field');
            if (field === 'nomComplet') {
                // Récupère les valeurs des inputs prénom et nom
                const inputPrenom = span.querySelector('input[data-field="prenom"]');
                const inputNom = span.querySelector('input[data-field="nom"]');
                if (inputPrenom) data['prenom'] = inputPrenom.value;
                if (inputNom) data['nom'] = inputNom.value;
            } else if (['email', 'telephone', 'role', 'date_naissance'].includes(field)) {
                // Inclut maintenant date_naissance dans les champs traités
                const input = span.querySelector('input, select');
                if (input) {
                    data[field] = input.value;
                }
            } else if (field === 'departHabituel') {
                // Champ de départ habituel pour les préférences
                const input = span.querySelector('input');
                if (input) data['depart'] = input.value;
            } else if (field === 'horaireHabituel') {
                // Champ d'horaire habituel pour les préférences passager
                const input = span.querySelector('input[type="time"]');
                if (input) data['heure_depart_habituel'] = input.value;
            }
            // Ignore les champs comme 'adresse' qui ne sont pas dans le modèle
        });
        
        // Récupère la photo si elle a été changée
        const photoInput = document.querySelector('input[type="file"][name="photo"]');
        if (photoInput && photoInput.files[0]) {
            data['photo'] = photoInput.files[0];
        }// Envoie les données au backend
        envoyerProfilAJAX(data, function(json) {// Met à jour l'affichage avec les nouvelles valeurs
            spans.forEach(span => {
                const field = span.getAttribute('data-field');
                if (field === 'nomComplet') {
                    span.textContent = (json.prenom || '') + ' ' + (json.nom || '');
                } else if (field === 'dateNaissance') {
                    // Mise à jour spéciale pour la date de naissance
                    span.textContent = json.date_naissance || '--/--/----';
                } else if (field === 'departHabituel') {
                    // Mise à jour pour le départ habituel
                    span.textContent = json.depart_habituel || 'Non renseigné';
                } else if (field === 'horaireHabituel') {
                    // Mise à jour pour l'horaire habituel
                    span.textContent = json.heure_depart_habituel || 'Non renseigné';
                } else if (json[field]) {
                    span.textContent = json[field];
                }
            });

            // Met à jour les photos si changées
            if (json.photo_url) {
                const img1 = document.getElementById('photoProfilPrincipalePassager');
                const img2 = document.getElementById('photoProfilPrincipale');
                const imgSidebar = document.querySelector('.conteneur-photo-profil img');
                if (img1) img1.src = json.photo_url;
                if (img2) img2.src = json.photo_url;
                if (imgSidebar) imgSidebar.src = json.photo_url;
            }

            // Met à jour l'en-tête d'accueil
            const accueilTitle = document.querySelector('#sectionAccueil h2');
            if (accueilTitle) accueilTitle.textContent = 'Bienvenue ' + (json.prenom || '') + ' ' + (json.nom || '') + ' !';

            // Met à jour la barre latérale (nom uniquement car email et rôle ont été supprimés)
            const sidebarName = document.querySelector('.entete-barre-laterale h3');
            if (sidebarName) sidebarName.textContent = (json.prenom || '') + ' ' + (json.nom || '');

            // Supprime l'input photo temporaire
            if (photoInput) photoInput.remove();

            bouton.innerHTML = '<i class="fas fa-edit"></i>Modifier ' + 
                (sectionId === 'infosPreferences' ? 'les préférences' : 'mes informations');
            afficherNotification('Profil mis à jour !', 'success');
            
        }, function(error) {afficherNotification('Erreur lors de la sauvegarde : ' + error, 'error');
        });

    } else {
        // Mode ÉDITION - Convertit les spans en inputs
        spans.forEach(span => {
            const texteActuel = span.textContent.trim();
            const field = span.getAttribute('data-field');
            
            if (field === 'nomComplet') {
                // Sépare prénom et nom
                const parts = texteActuel.split(' ');
                const prenom = parts.slice(0, -1).join(' ') || '';
                const nom = parts.slice(-1).join(' ') || '';
                
                span.innerHTML = '';
                
                const inputPrenom = document.createElement('input');
                inputPrenom.type = 'text';
                inputPrenom.value = prenom;
                inputPrenom.placeholder = 'Prénom';
                inputPrenom.className = 'champ-edition';
                inputPrenom.setAttribute('data-field', 'prenom');
                inputPrenom.style.cssText = `
                    background: #f8f9fa;
                    border: 1px solid #4facfe;
                    border-radius: 4px;
                    padding: 0.5rem;
                    margin-bottom: 0.5rem;
                    width: 100%;
                `;
                
                const inputNom = document.createElement('input');
                inputNom.type = 'text';
                inputNom.value = nom;
                inputNom.placeholder = 'Nom';
                inputNom.className = 'champ-edition';
                inputNom.setAttribute('data-field', 'nom');
                inputNom.style.cssText = `
                    background: #f8f9fa;
                    border: 1px solid #4facfe;
                    border-radius: 4px;
                    padding: 0.5rem;
                    width: 100%;
                `;
                
                span.appendChild(inputPrenom);
                span.appendChild(inputNom);
                
            } else if (field === 'dateNaissance') {
                // Gestion spéciale pour la date de naissance
            const input = document.createElement('input');
                input.type = 'date';
                input.className = 'champ-edition';
                
                // Convertir la date du format d/m/Y vers Y-m-d pour l'input
                if (texteActuel !== '--/--/----' && texteActuel.includes('/')) {
                    const parts = texteActuel.split('/');
                    if (parts.length === 3) {
                        const dateFormatee = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                        input.value = dateFormatee;
                    }
                }
                
                input.style.cssText = `
                    background: #f8f9fa;
                    border: 1px solid #4facfe;
                    border-radius: 4px;
                    padding: 0.5rem;
                    width: 100%;
                `;
                
                span.innerHTML = '';
                span.appendChild(input);
                
            } else if (field === 'horaireHabituel') {
                // Gestion spéciale pour l'horaire habituel avec sélecteur d'heure
                const input = document.createElement('input');
                input.type = 'time';
                input.className = 'champ-edition';
                
                // Convertir l'heure si elle existe
                if (texteActuel !== 'Non renseigné' && texteActuel.includes(':')) {
            input.value = texteActuel;
                } else {
                    input.value = '08:00'; // Valeur par défaut
                }
                
                input.style.cssText = `
                    background: #f8f9fa;
                    border: 1px solid #4facfe;
                    border-radius: 4px;
                    padding: 0.5rem;
                    width: 100%;
                `;
                
            span.innerHTML = '';
            span.appendChild(input);
                
            } else {
                const input = document.createElement('input');
                input.type = (field === 'email') ? 'email' : 
                            (field === 'telephone') ? 'tel' : 'text';
                input.value = texteActuel === 'Non renseigné' ? '' : texteActuel;
                input.className = 'champ-edition';
                input.style.cssText = `
                    background: #f8f9fa;
                    border: 1px solid #4facfe;
                    border-radius: 4px;
                    padding: 0.5rem;
                    width: 100%;
                `;
                
                span.innerHTML = '';
                span.appendChild(input);
            }
        });

        // Ajoute un input file pour la photo
        const photoDiv = document.querySelector('.conteneur-photo-principale');
        if (photoDiv && !photoDiv.querySelector('input[type="file"][name="photo"]')) {
            const inputPhoto = document.createElement('input');
            inputPhoto.type = 'file';
            inputPhoto.name = 'photo';
            inputPhoto.accept = 'image/*';
            inputPhoto.style.cssText = `
                margin-top: 1rem;
                padding: 0.5rem;
                border: 1px solid #4facfe;
                border-radius: 4px;
                width: 100%;
            `;
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
    const rechercheInput = document.getElementById('rechercheUtilisateurs');
    const filtresMessagerie = document.getElementById('filtresMessagerie');

    let tousLesUtilisateurs = []; // Stocke tous les utilisateurs pour la recherche
    let filtreActuel = 'tous'; // Filtre par défaut
    let messagesNonLus = new Set(); // Stocke les IDs des utilisateurs avec messages non lus

    // Simuler des messages non lus (à remplacer par une vraie API)
    function simulerMessagesNonLus() {
        // Simule que certains utilisateurs ont des messages non lus
        const nombreAleatoire = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < nombreAleatoire && i < tousLesUtilisateurs.length; i++) {
            const indexAleatoire = Math.floor(Math.random() * tousLesUtilisateurs.length);
            messagesNonLus.add(tousLesUtilisateurs[indexAleatoire].id);
        }
    }

    // Gestion des filtres
    if (filtresMessagerie) {
        const boutonsFiltres = filtresMessagerie.querySelectorAll('.filtre-btn');
        boutonsFiltres.forEach(btn => {
            btn.addEventListener('click', function() {
                // Mettre à jour l'état actif
                boutonsFiltres.forEach(b => b.classList.remove('actif'));
                this.classList.add('actif');
                
                // Mettre à jour le filtre
                filtreActuel = this.dataset.filtre;
                
                // Réappliquer le filtre et la recherche
                appliquerFiltreEtRecherche();
            });
        });
    }

    // Charger dynamiquement la liste des utilisateurs
    fetch('/messagerie/api/users/')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                tousLesUtilisateurs = data.users;
                simulerMessagesNonLus(); // Simuler des messages non lus
                afficherUtilisateurs(tousLesUtilisateurs);
            } else {if (listeConversations) {
                    listeConversations.innerHTML = '<li style="padding:2rem;color:#e74c3c;text-align:center;">Erreur lors du chargement des utilisateurs</li>';
                }
            }
        })
        .catch(error => {if (listeConversations) {
                listeConversations.innerHTML = '<li style="padding:2rem;color:#e74c3c;text-align:center;">Erreur de connexion</li>';
            }
        });

    // Fonction pour appliquer le filtre et la recherche
    function appliquerFiltreEtRecherche() {
        const termeRecherche = rechercheInput ? rechercheInput.value.toLowerCase().trim() : '';
        
        let utilisateursFiltres = tousLesUtilisateurs;
        
        // Appliquer le filtre par rôle
        if (filtreActuel !== 'tous') {
            utilisateursFiltres = utilisateursFiltres.filter(user => 
                user.role && user.role.toLowerCase() === filtreActuel
            );
        }
        
        // Appliquer la recherche
        if (termeRecherche !== '') {
            utilisateursFiltres = utilisateursFiltres.filter(user => 
                user.nom.toLowerCase().includes(termeRecherche) ||
                user.email.toLowerCase().includes(termeRecherche)
            );
        }
        
        afficherUtilisateurs(utilisateursFiltres);
    }

    // Fonction pour afficher la liste des utilisateurs
    function afficherUtilisateurs(users) {
        if (listeConversations) {
            listeConversations.innerHTML = '';
            if (users.length === 0) {
                listeConversations.innerHTML = '<li style="padding:2rem;color:#888;text-align:center;">Aucun utilisateur trouvé</li>';
            } else {
                users.forEach(user => {
                    const li = document.createElement('li');
                    const aMessageNonLu = messagesNonLus.has(user.id);
                    li.className = aMessageNonLu ? 'conversation message-non-lu' : 'conversation';
                    li.dataset.userId = user.id;
                    
                    // Icône de rôle
                    const iconeRole = user.role === 'Conducteur' 
                        ? '<i class="fas fa-car" style="color:#4facfe;font-size:0.8rem;"></i>' 
                        : '<i class="fas fa-user" style="color:#43e97b;font-size:0.8rem;"></i>';
                    
                    // Gestion du dernier message
                    let dernierMessageHtml = '';
                    if (user.dernier_message) {
                        // Tronquer le message s'il est trop long
                        const messageAffiche = user.dernier_message.length > 35 
                            ? user.dernier_message.substring(0, 35) + '...' 
                            : user.dernier_message;
                        
                        dernierMessageHtml = `<span class="dernier-message" style="color:#6b7280;font-size:0.82rem;font-style:italic;margin-top:2px;display:block;line-height:1.3;">${messageAffiche}</span>`;
                    } else {
                        dernierMessageHtml = `<span class="dernier-message" style="color:#9ca3af;font-size:0.82rem;margin-top:2px;display:block;line-height:1.3;">Aucun message</span>`;
                    }
                    
                    // Marquer avec message_non_lu depuis l'API
                    const aMessageNonLuAPI = user.message_non_lu || false;
                    if (aMessageNonLuAPI) {
                        li.className = 'conversation message-non-lu';
                        messagesNonLus.add(user.id);
                    }
                    
                    li.innerHTML = `
                        <div style="display:flex;align-items:center;gap:1rem;width:100%;position:relative;">
                            <img src="${user.avatar}" class="avatar-conv avatar-conversation" alt="Avatar" style="border-radius:50%;width:48px;height:48px;object-fit:cover;box-shadow:0 2px 8px #4facfe22;">
                            <div class="infos-conv" style="flex:1;display:flex;flex-direction:column;gap:0.1rem;">
                                <span class="nom-conv nom-utilisateur" style="font-weight:700;color:#222;font-size:1.12rem;line-height:1.2;">${user.nom} ${iconeRole}</span>
                                <span class="email-conv" style="color:#8a8a8a;font-size:0.85rem;line-height:1.2;">${user.email}</span>
                                ${dernierMessageHtml}
                            </div>
                            ${aMessageNonLuAPI ? '<span class="badge-nouveau">Nouveau</span>' : ''}
                        </div>`;
                    listeConversations.appendChild(li);
                });
            }
        }
    }

    // Fonction de recherche
    if (rechercheInput) {
        rechercheInput.addEventListener('input', function(e) {
            // Réappliquer le filtre et la recherche
            appliquerFiltreEtRecherche();
        });
    }

    // Sélection de conversation
    if (listeConversations) {
        listeConversations.addEventListener('click', function(e) {
            const conversation = e.target.closest('.conversation');
            if (conversation) {
                // Effet actif
                document.querySelectorAll('.conversation').forEach(c => c.classList.remove('active'));
                conversation.classList.add('active');
                
                // Retirer la mise en évidence des messages non lus
                if (conversation.classList.contains('message-non-lu')) {
                    conversation.classList.remove('message-non-lu');
                    const userId = parseInt(conversation.dataset.userId);
                    messagesNonLus.delete(userId);
                    
                    // Retirer le badge nouveau
                    const badgeNouveau = conversation.querySelector('.badge-nouveau');
                    if (badgeNouveau) {
                        badgeNouveau.remove();
                    }
                    
                    // MAJ immédiate de la cloche en local
                    mettreAJourNotifications(messagesNonLus.size);
                    
                    // Mettre à jour le badge de notifications après un court délai (vérification serveur)
                    setTimeout(() => {
                        chargerNombreMessagesNonLus();
                    }, 500);
                }
                
                // Charger la conversation
                const userId = conversation.dataset.userId;
                const userName = conversation.querySelector('.nom-conv').textContent.replace(/\s*<i.*?<\/i>/g, '').trim();
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
    
    // Mettre à jour le badge de notifications quand on ouvre la messagerie
    chargerNombreMessagesNonLus();
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
    // Optionnel: connecter WebSocket si disponible
    // connecterWebSocket(userId);
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
                        afficherMessage(msg.contenu, msg.expediteur_nom, estMoi);
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
    // WebSocket temporairement désactivé - utilisation de l'API REST à la place/*
    if (chatSocket) {
        chatSocket.close();
    }
    const wsScheme = window.location.protocol === 'https:' ? 'wws' : 'ws';
    const wsPath = `${wsScheme}://${window.location.host}/ws/chat/${userId}/`;
    chatSocket = new WebSocket(wsPath);
    chatSocket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        // Afficher le message uniquement si on est sur la bonne conversation
        if (parseInt(currentRecipientId) === data.expediteur_id || data.expediteur === currentUsername) {
            afficherMessage(data.message, data.expediteur, data.expediteur === currentUsername);
        }
    };
    chatSocket.onclose = function(e) {};
    */
}

function envoyerMessage(message) {
    // Envoyer le message via AJAX au lieu de WebSocket
    fetch(`/messagerie/api/messages/${currentRecipientId}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
            'message': message
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Afficher le message immédiatement
            afficherMessage(message, currentUsername, true);
            
            // Mettre à jour la liste des utilisateurs pour afficher le nouveau dernier message
            setTimeout(() => {
                chargerNombreMessagesNonLus();
                // Recharger la liste des utilisateurs
                fetch('/messagerie/api/users/')
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            toutsLesUtilisateurs = data.users;
                            appliquerFiltreEtRecherche();
                        }
                    })
                    .catch(error => console.error('Erreur lors du rechargement des utilisateurs:', error));
            }, 500);
        } else {
            afficherNotification('Erreur lors de l\'envoi du message: ' + data.error, 'error');
        }
    })
    .catch(error => {afficherNotification('Erreur de connexion lors de l\'envoi du message.', 'error');
    });
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

// Fonction pour initialiser les boutons de sélection de statut
function initialiserBoutonsStatut() {// Sélectionne tous les boutons de statut (dans les deux sections profil)
    const boutonsStatut = document.querySelectorAll('.bouton-statut');boutonsStatut.forEach(bouton => {
        bouton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Clic sur bouton statut:', this.getAttribute('data-statut'));
            
            const nouveauStatut = this.getAttribute('data-statut');
            const selecteurParent = this.closest('.selecteur-statut');
            
            // Vérifie si le bouton est déjà actif
            if (this.classList.contains('actif')) {return;
            }
            
            // Ajoute une animation de chargement
            selecteurParent.classList.add('changement');
            
            // Désactive temporairement tous les boutons de statut
            document.querySelectorAll('.bouton-statut').forEach(btn => {
                btn.disabled = true;
                btn.style.opacity = '0.5';
            });// Envoie la requête de changement de statut
            changerStatutUtilisateur(nouveauStatut, function(success, data) {// Réactive les boutons
                document.querySelectorAll('.bouton-statut').forEach(btn => {
                    btn.disabled = false;
                    btn.style.opacity = '1';
                });
                selecteurParent.classList.remove('changement');
                
                if (success) {
                    // Met à jour immédiatement l'interface avant le refresh
                    mettreAJourStatutInterface(nouveauStatut);
                    
                    // Affiche une notification de succès
                    afficherNotification('Statut changé avec succès ! Rafraîchissement...', 'success');
                    
                    // Rafraîchit la page après un court délai
                    setTimeout(() => {
                        window.location.reload();
                    }, 800);
                } else {
                    // Affiche une erreur
                    afficherNotification('Erreur lors du changement de statut: ' + (data?.error || 'Erreur inconnue'), 'error');
                }
            });
        });
    });
}

// Fonction pour envoyer la requête de changement de statut au serveur
function changerStatutUtilisateur(nouveauStatut, callback) {const formData = new FormData();
    formData.append('role', nouveauStatut);fetch('/ajax/update_profil/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: formData
    })
    .then(response => {if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {if (data.success) {callback(true, data);
        } else {callback(false, data);
        }
    })
    .catch(error => {callback(false, { error: error.message });
    });
}

// Fonction pour mettre à jour l'interface après changement de statut
function mettreAJourStatutInterface(nouveauStatut) {// Met à jour tous les boutons de statut
    const boutonsStatut = document.querySelectorAll('.bouton-statut');boutonsStatut.forEach(bouton => {
        const statutBouton = bouton.getAttribute('data-statut');
        if (statutBouton === nouveauStatut) {
            bouton.classList.add('actif');} else {
            bouton.classList.remove('actif');}
    });
    
    // Met à jour le statut dans la barre du haut
    const texteStatutBarre = document.getElementById('texteStatutBarre');
    const iconeStatutBarre = document.getElementById('iconeStatutBarre');if (texteStatutBarre && iconeStatutBarre) {
        if (nouveauStatut === 'conducteur') {
            texteStatutBarre.textContent = 'Conducteur';
            iconeStatutBarre.className = 'fas fa-car';} else {
            texteStatutBarre.textContent = 'Passager';
            iconeStatutBarre.className = 'fas fa-user';}
    } else {}
    
    // Met à jour le rôle global
    const ancienRole = roleActuel;
    roleActuel = nouveauStatut === 'conducteur' ? 'driver' : 'passenger';// Met à jour les titres des sections
    const titreProfilRole = document.getElementById('titreProfilRole');
    const sousTitreProfilRole = document.getElementById('sousTitreProfilRole');
    
    if (titreProfilRole && sousTitreProfilRole) {
        if (nouveauStatut === 'conducteur') {
            titreProfilRole.textContent = 'Profil Conducteur';
            sousTitreProfilRole.textContent = 'Gérez vos informations de conducteur';
        } else {
            titreProfilRole.textContent = 'Profil Passager';
            sousTitreProfilRole.textContent = 'Gérez vos informations de passager';
        }}
    
    // Met à jour la visibilité des sections profil
    const profilConducteurSection = document.getElementById('profilConducteurSection');
    const profilPassagerSection = document.getElementById('profilPassagerSection');
    
    if (profilConducteurSection && profilPassagerSection) {
        if (nouveauStatut === 'conducteur') {
            profilConducteurSection.style.display = 'block';
            profilPassagerSection.style.display = 'none';
        } else {
            profilConducteurSection.style.display = 'none';
            profilPassagerSection.style.display = 'block';
        }}
}

// Fonction pour initialiser la gestion des photos de profil
function initialiserGestionPhoto(boutonId, inputId, actionsId, imageProfilId, appliquerBtnId, annulerBtnId) {
    const boutonModifier = document.getElementById(boutonId);
    const inputPhoto = document.getElementById(inputId);
    const actionsPhoto = document.getElementById(actionsId);
    const imageProfil = document.getElementById(imageProfilId);
    const boutonAppliquer = document.getElementById(appliquerBtnId);
    const boutonAnnuler = document.getElementById(annulerBtnId);
    
    let fichierSelectionne = null;
    let imageOriginale = null; // Pour restaurer l'image originale en cas d'annulation
    
    if (!boutonModifier || !inputPhoto || !actionsPhoto || !imageProfil || !boutonAppliquer || !boutonAnnuler) {return; // Si les éléments n'existent pas, on sort
    }
    
    // Gestion du clic sur "Modifier la photo"
    boutonModifier.addEventListener('click', function() {
        inputPhoto.click();
    });
    
    // Gestion de la sélection de fichier
    inputPhoto.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Vérification du type de fichier
            if (!file.type.startsWith('image/')) {
                afficherNotification('Veuillez sélectionner un fichier image valide.', 'error');
                return;
            }
            
            // Vérification de la taille (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                afficherNotification('La taille de l\'image ne doit pas dépasser 5MB.', 'error');
                return;
            }
            
            fichierSelectionne = file;
            
            // Sauvegarde de l'image originale
            imageOriginale = imageProfil.src;
            
            // Affichage de l'aperçu directement sur l'image existante
            const reader = new FileReader();
            reader.onload = function(e) {
                imageProfil.src = e.target.result;
                imageProfil.classList.add('apercu');
                actionsPhoto.style.display = 'flex';
                boutonModifier.style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Gestion du bouton "Appliquer"
    boutonAppliquer.addEventListener('click', function() {
        if (fichierSelectionne) {
            appliquerChangementPhoto(fichierSelectionne, boutonModifier, actionsPhoto, imageProfil);
        }
    });
    
    // Gestion du bouton "Annuler"
    boutonAnnuler.addEventListener('click', function() {
        annulerChangementPhoto(inputPhoto, actionsPhoto, boutonModifier, imageProfil, imageOriginale);
        fichierSelectionne = null;
        imageOriginale = null;
    });
    
    // Gestion du clic sur la photo existante
    const conteneurPhoto = boutonModifier.parentElement.querySelector('.conteneur-photo-principale');
    if (conteneurPhoto) {
        conteneurPhoto.addEventListener('click', function() {
            if (boutonModifier.style.display !== 'none') {
                boutonModifier.click();
            }
        });
    }
}

// Fonction pour appliquer le changement de photo
function appliquerChangementPhoto(fichier, boutonModifier, actionsPhoto, imageProfil) {
    // Affichage du loader
    const boutonAppliquer = actionsPhoto.querySelector('.bouton-appliquer-photo');
    const texteOriginal = boutonAppliquer.innerHTML;
    boutonAppliquer.innerHTML = '<div class="photo-loader"></div> Application...';
    boutonAppliquer.disabled = true;
    
    // Préparation des données
    const formData = new FormData();
    formData.append('photo', fichier);
    
    // Envoi au serveur
    fetch('/ajax/update_profil/', {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: formData
    })
    .then(response => response.json())
    .then(data => {if (data.success) {
            // Mise à jour de toutes les photos sur la page
            mettreAJourToutesLesPhotos(data.photo_url);
            
            // Nettoyage de l'état d'aperçu
            imageProfil.classList.remove('apercu');
            actionsPhoto.style.display = 'none';
            boutonModifier.style.display = 'inline-flex';
            
            // Notification de succès
            afficherNotification('Photo de profil mise à jour avec succès !', 'success');
        } else {
            // En cas d'erreur, restaurer l'image originale
            if (imageProfil.getAttribute('data-original-src')) {
                imageProfil.src = imageProfil.getAttribute('data-original-src');
            }
            imageProfil.classList.remove('apercu');
            actionsPhoto.style.display = 'none';
            boutonModifier.style.display = 'inline-flex';
            
            afficherNotification('Erreur lors de la mise à jour : ' + (data.error || 'Erreur inconnue'), 'error');
        }
    })
    .catch(error => {afficherNotification('Erreur de connexion lors de la mise à jour.', 'error');
    })
    .finally(() => {
        // Restauration du bouton
        boutonAppliquer.innerHTML = texteOriginal;
        boutonAppliquer.disabled = false;
    });
}

// Fonction pour annuler le changement de photo
function annulerChangementPhoto(inputPhoto, actionsPhoto, boutonModifier, imageProfil, imageOriginale) {
    // Reset de l'input
    inputPhoto.value = '';
    
    // Restauration de l'image originale
    if (imageOriginale) {
        imageProfil.src = imageOriginale;
    }
    
    // Nettoyage de l'état d'aperçu
    imageProfil.classList.remove('apercu');
    actionsPhoto.style.display = 'none';
    
    // Réaffichage du bouton modifier
    boutonModifier.style.display = 'inline-flex';
}

// Fonction pour mettre à jour toutes les photos sur la page
function mettreAJourToutesLesPhotos(nouvelleUrl) {
    if (!nouvelleUrl) return;
    
    // Photos de profil principales
    const photos = [
        document.getElementById('photoProfilPrincipale'),
        document.getElementById('photoProfilPrincipalePassager'),
        document.querySelector('.conteneur-photo-profil img'), // Photo dans la barre latérale
        document.querySelector('.photo-profil-menu'), // Photo dans le menu déroulant
        document.querySelector('.avatar-chat') // Photo dans le chat si existante
    ];
    
    photos.forEach(photo => {
        if (photo) {
            photo.src = nouvelleUrl;
        }
    });}

// Fonction pour synchroniser l'interface au chargement initial
function synchroniserInterfaceInitiale() {// Déterminer le statut actuel
    const texteStatutBarre = document.getElementById('texteStatutBarre');
    if (!texteStatutBarre) {return;
    }
    
    const statutActuel = texteStatutBarre.textContent.toLowerCase();// Synchroniser les boutons de statut
    const boutonsStatut = document.querySelectorAll('.bouton-statut');
    boutonsStatut.forEach(bouton => {
        const statutBouton = bouton.getAttribute('data-statut');
        if (statutBouton === statutActuel) {
            bouton.classList.add('actif');
        } else {
            bouton.classList.remove('actif');
        }
    });
    
    // Synchroniser les sections profil
    const profilConducteurSection = document.getElementById('profilConducteurSection');
    const profilPassagerSection = document.getElementById('profilPassagerSection');
    const titreProfilRole = document.getElementById('titreProfilRole');
    const sousTitreProfilRole = document.getElementById('sousTitreProfilRole');
    
    if (profilConducteurSection && profilPassagerSection) {
        if (statutActuel === 'conducteur') {
            profilConducteurSection.style.display = 'block';
            profilPassagerSection.style.display = 'none';
            if (titreProfilRole) titreProfilRole.textContent = 'Profil Conducteur';
            if (sousTitreProfilRole) sousTitreProfilRole.textContent = 'Gérez vos informations de conducteur';
        } else {
            profilConducteurSection.style.display = 'none';
            profilPassagerSection.style.display = 'block';
            if (titreProfilRole) titreProfilRole.textContent = 'Profil Passager';
            if (sousTitreProfilRole) sousTitreProfilRole.textContent = 'Gérez vos informations de passager';
        }
    }
    
    // Synchroniser les interfaces du tableau de bord
    const interfaceConducteur = document.getElementById('interfaceConducteur');
    const interfacePassager = document.getElementById('interfacePassager');
    const titreTablleauBord = document.getElementById('titreTablleauBord');
    const sousTitreTablleauBord = document.getElementById('sousTitreTablleauBord');
    
    if (interfaceConducteur && interfacePassager) {
        if (statutActuel === 'conducteur') {
            interfaceConducteur.style.display = 'grid';
            interfacePassager.style.display = 'none';
            if (titreTablleauBord) titreTablleauBord.textContent = 'Tableau de bord conducteur';
            if (sousTitreTablleauBord) sousTitreTablleauBord.textContent = 'Gérez vos offres et trouvez des passagers';
        } else {
            interfaceConducteur.style.display = 'none';
            interfacePassager.style.display = 'grid';
            if (titreTablleauBord) titreTablleauBord.textContent = 'Tableau de bord passager';
            if (sousTitreTablleauBord) sousTitreTablleauBord.textContent = 'Trouvez des trajets et gérez vos demandes';
        }
    }}

// Fonction pour initialiser les notifications
function initialiserNotifications() {const boutonNotifications = document.getElementById('boutonNotifications');
    const badgeNotifications = document.getElementById('badgeNotifications');
    
    if (boutonNotifications) {
        // Charger le nombre réel de messages non lus
        chargerNombreMessagesNonLus();
        
        // Gestion du clic sur l'icône de notifications
        boutonNotifications.addEventListener('click', function() {// Animation du bouton
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            // Rediriger vers la section messagerie
            const lienMessagerie = document.querySelector('[data-section="sectionMessagerie"]');
            if (lienMessagerie) {
                lienMessagerie.click(); // Utilise le système de navigation existant
            } else {
                // Fallback si le lien n'est pas trouvé - utilise le même système que la navigation
                document.querySelectorAll('.element-navigation').forEach(nav => nav.classList.remove('actif'));
                document.querySelectorAll('.section-contenu').forEach(section => {
                    section.style.display = 'none';
                });
                const sectionMessagerie = document.getElementById('sectionMessagerie');
                if (sectionMessagerie) {
                    sectionMessagerie.style.display = 'block';
                }
                const navMessagerie = document.querySelector('[data-section="sectionMessagerie"]');
                if (navMessagerie) {
                    navMessagerie.classList.add('actif');
                }
            }
            
            // Optionnel: réinitialiser le badge car l'utilisateur va voir ses messages
            setTimeout(() => {
                chargerNombreMessagesNonLus();
            }, 1000);
        });
        
        // Vérifier périodiquement les nouveaux messages (toutes les 30 secondes)
        setInterval(() => {
            chargerNombreMessagesNonLus();
        }, 30000);
    }
}

// Fonction pour charger le nombre réel de messages non lus
function chargerNombreMessagesNonLus() {
    fetch('/messagerie/api/unread-count/')
        .then(response => response.json())
        .then(data => {
            if (data.success) {mettreAJourNotifications(data.unread_count);
            } else {}
        })
        .catch(error => {});
}

// Fonction pour mettre à jour le nombre de notifications
function mettreAJourNotifications(nombre) {
    const badgeNotifications = document.getElementById('badgeNotifications');
    const boutonNotifications = document.getElementById('boutonNotifications');
    if (!badgeNotifications || !boutonNotifications) return;
        if (nombre > 0) {
            badgeNotifications.style.display = 'flex';
            badgeNotifications.textContent = nombre > 99 ? '99+' : nombre;
        boutonNotifications.classList.add('a-des-nouveaux');
        } else {
            badgeNotifications.style.display = 'none';
            badgeNotifications.textContent = '0';
        boutonNotifications.classList.remove('a-des-nouveaux');
    }
}

function initialiserRechercheTrajet() {const btnRecherche = document.getElementById('boutonRechercheTrajets');
    const inputDepart = document.getElementById('inputRechercheDepart');
    const inputHeure = document.getElementById('inputRechercheHeure');
    
    if (!btnRecherche) {return;
    }
    if (!inputDepart) {return;
    }btnRecherche.addEventListener('click', function(e) {e.preventDefault();
        
        const depart = inputDepart.value.trim();
        const arrivee = 'UAC'; // valeur fixe dans le champ readonly
        const heure = inputHeure ? inputHeure.value : '';// Toujours afficher la carte, même sans point de départ
        if (!depart) {afficherCarteSansResultats();
            afficherNotification('Aucun point de départ spécifié. Affichage de la carte générale.', 'info');
            return;
        }
        
        // Affichage du loader
        btnRecherche.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Recherche...';
        btnRecherche.disabled = true;
        
        // Envoi au backend
        fetch('/matching/api/rechercher-trajets/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify({ depart, arrivee, heure })
        })
        .then(response => {return response.json();
        })
        .then(data => {if (data.success) {
                if (data.matchs && data.matchs.length > 0) {afficherResultatsCarte(data.matchs);
                    afficherNotification(`${data.matchs.length} trajet(s) trouvé(s)!`, 'success');
                } else {afficherCarteSansResultats();
                    afficherNotification('Aucun conducteur disponible pour cette recherche.', 'info');
                }
            } else {afficherCarteSansResultats();
                afficherNotification('Erreur: ' + data.error, 'error');
            }
        })
        .catch(error => {afficherCarteSansResultats();
            afficherNotification('Erreur de connexion lors de la recherche.', 'error');
        })
        .finally(() => {
            // Restaurer le bouton
            btnRecherche.innerHTML = '<i class="fas fa-search"></i> Rechercher des trajets';
            btnRecherche.disabled = false;
        });
    });
}

// Variable globale pour stocker l'instance de la carte
let carteResultats = null;

function afficherResultatsCarte(trajets) {// Masquer la carte de recherche et afficher la zone résultats
    const carteRecherche = document.getElementById('carteRecherche');
    const zoneRes = document.getElementById('zoneResultatsTrajets');
    
    if (carteRecherche) {
        carteRecherche.style.display = 'none';
    }
    if (!zoneRes) {return;
    }
    
    zoneRes.style.display = 'block';// Nettoyer la carte existante si elle existe
    const mapContainer = document.getElementById('mapResultats');
    if (carteResultats) {carteResultats.remove();
        carteResultats = null;
    }
    
    // Vider le conteneur
    mapContainer.innerHTML = '';

    // Attendre que le conteneur soit complètement visible
    setTimeout(() => {
        try {
            // Vérifier que le conteneur est visible
            if (mapContainer.offsetWidth === 0 || mapContainer.offsetHeight === 0) {setTimeout(() => initializerCarte(), 300);
                return;
            }
            
            initializerCarte();
            
        } catch (error) {}
    }, 200);
    
    function initializerCarte() {
        // Vérifier que le conteneur est visible et a des dimensions
        const container = document.getElementById('mapResultats');
        if (!container || container.offsetWidth === 0 || container.offsetHeight === 0) {
            setTimeout(initializerCarte, 100);
            return;
        }
        
        // Créer la carte
        carteResultats = L.map('mapResultats', {
            center: [6.3703, 2.3912],
            zoom: 12,
            zoomControl: true,
            attributionControl: true
        });
        
        // Ajouter les tuiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18
        }).addTo(carteResultats);
        
        // Forcer la mise à jour de la taille après initialisation
        setTimeout(() => {
            if (carteResultats) {
                carteResultats.invalidateSize();
            }
        }, 100);

        
        // Créer la carte
        carteResultats = L.map('mapResultats', {
            center: [6.3703, 2.3912],
            zoom: 12,
            zoomControl: true,
            attributionControl: true
        });
        
        // Ajouter les tuiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18
        }).addTo(carteResultats);
        


        // Gérer la liste des conducteurs
        const listeDiv = document.getElementById('listeConducteursDisponibles');
        if (listeDiv) {
            listeDiv.innerHTML = '<h4 style="margin-bottom:1rem;color:#333;"><i class="fas fa-users"></i> Conducteurs disponibles</h4>';
        }

        if (!trajets || trajets.length === 0) {
            if (listeDiv) {
                listeDiv.innerHTML += '<p style="text-align:center;color:#666;padding:2rem;">Aucun conducteur trouvé pour cette recherche.</p>';
            }
            // Forcer la mise à jour de la taille
            setTimeout(() => {
                if (carteResultats) {
                    carteResultats.invalidateSize();
                }
            }, 100);
            return;
        }

        // Traiter les trajets
        const marqueurs = [];
        trajets.forEach(async (t, index) => {try {
                // Géocodage du point de départ
                let lat = t.lat_depart, lon = t.lon_depart;
                
                if (!lat || !lon) {try {
                        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(t.Départ + ', Bénin')}&limit=1`;
                        const res = await fetch(url);
                        const js = await res.json();
                        if (js && js[0]) {
                            lat = parseFloat(js[0].lat);
                            lon = parseFloat(js[0].lon);} else {// Utiliser des coordonnées par défaut pour le Bénin
                            lat = 6.3703 + (Math.random() - 0.5) * 0.2;
                            lon = 2.3912 + (Math.random() - 0.5) * 0.2;
                        }
                    } catch (geoError) {lat = 6.3703 + (Math.random() - 0.5) * 0.2;
                        lon = 2.3912 + (Math.random() - 0.5) * 0.2;
                    }
                }
                
                // Ajouter le marqueur seulement si la carte existe encore
                if (carteResultats) {
                    const marker = L.marker([lat, lon]).addTo(carteResultats);
                    marqueurs.push(marker);
                    
                    const popupContent = `
                        <div style="min-width:200px;">
                            <h4 style="margin:0 0 10px 0;color:#4facfe;">${t.conducteur}</h4>
                            <p style="margin:5px 0;"><strong>Départ:</strong> ${t.Départ}</p>
                            <p style="margin:5px 0;"><strong>Arrivée:</strong> ${t.Arrivée}</p>
                            <p style="margin:5px 0;"><strong>Heure:</strong> ${t['Heure de départ']}</p>
                            <p style="margin:5px 0;"><strong>Places:</strong> ${t['Places disponibles'] || 'Non spécifié'}</p>
                            <p style="margin:5px 0;"><strong>Prix:</strong> ${t.Prix || '0'} FCFA</p>
                            ${t.Description ? `<p style="margin:5px 0;font-style:italic;">${t.Description}</p>` : ''}
                        </div>
                    `;
                    marker.bindPopup(popupContent);
                }
                
            } catch (error) {}
            
            // Ajouter à la liste des conducteurs
            if (listeDiv) {
                const bloc = document.createElement('div');
                bloc.className = 'conducteur-item';
                bloc.innerHTML = `
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <div>
                            <h5 style="margin:0 0 8px 0;color:#333;font-size:1rem;">${t.conducteur}</h5>
                            <p style="margin:4px 0;color:#666;font-size:0.9rem;"><i class="fas fa-route"></i> ${t.Départ} ➜ ${t.Arrivée}</p>
                            <p style="margin:4px 0;color:#666;font-size:0.85rem;"><i class="fas fa-clock"></i> ${t['Heure de départ']} | <i class="fas fa-users"></i> ${t['Places disponibles'] || 'N/A'} places | <i class="fas fa-coins"></i> ${t.Prix || '0'} FCFA</p>
                            ${t.Description ? `<p style="margin:4px 0;color:#888;font-style:italic;font-size:0.85rem;">${t.Description}</p>` : ''}
                        </div>
                        <button class="btn-contacter" data-id="${t.conducteur_id}">
                            <i class="fas fa-comments"></i> Contacter
                        </button>
                    </div>
                `;
                
                // Gestion du clic sur contacter
                const btnContacter = bloc.querySelector('.btn-contacter');
                btnContacter.addEventListener('click', (e) => {
                    e.preventDefault();
                    const idc = e.target.closest('.btn-contacter').dataset.id;// Animation du bouton
                    btnContacter.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        btnContacter.style.transform = 'scale(1)';
                    }, 150);
                    
                    // Ouvrir messagerie et charger conversation
                    const lienMessagerie = document.querySelector('[data-section="sectionMessagerie"]');
                    if (lienMessagerie) {
                        lienMessagerie.click();
                        // Attendre l'initialisation puis charger conversation
                        setTimeout(() => {
                            chargerConversation(idc, t.conducteur, '../../static/css/images/defaut_profile.png');
                        }, 500);
                    }
                });
                
                listeDiv.appendChild(bloc);
            }
        });
        
        // Ajuster la vue de la carte après un délai
        setTimeout(() => {
            if (carteResultats) {
                try {
                    carteResultats.invalidateSize();
                    
                    // Si on a des marqueurs, ajuster la vue pour les inclure tous
                    if (marqueurs.length > 0) {
                        const group = new L.featureGroup(marqueurs);
                        carteResultats.fitBounds(group.getBounds().pad(0.1));
                    }} catch (error) {}
            }
        }, 500);
    }
    
    // Initialiser le bouton retour
    initialiserBoutonRetour();
}

function afficherCarteSansResultats() {// Masquer la carte de recherche et afficher la zone résultats
    const carteRecherche = document.getElementById('carteRecherche');
    const zoneRes = document.getElementById('zoneResultatsTrajets');
    
    if (carteRecherche) {
        carteRecherche.style.display = 'none';
    }
    if (!zoneRes) {return;
    }
    
    zoneRes.style.display = 'block';

    // Nettoyer la carte existante si elle existe
    const mapContainer = document.getElementById('mapResultats');
    if (carteResultats) {carteResultats.remove();
        carteResultats = null;
    }
    
    // Vider le conteneur
    mapContainer.innerHTML = '';

    // Attendre que le conteneur soit visible
    setTimeout(() => {
        try {
            // Vérifier que le conteneur est visible
            if (mapContainer.offsetWidth === 0 || mapContainer.offsetHeight === 0) {setTimeout(() => initializerCarteVide(), 300);
                return;
            }
            
            initializerCarteVide();
            
        } catch (error) {}
    }, 200);
    
    function initializerCarteVide() {// Créer la carte
        carteResultats = L.map('mapResultats', {
            center: [6.3703, 2.3912],
            zoom: 11,
            zoomControl: true,
            attributionControl: true
        });
        
        // Ajouter les tuiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18
        }).addTo(carteResultats);
        
        // Ajouter un marqueur par défaut pour l'UAC
        const uacMarker = L.marker([6.4167, 2.3333]).addTo(carteResultats);
        uacMarker.bindPopup(`
            <div style="text-align:center;">
                <h4 style="color:#4facfe;margin:0 0 10px 0;">Université d'Abomey-Calavi</h4>
                <p style="margin:0;">Point d'arrivée principal</p>
            </div>
        `);

        const listeDiv = document.getElementById('listeConducteursDisponibles');
        if (listeDiv) {
            listeDiv.innerHTML = `
                <div style="text-align:center;padding:2rem;color:#666;">
                    <i class="fas fa-map-marked-alt" style="font-size:2rem;color:#4facfe;margin-bottom:1rem;"></i>
                    <h4 style="margin:0 0 1rem 0;color:#333;">Carte de la région</h4>
                    <p style="margin:0;font-size:0.9rem;">Aucun conducteur trouvé pour cette recherche.<br>Essayez avec d'autres critères.</p>
                </div>
            `;
        }
        
        // Ajuster la taille de la carte
        setTimeout(() => {
            if (carteResultats) {
                try {
                    carteResultats.invalidateSize();} catch (error) {}
            }
        }, 200);
    }
    
    // Initialiser le bouton retour
    initialiserBoutonRetour();
}

function initialiserBoutonRetour() {
    const boutonRetour = document.getElementById('boutonRetourRecherche');
    if (boutonRetour) {
        // Supprimer les anciens listeners pour éviter les doublons
        boutonRetour.replaceWith(boutonRetour.cloneNode(true));
        const nouveauBoutonRetour = document.getElementById('boutonRetourRecherche');
        
        nouveauBoutonRetour.addEventListener('click', function() {// Nettoyer la carte avant de masquer
            if (carteResultats) {carteResultats.remove();
                carteResultats = null;
            }
            
            // Masquer la zone résultats et réafficher la carte de recherche
            const carteRecherche = document.getElementById('carteRecherche');
            const zoneRes = document.getElementById('zoneResultatsTrajets');
            
            if (zoneRes) {
                zoneRes.style.display = 'none';
            }
            if (carteRecherche) {
                carteRecherche.style.display = 'block';
            }
            
            // Vider le conteneur de la carte
            const mapContainer = document.getElementById('mapResultats');
            if (mapContainer) {
                mapContainer.innerHTML = '';
            }
        });
    }
}

// Fonction d'initialisation principale
function initialiserPagePrincipale() {// Initialiser la navigation
    initialiserNavigation();
    
    // Initialiser les notifications
    initialiserNotifications();
    
    // Initialiser la messagerie
    initialiserMessagerie();
    
    // Initialiser les boutons de statut
    initialiserBoutonsStatut();
    
    // Initialiser la recherche de trajets
    initialiserRechercheTrajet();
    
    // Initialiser la publication d'offres
    initialiserPublicationOffre();
    
    // Synchroniser l'interface
    synchroniserInterfaceInitiale();
    
    // Charger les données selon le rôle
    chargerDonneesUtilisateur();
    
    // Initialiser la gestion des photos
    initialiserGestionPhoto('boutonModifierPhoto', 'inputPhoto', 'actionsPhoto', 'photoProfilPrincipale', 'boutonAppliquerPhoto', 'boutonAnnulerPhoto');
    initialiserGestionPhoto('boutonModifierPhotoPassager', 'inputPhotoPassager', 'actionsPhotoPassager', 'photoProfilPrincipalePassager', 'boutonAppliquerPhotoPassager', 'boutonAnnulerPhotoPassager');}

// Fonction pour charger les données selon le rôle de l'utilisateur
function chargerDonneesUtilisateur() {
    const texteStatutBarre = document.getElementById('texteStatutBarre');
    if (!texteStatutBarre) return;
    
    const statutActuel = texteStatutBarre.textContent.toLowerCase();
    
    if (statutActuel === 'conducteur') {
        // Charger les données du conducteur
        chargerMesOffres();
        chargerDemandesRecues();
    } else if (statutActuel === 'passager') {
        // Charger les données du passager
        chargerMesDemandes();
    }
}

// Lancer l'initialisation quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialiserPagePrincipale);
} else {
    initialiserPagePrincipale();
}

// Fonction pour initialiser la publication d'offres
function initialiserPublicationOffre() {
    const boutonPublier = document.getElementById('boutonPublierOffre');
    
    if (boutonPublier) {
        boutonPublier.addEventListener('click', function(e) {
            e.preventDefault();
            publierOffre();
        });
    }
}

// Fonction pour publier une offre
function publierOffre() {
    const formData = {
        point_depart: document.getElementById('inputDepartOffre').value.trim(),
        point_arrivee: 'UAC',
        date_depart: document.getElementById('inputDateOffre').value,
        heure_depart: document.getElementById('inputHeureOffre').value,
        places_disponibles: document.getElementById('selectPlacesOffre').value,
        prix: document.getElementById('inputPrixOffre').value,
        description: document.getElementById('textareaDescriptionOffre').value.trim()
    };

    // Validation
    if (!formData.point_depart) {
        afficherNotification('Veuillez saisir le point de départ', 'error');
        return;
    }
    if (!formData.date_depart) {
        afficherNotification('Veuillez sélectionner une date', 'error');
        return;
    }
    if (!formData.heure_depart) {
        afficherNotification('Veuillez sélectionner une heure', 'error');
        return;
    }
    if (!formData.prix || formData.prix <= 0) {
        afficherNotification('Veuillez saisir un prix valide', 'error');
        return;
    }

    // Affichage du loader
    const boutonPublier = document.getElementById('boutonPublierOffre');
    const texteOriginal = boutonPublier.innerHTML;
    boutonPublier.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publication...';
    boutonPublier.disabled = true;

    // Envoi au serveur
    fetch('/core/api/publier-offre/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            afficherNotification('Offre publiée avec succès !', 'success');
            
            // Réinitialiser le formulaire
            document.getElementById('formulaireOffre').reset();
            
            // Afficher la section "Mes offres"
            afficherSectionMesOffres();
            
            // Charger les offres
            chargerMesOffres();
            
        } else {
            afficherNotification('Erreur lors de la publication : ' + (data.error || 'Erreur inconnue'), 'error');
        }
    })
    .catch(error => {afficherNotification('Erreur de connexion lors de la publication', 'error');
    })
    .finally(() => {
        // Restaurer le bouton
        boutonPublier.innerHTML = texteOriginal;
        boutonPublier.disabled = false;
    });
}

// Fonction pour afficher la section "Mes offres"
function afficherSectionMesOffres() {
    const sectionMesOffres = document.getElementById('carteMesOffres');
    if (sectionMesOffres) {
        sectionMesOffres.style.display = 'block';
    }
}

// Fonction pour charger les offres du conducteur
function chargerMesOffres() {
    fetch('/core/api/mes-offres/')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                afficherMesOffres(data.offres);
            } else {}
        })
        .catch(error => {});
}

// Fonction pour afficher les offres
function afficherMesOffres(offres) {
    const listeMesOffres = document.getElementById('listeMesOffres');
    const titreMesOffres = document.getElementById('titreMesOffres');
    const aucuneOffre = document.getElementById('aucuneOffre');
    const boutonVoirOffres = document.getElementById('boutonVoirOffres');

    if (!listeMesOffres) return;

    // Mettre à jour le titre
    if (titreMesOffres) {
        titreMesOffres.textContent = `Mes offres (${offres.length})`;
    }

    if (offres.length === 0) {
        if (aucuneOffre) {
            aucuneOffre.style.display = 'block';
        }
        if (boutonVoirOffres) {
            boutonVoirOffres.style.display = 'none';
        }
        return;
    }

    // Masquer le message "aucune offre"
    if (aucuneOffre) {
        aucuneOffre.style.display = 'none';
    }

    // Vider la liste
    listeMesOffres.innerHTML = '';

    // Afficher les offres (maximum 3 pour la vue rapide)
    const offresAffichees = offres.slice(0, 3);
    offresAffichees.forEach(offre => {
        const offreElement = creerElementOffre(offre);
        listeMesOffres.appendChild(offreElement);
    });

    // Afficher le bouton "Voir toutes" si plus de 3 offres
    if (boutonVoirOffres) {
        boutonVoirOffres.style.display = offres.length > 3 ? 'block' : 'none';
    }
}

// Fonction pour créer un élément d'offre
function creerElementOffre(offre) {
    const div = document.createElement('div');
    div.className = 'offre-item';
    div.innerHTML = `
        <div class="offre-header">
            <div class="offre-trajet">${offre.point_depart} → ${offre.point_arrivee}</div>
            <div class="offre-statut ${offre.active ? 'active' : 'terminee'}">
                ${offre.active ? 'Active' : 'Terminée'}
            </div>
        </div>
        <div class="offre-details">
            <div class="offre-detail">
                <i class="fas fa-calendar"></i>
                <span>${formatDate(offre.date_depart)}</span>
            </div>
            <div class="offre-detail">
                <i class="fas fa-clock"></i>
                <span>${offre.heure_depart}</span>
            </div>
            <div class="offre-detail">
                <i class="fas fa-users"></i>
                <span>${offre.places_disponibles} places</span>
            </div>
            <div class="offre-detail">
                <i class="fas fa-coins"></i>
                <span>${offre.prix} FCFA</span>
            </div>
        </div>
        ${offre.description ? `<div class="offre-description" style="font-style:italic;color:rgba(255,255,255,0.8);margin-bottom:0.8rem;">${offre.description}</div>` : ''}
        <div class="offre-actions">
            <button class="bouton-offre bouton-voir-demandes" onclick="voirDemandesOffre(${offre.id})">
                <i class="fas fa-eye"></i> Demandes (${offre.nb_demandes || 0})
            </button>
            <button class="bouton-offre bouton-modifier" onclick="modifierOffre(${offre.id})">
                <i class="fas fa-edit"></i> Modifier
            </button>
            <button class="bouton-offre bouton-supprimer" onclick="supprimerOffre(${offre.id})">
                <i class="fas fa-trash"></i> Supprimer
            </button>
        </div>
    `;
    return div;
}

// Fonction pour charger les demandes reçues
function chargerDemandesRecues() {
    fetch('/core/api/demandes-recues/')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                afficherDemandesRecues(data.demandes);
            } else {}
        })
        .catch(error => {});
}

// Fonction pour afficher les demandes reçues
function afficherDemandesRecues(demandes) {
    const listeDemandesRecues = document.getElementById('listeDemandesRecues');
    const titreDemandes = document.getElementById('titreDemandes');
    const aucuneDemande = document.getElementById('aucuneDemande');
    const boutonVoirDemandes = document.getElementById('boutonVoirDemandes');

    if (!listeDemandesRecues) return;

    // Mettre à jour le titre
    if (titreDemandes) {
        titreDemandes.textContent = `Demandes reçues (${demandes.length})`;
    }

    if (demandes.length === 0) {
        if (aucuneDemande) {
            aucuneDemande.style.display = 'block';
        }
        if (boutonVoirDemandes) {
            boutonVoirDemandes.style.display = 'none';
        }
        return;
    }

    // Masquer le message "aucune demande"
    if (aucuneDemande) {
        aucuneDemande.style.display = 'none';
    }

    // Vider la liste
    listeDemandesRecues.innerHTML = '';

    // Afficher les demandes (maximum 3 pour la vue rapide)
    const demandesAffichees = demandes.slice(0, 3);
    demandesAffichees.forEach(demande => {
        const demandeElement = creerElementDemande(demande);
        listeDemandesRecues.appendChild(demandeElement);
    });

    // Afficher le bouton "Voir toutes" si plus de 3 demandes
    if (boutonVoirDemandes) {
        boutonVoirDemandes.style.display = demandes.length > 3 ? 'block' : 'none';
    }
}

// Fonction pour créer un élément de demande
function creerElementDemande(demande) {
    const div = document.createElement('div');
    div.className = 'demande-item';
    div.innerHTML = `
        <div class="demande-header">
            <div class="demande-passager">
                <img src="${demande.passager.avatar || '../../static/css/images/defaut_profile.png'}" 
                     class="demande-avatar" alt="Avatar">
                <div class="demande-nom">${demande.passager.nom}</div>
            </div>
            <div class="demande-statut ${demande.statut}">
                ${getStatutText(demande.statut)}
            </div>
        </div>
        <div class="demande-trajet">
            <i class="fas fa-route"></i> ${demande.offre.point_depart} → ${demande.offre.point_arrivee}
            <br><i class="fas fa-calendar"></i> ${formatDate(demande.offre.date_depart)} à ${demande.offre.heure_depart}
            <br><i class="fas fa-users"></i> ${demande.nombre_places} place(s) demandée(s)
        </div>
        <div class="demande-actions">
            ${demande.statut === 'en_attente' ? `
                <button class="bouton-offre bouton-accepter" onclick="repondreReservation(${demande.id}, 'confirmee')">
                    <i class="fas fa-check"></i> Accepter
                </button>
                <button class="bouton-offre bouton-refuser" onclick="repondreReservation(${demande.id}, 'annulee')">
                    <i class="fas fa-times"></i> Refuser
                </button>
            ` : ''}
            <button class="bouton-offre bouton-contacter" onclick="contacterUtilisateur(${demande.passager.id}, '${demande.passager.nom}')">
                <i class="fas fa-comments"></i> Contacter
            </button>
        </div>
    `;
    return div;
}

// Fonction pour charger les demandes du passager
function chargerMesDemandes() {
    fetch('/core/api/mes-demandes/')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                afficherMesDemandes(data.demandes);
            } else {}
        })
        .catch(error => {});
}

// Fonction pour afficher mes demandes (passager)
function afficherMesDemandes(demandes) {
    const listeMesDemandes = document.getElementById('listeMesDemandes');
    const titreMesDemandes = document.getElementById('titreMesDemandes');
    const aucuneMaDemande = document.getElementById('aucuneMaDemande');
    const boutonNouvelleDemande = document.getElementById('boutonNouvelleDemande');

    if (!listeMesDemandes) return;

    // Mettre à jour le titre
    if (titreMesDemandes) {
        titreMesDemandes.textContent = `Mes demandes (${demandes.length})`;
    }

    if (demandes.length === 0) {
        if (aucuneMaDemande) {
            aucuneMaDemande.style.display = 'block';
        }
        if (boutonNouvelleDemande) {
            boutonNouvelleDemande.style.display = 'none';
        }
        return;
    }

    // Masquer le message "aucune demande"
    if (aucuneMaDemande) {
        aucuneMaDemande.style.display = 'none';
    }

    // Vider la liste
    listeMesDemandes.innerHTML = '';

    // Afficher les demandes
    demandes.forEach(demande => {
        const demandeElement = creerElementMaDemande(demande);
        listeMesDemandes.appendChild(demandeElement);
    });

    // Afficher le bouton "Nouvelle demande"
    if (boutonNouvelleDemande) {
        boutonNouvelleDemande.style.display = 'block';
    }
}

// Fonction pour créer un élément de ma demande
function creerElementMaDemande(demande) {
    const div = document.createElement('div');
    div.className = 'mes-demandes-item';
    div.innerHTML = `
        <div class="mes-demandes-header">
            <div class="mes-demandes-conducteur">
                <img src="${demande.offre.conducteur.avatar || '../../static/css/images/defaut_profile.png'}" 
                     class="mes-demandes-avatar" alt="Avatar">
                <div class="mes-demandes-nom">${demande.offre.conducteur.nom}</div>
            </div>
            <div class="demande-statut ${demande.statut}">
                ${getStatutText(demande.statut)}
            </div>
        </div>
        <div class="mes-demandes-trajet">
            <i class="fas fa-route"></i> ${demande.offre.point_depart} → ${demande.offre.point_arrivee}
            <br><i class="fas fa-calendar"></i> ${formatDate(demande.offre.date_depart)} à ${demande.offre.heure_depart}
            <br><i class="fas fa-users"></i> ${demande.nombre_places} place(s) demandée(s)
        </div>
        <div class="mes-demandes-actions">
            ${demande.statut === 'en_attente' ? `
                <button class="bouton-offre bouton-annuler" onclick="annulerReservation(${demande.id})">
                    <i class="fas fa-times"></i> Annuler
                </button>
            ` : ''}
            <button class="bouton-offre bouton-contacter" onclick="contacterUtilisateur(${demande.offre.conducteur.id}, '${demande.offre.conducteur.nom}')">
                <i class="fas fa-comments"></i> Contacter
            </button>
        </div>
    `;
    return div;
}

// Fonctions utilitaires
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
}

function getStatutText(statut) {
    const statuts = {
        'en_attente': 'En attente',
        'confirmee': 'Confirmée',
        'annulee': 'Annulée',
        'terminee': 'Terminée'
    };
    return statuts[statut] || statut;
}

// Fonctions d'actions
function voirDemandesOffre(offreId) {
    // TODO: Implémenter la vue détaillée des demandes pour une offre}

function modifierOffre(offreId) {
    // TODO: Implémenter la modification d'offre}

function supprimerOffre(offreId) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
        // TODO: Implémenter la suppression d'offre}
}

function repondreReservation(reservationId, statut) {
    // TODO: Implémenter la réponse aux réservations}

function annulerReservation(reservationId) {
    if (confirm('Êtes-vous sûr de vouloir annuler cette demande ?')) {
        // TODO: Implémenter l'annulation de réservation}
}

function contacterUtilisateur(userId, userName) {
    // Ouvrir messagerie et charger conversation
    const lienMessagerie = document.querySelector('[data-section="sectionMessagerie"]');
    if (lienMessagerie) {
        lienMessagerie.click();
        // Attendre l'initialisation puis charger conversation
        setTimeout(() => {
            chargerConversation(userId, userName, '../../static/css/images/defaut_profile.png');
        }, 500);
    }
}
