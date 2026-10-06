import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { randomUUID } from 'node:crypto';
import { mountPreviews } from '../ui/previews.js';
import { pruneStyles } from './build-styles.mjs';
import { resourceReferences } from './resources.mjs';
import { startServer, root } from './browser-support.mjs';
import sharp from 'sharp';

test('preloading never activates an offscreen iframe; hiding and disposal stop the current preview', () => {
  const observers = [], messages = [], listeners = {};
  const frame = { dataset: { src: 'demos/test.html?managed=1' }, hasAttribute: () => Boolean(frame.src), addEventListener(name, fn) { listeners[name] = fn; }, removeEventListener(name) { delete listeners[name]; }, contentWindow: { postMessage: data => messages.push(data.active) } };
  const document = { hidden: false, addEventListener(name, fn) { listeners[name] = fn; }, removeEventListener(name) { delete listeners[name]; } };
  class Observer { constructor(fn, options) { this.fn = fn; this.options = options; observers.push(this); } observe() {} unobserve() {} disconnect() { this.disconnected = true; } }
  const previous = { document: globalThis.document, location: globalThis.location, IntersectionObserver: globalThis.IntersectionObserver };
  Object.assign(globalThis, { document, location: { origin: 'http://localhost' }, IntersectionObserver: Observer });
  try {
    const widget = mountPreviews({ querySelectorAll: () => [frame] });
    assert.equal(frame.src, undefined);
    observers[0].fn([{ target: frame, isIntersecting: true }]); listeners.load({ currentTarget: frame });
    assert.equal(frame.src, frame.dataset.src); assert.equal(messages.at(-1), false);
    observers[1].fn([{ target: frame, isIntersecting: true, intersectionRatio: .5 }]); assert.equal(messages.at(-1), true);
    widget.setEnabled(false); assert.equal(messages.at(-1), false);
    widget.setEnabled(true); document.hidden = true; listeners.visibilitychange(); assert.equal(messages.at(-1), false);
    widget.destroy(); assert.equal(messages.at(-1), false); assert.ok(observers.every(o => o.disconnected)); assert.deepEqual(listeners, {});
  } finally { Object.assign(globalThis, previous); }
});

test('demo activity trusts only its parent and keeps document visibility as an independent condition', () => {
  const events = {}, docEvents = {}, changes = [], parent = {};
  const document = { hidden: false, body: { dataset: {} }, addEventListener(name, fn) { docEvents[name] = fn; }, removeEventListener(name) { delete docEvents[name]; } };
  const window = {};
  vm.runInNewContext(fs.readFileSync(new URL('../demos/activity.js', import.meta.url), 'utf8'), { window, document, parent, URLSearchParams, location: { search: '?managed=1', origin: 'http://localhost' }, addEventListener(name, fn) { events[name] = fn; }, removeEventListener(name) { delete events[name]; } });
  const dispose = window.AtlasActivity.subscribe(active => changes.push(active));
  const message = { source: parent, origin: 'http://localhost', data: { type: 'atlas-preview-activity', active: true } };
  events.message({ ...message, source: {} }); events.message({ ...message, origin: 'https://elsewhere.test' }); assert.deepEqual(changes, [false]);
  events.message(message); assert.equal(changes.at(-1), true);
  document.hidden = true; docEvents.visibilitychange(); assert.equal(changes.at(-1), false);
  events.message(message); assert.equal(changes.at(-1), false);
  document.hidden = false; docEvents.visibilitychange(); assert.equal(changes.at(-1), true);
  dispose(); events.pagehide(); assert.equal(document.body.dataset.active, 'false'); assert.ok(!events.message && !docEvents.visibilitychange);
});

test('CSS pruning preserves escaped utilities, negative pseudo conditions, tokens and keyframes', () => {
  const css = ':root{--x:red}.used:not(.absent){color:red}.sm\\:w-1{width:1px}.unused{color:blue}@media(width>0){.unused{color:black}}@keyframes motion{from{opacity:0}to{opacity:1}}';
  const output = pruneStyles(css, 'used sm:w-1');
  assert.match(output, /used:not\(\.absent\)/); assert.match(output, /sm\\:w-1/); assert.match(output, /--x:red/); assert.match(output, /@keyframes motion/); assert.doesNotMatch(output, /unused|@media/);
});

test('resource inspection finds escaped inline URLs without mistaking SVG namespaces for requests', () => {
  const refs = resourceReferences('<svg xmlns="http://www.w3.org/2000/svg"></svg><div style="background:url(&quot;https://example.com/paper.jpg&quot;)"></div>', 'demo.html');
  assert.deepEqual(refs, ['https://example.com/paper.jpg']);
});

test('the smaller editor preview preserves every decoded RGBA pixel', async () => {
  const original = fs.readFileSync(new URL('../snapshots/assets/editor-workspace.png', import.meta.url));
  const optimized = fs.readFileSync(new URL('../assets/editor-workspace.webp', import.meta.url));
  assert.ok(optimized.length < original.length);
  assert.deepEqual(await sharp(optimized).ensureAlpha().raw().toBuffer(), await sharp(original).ensureAlpha().raw().toBuffer());
});

test('HTTP validators return an empty 304 and a same-size edit invalidates the previous ETag', async () => {
  const file = `test-results/cache-${randomUUID()}.txt`;
  fs.mkdirSync(root + 'test-results', { recursive: true });
  fs.writeFileSync(root + file, 'before', { flag: 'wx' });
  const server = await startServer(18191);
  try {
    const first = await fetch(`${server.url}/${file}`), etag = first.headers.get('etag');
    assert.equal(await first.text(), 'before'); assert.equal(first.headers.get('cache-control'), 'no-cache');
    const cached = await fetch(`${server.url}/${file}`, { headers: { 'If-None-Match': etag } });
    assert.equal(cached.status, 304); assert.equal(await cached.text(), '');
    fs.writeFileSync(root + file, 'after!');
    const changed = await fetch(`${server.url}/${file}`, { headers: { 'If-None-Match': etag } });
    assert.equal(changed.status, 200); assert.notEqual(changed.headers.get('etag'), etag); assert.equal(await changed.text(), 'after!');
  } finally { server.close(); fs.unlinkSync(root + file); }
});
