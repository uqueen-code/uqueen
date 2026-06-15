#!/bin/bash

cd /d/tes/uqueen/src/components

# Speaking page
sed -i "s/\${t(\`speaking\.\${module}\`)}/打卡/g" ../app/\(main\)/speaking/page.tsx

# Finance widgets
sed -i "s/{t('common\.add')}/添加/g" finance/FinanceWidgets.tsx

# Fitness components
sed -i "s/{t('fitness\.exerciseCheckin')}/运动打卡/g" fitness/ExerciseCheckin.tsx
sed -i "s/placeholder={t('fitness\.duration')}/placeholder=\"时长(分钟)\"/g" fitness/ExerciseCheckin.tsx

# Health widgets
sed -i "s/{t('health\.illnessLog')}/疾病记录/g" health/HealthWidgets.tsx
sed -i "s/{t('common\.submit')}/提交/g" health/HealthWidgets.tsx
sed -i "s/{t('health\.menstrualLog')}/经期记录/g" health/HealthWidgets.tsx
sed -i "s/{t('health\.startDate')}/开始日期/g" health/HealthWidgets.tsx
sed -i "s/{t('health\.endDate')}/结束日期/g" health/HealthWidgets.tsx
sed -i "s/placeholder={t('health\.symptoms')}/placeholder=\"症状描述\"/g" health/HealthWidgets.tsx

echo "Component cleanup complete!"
