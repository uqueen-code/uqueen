#!/bin/bash

# 修复所有页面的 t() 标题调用

cd /d/tes/uqueen/src/app/\(main\)

# Reading page
sed -i "s/{t('reading\.title')}/阅读打卡/g" reading/page.tsx

# Learning page
sed -i "s/{t('learning\.title')}/学习记录/g" learning/page.tsx

# Speaking page  
sed -i "s/{t('speaking\.title')}/口语练习/g" speaking/page.tsx

# Health page
sed -i "s/{t('health\.title')}/健康管理/g" health/page.tsx

# Finance page
sed -i "s/{t('finance\.title')}/财务管理/g" finance/page.tsx

# Business page
sed -i "s/{t('business\.title')}/商业规划/g" business/page.tsx

# Login page
sed -i "s/{t('auth\.login')}/登录/g" ../\(auth\)/login/page.tsx
sed -i "s/{t('auth\.welcome')}/欢迎回来/g" ../\(auth\)/login/page.tsx
sed -i "s/{t('auth\.signIn')}/登录/g" ../\(auth\)/login/page.tsx

echo "All pages fixed!"
