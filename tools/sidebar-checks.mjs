import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { expect } from '@playwright/test';
import { groups, components } from '../data.js';

export async function checkSidebar(page, url) {
  const evidence = [];
  const category = name => page.getByRole('button', { name, exact: true });
  await page.goto(`${url}/#/catalog`);
  await expect(page.locator('.category-segments button')).toHaveCount(5);
  assert.equal(await page.locator('.category-tabs').count(), 0, 'Removed duplicate category toolbar');
  for (const group of groups) {
    await category(group.name).click();
    await expect(page).toHaveURL(`${url}/#/catalog?category=${group.id}`);
    await expect(page.locator('h1')).toHaveText(group.name);
    await expect(page.locator('.component-card')).toHaveCount(components.filter(item => item.group === group.id).length);
    await expect(page.locator('.nav-group')).toHaveCount(1);
    await expect(page.locator('.nav-group h2')).toHaveText(group.name);
    await expect(category(group.name)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.category-segments [tabindex="0"]')).toHaveCount(1);
    evidence.push({ category: group.id, cards: await page.locator('.component-card').count() });
  }
  await category('全部').click();
  await expect(page.locator('.nav-item-link')).toHaveCount(15);
  await expect(page.locator('.component-card')).toHaveCount(15);
  for (const item of components) {
    const link = page.locator(`.nav-item-link[href="#/component/${item.id}/${item.variants[0].id}"]`);
    await expect(link.locator('.nav-count')).toHaveText(String(item.variants.length));
    await expect(link.locator('.nav-count')).toHaveAttribute('aria-hidden', 'true');
    await expect(link).toHaveAccessibleName(`${item.name}，${item.variants.length} 个变体`);
  }
  assert.equal(await page.locator('.nav-count').evaluateAll(nodes => nodes.reduce((total, node) => total + Number(node.textContent), 0)), 23);

  await page.getByRole('combobox', { name: '按实验来源查看' }).click();
  await page.getByRole('option', { name: 'Laper', exact: true }).click();
  await category('背景效果').click();
  await expect(page).toHaveURL(`${url}/#/catalog?category=backgrounds&project=Laper`);
  await expect(page.locator('.empty-state')).toBeVisible();
  await expect(page.locator('.nav-item-link')).toHaveCount(3);
  await page.reload();
  await expect(category('背景效果')).toHaveAttribute('aria-pressed', 'true');
  await category('背景效果').press('Home');
  await expect(category('全部')).toBeFocused();
  await expect(page).toHaveURL(`${url}/#/catalog?project=Laper`);
  await category('全部').press('ArrowLeft');
  await expect(category('文字与动效')).toBeFocused();
  await category('文字与动效').press('ArrowRight');
  await expect(category('全部')).toBeFocused();
  await category('全部').press('End');
  await expect(category('文字与动效')).toBeFocused();
  await page.goBack();
  await expect(category('全部')).toHaveAttribute('aria-pressed', 'true');
  await page.goForward();
  await expect(category('文字与动效')).toHaveAttribute('aria-pressed', 'true');

  await page.goto(`${url}/#/component/buttons/button-cromma-tag`);
  await expect(category('基础交互')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.workspace-segments svg[aria-hidden="true"]')).toHaveCount(2);
  await expect(page.getByRole('tab', { name: '预览', exact: true })).toBeVisible();
  await expect(page.getByRole('tab', { name: '代码', exact: true })).toBeVisible();
  await page.locator('[data-expand="buttons"]').click();
  await expect(page.locator('[data-expand="buttons"]')).toHaveAttribute('aria-expanded', 'false');
  await category('内容展示').click();
  await expect(page.locator('.component-card')).toHaveCount(1);
  await category('基础交互').click();
  await expect(page.locator('[data-expand="buttons"]')).toHaveAttribute('aria-expanded', 'false');
  await page.locator('[data-expand="buttons"]').click();
  await expect(page.locator('#variants-buttons')).not.toHaveAttribute('inert');
  await page.locator('#variants-buttons a').last().click();
  await expect(page).toHaveURL(`${url}/#/component/buttons/button-laper-outline`);
  await expect(page.locator('.variant-tabs [aria-current="page"]')).toHaveAttribute('href', '#/component/buttons/button-laper-outline');
  await expect(page.locator('[data-expand="buttons"]')).toHaveAttribute('aria-expanded', 'true');
  await page.locator('[data-expand="buttons"]').press('Shift+Tab');
  await expect(page.locator('.nav-item-link').first()).toBeFocused();
  assert.equal(await page.locator('.nav-item-link').first().evaluate(node => getComputedStyle(node).outlineOffset), '-2px', 'Link focus stays inside the scrolling directory');
  await page.waitForFunction(() => document.querySelector('#demo-frame')?.contentDocument?.body?.dataset.ready === 'true');
  await page.screenshot({ path: 'artifacts/sidebar-detail-icons.png' });

  for (const [width, height] of [[1600, 900], [1280, 720], [1181, 600], [1180, 600], [1024, 600]]) {
    await page.setViewportSize({ width, height });
    await category('全部').click();
    for (const theme of ['light', 'dark']) {
      await page.evaluate(value => document.documentElement.dataset.theme = value, theme);
      await category('基础交互').hover();
      await category('全部').press('Home');
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(document.getAnimations().filter(animation => Number.isFinite(animation.effect.getComputedTiming().endTime)).map(animation => animation.finished.catch(() => {})));
      });
      const before = await page.locator('.category-segments').boundingBox();
      await page.locator('.sidebar-list').evaluate(node => node.scrollTop = node.scrollHeight);
      const after = await page.locator('.category-segments').boundingBox();
      assert.deepEqual(after, before, 'Category header must remain fixed during directory scroll');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      const appearance = await page.locator('.category-segments').evaluate(node => ({
        rect: { width: node.getBoundingClientRect().width, height: node.getBoundingClientRect().height },
        padding: getComputedStyle(node).padding, gap: getComputedStyle(node).gap,
        buttons: [...node.querySelectorAll('button')].map(button => ({
          name: button.getAttribute('aria-label'), selected: button.getAttribute('aria-pressed'),
          width: button.getBoundingClientRect().width, height: button.getBoundingClientRect().height,
          color: getComputedStyle(button).color, background: getComputedStyle(button).backgroundColor,
          outline: getComputedStyle(button).outline,
          iconSize: button.querySelector('svg').getBoundingClientRect().width,
        })),
      }));
      assert.equal(appearance.buttons.every(button => button.height === 32 && button.iconSize === 18), true);
      assert.ok(Math.max(...appearance.buttons.map(button => button.width)) - Math.min(...appearance.buttons.map(button => button.width)) < .1);
      assert.ok(appearance.buttons[0].outline.startsWith('rgb'));
      evidence.push({ width, height, theme, ...appearance });
      await page.locator('.sidebar-list').evaluate(node => node.scrollTop = 0);
      const rows = await page.locator('.nav-item-row').evaluateAll(nodes => nodes.map(node => {
        const label = node.querySelector('.nav-label').getBoundingClientRect();
        const badge = node.querySelector('.nav-count').getBoundingClientRect();
        const arrow = node.querySelector('.nav-expand').getBoundingClientRect();
        const style = getComputedStyle(node.querySelector('.nav-count'));
        return { labelRight: label.right, badgeLeft: badge.left, badgeRight: badge.right, arrowLeft: arrow.left, badgeHeight: badge.height, fontSize: style.fontSize, borderRadius: style.borderRadius };
      }));
      assert.ok(rows.every(row => row.labelRight <= row.badgeLeft && row.badgeRight <= row.arrowLeft && row.badgeHeight === 20 && row.fontSize === '12px'), JSON.stringify(rows));
      const heading = await page.locator('.nav-group h2').first().evaluate(node => ({ weight: getComputedStyle(node).fontWeight, tracking: getComputedStyle(node).letterSpacing, size: getComputedStyle(node).fontSize }));
      assert.equal(heading.weight, '650');
      assert.ok(parseFloat(heading.tracking) > 0);
      assert.equal(heading.size, '12px');
      evidence.push({ width, theme, countBadges: rows, groupHeading: heading });
      await page.screenshot({ path: `artifacts/sidebar-${width}-${theme}.png` });
    }
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await category('背景效果').press('End');
  await expect(category('文字与动效')).toBeFocused();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await fs.writeFile('artifacts/sidebar-filter-checks.json', JSON.stringify({ evidence, checks: ['five categories filter catalog and directory', 'source filter preservation and empty state', 'refresh/back/forward', 'roving focus and directional selection', 'detail category and decorative icons', 'variant expansion retention and navigation', 'fixed filter header during scroll', 'desktop widths and both themes', 'reduced-motion emulation'] }, null, 2) + '\n');
}
