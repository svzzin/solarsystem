import { planets } from './planets.js';

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
