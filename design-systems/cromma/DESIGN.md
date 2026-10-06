---
name: 'Cromma'
theme: 'light'
colors:
  primary: '#3271ee'
  surface: '#f0f0f0'
  surface-container: '#f5f5f5'
  surface-container-high: '#fcfcfc'
  on-surface: '#333333'
  on-surface-variant: '#666666'
  outline: '#e1e1e1'
  on-primary: '#ffffff'
  input: '#fafafa'
  error: '#cc3333'
  success: '#17a750'
  warning: '#f79d00'
  info: '#3c82f6'
typography:
  display-lg:
    name: '进入标题'
    fontFamily: 'Montserrat'
    fontSize: '44px'
    fontWeight: '500'
    lineHeight: '60.5px'
    letterSpacing: '-.025em'
  body-base:
    name: '预览正文'
    fontFamily: 'Montserrat'
    fontSize: '16px'
    fontWeight: '400'
    lineHeight: '24px'
    letterSpacing: 'normal'
  label-action:
    name: '标签按钮'
    fontFamily: 'Montserrat'
    fontSize: '14px'
    fontWeight: '500'
    lineHeight: '21px'
    letterSpacing: 'normal'
rounded:
  shape-1: '12px'
  shape-2: '16px'
  shape-3: '16px'
spacing:
  space-6: '6px'
  space-12: '12px'
  space-16: '16px'
  space-20: '20px'
---

# Design System: Cromma

主题：浅色。范围：本地已提取组件。

本文按 Google Stitch 的源码提取文档流程组织。未连接 Stitch 项目，因此不填写 Project ID。
## 1. Visual Theme & Atmosphere

浅灰画布与接近白色的卡片构成平静底色。蓝色用于主要行动，浮雕标签通过细暗边和内部高光产生触感。文字与材质都保持清楚的层次。

紧凑按钮、清楚的标签和适中的表单内距。

中性表面承载蓝色强调按钮。标签的多层边缘与高光构成细致的浮雕材质。

## 2. Color Palette & Roles

颜色按用途分组。YAML 使用 8 位 sRGB 十六进制近似值。正文保留原始颜色表达，OKLCH 与 sRGB 近似值不能互相覆盖。

| 分组 | 颜色名称 | 源令牌 | 原始值 | sRGB HEX | 用途 |
| --- | --- | --- | --- | --- | --- |
| 强调色 | 主色 | primary | oklch(58% .2 262) | #3271ee | 强调按钮与焦点 |
| 表面 | 页面 | background | oklch(95.51% 0 0) | #f0f0f0 | 来源页面背景 |
| 表面 | 面板 | panel | oklch(97.02% 0 0) | #f5f5f5 | 内容面板 |
| 表面 | 卡片 | card | oklch(99.2% 0 0) | #fcfcfc | 卡片与弹出表面 |
| 文字 | 主要文字 | foreground | oklch(32.11% 0 0) | #333333 | 标题与正文 |
| 文字 | 说明文字 | muted-foreground | oklch(51.03% 0 0) | #666666 | 辅助说明 |
| 边界 | 边界 | border | oklch(91% 0 0) | #e1e1e1 | 内容与控件边缘 |
| 强调色 | 行动文字 | primary-foreground | oklch(100% 0 0) | #ffffff | 蓝色行动按钮上的文字 |
| 表面 | 输入表面 | input | oklch(98.5% 0 0) | #fafafa | 源 CSS 的输入角色 |
| 反馈状态 | 错误红 | destructive | oklch(55.94% .19 25.8625) | #cc3333 | 源 CSS 的错误角色 |
| 反馈状态 | 成功绿 | success | oklch(64% .17 150) | #17a750 | 源 CSS 的成功角色 |
| 反馈状态 | 警告黄 | warning | oklch(76.9% .17 70) | #f79d00 | 源 CSS 的警告角色 |
| 反馈状态 | 信息蓝 | info | oklch(62.3% .188 260) | #3c82f6 | 源 CSS 的信息角色 |

### 文字与表面对比

