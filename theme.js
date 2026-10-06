/* Runs before the stylesheet to restore the chosen theme without a light flash. */
(() => {
  const root = document.documentElement;
  const key = 'component-atlas-theme';
  let saved;
  try { saved = localStorage.getItem(key); } catch { /* Private contexts can block storage. */ }
  root.dataset.theme = saved === 'light' ? 'light' : 'dark';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let desired = root.dataset.theme, revision = 0, active, animation;

  function sync() {
    const button = document.querySelector('[data-theme-toggle]');
    if (!button) return;
    const dark = root.dataset.theme === 'dark';
    button.setAttribute('aria-pressed', String(dark));
    button.title = dark ? '切换到浅色模式' : '切换到暗黑模式';
  }
  function apply(theme, persist = true) {
    root.dataset.theme = theme;
    if (persist) { try { localStorage.setItem(key, theme); } catch { /* Switching still works in memory. */ } }
    sync();
    document.dispatchEvent(new Event('atlas-theme-change'));
  }
  function cancel() {
    revision += 1;
    animation?.cancel();
    animation = undefined;
    // Keep the transition occupied until the browser releases its snapshots.
    active?.skipTransition();
    delete root.dataset.themeTransition;
  }
  function settle() { cancel(); apply(desired); }
  function toggle(button) {
    // Track intent separately from the asynchronous snapshot update callback.
    desired = desired === 'dark' ? 'light' : 'dark';
    const interrupted = Boolean(active);
    cancel();
    if (interrupted || desired === root.dataset.theme || reduced.matches || document.hidden || !document.startViewTransition || !root.animate) {
      apply(desired); return;
    }
    const version = revision, theme = desired;
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    root.dataset.themeTransition = 'active';
    let transition;
    try {
      transition = document.startViewTransition(() => { if (version === revision) apply(theme); });
    } catch { delete root.dataset.themeTransition; apply(desired); return; }
    active = transition;
    transition.ready.then(() => {
      if (version !== revision || active !== transition) return;
      animation = root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] }, {
        duration: 520, easing: 'cubic-bezier(.4,0,.2,1)', pseudoElement: '::view-transition-new(root)',
      });
    }).catch(() => { if (version === revision) settle(); });
    transition.finished.then(() => {
      if (active === transition) { active = animation = undefined; delete root.dataset.themeTransition; }
    }, () => {
      if (active === transition) { active = animation = undefined; delete root.dataset.themeTransition; }
      if (version === revision) apply(desired);
    });
  }
  document.addEventListener('DOMContentLoaded', () => {
    sync();
    const button = document.querySelector('[data-theme-toggle]');
    button.addEventListener('click', () => toggle(button));
  });
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    cancel();
    desired = event.newValue === 'light' ? 'light' : 'dark';
    apply(desired, false);
  });
  window.addEventListener('resize', () => { if (active) settle(); });
  window.addEventListener('hashchange', () => { if (active) settle(); });
  document.addEventListener('visibilitychange', () => { if (active && document.hidden) settle(); });
  document.addEventListener('keydown', event => { if (active && event.key === 'Escape') settle(); });
  reduced.addEventListener('change', () => { if (active && reduced.matches) settle(); });
})();
