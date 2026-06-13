'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useOfflineStore } from '@/stores/offlineStore';
import { getDatabase } from '@/lib/db/indexeddb';
import { getTodayString } from '@/lib/utils/date';
import type { TravelCity, TravelRecommendation, CountryKnowledge } from '@/types/models';

const PLACEHOLDER_USER_ID = 'local-user';

// Travel recommendations by day
const TRAVEL_RECS: Omit<TravelRecommendation, 'id' | 'date'>[] = [
  {
    destination: '京都', country: '日本', days: 5,
    attractions: ['清水寺', '伏见稻荷大社', '金阁寺', '岚山竹林', '花见小路', '二条城'],
    route: 'Day1: 抵达大阪→京都 · Day2: 清水寺→二年坂→祇园 · Day3: 伏见稻荷→金阁寺 · Day4: 岚山→天龙寺 · Day5: 二条城→返程',
    food: ['抹茶甜品', '怀石料理', '京都拉面', '豆腐料理', '和果子'],
    scenery: '千年古都，春有樱花秋有红叶。古老寺庙与日式庭园交相辉映，在岚山竹林中感受宁静，在花见小路偶遇艺妓。',
    imageUrl: null,
  },
  {
    destination: '巴塞罗那', country: '西班牙', days: 4,
    attractions: ['圣家堂', '奎尔公园', '巴特罗之家', '兰布拉大道', '哥特区', '海滩'],
    route: 'Day1: 兰布拉大道→哥特区 · Day2: 圣家堂→奎尔公园 · Day3: 巴特罗之家→米拉之家 · Day4: 海滩→返程',
    food: ['海鲜饭', '塔帕斯', '西班牙火腿', '桑格利亚酒', '吉事果'],
    scenery: '高迪的建筑奇迹与地中海风情的完美融合。在圣家堂的光影中感受神圣，在兰布拉大道感受热情洋溢的西班牙生活。',
    imageUrl: null,
  },
  {
    destination: '冰岛环岛', country: '冰岛', days: 8,
    attractions: ['蓝湖温泉', '黄金圈', '黑沙滩', '冰河湖', '北极光', '斯科加瀑布'],
    route: 'Day1-2: 雷克雅未克→黄金圈 · Day3-4: 南岸→冰河湖 · Day5-6: 东峡湾→北部 · Day7: 斯奈山半岛 · Day8: 蓝湖→返程',
    food: ['冰岛羊肉汤', '新鲜海鲜', 'Skyr酸奶', '热狗', '龙虾汤'],
    scenery: '地球上最像外星的地方——冰川与火山共存，瀑布与极光齐舞。黑色沙滩上聆听北大西洋的咆哮，在蓝湖温泉中看极光舞动。',
    imageUrl: null,
  },
  {
    destination: '清迈', country: '泰国', days: 5,
    attractions: ['素贴山双龙寺', '古城寺庙', '大象自然公园', '尼曼路', '夜市', '茵他农山'],
    route: 'Day1: 古城逛寺庙→夜市 · Day2: 素贴山→蒲屏皇宫 · Day3: 大象营 · Day4: 茵他农国家公园 · Day5: 尼曼路→返程',
    food: ['泰北咖喱面', '芒果糯米饭', '青木瓜沙拉', '泰式奶茶', '烤串'],
    scenery: '泰北玫瑰，满城花香。红墙金顶的寺庙与清新的山林相映成趣，夜市的美食和手工艺品让人流连忘返。',
    imageUrl: null,
  },
  {
    destination: '巴黎', country: '法国', days: 5,
    attractions: ['埃菲尔铁塔', '卢浮宫', '凯旋门', '蒙马特高地', '塞纳河游船', '奥赛博物馆'],
    route: 'Day1: 埃菲尔铁塔→塞纳河 · Day2: 卢浮宫→杜乐丽花园 · Day3: 凯旋门→香榭丽舍 · Day4: 蒙马特→圣心堂 · Day5: 奥赛博物馆→返程',
    food: ['可颂', '法式蜗牛', '马卡龙', '鹅肝', '法式洋葱汤'],
    scenery: '光之城——在卢浮宫与蒙娜丽莎对视，在塞纳河畔看夕阳给铁塔镀上金色，在蒙马特的小巷中寻找艺术家的灵感。',
    imageUrl: null,
  },
  {
    destination: '成都', country: '中国', days: 4,
    attractions: ['大熊猫基地', '宽窄巷子', '锦里', '都江堰', '青城山', '武侯祠'],
    route: 'Day1: 宽窄巷子→锦里 · Day2: 熊猫基地→武侯祠 · Day3: 都江堰 · Day4: 青城山→返程',
    food: ['火锅', '担担面', '夫妻肺片', '甜水面', '串串香'],
    scenery: '天府之国——看可爱的熊猫在竹林中打滚，在青城山感受道教文化，穿行于宽窄巷子的川西民居中，品味舌尖上的麻辣鲜香。',
    imageUrl: null,
  },
  {
    destination: '开普敦', country: '南非', days: 6,
    attractions: ['桌山', '好望角', '博尔德斯海滩企鹅', '花园大道', '酒庄', '信号山'],
    route: 'Day1-2: 开普敦市区→桌山 · Day3: 好望角→企鹅滩 · Day4-5: 花园大道 · Day6: 酒庄→返程',
    food: ['南非烤肉', 'Bobotie', '海鲜拼盘', '葡萄酒', 'Malva布丁'],
    scenery: '彩虹之国——站在桌山之巅俯瞰两洋交汇的壮丽，在好望角感受非洲大陆尽头的凛冽海风，看企鹅在沙滩上蹒跚漫步。',
    imageUrl: null,
  },
];

