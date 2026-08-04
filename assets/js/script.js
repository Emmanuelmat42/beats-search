console.log("Beats Search Ready 🚀");
// =======================================
// Beats Search
// Powered by Matis Production
// Version 2.0
// =======================================

console.log("Beats Search Ready 🚀");

// =======================================
// NAVBAR AU SCROLL
// =======================================

const header = document.querySelector("header");

window.addEventListener("scroll", () => {

    if (window.scrollY > 50) {

        header.classList.add("scroll");

    } else {

        header.classList.remove("scroll");

    }

});

// =======================================
// APPARITION DES SECTIONS
// =======================================

const sections = document.querySelectorAll("section");

const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.classList.add("show");

        }

    });

}, {

    threshold:0.15

});

sections.forEach(section => {

    section.classList.add("hidden");

    observer.observe(section);

});

// =======================================
// BOUTON WHATSAPP
// =======================================

document.querySelectorAll(".buy-btn").forEach(button=>{

    button.addEventListener("click",function(){

        const card=this.closest(".beat-card");

        const beatName=card.querySelector("h3").textContent;

        const message=`Bonjour Matis Production, je souhaite acheter le beat "${beatName}".`;

        const url=`https://wa.me/243853461191?text=${encodeURIComponent(message)}`;

        window.open(url,"_blank");

    });

});

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
// =======================================

const players = document.querySelectorAll("audio");

players.forEach(player => {

    player.addEventListener("play", () => {

        players.forEach(otherPlayer => {

            if (otherPlayer !== player) {

                otherPlayer.pause();
                otherPlayer.currentTime = 0;

            }

        });

    });

});

// =======================================
// FIN
// =======================================