import { components, groups, projects } from './data.js';
import { mountGlideSelect } from './ui/glide-select.js';
import { mountCopyButton } from './ui/copy-button.js';
import { mountPreviews } from './ui/previews.js';
import { icon } from './vendor/lucide/icons.js';
import { mountCategoryTooltips } from './ui/category-tooltips.js';
import { mountSystemPage } from './ui/system-page.js';
import { systemId, systemUrl } from './ui/system-data.js';

const main = document.querySelector('#main');
const sidebar = document.querySelector('#sidebar');
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const variantUrl = (component, variant = component.variants[0]) => `#/component/${component.id}/${variant.id}`;
const breadcrumb = label => `<div class="breadcrumb"><a href="#/catalog">组件图鉴</a><span>/</span><span>${escape(label)}</span></div>`;
let renderVersion = 0;
let notificationTimer;
let widgets = [];
const expandedComponents = new Set();
const categoryIcons = { all: 'layout-grid', controls: 'mouse-pointer-2', content: 'panels-top-left', backgrounds: 'image', motion: 'type' };
const categories = [{ id: 'all', name: '全部' }, ...groups];
let categoryFocus;
let systemPage, systemFocus;
const chevron = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 6 6 6-6 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function registerWidget(widget) { widgets.push(widget); return widget; }

document.querySelector('.skip-link').addEventListener('click', event => { event.preventDefault(); main.focus(); main.scrollIntoView(); });
history.scrollRestoration = 'manual';
function notification(message) {
  const node = document.querySelector('.notification'); node.textContent = message; node.hidden = false;
  clearTimeout(notificationTimer); notificationTimer = setTimeout(() => { node.hidden = true; }, 2500);
}

function renderSidebar(section, current, selectedVariant, query) {
  document.querySelectorAll('[data-section]').forEach(link => {
    if (link.dataset.section === (section === 'component' ? 'catalog' : section)) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  if (section === 'system') return;
  sidebar.setAttribute('aria-label', '组件目录');
  const scrollTop = sidebar.querySelector('.sidebar-list')?.scrollTop || 0;
  const requested = section === 'catalog' ? query.get('category') : current?.group;
  const category = categories.some(entry => entry.id === requested) ? requested : 'all';
  if (current) expandedComponents.add(current.id);
  sidebar.innerHTML = `<div class="sidebar-top"><div class="segmented-control category-segments" role="group" aria-label="组件分类">
    ${categories.map(entry => `<button type="button" data-category="${entry.id}" aria-label="${entry.name}" aria-pressed="${entry.id === category}" tabindex="${entry.id === category ? 0 : -1}">${icon(categoryIcons[entry.id])}</button>`).join('')}
    </div></div>
    <div class="sidebar-list">${groups.filter(group => category === 'all' || category === group.id).map(group => `<section class="nav-group"><h2>${group.name}</h2>
      ${components.filter(item => item.group === group.id).map(item => {
        const open = expandedComponents.has(item.id);
        return `<div class="nav-item"><div class="nav-item-row"><a class="nav-item-link" href="${variantUrl(item)}" aria-label="${item.name}，${item.variants.length} 个变体" ${current?.id === item.id ? 'aria-current="page"' : ''}><span class="nav-label">${item.name}</span><span class="nav-count" aria-hidden="true">${item.variants.length}</span></a><button class="nav-expand" type="button" data-expand="${item.id}" aria-label="${item.name}的变体" aria-expanded="${open}" aria-controls="variants-${item.id}">${chevron}</button></div>
        <div class="nav-variants" id="variants-${item.id}" data-open="${open}" ${open ? '' : 'inert'}><div class="variant-wrap"><div class="variant-links">${item.variants.map(variant => `<a href="${variantUrl(item, variant)}" ${selectedVariant?.id === variant.id ? 'aria-current="page"' : ''}>${variant.name}</a>`).join('')}</div></div></div></div>`;
      }).join('')}
    </section>`).join('')}</div>`;
  sidebar.querySelector('.sidebar-list').scrollTop = scrollTop;
  const filters = [...sidebar.querySelectorAll('[data-category]')];
  registerWidget(mountCategoryTooltips(sidebar.querySelector('.category-segments')));
  function applyCategory(button, keyboard = false) {
    const values = new URLSearchParams();
    if (button.dataset.category !== 'all') values.set('category', button.dataset.category);
    if (section === 'catalog' && projects.includes(query.get('project'))) values.set('project', query.get('project'));
    const hash = '#/catalog' + (values.size ? '?' + values.toString() : '');
    if (keyboard) categoryFocus = button.dataset.category;
    if (location.hash === hash) { button.focus(); categoryFocus = undefined; }
    else location.hash = hash;
  }
  filters.forEach((button, index) => {
    button.addEventListener('click', () => applyCategory(button));
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? filters.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + filters.length) % filters.length;
      applyCategory(filters[next], true);
    });
  });
  sidebar.querySelectorAll('[data-expand]').forEach(button => button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(open));
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    panel.dataset.open = String(open); panel.inert = !open;
    if (open) expandedComponents.add(button.dataset.expand); else expandedComponents.delete(button.dataset.expand);
  }));
}

