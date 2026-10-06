---
name: 'Laper'
theme: 'light'
colors:
  primary: '#1a4a35'
  tech-green: '#0fa958'
  surface: '#fcfdfc'
  surface-container: '#f8faf9'
  surface-container-high: '#ffffff'
  on-surface: '#171a19'
  on-surface-variant: '#6b7370'
  outline: '#e4e8e6'
  on-primary: '#ffffff'
  tech-green-dark: '#2d6a4f'
  muted: '#f4f6f5'
  input: '#ffffff'
  error: '#dc2626'
  success: '#1a4a35'
  warning: '#f59e0b'
  info: '#3b82f6'
typography:
  display-lg:
    name: '剧本标题'
    fontFamily: 'Courier New'
    fontSize: '44px'
    fontWeight: '300'
    lineHeight: '49.28px'
    letterSpacing: 'normal'
  body-base:
    name: '预览正文'
    fontFamily: 'Montserrat'
    fontSize: '16px'
    fontWeight: '400'
    lineHeight: '24px'
    letterSpacing: 'normal'
  label-action:
    name: '行动按钮'
    fontFamily: 'Montserrat'
    fontSize: '12px'
    fontWeight: '500'
    lineHeight: '17.143px'
    letterSpacing: 'normal'
rounded:
  shape-1: '12px'
  shape-2: '24px'
  shape-3: '24px'
spacing:
  space-4: '4px'
  space-12: '12px'
  space-16: '16px'
  space-24: '24px'
---

# Design System: Laper

主题：浅色。范围：本地已提取组件。

本文按 Google Stitch 的源码提取文档流程组织。未连接 Stitch 项目，因此不填写 Project ID。
## 1. Visual Theme & Atmosphere

接近白色的画布与轻薄表面形成安静的产品界面。深绿与技术绿集中在行动按钮和剧本标题。渐变、高光与细边缘营造克制的触感。

小尺寸行动按钮配较宽松的卡片内距。

绿色渐变与细高光用于行动按钮。剧本字体和轻薄卡片保留来源的表达。

## 2. Color Palette & Roles

颜色按用途分组。YAML 使用 8 位 sRGB 十六进制近似值。正文保留原始颜色表达，OKLCH 与 sRGB 近似值不能互相覆盖。

| 分组 | 颜色名称 | 源令牌 | 原始值 | sRGB HEX | 用途 |
| --- | --- | --- | --- | --- | --- |
| 强调色 | 主色 | primary | #1a4a35 | #1a4a35 | 行动按钮与年付开关 |
| 强调色 | 技术绿 | tech-green | #0fa958 | #0fa958 | 标题与按钮渐变 |
| 表面 | 页面 | background | #fcfdfc | #fcfdfc | 来源页面背景 |
| 表面 | 面板 | panel | #f8faf9 | #f8faf9 | 浅色内容面板 |
| 表面 | 卡片 | card | #ffffff | #ffffff | 定价与菜单表面 |
| 文字 | 主要文字 | foreground | #171a19 | #171a19 | 标题与正文 |
| 文字 | 说明文字 | muted-foreground | #6b7370 | #6b7370 | 辅助说明 |
| 边界 | 边界 | border | #e4e8e6 | #e4e8e6 | 卡片与控件边缘 |
| 强调色 | 行动文字 | primary-foreground | #ffffff | #ffffff | 深绿行动按钮上的文字 |
| 强调色 | 渐变中绿 | tech-green-dark | #2d6a4f | #2d6a4f | 绿色行动按钮的中间色 |
| 表面 | 低强调表面 | muted | #f4f6f5 | #f4f6f5 | 浅色 hover 与弱强调区域 |
| 表面 | 输入表面 | input | #ffffff | #ffffff | 源 CSS 的输入角色 |
| 反馈状态 | 错误红 | destructive | #dc2626 | #dc2626 | 源 CSS 的错误角色 |
| 反馈状态 | 成功绿 | success | #1a4a35 | #1a4a35 | 源 CSS 的成功角色 |
| 反馈状态 | 警告黄 | warning | #f59e0b | #f59e0b | 源 CSS 的警告角色 |
| 反馈状态 | 信息蓝 | info | #3b82f6 | #3b82f6 | 源 CSS 的信息角色 |

