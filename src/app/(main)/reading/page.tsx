'use client';

import { useState, useCallback } from 'react';
import { BookOpen, BookMarked, Sparkles, Quote, CheckCircle2, History, Clock, BookCopy, ScrollText } from 'lucide-react';
import { useReading } from '@/hooks/useReading';
import { useTodos } from '@/hooks/useTodos';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { ModuleCategory, Priority } from '@/types/enums';
import toast from 'react-hot-toast';

// Expanded daily history events with rich detail
const HISTORY_EVENTS = [
  {
    date: '6月12日', type: '世界历史',
    event: '1964年6月12日，纳尔逊·曼德拉被南非种族隔离政权判处终身监禁。他在罗本岛的石灰石采石场度过了18年，狭小的牢房里没有床，只有一张薄垫。然而正是在狱中，曼德拉完成了伦敦大学的法学学位，并秘密撰写了自传手稿。1990年出狱时，他选择原谅了狱警——"当我走出监狱大门，我就知道，如果我不能把痛苦和怨恨留在身后，那么其实我仍在狱中。"1994年他成为南非第一位黑人总统，用真相与和解委员会代替了复仇，避免了内战，带领国家和平转型。他的故事证明了：宽恕比仇恨更有力量，和解比复仇更需要勇气。',
  },
  {
    date: '6月13日', type: '世界历史',
    event: '公元前323年6月13日，亚历山大大帝在巴比伦宫中去世，年仅32岁。临终前将军们问他："帝国传给谁？"他说："传给最强的人。"这句话引发了长达40年的继业者战争，横跨欧亚非的帝国分裂为数个希腊化王国。亚历山大13岁师从亚里士多德，20岁即位，十年间征服了从希腊到印度河流域的广袤土地，从未打过一次败仗。他不仅是一个征服者——他在各地建立了70多座"亚历山大城"，推行希腊文化与当地文化的融合，开启了"希腊化时代"。埃及的亚历山大图书馆、印度的希腊式佛像艺术、罗马人模仿的希腊雕塑，源头都来自这位英年早逝的天才。历史学家感叹：如果他活到60岁，世界今天可能都说希腊语。',
  },
  {
    date: '6月14日', type: '中国历史',
    event: '公元1275年（元至元十二年）6月，马可·波罗到达元上都，觐见元世祖忽必烈。这位威尼斯商人之子在元朝为官17年，游历了中国的大江南北——从大都（北京）的恢弘宫殿到杭州"上有天堂下有苏杭"的繁华市井，从扬子江上的千帆竞渡到云南的异域风情。他惊叹于中国人使用纸币（比欧洲早几百年）、用煤炭做燃料（欧洲人以为是"能燃烧的石头"）、建立了遍布全国的驿站系统。1298年在热那亚狱中口述的《马可·波罗游记》最初被欧洲人当作天方夜谭，但200年后，哥伦布正是带着这本书踏上了寻找"契丹"（中国）的航程——他没找到中国，却意外发现了美洲。一本书改变世界的格局——这就是文字的力量。',
  },
  {
    date: '6月15日', type: '世界历史',
    event: '1215年6月15日，英格兰国王约翰在温莎附近的兰尼米德草地上，被贵族们逼迫签署了《大宪章》。这份写在羊皮纸上的文件只有63条，但其中两条改变了世界："任何自由人不得被逮捕、监禁、剥夺财产或放逐，除非经过法律的正当程序"以及"不得剥夺任何人接受公正审判的权利。"约翰王签完之后立刻就反悔了，教皇也宣布它无效，内战继续。但《大宪章》的理念播种了——400年后它被英国议会重新发现，成为限制王权的法律武器；600年后它影响了美国宪法和《权利法案》；800年后，全世界几乎所有国家的宪法中都能找到它的影子。一个被迫的承诺，终结了"王权神授"的绝对主义，开启了"法治"的时代。',
  },
  {
    date: '6月16日', type: '中国历史',
    event: '1916年6月6日（农历五月初六），袁世凯在当了83天"皇帝"后病逝。这位北洋军阀的领袖在临终前留下遗言："为日本去一大敌，看中国再造共和。"他的一生充满矛盾——他是小站练兵的改革者，也是解散国会的独裁者；他逼清帝退位终结了帝制，自己却忍不住要当皇帝。他的称帝失败让所有后来者明白了一个道理：在中国，帝制已经彻底失去了合法性。蔡锷在云南发动的护国战争成为压垮"洪宪帝制"的最后一根稻草。梁启超评论说："袁氏之败，不在于兵，而在于人心。"历史用83天给了一个深刻的教训：倒退是没有出路的。',
  },
  {
    date: '6月17日', type: '世界历史',
    event: '1885年6月17日，自由女神像从法国运抵纽约港。这座46米高的铜像是法国人民送给美国独立100周年的礼物，由雕塑家巴托尔迪设计，埃菲尔铁塔的设计者古斯塔夫·埃菲尔负责内部铁架结构。它被拆成350块装进214个箱子飘洋过海。底座上刻着女诗人拉扎鲁斯的诗篇《新巨人》："把那些疲惫的、贫困的、蜷缩的、渴望自由呼吸的人们交给我；把那些无家可归、历经风浪的人们送来，我在这金色大门旁高举明灯！"此后的一个多世纪里，超过1200万移民在进入纽约港时第一眼看到的就是这尊雕像。但对很多人来说，自由的承诺和现实的落差之间有一段漫长的路程。自由女神左手握着的《独立宣言》上刻着7月4日——那一天美国的建国者们宣布"人人生而平等"，然而美国用了近200年才在法律上真正实现了这个承诺。',
  },
  {
    date: '6月18日', type: '中国历史',
    event: '公元618年6月18日（唐武德元年五月甲子），李渊在长安太极殿正式称帝，建立唐朝。这个朝代将统治中国289年，成为当时世界上最强盛的帝国。唐朝的开放令人惊叹：长安城有超过100万人口，其中外国人超过2万——波斯商人、日本遣唐使、印度僧侣、粟特乐师、阿拉伯旅行者；街头可以听到突厥语、梵语、波斯语；西市有胡人开的酒肆，胡姬跳着西域的胡旋舞。科举制度在唐朝正式成熟，让平民有了"朝为田舍郎，暮登天子堂"的可能。李白、杜甫、王维的诗篇至今被诵读，颜真卿、柳公权的书法被奉为圭臬。当欧洲还处在中世纪的"黑暗时代"，长安的不夜城里灯火通明——这是中华文明最璀璨的篇章。直到今天，海外华人聚集区仍被称为"唐人街"，那是对一个伟大时代的集体记忆。',
  },
  {
    date: '6月19日', type: '世界历史',
    event: '1865年6月19日，美国德克萨斯州加尔维斯顿的奴隶们终于得知他们已经自由了——此时林肯的《解放奴隶宣言》已经生效了两年半，内战也已经结束了两个多月。消息的延迟不是因为交通，而是因为奴隶主刻意隐瞒。这一天被称为"六月节"（Juneteenth），成为美国黑人历史上最重要的纪念日。然而，解放并不意味着平等——随之而来的是近100年的吉姆·克劳种族隔离法、三K党的恐怖暴力，以及直到1964年才通过的《民权法案》。2021年，六月节正式成为美国联邦假日。从1865年到2021年，这条路走了156年。马丁·路德·金说过："道德宇宙的弧线很长，但它弯向正义。"这句真理在今天依然让人警醒。',
  },
  {
    date: '6月20日', type: '中国历史',
    event: '1405年7月11日（永乐三年六月十五），郑和率领240多艘船、27000多人从南京龙江关起锚，开启了中国历史上最壮观的航海时代。最大的宝船长约125米、宽约50米——哥伦布的圣玛利亚号在它旁边就像一艘救生艇。郑和七下西洋，最远到达东非的索马里和肯尼亚，比达·伽马绕过好望角早了近一个世纪。但与后来的欧洲殖民者不同，郑和的舰队没有占领一寸土地，没有建立一个殖民地，而是进行朝贡贸易和文化交流。他的外交原则写在石碑上："不可欺寡，不可凌弱，共享太平之福。"然而1433年郑和去世后，明朝皇帝下令销毁所有航海图纸，实行海禁。中国主动关上了通往海洋的大门——这个决定影响了此后600年的世界格局。有人说这是一个"失落的机遇"，但也有人说这正是中华文明的特质：不靠掠夺，而靠和平交流。',
  },
  {
    date: '6月21日', type: '世界历史',
    event: '1948年6月24日，苏联封锁了通往西柏林的所有陆路和水路，企图迫使西方盟国放弃柏林。西柏林的250万居民面临断粮断煤的困境。西方盟国的回应堪称20世纪最伟大的后勤奇迹——柏林空运。在接下来的11个月里，美国和英国飞机每天24小时不间断地在滕珀尔霍夫机场起降，平均每90秒就有一架飞机降落。总共飞行了27.8万架次，运送了230万吨物资，包括食品、煤炭、药品，甚至还有给孩子们的糖果——"糖果轰炸机"飞行员哈尔沃森因为往机场围栏外丢糖果而成为柏林儿童心目中的英雄。1949年5月12日，苏联解除了封锁。柏林空运证明了：有时候最强大的武器不是炸弹，而是一袋面粉、一块煤、一颗糖。这是冷战中人道主义战胜强权的时刻。',
  },
  {
    date: '6月22日', type: '中国历史',
    event: '公元前278年五月初五（农历），楚国诗人屈原在汨罗江投江自沉。他是中国文学史上第一个留下名字的诗人，也是浪漫主义文学的奠基人。在《离骚》中他写道："长太息以掩涕兮，哀民生之多艰。""路漫漫其修远兮，吾将上下而求索。"这些句子穿越2300年，今天每一个中国学生都能背诵。屈原的悲剧在于他太爱自己的国家——他主张改革、联齐抗秦，却被馋言所害流放江南。在流放中他写了《九歌》《天问》《九章》等不朽诗篇。楚国最终被秦国灭亡，但屈原用他的死换来了永恒——两千多年来，人们用赛龙舟、包粽子的方式纪念他。一个诗人能活在一个民族的集体记忆中两千年，这本身就是人类历史上独一无二的现象。端午节不仅是吃粽子的节日，更是一个关于忠诚、气节和理想主义的精神图腾。',
  },
  {
    date: '6月23日', type: '世界历史',
    event: '1894年6月23日，在法国人顾拜旦男爵的号召下，国际奥林匹克委员会在巴黎索邦大学成立。顾拜旦深受古希腊文明的启发，他认为体育运动可以培养"健全的精神寓于健全的身体"，更重要的是——通过体育竞技来促进国际间的理解和和平。他有一句名言："奥运会最重要的不是胜利，而是参与；正如人生最重要的不是凯旋，而是奋斗；重要的不是征服，而是拼搏。"1896年第一届现代奥运会在雅典举行，当时只有14个国家241名运动员参加。2024年巴黎奥运会已有200多个国家和地区参与。但奥运会的历史也充满波折：两次世界大战期间的奥运会、1936年柏林奥运会被纳粹利用、1972年慕尼黑惨案、冷战期间的相互抵制……顾拜旦的理想主义和现实的复杂交织在一起，正如他所说："奥运会是战争的替代品——把人类的争强好胜引导到体育场上，而不是战场上。"',
  },
  {
    date: '6月24日', type: '中国历史',
    event: '1127年（靖康二年），金兵攻破汴京（开封），掳走徽宗、钦宗二帝和后妃、皇子、宗室、贵戚等3000余人北去，北宋灭亡。这是中国历史上最惨烈的一幕——"靖康之耻"。徽宗是一位天才的艺术家（他的瘦金体书法至今无人超越），却是一个失败的皇帝。他沉迷于书画花石，将朝政委于奸臣，最终让一个繁荣的帝国轰然倒塌。赵明诚之妻李清照在《金石录后序》中记述了南渡的仓皇："四十年所蓄，一旦化为灰烬。"她此后的词风从"常记溪亭日暮"的轻快变为"寻寻觅觅冷冷清清凄凄惨惨戚戚"的悲凉。但宋朝并没有就此终结——康王赵构在临安（杭州）建立南宋，又延续了152年。"山外青山楼外楼，西湖歌舞几时休"——南宋在经济文化上依然繁荣，但"遗民泪尽胡尘里，南望王师又一年"——收复中原的梦想终究未能实现。',
  },
  {
    date: '6月25日', type: '世界历史',
    event: '1975年6月25日，莫桑比克从葡萄牙殖民统治中获得独立。但独立仅仅意味着一个更加复杂的故事的开始。独立后不久，莫桑比克陷入了长达16年的内战。然而今天的莫桑比克被许多人视为非洲最有希望的国家之一——它拥有丰富的天然气储量、绵延的印度洋海岸线和可观的农业潜力。这个国家的历史提醒我们：独立只是第一步，建设一个国家比解放一个国家需要更长的时间。非洲大陆上许多国家的边界是19世纪欧洲列强在柏林会议上在地图上用尺子画的——完全不考虑当地民族和语言的分布。这种"人造国家"的后遗症至今仍然影响着整个非洲大陆的政治格局。理解非洲，需要先理解这段被殖民的历史——以及非洲人民在独立后的艰难探索。',
  },
];

