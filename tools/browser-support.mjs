import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));
export async function startServer(port) {
  const child = spawn(process.execPath, ['serve.mjs'], { cwd: root, env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] });
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Local server startup timed out')), 5000);
    child.once('error', reject);
    child.once('exit', code => { clearTimeout(timer); reject(new Error(`Local server exited: ${code}`)); });
    child.stderr.on('data', data => { clearTimeout(timer); reject(new Error(String(data))); });
    child.stdout.on('data', data => { if (String(data).includes('Component Atlas:')) { clearTimeout(timer); resolve(); } });
  }).catch(error => { child.kill(); throw error; });
  return { url: `http://127.0.0.1:${port}`, close: () => child.kill() };
}

// Instrument only the test context. A pending RAF proves that an animation still schedules work.
export function trackAnimationWork() {
  const pending = new Set();
  const metrics = window.__atlasMetrics = { callbacks: 0, draws: 0, pending };
  const request = window.requestAnimationFrame.bind(window), cancel = window.cancelAnimationFrame.bind(window);
  window.requestAnimationFrame = callback => {
    const id = request(time => { pending.delete(id); metrics.callbacks++; callback(time); });
    pending.add(id); return id;
  };
  window.cancelAnimationFrame = id => { pending.delete(id); cancel(id); };
  for (const name of ['WebGLRenderingContext', 'WebGL2RenderingContext']) {
    const proto = window[name]?.prototype;
    if (!proto) continue;
    const draw = proto.drawArrays;
    proto.drawArrays = function (...args) { metrics.draws++; return draw.apply(this, args); };
  }
}

export async function frameWork(page) {
  return Promise.all(page.frames().map(async frame => {
    try {
      return await frame.evaluate(() => ({ url: location.href, active: document.body?.dataset.active, ready: document.body?.dataset.ready, callbacks: window.__atlasMetrics.callbacks, draws: window.__atlasMetrics.draws, pending: window.__atlasMetrics.pending.size }));
    } catch { return { url: frame.url(), detached: true }; }
  }));
}
