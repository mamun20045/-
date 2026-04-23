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

export interface ChatMessage {
  id: number;
  sender: "AI" | "USER";
  chinese: string;
  pinyin: string;
  bengali: string;
}

// HSK 1 Premium Features Data
export const USER_NAME = "মামুন";
export const USER_POINTS = 1200;
export const USER_STREAK = 5;

// Premium Features (14 Total)
export const PREMIUM_FEATURES = [
  { id: "camera", title: "ম্যাজিক ক্যামেরা", desc: "চারপাশের বস্তু স্ক্যান করুন", icon: "Camera", color: "#FF6B6B" },
  { id: "tones", title: "সুর চেকার", desc: "চাইনিজ টোন প্র্যাকটিস", icon: "Waves", color: "#4ECDC4" },
  { id: "dubbing", title: "ভিডিও ডাবিং", desc: "নাটকের ক্লিপে কথা বলুন", icon: "Tv", color: "#FFD93D" },
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
  { id: "dictionary", title: "ডিকশনারি", desc: "সহজ শব্দ খোঁজা", icon: "Search", color: "#A29BFE" },
  { id: "mocktest", title: "এইচএসকে টেস্ট", desc: "পরীক্ষার প্রস্তুতি", icon: "FileText", color: "#FAB1A0" },
];

export const DICTIONARY_DATA = [
  { word: "爱", pinyin: "ài", bn: "ভালোবাসা", ex: "我爱我的家 (আমি আমার পরিবারকে ভালোবাসি)" },
  { word: "八", pinyin: "bā", bn: "আট", ex: "我有八个杯子 (আমার আটটি কাপ আছে)" },
  { word: "茶", pinyin: "chá", bn: "চা", ex: "请喝茶 (অনুগ্রহ করে চা পান করুন)" },
  { word: "大", pinyin: "dà", bn: "বড়", ex: "这个苹果很大 (এই আপেলটি অনেক বড়)" },
  { word: "二", pinyin: "èr", bn: "দুই", ex: "他有两个妹妹 (তার দুইজন ছোট বোন আছে)" },
  { word: "饭", pinyin: "fàn", bn: "ভাত", ex: "我会下个饭 (আমি রান্না করতে পারি)" },
  { word: "狗", pinyin: "gǒu", bn: "কুকুর", ex: "这只狗很可爱 (এই কুকুরটি খুব কিউট)" },
  { word: "和", pinyin: "hé", bn: "এবং", ex: "爸爸和我 (বাবা এবং আমি)" },
  { word: "几", pinyin: "jǐ", bn: "কয়টি", ex: "你有几个苹果？ (তোমার কাছে কয়টি আপেল আছে?)" },
  { word: "看", pinyin: "kàn", bn: "দেখা/পড়া", ex: "我看书 (আমি বই পড়ি)" },
  { word: "冷", pinyin: "lěng", bn: "ঠান্ডা", ex: "今天很冷 (আজ খুব ঠান্ডা)" },
  { word: "妈妈", pinyin: "māma", bn: "মা", ex: "妈妈爱我 (মা আমাকে ভালোবাসেন)" },
  { word: "你", pinyin: "nǐ", bn: "তুমি", ex: "你好 (হ্যালো)" },
  { word: "漂亮", pinyin: "piàoliang", bn: "সুন্দর", ex: "她很漂亮 (সে খুব সুন্দর)" },
  { word: "去", pinyin: "qù", bn: "যাওয়া", ex: "我去学校 (আমি স্কুলে যাই)" },
  { word: "水", pinyin: "shuǐ", bn: "পানি", ex: "我想喝水 (আমি পানি খেতে চাই)" },
  { word: "听", pinyin: "tīng", bn: "শোনা", ex: "我听音乐 (আমি গান শুনি)" },
  { word: "我们", pinyin: "wǒmen", bn: "আমরা", ex: "我们是朋友 (আমরা বন্ধু)" },
  { word: "小", pinyin: "xiǎo", bn: "ছোট", ex: "这个猫很小 (এই বিড়ালটি খুব ছোট)" },
  { word: "医生", pinyin: "yīshēng", bn: "ডাক্তার", ex: "他是医生 (সে একজন ডাক্তার)" },
  { word: "再见", pinyin: "zàijiàn", bn: "বিদায়", ex: "明天见 (আগামীকাল দেখা হবে)" },
];

