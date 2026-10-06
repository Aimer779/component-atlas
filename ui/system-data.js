import { enrichSystem } from './system-details.js';

export const chapters = [
  ['overview', '系统简介'], ['colors', '色彩'], ['typography', '字体'],
  ['geometry', '间距与形状'], ['layout', '布局'], ['material', '材质与层次'],
  ['components', '组件规范'], ['motion', '动效'], ['guidelines', '使用原则'], ['document', 'DESIGN.md'],
];
export const systemOptions = [['atlas', '图鉴外壳'], ['laper', 'Laper'], ['cromma', 'Cromma']];
export const systemId = value => systemOptions.some(([id]) => id === value) ? value : 'atlas';
export const systemUrl = (id, chapter = 'overview') => `#/system?system=${systemId(id)}${chapter === 'overview' ? '' : `&section=${chapter}`}`;
const shellColors = [
  ['强调色', 'accent', '选中 / 焦点', '当前导航与键盘焦点'],
  ['表面', 'surface', '页面', '页面、顶栏与目录'],
  ['表面', 'surface-raised', '抬起表面', '卡片与选中控件'],
  ['表面', 'surface-panel', '控件表面', '分段控件与参数区'],
  ['表面', 'surface-hover', '悬浮表面', '可操作区域的悬浮反馈'],
  ['表面', 'surface-code', '源码表面', '代码阅读区域'],
  ['文字', 'text', '主要文字', '标题与主要信息'],
  ['文字', 'secondary', '次级文字', '参数与辅助标题'],
  ['文字', 'muted', '说明文字', '说明与次要信息'],
  ['边界', 'line', '内容边界', '内容分隔与控件边缘'],
  ['边界', 'line-soft', '轻边界', '静止卡片与章节分隔'],
  ['边界', 'line-hover', '悬浮边界', '悬浮控件的清楚边缘'],
];
// Values describe the extracted local demos, not a complete upstream brand system.
const systems = {
  atlas: {
    name: '图鉴外壳', subtitle: '低彩度表面，清楚的内容层级。',
    description: '绿色强调色标记当前选择。中英文字体各自承担阅读，参数使用等宽字体。',
    typeNote: '外壳的实际层级；不强行套用等比字阶。',
    types: [['页面标题', 44, 650, 1.25, '-.025em', 'ui'], ['章节标题', 19, 500, 1.7, '0', 'ui'], ['说明正文', 14, 400, 1.85, '0', 'ui'], ['导航', 13, 400, 1.7, '0', 'ui'], ['代码与参数', 13, 400, 1.75, '0', 'mono']],
    fonts: [['中英正文', 'Inter + Noto Sans SC', '本地 OFL 1.1 字体；免费，允许非商业使用。'], ['代码与参数', 'JetBrains Mono', '本地 OFL 1.1 字体；中文沿用 Noto Sans SC。']],
    spacing: [['控件内距', 4], ['图标间距', 8], ['控件分隔', 12], ['目录外距', 16], ['信息分组', 24], ['内容分组', 32], ['大段留白', 48]],
    shapes: [['控件', 9, 'round'], ['内嵌预览', 12, 'round'], ['索引卡片', 16, 'round']],
    material: [],
    motions: [['控件反馈', 200, 'cubic-bezier(.23,1,.32,1)', 'scale', '缩放与表面反馈'], ['主题铺开', 520, 'cubic-bezier(.4,0,.2,1)', 'circle', '右上角向左下角揭示']],
    do: ['强调色用于选择与焦点。', '相同功能使用相同控件变体。', '中英文与参数保持清楚的阅读层级。'],
    avoid: ['不要用颜色作为唯一状态提示。', '不要将来源组件统一改成外壳样式。', '不要让非可见预览持续运行。'],
  },
  laper: {
    name: 'Laper', subtitle: '绿色强调材质，轻薄的产品表面。',
    description: '绿色渐变与细高光用于行动按钮。剧本字体和轻薄卡片保留来源的表达。',
    colors: [
      ['强调色', 'primary', '主色', '#1a4a35', '行动按钮与年付开关'], ['强调色', 'tech-green', '技术绿', '#0fa958', '标题与按钮渐变'],
      ['表面', 'background', '页面', '#fcfdfc', '来源页面背景'], ['表面', 'panel', '面板', '#f8faf9', '浅色内容面板'], ['表面', 'card', '卡片', '#ffffff', '定价与菜单表面'],
      ['文字', 'foreground', '主要文字', '#171a19', '标题与正文'], ['文字', 'muted-foreground', '说明文字', '#6b7370', '辅助说明'], ['边界', 'border', '边界', '#e4e8e6', '卡片与控件边缘'],
      ['强调色', 'primary-foreground', '行动文字', '#ffffff', '深绿行动按钮上的文字'], ['强调色', 'tech-green-dark', '渐变中绿', '#2d6a4f', '绿色行动按钮的中间色'],
      ['表面', 'muted', '低强调表面', '#f4f6f5', '浅色 hover 与弱强调区域'], ['表面', 'input', '输入表面', '#ffffff', '源 CSS 的输入角色'],
      ['反馈状态', 'destructive', '错误红', '#dc2626', '源 CSS 的错误角色'], ['反馈状态', 'success', '成功绿', '#1a4a35', '源 CSS 的成功角色'], ['反馈状态', 'warning', '警告黄', '#f59e0b', '源 CSS 的警告角色'], ['反馈状态', 'info', '信息蓝', '#3b82f6', '源 CSS 的信息角色'],
    ],
    typeNote: '取自本地预览：进入标题、预览正文和行动按钮。',
    types: [['剧本标题', 44, 300, 1.12, 'normal', 'screenplay'], ['预览正文', 16, 400, 1.5, 'normal', 'source'], ['行动按钮', 12, 500, 1.42857, 'normal', 'source']],
    fonts: [['界面正文', 'Montserrat', '沿用已提取的本地预览字体。中文使用系统回退。'], ['剧本标题', 'Courier New', '使用系统字体。字重为来源声明值。']],
    spacing: [['菜单偏移', 4], ['按钮内距', 12], ['定价卡片水平内距', 16], ['定价卡片上内距', 24]],
    shapes: [['菜单', 12, 'squircle'], ['行动按钮', 24, 'squircle'], ['定价卡片', 24, 'squircle']],
    material: [['强调按钮', 'button-laper-primary', '渐变填充、顶部高光与外部 ring'], ['描边按钮', 'button-laper-outline', '细边缘与轻表面']],
    motions: [['计费开关', 150, 'ease-out', 'slide', '滑块位移 18px'], ['文字进入', 700, 'cubic-bezier(.16,1,.3,1)', 'reveal', '淡入与上移']],
    do: ['保留绿色渐变与顶部高光。', '按钮和卡片保留 Squircle。', '剧本标题保留原字体声明。'],
    avoid: ['不要把 Squircle 换成同半径的 round。', '不要漏掉材质按钮的内部高光层。', '不要把演示行动接入登录或支付。'],
  },
  cromma: {
    name: 'Cromma', subtitle: '蓝色行动色，细致的浮雕边缘。',
    description: '中性表面承载蓝色强调按钮。标签的多层边缘与高光构成细致的浮雕材质。',
    colors: [
      ['强调色', 'primary', '主色', 'oklch(58% .2 262)', '强调按钮与焦点'],
      ['表面', 'background', '页面', 'oklch(95.51% 0 0)', '来源页面背景'], ['表面', 'panel', '面板', 'oklch(97.02% 0 0)', '内容面板'], ['表面', 'card', '卡片', 'oklch(99.2% 0 0)', '卡片与弹出表面'],
      ['文字', 'foreground', '主要文字', 'oklch(32.11% 0 0)', '标题与正文'], ['文字', 'muted-foreground', '说明文字', 'oklch(51.03% 0 0)', '辅助说明'], ['边界', 'border', '边界', 'oklch(91% 0 0)', '内容与控件边缘'],
      ['强调色', 'primary-foreground', '行动文字', 'oklch(100% 0 0)', '蓝色行动按钮上的文字'], ['表面', 'input', '输入表面', 'oklch(98.5% 0 0)', '源 CSS 的输入角色'],
      ['反馈状态', 'destructive', '错误红', 'oklch(55.94% .19 25.8625)', '源 CSS 的错误角色'], ['反馈状态', 'success', '成功绿', 'oklch(64% .17 150)', '源 CSS 的成功角色'], ['反馈状态', 'warning', '警告黄', 'oklch(76.9% .17 70)', '源 CSS 的警告角色'], ['反馈状态', 'info', '信息蓝', 'oklch(62.3% .188 260)', '源 CSS 的信息角色'],
    ],
    typeNote: '取自本地预览：进入标题、预览正文和标签按钮。',
    types: [['进入标题', 44, 500, 1.375, '-.025em', 'source'], ['预览正文', 16, 400, 1.5, 'normal', 'source'], ['标签按钮', 14, 500, 1.5, 'normal', 'source']],
    fonts: [['界面正文', 'Montserrat', '沿用已提取的本地预览字体。中文使用系统回退。']],
    spacing: [['菜单偏移', 6], ['输入内距', 12], ['标签内距', 16], ['FAQ 垂直内距', 20]],
    shapes: [['菜单行', 12, 'squircle'], ['标签按钮', 16, 'squircle'], ['语言面板', 16, 'squircle']],
    material: [['浮雕标签', 'button-cromma-tag', '渐变暗边、细线与多层 inset 高光'], ['强调按钮', 'button-cromma-primary', '蓝色填充、ring 与轻阴影']],
    motions: [['文字进入', 420, 'cubic-bezier(.2,.7,.2,1)', 'reveal', '淡入与上移 14px'], ['云形变换', 1800, 'cubic-bezier(.32,.72,0,1)', 'morph', '缓动节奏示意；原云形见组件详情']],
    do: ['保留 OKLCH 原始值。', '保留浮雕标签的多层内部边缘。', '文字进入保留 14px 起始偏移。'],
    avoid: ['不要用单层阴影替代浮雕材质。', '不要让点阵与云层在离屏时继续运行。', '不要将示意形变视为原始云层。'],
  },
};

export function getSystem(value, root = document.documentElement, readToken = token => getComputedStyle(root).getPropertyValue(`--${token}`).trim()) {
  const id = systemId(value), definition = systems[id];
  const colors = id === 'atlas' ? shellColors.map(([group, token, name, purpose]) => [group, token, name, readToken(token), purpose]) : definition.colors;
  return enrichSystem({ ...definition, id, colors, theme: id === 'atlas' ? root.dataset.theme : 'light' });
}
