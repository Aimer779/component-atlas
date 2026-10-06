import { test } from 'node:test';
import assert from 'node:assert/strict';
import { typeaheadIndex, menuPlacement } from '../ui/glide-select.js';

test('select keyboard typeahead cycles repeated initials and wraps across the current selection', () => {
  const options = ['所有来源', 'Laper', 'Local', 'Cromma'].map(label => ({ label }));
  assert.equal(typeaheadIndex(options, 0, 'l'), 1);
  assert.equal(typeaheadIndex(options, 1, 'L'), 2);
  assert.equal(typeaheadIndex(options, 2, 'l'), 1);
  assert.equal(typeaheadIndex(options, 3, '所'), 0);
});

test('select keyboard typeahead keeps the selection when no option matches, including empty lists', () => {
  assert.equal(typeaheadIndex([{ label: 'Laper' }, { label: 'Cromma' }], 1, 'z'), 1);
  assert.equal(typeaheadIndex([], 0, 'a'), 0);
});

test('select menu flips above a low trigger and retains the six-pixel anchor gap', () => {
  const rect = { left: 400, right: 516, width: 116, top: 500, bottom: 532 };
  const menu = menuPlacement(rect, 7, { width: 1024, height: 600 }, 480);
  assert.equal(menu.side, 'top');
  assert.equal(rect.top - (menu.top + menu.height), 6);
  assert.equal(menu.height, 224);
  assert.ok(menu.top >= 8);
});

test('select menu stays inside the viewport for long lists and wide requested menus', () => {
  const viewport = { width: 1024, height: 600 };
  const menu = menuPlacement({ left: 850, right: 966, width: 116, top: 300, bottom: 332 }, 20, viewport, 1200, 'right');
  assert.ok(menu.left >= 8);
  assert.ok(menu.left + menu.width <= viewport.width - 8);
  assert.ok(menu.top >= 8);
  assert.ok(menu.top + menu.height <= viewport.height - 8);
});
