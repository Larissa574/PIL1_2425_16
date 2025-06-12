function toggleConducteurFields() {
    const role = document.getElementById("role").value;
    const conducteurFields = document.getElementById("conducteur-fields");
    conducteurFields.style.display = role === "conducteur" ? "block" : "none";
}

function togglePassword() {
    const input = document.getElementById("password");
    input.type = input.type === "password" ? "text" : "password";
}

document.addEventListener("DOMContentLoaded", function() {
    const emailInput = document.getElementById("email");
    const emailMessage = document.getElementById("email-message");

    emailInput.addEventListener("blur", function () {
        const email = emailInput.value;
        if (!email.includes("@")) {
            emailMessage.textContent = "Email invalide.";
        } else {
            // Exemple AJAX (à connecter côté Django)
            fetch(`/verifier_email/?email=${email}`)
                .then(res => res.json())
                .then(data => {
                    emailMessage.textContent = data.exists ? "Email déjà utilisé." : "";
                });
        }
    });
});
