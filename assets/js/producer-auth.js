// =======================================
// Connexion producteur — Firebase Authentication
// Beats Search — page index.html uniquement
//
// Le bouton hamburger et le panneau latéral (ouverture/fermeture)
// sont gérés dans script.js, SANS dépendre de Firebase, pour que
// le menu fonctionne même si ce module Firebase échoue à charger.
// =======================================

import { auth } from "./firebase-config.js";
import {
    signInWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

// ---------------------------------------
// CONNEXION FIREBASE
// ---------------------------------------

const loginForm = document.getElementById("producerLoginForm");

if (loginForm) {

    const emailInput = document.getElementById("producerUser");
    const passInput = document.getElementById("producerPass");
    const submitBtn = loginForm.querySelector(".production-submit");
    const noteEl = document.getElementById("producerLoginNote");
    const defaultNoteText = noteEl ? noteEl.textContent : "";

    function showError(message) {
        if (!noteEl) return;
        noteEl.textContent = message;
        noteEl.classList.add("producer-login-error");
    }

    function resetNote() {
        if (!noteEl) return;
        noteEl.textContent = defaultNoteText;
        noteEl.classList.remove("producer-login-error");
    }

    loginForm.addEventListener("submit", (event) => {

        event.preventDefault();
        resetNote();

        const email = emailInput.value.trim();
        const password = passInput.value;

        if (!email || !password) {
            showError("⚠️ Merci de renseigner ton email et ton mot de passe.");
            return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = "Connexion...";

        signInWithEmailAndPassword(auth, email, password)
            .then(() => {
                window.location.href = "dashboard.html";
            })
            .catch((error) => {

                submitBtn.disabled = false;
                submitBtn.textContent = "Se connecter";

                switch (error.code) {

                    case "auth/invalid-credential":
                    case "auth/wrong-password":
                    case "auth/user-not-found":
                        showError("❌ Email ou mot de passe incorrect.");
                        break;

                    case "auth/invalid-email":
                        showError("❌ Adresse email invalide.");
                        break;

                    case "auth/too-many-requests":
                        showError("⏳ Trop de tentatives. Réessaie dans quelques minutes.");
                        break;

                    default:
                        showError("❌ Connexion impossible pour le moment. Réessaie plus tard.");
                        console.error("Erreur Firebase Auth :", error);

                }

            });

    });

}
