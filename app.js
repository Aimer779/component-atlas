import { components, groups, countVariants, projects } from './data.js';

const main = document.querySelector('#main');
const sidebar = document.querySelector('#sidebar');
const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const variantUrl = (component, variant = component.variants[0]) => `#/component/${component.id}/${variant.id}`;
const footer = () => '<footer class="page-footer"><span>从复刻实验提取，保留可观察、可操作的设计细节。</span><span>个人学习图鉴 · 本地预览</span></footer>';
const breadcrumb = label => `<div class="breadcrumb"><a href="#/catalog">组件图鉴</a><span>/</span><span>${escape(label)}</span></div>`;
let renderVersion = 0;
let sourceText = '';
let notificationTimer;

document.querySelector('.skip-link').addEventListener('click', event => { event.preventDefault(); main.focus(); main.scrollIntoView(); });
history.scrollRestoration = 'manual';
function notification(message) {
  const node = document.querySelector('.notification'); node.textContent = message; node.hidden = false;
  clearTimeout(notificationTimer); notificationTimer = setTimeout(() => { node.hidden = true; }, 2500);
}

function renderSidebar(section, current, selectedVariant) {
  sidebar.innerHTML = `<div class="sidebar-head">LIBRARY / VOL. 01</div>
    <a class="nav-overview" href="#/catalog" ${section === 'catalog' ? 'aria-current="page"' : ''}>组件总览 <small>${components.length}</small></a>
    ${groups.map(group => `<section class="nav-group"><h2>${group.name}<span>${group.english}</span></h2>
      ${components.filter(item => item.group === group.id).map(item => `<details ${current?.id === item.id ? 'open' : ''}><summary><a href="${variantUrl(item)}" ${current?.id === item.id ? 'aria-current="page"' : ''}>${item.name}<small>${item.variants.length}</small></a></summary>
        <div class="variant-links">${item.variants.map(variant => `<a href="${variantUrl(item, variant)}" ${selectedVariant?.id === variant.id ? 'aria-current="page"' : ''}>${variant.name}</a>`).join('')}</div></details>`).join('')}
    </section>`).join('')}
    <div class="sidebar-bottom"><a href="#/system" ${section === 'system' ? 'aria-current="page"' : ''}>设计系统 <small>design.md ↗</small></a><a href="#/sources" ${section === 'sources' ? 'aria-current="page"' : ''}>实验来源 <small>02</small></a><p>${components.length} 类组件 / ${countVariants(components)} 个变体<br>Laper · Cromma</p></div>`;
  document.querySelectorAll('[data-section]').forEach(link => {
    if (link.dataset.section === (section === 'component' ? 'catalog' : section)) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

function renderCatalog(query) {
  const category = query.get('category') || 'all';
  const project = query.get('project') || 'all';
  const pool = components.filter(item => project === 'all' || item.variants.some(variant => variant.project === project));
  const collection = pool.filter(item => category === 'all' || item.group === category);
  const variantCount = pool.flatMap(item => item.variants).filter(variant => project === 'all' || variant.project === project).length;
  main.innerHTML = `<div class="content">${breadcrumb('组件总览')}
    <div class="page-heading"><div><h1>组件总览</h1><p class="page-intro">把喜欢的界面拆开，留下值得复用的部分。<br>浏览 Laper 与 Cromma 的组件、材质和动效，在预览里试一试。</p></div><div class="inventory"><strong>${pool.length}</strong> COMPONENTS &nbsp;/&nbsp; <strong>${variantCount}</strong> VARIANTS</div></div>
    <div class="catalog-bar"><div class="category-tabs" role="group" aria-label="组件分类">
      ${[{ id: 'all', name: '全部' }, ...groups].map(group => `<button type="button" data-category="${group.id}" aria-pressed="${category === group.id}">${group.name}<small>${pool.filter(item => group.id === 'all' || item.group === group.id).length}</small></button>`).join('')}
    </div><select class="source-filter" aria-label="按实验来源查看"><option value="all">所有来源</option>${projects.map(name => `<option ${name === project ? 'selected' : ''}>${name}</option>`).join('')}</select></div>
    <div class="catalog-grid">${collection.map(item => {
      const variants = item.variants.filter(variant => project === 'all' || variant.project === project), first = variants[0];
      return `<a class="component-card" href="${variantUrl(item, first)}"><div class="thumbnail" data-component="${item.id}"><iframe title="${item.name}缩略预览" src="demos/${first.id}.html?thumbnail=1" loading="lazy" tabindex="-1" aria-hidden="true" inert></iframe></div><div class="card-meta"><div class="card-title"><h2>${item.name}</h2><span aria-hidden="true">↗</span></div><p class="card-english">${item.english}</p><div class="card-bottom"><span>${[...new Set(variants.map(variant => variant.project))].join(' / ')}</span><span>${variants.length} 个变体</span></div></div></a>`;
    }).join('')}</div>${collection.length ? '' : '<p class="empty-state">这个分类下没有来自该实验的组件，请切换分类或来源。</p>'}${footer()}</div>`;
  const filter = main.querySelector('.source-filter');
  function apply(nextCategory, nextProject) {
    const values = new URLSearchParams();
    if (nextCategory !== 'all') values.set('category', nextCategory);
    if (nextProject !== 'all') values.set('project', nextProject);
    location.hash = '/catalog' + (values.size ? '?' + values.toString() : '');
  }
  main.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => apply(button.dataset.category, project)));
  filter.addEventListener('change', () => apply(category, filter.value));
}

function renderComponent(item, variant) {
  const tall = item.id === 'pricing-card';
  main.innerHTML = `<div class="content">${breadcrumb(groups.find(group => group.id === item.group).name)}
    <div class="detail-heading"><h1>${item.name}</h1><p class="english-title">${item.english}</p><p class="page-intro">${item.description}</p></div>
    <nav class="variant-tabs" aria-label="组件变体">${item.variants.map(entry => `<a href="${variantUrl(item, entry)}" ${entry.id === variant.id ? 'aria-current="page"' : ''}>${entry.name}</a>`).join('')}</nav>
    <section class="workspace" aria-label="组件预览与源码"><div class="workspace-toolbar"><div class="view-tabs" role="tablist" aria-label="展示内容"><button role="tab" id="preview-tab" aria-controls="preview-panel" aria-selected="true" data-view="preview">预览</button><button role="tab" id="code-tab" aria-controls="code-panel" aria-selected="false" tabindex="-1" data-view="code">源码</button></div><div class="preview-actions"><button type="button" data-reset>重播 ↻</button><a href="demos/${variant.id}.html" target="_blank" rel="noopener" aria-label="单独打开预览">↗</a></div></div>
    <div id="preview-panel" role="tabpanel" aria-labelledby="preview-tab"><div class="preview-stage" data-tall="${tall}"><iframe id="demo-frame" title="${item.name}：${variant.name}交互预览" src="demos/${variant.id}.html"></iframe></div><div class="preview-note"><span>可直接操作 · ${variant.project} / ${variant.name}</span><strong>HTML + CSS + JavaScript</strong></div></div>
    <div id="code-panel" role="tabpanel" aria-labelledby="code-tab" hidden><div class="code-toolbar"><select aria-label="源码文件" id="code-file"><option value="demos/${variant.id}.html">${variant.id}.html</option><option value="demos/demo.js">demo.js · 独立交互</option><option value="demos/demo.css">demo.css · 预览容器</option><option value="snapshots/${variant.project.toLowerCase()}.css">${variant.project.toLowerCase()}.css · 原样式快照</option>${['morph-cloud', 'fractal-field', 'pricing-card', 'prompt'].includes(item.id) ? '<option value="snapshots/field.js">field.js · 点阵引擎</option>' : ''}${item.id === 'morph-cloud' ? '<option value="snapshots/clouds.js">clouds.js · 云层引擎</option>' : ''}</select><button type="button" class="text-button" data-copy>复制源码</button></div><pre><code id="source-code">正在读取本地源码…</code></pre><div class="code-note">完整示例在 demos/。原始 CSS 是本地快照；复制 HTML 时需一并保留对应的 CSS 和脚本路径。所有预览无需原站接口。</div></div></section>
    <div class="detail-grid"><section><h2>使用说明</h2><h3>适用场景</h3><p>${item.use}</p><h3>实现机制</h3><p>${item.mechanism}</p><h3>注意事项</h3><p>${item.caution}</p><div class="preference"><span>个人判断</span><span>待你体验后记录</span></div></section><section><h2>关键参数</h2><table class="parameter-table"><tbody>${item.parameters.map(([name, value]) => `<tr><th scope="row">${name}</th><td>${escape(value)}</td></tr>`).join('')}</tbody></table><div class="provenance">提取自 <strong>${variant.project}</strong><code id="origin-path">正在读取来源…</code><a href="${variant.project === 'Laper' ? 'https://laper.ai/' : 'https://cromma.ai/'}" target="_blank" rel="noopener">查看原站 ↗</a> &nbsp;·&nbsp; <a href="#/sources">查看提取记录</a></div></section></div>${footer()}</div>`;
  const version = renderVersion;
  fetch('provenance.json').then(response => response.json()).then(records => {
    if (version !== renderVersion) return;
    const record = records.find(entry => entry.variant === variant.id);
    main.querySelector('#origin-path').textContent = `${record.source}\n${record.selector}`;
  }).catch(() => { if (version === renderVersion) main.querySelector('#origin-path').textContent = '来源记录读取失败，请使用本地服务器打开。'; });
  const frame = main.querySelector('#demo-frame');
  main.querySelector('[data-reset]').addEventListener('click', () => { frame.src = `demos/${variant.id}.html`; });
  const tabs = [...main.querySelectorAll('[data-view]')];
  function showTab(tab) {
    const code = tab.dataset.view === 'code';
    tabs.forEach(button => { const active = button === tab; button.setAttribute('aria-selected', String(active)); button.tabIndex = active ? 0 : -1; });
    main.querySelector('#code-panel').hidden = !code; main.querySelector('#preview-panel').hidden = code;
    main.querySelector('.preview-actions').hidden = code;
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
    const url = main.querySelector('#code-file').value;
    sourceText = ''; main.querySelector('#source-code').textContent = '正在读取本地源码…';
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Source missing');
      const text = await response.text();
      if (version !== renderVersion || request !== sourceRequest) return;
      sourceText = text;
      main.querySelector('#source-code').textContent = url.endsWith('.html') ? text.replace(/></g, '>\n<') : text;
    } catch { if (version === renderVersion) main.querySelector('#source-code').textContent = '文件读取失败。请通过 node serve.mjs 启动项目。'; }
  }
  main.querySelector('#code-file').addEventListener('change', loadSource);
  main.querySelector('[data-copy]').addEventListener('click', async () => {
    if (!sourceText) { notification('源码尚未加载。'); return; }
    try { await navigator.clipboard.writeText(sourceText); notification('源码已复制。'); }
    catch { notification('复制受浏览器限制，请选中源码手动复制。'); }
  });
}

