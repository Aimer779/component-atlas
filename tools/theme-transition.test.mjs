import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
function harness({ reduced = false, fail = false } = {}) {
  const events = {}, windowEvents = {}, transitions = [], animations = [], values = new Map();
  const root = { dataset: {}, animate(frames, options) { const motion = { frames, options, cancel() { this.cancelled = true; } }; animations.push(motion); return motion; } };
  const button = { setAttribute() {}, addEventListener(name, callback) { events[name] = callback; }, getBoundingClientRect: () => ({ left: 1200, top: 18, width: 36, height: 36 }) };
  const motion = { matches: reduced, addEventListener(_, callback) { this.change = callback; } };
  const document = {
    documentElement: root, hidden: false, querySelector: () => button,
    addEventListener(name, callback) { events[name] = callback; }, dispatchEvent() {},
    startViewTransition(update) {
      if (fail) throw new Error('Snapshot unavailable');
      const ready = deferred(), finished = deferred();
      const transition = {
        ready: ready.promise, finished: finished.promise, update,
        reveal: ready.resolve, finish: finished.resolve,
        skipTransition() { this.skipped = true; ready.reject(new Error('Skipped')); finished.resolve(); },
      };
      transitions.push(transition); return transition;
    },
  };
  const window = { innerWidth: 1280, innerHeight: 720, matchMedia: () => motion, addEventListener(name, callback) { windowEvents[name] = callback; } };
  const localStorage = { getItem: () => 'dark', setItem(key, value) { values.set(key, value); } };
  vm.runInNewContext(fs.readFileSync(new URL('../theme.js', import.meta.url), 'utf8'), { document, window, localStorage, Math, Event: class {} });
  events.DOMContentLoaded();
  return { root, document, events, windowEvents, transitions, animations, values, motion };
}

test('rapid reversal before the snapshot update ignores the stale callback and preserves the latest choice', async () => {
  const page = harness();
  page.events.click();
  const first = page.transitions[0];
  page.events.click();
  first.update();
  await Promise.resolve();
  assert.equal(first.skipped, true);
  assert.equal(page.root.dataset.theme, 'dark');
  assert.equal(page.values.get('component-atlas-theme'), 'dark');
  assert.equal(page.animations.length, 0);
  assert.equal(page.root.dataset.themeTransition, undefined);
});

test('reversal after the update cancels the old reveal and applies the latest theme without stacking snapshots', async () => {
  const page = harness();
  page.events.click(); page.transitions[0].update(); page.transitions[0].reveal();
  await Promise.resolve();
  assert.equal(page.root.dataset.theme, 'light');
  page.events.click();
  await Promise.resolve();
  assert.equal(page.root.dataset.theme, 'dark');
  assert.equal(page.values.get('component-atlas-theme'), 'dark');
  assert.equal(page.transitions.length, 1);
  assert.equal(page.animations[0].cancelled, true);
  assert.equal(page.root.dataset.themeTransition, undefined);
});

test('resize, navigation, visibility, Escape and a new reduced-motion preference settle the pending choice', async () => {
  for (const interrupt of [
    page => page.windowEvents.resize(), page => page.windowEvents.hashchange(),
    page => { page.document.hidden = true; page.events.visibilitychange(); },
    page => page.events.keydown({ key: 'Escape' }),
    page => { page.motion.matches = true; page.motion.change(); },
  ]) {
    const page = harness(); page.events.click(); interrupt(page); page.transitions[0].update();
    await Promise.resolve();
    assert.equal(page.root.dataset.theme, 'light');
    assert.equal(page.values.get('component-atlas-theme'), 'light');
    assert.equal(page.root.dataset.themeTransition, undefined);
    assert.equal(page.transitions[0].skipped, true);
  }
});

test('storage sync overrides a pending local update without writing the external choice back', async () => {
  const page = harness(); page.events.click();
  page.windowEvents.storage({ key: 'component-atlas-theme', newValue: 'dark' });
  page.transitions[0].update(); await Promise.resolve();
  assert.equal(page.root.dataset.theme, 'dark');
  assert.equal(page.values.size, 0);
  assert.equal(page.root.dataset.themeTransition, undefined);
});

test('reduced-motion and a failed snapshot still switch and persist the theme', () => {
  for (const options of [{ reduced: true }, { fail: true }]) {
    const page = harness(options); page.events.click();
    assert.equal(page.root.dataset.theme, 'light');
    assert.equal(page.values.get('component-atlas-theme'), 'light');
    assert.equal(page.root.dataset.themeTransition, undefined);
    assert.equal(page.animations.length, 0);
  }
});