export const MOCK_TEST_STATUS = {
  unlocked: true,
  lastScore: 0,
  totalQuestions: 10,
  timeLimit: 600 // 10 minutes for demo
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
  {
    id: "m4",
    type: "LISTENING",
    question: "সঠিক অর্থ নির্বাচন করুন",
    chineseContent: "谢谢",
    correctAnswer: "ধন্যবাদ",
    options: ["ধন্যবাদ", "মা", "বাবা"]
  },
  {
    id: "m5",
    type: "BUILD",
    question: "তৈরি করুন: 'তুুমি চা পান করো'",
    chineseContent: "你喝茶",
    correctAnswer: "你喝茶",
    chips: ["茶", "你", "喝", "我"]
  },
  {
    id: "m6",
    type: "TRANSLATE",
    question: "'মানুষ' এর পিনয়িন কী?",
    chineseContent: "人",
    correctAnswer: "ren",
    hint: "rén"
  },
  {
    id: "m7",
    type: "LISTENING",
    question: "সঠিক অর্থ নির্বাচন করুন",
    chineseContent: "再见",
    correctAnswer: "বিদায়",
    options: ["বিদায়", "হ্যালো", "নাম"]
  },
  {
    id: "m8",
    type: "BUILD",
    question: "তৈরি করুন: 'সে আমার বন্ধু'",
    chineseContent: "他是我的朋友",
    correctAnswer: "他是我的朋友",
    chips: ["他", "是", "我的", "朋友", "我"]
  },
  {
    id: "m9",
    type: "TRANSLATE",
    question: "'বড়' এর পিনয়িন কী?",
    chineseContent: "大",
    correctAnswer: "da",
    hint: "dà"
  },
  {
    id: "m10",
    type: "BUILD",
    question: "তৈরি করুন: 'আমি ভালোবাসি'",
    chineseContent: "我爱",
    correctAnswer: "我爱",
    chips: ["爱", "我", "喝"]
  }
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
    wikiUrl: "https://bn.wikipedia.org/wiki/%E0%A6%9A%E0%A7%80%E0%A6%A8%E0%A7%87%E0%A6%B0_%E0%A6%AE%E0%A6%B9%E0%A6%BE%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%BE%E0%A6%9A%E0%A7%80%E0%A6%B0"
  },
  { 
    id: 3, 
    title: "বসন্ত উৎসব (Lunar New Year)", 
    img: "https://images.unsplash.com/photo-1576402197148-356396f42a7d?auto=format&fit=crop&q=80&w=400", 
    desc: "চাইনিজদের সবচেয়ে বড় এবং রঙিন উৎসব। লাল রঙের পোশাক ও লণ্ঠন এখানে অনিবার্য।",
    wikiUrl: "https://bn.wikipedia.org/wiki/%E0%A6%9A%E0%A7%80%E0%A6%A8%E0%A6%BE_%E0%A6%A8%E0%A6%AC%E0%A6%AC%E0%A6%B0%E0%A7%8D%E0%A6%B7"
  }
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
  { id: 2, url: "https://assets.mixkit.co/videos/preview/mixkit-busy-street-in-shanghai-at-night-4245-large.mp4", backup: "https://www.w3schools.com/html/mov_bbb.mp4", title: "সাংহাই শহর", subtiles: { zh: "上海很漂亮!", bn: "সাংহাই অনেক সুন্দর!" } },
  { id: 3, url: "https://assets.mixkit.co/videos/preview/mixkit-tea-being-poured-into-a-cup-4009-large.mp4", backup: "https://www.w3schools.com/html/mov_bbb.mp4", title: "চাইনিজ চা", subtiles: { zh: "请喝茶。", bn: "অনুগ্রহ করে চা পান করুন।" } },
];

