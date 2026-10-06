import { expandedRect, VIEWER_EASE, VIEWER_DURATION, springStep, scrollTarget, reelDistance } from './motion-core.js';

const { reduced, thumbnail } = window.AtlasDemo;
const sample = document.querySelector('#sample');
const mode = document.body.dataset.demo;

function mountViewer() {
  const trigger = sample.querySelector('[data-viewer-open]');
  let active;
  const move = `width ${VIEWER_DURATION}ms ${VIEWER_EASE}, height ${VIEWER_DURATION}ms ${VIEWER_EASE}, left ${VIEWER_DURATION}ms ${VIEWER_EASE}, top ${VIEWER_DURATION}ms ${VIEWER_EASE}, border-radius ${VIEWER_DURATION}ms ${VIEWER_EASE}`;
  function place(panel, rect, animate) {
    panel.style.transition = animate && !reduced ? move : 'none';
    for (const key of ['width', 'height', 'left', 'top', 'borderRadius']) panel.style[key] = `${rect[key]}px`;
  }
  trigger.addEventListener('click', () => {
    if (active) return;
    const box = trigger.getBoundingClientRect();
    const source = { width: box.width, height: box.height, left: box.left, top: box.top, borderRadius: parseFloat(getComputedStyle(trigger).borderRadius) };
    const root = document.createElement('div');
    root.className = 'viewer-overlay fixed inset-0 z-[9999]';
    root.innerHTML = '<div class="viewer-scrim absolute inset-0"></div><div class="viewer-panel fixed overflow-hidden rounded-squircle-viewer bg-black" role="dialog" aria-modal="true" aria-label="共享元素预览"><img alt="Laper 编辑器样张"><button type="button" class="viewer-close absolute right-3 top-3 z-20" aria-label="关闭预览">×</button></div>';
    const panel = root.querySelector('.viewer-panel'), scrim = root.querySelector('.viewer-scrim');
    panel.querySelector('img').src = trigger.querySelector('img').src;
    document.body.append(root);
    let phase = 'entering', timer;
    const sourceNow = () => {
      const rect = trigger.getBoundingClientRect();
      return { ...source, width: rect.width, height: rect.height, left: rect.left, top: rect.top };
    };
    const close = () => {
      if (phase === 'leaving') return;
      phase = 'leaving'; root.dataset.phase = phase; clearTimeout(timer);
      scrim.style.opacity = '0'; panel.querySelector('button').disabled = true;
      place(panel, sourceNow(), true);
      timer = setTimeout(() => {
        document.removeEventListener('keydown', keyboard); window.removeEventListener('resize', resize);
        sample.inert = false; root.remove(); active = null; trigger.focus({ preventScroll: true });
      }, reduced ? 0 : VIEWER_DURATION);
    };
    const keyboard = event => {
      if (event.key === 'Escape') { event.preventDefault(); close(); }
      if (event.key === 'Tab') { event.preventDefault(); panel.querySelector('button').focus(); }
    };
    const resize = () => {
      if (phase !== 'leaving') place(panel, expandedRect(innerWidth, innerHeight), false);
    };
    scrim.addEventListener('click', close); panel.querySelector('button').addEventListener('click', close);
    document.addEventListener('keydown', keyboard); window.addEventListener('resize', resize);
    active = root; root.dataset.phase = phase;
    sample.inert = true; place(panel, source, false);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (phase === 'leaving') return;
      scrim.style.opacity = '1'; place(panel, expandedRect(innerWidth, innerHeight), true);
      panel.querySelector('button').focus({ preventScroll: true });
      timer = setTimeout(() => { phase = 'expanded'; root.dataset.phase = phase; }, reduced ? 0 : VIEWER_DURATION);
    }));
  });
}

function mountReel() {
  const row = sample.querySelector('[data-reel]'), button = sample.querySelector('[data-pause]');
  [...row.children].forEach((card, index) => {
    card.classList.add('laper-script-float'); card.style.animationDelay = `${index % 4 * .2 + 2.5}s`;
  });
  if (reduced) { button.disabled = true; button.textContent = '减少动态效果：静态剧本'; return; }
  let elapsed = 0, last = performance.now(), offset = 0, paused = false, raf = 0;
  let active = window.AtlasActivity.active, half = row.scrollWidth / 2;
  const observer = new ResizeObserver(() => { half = row.scrollWidth / 2; });
  observer.observe(row);
  function sync() {
    cancelAnimationFrame(raf); raf = 0;
    last = performance.now();
    row.style.setProperty('--play-state', paused || !active ? 'paused' : 'running');
    if (active && !paused) raf = requestAnimationFrame(step);
  }
  button.addEventListener('click', () => {
    paused = !paused; button.setAttribute('aria-pressed', String(paused)); button.textContent = paused ? '继续循环' : '暂停循环';
    sync();
  });
  const step = now => {
    raf = 0;
    if (!active || paused) return;
    const delta = Math.min(50, now - last); last = now;
    if (half > 0) {
      offset = (offset + reelDistance(elapsed, elapsed + delta)) % half;
      elapsed += delta; row.style.transform = `translate3d(${-offset}px, 0, 0)`;
    }
    raf = requestAnimationFrame(step);
  };
  const unsubscribe = window.AtlasActivity.subscribe(value => { active = value; sync(); });
  window.addEventListener('pagehide', () => { unsubscribe(); observer.disconnect(); cancelAnimationFrame(raf); }, { once: true });
}

