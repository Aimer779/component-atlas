import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { expect } from '@playwright/test';

export async function checkActionLinks(browser, url) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, recordVideo: { dir: 'test-results/action-links', size: { width: 1280, height: 720 } } });
  const page = await context.newPage(), states = [], errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  const fields = ['box-sizing', 'width', 'height', 'padding', 'font', 'color', 'background-color', 'background-image', 'border', 'appearance', 'border-radius', 'corner-shape', 'box-shadow', 'isolation', 'position', 'overflow', 'filter', 'transition', 'transform', 'opacity', 'z-index', 'fill'];
  const read = async link => link.evaluate((node, fields) => {
    const read = el => Object.fromEntries(fields.map(field => [field, getComputedStyle(el).getPropertyValue(field)]));
    const content = node.querySelector('.action-link-content'), glare = node.querySelector('.action-link-glare');
    return { normal: read(node), content: read(content), glare: read(glare), position: getComputedStyle(glare).backgroundPosition };
  }, fields);
  const finish = () => page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(document.getAnimations().filter(a => a.playState === 'running' && a.effect.target?.getClientRects().length && Number.isFinite(a.effect.getComputedTiming().endTime)).map(a => a.finished.catch(() => {})));
  });
  async function checkNoLegacyLinks() {
    const bad = await page.locator('#main a, #sidebar a').evaluateAll(nodes => nodes.filter(node => /[→↗]/u.test(node.textContent) || getComputedStyle(node).textDecorationLine.includes('underline') && node.querySelector('svg')).map(node => node.outerHTML));
    // The existing standalone preview icon is outside this text-link contract.
    assert.deepEqual(bad.filter(html => !html.includes('aria-label="单独打开预览"')), []);
    await expect(page.locator('.system-text-link, .doc-link')).toHaveCount(0);
  }
  try {
    for (const [width, height] of [[1600, 900], [1280, 720], [1024, 600]]) {
      await page.setViewportSize({ width, height });
      for (const theme of ['light', 'dark']) {
        await page.goto(`${url}/#/system?system=laper&section=document`);
        await page.evaluate(theme => { document.documentElement.dataset.theme = theme; document.dispatchEvent(new Event('atlas-theme-change')); }, theme);
        await page.locator('.system-section-title h2').last().hover();
        await finish();
        const back = page.getByRole('link', { name: '返回组件图鉴', exact: true });
        const document = page.getByRole('link', { name: '打开 DESIGN.md（新标签页）', exact: true });
        await expect(back).toBeInViewport(); await expect(document).toBeInViewport();
        await checkNoLegacyLinks();
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        const rest = await read(back);
        assert.equal(await back.evaluate(node => getComputedStyle(node).textDecorationLine), 'none');
        assert.equal(rest.normal['border-radius'], '9px');
        assert.equal(rest.position, '-100% -100%');
        assert.equal(await back.locator('.action-link-glare').evaluate(node => getComputedStyle(node).pointerEvents), 'none');
        const short = await read(document);
        for (const field of ['font', 'color', 'background-color', 'border', 'border-radius', 'corner-shape', 'box-shadow']) assert.equal(rest.normal[field], short.normal[field], `Two action-link surfaces differ: ${field}`);
        await back.hover(); await finish();
        const hover = await read(back);
        assert.equal(hover.position, '100% 100%');
        assert.notEqual(hover.normal['background-color'], rest.normal['background-color']);
        await page.locator('.system-section-title h2').last().hover(); await finish();
        assert.equal((await read(back)).position, '-100% -100%');
        // Real keyboard focus must show a ring and the same finite sweep.
        await back.focus(); await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab'); await finish();
        await expect(back).toBeFocused();
        assert.equal(await back.evaluate(node => node.matches(':focus-visible')), true);
        assert.equal((await read(back)).position, '100% 100%');
        assert.ok(await back.evaluate(node => parseFloat(getComputedStyle(node).outlineWidth) >= 2));
        await page.screenshot({ path: `artifacts/action-links-${width}-${theme}.png` });
        await page.emulateMedia({ reducedMotion: 'reduce' });
        assert.equal(await back.locator('.action-link-glare').evaluate(node => getComputedStyle(node).display), 'none');
        await page.emulateMedia({ reducedMotion: 'no-preference' });
        await back.click();
        await expect(page.locator('.component-card')).toHaveCount(15);
        await expect(page.locator('.system-back')).toHaveCount(0);
        states.push({ width, height, theme, rest, hover, keyboardAndReducedMotion: true });
      }
    }
    for (const id of ['atlas', 'laper', 'cromma']) {
      await page.goto(`${url}/#/system?system=${id}&section=document`);
      const link = page.locator('[data-document-link]');
      const href = await link.getAttribute('href');
      const popupEvent = page.waitForEvent('popup');
      await link.click();
      const popup = await popupEvent; await popup.waitForLoadState();
      assert.equal(popup.url(), new URL(href, url + '/').href);
      const response = await popup.request.get(popup.url());
      assert.ok(response.ok()); assert.ok((await response.text()).includes('## 6.'));
      await popup.close();
    }
    for (const route of ['sources', 'component/buttons/button-cromma-tag', 'missing']) {
      await page.goto(`${url}/#/${route}`); await finish(); await checkNoLegacyLinks();
      await page.screenshot({ path: `artifacts/action-links-${route.split('/')[0]}.png` });
    }
    assert.deepEqual(errors, []);
    await fs.writeFile('artifacts/action-link-checks.json', JSON.stringify({ states, errors, boundary: 'Chromium desktop: native navigation, document popups, both themes, keyboard, finite CSS sweeps and reduced motion; no physical power or other browsers.' }, null, 2) + '\n');
  } finally {
    const video = page.video(); await context.close();
    await video.saveAs('artifacts/action-links.webm');
  }
}
