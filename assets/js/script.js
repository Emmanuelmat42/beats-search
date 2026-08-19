// =======================================
// Beats Search
// Powered by Matis Production
// Version 2.1
// =======================================

console.log("Beats Search Ready 🚀");

// =======================================
// NAVBAR AU SCROLL
// =======================================

const header = document.querySelector("header");

if (header) {

    window.addEventListener("scroll", () => {

        if (window.scrollY > 50) {

            header.classList.add("scroll");

        } else {

            header.classList.remove("scroll");

        }

    });

}


// =======================================
// RETOUR EN HAUT
// =======================================

const topButton=document.createElement("button");

topButton.innerHTML="⬆";

topButton.id="topButton";

document.body.appendChild(topButton);

window.addEventListener("scroll",()=>{

    if(window.scrollY>500){

        topButton.classList.add("showTop");

    }

    else{

        topButton.classList.remove("showTop");

    }

});

topButton.addEventListener("click",()=>{

    window.scrollTo({

        top:0,

        behavior:"smooth"

    });

});

// =======================================
// Un seul lecteur audio à la fois
// (écoute déléguée : fonctionne aussi pour les
// lecteurs ajoutés dynamiquement après coup, ex. Firestore)
// =======================================

document.addEventListener("play", (event) => {

    const target = event.target;

    if (!target || target.tagName !== "AUDIO") return;

    document.querySelectorAll("audio").forEach((otherPlayer) => {

        if (otherPlayer !== target && !otherPlayer.paused) {
            otherPlayer.pause();
            otherPlayer.currentTime = 0;
        }

    });

}, true); // phase de capture : nécessaire car "play" ne remonte pas (bubble)

// =======================================
// HERO STATS MOBILE
// =======================================

(function initHeroStatsCarousel(){

    const stats = document.querySelectorAll(".hero-stats .stat");

    if(!stats.length) return;

    let index = 0;
    let intervalId = null;

    function start(){

        if(intervalId) return;

        intervalId = setInterval(()=>{

            stats[index].classList.remove("active");

            index++;

            if(index >= stats.length){
                index = 0;
            }

            stats[index].classList.add("active");

        },2000);

    }

    function stop(){

        clearInterval(intervalId);
        intervalId = null;

    }

    function sync(){

        if(window.innerWidth <= 768){
            start();
        } else {
            stop();
        }

    }

    sync();

    window.addEventListener("resize", sync);

})();

// =======================================
// FIN
// =======================================

// =======================================
// MENU HAMBURGER (mobile)
// =======================================

function initMobileMenu() {

    const navbar = document.querySelector(".navbar");
    const toggle = document.querySelector(".menu-toggle");

    if (!navbar || !toggle) return;

    const links = navbar.querySelectorAll(".nav-links a");

    function closeMenu() {
        navbar.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "☰";
    }

    function openMenu() {
        navbar.classList.add("nav-open");
        toggle.setAttribute("aria-expanded", "true");
        toggle.textContent = "✕";
    }

    toggle.addEventListener("click", () => {
        if (navbar.classList.contains("nav-open")) {
            closeMenu();
        } else {
            openMenu();
        }
    });

    links.forEach((link) => {
        link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && navbar.classList.contains("nav-open")) {
            closeMenu();
            toggle.focus();
        }
    });

    // Ferme le menu si l'écran repasse en desktop
    window.addEventListener("resize", () => {
        if (window.innerWidth > 900) {
            closeMenu();
        }
    });

}

initMobileMenu();


// =======================================
// PANNEAU PRODUCTEUR (page d'accueil)
// Aucune dépendance à Firebase : le bouton doit
// toujours fonctionner, même si producer-auth.js
// (module Firebase) échoue à charger.
// =======================================

function initProducerPanel() {

    const toggle = document.getElementById("producerMenuToggle");
    const panel = document.getElementById("producerPanel");
    const overlay = document.getElementById("producerOverlay");
    const closeBtn = document.getElementById("producerPanelClose");
    const accessBtn = document.getElementById("producerAccessBtn");
    const backBtn = document.getElementById("producerBackBtn");
    const defaultView = document.getElementById("producerPanelDefault");
    const loginForm = document.getElementById("producerLoginForm");

    if (!toggle || !panel || !overlay) return;

    function openPanel() {
        panel.classList.add("open");
        overlay.hidden = false;
        panel.setAttribute("aria-hidden", "false");
        toggle.setAttribute("aria-expanded", "true");
    }

    function closePanel() {
        panel.classList.remove("open");
        overlay.hidden = true;
        panel.setAttribute("aria-hidden", "true");
        toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", openPanel);
    overlay.addEventListener("click", closePanel);
    if (closeBtn) closeBtn.addEventListener("click", closePanel);

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && panel.classList.contains("open")) {
            closePanel();
        }
    });

    if (accessBtn && defaultView && loginForm) {
        accessBtn.addEventListener("click", () => {
            defaultView.hidden = true;
            loginForm.hidden = false;
        });
    }

    if (backBtn && defaultView && loginForm) {
        backBtn.addEventListener("click", () => {
            loginForm.hidden = true;
            defaultView.hidden = false;
        });
    }

}