### 文字与表面对比

| 颜色配对 | 前景 | 背景 | sRGB 对比度 |
| --- | --- | --- | --- |
| 正文 / 页面 | #171a19 | #fcfdfc | 17.19:1 |
| 行动文字 / 主色 | #ffffff | #1a4a35 | 10.12:1 |
| 说明 / 页面 | #6b7370 | #fcfdfc | 4.78:1 |

透明叠层、图片背景与真实渲染需要单独检查；上述数值不代表所有状态都通过可访问性评审。

## 3. Typography Rules

取自本地预览：进入标题、预览正文和行动按钮。

| 角色 | 字体 | 字号 | 字重 | 行高 | 字距 |
| --- | --- | --- | --- | --- | --- |
| 剧本标题 | Courier New / 中文系统衬线字体 | 44px | 300 | 49.28px | normal |
| 预览正文 | Montserrat / Microsoft YaHei | 16px | 400 | 24px | normal |
| 行动按钮 | Montserrat / Microsoft YaHei | 12px | 500 | 17.143px | normal |

- 界面正文：Montserrat。沿用已提取的本地预览字体。中文使用系统回退。
- 剧本标题：Courier New。使用系统字体。字重为来源声明值。

标题保持紧凑的视觉节奏。正文保留足够行高。中英文回退字体需单独核对。

## 4. Component Stylings

### 行动按钮

28px 高、12px 字号、500 字重。24px Squircle 保持连续转角。渐变从深绿经过中绿至技术绿。顶部高光、ring 和文字层一起保留。

### 语言菜单

128px 宽，4px 偏移，12px Squircle。选项 8px 圆角。旗帜与文字对齐，关闭后恢复触发器焦点。

### 定价卡片

24px Squircle，细边缘与轻薄表面。标题、价格与额度分层；行动按钮位于卡片底部。

### 计费开关

36×18px 轨道，滑块位移 18px。年付使用深绿，150ms ease-out。价格与 aria-checked 同步更新。

### 形状与表面

| 组件角色 | 半径 | 轮廓 |
| --- | --- | --- |
| 菜单 | 12px | squircle |
| 行动按钮 | 24px | squircle |
| 定价卡片 | 24px | squircle |

| 层次 | 源令牌 | 呈现规则 |
| --- | --- | --- |
| 页面 | background | 接近白色的基础画布 |
| 面板 | panel | 浅灰绿色内容区域 |
| 卡片 / 菜单 | card | 轻薄表面、细边界与局部阴影 |

### 交互状态

| 状态 | 呈现规则 |
| --- | --- |
| 静止 | 深绿渐变、细 ring 与顶部高光 |
| 悬浮 | 顶部高光增强；描边按钮使用浅色强调表面 |
| 按下 | 沿用来源按钮的按压反馈 |
| 键盘焦点 | 来源 focus ring；菜单支持方向键 |
| 禁用 | 本地材质样张未提取禁用态，不推断透明度 |

### 动效与减少动态效果

| 动效 | 时长 | 缓动 | 规则 |
| --- | --- | --- | --- |
| 计费开关 | 150ms | ease-out | 滑块位移 18px |
| 文字进入 | 700ms | cubic-bezier(.16,1,.3,1) | 淡入与上移 |

减少动态效果时直接呈现最终状态。离屏与隐藏预览暂停。页面退出释放动画和观察器。云形样张只演示缓动节奏。

### 已收录组件的关键规范

#### 材质按钮 / Tactile Button

通过内嵌高光、细边缘与渐变填充，给小尺寸按钮一个清楚的触感。

变体：绿色强调、描边按钮。

适用：适合工具栏、轻量操作和主要行动。强调变体只分配给当前最重要的动作。

