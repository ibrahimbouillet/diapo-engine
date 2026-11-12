import assert from 'node:assert/strict';
import test from 'node:test';
import { prepareResources, showWhenReady } from '../preparation.js';

function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}

for (const first of ['resources', 'minimum']) {
  test(`the page stays closed when only ${first} is ready`, async () => {
    const resources = deferred();
    const minimum = deferred();
    let openings = 0;
    const completion = showWhenReady({
      preparation: resources.promise,
      minimumVisible: minimum.promise,
      show: () => { openings += 1; },
    });
    (first === 'resources' ? resources : minimum).resolve();
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(openings, 0);
    (first === 'resources' ? minimum : resources).resolve();
    await completion;
    assert.equal(openings, 1);
  });
}

test('preparation failure prevents opening and later allocations', async () => {
  const calls = [];
  const preparation = prepareResources([
    { id: 'first', prepare: async () => { calls.push('first'); } },
    { id: 'broken', prepare: async () => { throw new Error('Resource unavailable'); } },
    { id: 'later', prepare: async () => { calls.push('later'); } },
  ]);
  await assert.rejects(showWhenReady({
    preparation,
    minimumVisible: Promise.resolve(),
    show: () => { calls.push('opened'); },
  }), /Resource unavailable/);
  assert.deepEqual(calls, ['first']);
});
