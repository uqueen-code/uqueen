'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { Language } from '@/types/enums';

/**
 * 🔧 关键修复：将i18n从异步fetch加载改为同步内联
 *
 * 原先的 resourcesToBackend + fetch('/locales/...') 是导致白屏和死锁的元凶：
 * - 异步加载语言包导致 hydration 不一致
 * - 网络延迟时 t() 返回 key 字符串，触发 useEffect 无限重渲染
 * - 组件 mount 时 i18n 尚未就绪，状态竞态导致主线程冻结
 *
 * 现在将所有中文翻译内联到代码中，同步初始化，零网络请求，零延迟。
 */

const ZH_CN_RESOURCES = {
  app: {
    name: '向上思考',
    shortName: '成长管理',
    tagline: '记录成长，不负时光',
  },
  nav: {
    dashboard: '仪表盘',
    fitness: '健身',
    reading: '阅读',
    learning: '学习',
    speaking: '口语',
    health: '健康',
    psychology: '心理',
    travel: '旅行',
    finance: '理财',
    business: '商业',
    settings: '设置',
  },
  psychology: {
    title: '心理空间',
    subtitle: '关注心理健康 · 接纳每一种情绪 · 做自己的心理治疗师',
    dailyKnowledge: '每日心理学知识',
    todayLabel: '今日心理知识',
    todayMood: '今日心情',
    moodPlaceholder: '今天发生了什么？记录心情日记...',
    saveMood: '保存心情',
    updateMood: '更新心情',
    moodSaved: '已记录',
    monsterName: '情绪暴食怪',
    monsterSubtitle: '把坏情绪喂给我，我帮你吃掉它！',
    feedPlaceholder: '今天有什么不开心？喂给卡比兽吧！',
    feedButton: '投喂',
    emotionsEaten: '今天已经吃掉了 {{count}} 个坏情绪',
    clearAll: '一键清空',
    clearConfirm: '确定要一键清空今天所有的不开心记录吗？',
    clearSuccess: '所有不开心已被一键格式化！页面纯净如新',
    noEmotions: '今天还没有投喂过情绪哦~',
    moodSavedToast: '心情记录已保存',
    emotionEatenToast: '坏情绪已被吃掉！',
    rateFirst: '请先打分',
    recentTrend: '最近心情趋势',
    starHint: '左半=0.5星 · 右半=1星',
  },
  travel: {
    title: '旅行探索',
    subtitle: '探索世界 · 记录足迹 · 增长见识',
    exploreMode: '白纸探索 · 世界航海图',
    footprintMode: '足迹点亮 · 世界航海图',
    toggleExplore: '白纸探索',
    toggleFootprint: '足迹点亮',
    dailyRecommendation: '每日旅行推荐',
    dailyTip: '今日旅行小贴士',
    myFootprints: '我的足迹',
    notVisited: '你还没有去过{{city}}',
    switchToFootprint: '切换到足迹模式来标记旅行记忆',
    enableFootprint: '开启足迹模式',
    visitDate: '到访日期',
    feeling: '当时感受',
    feelingPlaceholder: '那一刻，我心里在想……',
    saveFootprint: '标记足迹',
    updateFootprint: '更新足迹',
    deleteFootprint: '删除',
    editFootprint: '编辑',
    notRecorded: '未记录',
    saved: '已标记',
    updated: '足迹已更新',
    deleted: '足迹已删除',
    visited: '已点亮',
    toExplore: '待探索',
    cities: '个城市',
    selectDate: '请选择日期',
    countryKnowledge: '今日国家地理',
    history: '历史人文',
    culture: '文化特色',
    geography: '地理',
    funFacts: '冷知识',
    capital: '首都',
    population: '人口',
  },
  auth: {
    login: '登录',
    register: '注册',
    logout: '退出登录',
    email: '邮箱',
    password: '密码',
    emailPlaceholder: '请输入邮箱地址',
    passwordPlaceholder: '请输入密码',
    loginButton: '登录',
    registerButton: '注册',
    noAccount: '还没有账号？',
    hasAccount: '已有账号？',
    orContinueWith: '或通过以下方式继续',
    newUserAutoRegister: '新用户输入未注册邮箱将自动创建账号',
    loginSuccess: '登录成功',
    registerSuccess: '注册成功，请查收确认邮件',
    logoutSuccess: '已退出登录',
    errorEmailRequired: '请输入邮箱',
    errorPasswordRequired: '请输入密码',
    errorInvalidCredentials: '邮箱或密码错误',
    errorGeneric: '操作失败，请重试',
  },
  motivation: {
    title: '每日激励',
  },
  dashboard: {
    title: '核心仪表盘',
    todayTodos: '今日待办',
    tomorrowTodos: '明日待办',
    countdowns: '倒计时',
    goals: '目标管理',
    habits: '每日习惯打卡',
    heatmap: '活动热力图',
    createTodo: '创建待办',
    createCountdown: '创建倒计时',
    createGoal: '创建目标',
    noTodos: '暂无待办事项',
    noCountdowns: '暂无倒计时',
    noGoals: '暂无目标',
    daysRemaining: '天',
    overdue: '已过期',
    completed: '已完成',
  },
  fitness: {
    title: '健身管理',
    weightManagement: '体重管理',
    currentWeight: '当前体重',
    targetWeight: '目标体重',
    height: '身高',
    focusArea: '瘦身部位/方案',
    workoutPlan: '健身方案',
    acceptPlan: '接受方案',
    generatingPlan: '正在生成定制方案...',
    exerciseCheckin: '运动打卡',
    exerciseType: '运动类型',
    duration: '时长（分钟）',
    intensity: '强度',
    calories: '消耗卡路里',
    noDataPrompt: '请先填写体重和身高数据，系统将自动为你生成定制健身方案',
  },
  reading: {
    title: '阅读板块',
    dailyRecommendation: '每日推荐',
    readingLog: '阅读记录',
    bookTitle: '书名',
    author: '作者',
    chapter: '章节',
    pagesRead: '已读页数',
    notes: '笔记',
    todayRead: '今天读了什么？',
    didYouRead: '今天是否阅读？',
  },
  learning: {
    title: '学习板块',
    categories: '学习分类',
    studyPlan: '学习计划',
    methodUpload: '上传学习方法',
    localResources: '本地资料',
    acceptPlan: '接受计划',
    planAccepted: '学习计划已同步到每日待办',
  },
  speaking: {
    title: '口语练习',
    selectLanguage: '选择语言',
    shadowing: '跟读',
    pictureDescription: '看图说话',
    connectedSpeech: '练连读',
    topicReading: '话题朗读',
    playbackSpeed: '播放速度',
    subtitle: '字幕',
  },
  health: {
    title: '健康管理',
    illnessLog: '生病记录',
    menstrualLog: '月经记录',
    dailyWellness: '每日调理推荐',
    dietRecommendation: '饮食推荐',
    exerciseRecommendation: '运动推荐',
    startDate: '开始日期',
    endDate: '结束日期',
    symptoms: '症状',
    severity: '严重程度',
  },
  finance: {
    title: '理财板块',
    dailyInfo: '每日资讯',
    portfolio: '资产看板',
    stockPick: '股票推荐',
    fundPick: '基金推荐',
    knowledgeTip: '理财知识',
    addAsset: '添加资产',
    totalValue: '总资产',
    profitLoss: '盈亏',
  },
  business: {
    title: '商业板块',
    comingSoon: '敬请期待',
    description: '商业板块正在规划中，敬请期待更多精彩内容...',
  },
  settings: {
    title: '设置',
    language: '语言',
    theme: '主题',
    fontSize: '字体大小',
    global: '全局',
    perModule: '各板块独立',
    offlineMode: '离线模式',
    offlineModeDesc: '开启后数据将暂存本地，上线后自动同步',
    account: '账户设置',
    dataManagement: '数据管理',
    syncNow: '立即同步',
    exportData: '导出数据',
    clearLocalData: '清除本地数据',
  },
  common: {
    save: '保存',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    confirm: '确认',
    close: '关闭',
    loading: '加载中...',
    noData: '暂无数据',
    error: '出错了',
    success: '操作成功',
    today: '今天',
    tomorrow: '明天',
    yesterday: '昨天',
    add: '添加',
    submit: '提交',
    back: '返回',
    all: '全部',
    urgent: '加急',
    important: '重要',
    normal: '普通',
    daily: '每日',
    weekly: '每周',
    monthly: '每月',
    yearly: '每年',
    lunarYearly: '农历每年',
    completed: '已完成',
    pending: '待完成',
    online: '在线',
    offline: '离线',
    syncing: '同步中...',
    synced: '已同步',
    lastSync: '上次同步',
  },
};

// 同步初始化 i18n — 零网络请求，零延迟，零hydration问题
i18n.use(initReactI18next).init({
  defaultNS: 'common',
  fallbackLng: Language.ZH_CN,
  supportedLngs: [Language.ZH_CN],
  load: 'languageOnly',
  debug: false,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
  // 🔧 关键：内联资源，同步可用，不再 fetch
  resources: {
    [Language.ZH_CN]: {
      common: ZH_CN_RESOURCES,
    },
  },
});

export default i18n;

/**
 * 语言切换 — 现在只支持中文，切换操作为空操作
 */
export function changeLanguage(_lang: string): void {
  // 不再切换语言，强制锁定中文
}

/**
 * 获取当前语言 — 固定返回中文
 */
export function getCurrentLanguage(): string {
  return Language.ZH_CN;
}

export { i18n };
