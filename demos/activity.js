(() => {
  const subscribers = new Set();
  let hosted = !new URLSearchParams(location.search).has('managed');
  let active;
  function sync() {
    const next = hosted && !document.hidden;
    if (next === active) return;
    active = next;
    document.body.dataset.active = String(active);
    subscribers.forEach(callback => callback(active));
  }
  function message(event) {
    // Only the same-origin embedding page can control an embedded demo.
    if (event.source !== parent || event.origin !== location.origin || event.data?.type !== 'atlas-preview-activity') return;
    hosted = event.data.active === true; sync();
  }
  window.AtlasActivity = {
    get active() { return active; },
    subscribe(callback) { subscribers.add(callback); callback(active); return () => subscribers.delete(callback); },
  };
  addEventListener('message', message);
  document.addEventListener('visibilitychange', sync);
  addEventListener('pagehide', () => {
    hosted = false; sync(); subscribers.clear();
    removeEventListener('message', message); document.removeEventListener('visibilitychange', sync);
  }, { once: true });
  sync();
})();
