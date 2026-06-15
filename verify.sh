#!/bin/bash

echo "========================================"
echo "🔍 Growth Manager 重构验证脚本"
echo "========================================"
echo ""

cd /d/tes/uqueen

# 检查 i18n 清理
echo "📋 检查 i18n 清理..."
i18n_count=$(grep -r "useTranslation\|{t(" src --include="*.tsx" --include="*.ts" | grep -v "node_modules" | grep -v "\.d\.ts" | wc -l)
if [ "$i18n_count" -eq 0 ]; then
  echo "  ✅ 所有 i18n 引用已清除"
else
  echo "  ⚠️  发现 $i18n_count 处 i18n 引用"
  grep -r "useTranslation\|{t(" src --include="*.tsx" --include="*.ts" | grep -v "node_modules" | head -5
fi

echo ""

# 检查 Providers
echo "📋 检查 Providers.tsx..."
if grep -q "I18nextProvider" src/components/layout/Providers.tsx; then
  echo "  ⚠️  Providers 中仍有 I18nextProvider"
else
  echo "  ✅ I18nextProvider 已移除"
fi

echo ""

# 检查 PWA 文件
echo "📋 检查 PWA 配置文件..."
if [ -f "public/manifest.json" ]; then
  echo "  ✅ manifest.json 存在"
else
  echo "  ❌ manifest.json 不存在"
fi

if [ -f "public/sw.js" ]; then
  echo "  ✅ sw.js (Service Worker) 存在"
else
  echo "  ❌ sw.js 不存在"
fi

if [ -f "public/assets/icon.svg" ]; then
  echo "  ✅ icon.svg 存在"
else
  echo "  ⚠️  icon.svg 不存在"
fi

echo ""

# 检查 layout.tsx
echo "📋 检查 layout.tsx PWA 配置..."
if grep -q "manifest.json" src/app/layout.tsx; then
  echo "  ✅ manifest 链接已添加"
else
  echo "  ⚠️  未找到 manifest 链接"
fi

if grep -q "serviceWorker" src/app/layout.tsx; then
  echo "  ✅ Service Worker 注册脚本已添加"
else
  echo "  ⚠️  未找到 Service Worker 注册"
fi

echo ""

# 检查图标
echo "📋 检查 PWA 图标..."
if [ -f "public/assets/icon-192x192.png" ]; then
  echo "  ✅ icon-192x192.png 存在"
else
  echo "  ⚠️  icon-192x192.png 需要生成"
fi

if [ -f "public/assets/icon-512x512.png" ]; then
  echo "  ✅ icon-512x512.png 存在"
else
  echo "  ⚠️  icon-512x512.png 需要生成"
fi

echo ""

# 检查关键页面
echo "📋 检查关键页面..."
critical_pages=("psychology" "travel" "dashboard" "settings")
for page in "${critical_pages[@]}"; do
  if [ -f "src/app/(main)/$page/page.tsx" ]; then
    echo "  ✅ $page/page.tsx 存在"
  else
    echo "  ❌ $page/page.tsx 不存在"
  fi
done

echo ""
echo "========================================"
echo "✅ 验证完成"
echo "========================================"
echo ""
echo "📝 下一步操作："
echo "  1. 生成 PWA 图标（见 public/assets/ICON_README.md）"
echo "  2. 在浏览器中测试所有页面"
echo "  3. 测试 PWA 安装功能（需 HTTPS）"
echo "  4. 运行 Lighthouse PWA 审计"
echo ""
