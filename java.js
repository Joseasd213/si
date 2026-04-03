const botonComo = document.querySelector("#como button");
const buttons = document.querySelector(".buttons");
const content = document.querySelector("#content");
const anterior = document.querySelector("#anterior");
const siguiente = document.querySelector("#siguiente");
const explicacion = document.querySelector("#explicacion");
const purpose = document.querySelector("#purpose");
const how = document.querySelector("#how");
const who = document.querySelector("#who");
const botonJugar = document.querySelector("#jugar button");
const play = document.querySelector("#play");
const advice = document.querySelector("#advice");
const reglas = document.querySelector("#rules");
const salir = document.querySelector("#salir");
const manual = document.querySelector("#manual")

let paginaActual = 1; // 1 = purpose, 2 = how, 3 = who

function mostrarPagina() {
    purpose.classList.add("hidden");
    how.classList.add("hidden");
    who.classList.add("hidden");
    play.classList.add("hidden");
    advice.classList.add("hidden");
    reglas.classList.add("hidden");
    salir.classList.add("hidden");

    if (paginaActual === 1) {
        purpose.classList.remove("hidden");
    } else if (paginaActual === 2) {
        how.classList.remove("hidden");
    } else if (paginaActual === 3) {
        who.classList.remove("hidden");
    } else if (paginaActual === 4) {
        play.classList.remove("hidden");
        manual.classList.remove("hidden")
    } else if (paginaActual === 5) {
        advice.classList.remove("hidden");
        manual.classList.remove("hidden")
    } else if (paginaActual === 6) {
        reglas.classList.remove("hidden");
        manual.classList.remove("hidden")
    } else if (paginaActual === 7) {
        salir.classList.remove("hidden");
        manual.classList.remove("hidden")
    }
}

function mostrarExplicacion() {
    // Click en "¿Cómo se juega?"
    buttons.classList.remove("hidden");
    content.classList.add("hidden");
    explicacion.classList.remove("hidden");

    paginaActual = 1;
    mostrarPagina();
    actualizarVista();
}

botonComo.addEventListener("click", mostrarExplicacion);

// Opcional: el botón tutorial también muestra la explicación inicial
const botonTutorial = document.querySelector("#content .contents:nth-child(2) button");
if (botonTutorial) {
    botonTutorial.addEventListener("click", mostrarExplicacion);
}

function jugar() {
    window.location.href = "menu.html";
}

botonJugar.addEventListener("click", jugar);

function anteriores() {
    if (paginaActual > 1) {
        paginaActual--;
        mostrarPagina();
    } else {
        buttons.classList.add("hidden");
        content.classList.remove("hidden");
        explicacion.classList.add("hidden");
        purpose.classList.add("hidden");
        how.classList.add("hidden");
        who.classList.add("hidden");
    }
}

anterior.addEventListener("click", anteriores);

function siguientes() {
    if (paginaActual < 8) {
        paginaActual++;
        mostrarPagina();
    } else if (paginaActual === 8) {
        // Redirigir a menu.html
        window.location.href = "menu.html";
    }
}

siguiente.addEventListener("click", siguientes);

function actualizarVista(){
    // NO tocamos tu layout, solo controlamos visibilidad
    purpose.classList.add("hidden");
    how.classList.add("hidden");
    who.classList.add("hidden");
    play.classList.add("hidden");
    advice.classList.add("hidden");
    reglas.classList.add("hidden");
    salir.classList.add("hidden");
    manual.classList.remove("hidden");

    if (paginaActual === 1) {
        purpose.classList.remove("hidden");
    }
    if (paginaActual === 2) {
        how.classList.remove("hidden");
    }
    if (paginaActual === 3) {
        who.classList.remove("hidden");
    }
    if (paginaActual === 4) {
        play.classList.remove("hidden");
    }
    if (paginaActual === 5) {
        advice.classList.remove("hidden");
    }
    if (paginaActual === 6) {
        reglas.classList.remove("hidden");
    }
    if (paginaActual === 7) {
        salir.classList.remove("hidden");
    }
}

// Refuerzo seguro para el botón "Jugar".
botonJugar.addEventListener("click", () => {
    window.location.href = "menu.html";
});

// Opcional: si hay contenedor con desplazamiento horizontal, usar next/prev sin romper la app.
const scrollTrack = document.querySelector(".track");
const scrollNext = document.querySelector(".next");
const scrollPrev = document.querySelector(".previous");

if (scrollTrack && scrollNext && scrollPrev) {
    scrollNext.addEventListener('click', () => {
        scrollTrack.scrollBy({ left: 420, behavior: 'smooth' });
    });

    scrollPrev.addEventListener('click', () => {
        scrollTrack.scrollBy({ left: -420, behavior: 'smooth' });
    });
}

// Inicialización de vista
mostrarPagina();
actualizarVista();