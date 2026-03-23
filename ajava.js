    const track = document.querySelector('.slider-track');
    const next = document.querySelector('.right');
    const prev = document.querySelector('.left');
    
    next.addEventListener('click', () => {
    track.scrollBy({ left: 420, behavior: 'smooth' });
    });

    prev.addEventListener('click', () => {
    track.scrollBy({ left: -420, behavior: 'smooth' });
    });

    // Opcions dinamicas per a vehicles
    const vehicleButtons = document.querySelectorAll('.vehicle-btn');
    const optionsSection = document.getElementById('vehicle-options');
    const vehicleTitle = document.getElementById('vehicle-title');
    const acceptButton = document.getElementById('accept-button');
    const denyButton = document.getElementById('deny-button');

    function showVehicleOptions(vehicle) {
        vehicleTitle.textContent = `Opcions per a ${vehicle}`;
        optionsSection.style.display = 'block';
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

    acceptButton.addEventListener('click', () => {
        hideVehicleOptions();
    });

    denyButton.addEventListener('click', () => {
        hideVehicleOptions();
    });