| 颜色配对 | 前景 | 背景 | sRGB 对比度 |
| --- | --- | --- | --- |
| 正文 / 页面 | oklch(32.11% 0 0) | oklch(95.51% 0 0) | 11.09:1 |
| 行动文字 / 主色 | oklch(100% 0 0) | oklch(58% .2 262) | 4.44:1 |
| 说明 / 页面 | oklch(51.03% 0 0) | oklch(95.51% 0 0) | 5.04:1 |

透明叠层、图片背景与真实渲染需要单独检查；上述数值不代表所有状态都通过可访问性评审。

## 3. Typography Rules

取自本地预览：进入标题、预览正文和标签按钮。

| 角色 | 字体 | 字号 | 字重 | 行高 | 字距 |
| --- | --- | --- | --- | --- | --- |
| 进入标题 | Montserrat / Microsoft YaHei | 44px | 500 | 60.5px | -.025em |
| 预览正文 | Montserrat / Microsoft YaHei | 16px | 400 | 24px | normal |
| 标签按钮 | Montserrat / Microsoft YaHei | 14px | 500 | 21px | normal |

- 界面正文：Montserrat。沿用已提取的本地预览字体。中文使用系统回退。

标题保持紧凑的视觉节奏。正文保留足够行高。中英文回退字体需单独核对。

## 4. Component Stylings

### 浮雕标签

32px 高、14px 字号、500 字重。16px Squircle 配多层 inset 高光、0.5px 细边缘和轻投影。hover 叠层与文字层分开。

### 强调按钮

30px 高。蓝色填充配外部 ring 与轻阴影。颜色和缩放使用来源的 200ms 过渡。

### 语言菜单

176px 宽，6px 偏移。面板为 16px Squircle，选项为 12px 圆角。短窗口限制高度并保留所有选项。

### 输入与手风琴

输入保持 16px / 12px 内距与明确焦点。FAQ 使用 20px 16px 内距，300ms 高度、透明度与图标过渡；最多展开一项。

### 形状与表面

| 组件角色 | 半径 | 轮廓 |
| --- | --- | --- |
| 菜单行 | 12px | squircle |
| 标签按钮 | 16px | squircle |
| 语言面板 | 16px | squircle |

| 层次 | 源令牌 | 呈现规则 |
| --- | --- | --- |
| 页面 | background | 中性的浅灰画布 |
| 面板 | panel | 浅灰内容区域 |
| 卡片 / 菜单 | card | 接近白色的抬起表面 |

### 交互状态

| 状态 | 呈现规则 |
| --- | --- |
| 静止 | 标签保留渐变暗边、细线与多层 inset 高光 |
| 悬浮 | 标签叠加 hover 层；强调按钮沿用来源缩放 |
| 按下 | 强调按钮缩小；标签改变高光与边缘 |
| 键盘焦点 | 来源 primary/40 ring；状态不只依赖色值 |
| 禁用 | 本地材质样张未提取禁用态，不推断透明度 |

### 动效与减少动态效果

| 动效 | 时长 | 缓动 | 规则 |
| --- | --- | --- | --- |
| 文字进入 | 420ms | cubic-bezier(.2,.7,.2,1) | 淡入与上移 14px |
| 云形变换 | 1800ms | cubic-bezier(.32,.72,0,1) | 缓动节奏示意；原云形见组件详情 |

减少动态效果时直接呈现最终状态。离屏与隐藏预览暂停。页面退出释放动画和观察器。云形样张只演示缓动节奏。

### 已收录组件的关键规范

#### 材质按钮 / Tactile Button

通过内嵌高光、细边缘与渐变填充，给小尺寸按钮一个清楚的触感。

变体：浮雕标签、蓝色强调。

适用：适合工具栏、轻量操作和主要行动。强调变体只分配给当前最重要的动作。

注意：高光依赖多层 inset 阴影；不要只复制底色。Squircle 与圆形圆角的轮廓不同。

| 参数 | 值 |
| --- | --- |
| Cromma 标签高度 | 32px |
| Cromma 强调高度 | 30px |
| 圆角形状 | squircle |
| 颜色 / 阴影过渡 | 200ms |

#### 语言菜单 / Language Menu

