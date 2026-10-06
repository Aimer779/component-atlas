import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 5190);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.md': 'text/plain; charset=utf-8', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
const server = http.createServer((request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
  catch { response.writeHead(400).end('Invalid URL'); return; }
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  const relative = path.relative(root, file);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    response.writeHead(403).end('Forbidden'); return;
  }
  fs.readFile(file, (error, data) => {
    if (error) { response.writeHead(404).end('Not found'); return; }
    // Revalidate stored responses. A content hash also detects same-size edits without stale previews.
    const etag = '"' + createHash('sha256').update(data).digest('base64url') + '"';
    const headers = { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache', ETag: etag };
    const matches = request.headers['if-none-match']?.split(',').some(value => value.trim().replace(/^W\//, '') === etag || value.trim() === '*');
    if (matches && ['GET', 'HEAD'].includes(request.method)) { response.writeHead(304, headers).end(); return; }
    response.writeHead(200, { ...headers, 'Content-Length': data.length });
    response.end(request.method === 'HEAD' ? undefined : data);
  });
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`Component Atlas: http://127.0.0.1:${port}/`));