注意：高光依赖多层 inset 阴影；不要只复制底色。Squircle 与圆形圆角的轮廓不同。

| 参数 | 值 |
| --- | --- |
| Laper 强调高度 | 28px |
| 圆角形状 | squircle |
| 颜色 / 阴影过渡 | 200ms |

#### 语言菜单 / Language Menu

紧凑触发器配右对齐的选项层，两套语言密度与按钮材质。

变体：旗帜列表 · 16 种。

适用：适合多语言切换或少量全局选项。打开后支持方向键、Home / End 和 Escape。

注意：此处选择只更新语言短码，不翻译图鉴或示例正文。短窗口内面板滚动，保留所有选项。

| 参数 | 值 |
| --- | --- |
| 面板宽度 | Laper 128px / Cromma 176px |
| 触发器与面板间距 | Laper 4px / Cromma 6px |
| 面板圆角 | 12px / 16px squircle |
| 菜单行圆角 | 8px / 12px |
| Laper 旗帜 | 16px |

#### 计费开关 / Billing Switch

一个细小的方圆开关，联动年价、月均价与折扣说明。

变体：月付 / 年付。

适用：适合有两个明确选项且切换立即生效的偏好设置。这里演示 Senior 套餐联动。

注意：年付主价是全年金额，不能把月均价当成年价。开关标签应同时解释切换的结果。

| 参数 | 值 |
| --- | --- |
| 轨道 | 36 × 18px |
| 滑块位移 | 18px |
| 运动 | 150ms ease-out |
| 年付颜色 | #1a4a35 |
| 年付 / 月付 | $192 / $20 |

#### 定价卡片 / Pricing Card

两种套餐信息的排布方式：清楚的文字层级，配合轻薄或浮雕材质表面。

变体：Senior · 轻薄表面。

适用：对比套餐价格、额度与适用范围。预览保留原实验内容，仅作为布局样本。

注意：价格来自已有实验快照，不代表供应商当前售价。演示按钮给出本地反馈，不进入支付。

| 参数 | 值 |
| --- | --- |
| 样例宽度 | 最大 360px |
| Laper 圆角 | 24px squircle |
| 布局 | 纵向排列 |
| 行动 | 本地点击反馈 |

#### 淡入上移 / Fade & Rise

从轻微向下的位置进入，在清晰度与位置变化中建立阅读顺序。

变体：Laper · 文字进入。

适用：适合区块标题的入场。预览提供重播，便于看完整过程和反复比较。

注意：这里用重播替代滚动触发，便于独立观察；原 Cromma 使用 IntersectionObserver，threshold 0.12。

| 参数 | 值 |
| --- | --- |
| Laper 过渡 | 700ms |
| Laper 缓动 | cubic-bezier(.16,1,.3,1) |
| 减少动态效果 | 直接显示 |

#### 共享元素弹层 / Shared Element Viewer

从缩略卡片的原位置展开到中央，关闭时沿同一条轨迹回到原处。

变体：Laper · 卡片展开。

适用：适合图片、视频或作品详情的连续查看。点卡片展开，用关闭按钮、遮罩或 Escape 返回。

注意：这里演示转场，使用已有本地编辑器样张，不加载原站视频。弹层位于预览内部，单独打开可看完整窗口效果。

| 参数 | 值 |
| --- | --- |
| 形变时长 | 400ms |
| 缓动 | cubic-bezier(.32,.72,0,1) |
| 展开边界 | 视口 80% |
| 展开圆角 | 32px squircle |
| 遮罩 | 背景 40% + blur(4px) |

#### 循环剧本带 / Script Reel

纸张样本持续横向循环，先缓慢加速，再以稳定速度穿过视口。

变体：Laper · 浮动纸张。

适用：适合作品样本和大面积视觉展示。预览提供暂停与继续；减少动态效果时保留静态纸张。

注意：循环内容只用于装饰性识别，关键内容应另有静态入口。示例取原前四份剧本，不复制完整 28 张轨道。

