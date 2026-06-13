'use client';

import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GraduationCap, BookOpen, Plus, X, CheckCircle2, Circle,
  GitBranch, Network, Trash2, Edit3, Palette, Languages, BookMarked,
  ChevronRight, ChevronDown, Globe, Zap,
} from 'lucide-react';
import { useLearning } from '@/hooks/useLearning';
import { useTodos } from '@/hooks/useTodos';
import { useHabits } from '@/hooks/useHabits';
import { useAuthStore } from '@/stores/authStore';
import { useOfflineStore } from '@/stores/offlineStore';
import { getDatabase } from '@/lib/db/indexeddb';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { cn } from '@/lib/utils/cn';
import { LEARNING_CATEGORIES, ModuleCategory, Priority } from '@/types/enums';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// ═══════════════════════════════════════════════════════
// Macaron colors for mind map nodes
// ═══════════════════════════════════════════════════════
const NODE_COLORS = [
  '#f87171','#fb923c','#fbbf24','#a3e635','#34d399',
  '#22d3ee','#60a5fa','#818cf8','#a78bfa','#e879f9',
  '#fb7185','#f472b6',
];

// ═══════════════════════════════════════════════════════
// IELTS Reading Stories (embedded — rotates daily)
// ═══════════════════════════════════════════════════════
interface StoryVocab { word: string; definition: string; }
interface ReadingStory {
  title: string;
  level: string;
  wordCount: number;
  content: string[];
  vocab: StoryVocab[];
}
const READING_STORIES: ReadingStory[] = [
  {
    title: 'The Secret Garden of Kyoto',
    level: 'IELTS 6.5', wordCount: 280,
    content: [
      "Hidden behind weathered wooden gates in the eastern hills of Kyoto lies a garden that few tourists ever find. Unlike the famous rock gardens of Ryoanji or the vermillion gates of Fushimi Inari, this small sanctuary offers something increasingly rare in modern Japan: absolute, uninterrupted silence.",
      "The garden was designed in 1682 by a Zen monk who believed that a garden should never reveal itself completely from any single viewpoint. As you walk along the winding moss-covered path, new vistas unfold with each step — a stone lantern half-hidden by maple leaves, a small pond reflecting the sky, a carefully placed rock that suggests a mountain in miniature.",
      "What makes this garden remarkable is its use of 'borrowed scenery' (shakkei), a technique where the garden incorporates the surrounding landscape into its design. The distant Mount Hiei becomes part of the composition, framed perfectly between two ancient cherry trees. In spring, when the cherries blossom and the mountain is still dusted with snow, the effect is breathtaking.",
      "For centuries, only monks were permitted to enter. Today, the garden welcomes visitors, but maintains a strict rule: no photography, no phones, and no talking above a whisper. Visitors often report losing track of time here, spending hours simply sitting on the veranda, watching the light change across the moss.",
      "In our hyperconnected world, such spaces remind us that sometimes the greatest luxury is not more stimulation, but less. The garden doesn't ask you to do anything, learn anything, or buy anything. It simply invites you to be present — and that might be the most radical hospitality of all.",
    ],
    vocab: [
      { word:'sanctuary', definition:'a place of refuge or safety; a sacred place' },
      { word:'vermillion', definition:'a brilliant red pigment; bright reddish-orange color' },
      { word:'vistas', definition:'pleasing views, especially seen through a long narrow opening' },
      { word:'borrowed scenery', definition:'(shakkei) a Japanese garden technique incorporating distant landscape' },
      { word:'hyperconnected', definition:'extremely connected through digital networks and technology' },
      { word:'radical', definition:'relating to the fundamental nature of something; far-reaching' },
      { word:'composition', definition:'the arrangement of elements in a work of art or photograph' },
    ],
  },
  {
    title: 'The Norwegian Philosophy of Friluftsliv',
    level: 'IELTS 7.0', wordCount: 310,
    content: [
      "In Norway, there is a word that has no direct English translation but captures an essential part of Scandinavian culture: friluftsliv (pronounced 'free-loofts-liv'). Literally meaning 'free air life,' it describes a philosophy of outdoor living — the belief that spending time in nature is fundamental to human wellbeing.",
      "The term was first popularized in 1859 by playwright Henrik Ibsen, but the concept is far older. Norwegians have long understood that connection to nature is not a luxury or a hobby — it is a necessity. Today, friluftsliv is woven into the fabric of Norwegian society: children attend outdoor kindergartens where they spend 80% of their day outside regardless of weather; companies give employees time off for ski trips; and there is a legal right (allemannsretten) that allows anyone to walk, ski, and camp on uncultivated land, even privately owned.",
      "What distinguishes friluftsliv from typical Western notions of outdoor recreation is its emphasis on simplicity. There is little focus on expensive gear, extreme achievements, or 'conquering' nature. Instead, the ideal friluftsliv experience might be as modest as a quiet walk in the forest, picking blueberries, or sitting by a fire with a cup of coffee. The goal is not to dominate nature but to be part of it.",
      "Research increasingly validates what Norwegians have practiced for generations. Studies show that just 120 minutes per week in natural environments is associated with significantly better health and wellbeing. Time in nature reduces cortisol levels, lowers blood pressure, improves mood, and enhances cognitive function. Perhaps more importantly, people who practice friluftsliv report a deeper sense of meaning and connection.",
      "As urbanization accelerates globally and screen time reaches unprecedented levels, the Norwegian philosophy offers a timely antidote. The prescription is elegantly simple: go outside, breathe fresh air, move your body, and let nature work its quiet magic.",
    ],
    vocab: [
      { word:'friluftsliv', definition:'Norwegian philosophy of outdoor living and connection with nature' },
      { word:'allemannsretten', definition:'Norwegian legal right of public access to uncultivated land' },
      { word:'uncultivated', definition:'(of land) not used for growing crops; in its natural state' },
      { word:'antidote', definition:'something that counteracts an unpleasant feeling or situation' },
      { word:'cortisol', definition:'a hormone released in response to stress' },
      { word:'urbanization', definition:'the process by which towns and cities are formed and grow larger' },
      { word:'cognitive', definition:'relating to mental processes of perception, memory, and reasoning' },
    ],
  },
  {
    title: 'Why Icelanders Write More Books Per Capita Than Anyone Else',
    level: 'IELTS 7.0', wordCount: 295,
    content: [
      "With a population of just 380,000 — smaller than many medium-sized cities — Iceland publishes more books per capita than any other country in the world. One in ten Icelanders will publish a book in their lifetime. The country has more writers, more books published, and more books read per person than anywhere else on Earth.",
      "This literary obsession has deep historical roots. When Iceland was first settled by Norse Vikings in the 9th century, they brought with them a rich oral storytelling tradition. In the 13th century, these sagas were written down, creating some of the world's greatest medieval literature — tales of family feuds, heroic voyages, and tragic love stories that rival Homer in their sophistication.",
      "But history alone doesn't fully explain modern Iceland's book culture. The harsh climate plays a role too: during the long, dark winter months when daylight lasts only 4-5 hours, reading becomes a natural refuge. There is even a term — 'Jólabókaflóð' (Christmas Book Flood) — for the annual tradition where most new books are published in the weeks before Christmas, and the whole country gives and receives books on Christmas Eve, then spends the night reading with chocolate.",
      "Perhaps the most fascinating aspect is how the small population creates a uniquely intimate literary ecosystem. Every writer knows their readers might include their neighbors, their former teachers, or the President of Iceland (who lives in a modest house with no security detail). This proximity between authors and audience eliminates the distance that often characterizes literary culture in larger nations. In Iceland, literature is not an elite pursuit — it is the national conversation.",
      "In a world where reading rates are declining in many developed countries, Iceland offers a compelling case study: perhaps the key to a vibrant literary culture is not just a matter of education policy, but of creating a society where stories genuinely matter to people's daily lives.",
    ],
    vocab: [
      { word:'per capita', definition:'for each person; in relation to people taken individually' },
      { word:'sagas', definition:'long stories of heroic achievement, especially medieval Norse/Icelandic' },
      { word:'Jólabókaflóð', definition:'Icelandic Christmas tradition of giving books on Christmas Eve' },
      { word:'ecosystem', definition:'a complex network or interconnected system (here: literary community)' },
      { word:'proximity', definition:'nearness in space, time, or relationship' },
      { word:'elite', definition:'a select group that is superior in terms of ability or qualities' },
      { word:'sophistication', definition:'the quality of being cultured, complex, or refined' },
    ],
  },
  {
    title: 'The Mystery of Animal Migration',
    level: 'IELTS 6.5', wordCount: 270,
    content: [
      "Every year, billions of animals embark on journeys that defy human comprehension. The Arctic tern flies from the Arctic to the Antarctic and back — a round trip of 70,000 kilometers — experiencing more daylight than any other creature. Monarch butterflies, weighing less than a paper clip, navigate 4,000 kilometers to the same mountain forests in Mexico where their great-grandparents wintered, despite never having made the journey themselves.",
      "How animals navigate with such precision remains one of science's greatest mysteries. Researchers have identified multiple mechanisms: some birds use the Earth's magnetic field as a compass; others navigate by the stars; salmon remember the unique chemical signature of their birth stream; and desert ants count their steps. But the full picture of how these systems integrate remains elusive.",
      "What is increasingly clear, however, is that human activity is disrupting these ancient pathways. Light pollution confuses birds that navigate by stars. Urban development fragments corridors used by terrestrial migrants. Climate change alters the timing of seasonal cues, causing mismatches — birds arrive at breeding grounds only to find their insect food sources have already peaked.",
      "Conservation efforts are beginning to address these challenges. The concept of 'migratory connectivity' — the idea that protecting a species requires protecting all the places it needs throughout its annual cycle — is reshaping conservation strategy. A warbler that breeds in Canadian boreal forests, stops over in Texas wetlands, and winters in Costa Rican cloud forests needs all three habitats intact.",
      "Understanding migration is not just an academic pursuit. These journeys connect ecosystems across continents, transfer nutrients, pollinate plants, and regulate pest populations. When migration routes break down, the consequences ripple through the web of life in ways scientists are only beginning to understand.",
    ],
    vocab: [
      { word:'embark', definition:'to begin a journey or course of action' },
      { word:'elusive', definition:'difficult to find, catch, or achieve' },
      { word:'disrupting', definition:'interrupting or disturbing an activity or process' },
      { word:'fragments', definition:'breaks or separates into smaller parts' },
      { word:'migratory connectivity', definition:'the links between locations used by migrating animals' },
      { word:'boreal', definition:'relating to the northern subarctic regions' },
      { word:'ripple', definition:'a small wave or series of waves; a spreading effect or influence' },
    ],
  },
  {
    title: 'The Silent Revolution of Vertical Farming',
    level: 'IELTS 6.5', wordCount: 260,
    content: [
      "In a nondescript warehouse in Newark, New Jersey, something remarkable is growing. Under the purple glow of LED lights, stacks of leafy greens rise toward the ceiling — not in soil, but in a carefully calibrated mist of nutrients. This is vertical farming, and its proponents believe it could revolutionize how humanity feeds itself.",
      "The concept is elegantly simple: instead of spreading crops horizontally across vast fields, stack them vertically in controlled indoor environments. By precisely managing light, temperature, humidity, and nutrients, vertical farms can grow lettuce using 95% less water than conventional agriculture, with no pesticides and yields up to 350 times greater per square meter. Because the farms can be located in or near cities, transportation costs and emissions plummet.",
      "Critics, however, point to significant limitations. The energy required to power LED lights and climate control is substantial, and currently only leafy greens and herbs are economically viable to grow this way. Staple crops like wheat, rice, and corn require far more light energy than is practical to provide artificially. Skeptics argue that vertical farming will remain a niche solution for high-value crops in wealthy markets.",
      "The technology is evolving rapidly. New LED systems are twice as efficient as those from five years ago. Artificial intelligence now optimizes growing conditions in real-time. Some facilities are experimenting with strawberries, tomatoes, and even dwarf fruit trees. Meanwhile, climate change is making outdoor agriculture increasingly unpredictable — 2024 was the hottest year on record, with crop failures reported across multiple continents.",
      "Perhaps the most powerful argument for vertical farming is not economic but existential: as the global population approaches 10 billion, humanity will need to produce more food in the next 40 years than in the previous 10,000 combined — and do so on a planet with less stable weather, less available water, and less arable land.",
    ],
    vocab: [
      { word:'nondescript', definition:'lacking distinctive or interesting features or characteristics' },
      { word:'calibrated', definition:'carefully adjusted or measured for accuracy' },
      { word:'proponents', definition:'people who advocate for or support a theory or course of action' },
      { word:'plummet', definition:'to fall or drop straight down at high speed' },
      { word:'arable', definition:'(of land) used or suitable for growing crops' },
      { word:'existential', definition:'relating to existence; concerning the nature of human existence' },
      { word:'viable', definition:'capable of working successfully; feasible' },
    ],
  },
];