// Classic passages remain the same but expanded
const CLASSIC_PASSAGES = [
  {
    book: '百年孤独', author: '加西亚·马尔克斯',
    passage: '多年以后，面对行刑队，奥雷里亚诺·布恩迪亚上校将会回想起父亲带他去见识冰块的那个遥远的下午。那时的马孔多是一个二十户人家的村落，泥巴和芦苇盖成的屋子沿河岸排开，湍急的河水清澈见底，河床里卵石洁白光滑宛如史前巨蛋。\n\n世界新生伊始，许多事物还没有名字，提到的时候尚需用手指指点点。',
    highlight: '文学史上最著名的开篇——一句话横跨了过去、现在和未来三个时空。马尔克斯用魔幻现实主义的笔法，让一个家族的命运成为整个拉美大陆的寓言。',
  },
  {
    book: '活着', author: '余华',
    passage: '人是为活着本身而活着，而不是为了活着之外的任何事物所活着。\n\n我看到老人的脊背和牛背一样黝黑，两个进入垂暮的生命将那块古板的田地耕得哗哗翻动，犹如水面上掀起的波浪。\n\n老人唱起了旧日的歌谣，歌声在空旷的田野上飘荡。他唱的是一个男人在世上走了一遭，经历了太多苦难，但依然选择与一头老牛相伴，继续走下去。',
    highlight: '福贵的一生跌宕起伏，从地主少爷到穷困潦倒。余华用最平静的语调讲述最残酷的故事，每一页都在叩问：当一切都被剥夺之后，人为什么还要活着？答案朴素却震撼：活着本身就是意义。',
  },
  {
    book: '沉思录', author: '马可·奥勒留',
    passage: '当你早上醒来时，告诉自己：我今天将要遇到好管闲事、忘恩负义、傲慢无礼、欺诈嫉妒、孤僻乖戾的人。这些人之所以如此，是因为他们分不清善与恶。但我已经认识了善的本质和恶的本质，我知道与我打交道的这些人，他们和我在本性上是同一类——所以没有人能真正伤害我。\n\n宇宙即变化，人生即看法。\n\n不要浪费时间讨论一个好人应该是什么样的人，去做一个好人。',
    highlight: '一位罗马皇帝在马背上写下的哲学思考。他统治着人类历史上最庞大的帝国之一，却提醒自己保持谦卑。奥勒留是斯多葛学派的集大成者——控制你能控制的，接受你不能控制的，并拥有分辨两者的智慧。',
  },
  {
    book: '小王子', author: '圣埃克苏佩里',
    passage: '正是你在玫瑰身上花费的时间，才使你的玫瑰变得如此重要。\n\n如果你驯化了我，那么我们就会彼此需要。对我来说，你就是世界上独一无二的；对你来说，我也是世界上独一无二的。\n\n只有用心才能看得清。真正重要的东西，用眼睛是看不见的。',
    highlight: '圣埃克苏佩里在二战最黑暗的时刻写了这部"写给成年人的童话"。表面上是一个来自外星小王子的奇幻旅程，实际上是对成人世界功利、虚伪和孤独的温柔批判。每次重读都有新的感悟。',
  },
  {
    book: '红楼梦', author: '曹雪芹',
    passage: '满纸荒唐言，一把辛酸泪。都云作者痴，谁解其中味？\n\n陋室空堂，当年笏满床；衰草枯杨，曾为歌舞场。蛛丝儿结满雕梁，绿纱今又糊在蓬窗上。说什么脂正浓、粉正香，如何两鬓又成霜？\n\n昨日黄土陇头送白骨，今宵红灯帐底卧鸳鸯。金满箱，银满箱，转眼乞丐人皆谤。正叹他人命不长，哪知自己归来丧！',
    highlight: '中国古典文学的巅峰之作。"好了歌注"短短百余字写尽了人世无常。曹雪芹家族从"锦衣纨绔"到"举家食粥"，所以他能把繁华与幻灭写得如此真切。一部《红楼梦》，半部中国传统文化百科全书。',
  },
  {
    book: '瓦尔登湖', author: '梭罗',
    passage: '我步入丛林，因为我希望生活得有意义，我希望活得深刻，汲取生命中所有的精华，把非生命的一切都击溃，以免当我生命终结时，发现自己从没有活过。\n\n我们为什么要如此匆忙地浪费生命？人们称赞并视为成功的那种生活，只不过是生活的一种。我们为什么要把别的各种生活看得更加突出而夸大其中的一种呢？\n\n如果一个人跟不上他的同伴，也许是因为他听到了不同的鼓声。让他踏着音乐前进，不管那音乐是什么，也不管它有多么遥远。',
    highlight: '1845年，28岁的梭罗在瓦尔登湖畔自己动手建了一座小木屋，住了两年两个月零两天。他每天的伙食只要27美分。他证明了：物质的极简可以带来精神的极大丰富。',
  },
  {
    book: '原则', author: '瑞·达利欧',
    passage: '时间就像一条河流，载着我们顺流而下通过现实。我们无法回避，只能以最好的方式与之相处。\n\n痛苦+反思=进步。\n\n如果你不觉得一年前的自己很蠢，那你这一年就没有学到什么。\n\n梦想+现实+决心=成功的人生。',
    highlight: '桥水基金创始人的毕生心得。他把"极度透明"和"可信度加权"作为决策的核心原则。这本书不是心灵鸡汤，而是一本操作手册——教你把现实当作一台机器来理解，找出因果规律，然后不断优化。',
  },
  {
    book: '卡拉马佐夫兄弟', author: '陀思妥耶夫斯基',
    passage: '爱生活本身，而不是爱生活的意义。\n\n重要的是不要对自己说谎。对自己说谎和听自己说谎的人，会落到分辨不清周围真相的地步，既不尊重自己，也不尊重他人。一个人如果连自己的内心都不敢面对，那他对任何事情都不会有真正的信仰。\n\n美将拯救世界。',
    highlight: '陀思妥耶夫斯基用一桩弑父案展开了一场关于信仰、理性、自由和道德的终极辩论。托尔斯泰称他为"俄国最深刻的灵魂"。这部小说是理解人类内心世界的必读之作——每个人都能在卡拉马佐夫兄弟身上看到自己的一部分。',
  },
];

