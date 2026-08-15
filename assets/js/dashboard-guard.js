// =======================================
// Protection de l'espace producteur
// Beats Search — dashboard.html uniquement
// =======================================

import { auth } from "./firebase-config.js";
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const checking = document.getElementById("dashboardChecking");
const denied = document.getElementById("dashboardDenied");
const content = document.getElementById("dashboardContent");
const logoutBtn = document.getElementById("dashboardLogout");
const welcomeEmail = document.getElementById("dashboardUserEmail");

onAuthStateChanged(auth, (user) => {

    if (checking) checking.hidden = true;

    if (user) {

        if (content) content.hidden = false;
        if (logoutBtn) logoutBtn.hidden = false;
        if (welcomeEmail) welcomeEmail.textContent = user.email;

    } else {

        if (denied) denied.hidden = false;

    }

});

if (logoutBtn) {

    logoutBtn.addEventListener("click", () => {

        signOut(auth).then(() => {
            window.location.href = "index.html";
        });

    });

}