initProducerPanel();


// =======================================
// LECTEUR AUDIO PERSONNALISÉ
// (progressive enhancement — si ça échoue,
// le <audio controls> natif reste utilisable)
// =======================================

function formatPlayerTime(seconds) {

    if (!isFinite(seconds) || isNaN(seconds)) return "0:00";

    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, "0");

    return m + ":" + s;

}

function initCustomAudioPlayers() {

    const cards = document.querySelectorAll(".beat-card");

    if (!cards.length) return;

    cards.forEach((card) => {

        const audio = card.querySelector("audio");
        const info = card.querySelector(".beat-info");

        if (!audio || !info) return;

        const player = document.createElement("div");
        player.className = "custom-player";
        player.innerHTML =
            '<button type="button" class="player-btn" aria-label="Lecture">' +
                '<span class="icon-play">▶</span>' +
                '<span class="icon-pause" hidden>⏸</span>' +
            '</button>' +
            '<div class="player-track">' +
                '<input type="range" class="player-progress" value="0" min="0" max="100" step="0.1" aria-label="Progression de la lecture">' +
                '<div class="player-time">' +
                    '<span class="current-time">0:00</span>' +
                    '<span class="duration">0:00</span>' +
                '</div>' +
            '</div>';

        audio.insertAdjacentElement("afterend", player);
        audio.classList.add("audio-native-hidden");
        audio.tabIndex = -1;

        const playBtn = player.querySelector(".player-btn");
        const iconPlay = player.querySelector(".icon-play");
        const iconPause = player.querySelector(".icon-pause");
        const progress = player.querySelector(".player-progress");
        const currentTimeEl = player.querySelector(".current-time");
        const durationEl = player.querySelector(".duration");

        const img = card.querySelector(".beat-card-media img, img");
        let overlayBtn = null;

        if (img) {
            overlayBtn = document.createElement("button");
            overlayBtn.type = "button";
            overlayBtn.className = "card-play-overlay";
            overlayBtn.setAttribute("aria-label", "Lecture / Pause du beat");
            overlayBtn.innerHTML =
                '<span class="icon-play">▶</span>' +
                '<span class="icon-pause" hidden>⏸</span>';
            img.insertAdjacentElement("afterend", overlayBtn);
        }

        function updateIcons(isPlaying) {

            iconPlay.hidden = isPlaying;
            iconPause.hidden = !isPlaying;

            if (overlayBtn) {
                overlayBtn.querySelector(".icon-play").hidden = isPlaying;
                overlayBtn.querySelector(".icon-pause").hidden = !isPlaying;
            }

            card.classList.toggle("is-playing", isPlaying);

        }

        function togglePlay() {

            if (audio.paused) {
                audio.play().catch(() => {});
            } else {
                audio.pause();
            }

        }

        playBtn.addEventListener("click", togglePlay);

        if (overlayBtn) {
            overlayBtn.addEventListener("click", togglePlay);
        }

        audio.addEventListener("loadedmetadata", () => {
            durationEl.textContent = formatPlayerTime(audio.duration);
        });

        audio.addEventListener("timeupdate", () => {

            if (audio.duration) {
                progress.value = (audio.currentTime / audio.duration) * 100;
            }

            currentTimeEl.textContent = formatPlayerTime(audio.currentTime);

        });

        audio.addEventListener("play", () => updateIcons(true));
        audio.addEventListener("pause", () => updateIcons(false));

        audio.addEventListener("ended", () => {
            updateIcons(false);
            progress.value = 0;
        });

        progress.addEventListener("input", () => {

            if (audio.duration) {
                audio.currentTime = (progress.value / 100) * audio.duration;
            }

        });

    });

}

initCustomAudioPlayers();

// Exposé pour permettre à beats-loader.js (Firestore) de ré-attacher
// le lecteur personnalisé après un rendu dynamique des cartes.
window.initBeatsSearchUI = window.initBeatsSearchUI || {};
window.initBeatsSearchUI.initCustomAudioPlayers = initCustomAudioPlayers;


// =======================================
// RECHERCHE, FILTRES ET TRI DES BEATS
// =======================================