// Country knowledge
const COUNTRY_KNOWLEDGE: Omit<CountryKnowledge, 'id' | 'date'>[] = [
  {
    country: '日本', capital: '东京', flag: '🇯🇵', population: '约1.25亿',
    funFacts: [
      '日本是世界上唯一一个仍有在位天皇的国家，延续了2600多年的菊花王朝',
      '日本有超过550万家自动售货机，平均每23人拥有一台',
      '日本茶道讲究"一期一会"——把每一次相会都当作一生中唯一的一次来珍惜',
    ],
    history: '日本列岛有人类居住的历史可追溯到旧石器时代。公元4世纪大和政权统一日本，7世纪的大化改新引入中国制度。12世纪进入武家政权时代，经历镰仓、室町、战国、江户幕府。1868年明治维新使日本迅速现代化，二战后成为世界经济强国。',
    culture: '神道教与佛教并存，形成了独特的"和"文化。追求极致与细节——从寿司制作到新干线准点率，无不体现工匠精神。浮世绘、茶道、花道、剑道等传统文化在现代生活中仍有鲜活的生命力。',
    geography: '位于太平洋西北部的岛国，由北海道、本州、四国、九州四个大岛及约6800个小岛组成。多山地形占国土约73%，富士山为最高峰（3776米）。位于环太平洋地震带，每年发生约1500次有感地震。',
  },
  {
    country: '意大利', capital: '罗马', flag: '🇮🇹', population: '约5900万',
    funFacts: [
      '意大利是世界上拥有联合国教科文组织世界遗产最多的国家（59处）',
      '罗马的特雷维喷泉每天"收到"约3000欧元的硬币',
      '意大利人发明了电池（伏打）、钢琴（克里斯多福里）和温度计（伽利略）',
    ],
    history: '古罗马文明是西方文明的基石之一。从罗马共和国到罗马帝国，再到中世纪的城邦共和国（威尼斯、佛罗伦萨），意大利一直是欧洲文明的中心。文艺复兴在14-17世纪的佛罗伦萨诞生，达芬奇、米开朗基罗、拉斐尔等大师改变了人类艺术史。1861年意大利统一。',
    culture: 'La Dolce Vita（甜蜜的生活）——美食、艺术、时尚、设计。意大利人认为吃饭不仅是果腹，更是社交和享受。从北部的烩饭到南部的那不勒斯披萨，每个地区都有引以为豪的美食传统。',
    geography: '位于南欧的靴形半岛，延伸入地中海。北部有阿尔卑斯山脉，中部为亚平宁山脉，南部有埃特纳和维苏威等活火山。海岸线长达7600公里，撒丁岛和西西里岛是地中海最大的岛屿。',
  },
  {
    country: '冰岛', capital: '雷克雅未克', flag: '🇮🇸', population: '约38万',
    funFacts: [
      '冰岛没有军队，是世界上最小的北约成员国',
      '冰岛人相信精灵和巨魔的存在，有些道路甚至会绕过"精灵居住的岩石"',
      '冰岛的羊数量是人口的2倍多（约80万只）',
    ],
    history: '公元874年，挪威人英格尔夫·阿纳尔松成为第一个定居冰岛的维京人。930年成立的阿尔廷（议会）是世界上现存最古老的议会。冰岛经历了挪威和丹麦统治，1944年成为独立共和国。',
    culture: '北欧神话的传承者——从《埃达》到现代冰岛文学，讲故事是冰岛人的DNA。冰岛有惊人的音乐传统，比约克、Sigur Rós等享誉世界。冰岛的犯罪率极低，警察通常不配枪。',
    geography: '北大西洋的火山岛国，位于大西洋中脊之上。有200多座火山，其中30座是活火山。冰川覆盖约11%的国土。地热资源丰富，99%的电力来自可再生能源。冬季可见北极光，夏季有午夜太阳。',
  },
  {
    country: '埃及', capital: '开罗', flag: '🇪🇬', population: '约1.1亿',
    funFacts: [
      '胡夫金字塔是古代世界七大奇迹中唯一仍然存在的',
      '古埃及人发明了365天的太阳历，是现代公历的前身',
      '埃及猫是最早被驯化的猫品种之一，古埃及人崇拜猫女神芭丝特',
    ],
    history: '世界上最古老的文明之一。公元前3100年左右，那尔迈统一上下埃及，开启法老时代。经历古王国（金字塔时代）、中王国、新王国（图坦卡蒙时代），后先后被亚述、波斯、希腊、罗马、阿拉伯统治。1922年图坦卡蒙墓被发现，震惊世界。',
    culture: '伊斯兰文化与古埃及文明的交织。开罗被称为"千塔之城"，清真寺遍布全城。埃及人热情好客，"欢迎"是他们最常说的词。水烟馆是社交生活的重要组成部分。',
    geography: '位于非洲东北部，尼罗河纵贯全境——埃及是"尼罗河的赠礼"。国土约96%为沙漠（撒哈拉沙漠和阿拉伯沙漠）。苏伊士运河连接地中海和红海，是全球最重要的航运通道之一。',
  },
  {
    country: '新西兰', capital: '惠灵顿', flag: '🇳🇿', population: '约520万',
    funFacts: [
      '新西兰是第一个赋予女性投票权的国家（1893年）',
      '新西兰没有蛇，完全没有——法律禁止进口蛇类',
      '新西兰的羊曾是人口的20倍，至今仍比人多',
    ],
    history: '毛利人是新西兰最早的居民，约在公元1250-1300年从波利尼西亚迁徙而来。1642年荷兰人塔斯曼首先发现新西兰，1769年库克船长详细测绘。1840年《怀唐伊条约》签订，新西兰成为英国殖民地。1907年成为自治领。',
    culture: '独特的毛利文化是新西兰的灵魂——哈卡战舞、毛利纹身、波伊舞都充满力量。Kiwi（奇异鸟）是新西兰人的自称。户外运动文化浓厚，蹦极和喷射快艇都诞生于此。',
    geography: '位于南太平洋，由北岛、南岛及数百个小岛组成。南岛有南阿尔卑斯山脉和壮丽的峡湾，北岛有火山高原和地热区。《指环王》三部曲在此取景，中土世界的风景真实存在。',
  },
];

