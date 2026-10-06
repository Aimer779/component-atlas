import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { expect } from '@playwright/test';

export async function checkTooltips(browser, url) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, reducedMotion: 'reduce' });
  const page = await context.newPage(), errors = [], states = [];
  page.on('pageerror', error => errors.push(String(error)));
  try {
    await page.clock.install({ time: new Date('2026-10-06T00:00:00Z') });
    await page.goto(`${url}/#/sources`, { waitUntil: 'networkidle' });
    await page.clock.pauseAt(new Date('2026-10-06T01:00:00Z'));
    const button = name => page.getByRole('button', { name, exact: true });
    const tip = page.locator('#category-tooltip');
    const hover = async target => {
      const rect = await target.boundingBox();
      await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
    };
    assert.equal(await page.locator('.nav-overview').count(), 0);
    assert.equal(await page.locator('.category-segments [title]').count(), 0, 'No duplicate native title tooltip');

    await hover(button('全部'));
    await page.clock.fastForward(219);
    await expect(tip).toBeHidden();
    await page.clock.fastForward(1);
    await expect(tip).toHaveText('全部');
    await expect(tip).toBeVisible();
    await expect(button('全部')).toHaveAttribute('aria-describedby', 'category-tooltip');
    await hover(button('基础交互'));
    await expect(tip).toHaveText('基础交互');
    await expect(button('全部')).not.toHaveAttribute('aria-describedby');
    await hover(tip);
    await page.clock.fastForward(2000);
    await expect(tip).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(tip).toBeHidden();
    await expect(button('基础交互')).not.toHaveAttribute('aria-describedby');
    await page.clock.fastForward(1000);
    await expect(tip).toBeHidden();

    await hover(button('内容展示'));
    await hover(page.locator('h1'));
    await page.clock.fastForward(1000);
    await expect(tip).toBeHidden();
    await button('全部').press('Tab');
    await page.keyboard.press('Shift+Tab');
    await expect(button('全部')).toBeFocused();
    await expect(tip).toHaveText('全部');
    await expect(tip).toBeVisible();
    await hover(button('全部'));
    await hover(page.locator('h1'));
    await page.clock.fastForward(1000);
    await expect(tip).toBeVisible();
    await hover(button('内容展示'));
    await expect(tip).toHaveText('内容展示');
    await hover(page.locator('h1'));
    await page.clock.fastForward(100);
    await expect(tip).toHaveText('全部');
    await page.keyboard.press('Escape');
    await expect(tip).toBeHidden();
    await page.keyboard.press('Tab');
    await expect(page.locator('.nav-item-link').first()).toBeFocused();

    for (const [width, height] of [[1600, 900], [1280, 720], [1181, 600], [1180, 600], [1024, 600]]) {
      await page.setViewportSize({ width, height });
      for (const theme of ['light', 'dark']) {
        await page.evaluate(value => document.documentElement.dataset.theme = value, theme);
        for (const name of ['全部', '基础交互', '内容展示', '背景效果', '文字与动效']) {
          await hover(button(name));
          await page.clock.fastForward(220);
          await expect(tip).toHaveText(name);
          await expect(tip).toBeVisible();
          const rect = await tip.boundingBox(), anchor = await button(name).boundingBox();
          assert.ok(rect.x >= 8 && rect.x + rect.width <= width - 8);
          assert.ok(rect.y >= 8 && rect.y + rect.height <= height - 8);
          assert.equal(Math.round(rect.y - anchor.y - anchor.height), 8);
          assert.equal(await tip.evaluate(node => node.parentNode === document.body), true);
          states.push({ width, height, theme, name, rect });
        }
        await page.screenshot({ path: `artifacts/tooltip-${width}-${theme}.png` });
      }
    }
    const previousTip = await tip.elementHandle();
    await button('文字与动效').click();
    await expect(page.locator('h1')).toHaveText('文字与动效');
    assert.equal(await previousTip.evaluate(node => node.isConnected), false);
    await expect(page.locator('[role="tooltip"]')).toHaveCount(1);
    await expect(tip).toBeHidden();
    await hover(page.locator('h1'));
    await page.clock.fastForward(5000);
    await expect(tip).toBeHidden();
    await expect(page.locator('[aria-describedby="category-tooltip"]')).toHaveCount(0);
    assert.deepEqual(errors, []);
    await fs.writeFile('artifacts/tooltip-checks.json', JSON.stringify({ states, checks: ['duplicate overview removed', '220ms controlled hover delay', 'instant label switching', 'tooltip remains while hovered', 'Escape dismissal', 'quick hover cancellation', 'keyboard focus and Tab', 'five labels in desktop themes', 'viewport bounds and body portal', 'navigation cleanup'], pageErrors: errors }, null, 2) + '\n');
  } finally { await context.close(); }
}
