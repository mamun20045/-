/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Word {
  id: string;
  character: string;
  pinyin: string;
  bengali: string;
  meaning: string;
  category: "PRONOUN" | "ACTION" | "OBJECT" | "NUMBER" | "ADJECTIVE";
  examples?: { zh: string; py: string; bn: string }[];
  collocations?: string[];
  notes?: string;
}

export type QuizType = "TRANSLATE" | "LISTENING" | "BUILD";

export interface QuizQuestion {
  id: string;
  type: QuizType;
  question: string;
  chineseContent: string;
  correctAnswer: string;
  options?: string[];
  chips?: string[]; // For sentence building
  hint?: string;
}

export interface HSKModule {
  id: number;
  title: string;
  shortDesc: string;
  icon: string;
  color: string;
  words: Word[];
  quizzes: QuizQuestion[];
}

export interface StorySegment {
  pinyin: string;
  chinese: string;
  bengali: string;
}

export interface Story {
  id: number;
  title: string;
  description: string;
  segments: StorySegment[];
}

export interface ChatMessage {
  id: number;
  sender: "AI" | "USER";
  chinese: string;
  pinyin: string;
  bengali: string;
}

export const GRAMMAR_DATA = [
  {
    title: "বেসিক বাক্য গঠন (Sentence Structure)",
    desc: "চাইনিজ ভাষার সাধারণ বাক্য গঠন পদ্ধতি।",
    rules: [
      { rule: "S + V + O", ex: "我 (S) + 喝 (V) + 水 (O)", bn: "আমি পানি খাই।" },
      { rule: "সময় + S + V + O", ex: "明天 (সময়) + 我 (S) + 去 (V) + 北京 (O)", bn: "আগামীকাল আমি বেইজিং যাবো।" }
    ]
  },
  {
    title: "প্রশ্নবোধক বাক্য (Questions with 吗)",
    desc: "বাক্যের শেষে 'má' (吗) যোগ করে প্রশ্ন করা হয়।",
    rules: [
      { rule: "Statement + 吗?", ex: "你好吗? (Nǐ hǎo ma?)", bn: "তুমি কেমন আছো?" },
      { rule: "তুমি ভাত খাও + 吗?", ex: "你吃饭吗? (Nǐ chī fàn ma?)", bn: "তুমি কি ভাত খেয়েছ?" }
    ]
  },
  {
    title: "নেতিবাচক বাক্য (Negation with 不)",
    desc: "ক্রিয়ার আগে 'bù' (不) বসিয়ে না-বোধক বাক্য করা হয়।",
    rules: [
      { rule: "S + 不 + V + O", ex: "我不喝水 (Wǒ bù hē shuǐ)", bn: "আমি পানি খাই না।" },
      { rule: "S + 不是 + O", ex: "我不是老师 (Wǒ bùshì lǎoshī)", bn: "আমি শিক্ষক নই।" }
    ]
  },
  {
    title: "অধিকার বা সম্বন্ধ (Possession with 的)",
    desc: "মালিকানা বোঝাতে 'de' (的) ব্যবহার করা হয়।",
    rules: [
      { rule: "মালিক + 的 + বস্তু", ex: "我的书 (Wǒ de shū)", bn: "আমার বই।" },
      { rule: "তোমার নাম", ex: "你的名字 (Nǐ de míngzì)", bn: "তোমার নাম।" }
    ]
  }
];