export function useTravel() {
  const [cities, setCities] = useState<TravelCity[]>([]);
  const [showVisited, setShowVisited] = useState(false);
  const [dailyRecommendation, setDailyRecommendation] = useState<TravelRecommendation | null>(null);
  const [countryKnowledge, setCountryKnowledge] = useState<CountryKnowledge | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const user = useAuthStore((s) => s.user);
  const addToSyncQueue = useOfflineStore((s) => s.addToSyncQueue);

  const userId = user?.id ?? PLACEHOLDER_USER_ID;
  const today = getTodayString();
  const dayIdx = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const db = getDatabase();
      const [cs, tr, ck] = await Promise.all([
        db.travelCities.where('userId').equals(userId).toArray(),
        db.travelRecommendations.where('date').equals(today).first(),
        db.countryKnowledge.where('date').equals(today).first(),
      ]);

      setCities(cs.map(c => ({
        id: c.id, userId: c.userId, city: c.city, country: c.country,
        lat: c.lat, lng: c.lng, visitDate: c.visitDate, feeling: c.feeling,
        isVisited: c.isVisited, createdAt: c.createdAt,
      })));

      if (tr) {
        setDailyRecommendation({
          id: tr.id, date: tr.date, destination: tr.destination, country: tr.country,
          days: tr.days, attractions: tr.attractions, route: tr.route,
          food: tr.food, scenery: tr.scenery, imageUrl: tr.imageUrl,
        });
      } else {
        const rec = TRAVEL_RECS[dayIdx % TRAVEL_RECS.length]!;
        const newRec: TravelRecommendation = { id: `tr_${today}`, date: today, ...rec };
        await db.travelRecommendations.put(newRec);
        setDailyRecommendation(newRec);
      }

      if (ck) {
        setCountryKnowledge({
          id: ck.id, date: ck.date, country: ck.country, capital: ck.capital,
          flag: ck.flag, population: ck.population, funFacts: ck.funFacts,
          history: ck.history, culture: ck.culture, geography: ck.geography,
        });
      } else {
        const know = COUNTRY_KNOWLEDGE[dayIdx % COUNTRY_KNOWLEDGE.length]!;
        const newKnow: CountryKnowledge = { id: `ck_${today}`, date: today, ...know };
        await db.countryKnowledge.put(newKnow);
        setCountryKnowledge(newKnow);
      }
    } catch { /* */ }
    finally { setIsLoading(false); }
  }, [userId, today, dayIdx]);

  useEffect(() => { loadData(); }, [loadData]);

  // Toggle visited city
  const toggleCity = useCallback(async (cityData: {
    city: string; country: string; lat: number; lng: number;
  }, visitDate?: string, feeling?: string) => {
    const existing = cities.find(c => c.city === cityData.city && c.country === cityData.country);
    const db = getDatabase();

    if (existing && existing.isVisited) {
      // Unmark as visited
      await db.travelCities.update(existing.id, {
        isVisited: false, visitDate: null, feeling: null,
        _synced: false, _modifiedAt: Date.now(),
      });
      setCities(prev => prev.map(c => c.id === existing.id
        ? { ...c, isVisited: false, visitDate: null, feeling: null }
        : c));
    } else if (existing) {
      // Mark existing as visited
      await db.travelCities.update(existing.id, {
        isVisited: true, visitDate: visitDate || null, feeling: feeling || null,
        _synced: false, _modifiedAt: Date.now(),
      });
      setCities(prev => prev.map(c => c.id === existing.id
        ? { ...c, isVisited: true, visitDate: visitDate || null, feeling: feeling || null }
        : c));
    } else {
      // Create new city entry
      const id = crypto.randomUUID?.() ?? `city_${Date.now()}`;
      const city: TravelCity = {
        id, userId, ...cityData,
        visitDate: visitDate || null, feeling: feeling || null,
        isVisited: true, createdAt: new Date().toISOString(),
      };
      await db.travelCities.put({ ...city, _synced: false, _modifiedAt: Date.now() });
      setCities(prev => [...prev, city]);
    }
  }, [cities, userId]);

  const visitedCities = cities.filter(c => c.isVisited);

  return {
    cities, visitedCities, showVisited, dailyRecommendation, countryKnowledge,
    isLoading, setShowVisited, toggleCity, refresh: loadData,
  };
}
