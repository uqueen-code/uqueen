#!/bin/bash

# 批量清理所有 tsx 文件中的 i18n 依赖

cd /d/tes/uqueen

# 删除 useTranslation import 和使用
find src/app -name "*.tsx" -type f | while read file; do
  if grep -q "useTranslation" "$file"; then
    echo "Processing: $file"

    # 删除 useTranslation import
    sed -i "/import.*useTranslation.*from 'react-i18next';/d" "$file"

    # 删除 const { t } = useTranslation();
    sed -i "/const.*{.*t.*}.*=.*useTranslation();/d" "$file"

    echo "  ✓ Cleaned"
  fi
done

echo "Done!"
