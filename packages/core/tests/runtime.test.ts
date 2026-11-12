import assert from 'node:assert/strict';
import test from 'node:test';
import { nextCursor, planTransition, previousCursor, resolveState, totalDurationSeconds, validatePresentation } from '../src/index.ts';
import type { Presentation } from '../src/index.ts';

const createPresentation = (): Presentation => ({
  schemaVersion: 1,
  id: 'example',
  title: 'Example',
  elements: { cell: { kind: 'model3d' }, title: { kind: 'text', content: 'Hello' }, label: { kind: 'text', content: 'Next' } },
  pages: [
    {
      id: 'first', title: 'First', plannedDurationSeconds: 60,
      states: [
        { id: 'start', elements: { cell: { position: [2, 0, 0], opacity: 0.5, properties: { shape: 'disc', nested: { value: 1 } } }, title: {} } },
        { id: 'detail', elements: { cell: { scale: [2, 2, 2] }, title: {} } },
      ],
    },
    {
      id: 'second', title: 'Second', plannedDurationSeconds: 120,
      states: [{ id: 'start', elements: { cell: { position: [-1, 0, 0] }, label: {} }, transition: { durationMs: 600, easing: 'easeInOut' } }],
    },
  ],
});

test('manual navigation crosses pages, returns to the previous final state, and remains bounded', () => {
  const presentation = createPresentation();
  const start = { pageIndex: 0, stateIndex: 0 };
  const detail = nextCursor(presentation, start);
  assert.deepEqual(detail, { pageIndex: 0, stateIndex: 1 });
  const second = nextCursor(presentation, detail);
  assert.deepEqual(second, { pageIndex: 1, stateIndex: 0 });
  assert.deepEqual(previousCursor(presentation, second), detail);
  assert.deepEqual(previousCursor(presentation, detail), start);
  assert.deepEqual(previousCursor(presentation, start), start);
  assert.deepEqual(nextCursor(presentation, second), second);
  assert.deepEqual(start, { pageIndex: 0, stateIndex: 0 });
  assert.throws(() => nextCursor(presentation, { pageIndex: -1, stateIndex: 0 }), RangeError);
  assert.throws(() => previousCursor(presentation, { pageIndex: 0, stateIndex: 0.5 }), RangeError);
  assert.throws(() => resolveState(presentation, { pageIndex: 2, stateIndex: 0 }), RangeError);
});

test('snapshots restore defaults and backward resolution does not depend on navigation history', () => {
  const presentation = createPresentation();
  const first = { pageIndex: 0, stateIndex: 0 };
  const before = resolveState(presentation, first);
  const second = resolveState(presentation, nextCursor(presentation, first));
  assert.deepEqual(second.elements.cell, { position: [0, 0, 0], rotation: [0, 0, 0], scale: [2, 2, 2], opacity: 1, properties: {} });
  assert.deepEqual(resolveState(presentation, previousCursor(presentation, nextCursor(presentation, first))), before);
  second.elements.cell!.position[0] = 99;
  before.elements.cell!.properties.nested = { value: 42 };
  assert.equal(presentation.pages[0]!.states[0]!.elements.cell!.position![0], 2);
  assert.deepEqual(presentation.pages[0]!.states[0]!.elements.cell!.properties!.nested, { value: 1 });
});

test('transition plans keep stable identity across pages and distinguish incoming and outgoing elements', () => {
  const presentation = createPresentation();
  const plan = planTransition(presentation, { pageIndex: 0, stateIndex: 1 }, { pageIndex: 1, stateIndex: 0 });
  assert.deepEqual(plan.retained.map(entry => entry.elementId), ['cell']);
  assert.deepEqual(plan.entering.map(entry => entry.elementId), ['label']);
  assert.deepEqual(plan.exiting.map(entry => entry.elementId), ['title']);
  assert.deepEqual(plan.retained[0]!.from!.scale, [2, 2, 2]);
  assert.deepEqual(plan.retained[0]!.to!.position, [-1, 0, 0]);
  assert.equal(plan.entering[0]!.from, null);
  assert.equal(plan.exiting[0]!.to, null);
  assert.deepEqual(plan.transition, { durationMs: 600, easing: 'easeInOut' });
  plan.retained[0]!.definition.kind = 'image';
  plan.retained[0]!.to!.position[0] = 999;
  assert.equal(presentation.elements.cell!.kind, 'model3d');
  assert.equal(presentation.pages[1]!.states[0]!.elements.cell!.position![0], -1);
});

