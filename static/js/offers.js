const imageProfile = document.getElementById('imageProfile');
const menuProfil = document.getElementById('menuProfil');

imageProfile.addEventListener('click', () => {
    menuProfil.classList.toggle('active');
});

document.addEventListener('click', (e) => {
    const clicEstEnDehors = !imageProfile.contains(e.target) && !menuProfil.contains(e.target);
    
    if (clicEstEnDehors) {
        menuProfil.classList.remove('active');
    }
});

const formulaireTrajet = document.getElementById('formulaireTrajet');

formulaireTrajet.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const informationsTrajet = {
        pointDepart: document.getElementById('pointDepart').value,
        pointArrivee: document.getElementById('pointArrivee').value,
        heureDepart: document.getElementById('heureDepart').value,
        places: document.getElementById('places').value
    };
    
    console.log('Informations du trajet:', informationsTrajet);
});

const boutonDeconnexion = document.getElementById('deconnexion');
boutonDeconnexion.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Déconnexion en cours...');
});

const boutonModifierProfil = document.getElementById('modifierProfil');
boutonModifierProfil.addEventListener('click', (e) => {
    e.preventDefault();
    console.log('Ouverture de la page de modification du profil...');
});