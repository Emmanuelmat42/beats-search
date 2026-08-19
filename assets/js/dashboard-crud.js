// =======================================
// Gestion des beats et des annonces (Firestore)
// Beats Search — dashboard.html uniquement
//
// Sécurité : ce script ne fait AUCUNE vérification de mot de
// passe. La seule protection réelle vient de Firebase
// Authentication (session déjà vérifiée par dashboard-guard.js)
// et des règles de sécurité Firestore (lecture publique,
// écriture réservée au compte producteur authentifié).
// =======================================

import { auth, db } from "./firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    query,
    orderBy,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

// ---------------------------------------
// Catalogue actuel (pour l'import unique)
// ---------------------------------------

const EXISTING_CATALOG = [
    { name: "See my crown", genre: "Afro Trap", bpm: "122", key: "Dminor", price: 5.5, imageUrl: "assets/img/beat1.jpg", audioUrl: "assets/audio/beat1.mp3" },
    { name: "vibe dancehall", genre: "Afro", bpm: "126", key: "Aminor", price: 10, imageUrl: "assets/img/beat2.jpg", audioUrl: "assets/audio/beat2.mp3" },
    { name: "Philadelfia", genre: "Philly Drill", bpm: "150", key: "Eb minor", price: 8, imageUrl: "assets/img/beat3.jpg", audioUrl: "assets/audio/beat3.mp3" },
    { name: "Hood trap", genre: "Hood Trap", bpm: "144", key: "Bminor", price: 5.5, imageUrl: "assets/img/beat4.jpg", audioUrl: "assets/audio/beat4.mp3" },
    { name: "Trap", genre: "Trap mélancolique", bpm: "140", key: "Aminor", price: 5.3, imageUrl: "assets/img/beat5.jpg", audioUrl: "assets/audio/beat5.mp3" },
    { name: "Afro", genre: "Afro Brazil & Jersey", bpm: "130", key: "Aminor", price: 7, imageUrl: "assets/img/beat6.jpg", audioUrl: "assets/audio/beat6.mp3" },
    { name: "Gang 42", genre: "Detroit Trap", bpm: "100", key: "Dminor", price: 10, imageUrl: "assets/img/beat7.jpg", audioUrl: "assets/audio/beat7.mp3" },
    { name: "Utopia", genre: "Trap Future", bpm: "140", key: "G", price: 5.5, imageUrl: "assets/img/beat8.jpg", audioUrl: "assets/audio/beat8.mp3" },
    { name: "BelAir", genre: "Trap & Shatta", bpm: "98", key: "E", price: 5.5, imageUrl: "assets/img/beat9.jpg", audioUrl: "assets/audio/beat9.mp3" },
    { name: "Afro Vibes", genre: "Afro Beats", bpm: "100", key: "", price: 5.5, imageUrl: "assets/img/beat10.jpg", audioUrl: "assets/audio/beat10.mp3" },
    { name: "Last Dance", genre: "Trap Love", bpm: "82", key: "Em", price: 5.5, imageUrl: "assets/img/beat11.jpg", audioUrl: "assets/audio/beat11.mp3" },
    { name: "Hear From You", genre: "Sexy Drill", bpm: "160", key: "A#m", price: 5.5, imageUrl: "assets/img/beat12.jpg", audioUrl: "assets/audio/beat12.mp3" },
    { name: "Chemin de Platine", genre: "Trap", bpm: "119", key: "A#m", price: 5.5, imageUrl: "assets/img/beat13.jpg", audioUrl: "assets/audio/beat13.mp3" }
];

function escapeHtml(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, (c) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[c]));
}

// ---------------------------------------
// Modale de confirmation réutilisable
// ---------------------------------------

function showConfirmModal(message, confirmLabel, onConfirm) {

    const modal = document.getElementById("confirmModal");
    const msgEl = document.getElementById("confirmModalMessage");
    const yesBtn = document.getElementById("confirmModalYes");
    const noBtn = document.getElementById("confirmModalNo");

    if (!modal || !msgEl || !yesBtn || !noBtn) return;

    msgEl.textContent = message;
    yesBtn.textContent = confirmLabel || "Confirmer";
    modal.hidden = false;

    function cleanup() {
        modal.hidden = true;
        yesBtn.removeEventListener("click", onYes);
        noBtn.removeEventListener("click", onNo);
    }

    function onYes() {
        cleanup();
        onConfirm();
    }

    function onNo() {
        cleanup();
    }

    yesBtn.addEventListener("click", onYes);
    noBtn.addEventListener("click", onNo);

}