// ═══════════════════════════════════════════════════════
// Mind Map Node type
// ═══════════════════════════════════════════════════════
interface MindNode {
  id: string; userId: string; category: string;
  parentId: string | null; title: string; color: string; sortOrder: number;
  children: MindNode[];
}

// ═══════════════════════════════════════════════════════
// Mind Map Builder Component
// ═══════════════════════════════════════════════════════
function MindMapBuilder({ category, userId }: { category: string; userId: string }) {
  const [nodes, setNodes] = useState<MindNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const addToSyncQueue = useOfflineStore(s => s.addToSyncQueue);

  const loadNodes = useCallback(async () => {
    const db = getDatabase();
    const rows = await db.mindMapNodes.where({ userId, category }).toArray();
    const map = new Map<string, MindNode>();
    rows.forEach(r => map.set(r.id, { ...r, children: [] }));
    const roots: MindNode[] = [];
    map.forEach(n => {
      if (n.parentId && map.has(n.parentId)) map.get(n.parentId)!.children.push(n);
      else if (!n.parentId) roots.push(n);
    });
    roots.sort((a,b) => a.sortOrder - b.sortOrder);
    setNodes(roots);
    setLoading(false);
  }, [userId, category]);

  useEffect(() => { loadNodes(); }, [loadNodes]);

  const addNode = async (parentId: string | null) => {
    const db = getDatabase();
    const id = crypto.randomUUID();
    const node = { id, userId, category, parentId, title: '新节点', color: NODE_COLORS[Math.floor(Math.random() * NODE_COLORS.length)]!, sortOrder: Date.now() };
    await db.mindMapNodes.put({ ...node, _synced: false, _modifiedAt: Date.now() });
    addToSyncQueue({ table: 'mind_map_nodes', operation: 'insert', recordId: id, data: node as any });
    await loadNodes();
  };

  const deleteNode = async (id: string) => {
    const db = getDatabase();
    const delRecursive = async (nid: string) => {
      const children = await db.mindMapNodes.where({ parentId: nid }).toArray();
      for (const c of children) await delRecursive(c.id);
      await db.mindMapNodes.delete(nid);
    };
    await delRecursive(id);
    await loadNodes();
    toast.success('节点已删除');
  };

  const updateTitle = async (id: string, title: string) => {
    const db = getDatabase();
    await db.mindMapNodes.update(id, { title, _synced: false, _modifiedAt: Date.now() });
    setEditingId(null);
    await loadNodes();
  };

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  const NodeCard = ({ node, depth }: { node: MindNode; depth: number }) => {
    const isExpanded = expandedIds.has(node.id) || depth < 2;
    const hasChildren = node.children.length > 0;
    return (
      <div className="ml-0">
        <div className="flex items-center gap-1.5 group py-1">
          {hasChildren && (
            <button onClick={() => toggleExpand(node.id)} className="p-0.5 rounded hover:bg-slate-100">
              {isExpanded ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
            </button>
          )}
          {!hasChildren && <span className="w-5" />}
          <div className="h-3 w-3 rounded-full flex-shrink-0" style={{ background: node.color }} />
          {editingId === node.id ? (
            <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') updateTitle(node.id, editTitle); if (e.key === 'Escape') setEditingId(null); }}
              onBlur={() => updateTitle(node.id, editTitle)}
              className="flex-1 px-2 py-0.5 text-sm rounded border border-purple-300 outline-none focus:ring-1 focus:ring-purple-400"
              autoFocus />
          ) : (
            <span className="text-sm font-medium text-slate-700 cursor-pointer hover:text-purple-600 flex-1"
              onClick={() => { setEditingId(node.id); setEditTitle(node.title); }}>
              {node.title}
            </span>
          )}
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
            <button onClick={() => { setEditingId(node.id); setEditTitle(node.title); }}
              className="p-1 rounded hover:bg-slate-100"><Edit3 className="h-3 w-3 text-slate-400" /></button>
            <button onClick={() => addNode(node.id)}
              className="p-1 rounded hover:bg-purple-50"><Plus className="h-3 w-3 text-purple-400" /></button>
            <button onClick={() => deleteNode(node.id)}
              className="p-1 rounded hover:bg-red-50"><Trash2 className="h-3 w-3 text-red-400" /></button>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div className="ml-4 border-l-2 border-purple-100 pl-2">
            {node.children.map(c => <NodeCard key={c.id} node={c} depth={depth + 1} />)}
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div className="py-8"><LoadingSpinner size="sm" text="加载思维导图..." /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-slate-400">以树状结构构建{category}的知识框架</p>
        <button onClick={() => addNode(null)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          style={{ background: '#8b5cf612', color: '#7c3aed' }}>
          <Plus className="h-3.5 w-3.5" /> 添加根节点
        </button>
      </div>
      {nodes.length === 0 ? (
        <div className="text-center py-12">
          <Network className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <p className="text-sm text-slate-400">还没有节点，点击上方按钮创建根节点</p>
        </div>
      ) : (
        <div className="space-y-1 max-h-[500px] overflow-y-auto scrollbar-hide">
          {nodes.map(n => <NodeCard key={n.id} node={n} depth={0} />)}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// IELTS Reading Component
// ═══════════════════════════════════════════════════════
function IeltsReading({ category }: { category: string }) {
  const dayIdx = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const story = READING_STORIES[dayIdx % READING_STORIES.length]!;
  const [highlightedWord, setHighlightedWord] = useState<string | null>(null);
  const [readComplete, setReadComplete] = useState(false);
  const { logLearning, todayLogs } = useLearning();
  const { toggleHabit, habits } = useHabits();

  useEffect(() => {
    setReadComplete(todayLogs.some(l => l.category === category && l.completed));
  }, [todayLogs, category]);

  const handleMarkRead = async () => {
    await logLearning({ category, completed: true, notes: `Read: ${story.title}` });
    if (!habits[ModuleCategory.LEARNING]) await toggleHabit(ModuleCategory.LEARNING);
    setReadComplete(true);
    toast.success('阅读打卡完成！📖');
  };

  // Find highlighted words in text
  const highlightText = (text: string) => {
    let result = text;
    story.vocab.forEach(v => {
      const regex = new RegExp(`\\b(${v.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\b`, 'gi');
      result = result.replace(regex, (match) =>
        `<span class="vocab-word cursor-pointer underline decoration-dotted underline-offset-2 decoration-amber-400 bg-amber-50/50 px-0.5 rounded hover:bg-amber-100 transition-colors" data-word="${v.word}">${match}</span>`
      );
    });
    return result;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-800">{story.title}</h3>
          <p className="text-[10px] text-slate-400">{story.level} · {story.wordCount} words · Day {dayIdx % READING_STORIES.length + 1}</p>
        </div>
        <div className="flex items-center gap-2">
          {!readComplete ? (
            <button onClick={handleMarkRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)' }}>
              <BookMarked className="h-3.5 w-3.5" /> 打卡阅读
            </button>
          ) : (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="h-3.5 w-3.5" /> 已打卡
            </span>
          )}
        </div>
      </div>

      {/* Story content */}
      <div className="space-y-3 mb-6">
        {story.content.map((p, i) => (
          <div key={i} className="text-sm leading-relaxed text-slate-700 p-4 rounded-xl bg-slate-50/80"
            dangerouslySetInnerHTML={{ __html: highlightText(p) }}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (target.classList.contains('vocab-word')) {
                setHighlightedWord(target.dataset.word || null);
              }
            }}
          />
        ))}
      </div>

      {/* Vocab definition popup */}
      <AnimatePresence>
        {highlightedWord && (
          <motion.div className="p-3 rounded-xl mx-4 mb-4"
            style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-purple-700">{highlightedWord}</span>
              <button onClick={() => setHighlightedWord(null)} className="p-0.5"><X className="h-3.5 w-3.5 text-purple-400" /></button>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              {story.vocab.find(v => v.word === highlightedWord)?.definition || ''}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vocabulary list */}
      <div className="border-t border-slate-100 pt-4">
        <p className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5" /> 核心词汇
        </p>
        <div className="flex flex-wrap gap-1.5">
          {story.vocab.map(v => (
            <button key={v.word}
              onClick={() => setHighlightedWord(v.word)}
              className={cn('px-2.5 py-1 rounded-lg text-xs transition-all',
                highlightedWord === v.word ? 'bg-purple-100 text-purple-700 font-medium' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')}>
              {v.word}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// Main Learning Page
// ═══════════════════════════════════════════════════════
export default function LearningPage() {
  const { t } = useTranslation();
  const {
    categories, plans, todayLogs, activeCategories,
    isLoading, toggleCategory, savePlan, acceptPlan, logLearning,
  } = useLearning();
  const { createTodo } = useTodos();
  const { habits, toggleHabit } = useHabits();
  const user = useAuthStore(s => s.user);
  const userId = user?.id ?? 'local-user';

  const [showPlanForm, setShowPlanForm] = useState(false);
  const [planCat, setPlanCat] = useState('');
  const [planTitle, setPlanTitle] = useState('');
  const [planMethod, setPlanMethod] = useState('');
  const [planSchedule, setPlanSchedule] = useState('');
  const [localPath, setLocalPath] = useState('');

  // Tab state per category
  const [activeTabs, setActiveTabs] = useState<Record<string, string>>({});

  const handleCreatePlan = useCallback(async () => {
    if (!planTitle.trim() || !planCat) return;
    await savePlan({ category: planCat, title: planTitle.trim(), methodDescription: planMethod.trim() || undefined, planData: planSchedule.trim() ? { schedule: planSchedule.trim() } : undefined, localResourcePath: localPath.trim() || undefined });
    toast.success('学习计划已保存');
    setPlanTitle(''); setPlanMethod(''); setPlanSchedule(''); setLocalPath(''); setShowPlanForm(false);
  }, [planCat, planTitle, planMethod, planSchedule, localPath, savePlan]);

  const handleAcceptPlan = useCallback(async (planId: string) => {
    const plan = await acceptPlan(planId);
    if (!plan) return;
    await createTodo({ title: `📖 ${plan.title}`, description: plan.methodDescription ?? undefined, category: ModuleCategory.LEARNING, priority: Priority.IMPORTANT, isRecurring: true, recurType: 'daily' as any, dueDate: new Date().toISOString().split('T')[0] });
    if (!habits[ModuleCategory.LEARNING]) await toggleHabit(ModuleCategory.LEARNING);
    toast.success('计划已接受！📖');
  }, [acceptPlan, createTodo, habits, toggleHabit]);

  const handleQuickCheck = useCallback(async (cat: string) => {
    await logLearning({ category: cat, completed: true });
    if (!habits[ModuleCategory.LEARNING]) await toggleHabit(ModuleCategory.LEARNING);
    toast.success(`${cat} 今日已打卡 ✅`);
  }, [logLearning, habits, toggleHabit]);

  if (isLoading) return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20"><LoadingSpinner size="lg" text="加载学习数据..." /></div>;

  const isIelts = (cat: string) => cat === '雅思';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-purple-500"><GraduationCap className="h-7 w-7" />{t('learning.title')}</h1>
        <p className="text-sm mt-1 text-slate-400">勾选子板块 · 学习计划 · 思维导图 · 英文阅读</p>
      </div>

      {/* Category Selector */}
      <div className="module-card mb-6" style={{ '--module-accent': '#8b5cf6' } as React.CSSProperties}>
        <h2 className="section-title" style={{ '--module-accent': '#8b5cf6' } as React.CSSProperties}>
          <BookOpen className="h-5 w-5 text-purple-500" />{t('learning.categories')}
        </h2>
        <div className="flex flex-wrap gap-2">
          {LEARNING_CATEGORIES.map(cat => {
            const cd = categories.find(c => c.category === cat);
            const isActive = cd?.isActive ?? false;
            const todayChecked = todayLogs.some(l => l.category === cat);
            return (
              <button key={cat} onClick={() => toggleCategory(cat)}
                className={cn('flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all border-2 text-sm font-medium', isActive ? 'shadow-sm' : '')}
                style={{ background: isActive ? '#8b5cf612' : 'var(--color-surface-alt)', borderColor: isActive ? '#8b5cf6' : 'var(--color-border)', color: isActive ? '#7c3aed' : 'var(--color-text-secondary)' }}>
                <span>{cat}</span>
                {todayChecked && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {activeCategories.length === 0 ? (
        <div className="module-card text-center py-12" style={{ '--module-accent': '#8b5cf6' } as React.CSSProperties}>
          <BookOpen className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <p className="text-sm text-slate-400">请先勾选上方的学习分类</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeCategories.map(cat => {
            const catPlans = plans.filter(p => p.category === cat);
            const catLogs = todayLogs.filter(l => l.category === cat);
            const isComplete = catLogs.some(l => l.completed);
            const currentTab = activeTabs[cat] || 'plan';

            return (
              <div key={cat} className="module-card" style={{ '--module-accent': '#8b5cf6' } as React.CSSProperties}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-purple-600">{cat}</h3>
                  <button onClick={() => handleQuickCheck(cat)}
                    className={cn('px-3 py-1 rounded-lg text-xs font-medium transition-all')}
                    style={{ background: isComplete ? '#22c55e18' : 'var(--color-surface-hover)', color: isComplete ? '#22c55e' : 'var(--color-text-muted)' }}>
                    {isComplete ? `✓ 已完成` : '标记完成'}
                  </button>
                </div>

                {/* ── Tab switcher ── */}
                <div className="flex items-center gap-1 mb-4 p-1 rounded-lg bg-slate-100">
                  {(['plan', 'mindmap'].concat(isIelts(cat) ? ['reading'] : [])).map(tab => (
                    <button key={tab}
                      onClick={() => setActiveTabs(prev => ({ ...prev, [cat]: tab }))}
                      className={cn('flex-1 py-1.5 rounded-md text-xs font-medium transition-all',
                        currentTab === tab ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
                      {tab === 'plan' ? '📋 学习计划' : tab === 'mindmap' ? '🧠 思维导图' : '📖 英文阅读'}
                    </button>
                  ))}
                </div>

                {/* ── Tab Content ── */}
                {currentTab === 'plan' && (
                  <>
                    {catPlans.length > 0 ? (
                      <div className="space-y-2 mb-3">
                        {catPlans.map(plan => (
                          <div key={plan.id} className="p-3 rounded-lg bg-surface-alt">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-slate-800">{plan.title}</span>
                              {plan.isAccepted ? (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-600">已接受</span>
                              ) : (
                                <button onClick={() => handleAcceptPlan(plan.id)} className="text-xs px-2 py-0.5 rounded btn-primary"
                                  style={{ '--color-accent': '#8b5cf6', '--color-accent-hover': '#7c3aed' } as React.CSSProperties}>接受计划</button>
                              )}
                            </div>
                            {plan.methodDescription && <p className="text-xs text-slate-400">{plan.methodDescription}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 mb-3"><p className="text-xs text-slate-400">暂无学习计划</p></div>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => { setPlanCat(cat); setShowPlanForm(true); }}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs transition-colors text-purple-500"
                        style={{ background: '#8b5cf612' }}><Plus className="h-3.5 w-3.5" /> 添加计划</button>
                    </div>
                  </>
                )}

                {currentTab === 'mindmap' && (
                  <MindMapBuilder category={cat} userId={userId} />
                )}

                {currentTab === 'reading' && isIelts(cat) && (
                  <IeltsReading category={cat} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Plan creation modal */}
      {showPlanForm && (
        <>
          <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" onClick={() => setShowPlanForm(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowPlanForm(false)}>
            <div className="w-full max-w-md p-6 rounded-2xl shadow-2xl bg-white" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-purple-600">创建 {planCat} 学习计划</h3>
                <button onClick={() => setShowPlanForm(false)}><X className="h-5 w-5 text-slate-400" /></button>
              </div>
              <div className="space-y-3">
                <input type="text" value={planTitle} onChange={e => setPlanTitle(e.target.value)} placeholder="计划标题" className="input-field text-sm" autoFocus />
                <textarea value={planMethod} onChange={e => setPlanMethod(e.target.value)} placeholder="学习方法描述..." className="input-field min-h-[80px] text-sm" />
                <textarea value={planSchedule} onChange={e => setPlanSchedule(e.target.value)} placeholder="每日学习规划（可选）" className="input-field min-h-[60px] text-sm" />
                <input type="text" value={localPath} onChange={e => setLocalPath(e.target.value)} placeholder="本地资料路径" className="input-field text-sm" />
                <button onClick={handleCreatePlan} disabled={!planTitle.trim()}
                  className="btn-primary w-full" style={{ '--color-accent': '#8b5cf6', '--color-accent-hover': '#7c3aed' } as React.CSSProperties}>{t('common.save')}</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
