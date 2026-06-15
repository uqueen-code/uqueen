const fs = require('fs');
const path = require('path');

// 简单的 PNG 生成器（使用 Canvas）
async function generateIcons() {
  try {
    // 尝试使用 canvas 库
    const { createCanvas } = require('canvas');

    console.log('🎨 开始生成 PWA 图标...\n');

    // 生成两个尺寸的图标
    const sizes = [192, 512];

    for (const size of sizes) {
      const canvas = createCanvas(size, size);
      const ctx = canvas.getContext('2d');

      // 绘制渐变背景
      const gradient = ctx.createLinearGradient(0, 0, size, size);
      gradient.addColorStop(0, '#6366f1');
      gradient.addColorStop(1, '#8b5cf6');
      ctx.fillStyle = gradient;

      // 绘制圆角矩形
      const radius = size * 0.2;
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(size - radius, 0);
      ctx.quadraticCurveTo(size, 0, size, radius);
      ctx.lineTo(size, size - radius);
      ctx.quadraticCurveTo(size, size, size - radius, size);
      ctx.lineTo(radius, size);
      ctx.quadraticCurveTo(0, size, 0, size - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.fill();

      // 绘制白色 "G" 字母
      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${size * 0.5}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('G', size / 2, size / 2);

      // 保存为 PNG
      const buffer = canvas.toBuffer('image/png');
      const outputPath = path.join(__dirname, 'public', 'assets', `icon-${size}x${size}.png`);
      fs.writeFileSync(outputPath, buffer);

      console.log(`✅ 已生成: icon-${size}x${size}.png (${(buffer.length / 1024).toFixed(2)} KB)`);
    }

    console.log('\n🎉 PWA 图标生成完成！');
    return true;
  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.log('❌ canvas 模块未安装');
      return false;
    }
    throw error;
  }
}

// 备用方案：生成 SVG 然后手动转换提示
function generateSVGFallback() {
  console.log('📝 使用备用方案：生成 SVG 图标\n');

  const svg192 = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="192" height="192" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad192" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="192" height="192" rx="38" fill="url(#grad192)"/>
  <text x="50%" y="58%" font-family="Arial, sans-serif" font-size="100" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">G</text>
</svg>`;

  const svg512 = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad512" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="100" fill="url(#grad512)"/>
  <text x="50%" y="58%" font-family="Arial, sans-serif" font-size="280" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">G</text>
</svg>`;

  const assetsDir = path.join(__dirname, 'public', 'assets');
  fs.writeFileSync(path.join(assetsDir, 'icon-192x192.svg'), svg192);
  fs.writeFileSync(path.join(assetsDir, 'icon-512x512.svg'), svg512);

  console.log('✅ 已生成 SVG 文件:\n   - icon-192x192.svg\n   - icon-512x512.svg\n');
  console.log('📌 请使用以下方法之一转换为 PNG:');
  console.log('   1. 在线工具: https://cloudconvert.com/svg-to-png');
  console.log('   2. 浏览器: 打开 public/assets/create_icons.html');
  console.log('   3. ImageMagick: convert icon-192x192.svg icon-192x192.png\n');
}

// 主函数
(async () => {
  const canvasSuccess = await generateIcons();

  if (!canvasSuccess) {
    generateSVGFallback();
  }
})();
