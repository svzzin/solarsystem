/** @jest-environment jsdom */

import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { planets } from '../js/planets.js';

const expectedIds = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
const requiredFields = ['name', 'order', 'type', 'distance', 'year', 'description'];

function createDom() {
  const previousModal = document.querySelector('#planet-modal');
  if (previousModal) previousModal.hidden = true;

  document.body.innerHTML = `
    <main>
      <section class="solar-system">
        ${expectedIds.map((id) => `<button class="planet" data-planet="${id}">${id}</button>`).join('')}
      </section>
    </main>
    <dialog class="modal" id="planet-modal" hidden>
      <button class="modal-close" data-close-modal>Fechar</button>
      <div id="modal-visual"><span id="modal-visual-label"></span></div>
      <p id="modal-order"></p>
      <h2 id="modal-title">Planeta selecionado</h2>
      <p id="modal-description"></p>
      <dd id="modal-type"></dd>
      <dd id="modal-distance"></dd>
      <dd id="modal-year"></dd>
      <div class="modal-backdrop" data-close-modal></div>
    </dialog>
  `;

  const modal = document.querySelector('#planet-modal');
  modal.showModal = jest.fn(() => { modal.open = true; });
  modal.close = jest.fn(() => { modal.open = false; });
  globalThis.requestAnimationFrame = (callback) => callback();

  expectedIds.forEach((id, index) => {
    const button = document.querySelector(`[data-planet="${id}"]`);
    button.getBoundingClientRect = () => ({
      left: 100 + index * 40,
      top: 100,
      width: 20,
      height: 20,
      right: 120 + index * 40,
      bottom: 120,
    });
  });
}

async function loadScript() {
  await import(`../js/script.js?test=${Date.now()}`);
}

describe('catalogo de planetas', () => {
  test('mantem os oito planetas na ordem orbital correta', () => {
    expect(Object.keys(planets)).toEqual(expectedIds);
    expect(Object.values(planets).map((planet) => Number.parseInt(planet.order, 10))).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  test('cada planeta possui todas as informacoes exibidas no modal', () => {
    Object.entries(planets).forEach(([id, planet]) => {
      requiredFields.forEach((field) => {
        expect(typeof planet[field]).toBe('string');
        expect(planet[field].trim()).not.toBe('');
      });
      expect(id).toBeTruthy();
    });
  });

  test('os tipos dos planetas seguem a classificacao esperada', () => {
    expect(Object.values(planets).map((planet) => planet.type)).toEqual([
      'Rochoso', 'Rochoso', 'Rochoso', 'Rochoso', 'Gasoso', 'Gasoso', 'Gelo e gás', 'Gelo e gás',
    ]);
  });
});

describe('interacoes dos planetas', () => {
  beforeEach(async () => {
    jest.useFakeTimers();
    createDom();
    await loadScript();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.resetModules();
  });

  test('ignora um planeta inexistente', async () => {
    const { openPlanet } = await import('../js/script.js');

    openPlanet('pluto');

    expect(document.querySelector('#planet-modal').showModal).not.toHaveBeenCalled();
  });

  test('abre o modal e preenche todos os dados do planeta', async () => {
    const { openPlanet } = await import('../js/script.js');
    const trigger = document.querySelector('[data-planet="mars"]');

    openPlanet('mars');
    expect(document.querySelector('.solar-system').classList.contains('is-zooming')).toBe(true);
    expect(document.querySelector('.solar-system').style.getPropertyValue('--focus-x')).not.toBe('');
    expect(document.querySelector('.solar-system').style.getPropertyValue('--focus-y')).not.toBe('');
    jest.advanceTimersByTime(650);

    expect(document.querySelector('#modal-title').textContent).toBe('Marte');
    expect(document.querySelector('#modal-order').textContent).toBe(planets.mars.order);
    expect(document.querySelector('#modal-description').textContent).toBe(planets.mars.description);
    expect(document.querySelector('#modal-type').textContent).toBe('Rochoso');
    expect(document.querySelector('#modal-distance').textContent).toBe(planets.mars.distance);
    expect(document.querySelector('#modal-year').textContent).toBe(planets.mars.year);
    expect(document.querySelector('#modal-visual').className).toBe('modal-visual modal-visual--mars');
    expect(document.querySelector('#modal-visual-label').textContent).toBe('MARTE');
    expect(document.querySelector('#planet-modal').showModal).toHaveBeenCalled();
    expect(document.activeElement).toBe(document.querySelector('.modal-close'));
    expect(trigger).toBeTruthy();
  });

  test('abre o modal ao clicar diretamente no botao do planeta', () => {
    const trigger = document.querySelector('[data-planet="jupiter"]');

    trigger.click();
    jest.advanceTimersByTime(650);

    expect(document.querySelector('#modal-title').textContent).toBe('Júpiter');
  });

  test('fecha o modal e restaura o foco ao planeta anterior', async () => {
    const { closePlanet, openPlanet } = await import('../js/script.js');
    const trigger = document.querySelector('[data-planet="earth"]');
    trigger.focus();
    openPlanet('earth');

    document.querySelector('.modal-close').click();
    jest.advanceTimersByTime(280);

    expect(document.querySelector('#planet-modal').close).toHaveBeenCalled();
    expect(document.querySelector('.solar-system').classList.contains('is-zooming')).toBe(false);
    expect(document.activeElement).toBe(trigger);

    closePlanet();
    jest.advanceTimersByTime(280);
  });

  test('fecha pelo backdrop e pela tecla Escape', async () => {
    const { openPlanet } = await import('../js/script.js');
    const modal = document.querySelector('#planet-modal');

    openPlanet('venus');
    document.querySelector('.modal-backdrop').click();
    jest.advanceTimersByTime(280);
    expect(modal.close).toHaveBeenCalled();

    openPlanet('venus');
    jest.advanceTimersByTime(650);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    jest.advanceTimersByTime(280);
    expect(modal.close.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  test('fecha sem foco anterior quando chamada diretamente', async () => {
    const { closePlanet } = await import('../js/script.js');

    closePlanet();
    jest.advanceTimersByTime(280);

    expect(document.querySelector('#planet-modal').close).toHaveBeenCalled();
  });

  test('abre o planeta mais proximo quando o clique cai fora do botao', async () => {
    const { openPlanet } = await import('../js/script.js');
    const system = document.querySelector('.solar-system');
    const target = document.querySelector('[data-planet="earth"]');

    system.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 181, clientY: 110 }));

    expect(document.querySelector('#modal-title').textContent).toBe('Terra');
    expect(target).toBeTruthy();
    openPlanet('earth');
  });

  test('nao abre planeta quando o clique esta longe de todos', async () => {
    const system = document.querySelector('.solar-system');

    system.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 10, clientY: 10 }));

    expect(document.querySelector('#planet-modal').showModal).not.toHaveBeenCalled();
  });
});
