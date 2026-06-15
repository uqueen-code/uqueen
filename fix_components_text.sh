#!/bin/bash

cd /d/tes/uqueen/src/components

# Dashboard components
sed -i "s/{t('dashboard\.countdowns')}/倒计时/g" dashboard/CountdownWidget.tsx
sed -i "s/{t('dashboard\.noCountdowns')}/暂无倒计时/g" dashboard/CountdownWidget.tsx
sed -i "s/{t('dashboard\.daysRemaining')}/天/g" dashboard/CountdownWidget.tsx

sed -i "s/{t('dashboard\.goals')}/目标/g" dashboard/GoalWidget.tsx
sed -i "s/{t('dashboard\.noGoals')}/暂无目标/g" dashboard/GoalWidget.tsx
sed -i "s/{goal\.daysRemaining}{t('dashboard\.daysRemaining')}/goal.daysRemaining}天/g" dashboard/GoalWidget.tsx
sed -i "s/{t('dashboard\.completed')}/已完成/g" dashboard/GoalWidget.tsx

sed -i "s/{t('dashboard\.habits')}/习惯打卡/g" dashboard/HabitTracker.tsx
sed -i "s/{t(\`nav\.\${category}\`)}/category === 'fitness' ? '健身' : category === 'reading' ? '阅读' : category === 'learning' ? '学习' : category === 'speaking' ? '口语' : category === 'health' ? '健康' : category === 'psychology' ? '心理' : category/g" dashboard/HabitTracker.tsx

sed -i "s/{t('dashboard\.heatmap')}/活动热力图/g" dashboard/HeatmapCalendar.tsx

sed -i "s/title={t('dashboard\.noTodos')}/title=\"暂无待办\"/g" dashboard/TodoWidget.tsx

# Finance
sed -i "s/{t('finance\..*')}/账户余额/g" finance/FinanceWidgets.tsx

# Fitness
sed -i "s/{t('fitness\..*')}/体重追踪/g" fitness/WeightTracker.tsx
sed -i "s/{t('common\.save')}/保存/g" fitness/WeightTracker.tsx

# Layout
sed -i "s/{t('common\.offline')}/离线模式/g" layout/OfflineBanner.tsx
sed -i "s/{t('common\.online')}/在线/g" layout/OfflineBanner.tsx

echo "Component text replacement done!"