export const STUDY_GUIDE = [
  {
    phase: "ধাপ ১: ফাউন্ডেশন (১-৭ দিন)",
    title: "উচ্চারণ ও টোন ঠিক করা",
    desc: "চাইনিজ ভাষার ভিত্তি হলো পিনয়ন (Pinyin) এবং ৪টি টোন। এটি না শিখলে আপনার কথা চাইনিজরা বুঝবে না।",
    tasks: ["সুর চেকার ব্যবহার করুন", "ম্যাজিক ক্যামেরা দিয়ে বস্তু চিনুন", "পিনয়ন চার্ট দেখুন"]
  },
  {
    phase: "ধাপ ২: প্রয়োজনীয় ২০০ শব্দ (১ মাস)",
    title: "HSK ১ আয়ত্ত করা",
    desc: "সবচেয়ে বেশি ব্যবহৃত প্রথম ২০০টি শব্দ শিখলে আপনি ছোট ছোট বাক্য বলতে পারবেন।",
    tasks: ["শিখার পথের ৩টি লেসন শেষ করুন", "প্রতিদিন ৫টি করে ফ্ল্যাশকার্ড দেখুন", "হাতে লেখা প্র্যাকটিস করুন"]
  },
  {
    phase: "ধাপ ৩: কথোপকথন (২-৩ মাস)",
    title: "বাক্য গঠন ও এআই প্র্যাকটিস",
    desc: "১০০০টি শব্দের দিকে যাওয়ার সময় এখন। শব্দগুলোকে বাক্যে ব্যবহার করা শিখুন।",
    tasks: ["এআই টিউটর (Guru) এর সাথে চ্যাট করুন", "ভিডিও ডাবিং করে কন্ঠ মেলান", "শর্টস ভিডিও দেখে ভাষা শুনুন"]
  },
  {
    phase: "ধাপ ৪: লক্ষ্য অর্জন (৬ মাস)",
    title: "অনর্গল কথা বলা",
    desc: "এই ধাপে আপনি প্রায় ১০০০-১২০০ শব্দ জানবেন এবং যে কোনো সাধারণ বিষয়ে কথা বলতে পারবেন।",
    tasks: ["এইচএসকে মক টেস্ট দিন", "সারভাইভাল কিট মুখস্থ রাখুন", "গল্প পড়ুন ও অডিও শুনুন"]
  }
];

export const USER_NAME = "মামুন";
export const USER_POINTS = 1200;
export const USER_STREAK = 5;

export const PREMIUM_FEATURES = [
  { id: "camera", title: "ম্যাজিক ক্যামেরা", desc: "চারপাশের বস্তু স্ক্যান করুন", icon: "Camera", color: "#FF6B6B" },
  { id: "tones", title: "সুর চেকার", desc: "চাইনিজ টোন প্র্যাকটিস", icon: "Waves", color: "#4ECDC4" },
  { id: "dubbing", title: "ভিডিও রোলপ্লে", desc: "AI হিউম্যানের সাথে প্র্যাকটিস", icon: "Tv", color: "#FFD93D" },
  { id: "shorts", title: "শর্টস রিলস", desc: "মজার ভিডিও দেখে শেখা", icon: "PlaySquare", color: "#6C5CE7" },
  { id: "video", title: "বাক্য তৈরি", desc: "ভিডিও থেকে বাক্য সাজান", icon: "Video", color: "#88B04B" },
  { id: "stories", title: "গল্প পড়ুন", desc: "পড়ুন এবং অডিও শুনুন", icon: "BookOpen", color: "#88B04B" },
  { id: "speaking", title: "কথা বলা", desc: "AI ভয়েস ফিডব্যাক", icon: "Mic", color: "#88B04B" },
  { id: "writing", title: "হাতে লেখা", desc: "ক্যারেক্টার আঁকা শিখুন", icon: "PenTool", color: "#88B04B" },
  { id: "chat", title: "কথোপকথন", desc: "বাস্তবধর্মী চ্যাট", icon: "MessageSquare", color: "#88B04B" },
  { id: "games", title: "মিনি গেম", desc: "মজায় মজায় শেখা", icon: "Gamepad2", color: "#88B04B" },
  { id: "revision", title: "স্মার্ট রিভিশন", desc: "স্মৃতিশক্তি বৃদ্ধি", icon: "RotateCw", color: "#88B04B" },
  { id: "flashcards", title: "ফ্ল্যাশকার্ড", desc: "ছবি দিয়ে ক্যারেক্টার", icon: "Layers", color: "#F1C40F" },
  { id: "survival", title: "সারভাইভাল কিট", desc: "বিপদের বন্ধু", icon: "HeartPulse", color: "#F1C40F" },
  { id: "leaderboard", title: "লিডারবোর্ড", desc: "র‍্যাংকিং ও প্রতিযোগিতা", icon: "BarChart3", color: "#88B04B" },
  { id: "culture", title: "চায়না কালচার", desc: "ঐতিহ্য ও খাবার", icon: "Globe", color: "#636E72" },
  { id: "missions", title: "ডেইলি মিশন", desc: "বাড়তি পয়েন্ট অর্জন", icon: "Target", color: "#E67E22" },
  { id: "aitutor", title: "এআই টিউটর", desc: "২৪/৭ ব্যক্তিগত শিক্ষক", icon: "Bot", color: "#00B894" },
  { id: "grammar", title: "গ্রামার গাইড", desc: "সহজ চাইনিজ ব্যকরণ", icon: "BookOpen", color: "#E67E22" },
  { id: "roadmap", title: "শিখার গাইড", desc: "পূর্ণাঙ্গ রোডম্যাপ", icon: "Target", color: "#88B04B" },
  { id: "dictionary", title: "ডিকশনারি", desc: "সহজ শব্দ খোঁজা", icon: "Search", color: "#A29BFE" },
  { id: "mocktest", title: "এইচএসকে টেস্ট", desc: "পরীক্ষার প্রস্তুতি", icon: "FileText", color: "#FAB1A0" },
];

