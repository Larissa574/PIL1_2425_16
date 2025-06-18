// Données de matching (peuvent être remplacées par un appel API)
// const matchingData = [
    
// ];

// // Fonction pour simuler un nouveau matching aléatoire
// function generateRandomMatch() {
//     const lieux = ["Cotonou", "Calavi", "Porto-Novo", "Abomey-Calavi", "Parakou"];
//     const heures = ["07h00", "07h30", "08h00", "08h30", "09h00"];
//     const points = ["Étoile Rouge", "Zogbadjè", "Akpakpa", "Védoko", "Godomey"];

//     const randomIndex = (max) => Math.floor(Math.random() * max);

//     return {
//         conducteur: Conducteur{ String.fromCharCode(65 + randomIndex(5)) };
//     depart: lieux[randomIndex(lieux.length)],
//         destination: lieux[randomIndex(lieux.length)],x
//             heure: heures[randomIndex(heures.length)],
//                 passagers: [
//                     { nom: Passager{ String.fromCharCode(65 + randomIndex(5)) ,
//                      point: points[randomIndex(points.length)] }
// { nom: Passager{ String.fromCharCode(65 + randomIndex(5)) };
//  point: points[randomIndex(points.length)] }
//         ]
//       };
//     }


// // Chargement initial
// window.onload = loadMatching;
document.addEventListener("DOMContentLoaded", function(){
    fetch('/matching/api/matching/')
        .then (response => response.json())
        .then (data => {
            const container = document.getElementById('resultats-container');
            container.innerHTML = "";

            if (data.matchs.length == 0){
                container.innerHTML = "<p> Aucun trajet trouvé.</p>";
                return ;
            }
            const ul = document.createElement("ul")
            data.matchs.array.forEach(trajet => { 
                const li = document.createElement("li")
                li.innerHTML.HTML = `
                <strong>Conducteur:</strong> ${trajet.conducteur.username} <br>
                <strong>Départ:</strong> ${trajet.pointDeDepart} <br>
                <strong>Arrivée:</strong> ${trajet.pointDeArrivee} <br>
                <strong>Heure de départ:</strong> ${trajet.heureDeDepart} <br>
                <strong>Nombre de place disponibles:</strong> ${trajet.place_disponibles} <br></br>`;
                ul.appendChild(li);                
            });
            container.appendChild(ul);
        })
        .catch(error => {
            console.error("Erreur lors du chargement:", error);
            document.getElementById("resultats-container").innerHTML = "<p> Une erreur s'est produite.</p>";
        });
});

// Fonction principale de chargement
// function loadMatching(relancer = false) {
//     const resultsDiv = document.getElementById("results");

//     // Afficher un message de chargement
//     resultsDiv.innerHTML = '<p class="loading">Chargement en cours...</p>';

//     // Simuler un délai de chargement (comme une requête API)
//     setTimeout(() => {
//         resultsDiv.innerHTML = "";

//         // Utiliser soit les données fixes, soit générer aléatoirement
//         const dataToUse = relancer ? [generateRandomMatch(), generateRandomMatch()] : matchingData;

//         dataToUse.forEach(match => {
//             const card = document.createElement("div");
//             card.className = "card";
//             card.innerHTML = `
//             <h2>🚗 Conducteur : ${match.conducteur}</h2>
//             <p><strong>Départ :</strong> ${match.depart}</p>
// <p><strong>Destination :</strong> ${match.destination}</p>
//             <p><strong>Heure :</strong> ${match.heure}</p>
//             <h3>👥 Passagers :</h3>
//             <ul class="passengers">
//               ${match.passagers.map(p => <li>👤 ${p.nom} – Prise en charge : ${p.point}</li>).join('')}
//             </ul>
//           `;
//             resultsDiv.appendChild(card);
//         });
//     }, 800); // Délai simulé de 800ms
// }
