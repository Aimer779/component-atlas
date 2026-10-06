---
name: '图鉴外壳'
theme: 'light'
colors:
  primary: '#386332'
  surface: '#fafbfa'
  surface-container-high: '#ffffff'
  surface-container: '#f5f7f5'
  surface-hover: '#f0f2f0'
  surface-code: '#f4f6f3'
  on-surface: '#202620'
  on-surface-variant: '#454f47'
  muted: '#657067'
  outline: '#dce2dc'
  outline-variant: '#e7ebe6'
  line-hover: '#b5c0b6'
typography:
  display-lg:
    name: '页面标题'
    fontFamily: 'Inter'
    fontSize: '44px'
    fontWeight: '650'
    lineHeight: '55px'
    letterSpacing: '-.025em'
  title-section:
    name: '章节标题'
    fontFamily: 'Inter'
    fontSize: '19px'
    fontWeight: '500'
    lineHeight: '32.3px'
    letterSpacing: '0'
  body-base:
    name: '说明正文'
    fontFamily: 'Inter'
    fontSize: '14px'
    fontWeight: '400'
    lineHeight: '25.9px'
    letterSpacing: '0'
  label-nav:
    name: '导航'
    fontFamily: 'Inter'
    fontSize: '13px'
    fontWeight: '400'
    lineHeight: '22.1px'
    letterSpacing: '0'
  code:
    name: '代码与参数'
    fontFamily: 'JetBrains Mono'
    fontSize: '13px'
    fontWeight: '400'
    lineHeight: '22.75px'
    letterSpacing: '0'
rounded:
  shape-1: '9px'
  shape-2: '12px'
  shape-3: '16px'
spacing:
  space-4: '4px'
  space-8: '8px'
  space-12: '12px'
  space-16: '16px'
  space-24: '24px'
  space-32: '32px'
  space-48: '48px'
---

# Design System: 图鉴外壳

主题：浅色。范围：组件图鉴外壳。

本文按 Google Stitch 的源码提取文档流程组织。未连接 Stitch 项目，因此不填写 Project ID。
## 1. Visual Theme & Atmosphere

以低彩度表面承载不同来源的组件。强调色只用于选择、悬浮标题与键盘焦点。章节留白建立阅读节奏，细边缘区分表面层次。

桌面查阅密度。组件识别与参数阅读优先。

绿色强调色标记当前选择。中英文字体各自承担阅读，参数使用等宽字体。

## 2. Color Palette & Roles

颜色按用途分组。YAML 使用 8 位 sRGB 十六进制近似值。正文保留原始颜色表达，OKLCH 与 sRGB 近似值不能互相覆盖。

| 分组 | 颜色名称 | 源令牌 | 原始值 | sRGB HEX | 用途 |
| --- | --- | --- | --- | --- | --- |
| 强调色 | 选中 / 焦点 | accent | #386332 | #386332 | 当前导航与键盘焦点 |
| 表面 | 页面 | surface | #fafbfa | #fafbfa | 页面、顶栏与目录 |
| 表面 | 抬起表面 | surface-raised | #ffffff | #ffffff | 卡片与选中控件 |
| 表面 | 控件表面 | surface-panel | #f5f7f5 | #f5f7f5 | 分段控件与参数区 |
| 表面 | 悬浮表面 | surface-hover | #f0f2f0 | #f0f2f0 | 可操作区域的悬浮反馈 |
| 表面 | 源码表面 | surface-code | #f4f6f3 | #f4f6f3 | 代码阅读区域 |
| 文字 | 主要文字 | text | #202620 | #202620 | 标题与主要信息 |
| 文字 | 次级文字 | secondary | #454f47 | #454f47 | 参数与辅助标题 |
| 文字 | 说明文字 | muted | #657067 | #657067 | 说明与次要信息 |
| 边界 | 内容边界 | line | #dce2dc | #dce2dc | 内容分隔与控件边缘 |
| 边界 | 轻边界 | line-soft | #e7ebe6 | #e7ebe6 | 静止卡片与章节分隔 |
| 边界 | 悬浮边界 | line-hover | #b5c0b6 | #b5c0b6 | 悬浮控件的清楚边缘 |

### 文字与表面对比

| 颜色配对 | 前景 | 背景 | sRGB 对比度 |
| --- | --- | --- | --- |
| 正文 / 页面 | #202620 | #fafbfa | 14.89:1 |
| 说明 / 页面 | #657067 | #fafbfa | 4.98:1 |
| 焦点 / 页面 | #386332 | #fafbfa | 6.75:1 |

透明叠层、图片背景与真实渲染需要单独检查；上述数值不代表所有状态都通过可访问性评审。

## 3. Typography Rules

外壳的实际层级；不强行套用等比字阶。

| 角色 | 字体 | 字号 | 字重 | 行高 | 字距 |
| --- | --- | --- | --- | --- | --- |
| 页面标题 | Inter / Noto Sans SC | 44px | 650 | 55px | -.025em |
| 章节标题 | Inter / Noto Sans SC | 19px | 500 | 32.3px | 0 |
| 说明正文 | Inter / Noto Sans SC | 14px | 400 | 25.9px | 0 |
| 导航 | Inter / Noto Sans SC | 13px | 400 | 22.1px | 0 |
| 代码与参数 | JetBrains Mono / Noto Sans SC | 13px | 400 | 22.75px | 0 |

