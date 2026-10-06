(() => {
  const body = document.body;
  const mode = body.dataset.demo;
  const variant = body.dataset.variant;
  const theme = body.dataset.theme;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const thumbnail = new URLSearchParams(location.search).has('thumbnail');
  body.dataset.thumbnail = String(thumbnail);
  const sample = document.querySelector('#sample');
  let toastTimer;
  function notify(message) {
    document.querySelector('.demo-toast')?.remove();
    const toast = document.createElement('div');
    toast.className = 'demo-toast'; toast.role = 'status'; toast.textContent = message;
    document.body.append(toast);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.remove(), 2400);
  }
  if (mode === 'button' || mode === 'card') {
    sample.addEventListener('click', event => {
      if (!event.target.closest('a,button,[role="button"]')) return;
      event.preventDefault();
      notify('已触发点击。此处只演示组件交互。');
    });
    sample.querySelectorAll('[role="button"]').forEach(control => control.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); control.click(); }
    }));
    const host = sample.querySelector('span.h-44 > div');
    if (host) window.CrommaField.mount(host, { kind: 'newton', tint: 'var(--primary)' });
  }
  if (mode === 'billing') {
    const toggle = sample.querySelector('[role="switch"]');
    toggle.addEventListener('click', () => {
      const annual = toggle.getAttribute('aria-checked') !== 'true';
      toggle.setAttribute('aria-checked', String(annual));
      toggle.classList.toggle('bg-toggle-on', annual);
      toggle.classList.toggle('bg-sidebar-accent', !annual);
      toggle.classList.toggle('ring-(--toggle-ring)', annual);
      toggle.classList.toggle('ring-border', !annual);
      toggle.style.setProperty('--toggle-ring', 'color-mix(in oklch, var(--toggle-on), black 10%)');
      const thumb = toggle.querySelector('span');
      thumb.classList.toggle('left-4.5', annual); thumb.classList.toggle('left-0', !annual);
      sample.querySelector('[data-price]').textContent = annual ? '$192' : '$20';
      sample.querySelector('[data-unit]').textContent = annual ? ' / yr.' : ' / mo.';
      sample.querySelector('[data-average]').textContent = annual ? '$16 / mo. · Save 20%' : '';
    });
  }
  if (mode === 'menu') {
    const trigger = sample.querySelector('button');
    trigger.setAttribute('aria-haspopup', 'menu'); trigger.setAttribute('aria-label', '选择语言');
    const items = theme === 'laper' ? window.LAPER_LANG_ITEMS : [
      { name: 'English', short: 'EN' }, { name: '简体中文', short: '简' },
      { name: '繁體中文', short: '繁' }, { name: '日本語', short: '日' },
      { name: '한국어', short: '한' }, { name: 'Español', short: 'ES' },
    ];
    let menu;
    let selected = 'EN';
    function close(restore = false) {
      menu?.remove(); menu = null;
      trigger.setAttribute('aria-expanded', 'false'); trigger.dataset.state = 'closed';
      if (restore) trigger.focus();
    }
    function position() {
      if (!menu) return;
      const rect = trigger.getBoundingClientRect();
      const gap = theme === 'laper' ? 4 : 6;
      const below = innerHeight - rect.bottom - gap - 8;
      const above = rect.top - gap - 8;
      const bottom = below >= Math.min(menu.scrollHeight, 120) || below >= above;
      menu.style.maxHeight = `${Math.max(60, bottom ? below : above)}px`;
      const width = menu.offsetWidth, height = menu.offsetHeight;
      const top = bottom ? rect.bottom + gap : rect.top - height - gap;
      menu.style.top = `${Math.max(8, Math.min(top, innerHeight - height - 8))}px`;
      menu.style.left = `${Math.min(Math.max(8, rect.right - width), innerWidth - width - 8)}px`;
    }
    trigger.addEventListener('click', () => {
      if (menu) { close(); return; }
      menu = document.createElement('div');
      menu.id = 'language-options'; menu.role = 'menu';
      menu.className = theme === 'laper'
        ? 'demo-menu rounded-xl border border-border/60 bg-background text-foreground shadow-[var(--shadow-lg)] laper-menu-motion min-w-[8rem] overflow-y-auto overflow-x-hidden p-1.5'
        : 'demo-menu laper-menu-motion outline-none isolate border-0 bg-(--btn-emphasis-bg) ring ring-(--btn-emphasis-ring) shadow-(--surface-shadow) flex flex-col gap-0.5 rounded-2xl text-popover-foreground w-44 p-1 overflow-y-auto overflow-x-hidden';
      if (theme === 'cromma') {
        menu.style.setProperty('--btn-emphasis-ring', 'color-mix(in oklch, var(--card), var(--foreground) 10%)');
        menu.style.setProperty('--btn-emphasis-bg', 'color-mix(in oklch, var(--card), var(--inverse) 30%)');
        menu.style.setProperty('--btn-emphasis-from', 'color-mix(in oklch, var(--card), var(--inverse) 15%)');
        menu.style.setProperty('--btn-emphasis-to', 'var(--card)');
        menu.style.setProperty('--surface-shadow', 'var(--shadow-surface-menu)');
        menu.innerHTML = '<span aria-hidden="true" class="pointer-events-none absolute inset-0 -z-1 rounded-[inherit] bg-linear-to-b from-(--btn-emphasis-from) to-(--btn-emphasis-to) shadow-[inset_0_1px_0_0_var(--laper-etch-highlight)]"></span>';
      }
      trigger.setAttribute('aria-controls', menu.id);
      for (const language of items) {
        const item = document.createElement('button'); item.type = 'button'; item.role = 'menuitem';
        item.className = theme === 'laper'
          ? 'relative flex cursor-default select-none items-center gap-2 rounded-lg px-2 py-2 text-sm text-foreground outline-none transition-colors hover:bg-accent focus:bg-accent [&>svg]:size-4 [&>svg]:shrink-0'
          : 'flex w-full cursor-pointer items-center gap-2 rounded-xl px-2.5 py-2 text-left text-base text-foreground transition-colors duration-150 hover:bg-accent/60';
        if (theme === 'cromma' && language.short === selected) item.classList.add('bg-accent', 'font-medium', 'hover:bg-accent');
        if (language.svg) item.innerHTML = language.svg;
        item.append(document.createTextNode(language.name));
        item.addEventListener('click', () => {
          const label = trigger.querySelector('span.opacity-100') || trigger.querySelector('span.inline-flex');
          label.textContent = language.short; selected = language.short; close(true);
        });
        menu.append(item);
      }
      document.body.append(menu); position();
      trigger.setAttribute('aria-expanded', 'true'); trigger.dataset.state = 'open';
      if (!thumbnail) menu.querySelector('button').focus();
    });
    document.addEventListener('click', event => {
      if (!event.target.closest('.demo-menu') && !trigger.contains(event.target)) close();
    });
    document.addEventListener('keydown', event => {
      if (!menu) return;
      if (event.key === 'Escape') { event.preventDefault(); close(true); }
      if (event.key === 'Tab') { close(); return; }
      const controls = [...menu.querySelectorAll('button')];
      const index = controls.indexOf(document.activeElement);
      const next = { ArrowDown: (index + 1) % controls.length, ArrowUp: (index - 1 + controls.length) % controls.length, Home: 0, End: controls.length - 1 }[event.key];
      if (next !== undefined) { event.preventDefault(); controls[next].focus(); }
    });
    addEventListener('resize', position);
    if (thumbnail) trigger.click();
  }
  if (mode === 'prompt') {
    const form = sample.querySelector('form'), input = form.querySelector('textarea');
    const send = form.querySelector('[aria-label="Send"]');
    input.setAttribute('aria-label', '描述你想创建的应用');
    function sync() {
      const ready = Boolean(input.value.trim());
      send.setAttribute('aria-disabled', String(!ready));
      send.classList.toggle('opacity-60', !ready);
      send.classList.toggle('cursor-not-allowed', !ready);
    }
    function submit(event) {
      event.preventDefault();
      if (!input.value.trim()) {
        send.classList.remove('animate-shake'); void send.offsetWidth;
        send.classList.add('animate-shake');
        notify('先输入一段文字。'); return;
      }
      notify('输入已接收，仅在浏览器内演示。');
    }
    input.addEventListener('input', sync);
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.shiftKey && !event.isComposing) submit(event);
    });
    form.addEventListener('submit', submit); send.addEventListener('click', submit);
    form.querySelectorAll('button:not([aria-label="Send"])').forEach(button => button.addEventListener('click', event => { event.preventDefault(); notify('辅助按钮点击已触发。'); }));
    sync();
    const field = form.querySelector('.cromma-edge span.absolute.inset-0 > div');
    if (field) window.CrommaField.mount(field, { kind: 'newton', tint: 'var(--sky)', animated: true });
  }
  if (mode === 'accordion') {
    const controls = [...sample.querySelectorAll('button')];
    controls.forEach((button, index) => {
      const answer = button.querySelector('.grid');
      answer.id = `answer-${index}`; button.setAttribute('aria-controls', answer.id);
      button.addEventListener('click', () => {
        const opening = button.getAttribute('aria-expanded') !== 'true';
        controls.forEach(control => {
          const open = control === button && opening;
          control.setAttribute('aria-expanded', String(open));
          const panel = control.querySelector('.grid');
          for (const name of ['mt-2', 'grid-rows-[1fr]', 'opacity-100']) panel.classList.toggle(name, open);
          for (const name of ['mt-0', 'grid-rows-[0fr]', 'opacity-0']) panel.classList.toggle(name, !open);
          panel.inert = !open;
          control.querySelector('svg').classList.toggle('rotate-45', open);
          control.parentElement.classList.toggle('bg-card', open);
        });
      });
    });
  }
  if (mode === 'field') {
    window.CrommaField.mount(sample.querySelector('[data-field]'), { kind: 'newton', tint: variant === 'field-static' ? 'var(--primary)' : 'var(--sky)', animated: variant === 'field-animated' });
  }
  if (mode === 'cloud') {
    const host = sample.querySelector('[data-cloud]');
    const footer = variant === 'cloud-footer';
    const layer = window.HeroCloud.create(host, { shadow: footer ? 0 : .24, scale: 1, opacity: 1, drift: footer, frameMode: footer ? 'footer' : undefined, cycleMs: footer ? 8000 : 0 });
    const resize = () => layer.resize({ width: host.clientWidth, height: host.clientHeight }, innerWidth < 640);
    resize(); new ResizeObserver(resize).observe(host);
    if (!footer && !reduced) layer.ready();
    sample.querySelector('[data-pulse]').addEventListener('click', () => { if (!reduced) layer.pulse(); });
    if (reduced) { sample.querySelector('[data-pulse]').disabled = true; sample.querySelector('[data-pulse]').textContent = '减少动态效果：静态云形'; }
    addEventListener('pagehide', () => layer.destroy?.(), { once: true });
    if (!layer.canvas) notify('当前浏览器无法绘制 WebGL 云层。');
  }
  if (mode === 'reveal') {
    const target = sample.querySelector('[data-reveal] > *');
    function play() {
      target.classList.remove('is-in');
      target.style.opacity = '0'; target.style.transform = theme === 'laper' ? 'translateY(20px)' : 'translateY(14px)';
      target.style.transition = 'none';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        target.style.transition = reduced ? 'none' : theme === 'laper' ? 'opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1)' : '';
        target.classList.add('is-in'); target.style.opacity = '1'; target.style.transform = 'none';
      }));
    }
    sample.querySelector('[data-replay]').addEventListener('click', play); play();
  }
  if (mode === 'outline' && reduced) sample.querySelector('text').style.strokeDashoffset = '0';
  if (mode === 'field' && window.__fieldStatus !== 'ok') notify('当前浏览器无法绘制 WebGL 点阵。');
  body.dataset.ready = 'true';
})();
