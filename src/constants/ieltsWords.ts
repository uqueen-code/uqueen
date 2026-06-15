/**
 * 雅思核心词汇数据源 — 精选高频词汇/短语
 * 每个词条包含：单词、音标、释义、搭配、真题例句
 */

export interface IeltsWord {
  id: number;
  word: string;
  phonetic: string;
  meaning: string;
  collocation: string;
  exampleEn: string;
  exampleZh: string;
}

export const IELTS_WORDS: IeltsWord[] = [
  {
    id: 1,
    word: 'accumulate',
    phonetic: '/əˈkjuːmjəleɪt/',
    meaning: 'v. 积累，积聚',
    collocation: 'accumulate wealth / accumulate knowledge / accumulate evidence',
    exampleEn: 'Over the course of a lifetime, people tend to accumulate a vast repository of knowledge that shapes their worldview.',
    exampleZh: '在一生中，人们往往会积累大量的知识储备，这些知识塑造了他们看待世界的方式。',
  },
  {
    id: 2,
    word: 'cope with',
    phonetic: '/kəʊp wɪð/',
    meaning: 'phr. 应对，处理（困难）',
    collocation: 'cope with stress / cope with pressure / cope with challenges',
    exampleEn: 'Governments must develop comprehensive strategies to cope with the mounting pressure of an ageing population.',
    exampleZh: '各国政府必须制定全面的策略来应对日益增长的老龄化人口压力。',
  },
  {
    id: 3,
    word: 'foster',
    phonetic: '/ˈfɒstə(r)/',
    meaning: 'v. 促进，培养，寄养',
    collocation: 'foster innovation / foster creativity / foster a sense of community',
    exampleEn: 'A well-designed curriculum should not only impart knowledge but also foster critical thinking and intellectual curiosity.',
    exampleZh: '精心设计的课程不仅应当传授知识，还应当培养批判性思维和求知欲。',
  },
  {
    id: 4,
    word: 'mitigate',
    phonetic: '/ˈmɪtɪɡeɪt/',
    meaning: 'v. 减轻，缓解',
    collocation: 'mitigate risks / mitigate the effects / mitigate climate change',
    exampleEn: 'Planting more trees in urban areas can significantly mitigate the adverse effects of air pollution on residents.',
    exampleZh: '在城市区域种植更多树木可以显著减轻空气污染对居民的不良影响。',
  },
  {
    id: 5,
    word: 'ubiquitous',
    phonetic: '/juːˈbɪkwɪtəs/',
    meaning: 'adj. 无处不在的，普遍存在的',
    collocation: 'ubiquitous technology / ubiquitous presence / become ubiquitous',
    exampleEn: 'Smartphones have become so ubiquitous in modern society that it is difficult to imagine daily life without them.',
    exampleZh: '智能手机在现代社会中已经变得如此普遍，以至于很难想象没有它们的日常生活。',
  },
  {
    id: 6,
    word: 'exacerbate',
    phonetic: '/ɪɡˈzæsəbeɪt/',
    meaning: 'v. 加剧，使恶化',
    collocation: 'exacerbate the problem / exacerbate tensions / exacerbate inequality',
    exampleEn: 'The widening gap between the rich and the poor could further exacerbate social tensions and political instability.',
    exampleZh: '日益扩大的贫富差距可能进一步加剧社会紧张局势和政治不稳定。',
  },
  {
    id: 7,
    word: 'predominantly',
    phonetic: '/prɪˈdɒmɪnəntli/',
    meaning: 'adv. 主要地，占主导地',
    collocation: 'predominantly rural / predominantly male / consist predominantly of',
    exampleEn: 'The workforce in the manufacturing sector is still predominantly male, though the gender ratio is gradually shifting.',
    exampleZh: '制造业的劳动力仍然以男性为主，不过性别比例正在逐渐变化。',
  },
  {
    id: 8,
    word: 'detrimental',
    phonetic: '/ˌdetrɪˈmentl/',
    meaning: 'adj. 有害的，不利的',
    collocation: 'detrimental effect / detrimental to health / prove detrimental',
    exampleEn: 'Prolonged exposure to loud noise can have a detrimental impact on both hearing and mental well-being.',
    exampleZh: '长时间暴露在嘈杂环境中会对听力和心理健康产生有害影响。',
  },
  {
    id: 9,
    word: 'take into account',
    phonetic: '/teɪk ˈɪntə əˈkaʊnt/',
    meaning: 'phr. 考虑到，顾及',
    collocation: 'take into account the fact / take into consideration / fail to take into account',
    exampleEn: 'When designing public transport systems, urban planners must take into account the needs of disabled and elderly citizens.',
    exampleZh: '在设计公共交通系统时，城市规划者必须考虑到残障人士和老年市民的需求。',
  },
  {
    id: 10,
    word: 'profound',
    phonetic: '/prəˈfaʊnd/',
    meaning: 'adj. 深刻的，深远的',
    collocation: 'profound impact / profound influence / profound understanding',
    exampleEn: 'The invention of the Internet has brought about profound changes in the way people communicate and access information.',
    exampleZh: '互联网的发明给人们的交流方式和信息获取方式带来了深远的变化。',
  },
  {
    id: 11,
    word: 'implement',
    phonetic: '/ˈɪmplɪment/',
    meaning: 'v. 实施，执行',
    collocation: 'implement a policy / implement measures / implement reforms',
    exampleEn: 'It took the government three years to fully implement the new healthcare reform across all provinces.',
    exampleZh: '政府花了三年时间才在所有省份全面实施新的医疗改革。',
  },
  {
    id: 12,
    word: 'phenomenon',
    phonetic: '/fɪˈnɒmɪnən/',
    meaning: 'n. 现象',
    collocation: 'social phenomenon / natural phenomenon / global phenomenon',
    exampleEn: 'The rise of remote working is not a temporary trend but a lasting phenomenon that will reshape urban economies.',
    exampleZh: '远程办公的兴起不是一种暂时的趋势，而是一种将重塑城市经济的持久现象。',
  },
  {
    id: 13,
    word: 'conducive',
    phonetic: '/kənˈdjuːsɪv/',
    meaning: 'adj. 有助于…的，有益的',
    collocation: 'conducive to learning / conducive to growth / conducive environment',
    exampleEn: 'A quiet and well-lit study space is highly conducive to effective learning and long-term retention of information.',
    exampleZh: '安静明亮的学习空间非常有助于高效学习和信息的长期记忆。',
  },
  {
    id: 14,
    word: 'inevitable',
    phonetic: '/ɪnˈevɪtəbl/',
    meaning: 'adj. 不可避免的，必然发生的',
    collocation: 'inevitable consequence / inevitable outcome / almost inevitable',
    exampleEn: 'With the rapid advancement of automation, the displacement of certain manual jobs seems almost inevitable.',
    exampleZh: '随着自动化的快速发展，某些体力劳动岗位的被取代几乎是不可避免的。',
  },
  {
    id: 15,
    word: 'strike a balance',
    phonetic: '/straɪk ə ˈbæləns/',
    meaning: 'phr. 取得平衡，权衡',
    collocation: 'strike a balance between A and B / strike the right balance',
    exampleEn: 'Modern parents often struggle to strike a balance between their career ambitions and family responsibilities.',
    exampleZh: '现代父母常常难以在事业追求和家庭责任之间取得平衡。',
  },
];

export type ReviewStatus = 'new' | 'review' | 'blurry' | 'mastered';

export interface WordProgress {
  id: number;
  status: ReviewStatus;
  lastReviewed: string | null;
  reviewCount: number;
}

export const STORAGE_KEY = 'ielts_vocab_progress';
