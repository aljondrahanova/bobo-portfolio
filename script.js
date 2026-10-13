// Logika interaktivního pexesa a vodního efektu
document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.card');
  const matchBanner = document.getElementById('matchBanner');
  const resetWrapper = document.getElementById('resetWrapper');
  const resetBtn = document.getElementById('resetBtn');

  let flippedCards = [];
  let isLocked = false;
  let matchedCount = 0;

  // Obsluha kliknutí na kartu
  function handleCardClick(card) {
    // Pokud je hra uzamčena, karta je již otočená, nebo již odplavala
    if (isLocked) return;
    if (flippedCards.includes(card)) return;
    if (card.classList.contains('is-flipped')) return;
    if (card.classList.contains('float-left') || card.classList.contains('float-right')) return;

    // Otočení vybrané karty
    card.classList.add('is-flipped');
    flippedCards.push(card);

    // Pokud jsou odhaleny 2 karty
    if (flippedCards.length === 2) {
      isLocked = true;
      const [card1, card2] = flippedCards;
      const pair1 = card1.dataset.pair;
      const pair2 = card2.dataset.pair;

      // Ověření, zda je pár správně uhodnutý (cat 1 + cat 2 NEBO dogs 1 + dogs 2)
      if (pair1 && pair1 === pair2) {
        // 1. Karty se rozsvítí modře
        card1.classList.add('glow-blue');
        card2.classList.add('glow-blue');

        // 2. Nahoře na stránce se zobrazí "matched :3" po dobu co obrázky svítí modře
        if (matchBanner) {
          matchBanner.classList.add('show');
        }

        // 3. Svítí modře po dobu 2 sekund
        setTimeout(() => {
          // Skrytí nápisu matched :3
          if (matchBanner) {
            matchBanner.classList.remove('show');
          }

          // Odstranění modrého svícení
          card1.classList.remove('glow-blue');
          card2.classList.remove('glow-blue');

          // 4. Obrázky odplavou:
          // Cat combo odplave do levé strany stránky
          // Dogs combo odplave do pravé strany stránky
          if (pair1 === 'cat') {
            card1.classList.add('float-left');
            card2.classList.add('float-left');
          } else if (pair1 === 'dog') {
            card1.classList.add('float-right');
            card2.classList.add('float-right');
          }

          matchedCount += 2;
          flippedCards = [];

          // Po dokončení odplavání uvolnit zámek pro další odhalování
          setTimeout(() => {
            isLocked = false;

            // Pokud jsou všechny karty uhádnuté, zobrazit možnost restartu
            if (matchedCount === cards.length && resetWrapper) {
              resetWrapper.classList.add('show');
            }
          }, 1200);
        }, 2000);

      } else {
        // Neshoda (např. 1 kočka a 1 pes) -> po 3 sekundách se otočí zpět
        setTimeout(() => {
          flippedCards.forEach(c => c.classList.remove('is-flipped'));

          setTimeout(() => {
            flippedCards = [];
            isLocked = false;
          }, 650);
        }, 3000);
      }
    }
  }

  // Restart hry pro opakované hraní
  function resetGame() {
    if (isLocked) return;
    matchedCount = 0;
    flippedCards = [];
    if (matchBanner) matchBanner.classList.remove('show');
    if (resetWrapper) resetWrapper.classList.remove('show');

    cards.forEach(card => {
      card.classList.remove('is-flipped', 'glow-blue', 'float-left', 'float-right');
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', resetGame);
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

  // Organický efekt vody na plátně (Canvas water ripples & caustics)
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
