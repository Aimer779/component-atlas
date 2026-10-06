import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const directory = path.join(root, 'assets/fonts');
const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.json'), 'utf8'));
for (const face of manifest.faces) {
  const bytes = fs.readFileSync(path.join(directory, face.file));
  assert.equal(bytes.subarray(0, 4).toString(), 'wOF2');
  assert.equal(createHash('sha256').update(bytes).digest('hex'), face.sha256, `${face.file}: changed font bytes`);
}
const paths = ['app.js', 'data.js', 'index.html', 'snapshots/lang-flags.js'];
for (const folder of ['ui', 'demos', 'engines']) {
  for (const name of fs.readdirSync(path.join(root, folder)).filter(name => /\.(js|html)$/.test(name))) paths.push(`${folder}/${name}`);
}
const text = paths.map(file => fs.readFileSync(path.join(root, file), 'utf8')).join('');
const cjk = new Set(manifest.faces.find(face => face.family === 'Atlas CJK').codepoints);
const missing = [...new Set([...text].filter(char => /[\u3000-\u303f\u3400-\u9fff\uff00-\uffef]/u.test(char) && !cjk.has(char.codePointAt(0))))];
assert.deepEqual(missing, [], 'New CJK text requires regenerating the local font subset');
for (const file of ['Inter-OFL.txt', 'NotoSansSC-OFL.txt', 'JetBrainsMono-OFL.txt']) {
  assert.ok(fs.readFileSync(path.join(directory, file), 'utf8').includes('SIL OPEN FONT LICENSE Version 1.1'));
}
assert.ok(manifest.faces.reduce((total, face) => total + face.bytes, 0) < 300_000, 'Shell fonts exceed the recorded 300KB budget');
console.log(`PASS: 3 local OFL fonts, CJK corpus coverage, hashes and font size budget (${manifest.faces.reduce((sum, face) => sum + face.bytes, 0)} bytes).`);