function renderSystem() {
  const palettes = [
    ['图鉴外壳', [['页面', '#101113'], ['抬起表面', '#191b1e'], ['边界', '#2b2d31'], ['主要文字', '#eff0f1'], ['选中 / 焦点', '#c9e99a']]],
    ['Laper', [['背景', '#fcfdfc'], ['前景', '#171a19'], ['主色', '#1a4a35'], ['技术绿', '#0fa958'], ['边界', '#e4e8e6']]],
    ['Cromma', [['背景', 'oklch(95.51% 0 0)'], ['前景', 'oklch(32.11% 0 0)'], ['主色', 'oklch(58% .2 262)'], ['卡片', 'oklch(99.2% 0 0)'], ['边界', 'oklch(91% 0 0)']]],
  ];
  main.innerHTML = `<div class="content">${breadcrumb('设计系统')}<div class="doc-lead"><h1>设计系统</h1><p class="page-intro">基础规范决定如何组合，组件规范记录如何使用。<br>保留两套来源的视觉语言，也为图鉴本身建立一致的规则。</p><div class="doc-links"><a class="doc-link" href="design.md" target="_blank">阅读 design.md ↗</a><a class="doc-link" href="https://m3.material.io/foundations/design-tokens/overview" target="_blank" rel="noopener">Google Material 参考 ↗</a></div></div>
    <section class="doc-section"><h2>组织方式</h2><p>参考 Google Material 的基础、样式与组件规范：先记录颜色、字体、形状、间距和运动，再记录每个组件的变体、状态、参数与适用场景。这里没有将示例换成 Material 的外观。</p><table class="parameter-table"><tbody><tr><th>参考值 Reference</th><td>#1a4a35 / 18px / 150ms</td></tr><tr><th>语义角色 System</th><td>primary / foreground / border / ease-drawer</td></tr><tr><th>组件角色 Component</th><td>开关轨道 / 按钮高光 / 菜单表面</td></tr></tbody></table></section>
    <section class="doc-section"><h2>颜色与角色</h2><p>预览内保留来源令牌；图鉴外壳使用独立的一组中性色。强调色只用于当前导航和键盘焦点。</p>${palettes.map(([title, values]) => `<h3>${title}</h3><div class="palette">${values.map(([name, value]) => `<div><div class="swatch" style="background:${value}"></div><strong>${name}</strong><code>${value}</code></div>`).join('')}</div>`).join('')}</section>
    <section class="doc-section"><h2>形状与材质</h2><p>圆角由半径与 corner-shape 共同决定。来源中的 Squircle 是材质的一部分；标签按钮还需要多层 inset 高光、细边缘与按压状态。</p><div class="shape-grid"><div><div class="shape-example">round / 16px</div><p>普通圆角，弧线更明显。</p></div><div><div class="shape-example squircle">squircle / 16px</div><p>同一半径，转角更连续。</p></div><div><div class="shape-example capsule">round / 999px</div><p>两端半圆，用于明确的胶囊形。</p></div></div></section>
    <section class="doc-section"><h2>字体与间距</h2><table class="parameter-table"><tbody><tr><th>图鉴标题</th><td>38px / 600</td></tr><tr><th>图鉴正文 / 导航</th><td>13–14px / 12px；系统中文字体</td></tr><tr><th>代码与参数</th><td>Cascadia Code → Consolas → monospace</td></tr><tr><th>预览字体</th><td>本地 Montserrat；中文系统字体；剧本使用 Courier</td></tr><tr><th>间距基础</th><td>4 / 8 / 12 / 16 / 24 / 32 / 48px</td></tr><tr><th>布局</th><td>68px 顶栏、252px 目录、最大 1140px 内容</td></tr></tbody></table></section>
    <section class="doc-section"><h2>运动与可访问性</h2><p>保留来源的运动时长与缓动。提供重播和独立打开；键盘焦点可见，菜单支持方向键，状态同步到 aria-expanded / aria-checked。减少动态效果时，关闭循环背景与文字位移。</p><table class="parameter-table"><tbody><tr><th>开关</th><td>150ms ease-out</td></tr><tr><th>按钮</th><td>200ms；材质与缩放</td></tr><tr><th>手风琴</th><td>300ms；行高、透明度与图标</td></tr><tr><th>Laper 进入</th><td>700ms cubic-bezier(.16,1,.3,1)</td></tr><tr><th>云形</th><td>1800ms cubic-bezier(.32,.72,0,1)</td></tr></tbody></table></section>
    <section class="doc-section"><h2>提取与复用</h2><p>每个条目有中文名称、英文术语、可操作预览、变体、来源、参数、使用建议与适配差异。图鉴不虚构你的个人偏好；体验后再把采纳或拒绝的理由补进去。</p><p>第一版的样式文件保留完整快照以维持原材质，组件 DOM 已独立提取。后续真正接入产品时，再按使用到的组件裁剪 CSS，并处理来源素材的许可。</p><div class="token-code"><pre><code>:root {
  --background: #fcfdfc; /* 参考值 → 背景角色 */
  --primary: #1a4a35;    /* 参考值 → 主色角色 */
  --toggle-on: var(--primary); /* 组件角色 */
}</code></pre></div></section>${footer()}</div>`;
}