紧凑触发器配右对齐的选项层，两套语言密度与按钮材质。

变体：文字列表 · 6 种。

适用：适合多语言切换或少量全局选项。打开后支持方向键、Home / End 和 Escape。

注意：此处选择只更新语言短码，不翻译图鉴或示例正文。短窗口内面板滚动，保留所有选项。

| 参数 | 值 |
| --- | --- |
| 面板宽度 | Laper 128px / Cromma 176px |
| 触发器与面板间距 | Laper 4px / Cromma 6px |
| 面板圆角 | 12px / 16px squircle |
| 菜单行圆角 | 8px / 12px |

#### 提示词输入框 / Prompt Composer

多行输入与发送动作，收在同一个带高光的输入表面里。

变体：Cromma 输入表面。

适用：适合自然语言入口。Enter 提交，Shift + Enter 换行，输入法组合期间不提交。

注意：这是本地交互演示，没有模型请求。附件与分享范围入口已移除，保留文本输入和发送。

| 参数 | 值 |
| --- | --- |
| 输入字号 | 16–18px |
| 行数 | 3 |
| 输入表面内边距 | 16px / 12px |
| 空输入反馈 | 500ms shake |
| 请求范围 | 浏览器内，无网络提交 |

#### 互斥手风琴 / Exclusive Accordion

以展开内容和加号旋转表达状态，同一时间最多展开一项。

变体：FAQ · 单项展开。

适用：适合 FAQ 和可选阅读的说明。点击当前项可全部收起，键盘 Enter / Space 可切换。

注意：不要把必须立即阅读的内容藏在折叠层。答案位于原按钮内，复用时如有链接应重构为独立区域。

| 参数 | 值 |
| --- | --- |
| 过渡 | 300ms |
| 缓动 | ease-drawer |
| 展开图标 | rotate(45deg) |
| 组件内边距 | 20px 16px |
| 展开策略 | 最多 1 项，可全部收起 |

#### 定价卡片 / Pricing Card

两种套餐信息的排布方式：清楚的文字层级，配合轻薄或浮雕材质表面。

变体：Plus · 浮雕表面。

适用：对比套餐价格、额度与适用范围。预览保留原实验内容，仅作为布局样本。

注意：价格来自已有实验快照，不代表供应商当前售价。演示按钮给出本地反馈，不进入支付。

| 参数 | 值 |
| --- | --- |
| 样例宽度 | 最大 360px |
| Cromma 材质 | cromma-edge |
| 布局 | 纵向排列 |
| 行动 | 本地点击反馈 |

#### 极光色场 / Aurora Wash

旋转的锥形色场、横移光带和漂移光束，叠在淡出的点状网格上。

变体：蓝色极光。

适用：适合大面积的展示背景。保留足够的纯色区域，给前景文字留出阅读对比。

注意：这是图鉴研究对象，不是图鉴外壳装饰。模糊层范围大，应在父级裁掉横向溢出。

| 参数 | 值 |
| --- | --- |
| 主色场旋转 | 12s linear |
| 横移光带 | 4s alternate |
| 光束漂移 | 6.5–9.5s |
| 色场滤镜 | blur(56px) saturate(1.35) |
| 点网格 | 10 × 10px |

#### 分形点阵 / Fractal Dot Field

Newton 迭代场决定点的大小与透明度，同一着色器生成静态纹理和动态流动。

变体：静态 · 定价背景、动态 · 天蓝色。

适用：适合内容面板底部或低透明度的背景。切换变体查看同一机制的两种使用方式。

注意：需要 WebGL。点阵不是 CSS radial-gradient；DPR、alpha 混合和 mask 都会改变画面。

| 参数 | 值 |
| --- | --- |
| 单元尺寸 | 6px |
| Newton 迭代 | 26 次 |
| 初始时间 | 8 |
| DPR | min(devicePixelRatio, 2) |
| 动态帧率 | 最多 24fps |

#### 变形云层 / Morphing Cloud

由相互融合的圆形场构成柔软云层，保留原有形变、漂移和扫光。

变体：Hero · 有阴影、页脚 · 漂移云层。

