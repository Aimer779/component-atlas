# 组件图鉴 · 提取与验收

## 外壳质感与明暗主题（2026-10-06）

本轮沿用 React Bits 材质机制并适配图鉴主题，覆盖全部 15 张组件卡片、目录与变体链接、页头导航、分类与来源控件、详情工作台、源码表面、设计系统和来源页。来源组件保留原材质；仅调整五个缩略图的取景。

### SOURCE 与有意差异

- 参考 URL：https://reactbits.dev/get-started/index，2026-10-06 实时访问。
- `.browse-card.css-12as3ye`：普通圆角 16px、padding 6px、border-box、透明 1px 边缘、白色 4% 表面、7% 白色 inset 顶部高光；`.browse-card-media` / `.browse-card-well`：普通圆角 12px、190px 高、overflow hidden。标签区 `.css-iatp15`：12 / 10 / 8px。计算值和内联 CSS 规则在 `artifacts/reactbits-card-reference.json`。
- 部署 CSS：`https://reactbits.dev/assets/index-DvjHduJd.css`，`.browse-card:hover` 提高表面亮度并加阴影，标题换强调色。后置规则覆盖旧按压缩放，原站最终 `:active` 为 transform none；按部署源码核对。
- 图鉴沿用 16 / 12px 圆角、6px 内边距和 inset 顶部高光；标签区改为 14 / 10 / 9px，以容纳中文、英文术语和变体信息。增加低对比常驻边缘，使两种主题中来源舞台的边界清楚。
- 使用自己的中性灰与绿强调色，hover 阴影不带原站紫色。按压 0.985 倍、箭头右上 2px 是有意增加的反馈；200ms 缓动 `cubic-bezier(.23,1,.32,1)`，按压 120ms。
- 参考站侧栏功能较多，当前保留已有目录功能；目录改成距窗口边缘 16px 的圆角面板，控件普通圆角 9px。
- `styles.css` 定义全部外壳令牌。暗色卡片实际计算 padding 6px、radius 16px；预览 radius 12px；真实鼠标 hover 后边框 `#4b5159`、表面 `#24272b`、箭头 matrix 位移 `(2,-2)`。
- `demos/demo.css` 只对 thumbnail 描边文字调整 SVG 居中取景；`demos/motion.js` 缩略图滚动到示例 section 顶部。外壳对共享元素、提示条、输入框调整 iframe 缩放。独立详情仍沿用原演示。

### 主题契约

- `theme.js` 在样式表前读取 `component-atlas-theme`，在初始绘制前恢复保存的主题。首次默认暗黑；只接受 light / dark，未知或无法读取时使用暗黑。
- 太阳 / 月亮按钮名为「暗黑模式」，`aria-pressed` 表达实际模式，title 表达点击结果，支持 Space / Enter 与可见焦点。
- localStorage 保存选择；存储受限仍可切换；其他同源标签页的 storage 事件同步外壳。主题切换不重建详情 iframe，已选择的年付等状态保持。
- 设计系统色板读取当前主题令牌并同步更新；外壳文字、边界、源码、反馈条共用语义令牌。iframe 保留来源主题。

### 本轮验证