// ---------------------------------------
// Attente de la connexion Firebase avant
// toute opération Firestore
// ---------------------------------------

onAuthStateChanged(auth, (user) => {

    if (!user) return; // dashboard-guard.js gère déjà le refus d'accès

    loadBeats();
    loadAnnouncements();

    const importBtn = document.getElementById("importCatalogBtn");

    if (importBtn) {
        importBtn.addEventListener("click", () => {

            showConfirmModal(
                "Importer les beats du catalogue qui ne sont pas encore dans Firestore ?",
                "Importer",
                async () => {

                    importBtn.disabled = true;
                    importBtn.textContent = "Vérification des doublons...";

                    try {

                        // On récupère les beats déjà présents pour ne
                        // jamais importer deux fois le même (comparaison
                        // par nom, insensible à la casse/espaces).
                        const existingSnapshot = await getDocs(collection(db, "beats"));
                        const existingNames = new Set();

                        existingSnapshot.forEach((docSnap) => {
                            const n = (docSnap.data().name || "").trim().toLowerCase();
                            if (n) existingNames.add(n);
                        });

                        const toImport = EXISTING_CATALOG.filter((beat) =>
                            !existingNames.has(beat.name.trim().toLowerCase())
                        );

                        if (toImport.length === 0) {
                            importBtn.textContent = "✓ Catalogue déjà importé";
                            return;
                        }

                        importBtn.textContent = "Import en cours...";

                        for (const beat of toImport) {
                            await addDoc(collection(db, "beats"), {
                                ...beat,
                                active: true,
                                createdAt: serverTimestamp()
                            });
                        }

                        importBtn.textContent = "✓ " + toImport.length + " beat(s) importé(s)";
                        loadBeats();

                    } catch (error) {
                        console.error("Erreur import catalogue :", error);
                        importBtn.textContent = "Erreur — réessaie";
                        importBtn.disabled = false;
                    }

                }
            );

        });
    }

});


// =========================================================
// GESTION DES BEATS
// =========================================================

const beatForm = document.getElementById("beatForm");
const beatIdInput = document.getElementById("beatId");
const beatNameInput = document.getElementById("beatName");
const beatGenreInput = document.getElementById("beatGenre");
const beatBpmInput = document.getElementById("beatBpm");
const beatKeyInput = document.getElementById("beatKey");
const beatPriceInput = document.getElementById("beatPrice");
const beatImageUrlInput = document.getElementById("beatImageUrl");
const beatAudioUrlInput = document.getElementById("beatAudioUrl");
const beatActiveInput = document.getElementById("beatActive");
const beatDescriptionInput = document.getElementById("beatDescription");
const beatFormError = document.getElementById("beatFormError");
const beatFormSubmit = document.getElementById("beatFormSubmit");
const beatFormCancel = document.getElementById("beatFormCancel");
const beatsListEl = document.getElementById("beatsList");
const statBeatsCount = document.getElementById("statBeatsCount");
const statActiveBeatsCount = document.getElementById("statActiveBeatsCount");

function resetBeatForm() {

    if (!beatForm) return;

    beatForm.reset();
    beatIdInput.value = "";
    beatActiveInput.checked = true;
    beatFormError.hidden = true;
    beatFormSubmit.textContent = "Ajouter le beat";
    beatFormCancel.hidden = true;

}

function fillBeatForm(id, beat) {

    beatIdInput.value = id;
    beatNameInput.value = beat.name || "";
    beatGenreInput.value = beat.genre || "";
    beatBpmInput.value = beat.bpm || "";
    beatKeyInput.value = beat.key || "";
    beatPriceInput.value = beat.price || "";
    beatImageUrlInput.value = beat.imageUrl || "";
    beatAudioUrlInput.value = beat.audioUrl || "";
    beatActiveInput.checked = beat.active !== false;
    beatDescriptionInput.value = beat.description || "";

    beatFormSubmit.textContent = "Enregistrer les modifications";
    beatFormCancel.hidden = false;

    beatForm.scrollIntoView({ behavior: "smooth", block: "start" });

}

