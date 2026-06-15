// Static language dictionary — zero async loading, zero useEffect triggers
// All UI strings live here. Switch language = read from different key set.

export type LangKey = 'zh'|'en';
export const LANGS: LangKey[] = ['zh','en'];

interface Dict {[key:string]:string}

const zh: Dict = {
  'app.name':'向上思考','app.short':'向上思考',
  'nav.dashboard':'仪表盘','nav.fitness':'健身','nav.reading':'阅读','nav.learning':'学习','nav.speaking':'口语','nav.health':'健康','nav.psychology':'心理','nav.travel':'旅行','nav.finance':'理财','nav.business':'商业',
  'auth.login':'登录','auth.logout':'退出登录',
  'common.save':'保存','common.cancel':'取消','common.delete':'删除','common.edit':'编辑','common.loading':'加载中...','common.close':'关闭','common.confirm':'确认','common.online':'在线','common.offline':'离线',
  'motivation.title':'每日激励',
  'psychology.title':'心理空间','psychology.subtitle':'关注心理健康 · 接纳每一种情绪 · 做自己的心理治疗师','psychology.dailyKnowledge':'每日心理学知识','psychology.todayLabel':'今日心理知识','psychology.todayMood':'今日心情','psychology.moodPlaceholder':'今天发生了什么？记录心情日记...','psychology.saveMood':'保存心情','psychology.updateMood':'更新心情','psychology.moodSaved':'已记录 · 同步到待办','psychology.monsterName':'情绪暴食怪','psychology.monsterSubtitle':'把坏情绪喂给我，我帮你吃掉它！','psychology.feedPlaceholder':'今天有什么不开心？喂给卡比兽吧！','psychology.feedButton':'投喂','psychology.emotionsEaten':'今天已经吃掉了 {count} 个坏情绪','psychology.clearAll':'一键清空','psychology.clearConfirm':'确定要一键清空今天所有的不开心记录吗？','psychology.clearSuccess':'所有不开心已被一键格式化！','psychology.noEmotions':'今天还没有投喂过情绪哦~','psychology.moodSavedToast':'心情记录已保存','psychology.emotionEatenToast':'坏情绪已被吃掉！','psychology.rateFirst':'请先打分','psychology.recentTrend':'最近心情趋势','psychology.starHint':'左半=0.5星 · 右半=1星',
  'travel.title':'旅行探索','travel.subtitle':'探索世界 · 记录足迹 · 增长见识','travel.exploreMode':'白纸探索 · 世界航海图','travel.footprintMode':'足迹点亮 · 世界航海图','travel.toggleExplore':'白纸探索','travel.toggleFootprint':'足迹点亮','travel.dailyRecommendation':'每日旅行推荐','travel.dailyTip':'今日旅行小贴士','travel.myFootprints':'我的足迹','travel.notVisited':'你还没有去过{city}','travel.switchToFootprint':'切换到足迹模式来标记旅行记忆','travel.enableFootprint':'开启足迹模式','travel.visitDate':'到访日期','travel.feeling':'当时感受','travel.feelingPlaceholder':'那一刻，我心里在想……','travel.saveFootprint':'标记足迹','travel.updateFootprint':'更新足迹','travel.deleteFootprint':'删除','travel.editFootprint':'编辑','travel.notRecorded':'未记录','travel.saved':'已标记','travel.updated':'足迹已更新','travel.deleted':'足迹已删除','travel.visited':'已点亮','travel.toExplore':'待探索','travel.cities':'个城市','travel.selectDate':'请选择日期','travel.countryKnowledge':'今日国家地理','travel.history':'历史人文','travel.culture':'文化特色','travel.geography':'地理','travel.funFacts':'冷知识','travel.capital':'首都','travel.population':'人口',
  'news.title':'近期时政新闻','news.subtitle':'Current Affairs · 双语时政阅读','news.readMore':'展开全文','news.collapse':'收起',
  'learning.title':'学习板块','learning.categories':'学习分类','learning.reading':'每日精选 · 2篇雅思长文','learning.vocab':'核心词汇','learning.checkin':'打卡阅读','learning.checked':'已打卡','learning.plan':'计划','learning.mindmap':'导图','learning.news':'新闻',
  'settings.title':'设置','settings.language':'语言','settings.theme':'主题',
};

