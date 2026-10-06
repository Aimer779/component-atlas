/** Show category labels on hover or keyboard focus; destroy with the sidebar. */
export function mountCategoryTooltips(root) {
  const lifetime = new AbortController();
  const tooltip = document.createElement('div');
  tooltip.id = 'category-tooltip';
  tooltip.className = 'category-tooltip';
  tooltip.setAttribute('role', 'tooltip');
  tooltip.hidden = true;
  document.body.append(tooltip);
  let active, hovered, focused, timer, dismissed = false;
  const listen = (node, event, callback, capture = false) => node.addEventListener(event, callback, { signal: lifetime.signal, capture });
  function position() {
    if (!active || tooltip.hidden) return;
    const rect = active.getBoundingClientRect();
    const box = tooltip.getBoundingClientRect();
    const edge = 8, gap = 8;
    const left = Math.max(edge, Math.min(rect.left + (rect.width - box.width) / 2, innerWidth - box.width - edge));
    const top = rect.bottom + gap + box.height <= innerHeight - edge ? rect.bottom + gap : Math.max(edge, rect.top - gap - box.height);
    tooltip.style.left = `${left}px`; tooltip.style.top = `${top}px`;
  }
  function hide() {
    clearTimeout(timer);
    active?.removeAttribute('aria-describedby');
    active = undefined;
    tooltip.hidden = true;
  }
  function show(button) {
    clearTimeout(timer);
    if (dismissed) return;
    active?.removeAttribute('aria-describedby');
    active = button;
    tooltip.textContent = button.getAttribute('aria-label');
    tooltip.hidden = false;
    button.setAttribute('aria-describedby', tooltip.id);
    position();
  }
  function leave() {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (hovered || tooltip.matches(':hover')) return;
      if (focused && !dismissed) { if (active !== focused) show(focused); }
      else hide();
    }, 100);
  }
  root.querySelectorAll('button').forEach(button => {
    listen(button, 'pointerenter', event => {
      if (event.pointerType === 'touch') return;
      hovered = button; dismissed = false;
      clearTimeout(timer);
      if (!tooltip.hidden) show(button);
      else timer = setTimeout(() => show(button), 220);
    });
    listen(button, 'pointerleave', () => { hovered = undefined; leave(); });
    // Remember keyboard focus when later pointer input changes :focus-visible.
    listen(button, 'focus', () => { if (button.matches(':focus-visible')) { focused = button; dismissed = false; show(button); } });
    listen(button, 'blur', () => { if (focused === button) focused = undefined; if (hovered !== button) leave(); });
    listen(button, 'click', hide);
  });
  listen(tooltip, 'pointerenter', () => clearTimeout(timer));
  listen(tooltip, 'pointerleave', leave);
  listen(document, 'keydown', event => { if (event.key === 'Escape') { dismissed = true; hide(); } });
  listen(window, 'resize', position);
  listen(window, 'scroll', position, true);
  return { destroy() { lifetime.abort(); hide(); tooltip.remove(); } };
}
