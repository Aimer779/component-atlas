import { chapters, systemOptions, systemUrl, getSystem } from './system-data.js';
import { mountCopyButton } from './copy-button.js';
import { mountPreviews } from './previews.js';

const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const copy = (value, label = '复制', className = 'system-copy') => `<button type="button" class="${className}" data-copy-value="${escape(value)}" data-state="idle"><span data-copy-label aria-live="polite">${label}</span></button>`;
const section = (id, title, english, body) => `<section class="system-section" id="system-${id}" data-chapter="${id}" tabindex="-1"><div class="system-section-title"><h2>${title}</h2><span>${english}</span></div>${body}</section>`;

function palette(system) {
  return ['强调色', '表面', '文字', '边界'].map(group => `<div class="token-group"><h3>${group}</h3><div class="token-grid">${system.colors.filter(row => row[0] === group).map(([, token, name, value, purpose]) => `<div class="token-item" data-token="${token}"><div class="token-swatch" style="background:${escape(value)}" aria-hidden="true"></div><div class="token-heading"><strong>${name}</strong>${copy(value)}</div><code data-token-value>${value}</code><p>${purpose}</p><code class="token-name">--${token}</code></div>`).join('')}</div></div>`).join('');
}

function typography(system) {
  return `<p class="system-note">${system.typeNote}</p><div class="type-specimens">${system.types.map(([role, size, weight, height, tracking, family]) => `<div class="type-row"><div class="specimen-meta"><strong>${role}</strong><code>${size}px · ${weight} · ${height}</code></div><div class="type-sample" data-family="${family}" style="--sample-size:${size}px;--sample-weight:${weight};--sample-leading:${height};--sample-tracking:${tracking}"><span lang="zh-CN">设计让细节可见</span><span lang="en">Design in detail</span></div></div>`).join('')}</div>
    <div class="font-summary">${system.fonts.map(([role, name, note]) => `<div><span class="system-label">${role}</span><h3>${name}</h3><p>${note}</p></div>`).join('')}</div>
    <a class="system-text-link" href="${system.id === 'atlas' ? 'assets/fonts/SOURCES.md' : 'assets/SOURCES.md'}" target="_blank" rel="noopener">字体来源与许可 ↗</a>`;
}

function geometry(system) {
  return `<div class="geometry-grid"><div><h3>间距 <span>Spacing</span></h3><p class="system-note">${system.id === 'atlas' ? '外壳常用间距。长度按实际像素显示。' : '已提取组件中的实际值。长度按实际像素显示。'}</p><div class="spacing-list">${system.spacing.map(([name, value]) => `<div class="spacing-row"><span>${name}</span><code>${value}px</code><div class="spacing-preview"><i style="width:${value}px" aria-hidden="true"></i></div></div>`).join('')}</div></div>
    <div><h3>形状 <span>Shape</span></h3><div class="radius-list">${system.shapes.map(([name, radius, shape]) => `<div class="radius-row"><div><strong>${name}</strong><code>${radius}px · ${shape}</code></div><div class="radius-preview" style="border-radius:${radius}px;corner-shape:${shape}" aria-hidden="true"></div></div>`).join('')}</div><p class="system-note">${system.id === 'atlas' ? '半径与控件角色一一对应。' : 'Squircle 同时需要半径与 corner-shape。'}</p></div></div>
    <details class="shape-comparison"><summary>比较同一半径的 round 与 squircle</summary><div class="shape-pair"><div><div style="corner-shape:round">round</div><code>16px</code></div><div><div style="corner-shape:squircle">squircle</div><code>16px</code></div></div><p class="system-note">不支持 corner-shape 时，两种轮廓相同。</p></details>`;
}

function material(system) {
  if (system.id === 'atlas') return `<p class="system-note">细边缘与顶部高光区分控件表面。</p><div class="shell-material"><div class="material-stage"><button type="button" class="copy-button" data-copy-value="--radius-control: 9px;" data-state="idle"><span data-copy-label aria-live="polite">复制参数</span></button></div><div><h3>复制控件</h3><p>悬浮、按下与成功反馈共用现有控件。</p><code>36px 高 · 9px 圆角</code></div></div>`;
  return `<p class="system-note">悬浮或按下查看材质变化。预览沿用来源样式。</p><div class="material-grid">${system.material.map(([name, variant, note]) => `<div class="material-item"><div class="material-stage"><iframe title="${system.name} ${name}材质预览" data-src="demos/${variant}.html?managed=1"></iframe></div><h3>${name}</h3><p>${note}</p><a class="system-text-link" href="#/component/buttons/${variant}">查看组件与源码 →</a></div>`).join('')}</div>`;
}

