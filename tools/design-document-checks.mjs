import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { expect } from '@playwright/test';
import { colorHex } from '../ui/system-colors.js';
// Windows clipboard uses CRLF; the textarea and committed Markdown use LF.
const normalized = value => value.replaceAll('\r\n', '\n');

export async function checkDesignDocuments(browser, url) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, permissions: ['clipboard-read', 'clipboard-write'], reducedMotion: 'reduce' });
  const page = await context.newPage(), errors = [], documents = [];
  context.on('page', page => page.on('pageerror', error => errors.push(String(error))));
  try {
    for (const [id, theme] of [['atlas', 'dark'], ['atlas', 'light'], ['laper', 'light'], ['cromma', 'light']]) {
      await page.goto(`${url}/#/system?system=${id}`);
      await page.evaluate(theme => { document.documentElement.dataset.theme = theme; document.dispatchEvent(new Event('atlas-theme-change')); }, theme);
      const copy = page.locator('[data-document-copy]');
      await expect(copy).toBeEnabled();
      assert.ok(await copy.locator('[data-copy-label]').evaluate(node => node.getBoundingClientRect().height <= 24), 'Document copy label wraps to multiple lines');
      assert.ok(await copy.locator('[data-copy-label]').evaluate(node => node.scrollWidth <= node.clientWidth), 'Document copy label overflows its reserved width');
      assert.ok(await copy.evaluate(node => node.getBoundingClientRect().width >= 176), 'Shared copy styles override the document control width');
      await copy.click();
      await expect(copy.locator('[data-copy-label]')).toHaveText('已复制');
      const actual = normalized(await page.evaluate(() => navigator.clipboard.readText()));
      assert.ok(actual === await page.getByRole('textbox', { name: '完整 DESIGN.md 文档' }).inputValue(), 'Clipboard differs from complete document preview');
      const href = await page.locator('[data-document-link]').getAttribute('href');
      const response = await page.request.get(new URL(href, url + '/').href);
      assert.ok(response.ok(), href);
      assert.ok(actual === normalized(await response.text()), 'Clipboard differs from complete generated document file');
      assert.equal((actual.match(/^## \d\./gm) || []).length, 6);
      assert.ok(actual.includes('colors:\n') && actual.includes('typography:\n'));
      assert.ok(actual.length > 4000);
      const hexes = await page.locator('[data-system-palette] .token-item').evaluateAll(nodes => nodes.map(node => {
        const value = node.querySelector('[data-token-value]').textContent;
        const c = document.createElement('canvas'), p = c.getContext('2d');
        p.fillStyle = value; p.fillRect(0, 0, 1, 1);
        return { value, channels: [...p.getImageData(0, 0, 1, 1).data].slice(0, 3) };
      }));
      const metadata = actual.split('colors:\n')[1].split('typography:\n')[0];
      hexes.forEach(({ value, channels }) => {
        const hex = colorHex(value);
        assert.ok(metadata.includes(hex), 'A displayed palette value is absent from YAML colors');
        channels.forEach((value, channel) => assert.ok(Math.abs(value - parseInt(hex.slice(1 + channel * 2, 3 + channel * 2), 16)) <= 1, 'sRGB export differs from browser color rendering'));
      });
      documents.push({ id, theme, href, characters: actual.length, sections: 6, clipboardMatchesPreviewAndFile: true });
    }
    await page.goto(`${url}/#/system?system=atlas`);
    await page.locator('[data-document-copy]').click();
    await page.locator('[data-theme-toggle]').click();
    await expect(page.locator('[data-document-copy] [data-copy-label]')).toHaveText('复制 DESIGN.md');
    await page.locator('[data-document-copy]').click();
    assert.ok(normalized(await page.evaluate(() => navigator.clipboard.readText())) === await page.locator('.design-document-text').inputValue(), 'Theme update left stale document content');
    assert.deepEqual(errors, []);
    await fs.writeFile('artifacts/design-document-checks.json', JSON.stringify({ documents, pageErrors: errors, boundary: 'Real Chromium clipboard; complete local documents verified, no Stitch upload or import performed.' }, null, 2) + '\n');
  } finally { await context.close(); }

  const failure = await browser.newContext({ reducedMotion: 'reduce' });
  try {
    await failure.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('Denied clipboard')) } }));
    const page = await failure.newPage();
    await page.goto(`${url}/#/system?system=cromma`);
    await page.locator('[data-document-copy]').click();
    await expect(page.locator('.notification')).toContainText('复制失败');
    await expect(page.locator('[data-document-copy]')).toBeEnabled();
    await expect(page.locator('[data-document-copy] [data-copy-label]')).toHaveText('复制 DESIGN.md');
    await expect(page.locator('.design-document-text')).not.toHaveValue('');
  } finally { await failure.close(); }
}