function renderCatalog(query) {
  const category = categories.some(entry => entry.id === query.get('category')) ? query.get('category') : 'all';
  const project = query.get('project') || 'all';
  const pool = components.filter(item => project === 'all' || item.variants.some(variant => variant.project === project));
  const collection = groups.flatMap(group => pool.filter(item => item.group === group.id && (category === 'all' || item.group === category)));
  main.innerHTML = `<div class="content"><h1>${category === 'all' ? '组件总览' : groups.find(group => group.id === category).name}</h1><p class="page-intro">浏览从 Laper 与 Cromma 提取的组件、材质和动效。</p>
    <div class="catalog-bar"><div class="source-filter" id="source-select"></div></div>
    <div class="catalog-grid">${collection.map(item => {
      const variants = item.variants.filter(variant => project === 'all' || variant.project === project), first = variants[0];
      const meta = [project === 'all' ? [...new Set(variants.map(variant => variant.project))].join(' / ') : '', variants.length > 1 ? `${variants.length} 个变体` : ''].filter(Boolean);
      return `<a class="component-card" href="${variantUrl(item, first)}"><div class="thumbnail" data-component="${item.id}"><iframe title="${item.name}缩略预览" data-src="demos/${first.id}.html?thumbnail=1&managed=1" tabindex="-1" aria-hidden="true" inert></iframe></div><div class="card-meta"><h2 class="card-title">${item.name}</h2><p class="card-english">${item.english}</p>${meta.length ? `<div class="card-bottom">${meta.map(value => `<span>${value}</span>`).join('')}</div>` : ''}</div></a>`;
    }).join('')}</div>${collection.length ? '' : '<p class="empty-state">这个分类下没有来自该实验的组件，请切换分类或来源。</p>'}</div>`;
  function apply(nextCategory, nextProject) {
    const values = new URLSearchParams();
    if (nextCategory !== 'all') values.set('category', nextCategory);
    if (nextProject !== 'all') values.set('project', nextProject);
    location.hash = '/catalog' + (values.size ? '?' + values.toString() : '');
  }
  registerWidget(mountGlideSelect(main.querySelector('#source-select'), { label: '按实验来源查看', value: project, options: [{ value: 'all', label: '所有来源' }, ...projects.map(name => ({ value: name, label: name }))], align: 'right', onChange: value => apply(category, value) }));
  registerWidget(mountPreviews(main));
}

