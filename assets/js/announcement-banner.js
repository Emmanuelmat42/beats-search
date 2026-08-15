// =======================================
// Bannière d'annonce (Firestore)
// Beats Search — index.html uniquement
// =======================================

import { db } from "./firebase-config.js";
import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

function escapeHtml(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, (c) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[c]));
}

async function loadAnnouncementBanner() {

    const container = document.getElementById("announcementBanner");

    if (!container) return;

    try {

        const announcementsQuery = query(
            collection(db, "announcements"),
            where("active", "==", true),
            orderBy("createdAt", "desc"),
            limit(1)
        );

        const snapshot = await getDocs(announcementsQuery);

        if (snapshot.empty) return;

        const docSnap = snapshot.docs[0];
        const data = docSnap.data();

        const dismissedId = localStorage.getItem("bs_dismissed_announcement");

        if (dismissedId === docSnap.id) return;

        container.innerHTML =
            '<div class="announcement-inner">' +
                '<span class="announcement-icon">📢</span>' +
                '<div class="announcement-text">' +
                    '<strong>' + escapeHtml(data.title) + '</strong>' +
                    '<span>' + escapeHtml(data.message) + '</span>' +
                '</div>' +
                '<button type="button" class="announcement-close" aria-label="Fermer l\'annonce">✕</button>' +
            '</div>';

        container.hidden = false;
        document.body.classList.add("has-announcement");

        const closeBtn = container.querySelector(".announcement-close");

        if (closeBtn) {
            closeBtn.addEventListener("click", () => {
                container.hidden = true;
                document.body.classList.remove("has-announcement");
                localStorage.setItem("bs_dismissed_announcement", docSnap.id);
            });
        }

    } catch (error) {
        // Pas d'annonce affichée en cas d'erreur — ne bloque jamais la page.
        console.error("Impossible de charger l'annonce :", error);
    }

}

loadAnnouncementBanner();
