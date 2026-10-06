import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { expandedRect, springStep, scrollTarget, reelDistance } from '../demos/motion-core.js';

const read = relative => fs.readFileSync(new URL(relative, import.meta.url), 'utf8');

function cloudHarness(reduced) {
  const uniforms = {}, frames = new Map(), deleted = [];
  let id = 0, time = 0, draws = 0;
  const gl = new Proxy({
    getShaderParameter: () => true, getProgramParameter: () => true,
    getExtension: () => null,
    getUniformLocation: (_, name) => name,
    uniform4fv: (name, value) => { uniforms[name] = [...value]; },
    uniform1f: (name, value) => { uniforms[name] = value; },
    drawArrays: () => { draws++; },
    deleteBuffer: () => deleted.push('buffer'), deleteProgram: () => deleted.push('program'), deleteShader: () => deleted.push('shader'),
  }, { get: (object, property) => property in object ? object[property] : () => ({}) });
  const canvas = { style: {}, getContext: () => gl, remove() { this.removed = true; } };
  const requestAnimationFrame = callback => { frames.set(++id, callback); return id; };
  const cancelAnimationFrame = key => frames.delete(key);
  let disconnected = 0;
  class ResizeObserver { observe() {} disconnect() { disconnected++; } }
  const window = { matchMedia: () => ({ matches: reduced }), ResizeObserver, setInterval: () => 1, clearInterval() {}, setTimeout: () => 1, clearTimeout() {} };
  const context = vm.createContext({ window, ResizeObserver, getComputedStyle: () => ({ color: 'rgb(53, 143, 243)' }), document: { hidden: false, createElement: () => canvas }, performance: { now: () => time }, requestAnimationFrame, cancelAnimationFrame });
  vm.runInContext(read('../engines/clouds.js'), context);
  return { window, canvas, uniforms, frames, deleted, context, get disconnected() { return disconnected; }, get draws() { return draws; }, flush() {
    const pending = [...frames.values()]; frames.clear(); time += 16;
    pending.forEach(callback => callback(time));
  } };
}

test('reduced-motion cloud keeps visible geometry after resize without a continuous animation loop', () => {
  const harness = cloudHarness(true);
  const layer = harness.window.HeroCloud.create({ appendChild() {} }, { shadow: .24, opacity: 1 });
  layer.resize({ width: 1075, height: 410 }, false);
  harness.flush();
  const radius = () => Math.max(...harness.uniforms['uBlobs[0]'].filter((_, index) => index % 4 === 2));
  assert.ok(radius() > 40, 'A correctly sized static cloud must not remain a 1px-stage speck');
  assert.equal(harness.canvas.width, 806); assert.equal(harness.canvas.height, 307);
  assert.equal(harness.uniforms.uTime, 0); assert.equal(harness.frames.size, 0);
  layer.resize({ width: 640, height: 320 }, false);
  assert.ok(radius() > 20); assert.equal(harness.frames.size, 0);
  const draws = harness.draws; layer.pulse(); assert.equal(harness.draws, draws);
  layer.destroy(); assert.ok(harness.canvas.removed); assert.equal(harness.deleted.length, 4);
});

test('disposing a dot field releases its resize observer, animation and GPU resources exactly once', () => {
  const harness = cloudHarness(false);
  vm.runInContext(read('../engines/field.js'), harness.context);
  const layer = harness.window.CrommaField.mount({ style: {}, clientWidth: 400, clientHeight: 200, appendChild() {} }, { kind: 'newton', animated: true });
  harness.flush();
  assert.ok(harness.frames.size > 0);
  layer.destroy();
  assert.equal(harness.frames.size, 0); assert.equal(harness.disconnected, 1); assert.equal(harness.deleted.length, 4); assert.ok(harness.canvas.removed);
  layer.destroy(); assert.equal(harness.disconnected, 1); assert.equal(harness.deleted.length, 4);
});

test('cloud and field adapters preserve every original shader string', () => {
  for (const [engine, constants] of [['clouds', ['CLOUD_VERT', 'CLOUD_FRAG']], ['field', ['FIELD_VERT', 'FIELD_FRAG']]]) {
    const original = read(`../snapshots/${engine}.js`), adapted = read(`../engines/${engine}.js`);
    for (const name of constants) {
      const expression = new RegExp(`const ${name} = ([\x60][\\s\\S]*?[\x60]);`);
      const reference = expression.exec(original)?.[1];
      assert.ok(reference, `Missing source shader: ${name}`);
      assert.equal(expression.exec(adapted)?.[1], reference, name);
    }
  }
});

