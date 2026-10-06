import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { expect } from '@playwright/test';

export async function checkNavigation(page, url) {
  const visits = [], states = [];
  async function catalog(query = '') {
    await page.goto(`${url}/#/catalog${query}`);
    await expect(page.locator('.component-card').first()).toBeVisible();
  }
  async function openCard(index, area, query = '') {
    await catalog(query);
    const card = page.locator('.component-card').nth(index);
    await card.scrollIntoViewIfNeeded();
    const href = await card.getAttribute('href');
    const name = await card.locator('.card-title').textContent();
    if (area === 'keyboard') {
      await card.focus();
      await page.keyboard.press('Enter');
    } else {
      const target = area === 'thumbnail' ? card.locator('.thumbnail') : area === 'title' ? card.locator('.card-title') : card;
      const box = await target.boundingBox();
      // Physical pointer input tests the visible surface, including the iframe area.
      await page.mouse.click(box.x + box.width / 2, area === 'edge' ? box.y + box.height - 3 : box.y + box.height / 2);
    }
    await expect(page).toHaveURL(`${url}/${href}`);
    await expect(page.locator('h1')).toHaveText(name);
    await page.waitForFunction(() => document.querySelector('#demo-frame')?.contentDocument?.body?.dataset.ready === 'true');
    await expect(page.locator('#preview-panel')).toBeVisible();
    visits.push({ href, area, query });
  }

  await page.setViewportSize({ width: 1280, height: 720 });
  await catalog();
  const count = await page.locator('.component-card').count();
  for (let index = 0; index < count; index++) {
    for (const area of ['thumbnail', 'title', 'edge']) await openCard(index, area);
  }
  await openCard(0, 'keyboard');
  await page.goBack();
  await expect(page.locator('.component-card')).toHaveCount(count);
  await page.goForward();
  await expect(page.locator('#demo-frame')).toBeVisible();
  await page.reload();
  await expect(page.locator('h1')).toHaveText('材质按钮');
  for (const project of ['Laper', 'Cromma']) {
    const query = `?project=${project}`;
    await catalog(query);
    const filtered = await page.locator('.component-card').count();
    for (let index = 0; index < filtered; index++) {
      await openCard(index, 'thumbnail', query);
      await expect(page.locator('.source-details summary')).toHaveText(`提取来源：${project}`);
    }
  }

  // A child iframe must not steal navigation if another stylesheet enables it.
  await catalog();
  await page.addStyleTag({ content: '.thumbnail iframe { pointer-events: auto !important; }' });
  const first = page.locator('.component-card').first();
  const href = await first.getAttribute('href');
  const box = await first.locator('.thumbnail').boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page).toHaveURL(`${url}/${href}`);

  for (const [width, height] of [[1600, 900], [1280, 720], [1024, 600]]) {
    await page.setViewportSize({ width, height });
    for (const theme of ['light', 'dark']) {
      await page.evaluate(value => document.documentElement.dataset.theme = value, theme);
      const preview = page.getByRole('tab', { name: '预览', exact: true });
      const code = page.getByRole('tab', { name: '代码', exact: true });
      await preview.click();
      await expect(preview).toHaveAttribute('aria-selected', 'true');
      await code.click();
      await expect(code).toHaveAttribute('aria-selected', 'true');
      await expect(page.locator('#code-panel')).toBeVisible();
      await expect(page.locator('#preview-panel')).toBeHidden();
      await expect(page.locator('.preview-actions')).toBeHidden();
      await expect(page.locator('[data-copy]')).toBeEnabled();
      await expect(code).toHaveAttribute('tabindex', '0');
      await expect(preview).toHaveAttribute('tabindex', '-1');
      await code.press('ArrowLeft');
      await expect(preview).toBeFocused();
      await expect(page.locator('#preview-panel')).toBeVisible();
      await preview.press('End');
      await expect(code).toBeFocused();
      await code.press('Home');
      await expect(preview).toBeFocused();
      await preview.press('ArrowLeft');
      await expect(code).toBeFocused();
      await code.press('ArrowRight');
      await expect(preview).toBeFocused();
      for (const selection of ['preview', 'code']) {
        await page.locator(`[data-view="${selection}"]`).click();
        await page.locator(`[data-view="${selection}"]`).focus();
        await page.evaluate(async () => {
          await document.fonts.ready;
          await Promise.all(document.getAnimations().map(animation => animation.finished.catch(() => {})));
        });
        const appearance = await page.locator('.workspace-segments').evaluate(node => {
          const tabs = [...node.querySelectorAll('button')];
          const boxes = tabs.map(tab => tab.getBoundingClientRect());
          return {
            widths: boxes.map(box => box.width), height: node.getBoundingClientRect().height,
            background: getComputedStyle(node).backgroundColor,
            tabs: tabs.map(tab => ({ selected: tab.getAttribute('aria-selected'), color: getComputedStyle(tab).color, background: getComputedStyle(tab).backgroundColor })),
            overflow: document.documentElement.scrollWidth > innerWidth,
          };
        });
        assert.equal(appearance.widths[0], appearance.widths[1]);
        assert.equal(appearance.height, 36);
        assert.equal(appearance.overflow, false);
        assert.notEqual(appearance.tabs[0].background, appearance.tabs[1].background);
        states.push({ width, height, theme, selection, ...appearance });
        await page.screenshot({ path: `artifacts/segmented-${width}-${theme}-${selection}.png` });
      }
    }
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByRole('tab', { name: '预览', exact: true }).click();
  await page.getByRole('tab', { name: '代码', exact: true }).click();
  assert.equal(await page.locator('.workspace-segments button').first().evaluate(node => getComputedStyle(node).transitionDuration), '0.001s');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await fs.writeFile('artifacts/navigation-segmented-checks.json', JSON.stringify({ visits, states, checks: ['physical thumbnail/title/edge clicks', 'keyboard activation', 'back/forward/reload', 'source-filtered destinations', 'iframe hit-test protection', 'mouse and directional segmented selection', 'desktop themes and overflow', 'reduced-motion emulation'] }, null, 2) + '\n');
}
