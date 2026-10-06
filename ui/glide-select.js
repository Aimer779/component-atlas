/* DOM adaptation of React Bits GlideSelect by David Haz.
   Source and MIT + Commons Clause notice: ../vendor/react-bits/. */
export function typeaheadIndex(items, from, character) {
  const needle = character.toLowerCase();
  for (let step = 1; step <= items.length; step++) {
    const index = (from + step) % items.length;
    if (items[index].label.toLowerCase().startsWith(needle)) return index;
  }
  return from;
}

export function menuPlacement(rect, count, viewport, menuWidth = 176, align = 'left') {
  const edge = 8, gap = 6;
  const width = Math.min(Math.max(menuWidth, rect.width), viewport.width - edge * 2);
  const below = viewport.height - rect.bottom - gap - edge, above = rect.top - gap - edge;
  const fullHeight = count * 31 - 1 + 8;
  const side = fullHeight > below && above > below ? 'top' : 'bottom';
  const height = Math.min(fullHeight, Math.max(32, side === 'top' ? above : below));
  const start = align === 'right' ? rect.right - width : rect.left;
  const left = Math.max(edge, Math.min(start, viewport.width - width - edge));
  return { side, width, height, left, top: side === 'top' ? rect.top - gap - height : rect.bottom + gap };
}

