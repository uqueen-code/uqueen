export interface NewsItem {
  id: number;
  title: string;
  titleZh: string;
  date: string;
  source: string;
  summary: string;
  summaryZh: string;
  content: string[];
  contentZh: string[];
  vocab: { word: string; definition: string }[];
}

export const NEWS_ITEMS: NewsItem[] = [
  {
    id: 1,
    title: 'Global Climate Summit Reaches Historic Agreement on Carbon Pricing',
    titleZh: '全球气候峰会达成碳定价历史性协议',
    date: '2026-06-10',
    source: 'World Economic Forum',
    summary: 'Nearly 200 countries agreed to implement a global carbon pricing mechanism by 2028, marking the most significant climate policy breakthrough since the Paris Agreement.',
    summaryZh: '近200个国家同意在2028年前实施全球碳定价机制，这是自《巴黎协定》以来最重大的气候政策突破。',
    content: [
      "After two weeks of intense negotiations in Geneva, representatives from 197 countries reached a landmark agreement to establish a global carbon pricing floor of $75 per ton by 2028, with provisions for developing nations to phase in the policy over an extended timeline. The agreement, which was finalized at 3:47 AM local time after a marathon final session, represents the culmination of nearly a decade of diplomatic efforts to create a unified global approach to carbon emissions pricing.",
      "The mechanism will require all signatory nations to implement either a carbon tax or an emissions trading system that meets the minimum price threshold, with revenues directed toward green technology investment, climate adaptation in vulnerable nations, and direct rebates to low-income households to offset increased energy costs. The agreement includes a novel enforcement mechanism: nations that fail to meet their obligations will face escalating tariffs on carbon-intensive exports to member countries, creating a powerful economic incentive for compliance.",
      "Economists have widely praised the agreement as the single most efficient policy tool for reducing greenhouse gas emissions. 'This is the holy grail of climate policy,' said Dr. Elena Rodriguez, chief economist at the International Energy Agency. 'By putting a consistent price on carbon across the global economy, we align market incentives with planetary survival. Every business decision, every investment, every purchase will now reflect the true cost of carbon emissions.' However, several major fossil fuel-producing nations expressed reservations, and implementation challenges remain significant."
    ],
    contentZh: [
      "经过在日内瓦为期两周的激烈谈判，197个国家的代表达成了一项具有里程碑意义的协议，到2028年建立每吨75美元的全球碳定价下限，并为发展中国家提供了延长实施时间表的条款。该协议在当地时间凌晨3点47分经过一场马拉松式的最后会议后最终敲定，代表了近十年来为建立统一的全球碳排放定价方法所做的外交努力的高潮。",
      "该机制将要求所有签署国实施碳税或碳排放交易体系，并达到最低价格门槛，收入将用于绿色技术投资、脆弱国家的气候适应，以及向低收入家庭提供直接补贴以抵消增加的能源成本。该协议包含一项创新的执行机制：未能履行义务的国家将面临对成员国碳密集型出口的逐步升级关税，从而为合规创造强大的经济激励。",
      "经济学家普遍称赞该协议是减少温室气体排放的最有效政策工具。国际能源署首席经济学家埃琳娜·罗德里格斯博士表示：'这是气候政策的圣杯。通过在全球经济中对碳进行统一定价，我们将市场激励与地球生存对齐。每一个商业决策、每一次投资、每一次购买现在都将反映碳排放的真实成本。'然而，几个主要的化石燃料生产国表达了保留意见，实施挑战仍然重大。"
    ],
    vocab: [
      { word: 'landmark', definition: 'an event or achievement marking an important stage or turning point' },
      { word: 'culmination', definition: 'the highest or climactic point of something' },
      { word: 'signatory', definition: 'a person or state that has signed an agreement' },
      { word: 'threshold', definition: 'the level or point at which something starts to happen' },
      { word: 'compliance', definition: 'the act of conforming to a rule, standard, or law' },
      { word: 'escalating', definition: 'increasing rapidly in intensity or scale' },
      { word: 'tariffs', definition: 'taxes imposed on imported goods and services' },
    ],
  },
  {
    id: 2,
    title: 'Breakthrough in Quantum Computing: 1000-Qubit Processor Demonstrated',
    titleZh: '量子计算突破：千量子比特处理器成功演示',
    date: '2026-06-08',
    source: 'Nature Technology Review',
    summary: 'Scientists at the Swiss Federal Institute of Technology have successfully demonstrated a stable 1000-qubit quantum processor, potentially accelerating the timeline for practical quantum computing applications.',
    summaryZh: '瑞士联邦理工学院的科学家成功演示了稳定的1000量子比特处理器，可能加速实用量子计算应用的时间表。',
    content: [
      "A research team at ETH Zurich announced today that they have successfully fabricated and tested a quantum processor containing 1,000 individually addressable superconducting qubits, surpassing the previous record of 433 qubits held by IBM. More significantly, the team demonstrated that they could maintain quantum coherence across all 1,000 qubits for over 500 microseconds — a duration long enough to perform meaningful quantum computations with error correction.",
      "The breakthrough relies on a novel qubit architecture that arranges the qubits in a three-dimensional lattice rather than the traditional two-dimensional grid, allowing for denser packing and better isolation from environmental noise. The team also developed a new cryogenic control system that operates at millikelvin temperatures, dramatically reducing the thermal noise that has historically limited qubit coherence times. 'We've essentially built a quantum processor that can correct its own errors in real-time,' explained Dr. Markus Weber, lead researcher on the project.",
      "Industry analysts suggest that a 1000-qubit processor with active error correction could begin to tackle problems that are genuinely intractable for classical supercomputers — the long-sought goal of 'quantum advantage' for commercially relevant applications. Potential near-term applications include molecular simulation for drug discovery, optimization of complex supply chains, and the development of new materials for battery technology. However, experts caution that significant engineering challenges remain before such systems can be deployed at commercial scale."
    ],
    contentZh: [
      "苏黎世联邦理工学院的研究团队今天宣布，他们成功制造并测试了一台包含1000个可单独寻址的超导量子比特的量子处理器，超越了IBM此前保持的433量子比特的记录。更重要的是，该团队证明他们能够在所有1000个量子比特上维持量子相干性超过500微秒——这一持续时间足以执行有意义的带有纠错的量子计算。",
      "这一突破依赖于一种新颖的量子比特架构，将量子比特排列在三维晶格中而非传统的二维网格，从而实现更密集的封装和更好的环境噪声隔离。该团队还开发了一种在毫开尔文温度下运行的新型低温控制系统，大幅减少了历史上限制量子比特相干时间的热噪声。'我们基本上构建了一台能够实时纠正自身错误的量子处理器，'项目首席研究员马库斯·韦伯博士解释说。",
      "行业分析师认为，具有主动纠错能力的1000量子比特处理器可能开始解决经典超级计算机真正难以解决的问题——这是长期以来追求的商业相关应用的'量子优势'目标。潜在的近期应用包括药物发现的分子模拟、复杂供应链的优化，以及电池技术新材料的开发。然而，专家警告说，在商业规模部署此类系统之前，仍存在重大的工程挑战。"
    ],
    vocab: [
      { word: 'fabricated', definition: 'constructed or manufactured, especially in a laboratory setting' },
      { word: 'superconducting', definition: 'conducting electricity without resistance at very low temperatures' },
      { word: 'coherence', definition: 'the property of quantum systems maintaining their quantum state over time' },
      { word: 'cryogenic', definition: 'relating to the production and effects of very low temperatures' },
      { word: 'millikelvin', definition: 'one-thousandth of a kelvin; extremely cold temperatures near absolute zero' },
      { word: 'intractable', definition: 'hard to control, deal with, or solve' },
    ],
  },
  {
    id: 3,
    title: 'WHO Declares End to Global Malaria Emergency After Vaccine Milestone',
    titleZh: '疫苗里程碑后世卫组织宣布全球疟疾紧急状态结束',
    date: '2026-06-05',
    source: 'World Health Organization',
    summary: 'The WHO has officially declared the end of the global malaria public health emergency, citing a 94% reduction in deaths since the deployment of second-generation mRNA malaria vaccines began in 2024.',
    summaryZh: '世卫组织正式宣布全球疟疾公共卫生紧急状态结束，自2024年开始部署第二代mRNA疟疾疫苗以来，死亡人数减少了94%。',
    content: [
      "In a historic announcement from its Geneva headquarters, the World Health Organization declared today that malaria no longer constitutes a global public health emergency, marking the effective end of a disease that has plagued humanity for millennia and killed over 600,000 people annually as recently as 2020. The declaration follows verified data showing a sustained 94% reduction in malaria-attributable deaths across endemic regions since the large-scale rollout of second-generation mRNA-based malaria vaccines began in late 2024.",
      "The RTS,S/AS01 vaccine, developed by GlaxoSmithKline and deployed since 2021, had already demonstrated approximately 40% efficacy in preventing severe malaria. However, the second-generation vaccines — developed collaboratively by BioNTech, Moderna, and the Serum Institute of India — achieved efficacy rates exceeding 90% by targeting multiple stages of the Plasmodium parasite's complex life cycle. Combined with expanded distribution of insecticide-treated bed nets and improved rapid diagnostic testing, the vaccines have transformed malaria from a leading cause of child mortality in sub-Saharan Africa to a manageable public health challenge.",
      "Public health officials emphasized that the end of the emergency declaration does not mean the end of malaria elimination efforts. 'This is not a declaration of victory — it is a transition from emergency response to sustained control and eventual eradication,' said Dr. Tedros Adhanom Ghebreyesus, WHO Director-General. 'We must maintain vaccination coverage, continue surveillance, and address the social determinants that make communities vulnerable. But for the first time in human history, we can realistically envision a world free of malaria within our lifetimes.'"
    ],
    contentZh: [
      "世界卫生组织在其日内瓦总部发表历史性声明，宣布疟疾不再构成全球公共卫生紧急状态，这标志着一个困扰人类数千年、在2020年每年仍导致超过60万人死亡的疾病的有效终结。该声明是基于经过验证的数据显示，自2024年底大规模推广第二代基于mRNA的疟疾疫苗以来，流行地区的疟疾归因死亡人数持续减少了94%。",
      "由葛兰素史克开发、自2021年起部署的RTS,S/AS01疫苗已证明在预防严重疟疾方面有效率达到约40%。然而，由BioNTech、Moderna和印度血清研究所合作开发的第二代疫苗通过针对疟原虫复杂生命周期的多个阶段，实现了超过90%的有效率。结合扩大分发杀虫剂处理的蚊帐和改进的快速诊断检测，这些疫苗已将疟疾从撒哈拉以南非洲儿童死亡的主要原因转变为可管理的公共卫生挑战。",
      "公共卫生官员强调，紧急状态声明的结束并不意味着消除疟疾努力的终止。世卫组织总干事谭德塞博士表示：'这不是胜利宣言——这是从紧急响应向持续控制和最终根除的过渡。我们必须保持疫苗接种覆盖率，继续监测，并解决使社区脆弱的社会决定因素。但是，在人类历史上第一次，我们可以现实地展望在有生之年实现一个没有疟疾的世界。'"
    ],
    vocab: [
      { word: 'plagued', definition: 'caused continual trouble or distress to' },
      { word: 'attributable', definition: 'regarded as being caused by a particular factor' },
      { word: 'efficacy', definition: 'the ability to produce a desired or intended result' },
      { word: 'Plasmodium', definition: 'a genus of parasitic protozoans that cause malaria' },
      { word: 'surveillance', definition: 'close observation, especially of a suspected person or condition' },
      { word: 'eradication', definition: 'the complete destruction or elimination of something' },
    ],
  },
  {
    id: 4,
    title: 'Mars Sample Return Mission Successfully Retrieves First Rock Cores',
    titleZh: '火星样本返回任务成功取回首批岩芯',
    date: '2026-06-01',
    source: 'NASA/JPL',
    summary: 'NASA and ESA have successfully returned the first rock core samples from Mars to Earth, with preliminary analysis revealing organic compounds that may reshape our understanding of the Red Planet.',
    summaryZh: 'NASA和ESA已成功将首批火星岩芯样本送回地球，初步分析揭示的有机化合物可能重塑我们对这颗红色星球的理解。',
    content: [
      "In a moment that scientists have dreamed of for generations, the first rock core samples drilled from the surface of Mars touched down safely on Earth today, carried by a joint NASA-ESA return capsule that landed in the Utah desert at 11:42 AM local time. The samples — three cylindrical cores of sedimentary rock extracted from Jezero Crater, an ancient lake bed that once held liquid water approximately 3.5 billion years ago — represent the culmination of a mission concept first seriously proposed in the 1970s.",
      "Preliminary analysis conducted in a mobile cleanroom at the landing site has already yielded extraordinary results. The samples contain complex organic molecules, including polycyclic aromatic hydrocarbons and amino acid precursors — the chemical building blocks that on Earth gave rise to life. Crucially, the isotopic ratios of carbon in these molecules suggest a non-biological origin, likely formed through geological processes. However, the presence of these compounds in such abundance confirms that the chemical precursors for life were widespread in Mars' ancient environment, dramatically increasing the probability that life may have independently emerged there.",
      "The samples will now be transported under strict biosafety protocols to a dedicated curation facility at Johnson Space Center in Houston, where they will be analyzed by an international consortium of over 200 scientists using instruments that cannot be miniaturized for spaceflight. 'We are literally holding pieces of another planet in our hands,' said Dr. Sarah Chen, the mission's chief scientist. 'These rocks have been waiting 3.5 billion years to tell their story. Now, finally, we can listen.'"
    ],
    contentZh: [
      "在科学家几代人梦寐以求的时刻，从火星表面钻取的首批岩芯样本今天安全降落在地球上，由NASA-ESA联合返回舱搭载，于当地时间上午11点42分降落在犹他州沙漠。这些样本——从杰泽罗陨石坑（一个大约35亿年前曾含有液态水的古老湖床）中提取的三个圆柱形沉积岩芯——代表了一个最早在20世纪70年代就被认真提出的任务概念的高潮。",
      "在着陆点移动洁净室进行的初步分析已经产生了非凡的结果。样本含有复杂的有机分子，包括多环芳烃和氨基酸前体——在地球上产生生命的化学构建块。至关重要的是，这些分子中碳的同位素比率表明其非生物起源，很可能是通过地质过程形成的。然而，这些化合物如此丰富的存在证实了生命的化学前体在火星的古代环境中是广泛存在的，大大增加了生命可能在那里独立出现的概率。",
      "这些样本现在将在严格的生物安全协议下运送到休斯顿约翰逊航天中心的专门保管设施，在那里将由一个由200多名科学家组成的国际联盟使用无法小型化用于太空飞行的仪器进行分析。'我们实际上手中握着来自另一个星球的碎片，'该任务的首席科学家莎拉·陈博士说。'这些岩石已经等待了35亿年来讲述它们的故事。现在，我们终于可以倾听了。'"
    ],
    vocab: [
      { word: 'sedimentary', definition: 'relating to rock formed from sediment deposited by water or air' },
      { word: 'polycyclic', definition: 'containing multiple rings of atoms in a molecular structure' },
      { word: 'isotopic', definition: 'relating to forms of an element with different numbers of neutrons' },
      { word: 'precursors', definition: 'substances from which another is formed by chemical reaction' },
      { word: 'biosafety', definition: 'precautions taken to prevent the accidental release of potentially harmful biological agents' },
      { word: 'consortium', definition: 'an association of organizations formed to undertake an enterprise beyond the resources of any one member' },
    ],
  },
  {
    id: 5,
    title: 'Universal Basic Income Trial Shows Transformative Results After Three Years',
    titleZh: '全民基本收入试验三年后显示变革性成果',
    date: '2026-05-28',
    source: 'The Economic Journal',
    summary: 'The world\'s largest Universal Basic Income study, involving 20,000 participants across five countries, has published its three-year results showing significant improvements in mental health, entrepreneurship, and educational attainment.',
    summaryZh: '全球最大的全民基本收入研究涉及五个国家20,000名参与者，公布三年结果显示心理健康、创业精神和教育成就显著改善。',
    content: [
      "The most ambitious Universal Basic Income (UBI) experiment in history has released its three-year longitudinal results, and the findings challenge assumptions across the political spectrum. The study, involving 20,000 participants across the United States, Kenya, India, Brazil, and Finland, provided recipients with unconditional monthly cash transfers calibrated to approximately 60% of each country's median income — enough to cover basic necessities but not enough to replace employment income.",
      "Contrary to concerns that cash transfers would reduce labor force participation, employment rates among recipients remained stable, while self-reported engagement in meaningful work — including entrepreneurship, caregiving, creative pursuits, and education — increased by 11%. Mental health outcomes showed the most dramatic improvement: clinically significant anxiety decreased by 42%, depression by 38%, and emergency room visits for mental health crises dropped by 31%. Hospitalization rates for preventable conditions fell by 18%, generating healthcare cost savings that offset approximately 23% of the program's cost.",
      "Perhaps most significantly, children in recipient households showed measurable improvements in educational outcomes, including a 15% increase in secondary school completion rates and a 22% reduction in behavioral problems reported by teachers. 'The data suggest that poverty is not primarily a problem of motivation or character — it is a problem of chronic stress and resource scarcity,' said Dr. Amara Okafor, the study's principal investigator. 'When you give people a stable floor beneath which they cannot fall, they don't stop working. They start making better long-term decisions for themselves and their children.'"
    ],
    contentZh: [
      "历史上最雄心勃勃的全民基本收入实验已经发布了其三年纵向结果，这一发现挑战了政治光谱各方的假设。这项研究涉及美国、肯尼亚、印度、巴西和芬兰的20,000名参与者，向受助者提供无条件每月现金转移，金额校准为每个国家中位收入的大约60%——足以支付基本必需品，但不足以取代就业收入。",
      "与现金转移会降低劳动力参与的担忧相反，受助者的就业率保持稳定，而自报从事有意义工作的比例——包括创业、照护、创造性追求和教育——增加了11%。心理健康结果显示出最显著的改善：临床上显著的焦虑症减少了42%，抑郁症减少了38%，心理健康危机的急诊就诊率下降了31%。可预防疾病住院率下降了18%，产生的医疗成本节约抵消了该计划成本的约23%。",
      "也许最重要的是，受助家庭的孩子在教育成果方面表现出可衡量的改善，包括中学毕业率提高了15%，教师报告的行为问题减少了22%。'数据表明，贫困主要不是动机或品格问题——而是慢性压力和资源稀缺的问题，'该研究的首席研究员阿马拉·奥卡福博士说。'当你给人们一个不会跌落的安全地板时，他们不会停止工作。他们开始为自己和孩子做出更好的长期决策。'"
    ],
    vocab: [
      { word: 'longitudinal', definition: 'involving repeated observations of the same subjects over a long period' },
      { word: 'calibrated', definition: 'carefully adjusted or set to a specific scale or standard' },
      { word: 'entrepreneurship', definition: 'the activity of setting up and running businesses' },
      { word: 'preventable', definition: 'able to be avoided or kept from happening' },
      { word: 'chronic', definition: 'persisting for a long time or constantly recurring' },
      { word: 'scarcity', definition: 'the state of being in short supply; shortage' },
    ],
  },
];