export default function ReadingPage() {
  const { dailyBook, todayLogs, didReadToday, isLoading, logReading } = useReading();
  const { createTodo } = useTodos();

  const [bookTitle, setBookTitle] = useState('');
  const [chapter, setChapter] = useState('');
  const [pagesRead, setPagesRead] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const todayHistory = HISTORY_EVENTS[dayOfYear % HISTORY_EVENTS.length]!;
  const todayPassage = CLASSIC_PASSAGES[dayOfYear % CLASSIC_PASSAGES.length]!;

  const handleLogReading = useCallback(async () => {
    if (!bookTitle.trim()) return;
    setIsSubmitting(true);
    try {
      await logReading({
        bookTitle: bookTitle.trim(),
        chapter: chapter.trim() || undefined,
        pagesRead: pagesRead ? parseInt(pagesRead) : undefined,
        notes: notes.trim() || undefined,
      });
      const today = new Date().toISOString().split('T')[0]!;
      await createTodo({
        title: `📚 阅读：《${bookTitle.trim()}》`,
        description: [chapter && `章节：${chapter.trim()}`, pagesRead && `已读${pagesRead}页`, notes && `笔记：${notes.trim()}`].filter(Boolean).join('\n'),
        category: ModuleCategory.READING, priority: Priority.NORMAL,
        dueDate: today, isRecurring: false,
      });
      setBookTitle(''); setChapter(''); setPagesRead(''); setNotes('');
      toast.success(`已记录并同步到待办 📚`);
    } finally { setIsSubmitting(false); }
  }, [bookTitle, chapter, pagesRead, notes, logReading, createTodo]);

  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20"><LoadingSpinner size="lg" text="加载阅读数据..." /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#a0724a' }}>
          <BookOpen className="h-7 w-7" />阅读板块
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          每日一书涵养心灵 · 经典段落每日品读 · 历史使人博学 · 阅读自动记录到待办
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ===== LEFT: Daily Book + History ===== */}
        <div className="lg:col-span-1 space-y-6">
          {/* Daily Book Recommendation */}
          {dailyBook && (
            <div className="module-card" style={{ '--module-accent': '#a0724a' } as React.CSSProperties}>
              <h2 className="section-title" style={{ '--module-accent': '#a0724a' } as React.CSSProperties}>
                <Sparkles className="h-5 w-5" style={{ color: '#a0724a' }} />每日推荐
              </h2>
              <div className="p-4 rounded-xl mb-4" style={{ background: 'linear-gradient(135deg, #f5e6d3, #faf0e6)', border: '1px solid #d4a57440' }}>
                <div className="w-full h-28 rounded-lg mb-4 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #8B4513, #A0522D, #6B3410)' }}>
                  <BookOpen className="h-10 w-10 text-white/30" />
                </div>
                <h3 className="text-lg font-bold mb-1" style={{ color: '#5c3d2e' }}>《{dailyBook.title}》</h3>
                <p className="text-sm mb-2" style={{ color: '#7d5535' }}>✍️ {dailyBook.author}</p>
                <span className="text-xs px-2 py-1 rounded-full mb-3 inline-block"
                  style={{ background: '#a0724a20', color: '#a0724a', border: '1px solid #a0724a40' }}>{dailyBook.category}</span>
                <div className="flex items-start gap-1.5">
                  <Quote className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: '#a0724a' }} />
                  <p className="text-sm leading-relaxed" style={{ color: '#8b6914' }}>{dailyBook.summary}</p>
                </div>
                <button onClick={() => setBookTitle(dailyBook.title)}
                  className="w-full mt-3 text-xs py-2 rounded-lg font-medium transition-all"
                  style={{ background: '#a0724a15', color: '#a0724a', border: '1px solid #a0724a30' }}>
                  选这本书 → 记录阅读
                </button>
              </div>
            </div>
          )}

          {/* History Event — with much richer detail */}
          <div className="module-card" style={{ '--module-accent': '#6366f1' } as React.CSSProperties}>
            <h2 className="section-title" style={{ '--module-accent': '#6366f1' } as React.CSSProperties}>
              <History className="h-5 w-5" style={{ color: '#6366f1' }} />今日历史
            </h2>
            <div className="p-4 rounded-xl" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4" style={{ color: '#6366f1' }} />
                <span className="text-sm font-bold" style={{ color: '#4f46e5' }}>{todayHistory.date}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{ background: '#6366f120', color: '#6366f1' }}>{todayHistory.type}</span>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--color-text-secondary)' }}>
                {todayHistory.event}
              </p>
            </div>
          </div>
        </div>

        {/* ===== MIDDLE: Classic Passages ===== */}
        <div className="lg:col-span-1">
          <div className="module-card h-full" style={{ '--module-accent': '#8b5cf6' } as React.CSSProperties}>
            <h2 className="section-title" style={{ '--module-accent': '#8b5cf6' } as React.CSSProperties}>
              <ScrollText className="h-5 w-5" style={{ color: '#8b5cf6' }} />经典段落
            </h2>
            <div className="p-4 rounded-xl mb-3" style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}>
              <div className="flex items-center gap-2 mb-3">
                <BookCopy className="h-5 w-5" style={{ color: '#8b5cf6' }} />
                <div>
                  <p className="text-sm font-bold" style={{ color: '#6d28d9' }}>《{todayPassage.book}》</p>
                  <p className="text-xs" style={{ color: '#7c3aed' }}>{todayPassage.author}</p>
                </div>
              </div>
              <div className="p-4 rounded-lg mb-3" style={{ background: 'var(--color-surface)', borderLeft: '3px solid #8b5cf6' }}>
                <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                  "{todayPassage.passage}"
                </p>
              </div>
              <div className="flex items-start gap-1.5 p-3 rounded-lg" style={{ background: '#f59e0b10' }}>
                <Sparkles className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
                <p className="text-xs leading-relaxed" style={{ color: '#92400e' }}>💡 {todayPassage.highlight}</p>
              </div>
            </div>
            <div className="text-center py-3">
              <p className="text-sm font-medium" style={{ color: '#8b5cf6' }}>📖 阅读是一座随身携带的避难所</p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>—— 毛姆</p>
            </div>
          </div>
        </div>

        {/* ===== RIGHT: Reading Log + Stats ===== */}
        <div className="lg:col-span-1 space-y-6">
          <div className="module-card" style={{ '--module-accent': '#7d5535' } as React.CSSProperties}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="section-title mb-0" style={{ '--module-accent': '#7d5535' } as React.CSSProperties}>
                <BookMarked className="h-5 w-5" style={{ color: '#7d5535' }} />阅读记录
              </h2>
              {didReadToday && (
                <span className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
                  style={{ background: '#22c55e20', color: '#22c55e' }}>
                  <CheckCircle2 className="h-3 w-3" /> 已读 ✓
                </span>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: 'var(--color-surface-alt)' }}>
                <BookOpen className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
                <input type="text" value={bookTitle}
                  onChange={e => setBookTitle(e.target.value)}
                  placeholder="书名" className="bg-transparent text-sm w-full outline-none"
                  style={{ color: 'var(--color-text-primary)' }} />
              </div>
              <div className="flex gap-2">
                <input type="text" value={chapter}
                  onChange={e => setChapter(e.target.value)}
                  placeholder="章节" className="input-field flex-1 text-sm" />
                <input type="number" value={pagesRead}
                  onChange={e => setPagesRead(e.target.value)}
                  placeholder="页数" className="input-field w-24 text-sm" />
              </div>
              <textarea value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="阅读笔记或感想..." className="input-field min-h-[60px] text-sm" />
              <button onClick={handleLogReading} disabled={isSubmitting || !bookTitle.trim()}
                className="btn-primary w-full text-sm"
                style={{ '--color-accent': '#a0724a', '--color-accent-hover': '#7d5535' } as React.CSSProperties}>
                记录阅读（同步到待办）
              </button>
            </div>
            {todayLogs.length > 0 && (
              <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-muted)' }}>今日记录</p>
                <div className="space-y-1.5">
                  {todayLogs.map(log => (
                    <div key={log.id} className="flex items-center gap-2 p-2 rounded text-xs" style={{ background: 'var(--color-surface-alt)' }}>
                      <CheckCircle2 className="h-3 w-3 flex-shrink-0" style={{ color: '#22c55e' }} />
                      <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>《{log.bookTitle}》</span>
                      {log.pagesRead && <span className="ml-auto" style={{ color: 'var(--color-text-muted)' }}>{log.pagesRead}页</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          {todayLogs.length > 0 && (
            <div className="module-card" style={{ '--module-accent': '#a0724a' } as React.CSSProperties}>
              <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>📊 今日摘要</h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 rounded-lg" style={{ background: '#f5e6d3' }}>
                  <p className="text-2xl font-bold" style={{ color: '#a0724a' }}>{todayLogs.length}</p>
                  <p className="text-xs mt-1" style={{ color: '#7d5535' }}>本书</p>
                </div>
                <div className="text-center p-3 rounded-lg" style={{ background: '#f5e6d3' }}>
                  <p className="text-2xl font-bold" style={{ color: '#a0724a' }}>{todayLogs.reduce((s, l) => s + (l.pagesRead ?? 0), 0)}</p>
                  <p className="text-xs mt-1" style={{ color: '#7d5535' }}>页</p>
                </div>
                <div className="text-center p-3 rounded-lg" style={{ background: '#f5e6d3' }}>
                  <p className="text-2xl font-bold" style={{ color: didReadToday ? '#22c55e' : '#a0724a' }}>{didReadToday ? '✓' : '—'}</p>
                  <p className="text-xs mt-1" style={{ color: '#7d5535' }}>已读</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