export const ROLEPLAY_SCENARIOS = [
  {
    id: 1,
    title: "রেস্টুরেন্টে অর্ডার করা",
    video: "https://assets.mixkit.co/videos/preview/mixkit-chef-preparing-a-meal-in-a-professional-kitchen-8622-large.mp4",
    backupVideo: "https://www.w3schools.com/html/mov_bbb.mp4",
    lines: [
      { id: "L1", speaker: "Waiter", text: "您想吃什么?", pinyin: "Nín xiǎng chī shénme?", translation: "আপনি কি খেতে চান?" },
      { id: "L2", speaker: "You", text: "我想吃米饭。", pinyin: "Wǒ xiǎng chī mǐfàn.", translation: "আমি ভাত খেতে চাই।" }
    ]
  }
];

export const TONE_PRACTICE = [
  { char: "妈", pinyin: "mā", tone: 1, desc: "উচ্চ ও সমান্তরাল (High Level)" },
  { char: "麻", pinyin: "má", tone: 2, desc: "নিচ থেকে উপরে (Rising)" },
  { char: "马", pinyin: "mǎ", tone: 3, desc: "নিচে নেমে উপরে (Falling-Rising)" },
  { char: "骂", pinyin: "mà", tone: 4, desc: "উপর থেকে নিচে (Falling)" },
];

export const STORY_CONTENT: StorySegment[] = [
  { pinyin: "Wǒ de jiā", chinese: "我的家", bengali: "আমার পরিবার" },
  { pinyin: "Wǒ jiā yǒu sān kǒu rén.", chinese: "我家有三口人。", bengali: "আমার পরিবারে তিনজন সদস্য আছে।" },
  { pinyin: "Bàba, māma hé wǒ.", chinese: "爸爸, 妈妈和我。", bengali: "বাবা, মা এবং আমি।" },
  { pinyin: "Wǒmen hěn xìngfú。", chinese: "我们很幸福。", bengali: "আমরা খুব সুখী।" }
];

export const CHAT_HISTORY: ChatMessage[] = [
  { id: 1, sender: "AI", chinese: "你好! 你叫什么名字?", pinyin: "Nǐ hǎo! Nǐ jiào shénme míngzì?", bengali: "হ্যালো! তোমার নাম কি?" },
  { id: 2, sender: "USER", chinese: `你好, 我叫 ${USER_NAME}。`, pinyin: "Nǐ hǎo, wǒ jiào Mamun.", bengali: `হ্যালো, আমার নাম ${USER_NAME}।` },
  { id: 3, sender: "AI", chinese: "很高兴认识你。", pinyin: "Hěn gāoxìng rènshí nǐ.", bengali: "তোমার সাথে দেখা করে খুব ভালো লাগলো।" }
];

// Survival Kit Data
export const SURVIVAL_KIT = [
  { pinyin: "Jiùmìng ā!", chinese: "救命啊！", bengali: "বাঁচান! (পাহাড়ের বিপদে)", meaning: "Help!" },
  { pinyin: "Wǒ mídù le.", chinese: "我迷路了。", bengali: "আমি হারিয়ে গেছি।", meaning: "I am lost." },
  { pinyin: "Yīyuàn zài nǎr?", chinese: "医院在哪儿？", bengali: "হাসপাতাল কোথায়?", meaning: "Where is the hospital?" },
];

