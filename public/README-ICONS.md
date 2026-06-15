# 🎨 PWA 图标生成指南

## 快速生成（推荐）

1. 在浏览器中打开 `generate-pwa-icons.html`
2. 点击"生成并下载图标"按钮
3. 会自动下载两个文件：
   - `icon-192x192.png`
   - `icon-512x512.png`
4. 将这两个文件放到 `public/assets/` 目录
5. 完成！

## 在线工具方案

如果上述方法不可用，可以使用：

1. 访问 https://realfavicongenerator.net/
2. 上传 `assets/icon.svg` 文件
3. 下载生成的图标
4. 重命名并放到 `assets/` 目录

## 当前状态

- ✅ Service Worker 已配置
- ✅ manifest.json 已创建
- ✅ PWA meta 标签已添加
- ⏳ 等待图标生成

生成图标后，项目即可作为 PWA 安装到手机桌面！
