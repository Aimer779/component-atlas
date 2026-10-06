import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { components, groups, projects, countVariants } from '../data.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const files = fs.readdirSync(root, { recursive: true }).filter(file => !file.startsWith('.git' + path.sep) && !file.includes('__pycache__') && fs.statSync(path.join(root, file)).isFile());
const variants = components.flatMap(component => component.variants);
const records = JSON.parse(read('provenance.json'));
assert.equal(new Set(components.map(component => component.id)).size, components.length, 'Duplicate component route');
assert.equal(new Set(variants.map(variant => variant.id)).size, variants.length, 'Duplicate variant route');
assert.equal(countVariants(components), 23, 'Current inventory contract');
assert.equal(components.length, 15, 'Current inventory contract');
assert.equal(files.filter(file => /^demos[/\\].*\.html$/.test(file)).length, variants.length, 'Orphan or missing demo');

for (const component of components) {
  assert.ok(groups.some(group => group.id === component.group), `Unclassified component: ${component.id}`);
  for (const key of ['name', 'english', 'description', 'use', 'caution', 'mechanism', 'parameters']) assert.ok(component[key]?.length, `${component.id}: missing ${key}`);
  for (const variant of component.variants) {
    assert.ok(projects.includes(variant.project));
    const provenance = records.filter(record => record.variant === variant.id);
    assert.equal(provenance.length, 1, `Missing or duplicate provenance: ${variant.id}`);
    assert.equal(provenance[0].theme, variant.project.toLowerCase(), 'Theme/source mismatch');
    const html = read(`demos/${variant.id}.html`);
    assert.ok(html.includes(`data-variant="${variant.id}"`), 'Demo identity mismatch');
    assert.ok(html.includes('id="sample"'), 'Missing sample root');
    assert.ok(!/href="https?:/.test(html), 'Sample control navigates externally');
    assert.ok(!/\b(src|href)="https?:/.test(html), 'Remote demo resource');
  }
}

let references = 0;
for (const file of files.filter(file => /\.(html|css)$/.test(file))) {
  const source = read(file);
  const refs = file.endsWith('.html') ? [...source.matchAll(/\b(?:src|href)="([^"#]+)"/g)].map(match => match[1]) : [...source.matchAll(/url\(\s*["']?([^\s"')]+)["']?\s*\)/g)].map(match => match[1]);
  for (const ref of refs) {
    if (/^(https?:|data:|#)/.test(ref)) continue;
    const target = path.resolve(path.dirname(path.join(root, file)), ref.split(/[?#]/)[0]);
    const relative = path.relative(root, target);
    assert.ok(!relative.startsWith('..') && !path.isAbsolute(relative), `Resource escapes project: ${file} → ${ref}`);
    assert.ok(fs.existsSync(target), `Missing resource: ${file} → ${ref}`);
    references++;
  }
}
for (const record of records.filter(entry => entry.snapshot)) {
  const bytes = fs.readFileSync(path.join(root, record.snapshot));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), record.sha256, `Snapshot drift: ${record.snapshot}`);
}
const bitsSource = JSON.parse(read('vendor/react-bits/source.json'));
for (const record of bitsSource.files) {
  const bytes = fs.readFileSync(path.join(root, 'vendor/react-bits', record.file));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), record.sha256, `React Bits source drift: ${record.file}`);
}
const font = fs.readFileSync(path.join(root, 'snapshots/assets/montserrat-Dk9Pm7OY.woff2'));
assert.equal(font.subarray(0, 4).toString(), 'wOF2', 'Invalid local font');
const scripts = files.filter(file => /\.(m?js)$/.test(file));
for (const script of scripts) execFileSync(process.execPath, ['--check', path.join(root, script)], { stdio: 'pipe', encoding: 'utf8' });
assert.ok(read('styles.css').includes('[hidden] { display: none !important; }'));
assert.ok(read('demos/demo.css').includes('[hidden] { display: none !important; }'));
assert.doesNotMatch(read('index.html'), /nav-toggle|sidebar-scrim/, 'Desktop-only shell must not restore the mobile drawer');
assert.doesNotMatch(read('app.js'), /data-width|窄屏查看/, 'Desktop-only preview must not restore narrow-screen controls');
execFileSync(process.execPath, ['--test', path.join(root, 'tools/regression.test.mjs'), path.join(root, 'tools/widgets.test.mjs')], { stdio: 'inherit' });
console.log(`PASS: ${components.length} components, ${variants.length} variants, ${scripts.length} scripts, ${references} local references, ${records.filter(record => record.snapshot).length} snapshot hashes, ${bitsSource.files.length} React Bits source hashes, WOFF2 header.`);
console.log('Scope: source, inventory, provenance, local assets and regressions. Browser behavior and visual review are recorded separately in NOTES.md.');