async function loadBeats() {

    if (!beatsListEl) return;

    try {

        const beatsQuery = query(collection(db, "beats"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(beatsQuery);

        if (statBeatsCount) statBeatsCount.textContent = snapshot.size;

        let activeCount = 0;

        if (snapshot.empty) {
            beatsListEl.innerHTML = '<p class="dashboard-empty">Aucun beat dans Firestore pour le moment. Utilise "Importer le catalogue actuel" ou ajoute un beat ci-dessus.</p>';
            if (statActiveBeatsCount) statActiveBeatsCount.textContent = "0";
            return;
        }

        beatsListEl.innerHTML = "";

        snapshot.forEach((docSnap) => {

            const beat = docSnap.data();
            const id = docSnap.id;

            if (beat.active !== false) activeCount++;

            const item = document.createElement("div");
            item.className = "admin-item";

            item.innerHTML =
                '<div class="admin-item-info">' +
                    '<strong>' + escapeHtml(beat.name) + '</strong>' +
                    '<span>' + escapeHtml(beat.genre) + ' • ' + escapeHtml(beat.bpm) + ' BPM • ' + escapeHtml(beat.key) + '</span>' +
                    '<span class="admin-item-price">' + (beat.price || 0) + ' $</span>' +
                    (beat.active === false ? '<span class="admin-item-inactive">Masqué</span>' : '') +
                '</div>' +
                '<div class="admin-item-actions">' +
                    '<button type="button" class="admin-edit-btn" data-id="' + id + '">Modifier</button>' +
                    '<button type="button" class="admin-delete-btn" data-id="' + id + '">Supprimer</button>' +
                '</div>';

            beatsListEl.appendChild(item);

            item.querySelector(".admin-edit-btn").addEventListener("click", () => {
                fillBeatForm(id, beat);
            });

            item.querySelector(".admin-delete-btn").addEventListener("click", () => {
                showConfirmModal(
                    'Voulez-vous vraiment supprimer le beat « ' + (beat.name || "") + ' » ?',
                    "Supprimer",
                    async () => {
                        try {
                            await deleteDoc(doc(db, "beats", id));
                            loadBeats();
                        } catch (error) {
                            console.error("Erreur suppression beat :", error);
                        }
                    }
                );
            });

        });

        if (statActiveBeatsCount) statActiveBeatsCount.textContent = activeCount;

    } catch (error) {
        console.error("Erreur chargement beats :", error);
        beatsListEl.innerHTML = '<p class="dashboard-empty">Impossible de charger les beats pour le moment.</p>';
    }

}

if (beatForm) {

    beatForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const name = beatNameInput.value.trim();
        const genre = beatGenreInput.value.trim();
        const price = parseFloat(beatPriceInput.value);

        if (!name || !genre || isNaN(price)) {
            beatFormError.textContent = "⚠️ Le nom, le genre et le prix sont obligatoires.";
            beatFormError.hidden = false;
            return;
        }

        beatFormError.hidden = true;

        const data = {
            name: name,
            genre: genre,
            bpm: beatBpmInput.value.trim(),
            key: beatKeyInput.value.trim(),
            price: price,
            imageUrl: beatImageUrlInput.value.trim(),
            audioUrl: beatAudioUrlInput.value.trim(),
            description: beatDescriptionInput.value.trim(),
            active: beatActiveInput.checked
        };

        const editingId = beatIdInput.value;

        beatFormSubmit.disabled = true;

        try {

            if (editingId) {
                await updateDoc(doc(db, "beats", editingId), data);
            } else {
                data.createdAt = serverTimestamp();
                await addDoc(collection(db, "beats"), data);
            }

            resetBeatForm();
            loadBeats();

        } catch (error) {
            console.error("Erreur enregistrement beat :", error);
            beatFormError.textContent = "❌ Erreur lors de l'enregistrement. Réessaie.";
            beatFormError.hidden = false;
        } finally {
            beatFormSubmit.disabled = false;
        }

    });

}

if (beatFormCancel) {
    beatFormCancel.addEventListener("click", resetBeatForm);
}


// =========================================================
// GESTION DES ANNONCES
// =========================================================

const announcementForm = document.getElementById("announcementForm");
const announcementIdInput = document.getElementById("announcementId");
const announcementTitleInput = document.getElementById("announcementTitle");
const announcementMessageInput = document.getElementById("announcementMessage");
const announcementActiveInput = document.getElementById("announcementActive");
const announcementFormError = document.getElementById("announcementFormError");
const announcementFormSubmit = document.getElementById("announcementFormSubmit");
const announcementFormCancel = document.getElementById("announcementFormCancel");
const announcementsListEl = document.getElementById("announcementsList");
const statAnnouncementsCount = document.getElementById("statAnnouncementsCount");

