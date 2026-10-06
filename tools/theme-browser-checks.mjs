import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { expect } from '@playwright/test';

export async function checkThemeReveal(browser, url) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir: 'test-results/theme-video', size: { width: 1280, height: 720 } } });
  const page = await context.newPage(), errors = [], samples = [];
  page.on('pageerror', error => errors.push(String(error)));
  await page.addInitScript(() => {
    window.__themeReveals = [];
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (frames, options) {
      const animation = animate.call(this, frames, options);
      if (options?.pseudoElement === '::view-transition-new(root)') window.__themeReveals.push({ frames, options, animation });
      return animation;
    };
  });
  const toggle = page.locator('[data-theme-toggle]');
  const finished = () => page.waitForFunction(() => !document.documentElement.dataset.themeTransition);
  async function reveal() {
    const count = await page.evaluate(() => window.__themeReveals.length);
    await toggle.click();
    await page.waitForFunction(previous => window.__themeReveals.length > previous, count);
    return count;
  }
  try {
    await page.goto(`${url}/#/catalog`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    for (const [width, height] of [[1280, 720], [1024, 600], [1600, 900]]) {
      await page.setViewportSize({ width, height });
      for (const target of ['light', 'dark']) {
        const index = await reveal();
        const sample = await page.evaluate(index => {
          const { frames, options, animation } = window.__themeReveals[index];
          const rect = document.querySelector('[data-theme-toggle]').getBoundingClientRect();
          return { frames, options, currentTime: animation.currentTime, button: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }, theme: document.documentElement.dataset.theme };
        }, index);
        assert.equal(sample.theme, target);
        assert.equal(sample.options.duration, 520);
        const coordinates = sample.frames.clipPath[1].match(/circle\(([\d.]+)px at ([\d.]+)px ([\d.]+)px\)/).slice(1).map(Number);
        const [radius, x, y] = coordinates;
        assert.ok(x > width * .8 && y < 72);
        assert.ok(Math.abs(x - sample.button.x) < 1 && Math.abs(y - sample.button.y) < 1);
        assert.ok(radius >= Math.hypot(x, height - y) - .01, 'Reveal must cover the lower-left corner');
        samples.push({ width, height, target, ...sample });
        if (width === 1280) {
          for (const fraction of [.15, .5, .8]) {
            await page.evaluate(({ index, fraction }) => {
              const animation = window.__themeReveals[index].animation;
              animation.pause(); animation.currentTime = animation.effect.getTiming().duration * fraction;
            }, { index, fraction });
            await page.screenshot({ path: `artifacts/theme-reveal-${target}-${fraction}.png` });
          }
          await page.evaluate(index => window.__themeReveals[index].animation.play(), index);
        }
        await finished();
        await expect(toggle).toHaveAttribute('aria-pressed', String(target === 'dark'));
        assert.equal(await page.evaluate(() => localStorage.getItem('component-atlas-theme')), target);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      }
    }
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.locator('.component-card').last().scrollIntoViewIfNeeded();
    const scrollPosition = await page.evaluate(() => scrollY);
    assert.ok(scrollPosition > 0);
    for (let step = 0; step < 2; step++) {
      await reveal(); await finished();
      assert.equal(await page.evaluate(() => scrollY), scrollPosition);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await reveal(); await toggle.click(); await finished();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    // Physical rapid input continues through the snapshot overlay.
    await toggle.click({ clickCount: 3, delay: 30 }); await finished();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await toggle.press('Space'); await finished();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(toggle).toBeFocused();

    await reveal(); await page.keyboard.press('Escape'); await finished();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await reveal(); await page.setViewportSize({ width: 1024, height: 600 }); await finished();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await reveal(); await page.getByRole('link', { name: '设计系统', exact: true }).click(); await finished();
    await expect(page.locator('main .palette').first()).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    await reveal(); await page.emulateMedia({ reducedMotion: 'reduce' }); await finished();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    const before = await page.evaluate(() => window.__themeReveals.length);
    await toggle.click();
    assert.equal(await page.evaluate(() => window.__themeReveals.length), before);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto(`${url}/#/component/billing/billing-laper`);
    await page.waitForFunction(() => document.querySelector('#demo-frame')?.contentDocument?.body?.dataset.ready === 'true');
    const frame = page.frameLocator('#demo-frame');
    await frame.getByRole('switch').click();
    const state = await frame.getByRole('switch').getAttribute('aria-checked');
    const handle = await page.locator('#demo-frame').elementHandle();
    await reveal(); await finished();
    assert.equal(await handle.evaluate(node => node === document.querySelector('#demo-frame')), true);
    await expect(frame.getByRole('switch')).toHaveAttribute('aria-checked', state);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    assert.deepEqual(errors, []);
  } finally {
    await context.close();
  }

  const fallback = await browser.newContext();
  try {
    const page = await fallback.newPage();
    await page.addInitScript(() => { document.startViewTransition = undefined; });
    await page.goto(url);
    await page.locator('[data-theme-toggle]').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(page.locator('html')).not.toHaveAttribute('data-theme-transition');
    const failed = await fallback.newPage(), failures = [];
    failed.on('pageerror', error => failures.push(String(error)));
    await failed.goto(url);
    const failingTarget = await failed.locator('html').getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    await failed.addStyleTag({ content: '.brand, .theme-toggle { view-transition-name: duplicate; }' });
    await failed.locator('[data-theme-toggle]').click();
    await expect(failed.locator('html')).toHaveAttribute('data-theme', failingTarget);
    await expect(failed.locator('html')).not.toHaveAttribute('data-theme-transition');
    await expect(page.locator('html')).toHaveAttribute('data-theme', failingTarget);
    assert.deepEqual(failures, [], 'A failed snapshot must not leave an unhandled rejection');
  } finally { await fallback.close(); }

  // Deliver a natural-speed example, separate from paused keyframe inspection.
  const demo = await browser.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir: 'test-results/theme-demo', size: { width: 1280, height: 720 } } });
  const demoPage = await demo.newPage();
  try {
    await demoPage.goto(`${url}/#/catalog`, { waitUntil: 'networkidle' });
    await demoPage.evaluate(() => document.fonts.ready);
    for (let step = 0; step < 2; step++) {
      await demoPage.locator('[data-theme-toggle]').click();
      await demoPage.waitForFunction(() => !document.documentElement.dataset.themeTransition);
    }
  } finally {
    const video = demoPage.video();
    await demo.close();
    await fs.copyFile(await video.path(), 'artifacts/theme-reveal.webm');
  }
  await fs.writeFile('artifacts/theme-reveal-checks.json', JSON.stringify({ samples, checks: ['both directions from the upper-right button', 'farthest-corner coverage', '520ms native animation', 'rapid pointer input and reversal', 'keyboard focus', 'Escape/resize/navigation interruption', 'reduced-motion preference and change', 'iframe state preservation', 'refresh persistence', 'scrolled-page position retention', 'no-API immediate switching', 'failed-snapshot recovery', 'cross-tab storage synchronization'], pageErrors: errors }, null, 2) + '\n');
}
