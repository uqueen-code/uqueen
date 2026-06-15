# PWA 图标生成说明

## 方法一：使用在线工具（推荐）
1. 访问 https://realfavicongenerator.net/
2. 上传 `icon.svg` 文件
3. 下载生成的 192x192 和 512x512 PNG 图标
4. 重命名为 `icon-192x192.png` 和 `icon-512x512.png`
5. 放置到 `public/assets/` 目录

## 方法二：使用浏览器
1. 在浏览器中打开 `create_icons.html`
2. 会自动下载两个 PNG 文件
3. 保存到 `public/assets/` 目录

## 方法三：使用命令行工具
```bash
# 安装 ImageMagick (如果已有)
convert -background none -size 192x192 icon.svg icon-192x192.png
convert -background none -size 512x512 icon.svg icon-512x512.png
```

## 临时方案
如果暂时无法生成图标，可以：
1. 使用任意 PNG 图片重命名为 `icon-192x192.png` 和 `icon-512x512.png`
2. PWA 功能仍然可以正常工作，只是图标不够美观

## 注意事项
- 图标应该是正方形
- 建议使用透明背景或纯色背景
- 简洁的设计在小尺寸下更清晰