function motions(system) {
  return `<p class="system-note">按需播放一次。示意展示节奏，完整交互见组件详情。</p><div class="motion-list">${system.motions.map(([name, duration, easing, kind, note], index) => `<div class="motion-row" data-motion="${index}"><div class="motion-info"><h3>${name}</h3><p>${note}</p><code>${duration}ms · ${easing}</code></div><div class="motion-stage" data-kind="${kind}" aria-hidden="true"><div class="motion-sample"></div></div><button type="button" class="system-play" aria-label="播放${name}">播放<span aria-hidden="true"> ↻</span></button></div>`).join('')}</div><p class="system-note" data-motion-preference></p>`;
}

function guidelines(system) {
  return `<div class="guideline-grid"><div><h3>建议采用</h3><ul>${system.do.map(text => `<li>${text}</li>`).join('')}</ul></div><div><h3>避免使用</h3><ul>${system.avoid.map(text => `<li>${text}</li>`).join('')}</ul></div></div><details class="system-method"><summary>规范的组织与复用</summary><p>参考值 → 语义角色 → 组件角色。</p><p>来源规范以本地提取版本为准。接入产品前核实依赖与素材许可。</p><div class="system-resource-links"><a href="design.md" target="_blank" rel="noopener">完整 design.md ↗</a><a href="#/sources">提取来源 →</a><a href="https://styles.refero.design/style/12255b63-e506-4bc1-a4cd-d05487de32f3" target="_blank" rel="noopener">展示参考 · Refero ↗</a></div></details>`;
}

/** Mounts one selected system; theme updates keep the specimens and preview instances. */
export function mountSystemPage(main, sidebar, { id, notify, onSwitch }) {
  const system = getSystem(id);
  main.innerHTML = `<div class="content system-page" data-system="${system.id}"><header class="system-lead" id="system-overview" data-chapter="overview" tabindex="-1"><div class="system-heading"><h1>设计系统</h1><div class="segmented-control system-segments" role="group" aria-label="选择设计系统">${systemOptions.map(([value, label]) => `<button type="button" data-system-option="${value}" aria-pressed="${value === system.id}" tabindex="${value === system.id ? 0 : -1}">${label}</button>`).join('')}</div></div><div class="system-description"><h2>${system.subtitle}</h2><p>${system.description}</p><span class="system-label" data-system-theme>${system.id === 'atlas' ? '' : '本地提取版本 · 保留来源主题'}</span></div></header>
    ${section('colors', '色彩', 'Color palette', '<div data-system-palette>' + palette(system) + '</div>')}
    ${section('typography', '字体', 'Typography', typography(system))}
    ${section('geometry', '间距与形状', 'Spacing & shape', geometry(system))}
    ${section('material', '材质', 'Material', material(system))}
    ${section('motion', '动效', 'Motion', motions(system))}
    ${section('guidelines', '使用原则', 'Guidelines', guidelines(system))}</div>`;
  sidebar.setAttribute('aria-label', '设计系统目录');
  sidebar.innerHTML = `<div class="sidebar-top system-sidebar-title"><strong>设计系统</strong><span>${system.name}</span></div><nav class="sidebar-list system-chapters" aria-label="设计系统章节">${chapters.map(([chapter, name]) => `<a href="${systemUrl(system.id, chapter)}" data-system-chapter="${chapter}">${name}</a>`).join('')}</nav><a class="system-back" href="#/catalog">返回组件图鉴 →</a>`;
  return mountInteractions(main, sidebar, system, { notify, onSwitch });
}

function motionFrames(kind) {
  if (kind === 'circle') return [{ clipPath: 'circle(0% at 100% 0%)' }, { clipPath: 'circle(145% at 100% 0%)' }];
  if (kind === 'slide') return [{ transform: 'translateX(-18px)' }, { transform: 'translateX(0)' }];
  if (kind === 'scale') return [{ transform: 'scale(.9)' }, { transform: 'scale(1)' }];
  if (kind === 'morph') return [{ borderRadius: '48% 30% 42% 26%' }, { borderRadius: '26% 44% 28% 46%' }, { borderRadius: '48% 30% 42% 26%' }];
  return [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'translateY(0)' }];
}

