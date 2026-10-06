import { fontFamilies } from './system-details.js';

const scalar = value => "'" + String(value).replaceAll("'", "''") + "'";
const cell = value => String(value).replaceAll('|', '\\|').replaceAll('\n', '<br>');
const table = (headers, rows) => [headers.map(cell).join(' | '), headers.map(() => '---').join(' | '), ...rows.map(row => row.map(cell).join(' | '))].map(line => '| ' + line + ' |').join('\n');
const heading = title => '\n## ' + title + '\n\n';
const list = values => values.map(value => '- ' + value).join('\n');
export const stitchReference = 'https://github.com/google-labs-code/stitch-skills/blob/main/plugins/stitch-design/skills/extract-design-md/SKILL.md';

export function documentPath(system) {
  if (system.id === 'atlas') return system.theme === 'dark' ? 'DESIGN.md' : 'design-systems/atlas-light/DESIGN.md';
  return `design-systems/${system.id}/DESIGN.md`;
}

/** Produces the full selected system from the same values rendered by the specimen page. */
export function createDesignMarkdown(system) {
  const roles = system.id === 'atlas' ? { accent: 'primary', surface: 'surface', 'surface-panel': 'surface-container', 'surface-raised': 'surface-container-high', text: 'on-surface', secondary: 'on-surface-variant', line: 'outline', 'line-soft': 'outline-variant' } : { background: 'surface', panel: 'surface-container', card: 'surface-container-high', foreground: 'on-surface', 'muted-foreground': 'on-surface-variant', 'primary-foreground': 'on-primary', border: 'outline', destructive: 'error' };
  const frontmatter = ['---', `name: ${scalar(system.name)}`, `theme: ${scalar(system.theme)}`, 'colors:', ...system.colors.map(([, token, , , , hex]) => `  ${roles[token] || token}: ${scalar(hex)}`), 'typography:'];
  system.types.forEach(([role, size, weight, leading, tracking, family], index) => {
    const key = (system.id === 'atlas' ? ['display-lg', 'title-section', 'body-base', 'label-nav', 'code'] : ['display-lg', 'body-base', 'label-action'])[index];
    const primary = { ui: 'Inter', mono: 'JetBrains Mono', source: 'Montserrat', screenplay: 'Courier New' }[family];
    frontmatter.push(`  ${key}:`, `    name: ${scalar(role)}`, `    fontFamily: ${scalar(primary)}`, `    fontSize: ${scalar(size + 'px')}`, `    fontWeight: ${scalar(weight)}`, `    lineHeight: ${scalar(Number((size * leading).toFixed(3)) + 'px')}`, `    letterSpacing: ${scalar(tracking)}`);
  });
  frontmatter.push('rounded:');
  system.shapes.forEach(([name, radius, shape], index) => frontmatter.push(`  shape-${index + 1}: ${scalar(radius + 'px')}`));
  frontmatter.push('spacing:');
  [...new Set(system.spacing.map(row => row[1]))].sort((a, b) => a - b).forEach(value => frontmatter.push(`  space-${value}: ${scalar(value + 'px')}`));
  frontmatter.push('---', '', `# Design System: ${system.name}`, '', `主题：${system.theme === 'light' ? '浅色' : '暗黑'}。范围：${system.id === 'atlas' ? '组件图鉴外壳' : '本地已提取组件'}。`, '', '本文按 Google Stitch 的源码提取文档流程组织。未连接 Stitch 项目，因此不填写 Project ID。');
  let markdown = frontmatter.join('\n');
  markdown += heading('1. Visual Theme & Atmosphere') + system.atmosphere + '\n\n' + system.density + '\n\n' + system.description + '\n';
  markdown += heading('2. Color Palette & Roles') + '颜色按用途分组。YAML 使用 8 位 sRGB 十六进制近似值。正文保留原始颜色表达，OKLCH 与 sRGB 近似值不能互相覆盖。\n\n';
  markdown += table(['分组', '颜色名称', '源令牌', '原始值', 'sRGB HEX', '用途'], system.colors.map(([group, token, name, value, purpose, hex]) => [group, name, token, value, hex, purpose])) + '\n\n';
  markdown += '### 文字与表面对比\n\n' + table(['颜色配对', '前景', '背景', 'sRGB 对比度'], system.contrast.map(row => [row.name, row.foreground, row.background, row.ratio.toFixed(2) + ':1'])) + '\n\n透明叠层、图片背景与真实渲染需要单独检查；上述数值不代表所有状态都通过可访问性评审。\n';
  markdown += heading('3. Typography Rules') + system.typeNote + '\n\n' + table(['角色', '字体', '字号', '字重', '行高', '字距'], system.types.map(([role, size, weight, leading, tracking, family]) => [role, fontFamilies[family], size + 'px', weight, Number((size * leading).toFixed(3)) + 'px', tracking])) + '\n\n';
  markdown += list(system.fonts.map(([role, family, note]) => `${role}：${family}。${note}`)) + '\n\n标题保持紧凑的视觉节奏。正文保留足够行高。中英文回退字体需单独核对。\n';
  markdown += heading('4. Component Stylings') + system.componentRules.map(([name, rule]) => '### ' + name + '\n\n' + rule + '\n').join('\n');
  markdown += '\n### 形状与表面\n\n' + table(['组件角色', '半径', '轮廓'], system.shapes.map(([name, radius, shape]) => [name, radius + 'px', shape])) + '\n\n' + table(['层次', '源令牌', '呈现规则'], system.surfaces) + '\n\n';
  markdown += '### 交互状态\n\n' + table(['状态', '呈现规则'], system.states) + '\n\n### 动效与减少动态效果\n\n' + table(['动效', '时长', '缓动', '规则'], system.motions.map(([name, duration, easing, , note]) => [name, duration + 'ms', easing, note])) + '\n\n减少动态效果时直接呈现最终状态。离屏与隐藏预览暂停。页面退出释放动画和观察器。云形样张只演示缓动节奏。\n';
  if (system.catalog.length) {
    markdown += '\n### 已收录组件的关键规范\n\n';
    system.catalog.forEach(item => {
      const variants = item.variants.filter(v => v.project.toLowerCase() === system.id);
      const parameters = item.parameters.filter(([name]) => !name.includes(system.id === 'laper' ? 'Cromma' : 'Laper'));
      markdown += `#### ${item.name} / ${item.english}\n\n${item.description}\n\n变体：${variants.map(v => v.name).join('、')}。\n\n适用：${item.use}\n\n注意：${item.caution}\n\n` + table(['参数', '值'], parameters) + '\n\n';
    });
  }
  markdown += heading('5. Layout Principles') + system.layoutNote + '\n\n' + table(['布局角色', '值'], system.layout) + '\n\n### 留白与间距\n\n' + table(['用途', '长度'], system.spacing.map(([name, value]) => [name, value + 'px'])) + '\n\n保持文字、参数和动作沿共同对齐线排列。不要通过缩小文字或隐藏关键内容消除溢出。\n';
  markdown += heading('6. Design System Notes for Stitch Generation') + '### 风格语言\n\n' + system.atmosphere + '\n\n### 示例生成提示\n\n' + system.prompts.map((prompt, index) => `${index + 1}. ${prompt}`).join('\n') + '\n\n### 增量调整\n\n' + list(system.do) + '\n\n### 避免使用\n\n' + list(system.avoid) + '\n\n';
  markdown += '先生成一个静态页面，再核对文字层级、表面、轮廓和状态。每轮只调整一个明确维度。未采集的页面布局与状态应先确认，不能补成来源事实。\n\n';
  markdown += '### 来源与许可\n\n本地依据：styles.css、ui/system-data.js、ui/system-details.js、data.js 与 runtime/ 来源样式。组件来源记录见 provenance.json。外壳字体采用 OFL 1.1。来源素材仍按个人学习范围使用，接入产品前核实许可。\n\n';
  markdown += `[Google Stitch 文档约定](${stitchReference})\n\n`;
  return markdown.trimEnd() + '\n';
}
