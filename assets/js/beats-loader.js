// =======================================
// Chargement des beats depuis Firestore
// Beats Search — beats.html uniquement
//
// IMPORTANT : si Firestore est vide (aucun beat encore
// importé) ou si la requête échoue, les 13 cartes statiques
// déjà présentes dans le HTML restent affichées telles quelles.
// Rien n'est jamais supprimé sans données de remplacement valides.
// =======================================

import { db } from "./firebase-config.js";
import {
    collection,
    getDocs,
    query,
    where
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

function buildWhatsappLink(beat) {

    const text =
        "Bonjour Matis Production, je souhaite acheter le beat « " +
        (beat.name || "") + " » (" +
        (beat.genre || "") + ", " +
        (beat.bpm || "") + " BPM) au prix de " +
        (beat.price || 0) + " $.";

    return "https://wa.me/243853461191?text=" + encodeURIComponent(text);

}

function buildBeatCard(id, beat, order) {

    const card = document.createElement("div");
    card.className = "beat-card";
    card.dataset.id = id;
    card.dataset.name = (beat.name || "").toLowerCase();
    card.dataset.genre = beat.genre || "";
    card.dataset.bpm = beat.bpm || "";
    card.dataset.key = beat.key || "";
    card.dataset.price = beat.price || 0;
    card.dataset.order = order;

    const safeName = escapeHtml(beat.name);
    const safeGenre = escapeHtml(beat.genre);
    const safeBpm = escapeHtml(beat.bpm);
    const safeKey = escapeHtml(beat.key);
    const safeImage = escapeHtml(beat.imageUrl);
    const safeAudio = escapeHtml(beat.audioUrl);
    const price = beat.price || 0;

    card.innerHTML =
        '<div class="beat-card-media">' +
            '<img src="' + safeImage + '" alt="Pochette du beat ' + safeName + '" loading="lazy">' +
        '</div>' +
        '<div class="beat-info">' +
            '<div class="beat-badges">' +
                '<span class="badge badge-genre">' + safeGenre + '</span>' +
                '<span class="badge badge-price">' + price + ' $</span>' +
            '</div>' +
            '<h3>' + safeName + '</h3>' +
            '<p>' + safeGenre + ' • ' + safeBpm + ' BPM • ' + safeKey + '</p>' +
            '<audio controls preload="none">' +
                '<source src="' + safeAudio + '" type="audio/mpeg">' +
                'Ton navigateur ne supporte pas la lecture audio.' +
            '</audio>' +
            '<a class="buy-btn" href="' + buildWhatsappLink(beat) + '" target="_blank" rel="noopener">Commander</a>' +
        '</div>';

    return card;

}

async function loadBeatsFromFirestore() {

    const container = document.querySelector(".beat-container");

    if (!container) return; // pas sur la page beats

    try {

        const beatsQuery = query(
            collection(db, "beats"),
            where("active", "==", true)
        );

        const snapshot = await getDocs(beatsQuery);

        if (snapshot.empty) {
            // Aucune donnée dans Firestore pour l'instant :
            // on garde le catalogue statique existant tel quel.
            return;
        }

        // Tri côté client (plus récent en premier) : évite d'avoir
        // besoin d'un index composite Firestore (where + orderBy sur
        // deux champs différents).
        const docsArray = snapshot.docs.slice().sort((a, b) => {
            const timeA = a.data().createdAt ? a.data().createdAt.toMillis() : 0;
            const timeB = b.data().createdAt ? b.data().createdAt.toMillis() : 0;
            return timeB - timeA;
        });

        const customCard = container.querySelector(".custom-production");

        // On retire uniquement les anciennes cartes de beats,
        // jamais la carte "Production sur mesure".
        container.querySelectorAll(".beat-card").forEach((card) => card.remove());

        let order = docsArray.length;

        docsArray.forEach((docSnap) => {
            const card = buildBeatCard(docSnap.id, docSnap.data(), order);
            container.insertBefore(card, customCard || null);

            // Force le navigateur à reconnaître correctement la balise
            // <source> injectée dynamiquement (sinon la lecture peut être
            // lente ou capricieuse selon les navigateurs).
            const audioEl = card.querySelector("audio");
            if (audioEl) audioEl.load();

            order--;
        });

        // Ré-attache le lecteur audio personnalisé et la recherche/filtres
        // sur les nouvelles cartes générées dynamiquement.
        if (window.initBeatsSearchUI) {
            if (window.initBeatsSearchUI.initCustomAudioPlayers) {
                window.initBeatsSearchUI.initCustomAudioPlayers();
            }
            if (window.initBeatsSearchUI.initBeatsSearch) {
                window.initBeatsSearchUI.initBeatsSearch();
            }
        }

    } catch (error) {
        // En cas d'erreur réseau/Firestore, on ne casse rien :
        // le catalogue statique déjà dans le HTML reste affiché.
        console.error("Chargement Firestore impossible, catalogue statique conservé :", error);
    }

}

loadBeatsFromFirestore();
