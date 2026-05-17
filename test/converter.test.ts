import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitRow, isSpecial } from '../src/converter';

test('splitRow uses bare split(" ") — leading space yields empty first slot', () => {
  assert.deepEqual(splitRow(' 1 2'), ['', '1', '2']);
});

test('splitRow keeps consecutive spaces as empty slots', () => {
  assert.deepEqual(splitRow('a  b'), ['a', '', 'b']);
});

test('isSpecial: empty string is special', () => {
  assert.equal(isSpecial(''), true);
});

test('isSpecial: {tab} token is special', () => {
  assert.equal(isSpecial('{tab}'), true);
});

test('isSpecial: a normal letter is not special', () => {
  assert.equal(isSpecial('a'), false);
});
