# 运行素材

- `editor-workspace.webp` 从 `snapshots/assets/editor-workspace.png` 生成。来源仍是本地 Laper 实验。转换使用无损 WebP；检查逐像素比较解码后的 RGBA。原始 PNG 和来源哈希保留。
- `paper-background.jpg` 来自原剧本卡片的纸张纹理地址：[原始图片](https://imagedelivery.net/1W11ZO-eGbuX7N6NEDrE4Q/textures/paper_background/public)。2026-10-06 匿名 HEAD 返回 200、`image/jpeg`、66974 字节，随后保存相同图片。SHA-256：`9a68e1c67351c08e9d68cbf66bfe0c5ad3be9ce3182235e4cba19a58ec711ab8`。

这些素材延续原实验的个人本地学习用途。原站没有在该资源响应中提供再分发许可。本轮没有发布素材，也没有扩大原有使用范围。

图片与精简样式已经提交到本地仓库。日常运行只需 Node。重新生成无损图片执行 `pnpm build:assets`；重新提取也会执行此步骤，不会重新下载纸张纹理。
