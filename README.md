# 组件图鉴 · Component Atlas

第一版从 `laper/`、`cromma-landing/` 提取 11 类组件、19 个变体。参考 React Bits 的目录和索引形式，采用 Google Material 的设计规范与令牌组织方式。

## 运行

在本目录用 PowerShell 执行：

```powershell
node serve.mjs
```

打开 [http://127.0.0.1:5190/](http://127.0.0.1:5190/)。无需安装依赖。ES module 和本地源码读取需要 HTTP 服务，请不要直接双击 `index.html`。

## 查看与复用

- 左侧目录可展开变体；目录项和每个详情都有独立 hash 地址。
- 总览按类别或来源查看；详情有交互预览、重播和源码复制。
- `demos/*.html` 是独立样例，依赖本目录的 `snapshots/` 和 `demos/demo.*`。
- [design.md](design.md) 记录设计系统，[NOTES.md](NOTES.md) 记录来源、差异和验证边界。
- 每个演示按钮只提供本地交互，不进入原产品流程。

## 检查

```powershell
node tools/verify.mjs
```

源码、资产及清单检查；不替代实际浏览器视觉评审。

## 重新提取

`python tools/extract.py` 会从相邻两个实验重建 19 个样例并更新快照与来源哈希，**覆盖本图鉴生成的 HTML 和快照**。常规浏览无需执行。它不修改来源目录；重新提取后执行完整检查并重新评审样例。

当前版本保留完整来源 CSS，便于核对原材质，尚未裁剪为可发布的组件包。原站未声明可再分发许可的设计和代码只在本地学习使用；字体是已有本地资产，当前不重新获取外部素材。

按用户要求，图鉴面向桌面使用，第一版不做手机窄屏适配。
