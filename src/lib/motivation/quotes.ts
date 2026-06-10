/**
 * Daily Motivation Quotes
 *
 * Multi-language collection of inspirational quotes.
 * In production, these would be fetched from Supabase.
 * For Phase 1, we embed a curated set.
 */

export interface Quote {
  text: string;
  author: string;
}

/**
 * Daily quotes by language.
 * Keyed by language code, each with an array of quotes.
 * One quote is selected per day based on the date.
 */
const QUOTES: Record<string, Quote[]> = {
  'zh-CN': [
    { text: '每一个不曾起舞的日子，都是对生命的辜负。', author: '尼采' },
    { text: '千里之行，始于足下。', author: '老子' },
    { text: '天行健，君子以自强不息。', author: '《周易》' },
    { text: '世上无难事，只要肯登攀。', author: '毛泽东' },
    { text: '生活不止眼前的苟且，还有诗和远方。', author: '高晓松' },
    { text: '不积跬步，无以至千里；不积小流，无以成江海。', author: '荀子' },
    { text: '宝剑锋从磨砺出，梅花香自苦寒来。', author: '《警世贤文》' },
    { text: '长风破浪会有时，直挂云帆济沧海。', author: '李白' },
    { text: '你若盛开，蝴蝶自来。', author: '佚名' },
    { text: '志当存高远。', author: '诸葛亮' },
    { text: '业精于勤，荒于嬉；行成于思，毁于随。', author: '韩愈' },
    { text: '问渠那得清如许，为有源头活水来。', author: '朱熹' },
    { text: '路漫漫其修远兮，吾将上下而求索。', author: '屈原' },
    { text: '博学之，审问之，慎思之，明辨之，笃行之。', author: '《中庸》' },
    { text: '盛年不重来，一日难再晨。及时当勉励，岁月不待人。', author: '陶渊明' },
    { text: '天生我材必有用，千金散尽还复来。', author: '李白' },
    { text: '莫愁前路无知己，天下谁人不识君。', author: '高适' },
    { text: '一切都是瞬息，一切都将会过去。', author: '普希金' },
    { text: '你生来就是高山而非溪流。', author: '张桂梅' },
    { text: '星光不问赶路人，时光不负有心人。', author: '佚名' },
  ],
  'zh-TW': [
    { text: '每一個不曾起舞的日子，都是對生命的辜負。', author: '尼采' },
    { text: '千里之行，始於足下。', author: '老子' },
    { text: '天行健，君子以自強不息。', author: '《周易》' },
    { text: '不積跬步，無以至千里；不積小流，無以成江海。', author: '荀子' },
    { text: '寶劍鋒從磨礪出，梅花香自苦寒來。', author: '《警世賢文》' },
  ],
  en: [
    { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
    { text: 'It does not matter how slowly you go as long as you do not stop.', author: 'Confucius' },
    { text: 'Believe you can and you\'re halfway there.', author: 'Theodore Roosevelt' },
    { text: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt' },
    { text: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill' },
    { text: 'What you get by achieving your goals is not as important as what you become by achieving your goals.', author: 'Zig Ziglar' },
    { text: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Chinese Proverb' },
    { text: 'Your time is limited, don\'t waste it living someone else\'s life.', author: 'Steve Jobs' },
    { text: 'Difficulties in life are intended to make us better, not bitter.', author: 'Dan Reeves' },
    { text: 'Small daily improvements over time lead to stunning results.', author: 'Robin Sharma' },
  ],
  fr: [
    { text: 'La vie est un défi à relever, un bonheur à mériter, une aventure à tenter.', author: 'Mère Teresa' },
    { text: 'Le seul moyen de faire du bon travail est d\'aimer ce que vous faites.', author: 'Steve Jobs' },
    { text: 'Il n\'y a qu\'une façon d\'échouer, c\'est d\'abandonner avant d\'avoir réussi.', author: 'Georges Clemenceau' },
    { text: 'Chaque jour est une nouvelle chance de changer votre vie.', author: 'Inconnu' },
    { text: 'Le succès, c\'est tomber sept fois, se relever huit.', author: 'Proverbe japonais' },
  ],
  de: [
    { text: 'Der Weg ist das Ziel.', author: 'Konfuzius' },
    { text: 'Was du heute kannst besorgen, das verschiebe nicht auf morgen.', author: 'Sprichwort' },
    { text: 'Phantasie ist wichtiger als Wissen, denn Wissen ist begrenzt.', author: 'Albert Einstein' },
    { text: 'Auch aus Steinen, die einem in den Weg gelegt werden, kann man Schönes bauen.', author: 'Johann Wolfgang von Goethe' },
    { text: 'Wer kämpft, kann verlieren. Wer nicht kämpft, hat schon verloren.', author: 'Bertolt Brecht' },
  ],
  it: [
    { text: 'La vita è come andare in bicicletta: per mantenere l\'equilibrio devi muoverti.', author: 'Albert Einstein' },
    { text: 'Non è mai troppo tardi per essere ciò che avresti potuto essere.', author: 'George Eliot' },
    { text: 'La perseveranza è il duro lavoro che fai dopo che ti sei stancato del duro lavoro che hai fatto.', author: 'Newt Gingrich' },
    { text: 'Ogni giorno è un nuovo inizio. Respira profondamente e ricomincia.', author: 'Sconosciuto' },
  ],
  es: [
    { text: 'La vida es aquello que pasa mientras estás ocupado haciendo otros planes.', author: 'John Lennon' },
    { text: 'No cuentes los días, haz que los días cuenten.', author: 'Muhammad Ali' },
    { text: 'El éxito es la suma de pequeños esfuerzos repetidos día tras día.', author: 'Robert Collier' },
    { text: 'Cada día es una nueva oportunidad para cambiar tu vida.', author: 'Anónimo' },
    { text: 'No importa cuán lento vayas, siempre y cuando no te detengas.', author: 'Confucio' },
  ],
  ja: [
    { text: '継続は力なり。', author: '日本の諺' },
    { text: '千里の道も一歩から。', author: '老子' },
    { text: '明日死ぬかのように生きろ。永遠に生きるかのように学べ。', author: 'マハトマ・ガンディー' },
    { text: '努力する人は希望を語り、怠ける人は不満を語る。', author: '井上靖' },
    { text: '人生に夢があるのではなく、夢が人生をつくる。', author: '宇津木妙子' },
    { text: '一歩一歩、着実に歩み続ければ、いつかは山頂にたどり着く。', author: 'パール・バック' },
  ],
  ko: [
    { text: '천 리 길도 한 걸음부터.', author: '노자' },
    { text: '오늘 할 수 있는 일을 내일로 미루지 마라.', author: '벤자민 프랭클린' },
    { text: '꿈을 꾸는 사람만이 그 꿈을 이룰 수 있다.', author: '월트 디즈니' },
    { text: '인내는 쓰지만 그 열매는 달다.', author: '아리스토텔레스' },
    { text: '작은 변화가 모여 큰 변화를 만든다.', author: '작자 미상' },
    { text: '당신이 할 수 있다고 믿든, 할 수 없다고 믿든, 당신이 옳다.', author: '헨리 포드' },
  ],
};

/**
 * Get a deterministic daily quote based on the date.
 * Same date → same quote across all users.
 */
export function getDailyQuote(language?: string): Quote {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );

  // Fall back to zh-CN if language not available
  const lang = language ?? 'zh-CN';
  const quotes = QUOTES[lang] ?? QUOTES['zh-CN']!;

  // Use dayOfYear to deterministically pick a quote
  const index = dayOfYear % quotes.length;
  return quotes[index]!;
}

/**
 * Get the quote for a specific language.
 */
export function getQuotesForLanguage(language: string): Quote[] {
  return QUOTES[language] ?? QUOTES['zh-CN']!;
}