const en: Dict = {
  'app.name':'Personal Growth Platform','app.short':'Growth',
  'nav.dashboard':'Dashboard','nav.fitness':'Fitness','nav.reading':'Reading','nav.learning':'Learning','nav.speaking':'Speaking','nav.health':'Health','nav.psychology':'Psychology','nav.travel':'Travel','nav.finance':'Finance','nav.business':'Business',
  'auth.login':'Sign In','auth.logout':'Sign Out',
  'common.save':'Save','common.cancel':'Cancel','common.delete':'Delete','common.edit':'Edit','common.loading':'Loading...','common.close':'Close','common.confirm':'Confirm','common.online':'Online','common.offline':'Offline',
  'motivation.title':'Daily Motivation',
  'psychology.title':'Psychology Space','psychology.subtitle':'Mind your mental health · Embrace every emotion','psychology.dailyKnowledge':'Daily Psychology','psychology.todayLabel':'Today Knowledge','psychology.todayMood':'Today Mood','psychology.moodPlaceholder':'What happened today? Journal...','psychology.saveMood':'Save Mood','psychology.updateMood':'Update Mood','psychology.moodSaved':'Saved · Synced','psychology.monsterName':'Mood Eater','psychology.monsterSubtitle':'Feed me your bad vibes!','psychology.feedPlaceholder':'What is bothering you? Feed Snorlax!','psychology.feedButton':'Feed','psychology.emotionsEaten':'Eaten {count} bad vibes today','psychology.clearAll':'Clear All','psychology.clearConfirm':'Clear all today emotion records?','psychology.clearSuccess':'All cleared! Fresh start!','psychology.noEmotions':'No emotions fed today~','psychology.moodSavedToast':'Mood saved','psychology.emotionEatenToast':'Bad vibes eaten!','psychology.rateFirst':'Please rate first','psychology.recentTrend':'Recent Trend','psychology.starHint':'Left=0.5☆ · Right=1☆',
  'travel.title':'Travel Explorer','travel.subtitle':'Explore · Record · Expand','travel.exploreMode':'Blank Canvas · World Chart','travel.footprintMode':'Footprints Lit · World Chart','travel.toggleExplore':'Explore','travel.toggleFootprint':'Footprints','travel.dailyRecommendation':'Daily Travel Pick','travel.dailyTip':'Travel Tip','travel.myFootprints':'My Footprints','travel.notVisited':'You have not been to {city}','travel.switchToFootprint':'Switch to footprint mode','travel.enableFootprint':'Enable Footprints','travel.visitDate':'Visit Date','travel.feeling':'How You Felt','travel.feelingPlaceholder':'In that moment...','travel.saveFootprint':'Mark','travel.updateFootprint':'Update','travel.deleteFootprint':'Delete','travel.editFootprint':'Edit','travel.notRecorded':'N/A','travel.saved':'Marked','travel.updated':'Updated','travel.deleted':'Deleted','travel.visited':'Visited','travel.toExplore':'Explore','travel.cities':' cities','travel.selectDate':'Select date','travel.countryKnowledge':'Country Knowledge','travel.history':'History','travel.culture':'Culture','travel.geography':'Geography','travel.funFacts':'Fun Facts','travel.capital':'Capital','travel.population':'Population',
  'news.title':'Current Affairs','news.subtitle':'Bilingual News Reading','news.readMore':'Read More','news.collapse':'Collapse',
  'learning.title':'Learning','learning.categories':'Categories','learning.reading':'Daily 2 IELTS Articles','learning.vocab':'Vocabulary','learning.checkin':'Check In','learning.checked':'Done','learning.plan':'Plan','learning.mindmap':'Map','learning.news':'News',
  'settings.title':'Settings','settings.language':'Language','settings.theme':'Theme',
};

const DICTS: Record<LangKey,Dict> = {zh,en};

// Direct synchronous lookup — no async, no useEffect triggers
export function t(lang:LangKey,key:string,vars?:Record<string,string|number>):string{
  let val=DICTS[lang]?.[key]??DICTS['zh']?.[key]??key;
  if(vars){for(const[k,v]of Object.entries(vars))val=val.replace(`{${k}}`,String(v));}
  return val;
}

// Save to localStorage
export function saveLang(lang:LangKey){try{localStorage.setItem('appLang',lang);}catch{/*noop*/}}
export function loadLang():LangKey{try{const v=localStorage.getItem('appLang');if(v==='zh'||v==='en')return v;}catch{/*noop*/}return'zh';}
