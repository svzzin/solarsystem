const planets = {
  mercury: {
    name: 'Mercurio', order: '01 / PLANETA TERRESTRE', type: 'Rochoso', distance: '57,9 milhoes km', year: '88 dias', description: 'O menor planeta do sistema solar e tambem o mais proximo do Sol. Sua superficie marcada por crateras guarda bilhoes de anos de historia.',
  },
  venus: {
    name: 'Venus', order: '02 / PLANETA TERRESTRE', type: 'Rochoso', distance: '108,2 milhoes km', year: '225 dias', description: 'Envolto por nuvens espessas, Venus e o planeta mais quente do sistema solar. Seu brilho intenso o torna visivel pouco antes do amanhecer ou depois do entardecer.',
  },
  earth: {
    name: 'Terra', order: '03 / PLANETA TERRESTRE', type: 'Rochoso', distance: '149,6 milhoes km', year: '365 dias', description: 'Nosso mundo azul e o unico lugar conhecido onde existe vida. Oceanos liquidos cobrem a maior parte de sua superficie e sustentam uma biosfera extraordinaria.',
  },
  mars: {
    name: 'Marte', order: '04 / PLANETA TERRESTRE', type: 'Rochoso', distance: '227,9 milhoes km', year: '687 dias', description: 'O planeta vermelho possui vales profundos, vulcoes gigantes e sinais de que ja teve agua liquida em sua superficie.',
  },
  jupiter: {
    name: 'Jupiter', order: '05 / GIGANTE GASOSO', type: 'Gasoso', distance: '778,5 milhoes km', year: '11,86 anos', description: 'Jupiter e o maior planeta do sistema solar. Uma tempestade maior que a Terra, a Grande Mancha Vermelha, gira em sua atmosfera ha seculos.',
  },
  saturn: {
    name: 'Saturno', order: '06 / GIGANTE GASOSO', type: 'Gasoso', distance: '1,43 bilhao km', year: '29,45 anos', description: 'Reconhecido por seus aneis brilhantes, Saturno e um mundo de hidrogenio e helio com dezenas de luas conhecidas.',
  },
  uranus: {
    name: 'Urano', order: '07 / GIGANTE DE GELO', type: 'Gelo e gas', distance: '2,87 bilhoes km', year: '84 anos', description: 'Urano gira praticamente de lado, como consequencia de uma antiga colisao. Sua atmosfera rica em metano cria a tonalidade azul-esverdeada.',
  },
  neptune: {
    name: 'Netuno', order: '08 / GIGANTE DE GELO', type: 'Gelo e gas', distance: '4,5 bilhoes km', year: '164,8 anos', description: 'O planeta mais distante do Sol e um mundo azul de ventos extremos, onde as tempestades podem ultrapassar 2.000 km por hora.',
  },
};

const modal = document.querySelector('#planet-modal');
const solarSystem = document.querySelector('.solar-system');
const closeButtons = document.querySelectorAll('[data-close-modal]');
const planetButtons = document.querySelectorAll('[data-planet]');
let lastFocusedPlanet;

function openPlanet(planetId) {
  const planet = planets[planetId];
  if (!planet) return;

  lastFocusedPlanet = document.activeElement;
  solarSystem.classList.add('is-focused');
  document.body.classList.add('modal-is-open');

  document.querySelector('#modal-title').textContent = planet.name;
  document.querySelector('#modal-order').textContent = planet.order;
  document.querySelector('#modal-description').textContent = planet.description;
  document.querySelector('#modal-type').textContent = planet.type;
  document.querySelector('#modal-distance').textContent = planet.distance;
  document.querySelector('#modal-year').textContent = planet.year;
  document.querySelector('#modal-visual').className = `modal-visual modal-visual--${planetId}`;
  document.querySelector('#modal-visual-label').textContent = planet.name.toUpperCase();

  modal.hidden = false;
  modal.showModal();
  requestAnimationFrame(() => modal.classList.add('is-visible'));
  document.querySelector('.modal-close').focus();
}

function closePlanet() {
  modal.classList.remove('is-visible');
  solarSystem.classList.remove('is-focused');
  document.body.classList.remove('modal-is-open');
  window.setTimeout(() => {
    modal.close();
    modal.hidden = true;
  }, 280);
  if (lastFocusedPlanet) lastFocusedPlanet.focus();
}

planetButtons.forEach((button) => {
  button.addEventListener('click', () => openPlanet(button.dataset.planet));
});

solarSystem.addEventListener('click', (event) => {
  const clickedPlanet = event.target.closest('[data-planet]');
  if (clickedPlanet) return;

  const point = { x: event.clientX, y: event.clientY };
  const nearestPlanet = [...planetButtons]
    .map((button) => {
      const bounds = button.getBoundingClientRect();
      const center = { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
      return {
        button,
        distance: Math.hypot(point.x - center.x, point.y - center.y),
        hitRadius: Math.max(18, Math.max(bounds.width, bounds.height) / 2 + 8),
      };
    })
    .sort((first, second) => first.distance - second.distance)[0];

  if (nearestPlanet && nearestPlanet.distance <= nearestPlanet.hitRadius) {
    event.preventDefault();
    openPlanet(nearestPlanet.button.dataset.planet);
  }
}, true);

closeButtons.forEach((button) => button.addEventListener('click', closePlanet));

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !modal.hidden) closePlanet();
});
