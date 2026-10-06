import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import postcss from 'postcss';
import selectorParser from 'postcss-selector-parser';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

export function pruneStyles(css, source) {
  const tree = postcss.parse(css);
  tree.walkRules(rule => {
    if (rule.parent.type === 'atrule' && /keyframes$/i.test(rule.parent.name)) return;
    const selectors = selectorParser().astSync(rule.selector);
    const kept = selectors.nodes.filter(selector => {
      // Only mandatory classes outside pseudo arguments can prove a selector unreachable.
      // Keep :is/:where/:not branches intact, including states created after clicking.
      return selector.nodes.filter(node => node.type === 'class').every(node => source.includes(node.value));
    });
    if (!kept.length) rule.remove();
    else rule.selector = kept.map(selector => selector.toString()).join(',');
  });
  tree.walkAtRules(rule => { if (rule.nodes?.length === 0) rule.remove(); });
  // Runtime styles live one directory above their original asset directory.
  tree.walkDecls(decl => {
    decl.value = decl.value.replace(/url\((['"]?)(assets\/[^)'"\s]+)\1\)/g, 'url($1../snapshots/$2$1)');
  });
  return tree.toString();
}

export function buildStyles(check = false) {
  const demos = fs.readdirSync(path.join(root, 'demos')).filter(file => file.endsWith('.html')).map(file => read(`demos/${file}`));
  const code = ['demos/demo.js', 'demos/motion.js', 'snapshots/lang-flags.js'].map(read);
  // Decode HTML attributes before comparing the parser's unescaped class names.
  const source = [...demos, ...code].join('\n').replace(/&(?:amp|lt|gt|quot|#39);/g, entity => ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" }[entity]));
  const results = [];
  if (!check) fs.mkdirSync(path.join(root, 'runtime'), { recursive: true });
  for (const theme of ['laper', 'cromma']) {
    const original = read(`snapshots/${theme}.css`);
    const optimized = pruneStyles(original, source);
    const file = `runtime/${theme}.css`;
    if (check) assert.equal(read(file), optimized, `Stale generated CSS: ${file}; run pnpm build:styles`);
    else fs.writeFileSync(path.join(root, file), optimized, 'utf8');
    results.push({ theme, originalBytes: Buffer.byteLength(original), runtimeBytes: Buffer.byteLength(optimized) });
  }
  console.log(`${check ? 'Verified' : 'Generated'} runtime CSS: ${JSON.stringify(results)}`);
  return results;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) buildStyles(process.argv.includes('--check'));