function mountSpring() {
  const viewport = sample.querySelector('[data-spring-scroll]');
  const section = sample.querySelector('[data-spring-section]');
  const frame = sample.querySelector('[data-spring-frame]'), output = sample.querySelector('[data-scale]');
  if (thumbnail) viewport.scrollTop = section.offsetTop;
  if (reduced) { frame.style.transform = 'scale(1)'; output.textContent = '1.000'; return; }
  const state = { value: .96, velocity: 0 };
  let last = performance.now(), raf = 0, target = .96;
  let active = window.AtlasActivity.active;
  function paint() {
    frame.style.transform = `scale(${state.value})`;
    const text = state.value.toFixed(3);
    if (output.textContent !== text) output.textContent = text;
  }
  const tick = now => {
    raf = 0;
    if (!active) return;
    springStep(state, target, (now - last) / 1000);
    last = now;
    // Snap only below the visible precision; a settled spring no longer reads layout or schedules frames.
    if (Math.abs(state.value - target) < 1e-6 && Math.abs(state.velocity) < 1e-5) {
      state.value = target; state.velocity = 0; paint(); return;
    }
    paint();
    raf = requestAnimationFrame(tick);
  };
  function wake() {
    if (!active) return;
    const next = scrollTarget(viewport.clientHeight, section.getBoundingClientRect().top - viewport.getBoundingClientRect().top);
    if (next === null) return;
    target = next;
    if (!raf && (Math.abs(state.value - target) >= 1e-6 || Math.abs(state.velocity) >= 1e-5)) {
      last = performance.now(); raf = requestAnimationFrame(tick);
    }
  }
  viewport.addEventListener('scroll', wake, { passive: true });
  const observer = new ResizeObserver(wake);
  observer.observe(viewport); observer.observe(section);
  const unsubscribe = window.AtlasActivity.subscribe(value => {
    active = value;
    if (active) wake();
    else { cancelAnimationFrame(raf); raf = 0; }
  });
  window.addEventListener('pagehide', () => {
    unsubscribe(); observer.disconnect(); viewport.removeEventListener('scroll', wake); cancelAnimationFrame(raf);
  }, { once: true });
}

function mountToast() {
  const viewport = sample.querySelector('.laper-toast-viewport');
  let current, timer, closeTimer, field, closeCurrent, expiry = 0, remaining = 5000;
  function clear() {
    clearTimeout(timer); clearTimeout(closeTimer); field?.destroy(); field = null;
    current?.remove(); current = null; closeCurrent = null; timer = 0;
  }
  function syncTimer(active) {
    if (thumbnail || !closeCurrent) return;
    if (!active) {
      if (timer) remaining = Math.max(0, expiry - performance.now());
      clearTimeout(timer); timer = 0;
    } else if (!timer) {
      expiry = performance.now() + remaining;
      timer = setTimeout(closeCurrent, remaining);
    }
  }
  function show() {
    clear(); current = sample.querySelector('#toast-template').content.firstElementChild.cloneNode(true);
    const toast = current;
    toast.dataset.starting = ''; toast.style.setProperty('--toast-index', '0'); toast.style.setProperty('--toast-offset-y', '0px');
    toast.style.boxShadow = 'inset 0 0 0 .5px var(--tag-hairline), inset 0 .5px 0 0 var(--tag-edge-top), inset 0 -.5px 0 0 var(--tag-edge-bottom), inset 0 2px 0 -1px var(--tag-highlight-top), inset 0 -2px 0 -1px var(--tag-highlight-bottom), var(--tag-drop), 0 12px 32px -8px rgba(0,0,0,.14)';
    viewport.append(toast);
    field = window.CrommaField.mount(toast.querySelector('[data-toast-field]'), { kind: 'newton', tint: 'var(--info)', activity: window.AtlasActivity });
    requestAnimationFrame(() => requestAnimationFrame(() => { if (current === toast) toast.removeAttribute('data-starting'); }));
    let closing = false;
    const close = () => {
      if (closing || current !== toast) return;
      closing = true; clearTimeout(timer); timer = 0; closeCurrent = null; toast.dataset.ending = '';
      closeTimer = setTimeout(clear, reduced ? 0 : 500);
    };
    toast.querySelector('[data-close]').addEventListener('click', close);
    closeCurrent = close; remaining = 5000;
    if (thumbnail) toast.querySelector('circle[stroke-dasharray]').style.animationPlayState = 'paused';
    else syncTimer(window.AtlasActivity.active);
  }
  if (reduced) viewport.dataset.reducedMotion = '';
  sample.querySelector('[data-toast-open]').addEventListener('click', show);
  if (thumbnail) show();
  const unsubscribe = window.AtlasActivity.subscribe(syncTimer);
  window.addEventListener('pagehide', () => { unsubscribe(); clear(); }, { once: true });
}

({ viewer: mountViewer, reel: mountReel, spring: mountSpring, toast: mountToast })[mode]?.();
document.body.dataset.ready = 'true';