- `node tools/verify.mjs`：12 项回归通过，15 类 / 23 变体、14 份脚本语法、86 条本地资源引用、7 个快照哈希和 WOFF2 头通过。新增主题回归覆盖早期恢复、切换保存、存储受限 / 无效值、跨标签页同步。
- Chromium：双主题分别检查 1440×900、1280×800、1024×768、1280×600；总览均 15 张卡片，1024 宽两列，其余三列，scrollWidth 等于 clientWidth。窄桌面与短窗口实际截图评审，目录可滚动，卡片、文案和分类没有遮挡。
- 逐项查看全部卡片并调整五个取景；这五个 iframe 均 ready，内部 scrollWidth 等于 clientWidth。
- 双主题抽查正文、选中目录、分类、卡片文字、主题按钮、变体、详情 tabs、源码与来源链接的前景 / 叠加背景，最低对比度 4.98:1。验证真实卡片 hover、主题按钮 hover 与键盘 2px 焦点。
- 刷新保持浅色；主题切换前后年付开关均为 true；源码 ArrowLeft 回到预览且焦点正确；设计系统色板更新；背景效果 + Laper 组合显示明确空状态。
- console error 为空。运行记录在 `artifacts/polish-checks.json`；明暗首屏、暗色完整索引与源码详情截图为同目录 `*-polished.jpg`。
- 视觉评审：内外圆角、边缘亮度、标签留白和目录层级在两套主题下清楚；来源预览保持自己的背景。正常、窄桌面与短窗口保留纵向滚动。
- 未实测：其他浏览器、真实系统 reduced-motion 切换、实体设备性能；外壳沿用减少动态效果 CSS，本轮未操作系统设置。手机窄屏按用户要求不在范围内。跨标签同步做了确定性回归，未另开真实双标签联动测试。截图不证明全部动效中间帧或性能。

## 上一版本：Git 初始化后的优化

2026-10-06。已在本目录初始化本地 Git，基线提交 `50a0ecb`；源实验仍保持原 Git 状态。当前图鉴 15 类 / 23 变体，Laper 9 类 / 10 变体，Cromma 10 类 / 13 变体。图鉴仍只面向桌面。

修正独立审查发现的三个问题：

- Laper 菜单面板设置 `data-state=open`，实测 `animationName=laper-menu-pop-in`。另外修正 Escape 关闭后继续访问空菜单的问题，移除关闭态失效的 aria-controls，保留焦点恢复。
- `provenance.json` 为每个变体生成实际 files / assets；源码下拉直接使用此清单，包含语言数据与间接导入模块。字体、图片提供下载。普通按钮不再加载 flags、field、clouds。
- 静态云层按真实舞台初始化 live 几何，停止循环帧和 shader 时间更新。原 `snapshots/` 不改，`engines/` 从来源生成小范围适配，回归核对所有 shader 字符串保持一致。

新增效果的证据与差异：

| 新条目 | 来源 | 当前预览与有意差异 |
| --- | --- | --- |
| 共享元素弹层 | `laper/page.js` 的 openLaunchVideo、videoExpandedRect、VIDEO_MOVE | 400ms / 原缓动，原框 → 80% 视口内 16:9；关闭回原框。采用已有本地编辑器图片演示，不加载视频；增加焦点约束、快速中断及 resize 处理。 |
| 循环剧本带 | `laper/index.html` 轨道、page.js mountScriptReel、page.css 浮动 | 取前 4 张纸、重复两份；样例纸宽 240px、高 340px，而不是整页 448×640px。保留 3s 三次加速和 6.2s 浮动；速度按源 60fps 参考做时间积分，支持暂停。 |
| 滚动弹簧放大 | `laper/page.js` mountProductShot | 保留比例 0.96→1、420 / 35 / 0.7 参数；观察区域改为 iframe 内滚动，画面使用已有截图，不搬入整个编辑器的不可用控件。隐藏源码面板时暂停目标更新，防止零高度产生 NaN。 |
| 材质提示条 | `cromma-landing/script.js` showComingSoon 与 CSS 的 laper-toast / toast-progress | 提取原 DOM、阴影、圆环和静态 Newton 点阵；文案改为本地演示。5s 超时、500ms 退出、单条替换，关闭释放帧请求、观察器及 GPU 上下文。 |

新增图片复制自 `laper/assets/landing/laper-feature-script-workspace.png`，没有新增远程素材请求；來源与字节哈希在清单中。两个原实验的本地学习与许可边界继续适用。

当前完整入口 `node tools/verify.mjs` 已通过：15 类 / 23 变体、13 个 JS 文件、85 条直接本地资源引用、7 份来源哈希、WOFF2 文件头和 9 项回归。回归覆盖：静态云形可见且无循环、点阵销毁、shader 原样保留、变体依赖完整、菜单状态与 Escape、轨道刷新率一致、弹簧双向收敛、隐藏面板恢复、弹层边界。

