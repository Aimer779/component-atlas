export function resourceReferences(source, file) {
  const decoded = source.replace(/&(?:amp|lt|gt|quot|#39);/g, entity => ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" }[entity]));
  const refs = [...decoded.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^\s)]*))\s*\)/g)].map(match => match[1] ?? match[2] ?? match[3]);
  if (file.endsWith('.html')) refs.push(...[...source.matchAll(/\b(?:src|href)="([^"#]+)"/g)].map(match => match[1]));
  return refs.filter(ref => !/^(data:|#)/.test(ref));
}
