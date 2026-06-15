#!/bin/bash

cd /d/tes/uqueen

# 批量删除所有组件中的 useTranslation import 和使用
find src/components -name "*.tsx" -type f | while read file; do
  if grep -q "useTranslation" "$file"; then
    echo "Processing: $file"
    
    # 删除 useTranslation import
    sed -i "/import.*useTranslation.*from 'react-i18next';/d" "$file"
    
    # 删除 const { t } = useTranslation();
    sed -i "/const.*{.*t.*}.*=.*useTranslation();/d" "$file"
    
    echo "  ✓ Cleaned"
  fi
done

echo "Component cleanup done!"
