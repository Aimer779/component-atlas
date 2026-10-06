# Component Atlas · 设计系统

第一版：2026-10-06。用于个人本地浏览、比较和学习已有复刻实验中的组件效果。

## 目标与组织

图鉴以「组件 → 变体 → 可操作预览 → 使用规范 → 来源」组织内容。组件总览帮助识别；详情页解释机制、尺寸和限制。目录中的近义效果共用一个组件族，不按来源重复建立分类。

采用四个当前有内容的类别：基础交互、内容展示、背景效果、文字与动效。新的实验可以进入这些类别；只在现有类别无法解释用途时再增加类别。

组织参考：

- [React Bits Index](https://reactbits.dev/get-started/index)：左侧组件目录、效果索引、预览与源码。
- [Material Design 3](https://m3.material.io/)：基础规范、样式、组件的分层组织。
- [Google Material Web Theming](https://github.com/material-components/material-web/blob/main/docs/theming/README.md)：reference → system → component 的令牌关系。

参考组织方式，不把两个来源统一重绘成 Material 组件。

## 视觉边界

图鉴外壳与示例拥有独立的样式上下文。示例放在独立 HTML iframe 内，保留原来源的颜色、形状和材质。图鉴外壳用低彩度深色衬托这些样例。图鉴不是新的品牌落地页，不用氛围渐变或装饰背景抢占内容。

| 外壳角色 | 值 | 用途 |
| --- | --- | --- |
| surface | `#101113` | 页面、顶栏、目录 |
| surface-raised | `#191b1e` | 索引卡片 |
| surface-hover | `#202226` | 悬浮表面 |
| line | `#2b2d31` | 组件边界与内容分隔 |
| text | `#eff0f1` | 主要标题与文字 |
| muted | `#95999f` | 正文说明 |
| accent | `#c9e99a` | 当前导航、选中分类、键盘焦点 |

强调色不能承担正文信息。状态通过 `aria-current`、`aria-selected`、`aria-expanded` 或 `aria-checked` 同时表达。

## 来源设计令牌

### Laper

| 语义角色 | 原值 |
| --- | --- |
| background | `#fcfdfc` |
| foreground | `#171a19` |
| primary / toggle-on | `#1a4a35` |
| tech-green | `#0fa958` |
| tech-green-dark | `#2d6a4f` |
| muted / accent | `#f4f6f5` |
| muted-foreground | `#6b7370` |
| border | `#e4e8e6` |

### Cromma

| 语义角色 | 原值 |
| --- | --- |
| background | `oklch(95.51% 0 0)` |
| foreground | `oklch(32.11% 0 0)` |
| primary | `oklch(58% .2 262)` |
| card | `oklch(99.2% 0 0)` |
| muted-foreground | `oklch(51.03% 0 0)` |
| border | `oklch(91% 0 0)` |
| panel | `oklch(97.02% 0 0)` |

不要把 RGB 十六进制和 OKLCH 值混写成「同一个来源令牌」。来源 CSS 包含 `color-mix` 派生角色，原值保存在 `snapshots/`。

### 三层关系

```css
:root {
  --background: #fcfdfc; /* 参考值分配给背景语义角色 */
  --primary: #1a4a35;    /* 参考值分配给主色语义角色 */
  --toggle-on: var(--primary); /* 组件角色引用语义角色 */
}
```

复用组件时先选主题，再决定组件变体；不要在第二个按钮上另造一套相近颜色、图标或阴影。

## 字体、布局与间距

| 层级 | 外壳规范 |
| --- | --- |
| 页面标题 | 38px / 600 / 1.3 |
| 卡片标题 | 14px / 500 |
| 内容标题 | 19px / 500 |
| 正文 | 12–14px / 1.7–1.95 |
| 导航 | 12px |
| 代码 | 12px / 1.75；Cascadia Code、Consolas、monospace |

外壳优先系统中文字体。预览沿用本地已有 Montserrat 可变字体，中文使用系统回退，剧本字体沿用 Courier。原 Laper 的完整字体组合未纳入第一版；这是已记录的差异。

间距使用 4 / 8 / 12 / 16 / 24 / 32 / 48px。顶栏 68px，左目录 252px，内容最大宽度 1140px。桌面以三列预览为主，小窗口可减为两列。按用户要求，图鉴不做手机窄屏适配，目录始终放在左侧。

## 形状与材质

图鉴外壳卡片圆角 12px，控件 5–8px。来源组件使用来源自己的 token 和 utility，不受外壳圆角约束。

`border-radius` 与 `corner-shape` 共同决定轮廓。来源 Squircle 的同一半径不能替换为普通圆形圆角。保留原 CSS 的 `@supports` 回退；不支持 Squircle 的浏览器使用原回退值。

材质按钮保留以下层：背景填充、渐变高光、inset 边缘、外部 ring、独立文字层。结构保留 `isolation` 和 `overflow`，文字始终在高光上方。

## 运动与状态

| 组件 / 效果 | 参数 |
| --- | --- |
| 计费开关 | 36×18px；滑块位移 18px；150ms ease-out |
| Cromma 按钮 | 200ms；hover / active 采用原 CSS |
| 语言面板 | bottom / end；Laper 4px / Cromma 6px 间距；高度受视口限制 |
| FAQ | 300ms；0fr ↔ 1fr；最多展开一项，可全部收起 |
| Laper 入场 | 700ms；`cubic-bezier(.16,1,.3,1)` |
| 极光 | 色场旋转 12s；光带往返 4s；六道漂移 beam |
| Newton 点阵 | 6px 单元；初始时间 8；动态最多 24fps |
| 云形 | DPR 0.75；点击形变 1800ms；页脚 8s 周期 |
| 描边文字 | 1900ms；180ms 延迟；dashoffset 2100 → 0 |

`prefers-reduced-motion` 时取消循环背景、文字位移和开关过渡。云层保留静态外观，变换按钮禁用。页面切换卸载 iframe，避免旧预览持续占用上下文；云层卸载时调用 `destroy()`。

## 交互契约

- 所有目录项、分类、来源选择和变体均有真实目标，URL hash 可直接访问和前进后退。
- 示例按钮只给本地反馈；不登录、不支付、不请求模型接口。
- 语言列表支持方向键、Home / End、Escape；关闭后恢复触发器焦点。选项只改变示例的短码。
- 提示词输入支持 Enter 提交、Shift + Enter 换行，组合输入不提交。空内容可点击，显示震动和说明。
- 源码复制包含实际运行的完整文件；依赖文件路径可通过源码文件下拉逐一查看。
- 列表缩略图用于识别；详情预览用于操作。缩略图 iframe 不进入键盘焦点顺序。

## 条目与维护

每个条目在 `data.js` 中记录：中文 / 英文名称、类别、变体、来源、定义、适用场景、注意事项、机制和参数。`provenance.json` 记录原节点定位及快照哈希。`NOTES.md` 记录提取目标、适配差异和验证边界。

个人偏好目前未记录，不假定用户已经认可任何组件。验收后可添加「喜欢什么、保留什么、采纳或拒绝的理由」。第一版不增加收藏、账户或条目编辑器。

原 CSS 保存完整快照以保留复杂材质，独立 DOM 和交互已经提取。真正接入其他产品前，应按所用组件裁剪 CSS、检查依赖与许可；当前目录不承诺是发布级组件包。