export const DICTIONARY_DATA = [
  { word: "爱", pinyin: "ài", bn: "ভালোবাসা", ex: "我爱我的家 (আমি আমার পরিবারকে ভালোবাসি)" },
  { word: "八", pinyin: "bā", bn: "আট", ex: "我有八个杯子 (আমার আটটি কাপ আছে)" },
  { word: "爸爸", pinyin: "bàba", bn: "বাবা", ex: "我爸爸是医生 (আমার বাবা একজন ডাক্তার)" },
  { word: "杯子", pinyin: "bēizi", bn: "কাপ", ex: "桌子上有一个杯子 (টেবিলের উপর একটি কাপ আছে)" },
  { word: "北京", pinyin: "Běijīng", bn: "বেইজিং", ex: "我去北京 (আমি বেইজিং যাচ্ছি)" },
  { word: "本", pinyin: "běn", bn: "বইয়ের পরিমাপক", ex: "三本书 (তিনটি বই)" },
  { word: "不客气", pinyin: "búkèqi", bn: "আপনাকে স্বাগতম", ex: "谢谢! 不客气! (ধন্যবাদ! স্বাগতম!)" },
  { word: "不", pinyin: "bù", bn: "না", ex: "我不去 (আমি যাব না)" },
  { word: "菜", pinyin: "cài", bn: "সবজি/খাবার", ex: "我不喜欢吃菜 (আমি সবজি খেতে পছন্দ করি না)" },
  { word: "茶", pinyin: "chá", bn: "চা", ex: "请喝茶 (অনুগ্রহ করে চা পান করুন)" },
  { word: "吃", pinyin: "chī", bn: "খাওয়া", ex: "你在吃什么? (তুমি কি খাচ্ছ?)" },
  { word: "出租车", pinyin: "chūzūchē", bn: "ট্যাক্সি", ex: "我们坐出租车吧 (চলুন ট্যাক্সিতে যাই)" },
  { word: "打电话", pinyin: "dǎdiànhuà", bn: "ফোন করা", ex: "他在打电话 (সে ফোনে কথা বলছে)" },
  { word: "大", pinyin: "dà", bn: "বড়", ex: "এই আপেলটি অনেক বড়" },
  { word: "的", pinyin: "de", bn: "এর", ex: "আমার বই" },
  { word: "点", pinyin: "diǎn", bn: "টা/সময়", ex: "এখন তিনটা বাজে" },
];

export const MOCK_TEST_STATUS = {
  unlocked: true,
  lastScore: 0,
  totalQuestions: 10,
  timeLimit: 600
};

export const MOCK_TEST_QUESTIONS: QuizQuestion[] = [
  {
    id: "m1",
    type: "LISTENING",
    question: "সঠিক অর্থ নির্বাচন করুন",
    chineseContent: "你好",
    correctAnswer: "হ্যালো",
    options: ["হ্যালো", "ধন্যবাদ", "বিদায়"]
  },
  {
    id: "m2",
    type: "TRANSLATE",
    question: "'আমি' এর পিনয়িন কী?",
    chineseContent: "我",
    correctAnswer: "wo",
    hint: "wǒ"
  },
  {
    id: "m3",
    type: "BUILD",
    question: "তৈরি করুন: 'আমি ভাত খাই'",
    chineseContent: "我吃饭",
    correctAnswer: "我吃饭",
    chips: ["吃", "饭", "我", "水"]
  },
];