function initBeatsSearch() {

    const container = document.querySelector(".beat-container");
    const searchInput = document.getElementById("beatSearch");

    if (!container || !searchInput) return; // pas sur la page beats

    const genreSelect = document.getElementById("filterGenre");
    const priceSelect = document.getElementById("filterPrice");
    const sortSelect = document.getElementById("sortBeats");
    const resetBtn = document.getElementById("searchReset");
    const resultsCount = document.getElementById("resultsCount");
    const noResults = document.getElementById("noResults");
    const resetFiltersBtn = document.getElementById("resetFilters");
    const customCard = container.querySelector(".custom-production");

    const cards = Array.from(container.querySelectorAll(".beat-card"));

    if (!cards.length) return;

    // Remplit dynamiquement la liste des genres à partir des cartes
    // (si un beat est ajouté plus tard, son genre apparaît automatiquement)
    if (genreSelect) {

        const genres = [...new Set(
            cards.map((c) => c.dataset.genre).filter(Boolean)
        )].sort((a, b) => a.localeCompare(b));

        genres.forEach((genre) => {
            const option = document.createElement("option");
            option.value = genre;
            option.textContent = genre;
            genreSelect.appendChild(option);
        });

    }

    function applyFilters() {

        const query = searchInput.value.trim().toLowerCase();
        const genre = genreSelect ? genreSelect.value : "";
        const priceRange = priceSelect ? priceSelect.value : "";

        if (resetBtn) resetBtn.hidden = query.length === 0;

        let visibleCount = 0;

        cards.forEach((card) => {

            const haystack = [
                card.dataset.name,
                card.dataset.genre,
                card.dataset.bpm,
                card.dataset.key
            ].join(" ").toLowerCase();

            const matchesQuery = !query || haystack.includes(query);
            const matchesGenre = !genre || card.dataset.genre === genre;

            let matchesPrice = true;

            if (priceRange) {
                const parts = priceRange.split("-").map(Number);
                const min = parts[0];
                const max = parts[1];
                const price = parseFloat(card.dataset.price || "0");
                matchesPrice = price >= min && price <= max;
            }

            const visible = matchesQuery && matchesGenre && matchesPrice;

            card.hidden = !visible;

            if (visible) visibleCount++;

        });

        if (resultsCount) {
            resultsCount.textContent =
                visibleCount + (visibleCount > 1 ? " beats trouvés" : " beat trouvé");
        }

        if (noResults) {
            noResults.hidden = visibleCount !== 0;
        }

    }

    function applySort() {

        if (!sortSelect) return;

        const mode = sortSelect.value;

        const sorted = [...cards].sort((a, b) => {

            if (mode === "price-asc") {
                return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
            }

            if (mode === "price-desc") {
                return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
            }

            // "recent" : les beats ajoutés en dernier dans le catalogue
            // (data-order le plus élevé) apparaissent en premier
            return parseInt(b.dataset.order, 10) - parseInt(a.dataset.order, 10);

        });

        sorted.forEach((card) => {
            container.insertBefore(card, customCard || null);
        });

    }

    searchInput.addEventListener("input", applyFilters);

    if (genreSelect) genreSelect.addEventListener("change", applyFilters);
    if (priceSelect) priceSelect.addEventListener("change", applyFilters);

    if (sortSelect) {
        sortSelect.addEventListener("change", () => {
            applySort();
            applyFilters();
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            searchInput.value = "";
            applyFilters();
            searchInput.focus();
        });
    }

    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener("click", () => {
            searchInput.value = "";
            if (genreSelect) genreSelect.value = "";
            if (priceSelect) priceSelect.value = "";
            applyFilters();
        });
    }

    applyFilters();

}

initBeatsSearch();

// Exposé pour permettre à beats-loader.js (Firestore) de relancer
// la recherche/filtres après un rendu dynamique des cartes.
window.initBeatsSearchUI = window.initBeatsSearchUI || {};
window.initBeatsSearchUI.initBeatsSearch = initBeatsSearch;


// =======================================
// COPIER LE NUMÉRO MOBILE MONEY
// =======================================

function initCopyButtons() {

    const buttons = document.querySelectorAll(".copy-btn");

    if (!buttons.length) return;

    buttons.forEach((button) => {

        button.addEventListener("click", async () => {

            const number = button.dataset.copy;

            if (!number) return;

            const originalText = button.textContent;

            try {

                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(number);
                } else {
                    // Fallback pour les navigateurs plus anciens
                    const tempInput = document.createElement("input");
                    tempInput.value = number;
                    document.body.appendChild(tempInput);
                    tempInput.select();
                    document.execCommand("copy");
                    document.body.removeChild(tempInput);
                }

                button.textContent = "✓ Numéro copié";
                button.classList.add("copied");

                setTimeout(() => {
                    button.textContent = originalText;
                    button.classList.remove("copied");
                }, 2000);

            } catch (err) {
                button.textContent = "Copie impossible — copie-le manuellement";
                setTimeout(() => {
                    button.textContent = originalText;
                }, 2500);
            }

        });

    });

}

initCopyButtons();

// =======================================
// FIN
// =======================================