test('rehearsal duration sums pages once, independently of their state count', () => {
  assert.equal(totalDurationSeconds(createPresentation()), 180);
});

test('validation accepts local resources and rejects duplicate identifiers, missing references and invalid numbers', () => {
  const valid = createPresentation();
  valid.assets = { portrait: { source: 'fixtures/dot.svg' } };
  valid.elements.photo = { kind: 'image', assetId: 'portrait' };
  assert.deepEqual(validatePresentation(valid), { valid: true, issues: [] });
  const invalid = createPresentation();
  invalid.pages[1]!.id = 'first';
  invalid.pages[0]!.states[1]!.id = 'start';
  invalid.pages[0]!.plannedDurationSeconds = Number.NaN;
  invalid.pages[1]!.states[0]!.elements.unknown = { opacity: 2, position: [0, Infinity, 0] };
  invalid.elements.photo = { kind: 'image', assetId: 'missing' };
  invalid.pages[1]!.states[0]!.transition!.durationMs = -1;
  const result = validatePresentation(invalid);
  assert.equal(result.valid, false);
  for (const expected of ['Duplicate page', 'Duplicate state', 'positive duration', 'Unknown element reference', 'Unknown asset', 'opacity', 'three finite', 'non-negative duration']) {
    assert.ok(result.issues.some(issue => issue.message.includes(expected)), expected);
  }
});

test('validation rejects empty structures, unsafe asset paths, cyclic and non-JSON properties', () => {
  assert.equal(validatePresentation(null).valid, false);
  assert.equal(validatePresentation({ schemaVersion: 1, id: 'empty', title: 'Empty', elements: {}, pages: [] }).valid, false);
  for (const source of ['../outside.png', 'assets/../../outside.png', 'assets/.. /outside.png', 'C:\\outside.png', '/outside.png', '\\\\server\\file.png', 'https://example.org/image.png', 'assets/%2e%2e/outside.png']) {
    const presentation = createPresentation();
    presentation.assets = { unsafe: { source } };
    assert.equal(validatePresentation(presentation).valid, false, source);
  }
  const presentation = createPresentation();
  const cyclic: Record<string, unknown> = {};
  cyclic.self = cyclic;
  const raw = presentation as unknown as { pages: { states: { elements: { cell: { properties: unknown } } }[] }[] };
  raw.pages[0]!.states[0]!.elements.cell.properties = cyclic;
  assert.equal(validatePresentation(presentation).valid, false);
  raw.pages[0]!.states[0]!.elements.cell.properties = { time: new Date() };
  assert.equal(validatePresentation(presentation).valid, false);
});

test('validation rejects sparse vectors and sparse arrays nested in JSON properties', () => {
  const candidate = createPresentation() as unknown as {
    pages: { states: { elements: Record<string, { position?: unknown; properties?: unknown }> }[] }[];
  };
  const cell = candidate.pages[0]!.states[0]!.elements.cell!;
  cell.position = Array(3);
  const vectorValidation = validatePresentation(candidate);
  assert.equal(vectorValidation.valid, false);
  assert.ok(vectorValidation.issues.some(issue => issue.path.endsWith('.position') && issue.message.includes('three finite numbers')));

  cell.position = [0, 0, 0];
  cell.properties = { nested: Array(2) };
  const propertiesValidation = validatePresentation(candidate);
  assert.equal(propertiesValidation.valid, false);
  assert.ok(propertiesValidation.issues.some(issue => issue.path.endsWith('.properties') && issue.message.includes('JSON')));
});