export const CULTURE_DATA = [
  { 
    id: 1, 
    title: "চাইনিজ চা উৎসব", 
    img: "https://images.unsplash.com/photo-1594631252845-29fc458631b6?auto=format&fit=crop&q=80&w=400", 
    desc: "চায়নাতে চা পানের রীতি হাজার বছরের পুরনো। এটি কেবল একটি পানীয় নয়, এটি একটি শিল্প।",
    wikiUrl: "https://bn.wikipedia.org/wiki/%E0%A6%9A%E0%A6%BE%E0%A6%87%E0%A6%A4%E0%A6%BF%E0%A6%B9%E0%A6%BE%E0%A6%B8"
  },
  { 
    id: 2, 
    title: "চীনের মহাপ্রাচীর", 
    img: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&q=80&w=400", 
    desc: "পৃথিবীর সপ্তাশ্চর্যের একটি হলো চীনের এই দেয়াল। এটি রক্ষার জন্য তৈরি করা হয়েছিল।",
    wikiUrl: "https://bn.wikipedia.org/wiki/%E0%A6%9A%E0%A7%80%E0%A6%A8%E0%A7%8ER_%E0%A6%AE%E0%A6%B9%E0%A6%BE%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%BE%E0%A6%9A%E0%A7%80%E0%A6%B0"
  },
];

export const DAILY_MISSIONS = [
  { id: 1, task: "৫টি নতুন শব্দ শিখুন", points: 50, completed: true },
  { id: 2, task: "১টি অডিও রেকর্ড করুন", points: 30, completed: false },
  { id: 3, task: "১টি কুইজ সম্পন্ন করুন", points: 20, completed: false }
];

export const REVISION_CARDS = [
  { word: "你好", pinyin: "Nǐ hǎo", bn: "হ্যালো", due: "রিভিশন প্রয়োজন" },
  { word: "谢谢", pinyin: "Xièxiè", bn: "ধন্যবাদ", due: "আগামীকাল রিভিশন" },
];

export const SHORTS_FEED = [
  { id: 1, url: "https://assets.mixkit.co/videos/preview/mixkit-street-food-market-at-night-1358-large.mp4", backup: "https://www.w3schools.com/html/mov_bbb.mp4", title: "চাইনিজ স্ট্রিট ফুড", subtiles: { zh: "这个多少钱?", bn: "এটার দাম কত?" } },
];

export const ROLEPLAY_SCENARIOS = [
  {
    id: 1,
    title: "রেস্টুরেন্টে অর্ডার করা",
    video: "https://assets.mixkit.co/videos/preview/mixkit-chef-preparing-a-meal-in-a-professional-kitchen-8622-large.mp4",
    backupVideo: "https://www.w3schools.com/html/mov_bbb.mp4",
    lines: [
      { id: "L1", speaker: "Waiter", text: "您想吃什么?", pinyin: "Nín xiǎng chī shénme?", translation: "আপনি কি খেতে চান?" },
      { id: "L2", speaker: "You", text: "我想 eat 米饭。", pinyin: "Wǒ xiǎng chī mǐfàn.", translation: "আমি ভাত খেতে চাই।" }
    ]
  }
];

export const TONE_PRACTICE = [
  { char: "妈", pinyin: "mā", tone: 1, desc: "উচ্চ ও সমান্তরাল (High Level)" },
  { char: "麻", pinyin: "má", tone: 2, desc: "নিচ থেকে উপরে (Rising)" },
  { char: "马", pinyin: "mǎ", tone: 3, desc: "নিচে নেমে উপরে (Falling-Rising)" },
  { char: "骂", pinyin: "mà", tone: 4, desc: "উপর থেকে নিচে (Falling)" },
];

export const STORY_CONTENT: Story[] = [
  {
    id: 1,
    title: "আমার পরিবার (My Family)",
    description: "পরিবার সম্পর্কে সাধারণ কথোপকথন।",
    segments: [
      { pinyin: "Wǒ de jiā", chinese: "我的家", bengali: "আমার পরিবার" },
      { pinyin: "Wǒ jiā yǒu sān kǒu rén.", chinese: "我家有三口人。", bengali: "আমার পরিবারে তিনজন সদস্য আছে।" },
    ]
  }
];