- 中英正文：Inter + Noto Sans SC。本地 OFL 1.1 字体；免费，允许非商业使用。
- 代码与参数：JetBrains Mono。本地 OFL 1.1 字体；中文沿用 Noto Sans SC。

标题保持紧凑的视觉节奏。正文保留足够行高。中英文回退字体需单独核对。

## 4. Component Stylings

### 按钮与复制

36px 高，9px 普通圆角。细边框与顶部高光区分点击区域。复制成功原位显示已复制，1800ms 后恢复。

### 组件卡片

外圆角 16px，预览圆角 12px，内距 6px。悬浮提高边缘对比，按下缩放至 0.985。整张卡片是原生链接。

### 导航与下拉

导航 13px。分组标签 12px / 650。下拉高 36px，菜单圆角 10px，选项高 30px，菜单偏移 6px。

### 源码容器

13px 等宽字体，行高 1.75。源码文件名 12px。代码区保留横向滚动，中文使用 Noto Sans SC。

### 形状与表面

| 组件角色 | 半径 | 轮廓 |
| --- | --- | --- |
| 控件 | 9px | round |
| 内嵌预览 | 12px | round |
| 索引卡片 | 16px | round |

| 层次 | 源令牌 | 呈现规则 |
| --- | --- | --- |
| 页面 | surface | 平静的基础画布 |
| 控件 | surface-panel | 细边缘与顶部高光 |
| 卡片 / 选中控件 | surface-raised | 抬起表面；悬浮时加深边缘 |

### 交互状态

| 状态 | 呈现规则 |
| --- | --- |
| 静止 | 中性表面、细边缘与明确文字 |
| 悬浮 | 提高表面与边缘对比；标题使用强调色 |
| 按下 | 按钮轻微缩小；保持文字层清楚 |
| 键盘焦点 | 2px 强调色轮廓；不只通过颜色标记选择 |
| 禁用 / 读取中 | 真实 disabled；复制内容可用后才启用 |

### 动效与减少动态效果

| 动效 | 时长 | 缓动 | 规则 |
| --- | --- | --- | --- |
| 控件反馈 | 200ms | cubic-bezier(.23,1,.32,1) | 缩放与表面反馈 |
| 主题铺开 | 520ms | cubic-bezier(.4,0,.2,1) | 右上角向左下角揭示 |

减少动态效果时直接呈现最终状态。离屏与隐藏预览暂停。页面退出释放动画和观察器。云形样张只演示缓动节奏。

## 5. Layout Principles

桌面优先。当前没有手机抽屉与触屏布局。新增页面沿用顶栏与正文的共同对齐线。

| 布局角色 | 值 |
| --- | --- |
| 内容最大宽度 | 1140px |
| 顶栏高度 | 72px |
| 侧栏区域 | 268px；1180px 以下为 244px |
| 常规内容边距 | 44px |
| 窄桌面边距 | 30px |
| 1600px 起的内容边距 | 64px |
| 目录与窗口边缘 | 16px |
| 总览网格 | 3 列 / 18px 间距；1180px 以下 2 列 / 16px |
| 样张章节间距 | 48px；章节内距 32px |

### 留白与间距

| 用途 | 长度 |
| --- | --- |
| 控件内距 | 4px |
| 图标间距 | 8px |
| 控件分隔 | 12px |
| 目录外距 | 16px |
| 信息分组 | 24px |
| 内容分组 | 32px |
| 大段留白 | 48px |

保持文字、参数和动作沿共同对齐线排列。不要通过缩小文字或隐藏关键内容消除溢出。

## 6. Design System Notes for Stitch Generation

### 风格语言

以低彩度表面承载不同来源的组件。强调色只用于选择、悬浮标题与键盘焦点。章节留白建立阅读节奏，细边缘区分表面层次。

### 示例生成提示

1. 生成一个桌面组件索引。保留低彩度画布、三列预览和细边缘。中英文正文分别使用 Inter 与 Noto Sans SC。
2. 生成一个组件详情。预览与代码共用工作台，操作控件高 36px，焦点轮廓清楚。

### 增量调整

- 强调色用于选择与焦点。
- 相同功能使用相同控件变体。
- 中英文与参数保持清楚的阅读层级。

### 避免使用

- 不要用颜色作为唯一状态提示。
- 不要将来源组件统一改成外壳样式。
- 不要让非可见预览持续运行。

先生成一个静态页面，再核对文字层级、表面、轮廓和状态。每轮只调整一个明确维度。未采集的页面布局与状态应先确认，不能补成来源事实。

### 来源与许可

本地依据：styles.css、ui/system-data.js、ui/system-details.js、data.js 与 runtime/ 来源样式。组件来源记录见 provenance.json。外壳字体采用 OFL 1.1。来源素材仍按个人学习范围使用，接入产品前核实许可。

[Google Stitch 文档约定](https://github.com/google-labs-code/stitch-skills/blob/main/plugins/stitch-design/skills/extract-design-md/SKILL.md)
