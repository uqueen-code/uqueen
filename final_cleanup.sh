#!/bin/bash

cd /d/tes/uqueen/src/app

# Login page
sed -i "s/{t('app\.name')}/全能个人成长管理平台/g" "(auth)/login/page.tsx"
sed -i "s/{t('app\.tagline')}/掌控人生，成就更好的自己/g" "(auth)/login/page.tsx"
sed -i "s/{t('app\.shortName')}/成长管家/g" "(auth)/login/page.tsx"

# Learning page
sed -i "s/{t('learning\.categories')}/学习分类/g" "(main)/learning/page.tsx"
sed -i "s/{t('common\.save')}/保存/g" "(main)/learning/page.tsx"

# Reading page  
sed -i "s/{t('reading\..*')}/阅读记录/g" "(main)/reading/page.tsx"

# Speaking page
sed -i "s/{t('speaking\..*')}/口语练习/g" "(main)/speaking/page.tsx"

# Health page
sed -i "s/{t('health\..*')}/健康管理/g" "(main)/health/page.tsx"

# Finance page
sed -i "s/{t('finance\..*')}/财务管理/g" "(main)/finance/page.tsx"

# Business page
sed -i "s/{t('business\..*')}/商业规划/g" "(main)/business/page.tsx"

echo "Final cleanup complete!"