export const CHAT_HISTORY: ChatMessage[] = [
  { id: 1, sender: "AI", chinese: "你好! 你叫什么名字?", pinyin: "Nǐ hǎo! Nǐ jiào shénme míngzì?", bengali: "হ্যালো! তোমার নাম কি?" },
];

export const SURVIVAL_KIT = [
  { pinyin: "Jiùmìng ā!", chinese: "救命啊！", bengali: "বাঁচান!", meaning: "Help!" },
];

export const FLASHCARDS_DATA = [
  { char: "日", pinyin: "Rì", bengali: "সূর্য / দিন", img: "https://images.unsplash.com/photo-1526644485127-ec1245084992?auto=format&fit=crop&q=80&w=300" },
];

export const WRITING_CHARACTERS = [
  { char: "一", pinyin: "yī", meaning: "এক (One)" },
];

export const GAME_WORDS = [
  { chinese: "你好", bengali: "হ্যালো" },
];

export const HSK_1_WORDS: Word[] = [
  { id: "1", character: "我", pinyin: "wǒ", bengali: "আমি", meaning: "I/Me", category: "PRONOUN", 
    examples: [{ zh: "我是学生。", py: "Wǒ shì xuésheng.", bn: "আমি একজন ছাত্র।" }], collocations: ["আমার", "আমরা"] },
  { id: "2", character: "你", pinyin: "nǐ", bengali: "তুমি", meaning: "You", category: "PRONOUN", 
    examples: [{ zh: "你好吗？", py: "Nǐ hǎo ma?", bn: "তুমি কেমন আছো?" }] },
  { id: "3", character: "他", pinyin: "tā", bengali: "সে", meaning: "He/She", category: "PRONOUN" },
  { id: "4", character: "们", pinyin: "men", bengali: "রা (বহুবচন)", meaning: "Plural suffix", category: "PRONOUN" },
  { id: "5", character: "好", pinyin: "hǎo", bengali: "ভালো", meaning: "Good", category: "ADJECTIVE" },
  { id: "6", character: "是", pinyin: "shì", bengali: "হয়", meaning: "To be", category: "ACTION" },
  { id: "7", character: "不", pinyin: "bù", bengali: "না", meaning: "Not", category: "ADJECTIVE" },
  { id: "8", character: "喝", pinyin: "hē", bengali: "পান করা", meaning: "To Drink", category: "ACTION" },
  { id: "9", character: "吃", pinyin: "chī", bengali: "খাওয়া", meaning: "To Eat", category: "ACTION" },
  { id: "10", character: "水", pinyin: "shuǐ", bengali: "পানি", meaning: "Water", category: "OBJECT" },
  { id: "11", character: "饭", pinyin: "fàn", bengali: "ভাত", meaning: "Meal", category: "OBJECT" },
  { id: "12", character: "大", pinyin: "dà", bengali: "বড়", meaning: "Big", category: "ADJECTIVE" },
  { id: "13", character: "小", pinyin: "xiǎo", bengali: "ছোট", meaning: "Small", category: "ADJECTIVE" },
  { id: "14", character: "一", pinyin: "yī", bengali: "এক", meaning: "One", category: "NUMBER" },
  { id: "15", character: "二", pinyin: "èr", bengali: "দুই", meaning: "Two", category: "NUMBER" },
  { id: "16", character: "三", pinyin: "sān", bengali: "তিন", meaning: "Three", category: "NUMBER" },
  { id: "17", character: "谢谢", pinyin: "xièxiè", bengali: "ধন্যবাদ", meaning: "Thank you", category: "ACTION" },
  { id: "18", character: "见", pinyin: "jiàn", bengali: "দেখা করা", meaning: "To See", category: "ACTION" },
  { id: "19", character: "再见", pinyin: "zàijiàn", bengali: "বিদায়", meaning: "Goodbye", category: "ACTION" },
  { id: "20", character: "多", pinyin: "duō", bengali: "অনেক", meaning: "Many", category: "ADJECTIVE" },
  { id: "21", character: "爸爸", pinyin: "bàba", bengali: "বাবা", meaning: "Father", category: "OBJECT" },
  { id: "22", character: "妈妈", pinyin: "māma", bengali: "মা", meaning: "Mother", category: "OBJECT" },
  { id: "23", character: "哥哥", pinyin: "gēge", bengali: "বড় ভাই", meaning: "Elder Brother", category: "OBJECT" },
  { id: "24", character: "弟弟", pinyin: "dìdi", bengali: "ছোট ভাই", meaning: "Younger Brother", category: "OBJECT" },
  { id: "25", character: "姐姐", pinyin: "jiějie", bengali: "বড় বোন", meaning: "Elder Sister", category: "OBJECT" },
  { id: "26", character: "妹妹", pinyin: "mèimei", bengali: "ছোট বোন", meaning: "Younger Sister", category: "OBJECT" },
  { id: "27", character: "人", pinyin: "rén", bengali: "মানুষ", meaning: "Person", category: "OBJECT" },
  { id: "28", character: "钱", pinyin: "qián", bengali: "টাকা", meaning: "Money", category: "OBJECT" },
  { id: "29", character: "块", pinyin: "kuài", bengali: "মুদ্রা পরিমাপক", meaning: "Yuan", category: "NUMBER" },
  { id: "30", character: "这", pinyin: "zhè", bengali: "এটি", meaning: "This", category: "PRONOUN" },
  { id: "31", character: "那", pinyin: "nà", bengali: "সেটি", meaning: "That", category: "PRONOUN" },
  { id: "32", character: "家", pinyin: "jiā", bengali: "বাড়ি", meaning: "Home", category: "OBJECT" },
  { id: "33", character: "爱", pinyin: "ài", bengali: "ভালোবাসা", meaning: "Love", category: "ACTION" },
  { id: "34", character: "在", pinyin: "zài", bengali: "থাকা", meaning: "To be at", category: "ACTION" },
  { id: "35", character: "几", pinyin: "jǐ", bengali: "কত", meaning: "How many", category: "NUMBER" },
  { id: "36", character: "点", pinyin: "diǎn", bengali: "টা", meaning: "O'clock", category: "NUMBER" },
  { id: "37", character: "今天", pinyin: "jīntiān", bengali: "আজ", meaning: "Today", category: "OBJECT" },
  { id: "38", character: "明天", pinyin: "míngtiān", bengali: "আগামীকাল", meaning: "Tomorrow", category: "OBJECT" },
  { id: "39", character: "北京", pinyin: "Běijīng", bengali: "বেইজিং", meaning: "Beijing", category: "OBJECT" },
  { id: "40", character: "很", pinyin: "hěn", bengali: "খুব", meaning: "Very", category: "ADJECTIVE" },
  { id: "41", character: "漂亮", pinyin: "piàoliang", bengali: "সুন্দর", meaning: "Beautiful", category: "ADJECTIVE" },
  { id: "42", character: "忙", pinyin: "máng", bengali: "ব্যস্ত", meaning: "Busy", category: "ADJECTIVE" },
  { id: "43", character: "天", pinyin: "tiān", bengali: "আকাশ", meaning: "Sky", category: "OBJECT" },
  { id: "44", character: "多", pinyin: "duō", bengali: "অনেক", meaning: "Many", category: "ADJECTIVE" },
  { id: "45", character: "少", pinyin: "shǎo", bengali: "কম", meaning: "Few", category: "ADJECTIVE" },
  { id: "46", character: "多少", pinyin: "duōshao", bengali: "কতটুকু", meaning: "How much", category: "PRONOUN" },
  { id: "47", character: "哪儿", pinyin: "nǎr", bengali: "কোথায়", meaning: "Where", category: "PRONOUN" },
  { id: "48", character: "去", pinyin: "qù", bengali: "যাওয়া", meaning: "To go", category: "ACTION" },
  { id: "49", character: "想", pinyin: "xiǎng", bengali: "চাওয়া", meaning: "To want", category: "ACTION" },
  { id: "50", character: "坐", pinyin: "zuò", bengali: "বসা", meaning: "To sit", category: "ACTION" },
];