适用：适合展示页的衔接层。点击预览里的变换按钮，查看完整形变过程。

注意：需要 WebGL。DPR 固定 0.75，低分辨率是原实现的一部分。页脚云层提高到 0.4 透明度以便单独观察。

| 参数 | 值 |
| --- | --- |
| 云层 DPR | 0.75 |
| Hero 阴影 | 0.24 |
| 页脚换形周期 | 8000ms |
| 点击形变 | 1800ms |
| 形变缓动 | cubic-bezier(.32,.72,0,1) |

#### 淡入上移 / Fade & Rise

从轻微向下的位置进入，在清晰度与位置变化中建立阅读顺序。

变体：Cromma · 14px 上移。

适用：适合区块标题的入场。预览提供重播，便于看完整过程和反复比较。

注意：这里用重播替代滚动触发，便于独立观察；原 Cromma 使用 IntersectionObserver，threshold 0.12。

| 参数 | 值 |
| --- | --- |
| Cromma 起始偏移 | 14px |
| Cromma 观察阈值 | 0.12 |
| 减少动态效果 | 直接显示 |

#### 材质提示条 / Material Toast

浮雕表面、淡出的点阵纹理与倒计时圆环，组合成可关闭的短提示。

变体：Cromma · 倒计时提示。

适用：适合短暂、非阻塞的操作反馈。点击显示，5 秒后退出，也可以手动关闭；重复点击会替换当前提示。

注意：提示文本是本地演示。重要错误或需要用户操作的内容，不应在 5 秒后自动消失。

| 参数 | 值 |
| --- | --- |
| 停留时间 | 5000ms |
| 进出过渡 | 500ms |
| 倒计时圆环 | 半径 17px / 周长 106.814px |
| 点阵染色 | var(--info) |
| 并发策略 | 单条替换 |


## 5. Layout Principles

这里只提取了组件布局。原站页面网格、最大宽度与移动断点未采集。生成整页前先确认这些参数。

| 布局角色 | 值 |
| --- | --- |
| 定价样张最大宽度 | 360px；图鉴适配值 |
| 标签水平内距 | 16px |
| 输入表面内距 | 16px / 12px |
| FAQ 内距 | 20px 16px |
| 语言面板宽度 | 176px |
| 菜单触发偏移 | 6px |

### 留白与间距

| 用途 | 长度 |
| --- | --- |
| 菜单偏移 | 6px |
| 输入内距 | 12px |
| 标签内距 | 16px |
| FAQ 垂直内距 | 20px |

保持文字、参数和动作沿共同对齐线排列。不要通过缩小文字或隐藏关键内容消除溢出。

## 6. Design System Notes for Stitch Generation

### 风格语言

浅灰画布与接近白色的卡片构成平静底色。蓝色用于主要行动，浮雕标签通过细暗边和内部高光产生触感。文字与材质都保持清楚的层次。

### 示例生成提示

1. 生成一个工具栏。使用浅灰画布、蓝色主行动与接近白色的浮雕标签。保留细暗边、内部高光和连续转角。
2. 生成一个 FAQ 区块。文字左对齐，行内距 20px 16px，展开过程轻缓。只展开一项，并提供清楚的键盘焦点。

### 增量调整

- 保留 OKLCH 原始值。
- 保留浮雕标签的多层内部边缘。
- 文字进入保留 14px 起始偏移。

### 避免使用

- 不要用单层阴影替代浮雕材质。
- 不要让点阵与云层在离屏时继续运行。
- 不要将示意形变视为原始云层。

先生成一个静态页面，再核对文字层级、表面、轮廓和状态。每轮只调整一个明确维度。未采集的页面布局与状态应先确认，不能补成来源事实。

### 来源与许可

本地依据：styles.css、ui/system-data.js、ui/system-details.js、data.js 与 runtime/ 来源样式。组件来源记录见 provenance.json。外壳字体采用 OFL 1.1。来源素材仍按个人学习范围使用，接入产品前核实许可。

[Google Stitch 文档约定](https://github.com/google-labs-code/stitch-skills/blob/main/plugins/stitch-design/skills/extract-design-md/SKILL.md)
