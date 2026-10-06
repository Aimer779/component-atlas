# 第一版提取与验收

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

## 版本控制与运行

`D:/code/frontend-test/` 和本新目录不处于 Git 仓库，提交不适用；没有初始化仓库。原实验 Git 状态保持不变，没有提交其用户修改。

在本目录运行 `node serve.mjs`，访问 `http://127.0.0.1:5190/`。无新增生产依赖。原站脚本、登录、支付、模型 API 和统计服务均未接入。
