import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import postcss from 'postcss';
import { getSystem } from '../ui/system-data.js';
import { colorHex, contrastRatio } from '../ui/system-colors.js';
import { createDesignMarkdown, documentPath } from '../ui/design-document.js';

const values = { dark: {}, light: {} };
postcss.parse(fs.readFileSync(new URL('../styles.css', import.meta.url), 'utf8')).walkRules(rule => {
  const theme = rule.selector === ':root' ? 'dark' : rule.selector === ":root[data-theme='light']" ? 'light' : null;
  if (theme) rule.walkDecls(d => { values[theme][d.prop.slice(2)] = d.value; });
});
const system = (id, theme) => getSystem(id, { dataset: { theme } }, key => values[theme][key] || values.dark[key]);

test('each exported document has its own identity, valid core color scalars and all six complete sections', () => {
  for (const [id, theme] of [['atlas', 'dark'], ['atlas', 'light'], ['laper', 'light'], ['cromma', 'light']]) {
    const definition = system(id, theme), markdown = createDesignMarkdown(definition);
    assert.equal(fs.readFileSync(new URL('../' + documentPath(definition), import.meta.url), 'utf8'), markdown);
    assert.ok(markdown.startsWith(`---\nname: '${definition.name}'\n`));
    const metadata = markdown.split('---\n')[1];
    assert.match(metadata, /colors:\n(?:  [\w-]+: '#[\da-f]{6}'\n)+typography:/);
    assert.match(metadata, /  primary: '#[\da-f]{6}'/);
    assert.match(metadata, /  surface: '#[\da-f]{6}'/);
    assert.match(metadata, /  on-surface: '#[\da-f]{6}'/);
    assert.deepEqual([...markdown.matchAll(/^## (\d)\./gm)].map(match => match[1]), ['1', '2', '3', '4', '5', '6']);
    assert.doesNotMatch(markdown, /\*\*Project ID:\*\*|\[Project Name\]|undefined|NaN/);
    assert.ok(markdown.length > 4000);
    for (const row of definition.colors) assert.ok(markdown.includes(row[3]) && markdown.includes(row[5]));
    for (const [name, rule] of definition.componentRules) assert.ok(markdown.includes(name) && markdown.includes(rule));
    for (const prompt of definition.prompts) assert.ok(markdown.includes(prompt));
  }
});

test('theme exports change their actual color roles and do not claim unmeasured source layouts', () => {
  const dark = createDesignMarkdown(system('atlas', 'dark')), light = createDesignMarkdown(system('atlas', 'light'));
  assert.notEqual(dark, light);
  assert.match(dark, /surface: '#111214'/); assert.match(light, /surface: '#fafbfa'/);
  for (const id of ['laper', 'cromma']) {
    const markdown = createDesignMarkdown(system(id, 'light'));
    assert.ok(markdown.includes('原站页面网格、最大宽度与移动断点未采集'));
    assert.ok(markdown.includes('禁用态，不推断透明度'));
  }
});

test('color conversion preserves neutral endpoints and contrast is symmetric', () => {
  assert.equal(colorHex('oklch(0% 0 0)'), '#000000');
  assert.equal(colorHex('oklch(100% 0 0)'), '#ffffff');
  assert.equal(colorHex('#fff'), '#ffffff');
  assert.equal(contrastRatio('#000000', '#ffffff'), 21);
  assert.equal(contrastRatio('#171a19', '#fcfdfc'), contrastRatio('#fcfdfc', '#171a19'));
  assert.throws(() => colorHex('undefined'), /Unsupported/);
});
