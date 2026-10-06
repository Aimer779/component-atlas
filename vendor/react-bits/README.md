# React Bits · 本地来源

来源：[DavidHDev/react-bits](https://github.com/DavidHDev/react-bits)，提交 `ca44b3f9ee180676a06d7de8ec6bea84cddff85b`，取证日期 2026-10-06。

- `GlideSelect.jsx` / `GlideSelect.css`：官方 Glide Select 原文件。CSS 直接用于图鉴外壳；JSX 保留作为对照，不参与浏览器运行。
- `PreviewSelect.jsx`：官网下拉通过 portal 避免被工作台裁切的源码依据。
- `sidebar.css`：官网文档导航的间距、文本 hover 及静止容器依据；不整体加载，避免覆盖图鉴自己的布局。
- `source.json`：原路径、提交与字节哈希；完整检查会验证这五份源文件未变化。
- `LICENSE.md`：原始 MIT + Commons Clause 许可与 David Haz 版权声明。

`../../ui/glide-select.js` 是适配当前 HTML/JS 工程的 DOM 实现，沿用官方 DOM 层次、选项高亮、旋转箭头、键盘与按住拖动选择逻辑；菜单 portal 借鉴 PreviewSelect。没有引入 React 或图标依赖。主题、菜单定位与资源生命周期的差异写在 `../../NOTES.md`。
