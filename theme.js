/* Runs before the stylesheet to restore the chosen theme without a light flash. */
(() => {
  const root = document.documentElement;
  const key = 'component-atlas-theme';
  let saved;
  try { saved = localStorage.getItem(key); } catch { /* Private contexts can block storage. */ }
  root.dataset.theme = saved === 'light' ? 'light' : 'dark';

  function sync() {
    const button = document.querySelector('[data-theme-toggle]');
    if (!button) return;
    const dark = root.dataset.theme === 'dark';
    button.setAttribute('aria-pressed', String(dark));
    button.title = dark ? '切换到浅色模式' : '切换到暗黑模式';
  }
  document.addEventListener('DOMContentLoaded', () => {
    sync();
    document.querySelector('[data-theme-toggle]').addEventListener('click', () => {
      root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(key, root.dataset.theme); } catch { /* Switching still works in memory. */ }
      sync();
      document.dispatchEvent(new Event('atlas-theme-change'));
    });
  });
  window.addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    root.dataset.theme = event.newValue === 'light' ? 'light' : 'dark';
    sync();
    document.dispatchEvent(new Event('atlas-theme-change'));
  });
})();
