// Toggle menu profil
const imageProfile = document.getElementById('imageProfile');
const menuProfil = document.getElementById('menuProfil');

imageProfile.addEventListener('click', () => {
    menuProfil.classList.toggle('active');
});

// Fermer le menu quand on clique ailleurs
document.addEventListener('click', (e) => {
    if (!imageProfile.contains(e.target) && !menuProfil.contains(e.target)) {
        menuProfil.classList.remove('active');
    }
});

// Gestion du formulaire
const formulaireTrajet = document.getElementById('formulaireTrajet');
formulaireTrajet.addEventListener('submit', (e) => {
    e.preventDefault();
    const donnees = {
        pointDepart: document.getElementById('pointDepart').value,
        pointArrivee: document.getElementById('pointArrivee').value,
        heureDepart: document.getElementById('heureDepart').value,
        places: document.getElementById('places').value
    };
    console.log('Formulaire soumis:', donnees);
    // Ajouter votre appel API ici pour sauvegarder les données
});

// Gestion de la déconnexion
document.getElementById('deconnexion').addEventListener('click', (e) => {
    e.preventDefault();
    // Ajouter votre logique de déconnexion ici
    console.log('Déconnexion cliquée');
});

// Gestion de la modification du profil
document.getElementById('modifierProfil').addEventListener('click', (e) => {
    e.preventDefault();
    // Ajouter votre logique de modification de profil ici
    console.log('Modification du profil cliquée');
}); 