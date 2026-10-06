// Loading and activity use separate observers: preloading must not start an offscreen animation.
export function mountPreviews(root) {
  const frames = [...root.querySelectorAll('iframe[data-src]')];
  const visible = new Map(frames.map(frame => [frame, false]));
  let enabled = true, disposed = false;
  const send = frame => {
    if (!frame.hasAttribute('src')) return;
    frame.contentWindow?.postMessage({ type: 'atlas-preview-activity', active: !disposed && enabled && !document.hidden && visible.get(frame) }, location.origin);
  };
  const load = frame => {
    if (disposed || frame.hasAttribute('src')) return;
    frame.src = frame.dataset.src;
    loading.unobserve(frame);
  };
  const loading = new IntersectionObserver(entries => {
    for (const entry of entries) if (entry.isIntersecting) load(entry.target);
  }, { rootMargin: '160px 0px' });
  const activity = new IntersectionObserver(entries => {
    for (const entry of entries) {
      visible.set(entry.target, entry.isIntersecting && entry.intersectionRatio > 0);
      send(entry.target);
    }
  });
  const onLoad = event => send(event.currentTarget);
  const sync = () => frames.forEach(send);
  frames.forEach(frame => { frame.addEventListener('load', onLoad); loading.observe(frame); activity.observe(frame); });
  document.addEventListener('visibilitychange', sync);
  return {
    setEnabled(value) { enabled = value; sync(); },
    destroy() {
      disposed = true; sync(); loading.disconnect(); activity.disconnect();
      document.removeEventListener('visibilitychange', sync);
      frames.forEach(frame => frame.removeEventListener('load', onLoad));
    },
  };
}