export const HSK_1_MODULES: HSKModule[] = [
  {
    id: 1,
    title: "লেসন ১: সাধারণ সম্ভাষণ",
    shortDesc: "হ্যালো ও বিদায়",
    icon: "👋",
    color: "#88B04B",
    words: HSK_1_WORDS.slice(0, 5).concat(HSK_1_WORDS[16], HSK_1_WORDS[18]),
    quizzes: [
      { id: "q1_1", type: "BUILD", question: "বাক্যটি তৈরি করুন: 'তুমি ভালো আছ'", chineseContent: "你好", correctAnswer: "你好", chips: ["নি", "হাও", "ও"] },
    ]
  },
  {
    id: 2,
    title: "লেসন ২: প্রতিদিনের কাজ",
    shortDesc: "খাওয়া ও পান করা",
    icon: "🍚",
    color: "#D4A373",
    words: HSK_1_WORDS.slice(7, 11),
    quizzes: []
  }
];

export const HSK_2_WORDS: Word[] = [
  { id: "h2_1", character: "报纸", pinyin: "bàozhǐ", bengali: "সংবাদপত্র", meaning: "Newspaper", category: "OBJECT", examples: [{ zh: "你看报纸吗？", py: "Nǐ kàn bàozhǐ ma?", bn: "তুমি কি সংবাদপত্র পড়ো?" }] },
  { id: "h2_2", character: "唱歌", pinyin: "chànggē", bengali: "গান গাওয়া", meaning: "To Sing", category: "ACTION", examples: [{ zh: "她唱歌很好听。", py: "Tā chànggē hěn hǎotīng.", bn: "সে খুব সুন্দর গান গায়।" }] },
  { id: "h2_3", character: "出", pinyin: "chū", bengali: "বের হওয়া", meaning: "To Exit/Go out", category: "ACTION" },
  { id: "h2_4", character: "穿", pinyin: "chuān", bengali: "পরিধান করা", meaning: "To Wear", category: "ACTION", examples: [{ zh: "你穿什么衣服？", py: "Nǐ chuān shénme yīfú?", bn: "তুমি কি পোশাক পরেছো?" }] },
  { id: "h2_5", character: "错", pinyin: "cuò", bengali: "ভুল", meaning: "Wrong", category: "ADJECTIVE" },
  { id: "h2_6", character: "打篮球", pinyin: "dǎ lánqiú", bengali: "বাস্কেটবল খেলা", meaning: "Play basketball", category: "ACTION" },
  { id: "h2_7", character: "大家", pinyin: "dàjiā", bengali: "সবাই", meaning: "Everyone", category: "PRONOUN" },
  { id: "h2_8", character: "到", pinyin: "dào", bengali: "পৌঁছানো", meaning: "To arrive", category: "ACTION" },
  { id: "h2_9", character: "得", pinyin: "de", bengali: "ক্রিয়া বিশেষণ চিহ্ন", meaning: "Particle", category: "ADJECTIVE" },
  { id: "h2_10", character: "等", pinyin: "děng", bengali: "অপেক্ষা করা", meaning: "To wait", category: "ACTION" },
];