// Flashcards Data
export const FLASHCARDS_DATA = [
  { char: "日", pinyin: "Rì", bengali: "সূর্য / দিন", img: "https://images.unsplash.com/photo-1526644485127-ec1245084992?auto=format&fit=crop&q=80&w=300" },
  { char: "月", pinyin: "Yuè", bengali: "চাঁদ / মাস", img: "https://images.unsplash.com/photo-1532689591141-b4ec11f93010?auto=format&fit=crop&q=80&w=300" },
  { char: "山", pinyin: "Shān", bengali: "পাহাড়", img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=300" },
  { char: "水", pinyin: "Shuǐ", bengali: "পানি", img: "https://images.unsplash.com/photo-1548919973-5dea5846f669?auto=format&fit=crop&q=80&w=300" },
  { char: "火", pinyin: "Huǒ", bengali: "আগুন", img: "https://images.unsplash.com/photo-1517055729445-fa7d27394b48?auto=format&fit=crop&q=80&w=300" },
  { char: "木", pinyin: "Mù", bengali: "কাঠ / গাছ", img: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&q=80&w=300" },
  { char: "人", pinyin: "Rén", bengali: "মানুষ", img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300" },
  { char: "口", pinyin: "Kǒu", bengali: "মুখ", img: "https://images.unsplash.com/photo-1543336585-8868cc9da7eb?auto=format&fit=crop&q=80&w=300" },
  { char: "门", pinyin: "Mén", bengali: "দরজা", img: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?auto=format&fit=crop&q=80&w=300" },
  { char: "心", pinyin: "Xīn", bengali: "হৃদয়", img: "https://images.unsplash.com/photo-1516589174184-c685266e48df?auto=format&fit=crop&q=80&w=300" },
];

export const WRITING_CHARACTERS = [
  { char: "一", pinyin: "yī", meaning: "এক (One)" },
  { char: "人", pinyin: "rén", meaning: "মানুষ (Person)" },
  { char: "大", pinyin: "dà", meaning: "বড় (Big)" },
  { char: "口", pinyin: "kǒu", meaning: "মুখ (Mouth/Measure word)" },
  { char: "妈", pinyin: "mā", meaning: "মা (Mother)" },
  { char: "水", pinyin: "shuǐ", meaning: "পানি (Water)" },
  { char: "王", pinyin: "wáng", meaning: "রাজা (King/Common surname)" },
  { char: "天", pinyin: "tiān", meaning: "আকাশ/দিন (Sky/Day)" },
  { char: "子", pinyin: "zǐ", meaning: "সন্তান/বীজ (Son/Child/Seed)" },
  { char: "中", pinyin: "zhōng", meaning: "মধ্য/চীন (Middle/China)" },
  { char: "火", pinyin: "huǒ", meaning: "আগুন (Fire)" },
  { char: "山", pinyin: "shān", meaning: "পাহাড় (Mountain)" },
  { char: "木", pinyin: "mù", meaning: "গাছ/কাঠ (Tree/Wood)" },
  { char: "小", pinyin: "xiǎo", meaning: "ছোট (Small)" }
];

export const GAME_WORDS = [
  { chinese: "你好", bengali: "হ্যালো" },
  { chinese: "水", bengali: "পানি" },
  { chinese: "吃", bengali: "খাওয়া" },
  { chinese: "谢谢", bengali: "ধন্যবাদ" },
  { chinese: "再见", bengali: "বিদায়" }
];

export const HSK_1_WORDS: Word[] = [
  { id: "1", character: "我", pinyin: "wǒ", bengali: "আমি", meaning: "I/Me", category: "PRONOUN" },
  { id: "2", character: "你", pinyin: "nǐ", bengali: "তুমি", meaning: "You", category: "PRONOUN" },
  { id: "3", character: "他", pinyin: "tā", bengali: "সে", meaning: "He/She", category: "PRONOUN" },
  { id: "4", character: "们", pinyin: "men", bengali: "রা (বহুবচন)", meaning: "Plural suffix", category: "PRONOUN" },
  { id: "5", character: "好", pinyin: "hǎo", bengali: "ভালো", meaning: "Good", category: "ADJECTIVE" },
  { id: "6", character: "是", pinyin: "shì", bengali: "হয়", meaning: "To be (Is/Are)", category: "ACTION" },
  { id: "7", character: "不", pinyin: "bù", bengali: "না", meaning: "Not", category: "ADJECTIVE" },
  { id: "8", character: "喝", pinyin: "hē", bengali: "পান করা", meaning: "To Drink", category: "ACTION" },
  { id: "9", character: "吃", pinyin: "chī", bengali: "খাওয়া", meaning: "To Eat", category: "ACTION" },
  { id: "10", character: "水", pinyin: "shuǐ", bengali: "পানি", meaning: "Water", category: "OBJECT" },
  { id: "11", character: "饭", pinyin: "fàn", bengali: "ভাত", meaning: "Meal/Rice", category: "OBJECT" },
  { id: "12", character: "大", pinyin: "dà", bengali: "বড়", meaning: "Big", category: "ADJECTIVE" },
  { id: "13", character: "小", pinyin: "xiǎo", bengali: "ছোট", meaning: "Small", category: "ADJECTIVE" },
  { id: "14", character: "一", pinyin: "yī", bengali: "এক", meaning: "One", category: "NUMBER" },
  { id: "15", character: "二", pinyin: "èr", bengali: "দুই", meaning: "Two", category: "NUMBER" },
  { id: "16", character: "三", pinyin: "sān", bengali: "তিন", meaning: "Three", category: "NUMBER" },
  { id: "17", character: "谢谢", pinyin: "xièxiè", bengali: "ধন্যবাদ", meaning: "Thank you", category: "ACTION" },
  { id: "18", character: "见", pinyin: "jiàn", bengali: "দেখা করা", meaning: "To See", category: "ACTION" },
  { id: "19", character: "再见", pinyin: "zàijiàn", bengali: "বিদায়", meaning: "Goodbye", category: "ACTION" },
  { id: "20", character: "多", pinyin: "duō", bengali: "অনেক", meaning: "Many/Much", category: "ADJECTIVE" },
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
      {
        id: "q1_1",
        type: "BUILD",
        question: "বাক্যটি তৈরি করুন: 'তুমি ভালো আছ'",
        chineseContent: "你好",
        correctAnswer: "你好",
        chips: ["你", "好", "我"]
      },
      {
        id: "q1_2",
        type: "LISTENING",
        question: "বাংলা অর্থটি নির্বাচন করুন",
        chineseContent: "再见",
        correctAnswer: "বিদায়",
        options: ["ধন্যবাদ", "বিদায়", "আমি"]
      }
    ]
  },
  {
    id: 2,
    title: "লেসন ২: প্রতিদিনের কাজ",
    shortDesc: "খাওয়া ও পান করা",
    icon: "🍚",
    color: "#D4A373",
    words: HSK_1_WORDS.slice(7, 11),
    quizzes: [
      {
        id: "q2_1",
        type: "BUILD",
        question: "তৈরি করুন: 'আমি পানি খাই'",
        chineseContent: "我喝水",
        correctAnswer: "我喝水",
        chips: ["喝", "我", "水", "饭"]
      },
      {
        id: "q2_2",
        type: "TRANSLATE",
        question: "'খাওয়া' এর পিনয়িন লিখুন",
        chineseContent: "吃",
        correctAnswer: "chi",
        hint: "পিনয়িন: chī"
      }
    ]
  },
  {
    id: 3,
    title: "লেসন ৩: সংখ্যা শিক্ষা",
    shortDesc: "১ থেকে ৩ পর্যন্ত গণনা",
    icon: "🔢",
    color: "#5C9DFF",
    words: HSK_1_WORDS.slice(13, 16),
    quizzes: [
      {
        id: "q3_1",
        type: "LISTENING",
        question: "সংখ্যাটি শুনুন",
        chineseContent: "三",
        correctAnswer: "তিন",
        options: ["এক", "দুই", "তিন"]
      }
    ]
  }
];