function renderSources() {
  main.innerHTML = `<div class="content">${breadcrumb('实验来源')}<h1>实验来源</h1><p class="page-intro">从现有本地实验提取，保存独立预览与来源快照。<br>源实验不被修改，组件的适配差异记录在 NOTES.md。</p>
    ${projects.map(project => {
      const items = components.filter(item => item.variants.some(variant => variant.project === project));
      const variants = items.flatMap(item => item.variants).filter(variant => variant.project === project);
      return `<section class="source-row"><h2>${project}</h2><div class="source-path">${project === 'Laper' ? 'laper/' : 'cromma-landing/'} · ${items.length} 类组件 · ${variants.length} 个变体</div><p>${project === 'Laper' ? '保留绿色强调材质、年付开关、16 项语言菜单、轻薄定价表面，以及文字进入和页脚描边。' : '保留蓝色按钮与浮雕标签、语言列表、输入表面、FAQ、定价卡片，以及极光、分形点阵和变形云层。'}</p><a href="#/catalog?project=${project}">浏览该实验组件 →</a> &nbsp; <a href="${project === 'Laper' ? 'https://laper.ai/' : 'https://cromma.ai/'}" target="_blank" rel="noopener">原站 ↗</a></section>`;
    }).join('')}
    <section class="doc-section"><h2>提取记录</h2><p>提取日期：2026-10-06。来源是本机当时的实验工作区，包括 Cromma 已存在的本地修改。provenance.json 保存每个变体的原路径、节点定位，以及 CSS、字体和引擎快照的 SHA-256。</p><div class="doc-links"><a class="doc-link" href="provenance.json" target="_blank">来源清单 ↗</a><a class="doc-link" href="NOTES.md" target="_blank">实现与验证记录 ↗</a></div></section>
    <section class="doc-section"><h2>组织参考</h2><p><a href="https://reactbits.dev/get-started/index" target="_blank" rel="noopener">React Bits ↗</a> 提供目录、效果索引和组件详情的组织参考；<a href="https://m3.material.io/" target="_blank" rel="noopener">Google Material ↗</a> 提供设计系统与令牌分层的组织参考。图鉴采用自己的中文内容与视觉外壳。</p></section>
    <section class="doc-section"><h2>素材边界</h2><p>两个原实验注明仅用于学习。原站的设计、字体和效果归各自权利人所有；本目录延续个人本地学习范围。运行时资源均来自本地，无统计脚本、模型请求、登录或支付流程。</p></section>${footer()}</div>`;
}

function render() {
  renderVersion += 1; sourceText = '';
  const [path, queryText = ''] = location.hash.slice(1).split('?');
  const parts = (path || '/catalog').split('/').filter(Boolean);
  const section = parts[0], item = components.find(entry => entry.id === parts[1]);
  const variant = item?.variants.find(entry => entry.id === parts[2]) || (!parts[2] ? item?.variants[0] : undefined);
  renderSidebar(section, item, variant);
  if (section === 'catalog') renderCatalog(new URLSearchParams(queryText));
  else if (section === 'component' && item && variant) renderComponent(item, variant);
  else if (section === 'system') renderSystem();
  else if (section === 'sources') renderSources();
  else main.innerHTML = `<div class="content">${breadcrumb('未找到')}<h1>没有这个条目</h1><p class="page-intro">组件地址不存在。<a href="#/catalog">返回组件总览 →</a></p></div>`;
  document.title = `${section === 'component' && item ? item.name : section === 'system' ? '设计系统' : section === 'sources' ? '实验来源' : '组件总览'} · 组件图鉴`;
  window.scrollTo(0, 0);
  if (renderVersion > 1) main.focus({ preventScroll: true });
}
addEventListener('hashchange', render);
render();
