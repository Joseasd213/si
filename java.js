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
    } else if (paginaActual === 5) {
        advice.classList.remove("hidden");
    } else if (paginaActual === 6) {
        reglas.classList.remove("hidden");
    } else if (paginaActual === 7) {
        salir.classList.remove("hidden");
    }
}

function comojugar() {
    buttons.classList.remove("hidden");
    content.classList.add("hidden");
    explicacion.classList.remove("hidden");

    paginaActual = 1;
    actualizarVista();
}

botonComo.addEventListener("click", comojugar);

function jugar() {
    console.log("jugarrrrr");
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

// Selecciona el botón "Jugar"

// Al hacer click, redirige a menu.html
botonJugar.addEventListener("click", () => {
    window.location.href = "menu.html";
});