/** Owns one combobox and its portaled list; destroy before removing its root. */
export function mountGlideSelect(root, { options, value, label, onChange, menuWidth = 176, align = 'left' }) {
  const id = root.id;
  const lifetime = new AbortController();
  let items = [], current = value, active = null, menu, list, pill, open = false;
  let closeTimer, scrub, frame;
  root.classList.add('glide-select');
  root.innerHTML = '<button type="button" role="combobox" aria-haspopup="listbox" aria-expanded="false" class="glide-select__trigger"><span class="glide-select__label"></span><span class="glide-select__chevron" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>';
  const trigger = root.querySelector('button'), text = root.querySelector('.glide-select__label');
  trigger.setAttribute('aria-label', label);
  const listen = (node, name, callback, capture = false) => node.addEventListener(name, callback, { signal: lifetime.signal, capture });
  const selected = () => items.findIndex(item => item.value === current);
  const focusTrigger = () => trigger.focus({ preventScroll: true });
  function removeMenu() { menu?.remove(); menu = list = pill = undefined; }
  function close(instant = false) {
    open = false; active = null; scrub = undefined;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.removeAttribute('aria-activedescendant');
    trigger.removeAttribute('aria-controls');
    clearTimeout(closeTimer); cancelAnimationFrame(frame);
    if (!menu) return;
    if (instant) { removeMenu(); return; }
    menu.dataset.state = 'closed'; menu.inert = true; menu.setAttribute('aria-hidden', 'true');
    closeTimer = setTimeout(removeMenu, 140);
  }
  function position() {
    if (!menu) return;
    const { width, height, side, left, top } = menuPlacement(trigger.getBoundingClientRect(), items.length, { width: window.innerWidth, height: window.innerHeight }, menuWidth, align);
    menu.style.width = `${width}px`;
    menu.style.maxHeight = `${height}px`;
    menu.style.left = `${left}px`; menu.style.top = `${top}px`;
    menu.dataset.side = side;
    menu.style.setProperty('--gs-origin', `${side === 'top' ? 'bottom' : 'top'} ${align}`);
  }
  function highlight(index, instant = false) {
    active = index;
    if (!pill) return;
    pill.style.transitionDuration = instant || pill.style.opacity !== '1' ? '0ms, 150ms' : '';
    pill.style.transform = `translateY(${index * 31}px)`; pill.style.opacity = '1';
    list.dataset.live = '';
    trigger.setAttribute('aria-activedescendant', `${id}-option-${index}`);
    const row = list.children[index + 1];
    if (instant && row) {
      const top = row.offsetTop, bottom = top + row.offsetHeight;
      if (top < menu.scrollTop) menu.scrollTop = top;
      else if (bottom > menu.scrollTop + menu.clientHeight - 8) menu.scrollTop = bottom - menu.clientHeight + 8;
    }
  }
  function show(viaKey = false) {
    if (!items.length) return;
    close(true); open = true;
    menu = document.createElement('div');
    menu.className = 'glide-select__menu gs-portal'; menu.dataset.state = 'closed';
    menu.innerHTML = '<div class="glide-select__list" role="listbox"><span class="glide-select__pill" aria-hidden="true"></span></div>';
    list = menu.firstElementChild; pill = list.firstElementChild;
    list.id = `${id}-list`; list.setAttribute('aria-label', label);
    items.forEach((item, index) => {
      const row = document.createElement('div'); row.className = 'glide-select__option';
      row.id = `${id}-option-${index}`; row.role = 'option'; row.dataset.index = index;
      row.setAttribute('aria-selected', String(index === selected()));
      const name = document.createElement('span'); name.className = 'glide-select__name'; name.textContent = item.label; name.title = item.label; row.append(name);
      const check = document.createElement('span'); check.className = 'glide-select__check'; check.setAttribute('aria-hidden', 'true');
      check.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="m5 12 4 4 10-10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      if (index === selected()) check.dataset.on = '';
      row.append(check); list.append(row);
    });
    document.body.append(menu); position();
    trigger.setAttribute('aria-expanded', 'true'); trigger.setAttribute('aria-controls', list.id);
    const initial = selected() >= 0 ? selected() : viaKey ? 0 : null;
    if (initial !== null) highlight(initial, true);
    void menu.offsetHeight;
    frame = requestAnimationFrame(() => { if (open && menu) menu.dataset.state = 'open'; });
    // Pointer scrubbing and ordinary clicks both commit exactly one selection.
    menu.addEventListener('pointerover', event => {
      const row = event.target.closest('[data-index]');
      if (row && !scrub && event.pointerType !== 'touch') highlight(Number(row.dataset.index));
    });
    const rowAt = y => {
      const index = Math.floor((y - list.getBoundingClientRect().top) / 31);
      return index >= 0 && index < items.length ? index : null;
    };
    list.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      event.preventDefault(); focusTrigger(); scrub = event.pointerId;
      list.setPointerCapture(event.pointerId);
      const index = rowAt(event.clientY); if (index !== null) highlight(index, true);
    });
    list.addEventListener('pointermove', event => {
      if (scrub !== event.pointerId) return;
      const index = rowAt(event.clientY); if (index !== null) highlight(index);
    });
    list.addEventListener('pointerup', event => {
      if (scrub !== event.pointerId) return;
      scrub = undefined; const index = rowAt(event.clientY);
      if (index !== null) pick(index);
    });
    list.addEventListener('pointercancel', () => { scrub = undefined; });
    list.addEventListener('lostpointercapture', () => { scrub = undefined; });
    list.addEventListener('click', event => { const row = event.target.closest('[data-index]'); if (open && row) pick(Number(row.dataset.index)); });
  }
  function pick(index) {
    const item = items[index]; if (!item) return;
    const changed = current !== item.value; current = item.value; text.textContent = item.label;
    close(true); focusTrigger();
    if (changed) { root.dataset.swap = ''; onChange(current, item); }
  }
  listen(trigger, 'click', () => open ? close() : show());
  listen(trigger, 'keydown', event => {
    const key = event.key;
    if (!open) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(key)) { event.preventDefault(); show(true); }
      return;
    }
    let next = active ?? Math.max(0, selected());
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key)) {
      event.preventDefault();
      next = key === 'Home' ? 0 : key === 'End' ? items.length - 1 : Math.max(0, Math.min(items.length - 1, next + (key === 'ArrowDown' ? 1 : -1)));
      highlight(next, true);
    } else if (key === 'Enter' || key === ' ') { event.preventDefault(); pick(next); }
    else if (key === 'Escape') { event.preventDefault(); close(true); }
    else if (key === 'Tab') close(true);
    else if (key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey && !event.isComposing) { event.preventDefault(); highlight(typeaheadIndex(items, next, key), true); }
  });
  listen(document, 'pointerdown', event => { if (open && !root.contains(event.target) && !menu?.contains(event.target)) close(); }, true);
  listen(window, 'scroll', position, true); listen(window, 'resize', position);
  listen(root, 'animationend', () => { delete root.dataset.swap; });
  function setOptions(nextOptions, nextValue = current) {
    close(true); items = nextOptions.map(item => typeof item === 'string' ? { value: item, label: item } : item);
    current = items.some(item => item.value === nextValue) ? nextValue : items[0]?.value ?? '';
    text.textContent = items.find(item => item.value === current)?.label ?? ''; trigger.disabled = !items.length;
  }
  setOptions(options);
  return { get value() { return current; }, setOptions, close, destroy() { close(true); lifetime.abort(); } };
}