function renderComponent(item, variant) {
  const tall = item.id === 'pricing-card';
  main.innerHTML = `<div class="content">${breadcrumb(groups.find(group => group.id === item.group).name)}
    <div class="detail-heading"><h1>${item.name}</h1><p class="english-title">${item.english}</p><p class="page-intro">${item.description}</p></div>
    <nav class="variant-tabs" aria-label="组件变体">${item.variants.map(entry => `<a href="${variantUrl(item, entry)}" ${entry.id === variant.id ? 'aria-current="page"' : ''}>${entry.name}</a>`).join('')}</nav>
    <section class="workspace" aria-label="组件预览与代码"><div class="workspace-toolbar"><div class="segmented-control workspace-segments" role="tablist" aria-label="展示内容"><button type="button" role="tab" id="preview-tab" aria-controls="preview-panel" aria-selected="true" data-view="preview">${icon('eye')}<span>预览</span></button><button type="button" role="tab" id="code-tab" aria-controls="code-panel" aria-selected="false" tabindex="-1" data-view="code">${icon('code-xml')}<span>代码</span></button></div><div class="preview-actions"><button type="button" data-reset>重播 ↻</button><a href="demos/${variant.id}.html" target="_blank" rel="noopener" aria-label="单独打开预览">↗</a></div></div>
    <div id="preview-panel" role="tabpanel" aria-labelledby="preview-tab"><div class="preview-stage" data-tall="${tall}"><iframe id="demo-frame" title="${item.name}：${variant.name}交互预览" data-src="demos/${variant.id}.html?managed=1"></iframe></div></div>
    <div id="code-panel" role="tabpanel" aria-labelledby="code-tab" hidden><div class="code-toolbar"><div id="code-file"></div><button type="button" class="copy-button" data-copy data-state="idle" disabled><span class="copy-symbol" aria-hidden="true"><svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg><svg class="copy-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4 4 10-10"/></svg></span><span data-copy-label aria-live="polite">复制源码</span></button></div><pre><code id="source-code">正在读取本地源码…</code></pre><nav class="code-resources" id="asset-links" aria-label="预览素材" hidden></nav></div></section>
    <div class="detail-grid"><section><h2>使用说明</h2><h3>适用场景</h3><p>${item.use}</p><h3>实现机制</h3><p>${item.mechanism}</p><h3>注意事项</h3><p>${item.caution}</p></section><section><h2>关键参数</h2><table class="parameter-table"><tbody>${item.parameters.map(([name, value]) => `<tr><th scope="row">${name}</th><td>${escape(value)}</td></tr>`).join('')}</tbody></table><details class="source-details"><summary>提取来源：${variant.project}</summary><div class="provenance"><code id="origin-path">正在读取来源…</code><a href="${variant.project === 'Laper' ? 'https://laper.ai/' : 'https://cromma.ai/'}" target="_blank" rel="noopener">原站 ↗</a> &nbsp;·&nbsp; <a href="#/sources">提取记录</a></div></details></section></div></div>`;
  const version = renderVersion;
  const copyButton = registerWidget(mountCopyButton(main.querySelector('[data-copy]'), { notify: notification }));
  const codeSelect = registerWidget(mountGlideSelect(main.querySelector('#code-file'), { label: '源码文件', value: `demos/${variant.id}.html`, options: [`demos/${variant.id}.html`], matchWidth: true, onChange: loadSource }));
  fetch('provenance.json').then(response => response.json()).then(records => {
    if (version !== renderVersion) return;
    const record = records.find(entry => entry.variant === variant.id);
    main.querySelector('#origin-path').textContent = `${record.source}\n${record.selector}`;
    codeSelect.setOptions(record.files);
    const resources = main.querySelector('#asset-links');
    resources.innerHTML = record.assets.map(asset => `<a href="${escape(asset)}" title="${escape(asset.split('/').pop())}" download>${asset.endsWith('.woff2') ? '下载字体' : '下载示例图片'} ↓</a>`).join(' ');
    resources.hidden = !record.assets.length;
  }).catch(() => { if (version === renderVersion) main.querySelector('#origin-path').textContent = '来源记录读取失败，请使用本地服务器打开。'; });
  const frame = main.querySelector('#demo-frame');
  const previews = registerWidget(mountPreviews(main));
  main.querySelector('[data-reset]').addEventListener('click', () => { frame.src = frame.dataset.src; });
  const tabs = [...main.querySelectorAll('[data-view]')];
  function showTab(tab) {
    codeSelect.close(true);
    const code = tab.dataset.view === 'code';
    tabs.forEach(button => { const active = button === tab; button.setAttribute('aria-selected', String(active)); button.tabIndex = active ? 0 : -1; });
    main.querySelector('#code-panel').hidden = !code; main.querySelector('#preview-panel').hidden = code;
    main.querySelector('.preview-actions').hidden = code;
    previews.setEnabled(!code);
    if (code) loadSource();
  }
  tabs.forEach(tab => {
    tab.addEventListener('click', () => showTab(tab));
    tab.addEventListener('keydown', event => {
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) { event.preventDefault(); const next = event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs[1] : tabs.find(button => button !== tab); showTab(next); next.focus(); }
    });
  });
  let sourceRequest = 0;
  async function loadSource() {
    const request = ++sourceRequest;
    const url = codeSelect.value;
    copyButton.setSource(''); main.querySelector('#source-code').textContent = '正在读取本地源码…';
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Source missing');
      const text = await response.text();
      if (version !== renderVersion || request !== sourceRequest) return;
      copyButton.setSource(text);
      main.querySelector('#source-code').textContent = url.endsWith('.html') ? text.replace(/></g, '>\n<') : text;
    } catch { if (version === renderVersion && request === sourceRequest) main.querySelector('#source-code').textContent = '文件读取失败。请通过 node serve.mjs 启动项目。'; }
  }
}

function renderSystem(query) {
  systemPage = registerWidget(mountSystemPage(main, sidebar, {
    id: systemId(query.get('system')), notify: notification,
    onSwitch(id) {
      systemFocus = true;
      location.hash = systemUrl(id);
    },
  }));
}

