import { components } from '../data.js';
import { colorHex, contrastRatio } from './system-colors.js';

export const fontFamilies = {
  ui: 'Inter / Noto Sans SC', mono: 'JetBrains Mono / Noto Sans SC',
  source: 'Montserrat / Microsoft YaHei', screenplay: 'Courier New / 中文系统衬线字体',
};

const details = {
  atlas: {
    atmosphere: '以低彩度表面承载不同来源的组件。强调色只用于选择、悬浮标题与键盘焦点。章节留白建立阅读节奏，细边缘区分表面层次。',
    density: '桌面查阅密度。组件识别与参数阅读优先。',
    layout: [['内容最大宽度', '1140px'], ['顶栏高度', '72px'], ['侧栏区域', '268px；1180px 以下为 244px'], ['常规内容边距', '44px'], ['窄桌面边距', '30px'], ['1600px 起的内容边距', '64px'], ['目录与窗口边缘', '16px'], ['总览网格', '3 列 / 18px 间距；1180px 以下 2 列 / 16px'], ['样张章节间距', '48px；章节内距 32px']],
    layoutNote: '桌面优先。当前没有手机抽屉与触屏布局。新增页面沿用顶栏与正文的共同对齐线。',
    surfaces: [['页面', 'surface', '平静的基础画布'], ['控件', 'surface-panel', '细边缘与顶部高光'], ['卡片 / 选中控件', 'surface-raised', '抬起表面；悬浮时加深边缘']],
    states: [['静止', '中性表面、细边缘与明确文字'], ['悬浮', '提高表面与边缘对比；标题使用强调色'], ['按下', '按钮轻微缩小；保持文字层清楚'], ['键盘焦点', '2px 强调色轮廓；不只通过颜色标记选择'], ['禁用 / 读取中', '真实 disabled；复制内容可用后才启用']],
    componentRules: [
      ['按钮与复制', '36px 高，9px 普通圆角。细边框与顶部高光区分点击区域。复制成功原位显示已复制，1800ms 后恢复。'],
      ['组件卡片', '外圆角 16px，预览圆角 12px，内距 6px。悬浮提高边缘对比，按下缩放至 0.985。整张卡片是原生链接。'],
      ['导航与下拉', '导航 13px。分组标签 12px / 650。下拉高 36px，菜单圆角 10px，选项高 30px，菜单偏移 6px。'],
      ['源码容器', '13px 等宽字体，行高 1.75。源码文件名 12px。代码区保留横向滚动，中文使用 Noto Sans SC。'],
    ],
    prompts: ['生成一个桌面组件索引。保留低彩度画布、三列预览和细边缘。中英文正文分别使用 Inter 与 Noto Sans SC。', '生成一个组件详情。预览与代码共用工作台，操作控件高 36px，焦点轮廓清楚。'],
  },
  laper: {
    atmosphere: '接近白色的画布与轻薄表面形成安静的产品界面。深绿与技术绿集中在行动按钮和剧本标题。渐变、高光与细边缘营造克制的触感。',
    density: '小尺寸行动按钮配较宽松的卡片内距。',
    layout: [['定价样张最大宽度', '360px；图鉴适配值'], ['定价卡片水平内距', '16px'], ['定价卡片顶部内距', '24px'], ['行动按钮水平内距', '12px'], ['语言面板宽度', '128px'], ['菜单触发偏移', '4px']],
    layoutNote: '这里只提取了组件布局。原站页面网格、最大宽度与移动断点未采集。生成整页前先确认这些参数。',
    surfaces: [['页面', 'background', '接近白色的基础画布'], ['面板', 'panel', '浅灰绿色内容区域'], ['卡片 / 菜单', 'card', '轻薄表面、细边界与局部阴影']],
    states: [['静止', '深绿渐变、细 ring 与顶部高光'], ['悬浮', '顶部高光增强；描边按钮使用浅色强调表面'], ['按下', '沿用来源按钮的按压反馈'], ['键盘焦点', '来源 focus ring；菜单支持方向键'], ['禁用', '本地材质样张未提取禁用态，不推断透明度']],
    componentRules: [
      ['行动按钮', '28px 高、12px 字号、500 字重。24px Squircle 保持连续转角。渐变从深绿经过中绿至技术绿。顶部高光、ring 和文字层一起保留。'],
      ['语言菜单', '128px 宽，4px 偏移，12px Squircle。选项 8px 圆角。旗帜与文字对齐，关闭后恢复触发器焦点。'],
      ['定价卡片', '24px Squircle，细边缘与轻薄表面。标题、价格与额度分层；行动按钮位于卡片底部。'],
      ['计费开关', '36×18px 轨道，滑块位移 18px。年付使用深绿，150ms ease-out。价格与 aria-checked 同步更新。'],
    ],
    prompts: ['生成一个定价卡片样张。使用接近白色的背景与绿色行动按钮。保留轻薄边缘、24px 连续转角和宽松内距。', '生成一个紧凑语言菜单。触发按钮高 28px，选项层宽 128px。保留轻高光、旗帜列与键盘选择。'],
  },
  cromma: {
    atmosphere: '浅灰画布与接近白色的卡片构成平静底色。蓝色用于主要行动，浮雕标签通过细暗边和内部高光产生触感。文字与材质都保持清楚的层次。',
    density: '紧凑按钮、清楚的标签和适中的表单内距。',
    layout: [['定价样张最大宽度', '360px；图鉴适配值'], ['标签水平内距', '16px'], ['输入表面内距', '16px / 12px'], ['FAQ 内距', '20px 16px'], ['语言面板宽度', '176px'], ['菜单触发偏移', '6px']],
    layoutNote: '这里只提取了组件布局。原站页面网格、最大宽度与移动断点未采集。生成整页前先确认这些参数。',
    surfaces: [['页面', 'background', '中性的浅灰画布'], ['面板', 'panel', '浅灰内容区域'], ['卡片 / 菜单', 'card', '接近白色的抬起表面']],
    states: [['静止', '标签保留渐变暗边、细线与多层 inset 高光'], ['悬浮', '标签叠加 hover 层；强调按钮沿用来源缩放'], ['按下', '强调按钮缩小；标签改变高光与边缘'], ['键盘焦点', '来源 primary/40 ring；状态不只依赖色值'], ['禁用', '本地材质样张未提取禁用态，不推断透明度']],
    componentRules: [
      ['浮雕标签', '32px 高、14px 字号、500 字重。16px Squircle 配多层 inset 高光、0.5px 细边缘和轻投影。hover 叠层与文字层分开。'],
      ['强调按钮', '30px 高。蓝色填充配外部 ring 与轻阴影。颜色和缩放使用来源的 200ms 过渡。'],
      ['语言菜单', '176px 宽，6px 偏移。面板为 16px Squircle，选项为 12px 圆角。短窗口限制高度并保留所有选项。'],
      ['输入与手风琴', '输入保持 16px / 12px 内距与明确焦点。FAQ 使用 20px 16px 内距，300ms 高度、透明度与图标过渡；最多展开一项。'],
    ],
    prompts: ['生成一个工具栏。使用浅灰画布、蓝色主行动与接近白色的浮雕标签。保留细暗边、内部高光和连续转角。', '生成一个 FAQ 区块。文字左对齐，行内距 20px 16px，展开过程轻缓。只展开一项，并提供清楚的键盘焦点。'],
  },
};

export function enrichSystem(system) {
  const entry = details[system.id], colors = Object.fromEntries(system.colors.map(([, token, , value]) => [token, value]));
  const source = system.id !== 'atlas';
  const pairs = source ? [['正文 / 页面', 'foreground', 'background'], ['行动文字 / 主色', 'primary-foreground', 'primary'], ['说明 / 页面', 'muted-foreground', 'background']] : [['正文 / 页面', 'text', 'surface'], ['说明 / 页面', 'muted', 'surface'], ['焦点 / 页面', 'accent', 'surface']];
  const contrast = pairs.map(([name, foreground, background]) => ({ name, foreground: colors[foreground], background: colors[background], ratio: contrastRatio(colors[foreground], colors[background]) }));
  const catalog = source ? components.filter(item => item.variants.some(v => v.project.toLowerCase() === system.id)) : [];
  return { ...system, ...entry, contrast, catalog, colors: system.colors.map(row => [...row, colorHex(row[3])]) };
}