function resetAnnouncementForm() {

    if (!announcementForm) return;

    announcementForm.reset();
    announcementIdInput.value = "";
    announcementActiveInput.checked = true;
    announcementFormError.hidden = true;
    announcementFormSubmit.textContent = "Publier l'annonce";
    announcementFormCancel.hidden = true;

}

function fillAnnouncementForm(id, announcement) {

    announcementIdInput.value = id;
    announcementTitleInput.value = announcement.title || "";
    announcementMessageInput.value = announcement.message || "";
    announcementActiveInput.checked = announcement.active !== false;

    announcementFormSubmit.textContent = "Enregistrer les modifications";
    announcementFormCancel.hidden = false;

    announcementForm.scrollIntoView({ behavior: "smooth", block: "start" });

}

async function loadAnnouncements() {

    if (!announcementsListEl) return;

    try {

        const announcementsQuery = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(announcementsQuery);

        if (statAnnouncementsCount) statAnnouncementsCount.textContent = snapshot.size;

        if (snapshot.empty) {
            announcementsListEl.innerHTML = '<p class="dashboard-empty">Aucune annonce pour le moment.</p>';
            return;
        }

        announcementsListEl.innerHTML = "";

        snapshot.forEach((docSnap) => {

            const announcement = docSnap.data();
            const id = docSnap.id;

            const item = document.createElement("div");
            item.className = "admin-item";

            item.innerHTML =
                '<div class="admin-item-info">' +
                    '<strong>' + escapeHtml(announcement.title) + '</strong>' +
                    '<span>' + escapeHtml(announcement.message) + '</span>' +
                    (announcement.active === false
                        ? '<span class="admin-item-inactive">Inactive</span>'
                        : '<span class="admin-item-active">Active</span>') +
                '</div>' +
                '<div class="admin-item-actions">' +
                    '<button type="button" class="admin-toggle-btn" data-id="' + id + '">' +
                        (announcement.active === false ? "Activer" : "Désactiver") +
                    '</button>' +
                    '<button type="button" class="admin-edit-btn" data-id="' + id + '">Modifier</button>' +
                    '<button type="button" class="admin-delete-btn" data-id="' + id + '">Supprimer</button>' +
                '</div>';

            announcementsListEl.appendChild(item);

            item.querySelector(".admin-edit-btn").addEventListener("click", () => {
                fillAnnouncementForm(id, announcement);
            });

            item.querySelector(".admin-toggle-btn").addEventListener("click", async () => {
                try {
                    await updateDoc(doc(db, "announcements", id), {
                        active: announcement.active === false
                    });
                    loadAnnouncements();
                } catch (error) {
                    console.error("Erreur activation/désactivation annonce :", error);
                }
            });

            item.querySelector(".admin-delete-btn").addEventListener("click", () => {
                showConfirmModal(
                    'Voulez-vous vraiment supprimer l\'annonce « ' + (announcement.title || "") + ' » ?',
                    "Supprimer",
                    async () => {
                        try {
                            await deleteDoc(doc(db, "announcements", id));
                            loadAnnouncements();
                        } catch (error) {
                            console.error("Erreur suppression annonce :", error);
                        }
                    }
                );
            });

        });

    } catch (error) {
        console.error("Erreur chargement annonces :", error);
        announcementsListEl.innerHTML = '<p class="dashboard-empty">Impossible de charger les annonces pour le moment.</p>';
    }

}

if (announcementForm) {

    announcementForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const title = announcementTitleInput.value.trim();
        const message = announcementMessageInput.value.trim();

        if (!title || !message) {
            announcementFormError.textContent = "⚠️ Le titre et le message sont obligatoires.";
            announcementFormError.hidden = false;
            return;
        }

        announcementFormError.hidden = true;

        const data = {
            title: title,
            message: message,
            active: announcementActiveInput.checked
        };

        const editingId = announcementIdInput.value;

        announcementFormSubmit.disabled = true;

        try {

            if (editingId) {
                await updateDoc(doc(db, "announcements", editingId), data);
            } else {
                data.createdAt = serverTimestamp();
                await addDoc(collection(db, "announcements"), data);
            }

            resetAnnouncementForm();
            loadAnnouncements();

        } catch (error) {
            console.error("Erreur enregistrement annonce :", error);
            announcementFormError.textContent = "❌ Erreur lors de l'enregistrement. Réessaie.";
            announcementFormError.hidden = false;
        } finally {
            announcementFormSubmit.disabled = false;
        }

    });

}

if (announcementFormCancel) {
    announcementFormCancel.addEventListener("click", resetAnnouncementForm);
}
