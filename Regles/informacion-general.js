// Función para ocultar secciones al hacer clic en vehículos
const vehicleDivs = document.querySelectorAll('#vmp, #ciclos, #turimos, #motos, #camiones');
vehicleDivs.forEach(div => {
    div.addEventListener('click', () => {
        document.querySelector('[style*="rgb(239, 243, 223)"]').classList.add('hidden');
        document.querySelector('[style*="rgb(251, 242, 231)"]').classList.add('hidden');
    });
});

// Evento específico para mostrar detalle de vmp
document.getElementById('vmp').addEventListener('click', () => {
    document.getElementById('vmp-detail').classList.remove('hidden');
});

// Evento específico para mostrar detalle de ciclos
document.getElementById('ciclos').addEventListener('click', () => {
    document.getElementById('ciclos-detail').classList.remove('hidden');
});

// Evento específico para mostrar detalle de turismo
document.getElementById('turimos').addEventListener('click', () => {
    document.getElementById('turismo-detail').classList.remove('hidden');
});

// Evento específico para mostrar detalle de moto
document.getElementById('motos').addEventListener('click', () => {
    document.getElementById('moto-detail').classList.remove('hidden');
});

// Evento específico para mostrar detalle de camion
document.getElementById('camiones').addEventListener('click', () => {
    document.getElementById('camion-detail').classList.remove('hidden');
});

// Función para ocultar secciones al hacer clic en carreteras
const carreteraDivs = document.querySelectorAll('#interurbana, #urbanas');
carreteraDivs.forEach(div => {
    div.addEventListener('click', () => {
        document.querySelector('[style*="rgb(227, 240, 246)"]').classList.add('hidden');
        document.querySelector('[style*="rgb(251, 242, 231)"]').classList.add('hidden');
    });
});

// Función para ocultar secciones al hacer clic en generales
const generalDivs = document.querySelectorAll('#consejos, #infracciones, #accidentes-frecuentes');
generalDivs.forEach(div => {
    div.addEventListener('click', () => {
        document.querySelector('[style*="rgb(227, 240, 246)"]').classList.add('hidden');
        document.querySelector('[style*="rgb(239, 243, 223)"]').classList.add('hidden');
    });
});

// Función para mostrar todas las secciones al hacer clic en "Anterior"
const previousButtons = document.querySelectorAll('.previous');
previousButtons.forEach(button => {
    button.addEventListener('click', () => {
        document.querySelector('[style*="rgb(227, 240, 246)"]').classList.remove('hidden');
        document.querySelector('[style*="rgb(239, 243, 223)"]').classList.remove('hidden');
        document.querySelector('[style*="rgb(251, 242, 231)"]').classList.remove('hidden');
    });
});
