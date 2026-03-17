    const track = document.querySelector('.slider-track');
    const next = document.querySelector('.right');
    const prev = document.querySelector('.left');
    
    next.addEventListener('click', () => {
    track.scrollBy({ left: 420, behavior: 'smooth' });
    });

    prev.addEventListener('click', () => {
    track.scrollBy({ left: -420, behavior: 'smooth' });
    });