| 参数 | 值 |
| --- | --- |
| 加速阶段 | 3000ms / cubic |
| 巡航速度 | 63px/s（60fps 参考） |
| 纸张浮动 | 6.2s ease-in-out |
| 浮动错开 | 0.2s |
| 示例纸张宽度 | 240px |

#### 滚动弹簧放大 / Scroll Spring Scale

滚动位置改变目标比例，弹簧模型让产品画面平滑地跟上。

变体：Laper · 产品画面。

适用：适合产品展示区的轻微聚焦。滚动预览内部，或聚焦后按 Page Down / Page Up，反向滚动可观察回退。

注意：原页使用全页滚动；图鉴改用预览内滚动，以免影响目录浏览。减少动态效果时画面直接保持 1 倍。

| 参数 | 值 |
| --- | --- |
| 比例范围 | 0.96 → 1 |
| 刚度 / 阻尼 / 质量 | 420 / 35 / 0.7 |
| 积分步长 | ≤ 1/120s |
| 帧间隔上限 | 50ms |
| 滚动目标 | 预览内的产品展示区 |

#### 描边文字 / Outline Typography

空心大字配描边绘制，让页脚文字成为构图的一部分。

变体：Laper · 页脚描边。

适用：适合大尺寸的页脚或视觉标题。说明性正文仍应采用实心文字。

注意：保留原 text 元素；独立样例调整外框尺寸。字体使用已有本地 Montserrat，避免运行时外链。

| 参数 | 值 |
| --- | --- |
| SVG viewBox | 0 0 1120 260 |
| 原字号 | 246px |
| 描边 | 1.15px |
| 字距 | -13px |
| 绘制时长 | 1900ms + 180ms 延迟 |


## 5. Layout Principles

这里只提取了组件布局。原站页面网格、最大宽度与移动断点未采集。生成整页前先确认这些参数。

| 布局角色 | 值 |
| --- | --- |
| 定价样张最大宽度 | 360px；图鉴适配值 |
| 定价卡片水平内距 | 16px |
| 定价卡片顶部内距 | 24px |
| 行动按钮水平内距 | 12px |
| 语言面板宽度 | 128px |
| 菜单触发偏移 | 4px |

### 留白与间距

| 用途 | 长度 |
| --- | --- |
| 菜单偏移 | 4px |
| 按钮内距 | 12px |
| 定价卡片水平内距 | 16px |
| 定价卡片上内距 | 24px |

保持文字、参数和动作沿共同对齐线排列。不要通过缩小文字或隐藏关键内容消除溢出。

## 6. Design System Notes for Stitch Generation

### 风格语言

接近白色的画布与轻薄表面形成安静的产品界面。深绿与技术绿集中在行动按钮和剧本标题。渐变、高光与细边缘营造克制的触感。

### 示例生成提示

1. 生成一个定价卡片样张。使用接近白色的背景与绿色行动按钮。保留轻薄边缘、24px 连续转角和宽松内距。
2. 生成一个紧凑语言菜单。触发按钮高 28px，选项层宽 128px。保留轻高光、旗帜列与键盘选择。

### 增量调整

- 保留绿色渐变与顶部高光。
- 按钮和卡片保留 Squircle。
- 剧本标题保留原字体声明。

### 避免使用

- 不要把 Squircle 换成同半径的 round。
- 不要漏掉材质按钮的内部高光层。
- 不要把演示行动接入登录或支付。

先生成一个静态页面，再核对文字层级、表面、轮廓和状态。每轮只调整一个明确维度。未采集的页面布局与状态应先确认，不能补成来源事实。

### 来源与许可

本地依据：styles.css、ui/system-data.js、ui/system-details.js、data.js 与 runtime/ 来源样式。组件来源记录见 provenance.json。外壳字体采用 OFL 1.1。来源素材仍按个人学习范围使用，接入产品前核实许可。

[Google Stitch 文档约定](https://github.com/google-labs-code/stitch-skills/blob/main/plugins/stitch-design/skills/extract-design-md/SKILL.md)
