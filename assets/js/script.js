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

const hiddenElements = document.querySelectorAll(".hidden");

const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.classList.add("show");

        }

    });

}, {
    threshold: 0.05
});

hiddenElements.forEach(el => observer.observe(el));


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

// Correction pour certains téléphones

window.addEventListener("load", () => {

    document.querySelectorAll(".hidden").forEach(el => {

        const rect = el.getBoundingClientRect();

        if(rect.top < window.innerHeight){

            el.classList.add("show");

        }

    });

});

// =======================================
// HERO STATS MOBILE
// =======================================

if(window.innerWidth <= 768){

    const stats = document.querySelectorAll(".hero-stats .stat");

    let index = 0;

    setInterval(()=>{

        stats[index].classList.remove("active");

        index++;

        if(index >= stats.length){

            index = 0;

        }

        stats[index].classList.add("active");

    },2000);

}

// =======================================
// FIN
// =======================================