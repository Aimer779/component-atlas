import fs from 'node:fs/promises';
import { chromium } from '@playwright/test';
import { startServer, trackAnimationWork, frameWork } from './browser-support.mjs';

const label = process.argv[2];
if (!['before', 'after'].includes(label)) throw new Error('Use before or after');
if (label === 'before') {
  await fs.access('artifacts/performance-before.json').then(() => {
    throw new Error('The original baseline already exists; do not overwrite it with the optimized version.');
  }, error => { if (error.code !== 'ENOENT') throw error; });
}
const server = await startServer(18190);
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 });
  await context.addInitScript(trackAnimationWork);
  const external = [];
  // Request interception disables Chromium's HTTP cache. Use it only for the uncached baseline.
  if (label === 'before') await context.route(/^https?:\/\//, route => {
    if (route.request().url().startsWith(server.url + '/')) return route.continue();
    external.push(route.request().url()); return route.abort();
  });
  const page = await context.newPage();
  let requests = 0, bodyBytes = 0, networkBytes = 0;
  const protocol = await context.newCDPSession(page);
  await protocol.send('Network.enable');
  protocol.on('Network.loadingFinished', event => { networkBytes += event.encodedDataLength; });
  const responses = [];
  page.on('request', request => { if (request.url().startsWith(server.url)) requests++; });
  page.on('response', response => responses.push(response.body().then(body => { bodyBytes += body.length; }).catch(() => {})));
  await page.goto(server.url, { waitUntil: 'networkidle' });
  await Promise.all(responses);
  const cold = { requests, decodedResponseBytes: bodyBytes, encodedNetworkBytes: networkBytes, loadedDemos: page.frames().filter(f => f.url().includes('/demos/')).length };
  await page.screenshot({ path: `artifacts/performance-${label}.png` });
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(400);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(250);
  const first = await frameWork(page);
  await page.waitForTimeout(500);
  const second = await frameWork(page);
  const idle = second.map(item => {
    const old = first.find(entry => entry.url === item.url);
    return { ...item, callbacksIn500ms: old ? item.callbacks - old.callbacks : null, drawsIn500ms: old ? item.draws - old.draws : null };
  });
  requests = 0; bodyBytes = 0; networkBytes = 0; responses.length = 0;
  await page.reload({ waitUntil: 'networkidle' });
  await Promise.all(responses);
  const warm = { requests, decodedResponseBytes: bodyBytes, encodedNetworkBytes: networkBytes };
  await page.goto(`${server.url}/#/component/scroll-spring/spring-laper`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(700);
  const spring = (await frameWork(page)).find(item => item.url.includes('/demos/spring-laper'));
  const report = { label, viewport: [1280, 720], dpr: 1.5, browser: browser.version(), cold, warm, idle, spring, externalAttempts: [...new Set(external)], boundary: 'Headless Chromium workload measurement; not laptop GPU power or user-perceived load-time measurement.' };
  await fs.writeFile(`artifacts/performance-${label}.json`, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} finally { await browser.close(); server.close(); }
