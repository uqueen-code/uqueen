#!/bin/bash
cd /d/tes/uqueen/src/components

# FinanceWidgets
sed -i "s/t('finance\.totalValue')/总市值/g" finance/FinanceWidgets.tsx
sed -i "s/t('finance\.profitLoss')/盈亏/g" finance/FinanceWidgets.tsx

# WeightTracker
sed -i "s/t('common\.loading')/加载中.../g" fitness/WeightTracker.tsx
sed -i "s/t('common\.save')/保存/g" fitness/WeightTracker.tsx

# WorkoutPlan
sed -i "s/t('common\.loading')/加载中.../g" fitness/WorkoutPlan.tsx
sed -i "s/t('fitness\.acceptPlan')/接受方案/g" fitness/WorkoutPlan.tsx

# MotivationBar
sed -i "s/{t('motivation\.title')}/今日箴言/g" layout/MotivationBar.tsx

# MusicPlayer
sed -i "s/{t('music\.dailyRecommendation')}/每日推荐/g" layout/MusicPlayer.tsx
sed -i "s/title={t('music\.upload')}/title=\"上传音乐\"/g" layout/MusicPlayer.tsx
sed -i "s/title={t('music\.openPlayer')}/title=\"打开播放器\"/g" layout/MusicPlayer.tsx

# OfflineBanner
sed -i "s/t('common\.offline') : t('common\.offline')/离线模式/g" layout/OfflineBanner.tsx
sed -i "s/t('common\.syncing')/同步中/g" layout/OfflineBanner.tsx

# Reading components
sed -i "s/{t('reading\.dailyRecommendation')}/每日推荐/g" reading/DailyRecommendation.tsx
sed -i "s/{t('reading\.readingLog')}/阅读日志/g" reading/ReadingLog.tsx
sed -i "s/placeholder={t('reading\.bookTitle')}/placeholder=\"书名\"/g" reading/ReadingLog.tsx
sed -i "s/placeholder={t('reading\.chapter')}/placeholder=\"章节\"/g" reading/ReadingLog.tsx
sed -i "s/placeholder={t('reading\.pagesRead')}/placeholder=\"页数\"/g" reading/ReadingLog.tsx
sed -i "s/placeholder={t('reading\.notes')}/placeholder=\"笔记\"/g" reading/ReadingLog.tsx
sed -i "s/{t('common\.submit')}/提交/g" reading/ReadingLog.tsx

# Speaking/Audio components
sed -i "s/title={t('music\.upload')}/title=\"上传\"/g" speaking/AudioPlayer.tsx
sed -i "s/{t('speaking\.shadowing')}/影子跟读/g" speaking/SpeakingModules.tsx

echo "Batch fix done!"
