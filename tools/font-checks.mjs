import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { expect } from '@playwright/test';

export async function checkFonts(browser, url) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage(), errors = [], states = [];
  page.on('pageerror', error => errors.push(String(error)));
  const cdp = await context.newCDPSession(page);
  await cdp.send('DOM.enable'); await cdp.send('CSS.enable');
  async function actualFonts(selector) {
    await page.evaluate(() => document.fonts.ready);
    const { root } = await cdp.send('DOM.getDocument', { depth: 0 });
    const { nodeId } = await cdp.send('DOM.querySelector', { nodeId: root.nodeId, selector });
    return (await cdp.send('CSS.getPlatformFontsForNode', { nodeId })).fonts;
  }
  async function settle() {
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all(document.getAnimations().filter(animation => Number.isFinite(animation.effect.getComputedTiming().endTime)).map(animation => animation.finished.catch(() => {})));
    });
  }
  try {
    for (const [width, height] of [[1600, 900], [1280, 720], [1181, 600], [1180, 600], [1024, 600]]) {
      await page.setViewportSize({ width, height });
      await page.goto(`${url}/#/catalog`);
      for (const theme of ['light', 'dark']) {
        await page.evaluate(value => document.documentElement.dataset.theme = value, theme);
        await settle();
        const title = await actualFonts('h1');
        const english = await actualFonts('.card-english');
        const mixed = await actualFonts('.page-intro');
        assert.ok(title.some(font => font.familyName === 'Atlas CJK' && font.isCustomFont && font.glyphCount > 0), JSON.stringify(title));
        assert.ok(english.some(font => font.familyName === 'Inter' && font.isCustomFont && font.glyphCount > 0), JSON.stringify(english));
        assert.ok(mixed.some(font => font.familyName === 'Atlas CJK') && mixed.some(font => font.familyName === 'Inter'));
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        await expect(page.locator('.component-card')).toHaveCount(15);
        await expect(page.locator('.category-segments button')).toHaveCount(5);
        states.push({ width, height, theme, title, english, mixed });
        await page.screenshot({ path: `artifacts/fonts-catalog-${width}-${theme}.png` });
      }
      await page.goto(`${url}/#/component/buttons/button-cromma-tag`);
      await page.getByRole('tab', { name: '代码', exact: true }).click();
      await expect(page.locator('[data-copy]')).toBeEnabled();
      await settle();
      const code = await actualFonts('#source-code');
      assert.ok(code.some(font => font.familyName === 'JetBrains Mono' && font.isCustomFont && font.glyphCount > 0), JSON.stringify(code));
      const measurements = await page.evaluate(() => {
        const canvas = document.createElement('canvas'), paint = canvas.getContext('2d');
        paint.font = '13px "JetBrains Mono"';
        return ['i', 'W', '0'].map(char => paint.measureText(char).width);
      });
      assert.equal(measurements[0], measurements[1]);
      assert.equal(measurements[1], measurements[2]);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      states.push({ width, height, code, monospaceWidths: measurements });
      await page.screenshot({ path: `artifacts/fonts-code-${width}.png` });
    }
    await page.goto(`${url}/#/system`);
    await settle();
    await expect(page.locator('main')).toContainText('Noto Sans SC');
    await expect(page.locator('main')).toContainText('JetBrains Mono');
    const loaded = await page.evaluate(() => [...document.fonts].filter(face => face.status === 'loaded').map(face => ({ family: face.family, weight: face.weight, display: face.display })));
    assert.ok(loaded.filter(face => ['Inter', 'Atlas CJK', 'JetBrains Mono'].includes(face.family.replaceAll('"', ''))).every(face => face.display === 'swap'));
    assert.deepEqual(errors, []);
    await fs.writeFile('artifacts/font-checks.json', JSON.stringify({ states, loaded, pageErrors: errors, boundary: 'Chromium platform-font evidence, two desktop themes; original iframe font choices are unchanged.' }, null, 2) + '\n');
  } finally { await context.close(); }

  const fallback = await browser.newContext({ viewport: { width: 1024, height: 600 } });
  try {
    await fallback.route('**/assets/fonts/*.woff2', route => route.abort());
    const fallbackPage = await fallback.newPage();
    await fallbackPage.goto(`${url}/#/catalog`);
    await expect(fallbackPage.locator('h1')).toHaveText('组件总览');
    await expect(fallbackPage.locator('.component-card')).toHaveCount(15);
    await expect(fallbackPage.getByRole('button', { name: '全部', exact: true })).toBeVisible();
    assert.ok(await fallbackPage.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await fallbackPage.screenshot({ path: 'artifacts/fonts-fallback.png' });
  } finally { await fallback.close(); }
}
