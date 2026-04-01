    const track = document.querySelector('.slider-track');
    const next = document.querySelector('.right');
    const prev = document.querySelector('.left');
    
    next.addEventListener('click', () => {
    track.scrollBy({ left: 420, behavior: 'smooth' });
    });

    prev.addEventListener('click', () => {
    track.scrollBy({ left: -420, behavior: 'smooth' });
    });

    // Keyboard navigation for slider
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight') {
            track.scrollBy({ left: 420, behavior: 'smooth' });
        } else if (e.key === 'ArrowLeft') {
            track.scrollBy({ left: -420, behavior: 'smooth' });
        }
    });

    // Opcions dinamicas per a vehicles
    const vehicleButtons = document.querySelectorAll('.vehicle-btn');
    const optionsSection = document.getElementById('vehicle-options');
    const vehicleTitle = document.getElementById('vehicle-title');
    const acceptButton = document.getElementById('accept-button');
    const denyButton = document.getElementById('deny-button');
    const optionCards = document.querySelectorAll('.option-card');

    let selectedOption = null;

    function showVehicleOptions(vehicle) {
        vehicleTitle.textContent = `Opcions per a ${vehicle}`;
        optionsSection.style.display = 'block';
        selectedOption = null; // Reset selection
        optionCards.forEach(card => card.classList.remove('selected'));
    }

    function hideVehicleOptions() {
        optionsSection.style.display = 'none';
    }

    vehicleButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const vehicle = btn.dataset.vehicle || btn.textContent.trim();
            showVehicleOptions(vehicle);
        });
    });

    optionCards.forEach(card => {
        card.addEventListener('click', () => {
            optionCards.forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedOption = card.dataset.type;
        });
    });

    acceptButton.addEventListener('click', () => {
        if (selectedOption) {
            window.location.href = selectedOption + '.html';
        } else {
            alert('Por favor, selecciona una opción.');
        }
    });

    denyButton.addEventListener('click', () => {
        hideVehicleOptions();
    });