当前浏览器验收：

- 23 个变体均实际初始化，全部样例无横向溢出。15 张索引卡片在 1440×900、1280×800、1024×768、1280×600 下 `scrollWidth == clientWidth`。
- 菜单动画、语言数据源码读取、共享元素展开与 Squircle、三次快速打开 / Escape 关闭、焦点与 inert 恢复均实测。
- 轨道 8 张纸可持续播放，暂停后 transform 不变，纸张浮动也暂停，继续后恢复。
- 滚动样例从 0.960 收敛到 1.000，可反向滚动；发现源码面板隐藏造成 NaN 后已修正，再次切换实测为有限的 1.000。
- 提示条有实际点阵 canvas 和 toast-progress 圆环；快速重复触发只保留一条。手动关闭、自动退出后均 0 条 toast / 0 个 canvas。
- `cloud-hero.html?reduced-motion=1` 调用相同静态分支，画面有完整云形，两次 JPEG 字节一致。实机系统设置没有切换；这是调试分支的 GPU 画面检查与静态几何回归，不冒称系统设置验收。
- 来源计数分别实测 Laper 9 / 10、Cromma 10 / 13；总览顺序与左目录类别一致。

新证据放在 `artifacts/optimization-checks.json`、`artifacts/catalog-optimized.jpg`、`artifacts/cloud-static-desktop.jpg` 和新效果截图。其它浏览器、真实硬件性能、系统 reduced-motion 设置仍未验证；手机窄屏不在范围。没有公开部署或接入原产品接口。

以下保留初始交付记录，用于与基线对照；其中 11 类 / 19 变体及 Git 未初始化等描述是当时状态。

---

## 初始交付记录

日期：2026-10-06。目录：`component-atlas/`。图鉴仅面向桌面使用，用户明确不要求手机窄屏适配。

## 范围与目标

