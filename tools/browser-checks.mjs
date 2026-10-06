import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium, expect } from '@playwright/test';
import { components } from '../data.js';
import { startServer, trackAnimationWork, frameWork } from './browser-support.mjs';
import { checkNavigation } from './navigation-checks.mjs';
import { checkSidebar } from './sidebar-checks.mjs';
import { checkTooltips } from './tooltip-checks.mjs';
import { checkFonts } from './font-checks.mjs';
import { checkThemeReveal } from './theme-browser-checks.mjs';

const server = await startServer(18192);
const browser = await chromium.launch({ headless: true });
const checks = [], errors = [], external = [];
async function check(name, run) { await run(); checks.push(name); console.log(`PASS: ${name}`); }

function computedSamples() {
  const fields = ['box-sizing', 'width', 'height', 'padding', 'font-family', 'font-size', 'font-weight', 'color', 'background-color', 'background-image', 'border', 'border-radius', 'corner-shape', 'box-shadow', 'display', 'position', 'overflow', 'filter', 'opacity', 'transform', 'appearance', 'isolation', 'transition', 'z-index', 'fill', 'scale', 'max-width', 'object-fit'];
  return [...document.querySelectorAll('body, body *')].map(node => {
    const read = pseudo => {
      const css = getComputedStyle(node, pseudo);
      return Object.fromEntries(fields.map(field => [field, css.getPropertyValue(field)]));
    };
    return { tag: node.tagName, class: node.getAttribute('class'), normal: read(null), before: read('::before'), after: read('::after') };
  });
}

async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    document.body.getBoundingClientRect();
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    await Promise.all(document.getAnimations().filter(animation => animation.playState === 'running' && Number.isFinite(animation.effect.getComputedTiming().endTime)).map(animation => animation.finished.catch(() => {})));
  });
}

