import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mountCopyButton } from '../ui/copy-button.js';

function fixture(write) {
  const label = { textContent: '' }, messages = [];
  class Button extends EventTarget {
    dataset = {};
    disabled = false;
    querySelector() { return label; }
  }
  const button = new Button();
  const control = mountCopyButton(button, { write, notify: message => messages.push(message) });
  return { button, label, control, messages, click() { button.dispatchEvent(new Event('click')); } };
}

test('copy is disabled before loading and writes the complete current source with inline success', async t => {
  const writes = [];
  const page = fixture(async text => { writes.push(text); });
  t.after(() => page.control.destroy());
  assert.equal(page.button.disabled, true);
  page.click(); assert.equal(writes.length, 0);
  const raw = '<div>original</div>\n  literal \\n and 中文';
  page.control.setSource(raw); page.click();
  await Promise.resolve();
  assert.deepEqual(writes, [raw]);
  assert.equal(page.label.textContent, '已复制');
  assert.equal(page.button.dataset.state, 'copied');
  assert.equal(page.button.disabled, false);
  assert.equal(page.messages.length, 0, 'Success appears once, beside its action');
});

test('changing files while clipboard is pending discards stale success', async t => {
  let resolve;
  const pending = new Promise(done => { resolve = done; });
  const page = fixture(() => pending);
  t.after(() => page.control.destroy());
  page.control.setSource('file A'); page.click();
  page.control.setSource('');
  assert.equal(page.button.disabled, true);
  page.control.setSource('file B');
  resolve(); await pending;
  assert.equal(page.label.textContent, '复制源码');
  assert.equal(page.button.dataset.state, 'idle');
  assert.equal(page.button.disabled, false);
});

test('clipboard rejection restores the action and reports the failure', async t => {
  const page = fixture(async () => { throw new Error('Clipboard denied'); });
  t.after(() => page.control.destroy());
  page.control.setSource('source'); page.click();
  await Promise.resolve();
  assert.equal(page.button.disabled, false);
  assert.equal(page.label.textContent, '复制源码');
  assert.equal(page.messages.length, 1);
  assert.match(page.messages[0], /复制失败/);
});

test('repeated pending clicks copy once and disposal prevents late feedback and future writes', async () => {
  let resolve, writes = 0;
  const pending = new Promise(done => { resolve = done; });
  const page = fixture(() => { writes++; return pending; });
  page.control.setSource('source'); page.click(); page.click();
  assert.equal(writes, 1);
  page.control.destroy();
  resolve(); await pending;
  assert.equal(page.button.dataset.state, 'idle');
  page.click(); assert.equal(writes, 1);
});