目标是从已有复刻实验提取组件机制，适配为独立观察环境；不是逐像素复制完整 React Bits 网站。组织参考 [React Bits Index](https://reactbits.dev/get-started/index) 和 [Google Material](https://m3.material.io/)。

图鉴外壳使用自己的中文字体系、深色背景和浅绿色选中态。借鉴的部分是顶栏、左侧分类目录、效果索引与预览 / 源码详情。没有搬入 React Bits 的组件代码、统计、收藏、搜索、推广或付费入口。

来源是本机 2026-10-06 的 `laper/` 和 `cromma-landing/` 工作区。读取前确认 Laper 工作区干净；Cromma 的 `index.html` 和 `script.js` 已有用户修改。本轮未修改这两个实验，提取以当时工作区内容为准。

## 参考证据

- React Bits：2026-10-06 实际打开 Index 页面。深色顶栏高 60px，Geist 字体；索引标题 48px；主内容从 x=320 开始，卡片三列。实际 DOM 及计算值中 `box-sizing: border-box`、页面底色 `rgb(18,15,23)`。本图鉴采用 68px 顶栏、252px 目录、38px 标题和独立系统中文字体，属于有意适配。
- Google 官方：[Material design tokens](https://m3.material.io/foundations/design-tokens/overview)、[components](https://m3.material.io/components)、[Material Web theming](https://github.com/material-components/material-web/blob/main/docs/theming/README.md)。用于规范分层和 reference → system → component 令牌关系，不用于替换来源组件外观。
- Laper 原站证据：来源目录 `NOTES.md` 记录 2026-10-05 的部署 HTML / CSS、开关年价、语言菜单打开态及文字运动。原文件是 `index.html`、`pricing/index.html`、`assets/site.css`、`page.js`、`lang-flags.js`。
- Cromma 原站证据：来源目录 `NOTES.md`、`RECON/live-2026-10/` 记录 2026-10-05 的部署包、运行时颜色、Squircle、WebGL DPR 和画布参数。提取读取的是当前 `index.html`、`styles.css`、`script.js`、`field.js`、`clouds.js`。
- 每个变体的节点定位、来源路径和六份本地快照的 SHA-256 在 `provenance.json`。原 CSS 和 shader 保留原样；提取器不修改来源。

本轮未重新对两个在线原站逐节点实时取证。组件参数依据本地来源及已有日期证据，当前运行结果另行实测。没有宣称完整原站的逐值复刻已验收。

## 清单

| 分类 | 组件 | 变体 |
| --- | --- | --- |
| 基础交互 | 材质按钮 | Cromma 标签 / 蓝色强调，Laper 绿色强调 / 描边，共 4 个 |
| 基础交互 | 语言菜单 | Laper 16 项旗帜，Cromma 6 项文字 |
| 基础交互 | 计费开关 | Laper 月付 / 年付联动 |
| 基础交互 | 提示词输入框 | Cromma 文本输入表面 |
| 基础交互 | 互斥手风琴 | Cromma FAQ |
| 内容展示 | 定价卡片 | Laper Senior，Cromma Plus |
| 背景效果 | 极光色场 | Cromma 蓝色极光 |
| 背景效果 | 分形点阵 | Newton 静态 / 动态 |
| 背景效果 | 变形云层 | Hero / 页脚 |
| 文字与动效 | 淡入上移 | Cromma / Laper |
| 文字与动效 | 描边文字 | Laper 页脚 |

总计 11 类组件、19 个变体。Laper 为 6 类 / 7 变体；Cromma 为 9 类 / 12 变体。共享组件族只计一次，两个来源的组件族数量不能直接相加。

## 当前实现与有意差异

| 范围 | 当前实现 | 差异 / 适配理由 |
| --- | --- | --- |
| 全部样例 | `demos/*.html` + `snapshots/` | 提取原节点，保留完整来源 CSS 以维持材质；iframe 隔离主题。预览容器独立，不是完整页面。 |
| 字体 | 已有本地 Montserrat + 系统中文字体 | Laper 原站完整字体组合未下载；部分文字宽度有差异。运行无外链字体。 |
| 按钮 / 套餐 | 原结构与材质 + 本地反馈 | 原登录、下载、升级链接改为本地交互，保持学习范围。Cromma Download 移除原响应式隐藏。 |
| 语言菜单 | 原两套菜单材质 + 独立交互 | 保留 Laper 4px、Cromma 6px 间距与右对齐；面板高度按示例可用空间滚动。Cromma dialog 改为 menu，增加方向键、Home / End、Escape 与焦点恢复。选择只改短码。 |
| 年付开关 | 原 switch + 原 Senior 价格数据 | 示例把价格放在独立观察区域，不重复完整定价页。月价 20，年价 192，月均 16。 |
| 输入框 | 原表面与发送按钮 | 附件及分享范围入口移除；仅演示文字输入，空输入震动、有效输入本地确认。没有模型请求。 |
| FAQ | 原 8 项取前 3 项 | 保留互斥开合机制，当前项可再次收起。没有复制完整 FAQ 区块。 |
| 极光 | 原 wash、六道 beam、sheet、dot-grid | 适配独立舞台高度，不复制整页 hero 文案和视差。父级处理横向溢出。 |
| 点阵 | 原 shader、6px 单元、Newton 算法 | 按定价静态、Hero 动态参数分别挂载；舞台大小独立，保留 mask / opacity。 |
| 云层 | 原 shader、DPR 0.75、shadow / frameMode | Hero 0.24 阴影，页脚零阴影；页脚观察透明度从 0.16 提至 0.4。增加手动形变按钮，保留引擎周期。 |
| 入场 | 原 class / reveal 缓动 | 独立预览用重播替代滚动触发，便于完整观察。 |
| 描边字 | 原 SVG text / dash 动画 | 观察外框缩放到预览舞台；保留原 viewBox、字号、字距和描边。 |
| 总览 | 11 个缩略 iframe | 缩略预览不能操作、不能进入键盘顺序；语言样例默认展开以便识别。实际操作在详情。 |

## 自动检查

完整入口：`node tools/verify.mjs`。已通过：

- 11 个组件路由、19 个变体路由唯一，分类有效，说明字段完整。
- 19 份 HTML 和来源清单一一对应；无遗漏或孤立样例。
- 8 个 JavaScript 文件语法检查。
- 118 条本地 HTML / CSS 资源引用有效、不越出目录；独立样例没有远程资源或外部操作链接。
- 6 份来源快照的 SHA-256 保持一致；本地字体 WOFF2 文件头正确。
- `hidden` 不被 flex / grid 覆盖。
- 桌面外壳不含手机侧栏或窄屏预览控件，防止恢复已移除入口。

这是本地源码、清单和资产检查；没有云端 CI、构建部署或公开发布。

## 浏览器行为与视觉评审

实际内置浏览器，桌面窗口 1440×900、1280×800、1024×768、1280×600。四种尺寸均 `scrollWidth == clientWidth`，11 张卡片可见并可导航，顶部与目录没有遮挡。记录在 `artifacts/browser-checks.json`。

- 19 个详情预览均实际初始化，`data-ready=true`；每个示例 `scrollWidth == clientWidth`，来源 CSS 互不串扰。
- Cromma 标签按钮高 32px、圆角 16px、`corner-shape: superellipse(2)`，内嵌阴影多层实际存在。
- Laper 菜单 16 项，旗帜实测 16px；12px Squircle 面板；距按钮 4px；Cromma 6 项、176px 宽、16px Squircle、6px 间距。短舞台内保留滚动。Laper 使用本地字体时面板约 129.3px，较原证据 128px 略宽，原脚本整数定位产生约 0.3px 右缘差。
- 菜单 End 导向最后项；Español 选择后短码 ES，面板卸载并回到触发器焦点。
- 年付点击后 `aria-checked=true`、$192 / yr.、$16 / mo.、滑块 left=18px；键盘 Space 回到月付 $20。
- 空输入点击显示震动 / 提示；有效文本 Enter 给出本地确认；不产生模型请求。
- FAQ 第二项展开时状态 `false / true / false`，再次 Space 后全部 `false`。
- 原始云层、点阵画布实际渲染。Hero 画布 806×307 / CSS 1075×410，约 DPR 0.75；点阵 1075×410 / CSS 1075×410，当前设备 DPR 1。云层已观察进入、稳定外观、点击后变形，静态和动态点阵已观察实际画面。
- 来源过滤 Laper 得 6 类 / 7 变体，分类数同步变化；Laper + 背景效果得到真实空状态。
- 预览 / 源码切换、Home 键回预览、源文件选择和复制已测试。复制云引擎文件 17978 字符，含原 shader 与 API；测试后恢复浏览器剪贴板内容。
- 设计系统、来源页、来源 JSON、本地文档入口可读。

截图：`artifacts/catalog-desktop.jpg`、`artifacts/cloud-desktop.jpg`、`artifacts/system-desktop.jpg`。自动检查与视觉评审分别完成。

工具切换 iframe 时记录过 MutationObserver 观察空节点的异常；本目录与快照没有该 API。单独新开云层样例的 error / warn 日志为空。没有把工具日志整体宣称为零错误。

## 验证边界

手机窄屏已按用户要求移出范围。尚未验证其它浏览器、实际操作系统 reduced-motion 设置切换、真实 GPU 性能及原站最新变化。减少动态效果分支完成代码 / CSS 检查，没有冒称实际系统设置下视觉验收。

CSS 当前保留完整来源快照，尚未裁剪成可发布组件包；两个原实验的学习与素材许可边界继续适用。

## 初始交付时的版本控制与运行

`D:/code/frontend-test/` 和本新目录不处于 Git 仓库，提交不适用；没有初始化仓库。原实验 Git 状态保持不变，没有提交其用户修改。

在本目录运行 `node serve.mjs`，访问 `http://127.0.0.1:5190/`。无新增生产依赖。原站脚本、登录、支付、模型 API 和统计服务均未接入。