test('each variant lists its actual direct files, transitive motion module and local assets', () => {
  const records = JSON.parse(read('../provenance.json')).filter(record => record.variant);
  for (const record of records) {
    const html = read(`../demos/${record.variant}.html`);
    const dependencies = [...html.matchAll(/(?:src|href)="\.\.\/([^"#]+)"/g)].map(match => match[1]);
    for (const dependency of dependencies) assert.ok([...record.files, ...record.assets].includes(dependency), `${record.variant}: ${dependency}`);
    if (record.files.includes('demos/motion.js')) assert.ok(record.files.includes('demos/motion-core.js'));
    if (record.variant === 'menu-laper') assert.ok(record.files.includes('snapshots/lang-flags.js'));
    if (record.variant.startsWith('button-')) assert.ok(!record.files.some(file => /engines|lang-flags/.test(file)), 'Plain buttons must not load unused engines');
  }
});

test('opening a Laper menu exposes its open state on the actual generated panel', () => {
  let panel;
  const handlers = {};
  const node = () => ({ dataset: {}, style: {}, children: [], listeners: {}, attributes: {}, classList: { add() {} },
    setAttribute(name, value) { this.attributes[name] = value; },
    removeAttribute(name) { delete this.attributes[name]; },
    addEventListener(type, callback) { this.listeners[type] = callback; },
    append(child) { this.children.push(child); }, focus() { document.activeElement = this; }, remove() { this.removed = true; },
    querySelector() { return this.children[0]; }, querySelectorAll() { return this.children; },
    offsetWidth: 128, offsetHeight: 100, scrollHeight: 100,
    getBoundingClientRect: () => ({ top: 80, bottom: 108, right: 200 }),
  });
  const trigger = node();
  const body = { dataset: { demo: 'menu', theme: 'laper', variant: 'menu-laper' }, append(value) { panel = value; } };
  const document = { body, querySelector: () => ({ querySelector: () => trigger }), createElement: node, createTextNode: text => text, addEventListener(type, callback) { handlers[type] = callback; } };
  const window = { LAPER_LANG_ITEMS: [{ name: 'English', short: 'EN' }, { name: 'Español', short: 'ES' }] };
  vm.runInNewContext(read('../demos/demo.js'), { window, document, URLSearchParams, location: { search: '' }, matchMedia: () => ({ matches: false }), addEventListener() {}, innerWidth: 1200, innerHeight: 800 });
  trigger.listeners.click();
  assert.equal(panel.dataset.state, 'open'); assert.equal(trigger.attributes['aria-expanded'], 'true');
  assert.equal(panel.children.length, 2);
  assert.match(read('../snapshots/laper.css'), /\.laper-menu-motion\[data-state=open\]/);
  trigger.listeners.click();
  assert.ok(panel.removed); assert.equal(trigger.attributes['aria-expanded'], 'false'); assert.ok(!trigger.attributes['aria-controls']);
  trigger.listeners.click();
  assert.doesNotThrow(() => handlers.keydown({ key: 'Escape', preventDefault() {} }));
  assert.ok(panel.removed); assert.equal(trigger.attributes['aria-expanded'], 'false'); assert.equal(document.activeElement, trigger);
});

test('reel travels the same distance at 30, 60 and 144fps and wraps at the repeated half', () => {
  const offsets = [30, 60, 144].map(fps => {
    let offset = 0, from = 0;
    while (from < 20000) { const to = Math.min(20000, from + 1000 / fps); offset = (offset + reelDistance(from, to)) % 1056; from = to; }
    return offset;
  });
  offsets.forEach(offset => { assert.ok(Math.abs(offset - offsets[0]) < 1e-6); assert.ok(offset >= 0 && offset < 1056); });
});

test('spring remains finite after a long frame and settles in both scroll directions', () => {
  const state = { value: .96, velocity: 0 };
  springStep(state, 1, 10);
  assert.ok(Number.isFinite(state.value) && state.value >= .96 && state.value <= 1.01);
  for (let index = 0; index < 240; index++) springStep(state, 1, 1 / 60);
  assert.ok(Math.abs(state.value - 1) < 1e-6);
  for (let index = 0; index < 240; index++) springStep(state, .96, 1 / 60);
  assert.ok(Math.abs(state.value - .96) < 1e-6);
});

test('a hidden preview has no scroll target and becomes finite again when its layout returns', () => {
  assert.equal(scrollTarget(0, 0), null);
  assert.equal(scrollTarget(410, NaN), null);
  assert.equal(scrollTarget(410, 460), .96);
  assert.equal(scrollTarget(410, 205), 1);
});

test('viewer fits inside 80% of every desktop window and keeps a centered 16:9 stage', () => {
  for (const [width, height] of [[1440, 900], [1280, 600], [1075, 410]]) {
    const rect = expandedRect(width, height);
    assert.ok(rect.width <= width * .8 + 1e-6 && rect.height <= height * .8 + 1e-6);
    assert.ok(Math.abs(rect.width / rect.height - 16 / 9) < 1e-9);
    assert.ok(Math.abs(rect.left * 2 + rect.width - width) < 1e-6); assert.ok(Math.abs(rect.top * 2 + rect.height - height) < 1e-6);
  }
});
