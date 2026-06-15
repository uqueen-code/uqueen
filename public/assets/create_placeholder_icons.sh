#!/bin/bash
# 创建临时占位符图标用于构建测试

# 使用 ImageMagick 如果可用
if command -v convert &> /dev/null; then
  echo "使用 ImageMagick 生成图标..."
  convert -size 192x192 xc:"#6366f1" -fill white -pointsize 96 -gravity center -annotate +0+0 "G" icon-192x192.png
  convert -size 512x512 xc:"#8b5cf6" -fill white -pointsize 256 -gravity center -annotate +0+0 "G" icon-512x512.png
  echo "✅ 图标生成完成"
  exit 0
fi

# 如果没有 ImageMagick，创建最小的 PNG 占位符
echo "创建简单占位符图标..."

# 最小的 PNG 文件头 + 纯色图片
cat > icon-192x192.png.base64 << 'PNGEOF'
iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAYAAABS3GwHAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAALEgAACxIB0t1+/AAAABV0RVh0Q3JlYXRpb24gVGltZQA2LzE1LzIwMjYmFYt/AAAAHHRFWHRTb2Z0d2FyZQBBZG9iZSBGaXJld29ya3MgQ1M1cbXjNgAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAm0lEQVR42u3BAQ0AAADCoPdPbQ8HFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA+BpXAAGONZKOAAAAAElFTkSuQmCC
PNGEOF

base64 -d icon-192x192.png.base64 > icon-192x192.png 2>/dev/null || echo "base64 decode failed, using echo method"

# 如果 base64 失败，创建提示文件
if [ ! -f icon-192x192.png ] || [ ! -s icon-192x192.png ]; then
  echo "⚠️ 无法自动生成图标"
  echo "请在浏览器中打开 public/generate-pwa-icons.html 手动生成"
  exit 1
fi

cp icon-192x192.png icon-512x512.png
echo "✅ 占位符图标创建完成（仅用于构建测试）"