async function changeStyles(page, directory) {
  await page.locator('link[href*="/runtime/"], link[href*="/snapshots/"]').evaluate((link, next) => new Promise((resolve, reject) => {
    link.onload = resolve; link.onerror = () => reject(new Error('Stylesheet failed'));
    link.href = link.href.replace(/\/(runtime|snapshots)\//, `/${next}/`);
  }), directory);
  await settle(page);
}

let comparedStates = 0, comparedNodes = 0;
async function compareStyles(page, label) {
  await settle(page);
  const optimized = await page.evaluate(computedSamples);
  await changeStyles(page, 'snapshots');
  const reference = await page.evaluate(computedSamples);
  const differences = optimized.flatMap((node, index) => {
    const result = [];
    for (const state of ['normal', 'before', 'after']) for (const [field, value] of Object.entries(node[state])) {
      const expected = reference[index]?.[state]?.[field];
      if (value !== expected) result.push({ index, tag: node.tag, class: node.class, state, field, optimized: value, reference: expected });
    }
    return result;
  });
  if (differences.length) await fs.writeFile('test-results/css-differences.json', JSON.stringify({ label, differences }, null, 2));
  assert.equal(differences.length, 0, `${label}: ${differences.length} computed style differences; see test-results/css-differences.json`);
  comparedStates++; comparedNodes += optimized.length;
  await changeStyles(page, 'runtime');
}

try {
  await fs.mkdir('test-results', { recursive: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 });
  await context.addInitScript(trackAnimationWork);
  context.on('page', page => page.on('pageerror', error => errors.push(String(error))));
  context.on('request', request => { if (!request.url().startsWith(server.url)) external.push(request.url()); });
  const page = await context.newPage();
  async function detail(component, variant) {
    await page.goto(`${server.url}/#/component/${component}/${variant}`);
    await page.waitForFunction(() => document.querySelector('#demo-frame')?.contentDocument?.body?.dataset.ready === 'true');
    const frame = await (await page.locator('#demo-frame').elementHandle()).contentFrame();
    await expect.poll(() => frame.locator('body').getAttribute('data-active')).toBe('true');
    return frame;
  }

  await check('catalog loads only nearby demos and every card can subsequently load', async () => {
    await page.goto(server.url, { waitUntil: 'networkidle' });
    const initial = page.frames().filter(frame => frame.url().includes('/demos/')).length;
    assert.ok(initial > 0 && initial < 15, `Unexpected initial frame count: ${initial}`);
    assert.equal(page.frames().filter(frame => /cloud-hero|reel-laper|spring-laper/.test(frame.url())).length, 0);
    for (let index = 0; index < 15; index++) {
      await page.locator('.component-card').nth(index).scrollIntoViewIfNeeded();
      await expect.poll(() => page.locator('.thumbnail iframe').nth(index).getAttribute('src')).not.toBeNull();
    }
    await page.waitForFunction(() => [...document.querySelectorAll('.thumbnail iframe')].every(frame => frame.contentDocument?.body?.dataset.ready === 'true'));
    assert.equal(page.frames().filter(frame => frame.url().includes('/demos/')).length, 15);
    await page.evaluate(() => window.scrollTo(0, 0));
    for (const name of ['cloud-hero', 'reel-laper', 'spring-laper']) {
      const frame = page.frames().find(entry => entry.url().includes(name));
      await expect.poll(() => frame.locator('body').getAttribute('data-active')).toBe('false');
      assert.equal(await frame.evaluate(() => window.__atlasMetrics.pending.size), 0, name);
      assert.ok(await frame.evaluate(() => [...document.getAnimations()].every(animation => animation.playState !== 'running')), `${name}: CSS animation still runs`);
    }
  });

  await check('sidebar category segments filter destinations and keep keyboard navigation usable', () => checkSidebar(page, server.url));
  await check('category tooltips support hover, keyboard focus, dismissal and cleanup', () => checkTooltips(browser, server.url));
  await check('local bilingual fonts actually render, preserve code alignment and have readable fallbacks', () => checkFonts(browser, server.url));
  await check('native theme reveal preserves state and settles interrupted transitions', () => checkThemeReveal(browser, server.url));
  await check('physical card navigation and segmented preview/code controls', () => checkNavigation(page, server.url));

  await check('hidden code panels stop cloud, field and reel scheduling without replacing the frame', async () => {
    for (const [component, variant] of [['morph-cloud', 'cloud-hero'], ['morph-cloud', 'cloud-footer'], ['fractal-field', 'field-animated'], ['script-reel', 'reel-laper']]) {
      const frame = await detail(component, variant);
      await expect.poll(() => frame.evaluate(() => window.__atlasMetrics.pending.size)).toBe(1);
      const handle = await page.locator('#demo-frame').elementHandle();
      await page.getByRole('tab', { name: '代码', exact: true }).click();
      await expect.poll(() => frame.locator('body').getAttribute('data-active')).toBe('false');
      assert.equal(await frame.evaluate(() => window.__atlasMetrics.pending.size), 0, variant);
      await page.getByRole('tab', { name: '预览', exact: true }).click();
      assert.equal(await handle.evaluate(node => node === document.querySelector('#demo-frame')), true);
      await expect.poll(() => frame.evaluate(() => window.__atlasMetrics.pending.size)).toBe(1);
    }
  });

  await check('manual reel pause survives code-panel and document-visibility changes', async () => {
    const frame = await detail('script-reel', 'reel-laper');
    await frame.getByRole('button', { name: '暂停循环', exact: true }).click();
    assert.equal(await frame.evaluate(() => window.__atlasMetrics.pending.size), 0);
    await page.getByRole('tab', { name: '代码', exact: true }).click();
    await page.getByRole('tab', { name: '预览', exact: true }).click();
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, value: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect.poll(() => frame.locator('body').getAttribute('data-active')).toBe('false');
    await page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
    await expect.poll(() => frame.locator('body').getAttribute('data-active')).toBe('true');
    assert.equal(await frame.evaluate(() => window.__atlasMetrics.pending.size), 0);
    await frame.getByRole('button', { name: '继续循环', exact: true }).click();
    await expect.poll(() => frame.evaluate(() => window.__atlasMetrics.pending.size)).toBe(1);
    for (let index = 0; index < 5; index++) {
      await page.getByRole('tab', { name: '代码', exact: true }).click();
      await page.getByRole('tab', { name: '预览', exact: true }).click();
    }
    await expect.poll(() => frame.evaluate(() => window.__atlasMetrics.pending.size)).toBe(1);
    await page.getByRole('button', { name: '重播 ↻', exact: true }).click();
    await page.waitForFunction(() => document.querySelector('#demo-frame')?.contentDocument?.body?.dataset.active === 'true');
    assert.equal(await page.frameLocator('#demo-frame').getByRole('button', { name: '暂停循环', exact: true }).count(), 1);
  });

  await check('spring stops after convergence and restarts for both scroll directions and hidden-panel recovery', async () => {
    const frame = await detail('scroll-spring', 'spring-laper');
    assert.equal(await frame.evaluate(() => window.__atlasMetrics.pending.size), 0);
    const scroll = forward => frame.evaluate(value => {
      const viewport = document.querySelector('[data-spring-scroll]');
      viewport.scrollTop = value ? document.querySelector('[data-spring-section]').offsetTop : 0;
    }, forward);
    await scroll(true);
    await expect.poll(() => frame.locator('[data-scale]').textContent()).toBe('1.000');
    await expect.poll(() => frame.evaluate(() => window.__atlasMetrics.pending.size)).toBe(0);
    await scroll(false);
    await expect.poll(() => frame.locator('[data-scale]').textContent()).toBe('0.960');
    await expect.poll(() => frame.evaluate(() => window.__atlasMetrics.pending.size)).toBe(0);
    await scroll(true);
    await page.getByRole('tab', { name: '代码', exact: true }).click();
    await expect.poll(() => frame.locator('body').getAttribute('data-active')).toBe('false');
    assert.equal(await frame.evaluate(() => window.__atlasMetrics.pending.size), 0);
    await page.getByRole('tab', { name: '预览', exact: true }).click();
    await expect.poll(() => frame.locator('[data-scale]').textContent()).toBe('1.000');
    await expect.poll(() => frame.evaluate(() => window.__atlasMetrics.pending.size)).toBe(0);
    await page.screenshot({ path: 'artifacts/performance-spring.png' });
  });

  await check('billing selection survives preview suspension, theme change and source copying', async () => {
    const frame = await detail('billing', 'billing-laper');
    await frame.getByRole('switch').click();
    const selected = await frame.getByRole('switch').getAttribute('aria-checked');
    await page.getByRole('tab', { name: '代码', exact: true }).click();
    await expect.poll(() => page.getByRole('button', { name: '复制源码', exact: true }).isEnabled()).toBe(true);
    await page.locator('[data-theme-toggle]').click();
    await page.getByRole('tab', { name: '预览', exact: true }).click();
    assert.equal(await frame.getByRole('switch').getAttribute('aria-checked'), selected);
  });

  await check('all 23 variants retain computed styles in full-size and thumbnail states', async () => {
    const comparison = await context.newPage();
    await comparison.emulateMedia({ reducedMotion: 'reduce' });
    for (const component of components) for (const variant of component.variants) {
      for (const thumbnail of [false, true]) {
        await comparison.setViewportSize(thumbnail ? { width: 560, height: 380 } : { width: 1075, height: component.id === 'pricing-card' ? 570 : 410 });
        await comparison.goto(`${server.url}/demos/${variant.id}.html${thumbnail ? '?thumbnail=1' : ''}`);
        await comparison.waitForFunction(() => document.body.dataset.ready === 'true');
        await compareStyles(comparison, `${variant.id}: ${thumbnail ? 'thumbnail' : 'detail'} rest`);
        const mode = await comparison.locator('body').getAttribute('data-demo');
        let opened = false;
        if (mode === 'menu' && !thumbnail) { await comparison.locator('[aria-haspopup="menu"]').click(); opened = true; }
        if (mode === 'billing') { await comparison.getByRole('switch').click(); opened = true; }
        if (mode === 'accordion') { await comparison.locator('#faq button').nth(1).click(); opened = true; }
        if (mode === 'viewer') {
          await comparison.locator('[data-viewer-open]').click();
          await expect.poll(() => comparison.locator('.viewer-scrim').evaluate(node => getComputedStyle(node).opacity)).toBe('1');
          opened = true;
        }
        if (mode === 'toast' && !thumbnail) {
          await comparison.locator('[data-toast-open]').click();
          await expect.poll(() => comparison.locator('.laper-toast:not([data-starting])').count()).toBe(1);
          opened = true;
        }
        if (mode === 'prompt') { await comparison.locator('textarea').fill('Local performance check'); opened = true; }
        if (mode === 'button') {
          await comparison.locator('#sample a, #sample button').first().hover();
          await compareStyles(comparison, `${variant.id}: hover`);
          await comparison.locator('#sample a, #sample button').first().focus();
          opened = true;
        }
        if (opened) await compareStyles(comparison, `${variant.id}: ${thumbnail ? 'thumbnail' : 'detail'} open`);
      }
    }
    await comparison.close();
  });

  await check('catalog remains usable at desktop and short-window sizes in both themes', async () => {
    for (const [width, height] of [[1600, 900], [1280, 720], [1024, 600]]) {
      await page.setViewportSize({ width, height });
      await page.goto(server.url, { waitUntil: 'networkidle' });
      for (let theme = 0; theme < 2; theme++) {
        await settle(page);
        assert.equal(await page.locator('.component-card').count(), 15);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        await page.screenshot({ path: `artifacts/performance-catalog-${width}-${theme}.png` });
        await page.locator('[data-theme-toggle]').click();
      }
      await page.getByRole('button', { name: '背景效果', exact: true }).click();
      await expect(page.locator('.component-card')).toHaveCount(3);
      await page.getByRole('button', { name: '全部', exact: true }).click();
      await expect(page.locator('.component-card')).toHaveCount(15);
      await page.getByRole('combobox', { name: '按实验来源查看' }).click();
      await page.getByRole('option', { name: 'Laper', exact: true }).click();
      await expect.poll(async () => {
        const count = await page.locator('.component-card').count(); return count > 0 && count < 15;
      }).toBe(true);
    }
  });

  assert.deepEqual(external, [], 'Runtime attempted an external resource request');
  assert.deepEqual(errors, [], 'Browser JavaScript errors');
  const report = { checks, comparedStates, comparedNodes, fieldsPerNode: 28, pseudoStates: 3, externalRequests: external, pageErrors: errors, finalWork: await frameWork(page), boundary: 'Headless Chromium; simulated visibility change, not measured laptop power or other browsers.' };
  await fs.writeFile('artifacts/performance-browser-checks.json', JSON.stringify(report, null, 2) + '\n');
  console.log(`PASS: ${checks.length} browser checks; ${comparedStates} CSS states, ${comparedNodes} nodes; no page errors or external requests.`);
} finally { await browser.close(); server.close(); }