function mountInteractions(main, sidebar, system, { notify, onSwitch }) {
  let disposed = false, scrollFrame;
  const copies = [...main.querySelectorAll('[data-copy-value]')].map(button => {
    const widget = mountCopyButton(button, { notify, idleLabel: button.textContent.trim() });
    widget.setSource(button.dataset.copyValue);
    return { button, widget };
  });
  const previews = mountPreviews(main);
  const sections = [...main.querySelectorAll('[data-chapter]')];
  const links = [...sidebar.querySelectorAll('[data-system-chapter]')];
  const buttons = [...main.querySelectorAll('[data-system-option]')];
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => onSwitch(button.dataset.systemOption, false));
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
      onSwitch(buttons[next].dataset.systemOption, true);
    });
  });
  function markChapter(chapter) {
    links.forEach(link => {
      if (link.dataset.systemChapter === chapter) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function scrollSpy() {
    scrollFrame = undefined;
    const edge = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header')) + 45;
    const chapter = scrollY + innerHeight >= document.documentElement.scrollHeight - 2 ? sections.at(-1) : sections.filter(node => node.getBoundingClientRect().top <= edge).at(-1) || sections[0];
    markChapter(chapter.dataset.chapter);
  }
  const onScroll = () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(scrollSpy); };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const animations = new Map();
  const rows = [...main.querySelectorAll('[data-motion]')];
  function cancel(row) {
    animations.get(row)?.cancel(); animations.delete(row);
    row.querySelector('button').removeAttribute('aria-busy');
  }
  function cancelAll() { rows.forEach(cancel); }
  function preference() {
    cancelAll();
    main.querySelector('[data-motion-preference]').textContent = reduced.matches ? '减少动态效果已开启。点击播放仅显示最终状态。' : '离开章节、隐藏页面或按 Escape，结束当前播放。';
  }
  rows.forEach((row, index) => row.querySelector('button').addEventListener('click', () => {
    cancel(row);
    if (reduced.matches) { notify('减少动态效果已开启，已显示最终状态。'); return; }
    const [, duration, easing, kind] = system.motions[index];
    const animation = row.querySelector('.motion-sample').animate(motionFrames(kind), { duration, easing });
    animations.set(row, animation);
    row.querySelector('button').setAttribute('aria-busy', 'true');
    animation.finished.then(() => { if (animations.get(row) === animation) cancel(row); }, () => {});
  }));
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (!entry.isIntersecting) cancel(entry.target); });
  });
  rows.forEach(row => observer.observe(row));
  const visibility = () => { if (document.hidden) cancelAll(); };
  const keyboard = event => { if (event.key === 'Escape') cancelAll(); };
  document.addEventListener('visibilitychange', visibility);
  document.addEventListener('keydown', keyboard);
  reduced.addEventListener('change', preference);
  preference();
  function refreshPalette() {
    if (system.id !== 'atlas') return;
    main.querySelector('[data-system-theme]').textContent = document.documentElement.dataset.theme === 'light' ? '当前显示 · 浅色主题' : '当前显示 · 暗黑主题';
    getSystem('atlas').colors.forEach(([, token, , value]) => {
      const item = main.querySelector(`[data-token="${token}"]`);
      item.querySelector('.token-swatch').style.background = value;
      item.querySelector('[data-token-value]').textContent = value;
      const button = item.querySelector('[data-copy-value]');
      button.dataset.copyValue = value;
      button.setAttribute('aria-label', `复制${item.querySelector('strong').textContent}色值 ${value}`);
      copies.find(entry => entry.button === button).widget.setSource(value);
    });
  }
  main.querySelectorAll('.token-item').forEach(item => {
    item.querySelector('button').setAttribute('aria-label', `复制${item.querySelector('strong').textContent}色值 ${item.querySelector('[data-token-value]').textContent}`);
  });
  refreshPalette();
  return {
    id: system.id,
    refreshPalette,
    goToChapter(value = 'overview', focus = true) {
      const chapter = chapters.some(([id]) => id === value) ? value : 'overview';
      const target = main.querySelector(`#system-${chapter}`);
      cancelAll();
      target.scrollIntoView({ block: 'start', behavior: 'instant' });
      if (focus) target.focus({ preventScroll: true });
      markChapter(chapter);
    },
    destroy() {
      if (disposed) return;
      disposed = true; cancelAll(); observer.disconnect(); previews.destroy();
      copies.forEach(({ widget }) => widget.destroy());
      cancelAnimationFrame(scrollFrame);
      window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll);
      document.removeEventListener('visibilitychange', visibility); document.removeEventListener('keydown', keyboard);
      reduced.removeEventListener('change', preference);
    },
  };
}
