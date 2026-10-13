// Logika interaktivního pexesa a vodního efektu
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.card');
  let flippedCards = [];
  let isLocked = false;
  let resetTimeout = null;

  // Obsluha kliknutí na kartu
  function handleCardClick(card) {
    // Pokud je hra uzamčena (odhalují se 2 karty), karta je již otočená nebo je neplatná
    if (isLocked) return;
    if (flippedCards.includes(card)) return;
    if (card.classList.contains('is-flipped')) return;

    // Otočení karty
    card.classList.add('is-flipped');
    flippedCards.push(card);

    // Pokud jsou odhaleny 2 karty
    if (flippedCards.length === 2) {
      // Uzamknout možnost klikání na další karty (max 2 odhalené karty)
      isLocked = true;

      // Po přesně 3 sekundách otočit obě karty zpět
      resetTimeout = setTimeout(() => {
        flippedCards.forEach(c => c.classList.remove('is-flipped'));

        // Po dokončení animace otočení (650ms) odemknout hru pro další odhalování
        setTimeout(() => {
          flippedCards = [];
          isLocked = false;
        }, 650);
      }, 3000);
    }
  }

  // Přiřazení posluchačů událostí na karty
  cards.forEach(card => {
    // Kliknutí myší
    card.addEventListener('click', () => handleCardClick(card));

    // Podpora pro klávesnici (Enter / Mezerník)
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCardClick(card);
      }
    });
  });

  // Jemný organický efekt vody na plátně (Canvas water caustics / ripples)
  const canvas = document.getElementById('water-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    let time = 0;
    const waves = [
      { frequency: 0.008, speed: 0.015, amplitude: 22 },
      { frequency: 0.012, speed: 0.02, amplitude: 16 },
      { frequency: 0.005, speed: 0.008, amplitude: 30 }
    ];

    function drawWater() {
      ctx.clearRect(0, 0, width, height);

      // Kreslení jemných tekutých světelných vln
      for (let i = 0; i < waves.length; i++) {
        const wave = waves[i];
        ctx.beginPath();
        ctx.moveTo(0, height);

        for (let x = 0; x <= width; x += 15) {
          const y =
            height * 0.5 +
            Math.sin(x * wave.frequency + time * wave.speed + i) * wave.amplitude +
            Math.cos(x * 0.004 - time * 0.01) * 15;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, height * 0.3, width, height);
        grad.addColorStop(0, `rgba(24, 90, 60, ${0.04 + i * 0.02})`);
        grad.addColorStop(0.5, `rgba(14, 67, 104, ${0.05 + i * 0.02})`);
        grad.addColorStop(1, `rgba(8, 40, 62, ${0.06})`);

        ctx.fillStyle = grad;
        ctx.fill();
      }

      time += 1;
      requestAnimationFrame(drawWater);
    }

    drawWater();
  }
});
