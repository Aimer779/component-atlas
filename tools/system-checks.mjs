import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { expect } from '@playwright/test';
import { chapters, systemUrl } from '../ui/system-data.js';

export async function checkSystem(browser, url) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await context.newPage(), errors = [], external = [], states = [], evidence = [];
  context.on('page', item => item.on('pageerror', error => errors.push(String(error))));
  context.on('request', request => { if (!request.url().startsWith(url)) external.push(request.url()); });
  async function settle() {
    await page.evaluate(async () => {
      await document.fonts.ready;
      // Chromium can retain an unresolved finished promise after a disclosure hides a transition.
      await Promise.all(document.getAnimations().filter(a => a.playState === 'running' && a.effect.target?.getClientRects().length && Number.isFinite(a.effect.getComputedTiming().endTime)).map(a => a.finished.catch(() => {})));
    });
  }
  async function visit(id, chapter = 'overview') {
    await page.goto(url + '/' + systemUrl(id, chapter));
    await expect(page.locator('.system-page')).toHaveAttribute('data-system', id);
    await settle();
  }
  try {
    for (const [width, height] of [[1600, 900], [1280, 720], [1181, 600], [1180, 600], [1024, 600]]) {
      await page.setViewportSize({ width, height });
      for (const id of ['atlas', 'laper', 'cromma']) {
        await visit(id);
        for (const theme of ['light', 'dark']) {
          await page.evaluate(value => { document.documentElement.dataset.theme = value; document.dispatchEvent(new Event('atlas-theme-change')); }, theme);
          await settle();
          await expect(page.locator('.category-segments')).toHaveCount(0);
          await expect(page.locator('[data-system-chapter]')).toHaveCount(chapters.length);
          await expect(page.locator('main .segmented-control, [data-system-option]')).toHaveCount(0);
          const select = page.getByRole('combobox', { name: '选择设计系统' });
          await expect(select).toHaveText({ atlas: '图鉴外壳', laper: 'Laper', cromma: 'Cromma' }[id]);
          await select.click();
          const menu = page.locator('[data-owner="system-select"]');
          await expect(menu.getByRole('option')).toHaveCount(3);
          await expect(menu.getByRole('option', { selected: true })).toHaveText({ atlas: '图鉴外壳', laper: 'Laper', cromma: 'Cromma' }[id]);
          await settle();
          const placement = await menu.evaluate(node => {
            const a = document.querySelector('#system-select').getBoundingClientRect(), b = node.getBoundingClientRect();
            return { gap: Math.round(b.top - a.bottom), aligned: Math.abs(b.right - a.right) < 1, within: b.left >= 8 && b.right <= innerWidth - 8 && b.bottom <= innerHeight - 8, portaled: node.parentNode === document.body };
          });
          assert.deepEqual(placement, { gap: 6, aligned: true, within: true, portaled: true });
          if (width === 1280 && id === 'cromma') await page.screenshot({ path: `artifacts/system-select-${theme}.png` });
          await select.press('Escape');
          await expect(select).toBeFocused();
          await expect(menu).toHaveCount(0);
          const layout = await page.evaluate(() => ({
            overflow: document.documentElement.scrollWidth > innerWidth,
            collisions: [...document.querySelectorAll('.system-sidebar-title,.system-title-row,.token-heading,.specimen-meta,.motion-row')].filter(node => {
              const children = [...node.children].map(child => child.getBoundingClientRect());
              return children.some((a, i) => children.slice(i + 1).some(b => a.left < b.right - 1 && a.right > b.left + 1 && a.top < b.bottom - 1 && a.bottom > b.top + 1));
            }).map(node => node.className),
          }));
          assert.deepEqual(layout, { overflow: false, collisions: [] });
          const sizes = await page.locator('.type-sample').evaluateAll(nodes => nodes.map(node => getComputedStyle(node).fontSize));
          assert.deepEqual(sizes, { atlas: ['44px', '19px', '14px', '13px', '13px'], laper: ['44px', '16px', '12px'], cromma: ['44px', '16px', '14px'] }[id]);
          for (const [chapter, name] of chapters.slice(1)) {
            await page.getByRole('navigation', { name: '设计系统章节' }).getByRole('link', { name, exact: true }).click();
            await expect(page.locator(`#system-${chapter}`)).toBeFocused();
            assert.ok(await page.locator(`#system-${chapter}`).evaluate(node => {
              const box = node.getBoundingClientRect();
              return box.top >= 72 && box.top < innerHeight;
            }));
            await settle();
            if (width === 1280 && ['geometry', 'layout', 'material', 'components', 'motion', 'document'].includes(chapter)) await page.screenshot({ path: `artifacts/system-${id}-${chapter}-${theme}.png` });
          }
          await page.getByRole('link', { name: '系统简介', exact: true }).click();
          await expect(page.locator('#system-overview')).toBeFocused();
          await settle();
          if (width === 1280 || width === 1024) await page.screenshot({ path: `artifacts/system-${id}-${width}-${theme}.png` });
          states.push({ width, height, id, theme, layout, sizes, placement });
        }
      }
    }
    await page.setViewportSize({ width: 1280, height: 720 });
    for (const id of ['atlas', 'cromma']) {
      await visit(id, 'motion');
      for (const row of await page.locator('[data-motion]').all()) {
        await row.locator('button').click();
        const timing = await row.locator('.motion-sample').evaluate(node => {
          const a = node.getAnimations()[0]; a.pause();
          return { duration: a.effect.getTiming().duration, easing: a.effect.getTiming().easing };
        });
        await expect(row.locator('code')).toContainText(`${timing.duration}ms`);
        evidence.push({ id, timing });
        await row.locator('.motion-sample').evaluate(node => node.getAnimations()[0].finish());
        await expect(row.locator('button')).not.toHaveAttribute('aria-busy', 'true');
      }
    }
    await visit('atlas');
    const systemSelect = page.getByRole('combobox', { name: '选择设计系统' });
    await systemSelect.press('ArrowDown');
    await systemSelect.press('ArrowDown');
    await systemSelect.press('Enter');
    await expect(systemSelect).toBeFocused();
    await expect(page.locator('.system-page')).toHaveAttribute('data-system', 'laper');
    await systemSelect.press('ArrowDown');
    await systemSelect.press('End');
    await systemSelect.press('Enter');
    await expect(page.locator('.system-page')).toHaveAttribute('data-system', 'cromma');
    await expect(systemSelect).toBeFocused();
    await page.goBack();
    await expect(page.locator('.system-page')).toHaveAttribute('data-system', 'laper');
    await page.reload();
    await expect(systemSelect).toHaveText('Laper');
    await page.getByRole('link', { name: '材质与层次', exact: true }).click();
    await expect.poll(() => page.locator('.material-stage iframe[src]').count()).toBe(2);
    await page.waitForFunction(() => [...document.querySelectorAll('iframe')].every(frame => frame.contentDocument?.body.dataset.ready === 'true'));
    const frame = await page.locator('iframe').first().elementHandle();
    const materialUrl = page.url();
    await systemSelect.click();
    await page.getByRole('option', { name: 'Laper', exact: true }).click();
    assert.equal(page.url(), materialUrl);
    assert.ok(await frame.evaluate(node => node === document.querySelector('iframe')));
    await expect(systemSelect).toBeFocused();
    await page.locator('[data-theme-toggle]').click();
    await settle();
    assert.ok(await frame.evaluate(node => node === document.querySelector('iframe')));
    await page.getByRole('link', { name: '动效', exact: true }).click();
    assert.ok(await frame.evaluate(node => node === document.querySelector('iframe')), 'Chapter navigation must retain the material instance');
    for (const row of await page.locator('[data-motion]').all()) {
      const button = row.locator('button');
      await button.click();
      const sample = row.locator('.motion-sample');
      const timing = await sample.evaluate(node => { const a = node.getAnimations()[0]; a.pause(); return { duration: a.effect.getTiming().duration, easing: a.effect.getTiming().easing }; });
      evidence.push(timing);
      await button.click();
      assert.equal(await sample.evaluate(node => node.getAnimations().length), 1);
      await page.keyboard.press('Escape');
      assert.equal(await sample.evaluate(node => node.getAnimations().length), 0);
      await button.click();
      await sample.evaluate(node => node.getAnimations()[0].finish());
      await expect(button).not.toHaveAttribute('aria-busy', 'true');
    }
    await page.getByRole('button', { name: '播放文字进入' }).click();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect.poll(() => page.locator('.motion-sample').evaluateAll(nodes => nodes.flatMap(n => n.getAnimations()).length)).toBe(0);
    await page.getByRole('button', { name: '播放文字进入' }).click();
    assert.equal(await page.locator('.motion-sample').evaluateAll(nodes => nodes.flatMap(n => n.getAnimations()).length), 0);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.getByRole('button', { name: '播放文字进入' }).click();
    await page.getByRole('link', { name: '色彩', exact: true }).click();
    await expect(page.locator('#system-colors')).toBeFocused();
    assert.equal(await page.locator('.motion-sample').evaluateAll(nodes => nodes.flatMap(n => n.getAnimations()).length), 0);

    await visit('atlas', 'colors');
    const original = await page.locator('.system-page').elementHandle();
    const swatch = page.locator('[data-token="accent"]');
    await swatch.getByRole('button').click();
    await expect(swatch.locator('[data-copy-label]')).toHaveText('已复制');
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), await swatch.locator('[data-token-value]').textContent());
    await page.locator('[data-theme-toggle]').click();
    await settle();
    assert.ok(await original.evaluate(node => node === document.querySelector('.system-page')));
    await swatch.getByRole('button').click();
    assert.equal(await page.evaluate(() => navigator.clipboard.readText()), await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()));
    await page.getByRole('link', { name: '间距与形状', exact: true }).click();
    await page.getByText('比较同一半径的 round 与 squircle', { exact: true }).click();
    await expect(page.locator('.shape-pair')).toBeVisible();
    const lengths = await page.locator('.spacing-row').evaluateAll(nodes => nodes.map(node => [parseFloat(node.querySelector('code').textContent), node.querySelector('i').getBoundingClientRect().width]));
    lengths.forEach(([value, width]) => assert.equal(value, width));
    await page.getByRole('link', { name: '字体', exact: true }).click();
    await expect(page.locator('#system-typography')).toBeFocused();
    await settle();
    await page.screenshot({ path: 'artifacts/system-typography.png' });

    for (const [id, file, selector] of [['laper', 'reveal-laper', 'h1'], ['cromma', 'reveal-cromma', 'h2']]) {
      const reference = await context.newPage();
      await reference.setViewportSize({ width: 1075, height: 410 });
      await reference.goto(`${url}/demos/${file}.html`);
      const source = await reference.locator(selector).evaluate(node => { const css = getComputedStyle(node); return [css.fontSize, css.fontWeight, css.lineHeight, css.letterSpacing]; });
      await visit(id, 'typography');
      const current = await page.locator('.type-sample').first().evaluate(node => { const css = getComputedStyle(node); return [css.fontSize, css.fontWeight, css.lineHeight, css.letterSpacing]; });
      assert.deepEqual(current, source);
      evidence.push({ id, source, current }); await reference.close();
    }
    await page.goto(`${url}/#/system?system=invalid&section=unknown`);
    await expect(page.locator('.system-page')).toHaveAttribute('data-system', 'atlas');
    await systemSelect.click();
    await page.getByRole('option', { name: 'Cromma', exact: true }).click();
    await expect(page.locator('.system-page')).toHaveAttribute('data-system', 'cromma');
    await expect(systemSelect).toBeFocused();
    await expect(page.locator('.gs-portal')).toHaveCount(0);
    await systemSelect.click();
    await page.getByRole('link', { name: '返回组件图鉴', exact: true }).click();
    await expect(page.locator('.category-segments button')).toHaveCount(5);
    await expect(page.locator('[data-system-chapter]')).toHaveCount(0);
    await expect(page.locator('[data-owner="system-select"]')).toHaveCount(0);
    await expect(page.locator('.component-card')).toHaveCount(15);
    assert.deepEqual(errors, []); assert.deepEqual(external, []);
    await fs.writeFile('artifacts/system-checks.json', JSON.stringify({ states, evidence, errors, external, boundary: 'Chromium desktop, both themes; no physical GPU or mobile-browser measurements.' }, null, 2) + '\n');
  } finally { await context.close(); }
}
