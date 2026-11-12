import assert from 'node:assert/strict';
import test from 'node:test';
import { totalDurationSeconds, validatePresentation } from '../src/index.ts';
import { presentation } from '../../../presentations/drepanocytose/presentation.ts';

test('the first presentation conforms to the contract and plans twelve minutes before questions', () => {
  assert.deepEqual(validatePresentation(presentation), { valid: true, issues: [] });
  assert.equal(totalDurationSeconds(presentation), 720);
});
