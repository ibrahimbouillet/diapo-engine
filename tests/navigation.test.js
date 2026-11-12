import assert from 'node:assert/strict';
import test from 'node:test';
import { createDemoNavigation } from '../navigation.js';

test('only successful fullscreen entry starts the first scene, with no duplicate request', async () => {
  const pages = [];
  let finishFullscreen;
  let requests = 0;
  const controller = createDemoNavigation({
    showPage: page => pages.push(page),
    fullscreen: {
      enter: () => { requests += 1; return new Promise(resolve => { finishFullscreen = resolve; }); },
    },
  });
  controller.next();
  controller.previous();
  assert.equal(controller.page, 0);
  const starting = controller.present();
  await controller.present();
  controller.next();
  assert.equal(requests, 1);
  assert.equal(controller.page, 0);
  finishFullscreen();
  await starting;
  assert.equal(controller.page, 1);
  assert.deepEqual(pages, [1]);
});

test('a rejected fullscreen request keeps the title and permits a later retry', async () => {
  let rejected = true;
  const controller = createDemoNavigation({
    showPage: () => {},
    fullscreen: { enter: async () => { if (rejected) throw new Error('Not allowed'); } },
  });
  await assert.rejects(controller.present(), /Not allowed/);
  assert.equal(controller.page, 0);
  rejected = false;
  await controller.present();
  assert.equal(controller.page, 1);
});

test('navigation has no wrap, returns to the title, and fullscreen toggles preserve the scene', async () => {
  const pages = [];
  let entries = 0;
  let toggles = 0;
  const controller = createDemoNavigation({
    showPage: page => pages.push(page),
    fullscreen: {
      enter: async () => { entries += 1; },
      toggle: async () => { toggles += 1; },
    },
  });
  await controller.present();
  controller.next();
  controller.next();
  await controller.present();
  assert.equal(controller.page, 2);
  assert.equal(toggles, 1);
  controller.previous();
  controller.previous();
  controller.previous();
  controller.next();
  assert.equal(controller.page, 0);
  await controller.present();
  assert.equal(entries, 2);
  assert.deepEqual(pages, [1, 2, 1, 0, 1]);
});