export const HSK_2_MODULES: HSKModule[] = [
  {
    id: 101,
    title: "HSK ২ লেসন ১: অবসর সময়",
    shortDesc: "গান ও খেলাধুলা",
    icon: "⚽",
    color: "#6C5CE7",
    words: [HSK_2_WORDS[1], HSK_2_WORDS[4]],
    quizzes: [
      {
        id: "q_h2_1",
        type: "LISTENING",
        question: "সঠিক অর্থ নির্বাচন করুন",
        chineseContent: "唱歌",
        correctAnswer: "গান গাওয়া",
        options: ["গান গাওয়া", "নাচ করা", "বলা"]
      }
    ]
  },
  {
    id: 102,
    title: "HSK ২ লেসন ২: মানুষের সাথে পরিচয়",
    shortDesc: "সবাই ও পরিচিতি",
    icon: "👥",
    color: "#FF7675",
    words: [HSK_2_WORDS[6], HSK_2_WORDS[7], HSK_2_WORDS[9]],
    quizzes: [
      {
        id: "q_h2_2",
        type: "TRANSLATE",
        question: "'সবাই' এর পিনয়িন লিখুন",
        chineseContent: "大家",
        correctAnswer: "dajia",
        hint: "dàjiā"
      }
    ]
  }
];

export interface HSKLevelData {
  level: number;
  title: string;
  modules: HSKModule[];
}

export const ALL_HSK_DATA: HSKLevelData[] = [
  { level: 1, title: "HSK ১", modules: HSK_1_MODULES },
  { level: 2, title: "HSK ২", modules: HSK_2_MODULES },
];