function renderSources() {
  main.innerHTML = `<div class="content"><h1>实验来源</h1><p class="page-intro">原始实验、提取记录和素材使用范围。</p>
    ${projects.map(project => {
      const items = components.filter(item => item.variants.some(variant => variant.project === project));
      const variants = items.flatMap(item => item.variants).filter(variant => variant.project === project);
      return `<section class="source-row"><h2>${project}</h2><div class="source-path">${project === 'Laper' ? 'laper/' : 'cromma-landing/'} · ${items.length} 类组件 · ${variants.length} 个变体</div><p>${project === 'Laper' ? '保留绿色强调材质、年付开关、16 项语言菜单、轻薄定价表面，以及文字进入和页脚描边。' : '保留蓝色按钮与浮雕标签、语言列表、输入表面、FAQ、定价卡片，以及极光、分形点阵和变形云层。'}</p><a href="#/catalog?project=${project}">浏览该实验组件 →</a> &nbsp; <a href="${project === 'Laper' ? 'https://laper.ai/' : 'https://cromma.ai/'}" target="_blank" rel="noopener">原站 ↗</a></section>`;
    }).join('')}
    <section class="doc-section"><h2>提取记录</h2><p>提取日期：2026-10-06。来源是本机当时的实验工作区，包括 Cromma 已存在的本地修改。provenance.json 保存每个变体的原路径、节点定位，以及 CSS、字体和引擎快照的 SHA-256。</p><div class="doc-links"><a class="doc-link" href="provenance.json" target="_blank">来源清单 ↗</a><a class="doc-link" href="NOTES.md" target="_blank">实现与验证记录 ↗</a></div></section>
    <section class="doc-section"><h2>组织参考</h2><p><a href="https://reactbits.dev/get-started/index" target="_blank" rel="noopener">React Bits ↗</a> 提供目录、效果索引和组件详情的组织参考；<a href="https://m3.material.io/" target="_blank" rel="noopener">Google Material ↗</a> 提供设计系统与令牌分层的组织参考。图鉴采用自己的中文内容与视觉外壳。</p></section>
    <section class="doc-section"><h2>外壳组件来源</h2><p>来源与源码下拉使用 <a href="https://reactbits.dev/micro/glide-select" target="_blank" rel="noopener">React Bits Glide Select ↗</a> 的原生适配与官方 CSS。侧栏沿用官网文档导航的文本反馈，变体展开加入独立按钮。<a href="vendor/react-bits/README.md" target="_blank">查看原始源码、提交与许可 ↗</a></p></section>
    <section class="doc-section"><h2>素材边界</h2><p>两个原实验注明仅用于学习。原站的设计、字体和效果归各自权利人所有；本目录延续个人本地学习范围。运行时资源均来自本地，无统计脚本、模型请求、登录或支付流程。</p></section></div>`;
}

function render() {
  const [path, queryText = ''] = location.hash.slice(1).split('?');
  const parts = (path || '/catalog').split('/').filter(Boolean);
  const section = parts[0], item = components.find(entry => entry.id === parts[1]);
  const variant = item?.variants.find(entry => entry.id === parts[2]) || (!parts[2] ? item?.variants[0] : undefined);
  const query = new URLSearchParams(queryText);
  if (section === 'system' && systemPage?.id === systemId(query.get('system'))) {
    systemPage.goToChapter(query.get('section'));
    return;
  }
  widgets.forEach(widget => widget.destroy()); widgets = []; systemPage = undefined;
  renderVersion += 1;
  renderSidebar(section, item, variant, query);
  if (section === 'catalog') renderCatalog(query);
  else if (section === 'component' && item && variant) renderComponent(item, variant);
  else if (section === 'system') renderSystem(query);
  else if (section === 'sources') renderSources();
  else main.innerHTML = `<div class="content">${breadcrumb('未找到')}<h1>没有这个条目</h1><p class="page-intro">组件地址不存在。<a href="#/catalog">返回组件总览 →</a></p></div>`;
  document.title = `${section === 'component' && item ? item.name : section === 'system' ? '设计系统' : section === 'sources' ? '实验来源' : '组件总览'} · 组件图鉴`;
  window.scrollTo(0, 0);
  if (renderVersion > 1) main.focus({ preventScroll: true });
  if (categoryFocus) { sidebar.querySelector(`[data-category="${categoryFocus}"]`).focus(); categoryFocus = undefined; }
  if (systemPage) systemPage.goToChapter(query.get('section'), false);
  if (systemFocus) { sidebar.querySelector('#system-select [role="combobox"]')?.focus(); systemFocus = undefined; }
}
addEventListener('hashchange', render);
document.addEventListener('atlas-theme-change', () => {
  systemPage?.refreshPalette();
});
render();
