import test from 'node:test';
import assert from 'node:assert/strict';
import { planets } from '../js/planets.js';

const expectedIds = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
const requiredFields = ['name', 'order', 'type', 'distance', 'year', 'description'];

test('mantem os oito planetas na ordem orbital correta', () => {
  assert.deepEqual(Object.keys(planets), expectedIds);

  const orderNumbers = Object.values(planets).map((planet) => Number.parseInt(planet.order, 10));
  assert.deepEqual(orderNumbers, [1, 2, 3, 4, 5, 6, 7, 8]);
});

test('cada planeta possui todas as informacoes exibidas no modal', () => {
  for (const [id, planet] of Object.entries(planets)) {
    for (const field of requiredFields) {
      assert.equal(typeof planet[field], 'string', `${id}.${field} deve ser texto`);
      assert.ok(planet[field].trim().length > 0, `${id}.${field} nao pode ser vazio`);
    }
  }
});

test('os identificadores, nomes e ordens dos planetas sao unicos', () => {
  const names = Object.values(planets).map((planet) => planet.name);
  const orders = Object.values(planets).map((planet) => planet.order);

  assert.equal(new Set(Object.keys(planets)).size, expectedIds.length);
  assert.equal(new Set(names).size, expectedIds.length);
  assert.equal(new Set(orders).size, expectedIds.length);
});

test('os tipos dos planetas seguem a classificacao esperada', () => {
  assert.deepEqual(
    Object.values(planets).map((planet) => planet.type),
    ['Rochoso', 'Rochoso', 'Rochoso', 'Rochoso', 'Gasoso', 'Gasoso', 'Gelo e gas', 'Gelo e gas'],
  );
});
