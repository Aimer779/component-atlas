import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import postcss from 'postcss';
import { getSystem } from '../ui/system-data.js';
import { createDesignMarkdown, documentPath } from '../ui/design-document.js';

const root = new URL('../', import.meta.url);
const css = postcss.parse(fs.readFileSync(new URL('styles.css', root), 'utf8'));
const tokens = { dark: {}, light: {} };
css.walkRules(rule => {
  const mode = rule.selector === ':root' ? 'dark' : rule.selector === ":root[data-theme='light']" ? 'light' : null;
  if (mode) rule.walkDecls(declaration => { tokens[mode][declaration.prop.slice(2)] = declaration.value; });
});
const check = process.argv.includes('--check');
for (const [id, theme] of [['atlas', 'dark'], ['atlas', 'light'], ['laper', 'light'], ['cromma', 'light']]) {
  const system = getSystem(id, { dataset: { theme } }, token => tokens[theme][token] || tokens.dark[token]);
  const filename = new URL(documentPath(system), root), markdown = createDesignMarkdown(system);
  if (check) assert.equal(fs.readFileSync(filename, 'utf8'), markdown, `${filename}: run node tools/build-design-documents.mjs`);
  else { fs.mkdirSync(path.dirname(fileURLToPath(filename)), { recursive: true }); fs.writeFileSync(filename, markdown, 'utf8'); }
}
console.log(`${check ? 'Verified' : 'Generated'} four complete Stitch-format DESIGN.md documents.`);
