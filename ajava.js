const track = document.querySelector('.slider-track');
const next = document.querySelector('.right');
const prev = document.querySelector('.left');

next.addEventListener('click', () => {
    track.scrollBy({ left: 420, behavior: 'smooth' });
});

prev.addEventListener('click', () => {
    track.scrollBy({ left: -420, behavior: 'smooth' });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') {
        track.scrollBy({ left: 420, behavior: 'smooth' });
    } else if (e.key === 'ArrowLeft') {
        track.scrollBy({ left: -420, behavior: 'smooth' });
    }
});

const vehicleButtons = document.querySelectorAll('.vehicle-btn');
const optionsSection = document.getElementById('vehicle-options');
const vehicleTitle = document.getElementById('vehicle-title');
const acceptButton = document.getElementById('accept-button');
const denyButton = document.getElementById('deny-button');
const optionCards = document.querySelectorAll('.option-card');

let selectedOption = null;
let selectedVehicle = null;

function getRestrictionMessage(vehicle, roadType) {
    if (roadType !== 'interurbana') return '';

    if (vehicle === 'VMP') {
        return 'Els VMP no poden circular per carreteres interurbanes.';
    }

    return '';
}

function updateRoadAvailability(vehicle) {
    optionCards.forEach(card => {
        const restrictionMessage = getRestrictionMessage(vehicle, card.dataset.type);
        const isDisabled = Boolean(restrictionMessage);

        card.dataset.disabled = isDisabled ? 'true' : 'false';
        card.style.opacity = isDisabled ? '0.45' : '1';
        card.style.cursor = isDisabled ? 'not-allowed' : 'pointer';
        card.title = restrictionMessage;

        if (isDisabled && selectedOption === card.dataset.type) {
            card.classList.remove('selected');
            selectedOption = null;
        }
    });
}

function showVehicleOptions(vehicle) {
    vehicleTitle.textContent = `Opcions per a ${vehicle}`;
    optionsSection.style.display = 'block';
    selectedOption = null;
    optionCards.forEach(card => card.classList.remove('selected'));
    updateRoadAvailability(vehicle);
}

function hideVehicleOptions() {
    optionsSection.style.display = 'none';
}

vehicleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const vehicle = btn.dataset.vehicle || btn.textContent.trim();
        selectedVehicle = vehicle;
        showVehicleOptions(vehicle);
    });
});

optionCards.forEach(card => {
    card.addEventListener('click', () => {
        const restrictionMessage = getRestrictionMessage(selectedVehicle, card.dataset.type);
        if (restrictionMessage) {
            alert(restrictionMessage);
            return;
        }

        optionCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedOption = card.dataset.type;
    });
});

acceptButton.addEventListener('click', () => {
    if (selectedOption && selectedVehicle) {
        const restrictionMessage = getRestrictionMessage(selectedVehicle, selectedOption);
        if (restrictionMessage) {
            alert(restrictionMessage);
            return;
        }

        localStorage.setItem('selectedVehicle', selectedVehicle);
        localStorage.setItem('selectedRoad', selectedOption);
        window.location.href = 'Juegos/' + selectedOption + '/' + selectedOption + '.html';
    } else {
        alert('Por favor, selecciona una opcion.');
    }
});

denyButton.addEventListener('click', () => {
    hideVehicleOptions();
});
