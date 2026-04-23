/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI } from "@google/genai";
import Markdown from "react-markdown";
import { 
  Volume2, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle2, 
  LayoutGrid,
  Trophy,
  Star,
  Video,
  BookOpen,
  Mic,
  PenTool,
  MessageSquare,
  Gamepad2,
  Play,
  RotateCcw,
  RotateCw,
  Layers,
  HeartPulse,
  BarChart3,
  Send,
  X,
  Flame,
  Camera,
  Waves,
  Tv,
  PlaySquare,
  Globe,
  Target,
  Bot,
  Search,
  FileText
} from "lucide-react";
import { 
  HSK_1_MODULES, 
  PREMIUM_FEATURES, 
  STORY_CONTENT, 
  CHAT_HISTORY, 
  WRITING_CHARACTERS,
  GAME_WORDS,
  USER_NAME,
  USER_POINTS,
  USER_STREAK,
  SURVIVAL_KIT,
  FLASHCARDS_DATA,
  CULTURE_DATA,
  DAILY_MISSIONS,
  REVISION_CARDS,
  DICTIONARY_DATA,
  GRAMMAR_DATA,
  MOCK_TEST_STATUS,
  MOCK_TEST_QUESTIONS
} from "./constants";
import { playSound } from "./services/soundService";
import { MagicCamera } from "./components/MagicCamera";
import { ToneAnalyzer } from "./components/ToneAnalyzer";
import { VideoRoleplay } from "./components/VideoRoleplay";
import { ShortsFeed } from "./components/ShortsFeed";

export default function App() {
  // State Management
  const [screen, setScreen] = useState<"DASHBOARD" | "MAP" | "LEARNING" | "QUIZ" | "RESULT" | "PREMIUM">("DASHBOARD");
  const [premiumCategory, setPremiumCategory] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState(HSK_1_MODULES[0]);
  const [learningIndex, setLearningIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizInput, setQuizInput] = useState("");
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [quizResult, setQuizResult] = useState<{ isCorrect: boolean; feedback: string } | null>(null);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  
  // Premium Specific States
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [chatMessages, setChatMessages] = useState(CHAT_HISTORY);
  const [userChatInput, setUserChatInput] = useState("");
  const [gameState, setGameState] = useState({ score: 0, activeWordIndex: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [tutorMessages, setTutorMessages] = useState<{ sender: "AI" | "USER"; text: string }[]>([
    { sender: "AI", text: `স্বাগতম ${USER_NAME}! আমি আপনাকে চাইনিজ গ্রামার এবং উচ্চারণে সাহায্য করতে পারি। আপনার প্রশ্নটি লিখুন।` }
  ]);
  const [tutorInput, setTutorInput] = useState("");
  const [isAILoading, setIsAILoading] = useState(false);
  const [dictSearchQuery, setDictSearchQuery] = useState("");
  const [dictLetterFilter, setDictLetterFilter] = useState<string | null>(null);
  const [selectedWritingIdx, setSelectedWritingIdx] = useState(0);
  const [isMockTest, setIsMockTest] = useState(false);
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Gemini Setup Lazy
  const aiRef = useRef<any>(null);
  
  const getAI = () => {
    if (!aiRef.current) {
      aiRef.current = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return aiRef.current;
  };

  const handleTutorSend = async () => {
    if (!tutorInput.trim() || isAILoading) return;
    
    const userMsg = tutorInput.trim();
    setTutorMessages(prev => [...prev, { sender: "USER", text: userMsg }]);
    setTutorInput("");
    setIsAILoading(true);
    playSound("CLICK");

    try {
      const aiInstance = getAI();
      const response = await aiInstance.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMsg,
        config: {
          systemInstruction: `You are "Bangla to Chinese Guru", a friendly AI tutor for Bengali speakers learning Mandarin Chinese. 
          Your name is "Guru". Always reply in Bengali. 
          FORMATTING RULES:
          1. Use clean Markdown. 
          2. Use bold (**text**) for emphasis.
          3. Use Bullet points for word breakdowns.
          4. Always separate Chinese, Pinyin, Bengali Pronunciation, and Meaning into different lines or a list.
          5. Keep responses concise and avoid very long paragraphs. Use clear sections.
          Example structure:
          - **চীনা বাক্য:** [Chinese]
          - **পিনয়িন:** [Pinyin]
          - **বাংলা উচ্চারণ:** [Pronunciation]
          - **অর্থ:** [Meaning]`
        }
      });
      
      const aiResponse = response.text || "দুঃখিত, আমি বুঝতে পারছি না। আবার চেষ্টা করুন।";
      setTutorMessages(prev => [...prev, { sender: "AI", text: aiResponse }]);
    } catch (error) {
      console.error("AI Tutor Error:", error);
      setTutorMessages(prev => [...prev, { sender: "AI", text: "দুঃখিত, নেটওয়ার্ক বা কানেকশনে সমস্যা হচ্ছে। অনুগ্রহ করে সেটিংসে আপনার Gemini API Key চেক করুন।" }]);
    } finally {
      setIsAILoading(false);
    }
  };

  // Native TTS Function
  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      utterance.rate = 0.75;
      window.speechSynthesis.speak(utterance);
    }
  };

  const startModule = (module: typeof HSK_1_MODULES[0]) => {
    playSound("CLICK");
    setActiveModule(module);
    setScreen("LEARNING");
    setLearningIndex(0);
    setQuizIndex(0);
    speak(module.words[0].character);
  };

  const nextStep = () => {
    playSound("CLICK");
    if (learningIndex < activeModule.words.length - 1) {
      const idx = learningIndex + 1;
      setLearningIndex(idx);
      speak(activeModule.words[idx].character);
    } else {
      setScreen("QUIZ");
    }
  };

  const toggleChip = (chip: string) => {
    playSound("CLICK");
    if (selectedChips.includes(chip)) {
      setSelectedChips(selectedChips.filter(c => c !== chip));
    } else {
      setSelectedChips([...selectedChips, chip]);
    }
  };

  const checkQuiz = (choice?: string) => {
    const questions = isMockTest ? MOCK_TEST_QUESTIONS : activeModule.quizzes;
    const currentQuiz = questions[quizIndex];
    let isCorrect = false;

    if (currentQuiz.type === "TRANSLATE") {
      const normalizedInput = quizInput.trim().toLowerCase().replace(/\s+/g, "");
      const normalizedAnswer = currentQuiz.correctAnswer.toLowerCase().replace(/\s+/g, "");
      isCorrect = normalizedInput === normalizedAnswer;
    } else if (currentQuiz.type === "BUILD") {
      const builtSentence = selectedChips.join("");
      isCorrect = builtSentence === currentQuiz.correctAnswer;
    } else {
      isCorrect = choice === currentQuiz.correctAnswer;
    }

    if (isCorrect) {
      playSound("CORRECT");
      setQuizResult({ isCorrect: true, feedback: "চমৎকার! (Excellent!)" });
    } else {
      playSound("INCORRECT");
      setQuizResult({ 
        isCorrect: false, 
        feedback: `আবার চেষ্টা করুন। সঠিক উত্তর: ${currentQuiz.correctAnswer}` 
      });
    }
  };

  const nextQuiz = () => {
    playSound("CLICK");
    setQuizResult(null);
    setQuizInput("");
    setSelectedChips([]);
    const questions = isMockTest ? MOCK_TEST_QUESTIONS : activeModule.quizzes;
    if (quizIndex < questions.length - 1) {
      setQuizIndex(prev => prev + 1);
    } else {
      playSound("SUCCESS");
      setScreen("RESULT");
      if (!isMockTest && !completedModules.includes(activeModule.id)) {
        setCompletedModules([...completedModules, activeModule.id]);
      }
    }
  };

  const startMockTest = () => {
    playSound("CLICK");
    setIsMockTest(true);
    setScreen("QUIZ");
    setQuizIndex(0);
    setQuizInput("");
    setQuizResult(null);
    setSelectedChips([]);
  };

  const returnToMap = () => {
    playSound("CLICK");
    setScreen("DASHBOARD"); // Default to dashboard now
    setQuizResult(null);
    setQuizInput("");
    setSelectedChips([]);
    setLearningIndex(0);
    setQuizIndex(0);
    setPremiumCategory(null);
    setIsMockTest(false);
  };

  // Premium Feature Simulation: Handwriting Canvas
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.strokeStyle = "#2D3436";
        ctx.lineWidth = 12;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
      }
      const rect = canvas.getBoundingClientRect();
      const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
      const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
      ctx?.beginPath();
      ctx?.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      const rect = canvas.getBoundingClientRect();
      const x = ('touches' in e) ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
      const y = ('touches' in e) ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
      ctx?.lineTo(x, y);
      ctx?.stroke();
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Rendering Helpers
  const renderIcon = (name: string, color: string) => {
    const props = { size: 24, color };
    switch (name) {
      case "Video": return <Video {...props} />;
      case "BookOpen": return <BookOpen {...props} />;
      case "Mic": return <Mic {...props} />;
      case "PenTool": return <PenTool {...props} />;
      case "MessageSquare": return <MessageSquare {...props} />;
      case "Gamepad2": return <Gamepad2 {...props} />;
      case "RotateCw": return <RotateCw {...props} />;
      case "Layers": return <Layers {...props} />;
      case "HeartPulse": return <HeartPulse {...props} />;
      case "BarChart3": return <BarChart3 {...props} />;
      case "Camera": return <Camera {...props} />;
      case "Waves": return <Waves {...props} />;
      case "Tv": return <Tv {...props} />;
      case "PlaySquare": return <PlaySquare {...props} />;
      case "Globe": return <Globe {...props} />;
      case "Target": return <Target {...props} />;
      case "Bot": return <Bot {...props} />;
      case "Search": return <Search {...props} />;
      case "FileText": return <FileText {...props} />;
      default: return <Star {...props} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2E8] font-sans text-[#2D3436] selection:bg-[#88B04B]/20">
      <div className="w-full sm:max-w-md mx-auto h-dvh flex flex-col bg-white overflow-hidden relative lg:shadow-[0_0_100px_rgba(0,0,0,0.05)]">
        
        {/* Header / Gamified Progress */}
        <div className="pt-safe bg-white border-b border-[#F0F2E8] sticky top-0 z-50">
          <div className="px-5 py-4 flex items-center gap-4 justify-between">
            <div className="flex items-center gap-2">
              {screen !== "DASHBOARD" && (
                <button 
                  onClick={returnToMap} 
                  className="p-2 -ml-2 text-[#636E72] hover:bg-[#F9FAF5] rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              )}
              {screen === "DASHBOARD" && (
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 bg-[#88B04B] rounded-lg flex items-center justify-center text-white font-black text-xs">G</div>
                   <span className="font-black text-sm tracking-tighter">চাইনিজ গুরু</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-1.5 bg-[#FFF9F0] px-3 py-1.5 rounded-full border border-[#FFE0B2]">
                <Flame size={14} className="text-[#E67E22]" fill="currentColor" />
                <span className="font-black text-xs text-[#E67E22]">{USER_STREAK} দিন</span>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-1.5 bg-[#F9FAF5] px-3 py-1.5 rounded-full border border-[#F0F2E8]">
                <Trophy size={14} className="text-[#F1C40F]" fill="currentColor" />
                <span className="font-black text-xs text-[#2D3436] tracking-tight">{USER_POINTS}</span>
              </motion.div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 pb-safe scrollbar-hide">
          <AnimatePresence mode="wait">
            
            {screen === "DASHBOARD" && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-8 pt-2">
                {/* Personalized Header */}
                <div className="relative p-8 rounded-[40px] bg-gradient-to-br from-[#88B04B] to-[#5D8A31] text-white overflow-hidden shadow-xl">
                   <div className="absolute top-0 right-0 p-8 opacity-10"><Trophy size={120} /></div>
                   <div className="flex items-center gap-4 mb-6 relative z-10">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/30">
                        👨‍🎓
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-white/80 font-bold text-xs uppercase tracking-widest">স্বাগতম ফিরে আসার জন্য!</p>
                        <h1 className="text-3xl font-black tracking-tight leading-none">স্বাগতম, {USER_NAME}!</h1>
                      </div>
                   </div>
                   <div className="relative z-10 space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/90">
                         <span>আজকের অগ্রগতি</span>
                         <span>৭৫%</span>
                      </div>
                      <div className="h-2.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                         <div className="h-full bg-white rounded-full w-[75%]" />
                      </div>
                   </div>
                   <p className="mt-6 text-white/90 font-bold text-sm">চলুন চাইনিজ শিখি এবং আপনার লক্ষ্য অর্জন করি! 🚀</p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {/* Primary Path */}
                  <button 
                    onClick={() => setScreen("MAP")}
                    className="col-span-2 w-full p-6 bg-white border-2 border-[#F0F2E8] rounded-[32px] text-left flex items-center justify-between group hover:border-[#88B04B] transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-[#88B04B] rounded-2xl flex items-center justify-center text-white shadow-lg">
                        <Trophy size={28} />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-[#2D3436] tracking-tight">শিখার পথ</h2>
                        <p className="text-[10px] font-bold text-[#A0A396] uppercase tracking-widest">HSK ১ মাস্টারক্লাস</p>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-[#A0A396]" />
                  </button>

                  {PREMIUM_FEATURES.map((feature) => (
                    <motion.button
                      key={feature.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        playSound("CLICK");
                        setScreen("PREMIUM");
                        setPremiumCategory(feature.id);
                      }}
                      className="p-4 sm:p-5 bg-white border-2 border-[#F0F2E8] rounded-[28px] sm:rounded-[32px] text-left space-y-2.5 hover:border-[#88B04B] transition-all shadow-sm group"
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-sm bg-[#F9FAF5] group-hover:scale-110 transition-transform">
                        {renderIcon(feature.icon, feature.color)}
                      </div>
                      <div>
                        <h3 className="font-black text-[#2D3436] text-[13px] sm:text-sm tracking-tight leading-tight">{feature.title}</h3>
                        <p className="text-[8px] sm:text-[9px] text-[#A0A396] font-extrabold uppercase tracking-widest leading-tight">{feature.desc}</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {screen === "PREMIUM" && (
              <motion.div key="premium" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                
                {premiumCategory === "camera" && <MagicCamera onClose={returnToMap} />}
                {premiumCategory === "grammar" && (
                   <div className="space-y-6">
                      <div className="p-8 bg-gradient-to-br from-[#E67E22] to-[#D35400] rounded-[48px] text-white shadow-xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-8 opacity-10"><BookOpen size={120} /></div>
                         <h2 className="text-3xl font-black mb-1 relative z-10 tracking-tighter">গ্রামার গাইড (HSK 1)</h2>
                         <p className="text-white/80 font-bold text-sm relative z-10">অফলাইনেও শিখুন যে কোনো সময়</p>
                      </div>
                      <div className="space-y-8">
                         {GRAMMAR_DATA.map((item, idx) => (
                           <div key={idx} className="space-y-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-1.5 h-6 bg-[#E67E22] rounded-full" />
                                 <h3 className="font-black text-xl text-[#2D3436] tracking-tight">{item.title}</h3>
                              </div>
                              <p className="text-sm font-bold text-[#636E72] px-4">{item.desc}</p>
                              <div className="space-y-3 px-4">
                                 {item.rules.map((rule, rIdx) => (
                                   <div key={rIdx} className="p-5 bg-[#F9FAF5] rounded-[32px] border-2 border-[#F0F2E8] space-y-2 group hover:border-[#E67E22] transition-all">
                                      <pre className="text-[10px] font-black uppercase text-[#E67E22] tracking-widest">{rule.rule}</pre>
                                      <p className="text-xl font-black text-[#2D3436]">{rule.ex}</p>
                                      <p className="text-sm font-bold text-[#A0A396]">অর্থ: {rule.bn}</p>
                                      <button onClick={() => speak(rule.ex.split('(')[0].trim())} className="mt-2 text-[#E67E22] font-black text-[10px] uppercase tracking-widest flex items-center gap-1">
                                         <Volume2 size={12} /> উচ্চারণ শুনুন
                                      </button>
                                   </div>
                                 ))}
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                )}
                {premiumCategory === "tones" && <ToneAnalyzer onClose={returnToMap} />}
                {premiumCategory === "dubbing" && <VideoRoleplay onClose={returnToMap} />}
                {premiumCategory === "shorts" && <ShortsFeed onClose={returnToMap} />}

                {/* SMART REVISION (Bengali) */}
                {premiumCategory === "revision" && (
                   <div className="space-y-6">
                      <div className="p-6 bg-[#F9FAF5] rounded-[32px] border-2 border-[#F0F2E8]">
                         <h2 className="text-xl font-black mb-1">স্মার্ট রিভিশন</h2>
                         <p className="text-xs text-[#A0A396] font-bold uppercase">Spaced Repetition System</p>
                      </div>
                      <div className="grid gap-4">
                        {REVISION_CARDS.map((card, idx) => (
                          <div key={idx} className="bg-white p-6 rounded-[32px] border-2 border-[#F0F2E8] flex justify-between items-center group hover:border-[#88B04B] transition-all">
                             <div className="space-y-1">
                                <h3 className="text-2xl font-black">{card.word}</h3>
                                <p className="text-[#88B04B] font-bold text-xs">{card.pinyin}</p>
                                <p className="text-[#636E72] text-sm">{card.bn}</p>
                             </div>
                             <div className="text-right">
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${card.due.includes('প্রয়োজন') ? 'bg-red-100 text-red-500' : 'bg-green-100 text-[#88B04B]'}`}>
                                  {card.due}
                                </span>
                             </div>
                          </div>
                        ))}
                      </div>
                   </div>
                )}

                {/* MISSION SCREEN (Bengali) */}
                {premiumCategory === "missions" && (
                   <div className="space-y-6">
                      <div className="p-8 bg-gradient-to-br from-[#E67E22] to-[#D35400] rounded-[48px] text-white shadow-lg">
                         <h2 className="text-2xl font-black mb-1">ডেইলি মিশন</h2>
                         <p className="text-white/80 font-bold text-sm">নতুন শব্দ শিখে পয়েন্ট জিতুন!</p>
                      </div>
                      <div className="space-y-3">
                         {DAILY_MISSIONS.map(m => (
                           <div key={m.id} className="p-5 bg-white border-2 border-[#F0F2E8] rounded-3xl flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${m.completed ? 'bg-green-500 text-white' : 'border-2 border-dashed border-[#F0F2E8] text-[#A0A396]'}`}>
                                    {m.completed ? <CheckCircle2 size={16} /> : <div className="text-[10px] font-black">?</div>}
                                 </div>
                                 <span className={`font-bold ${m.completed ? 'text-[#636E72] line-through' : 'text-[#2D3436]'}`}>{m.task}</span>
                              </div>
                              <span className="font-black text-[#E67E22]">+{m.points}</span>
                           </div>
                         ))}
                      </div>
                   </div>
                )}

                {/* CULTURE SCREEN (Bengali) */}
                {premiumCategory === "culture" && (
                   <div className="space-y-6">
                      <div className="flex items-center justify-between mb-4">
                         <h2 className="text-2xl font-black text-[#2D3436]">চায়না কালচার</h2>
                         <div className="bg-[#F9FAF5] px-4 py-2 rounded-full text-[10px] font-black text-[#636E72]">TRAVEL GUIDE</div>
                      </div>
                      <div className="space-y-8">
                         {CULTURE_DATA.map(c => (
                           <motion.div key={c.id} whileTap={{ scale: 0.98 }} className="rounded-[40px] overflow-hidden bg-white border-2 border-[#F0F2E8] shadow-sm">
                              <div className="h-48 overflow-hidden">
                                 <img 
                                   src={c.img} 
                                   alt={c.title} 
                                   referrerPolicy="no-referrer"
                                   className="w-full h-full object-cover" 
                                 />
                              </div>
                              <div className="p-6">
                                 <h3 className="text-xl font-black mb-2">{c.title}</h3>
                                 <p className="text-sm text-[#636E72] leading-relaxed">{c.desc}</p>
                                 <button 
                                   onClick={() => window.open((c as any).wikiUrl || `https://www.google.com/search?q=${encodeURIComponent(c.title)}`, '_blank')}
                                   className="mt-4 text-[#88B04B] font-black text-sm uppercase tracking-widest flex items-center gap-1 active:scale-95 transition-all"
                                 >
                                   আরও পড়ুন <ChevronRight size={14} />
                                 </button>
                              </div>
                           </motion.div>
                         ))}
                      </div>
                   </div>
                )}

                {/* AI TUTOR SCREEN (Bengali) */}
                {premiumCategory === "aitutor" && (
                   <div className="space-y-4 flex flex-col h-[70dvh]">
                      <div className="p-6 bg-gradient-to-br from-[#00B894] to-[#00CEC9] rounded-[32px] text-white flex items-center gap-4 shadow-lg shrink-0">
                         <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                            <Bot size={28} />
                         </div>
                         <div>
                            <h2 className="text-xl font-black">এআই টিউটর (Gemini)</h2>
                            <p className="text-xs text-white/80 font-bold uppercase tracking-widest leading-none">যেকোনো প্রশ্ন করুন</p>
                         </div>
                      </div>

                      <div className="flex-1 bg-[#F9FAF5] rounded-[32px] p-4 border-2 border-[#F0F2E8] overflow-y-auto space-y-4 scrollbar-hide">
                         {tutorMessages.map((m, i) => (
                           <div key={i} className={`flex ${m.sender === "USER" ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[85%] p-4 rounded-[24px] font-bold text-sm shadow-sm transition-all ${
                                m.sender === "USER" 
                                ? "bg-[#88B04B] text-white rounded-tr-none" 
                                : "bg-white text-[#2D3436] border border-[#F0F2E8] rounded-tl-none"
                              }`}>
                                 {m.sender === "AI" ? (
                                   <div className="markdown-body">
                                     <Markdown>{m.text}</Markdown>
                                   </div>
                                 ) : m.text}
                              </div>
                           </div>
                         ))}
                         {isAILoading && (
                            <div className="flex justify-start">
                               <div className="bg-white p-4 rounded-[24px] border border-[#F0F2E8] rounded-tl-none">
                                  <div className="flex gap-1 animate-pulse">
                                     <div className="w-2 h-2 bg-[#A0A396] rounded-full" />
                                     <div className="w-2 h-2 bg-[#A0A396] rounded-full" />
                                     <div className="w-2 h-2 bg-[#A0A396] rounded-full" />
                                  </div>
                               </div>
                            </div>
                         )}
                      </div>

                      <div className="p-2 bg-white border-2 border-[#F0F2E8] rounded-full flex items-center gap-2 shrink-0">
                         <input 
                           type="text" 
                           value={tutorInput}
                           onChange={(e) => setTutorInput(e.target.value)}
                           onKeyDown={(e) => e.key === "Enter" && handleTutorSend()}
                           placeholder="গ্রামার সম্পর্কে প্রশ্ন করুন..." 
                           className="flex-1 bg-transparent px-5 py-2.5 outline-none font-bold text-sm" 
                         />
                         <button 
                           onClick={handleTutorSend}
                           disabled={isAILoading}
                           className="bg-[#00B894] text-white p-3.5 rounded-full hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:scale-100"
                         >
                            <Send size={18} />
                         </button>
                      </div>
                   </div>
                )}

                {/* DICTIONARY SCREEN (Bengali) */}
                {premiumCategory === "dictionary" && (
                   <div className="space-y-6">
                      <div className="p-6 bg-[#A29BFE] rounded-[32px] text-white flex items-center justify-between shadow-lg">
                         <div>
                            <h2 className="text-2xl font-black">A to Z ডিকশনারি</h2>
                            <p className="text-white/80 font-bold text-xs uppercase tracking-widest leading-none">সহজ শব্দকোষ</p>
                         </div>
                         <Search size={32} className="opacity-20" />
                      </div>

                      <div className="relative">
                         <input 
                           type="text" 
                           value={dictSearchQuery}
                           onChange={(e) => {
                             setDictSearchQuery(e.target.value);
                             setDictLetterFilter(null);
                           }}
                           placeholder="শব্দ বা অর্থ দিয়ে খুঁজুন..." 
                           className="w-full p-6 pl-14 bg-white border-2 border-[#F0F2E8] rounded-[32px] outline-none focus:border-[#A29BFE] transition-all font-bold" 
                         />
                         <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-[#A0A396]" />
                      </div>

                      {/* Alphabetical Picker */}
                      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide shrink-0">
                         {["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "W", "X", "Y", "Z"].map(letter => (
                           <button 
                             key={letter}
                             onClick={() => {
                               setDictLetterFilter(p => p === letter ? null : letter);
                               setDictSearchQuery("");
                             }}
                             className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all shrink-0 ${dictLetterFilter === letter ? 'bg-[#A29BFE] text-white' : 'bg-white border-2 border-[#F0F2E8] text-[#636E72]'}`}
                           >
                             {letter}
                           </button>
                         ))}
                      </div>

                      <div className="space-y-4">
                         {DICTIONARY_DATA.filter(item => {
                           if (dictSearchQuery) {
                             const q = dictSearchQuery.toLowerCase();
                             return item.word.includes(q) || item.bn.includes(q) || item.pinyin.toLowerCase().includes(q);
                           }
                           if (dictLetterFilter) {
                             return item.pinyin.toUpperCase().startsWith(dictLetterFilter);
                           }
                           return true;
                         }).map((item, idx) => (
                           <motion.div 
                             initial={{ opacity: 0, y: 10 }}
                             animate={{ opacity: 1, y: 0 }}
                             key={idx} 
                             className="p-6 bg-white border-2 border-[#F0F2E8] rounded-[32px] space-y-3 group hover:border-[#A29BFE] transition-all"
                           >
                              <div className="flex items-center justify-between">
                                 <h3 className="text-3xl font-black text-[#2D3436] tracking-tight">{item.word}</h3>
                                 <div className="px-3 py-1 bg-[#F9FAF5] rounded-full text-[10px] font-black text-[#636E72] uppercase tracking-widest">{item.pinyin}</div>
                              </div>
                              <p className="text-[#636E72] font-black text-lg">বাংলা: {item.bn}</p>
                              <div className="p-3 bg-[#F9FAF5] rounded-2xl italic text-xs text-[#A0A396]">
                                 {item.ex}
                              </div>
                           </motion.div>
                         ))}
                         {DICTIONARY_DATA.filter(item => {
                            if (dictSearchQuery) {
                              const q = dictSearchQuery.toLowerCase();
                              return item.word.includes(q) || item.bn.includes(q) || item.pinyin.toLowerCase().includes(q);
                            }
                            if (dictLetterFilter) {
                              return item.pinyin.toUpperCase().startsWith(dictLetterFilter);
                            }
                            return true;
                         }).length === 0 && (
                            <div className="py-20 text-center space-y-2">
                               <p className="text-[#A0A396] font-bold">কোনো শব্দ পাওয়া যায়নি</p>
                               <button onClick={() => { setDictSearchQuery(""); setDictLetterFilter(null); }} className="text-[#A29BFE] font-black">সবগুলো দেখুন</button>
                            </div>
                         )}
                      </div>
                   </div>
                )}

                {/* MOCK TEST SCREEN (Bengali) */}
                {premiumCategory === "mocktest" && (
                   <div className="space-y-6">
                      <div className="p-10 bg-[#FAB1A0] rounded-[48px] text-center space-y-4 relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12"><FileText size={150} /></div>
                         <h2 className="text-3xl font-black text-[#D63031] relative z-10 leading-tight">HSK ১ আসল পরীক্ষার মতো সিমুলেশন</h2>
                         <p className="text-[#D63031]/80 font-bold text-sm relative z-10 leading-relaxed uppercase tracking-widest">৪০টি প্রশ্ন • ৬০ মিনিট</p>
                         <button className="relative z-10 w-full py-5 bg-[#D63031] text-white rounded-[24px] font-black text-xl shadow-[0_8px_0_#962121] active:translate-y-1 active:shadow-none transition-all mt-4 uppercase tracking-widest">পরীক্ষা শুরু করুন</button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-6 bg-white border-2 border-[#F0F2E8] rounded-[32px] text-center">
                            <p className="text-[10px] font-black text-[#A0A396] uppercase mb-1">সর্বশেষ স্কোর</p>
                            <h4 className="text-2xl font-black text-[#2D3436] tracking-tighter">{MOCK_TEST_STATUS.lastScore}</h4>
                         </div>
                         <div className="p-6 bg-white border-2 border-[#F0F2E8] rounded-[32px] text-center">
                            <p className="text-[10px] font-black text-[#A0A396] uppercase mb-1">প্রস্তুতি</p>
                            <h4 className="text-2xl font-black text-[#2D3436] tracking-tighter">৭৫%</h4>
                         </div>
                      </div>
                   </div>
                )}

                {/* FLASHCARDS SCREEN */}
                {premiumCategory === "flashcards" && (
                  <div className="flex flex-col items-center justify-center space-y-8 py-4 h-full">
                    <div className="text-center space-y-2">
                       <h2 className="text-3xl font-black text-[#2D3436]">মজাদার ফ্ল্যাশকার্ড</h2>
                       <p className="text-[#A0A396] font-bold">কার্ডটি ঘুরিয়ে অর্থ দেখুন</p>
                    </div>

                    <div className="relative w-full max-w-[320px] aspect-[3/4] perspective-1000">
                      <motion.div 
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                        style={{ transformStyle: "preserve-3d" }}
                        className="w-full h-full relative cursor-pointer"
                        onClick={() => setIsFlipped(!isFlipped)}
                      >
                        {/* Front Side */}
                        <div className={`absolute inset-0 bg-white border-4 border-[#F0F2E8] rounded-[48px] p-8 flex flex-col items-center justify-center space-y-6 shadow-xl backface-hidden ${isFlipped ? 'pointer-events-none' : ''}`}>
                           <div className="w-full aspect-square bg-[#F9FAF5] rounded-[32px] overflow-hidden border-2 border-[#F0F2E8]">
                              <img 
                                src={FLASHCARDS_DATA[flashcardIdx].img} 
                                alt="illustrative" 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                           </div>
                           <h3 className="text-7xl font-black text-[#2D3436] tracking-tighter">{FLASHCARDS_DATA[flashcardIdx].char}</h3>
                           <div className="px-6 py-2 bg-[#F1C40F] text-white rounded-full font-black text-xs uppercase tracking-widest">ট্যাপ করুন</div>
                        </div>

                        {/* Back Side */}
                        <div 
                          style={{ transform: "rotateY(180deg)" }}
                          className={`absolute inset-0 bg-[#F1C40F] border-4 border-[#F1C40F] rounded-[48px] p-8 flex flex-col items-center justify-center space-y-4 shadow-xl backface-hidden ${!isFlipped ? 'pointer-events-none' : ''}`}
                        >
                           <p className="text-white/80 font-black text-xs uppercase tracking-[0.3em] mb-4">অর্থ ও উচ্চারণ</p>
                           <h3 className="text-5xl font-black text-white tracking-tighter mb-2">{FLASHCARDS_DATA[flashcardIdx].bengali}</h3>
                           <p className="text-3xl font-black text-white/90">{FLASHCARDS_DATA[flashcardIdx].pinyin}</p>
                           <button onClick={(e) => { e.stopPropagation(); speak(FLASHCARDS_DATA[flashcardIdx].char); }} className="mt-6 p-4 bg-white/20 hover:bg-white/30 text-white rounded-2xl transition-colors">
                              <Volume2 size={32} />
                           </button>
                        </div>
                      </motion.div>
                    </div>

                    <div className="flex items-center gap-6 pt-4">
                       <button 
                         onClick={() => {
                           playSound("CLICK");
                           setIsFlipped(false);
                           setFlashcardIdx((prev) => (prev > 0 ? prev - 1 : FLASHCARDS_DATA.length - 1));
                         }} 
                         className="p-5 bg-white border-2 border-[#F0F2E8] text-[#2D3436] rounded-[24px] shadow-md active:scale-95 transition-transform"
                       >
                         <ChevronLeft size={24} />
                       </button>
                       <div className="font-black text-[#2D3436] min-w-[60px] text-center">
                          {flashcardIdx + 1} / {FLASHCARDS_DATA.length}
                       </div>
                       <button 
                         onClick={() => {
                           playSound("CLICK");
                           setIsFlipped(false);
                           setFlashcardIdx((prev) => (prev < FLASHCARDS_DATA.length - 1 ? prev + 1 : 0));
                         }} 
                         className="p-5 bg-[#2D3436] text-white rounded-[24px] shadow-xl active:scale-95 transition-transform"
                       >
                         <ChevronRight size={24} />
                       </button>
                    </div>
                  </div>
                )}

                {/* VISUAL BUILDER SCREEN */}
                {premiumCategory === "video" && (
                  <div className="space-y-6">
                    <div className="aspect-video bg-gray-100 rounded-[32px] overflow-hidden flex items-center justify-center relative shadow-inner">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
                      <Play size={48} className="text-white relative z-20 opacity-90 drop-shadow-lg" fill="currentColor" />
                      <div className="absolute bottom-6 left-6 z-20">
                        <p className="text-white font-black text-lg tracking-tight">বন্ধুর সাথে সম্ভাষণ</p>
                        <p className="text-white/80 text-[10px] uppercase font-bold tracking-widest">ভিডিও লেসন</p>
                      </div>
                    </div>
                    <div className="bg-[#F9FAF5] p-6 rounded-[40px] border-2 border-[#F0F2E8] space-y-6">
                      <div className="text-center space-y-1">
                        <p className="text-[10px] font-black text-[#A0A396] uppercase tracking-widest">I want to drink water</p>
                        <h3 className="text-2xl font-black text-[#2D3436]">আমি পানি খাই</h3>
                      </div>
                      <div className="min-h-[60px] p-4 bg-white/50 rounded-2xl border-2 border-dashed border-[#E0E2D9] flex flex-wrap gap-2 justify-center">
                        {selectedChips.map(c => <span key={c} className="px-5 py-2 bg-[#88B04B] text-white rounded-xl font-black">{c}</span>)}
                      </div>
                      <div className="flex flex-wrap justify-center gap-2">
                        {["我", "喝", "水", "你", "吃"].map(chip => (
                          <button 
                            key={chip} onClick={() => toggleChip(chip)}
                            className={`px-6 py-3 rounded-2xl font-black text-xl transition-all ${selectedChips.includes(chip) ? 'bg-[#F0F2E8] opacity-0' : 'bg-white border-2 border-[#F0F2E8] text-[#2D3436] hover:border-[#88B04B] shadow-sm'}`}
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button className="w-full py-5 bg-[#88B04B] text-white rounded-[24px] font-black text-xl shadow-[0_6px_0_#5D8A31] active:translate-y-1 transition-all uppercase tracking-widest">
                      চেক করুন
                    </button>
                  </div>
                )}

                {/* STORIES SCREEN (Bengali) */}
                {premiumCategory === "stories" && (
                   <div className="space-y-8">
                    <div className="rounded-[40px] overflow-hidden shadow-xl aspect-square bg-[#F0F2E8] border-4 border-white relative">
                      <img src="https://images.unsplash.com/photo-1518173946687-a4c8a9b749f5?auto=format&fit=crop&q=80&w=400" alt="Story" className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                        <p className="text-white font-black text-2xl tracking-tighter">আমার সুন্দর বাড়ি</p>
                      </div>
                    </div>
                    <div className="space-y-12 px-2">
                      {STORY_CONTENT.map((seg, i) => (
                        <motion.div key={i} onClick={() => speak(seg.chinese)} whileTap={{ scale: 0.98 }} className="text-center group cursor-pointer space-y-1">
                          <p className="text-[#88B04B] font-bold text-xs uppercase tracking-[0.2em]">{seg.pinyin}</p>
                          <p className="text-[32px] font-black text-[#2D3436] group-hover:text-[#88B04B] transition-colors leading-tight">{seg.chinese}</p>
                          <p className="text-[#636E72] font-semibold text-sm">{seg.bengali}</p>
                        </motion.div>
                      ))}
                    </div>
                    <div className="sticky bottom-6 bg-white p-5 border-2 border-[#F0F2E8] rounded-full shadow-2xl flex items-center gap-4 z-40">
                      <button className="w-14 h-14 bg-[#88B04B] rounded-full flex items-center justify-center text-white shadow-lg active:scale-95 transition-transform"><Play size={28} fill="currentColor" className="ml-1" /></button>
                      <div className="flex-1 space-y-1.5">
                        <div className="flex justify-between text-[10px] font-black text-[#A0A396] uppercase italic tracking-widest">
                          <span>অডিও শুনুন</span>
                          <span>১:২৪</span>
                        </div>
                        <div className="h-2 bg-[#F0F2E8] rounded-full overflow-hidden">
                          <div className="w-1/3 h-full bg-[#88B04B] rounded-full" />
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-full border-2 border-[#F0F2E8] flex items-center justify-center font-black text-xs text-[#636E72]">১.০x</div>
                    </div>
                  </div>
                )}

                {/* SPEAKING AI SCREEN */}
                {premiumCategory === "speaking" && (
                  <div className="flex flex-col items-center justify-center py-12 space-y-16">
                    <div className="text-center space-y-1">
                      <p className="text-[#88B04B] font-black text-[10px] uppercase tracking-[0.3em] mb-4">Listen and Repeat</p>
                      <h2 className="text-6xl font-black tracking-tighter text-[#2D3436]">你好</h2>
                      <p className="text-xl font-bold text-[#636E72]">Nǐ hǎo (Hello)</p>
                    </div>

                    <div className="relative group">
                      <AnimatePresence>
                        {isListening && (
                          <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.1, 0.3] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="absolute inset-[-40px] bg-[#88B04B] rounded-full blur-2xl"
                          />
                        )}
                      </AnimatePresence>
                      <button 
                        onMouseDown={() => { setIsListening(true); setTranscript(""); }}
                        onMouseUp={() => { setIsListening(false); setTranscript("Nǐ hǎo"); }}
                        className="w-40 h-40 bg-[#88B04B] rounded-[60px] flex items-center justify-center text-white shadow-[0_12px_40px_rgba(136,176,75,0.4)] relative z-10 transform active:scale-90 transition-all active:shadow-none"
                      >
                        <Mic size={64} />
                      </button>
                    </div>

                    <div className="h-32 w-full text-center px-4">
                      {transcript ? (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                           <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F9FAF5] rounded-2xl border-2 border-[#F0F2E8]">
                              <CheckCircle2 size={16} className="text-[#88B04B]" />
                              <span className="font-black text-sm text-[#2D3436]">92% ACCURACY</span>
                           </div>
                           <p className="text-[#636E72] font-bold italic text-lg">"{transcript}"</p>
                        </motion.div>
                      ) : isListening ? (
                         <p className="font-black text-[#88B04B] text-xl animate-pulse uppercase tracking-widest">Listening...</p>
                      ) : (
                         <p className="text-[#A0A396] font-bold">Hold button to speak</p>
                      )}
                    </div>
                  </div>
                )}

                {/* HANDWRITING SCREEN */}
                {premiumCategory === "writing" && (
                   <div className="space-y-6">
                      <div className="flex items-center justify-between">
                         <div className="space-y-1">
                            <p className="text-[10px] font-black text-[#A0A396] uppercase tracking-widest leading-none">ক্যারেক্টার সিলেকশন</p>
                            <h2 className="text-3xl font-black text-[#2D3436] tracking-tighter flex items-center gap-3">
                               {WRITING_CHARACTERS[selectedWritingIdx].char}
                               <button 
                                 onClick={() => speak(WRITING_CHARACTERS[selectedWritingIdx].char)}
                                 className="p-2 bg-[#F9FAF5] rounded-xl text-[#88B04B]"
                               >
                                  <Volume2 size={16} />
                               </button>
                            </h2>
                            <p className="text-[#636E72] font-bold text-sm tracking-tight">{WRITING_CHARACTERS[selectedWritingIdx].pinyin} - {WRITING_CHARACTERS[selectedWritingIdx].meaning}</p>
                         </div>
                         <button onClick={clearCanvas} className="w-14 h-14 bg-white rounded-2xl border-2 border-[#F0F2E8] flex items-center justify-center text-[#636E72] active:bg-gray-100 shadow-sm transition-all">
                            <RotateCcw size={24} />
                         </button>
                      </div>

                      {/* Character List */}
                      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                         {WRITING_CHARACTERS.map((item, idx) => (
                           <button 
                             key={idx}
                             onClick={() => {
                               setSelectedWritingIdx(idx);
                               clearCanvas();
                             }}
                             className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center text-xl font-black transition-all ${selectedWritingIdx === idx ? 'bg-[#88B04B] text-white shadow-lg shadow-green-200' : 'bg-white border-2 border-[#F0F2E8] text-[#2D3436]'}`}
                           >
                             {item.char}
                           </button>
                         ))}
                      </div>

                      <div className="aspect-square bg-white border-2 border-[#F0F2E8] rounded-[48px] relative overflow-hidden shadow-sm">
                         {/* Grid Lines */}
                         <div className="absolute inset-0 pointer-events-none opacity-20">
                            <div className="absolute inset-8 border-2 border-[#88B04B] border-dashed rounded-3xl" />
                            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 border-l-2 border-[#88B04B] border-dashed" />
                            <div className="absolute top-1/2 left-0 right-0 h-0.5 border-t-2 border-[#88B04B] border-dashed" />
                         </div>
                         {/* Ghost Character Guide */}
                         <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                            <span className="text-[250px] font-black">{WRITING_CHARACTERS[selectedWritingIdx].char}</span>
                         </div>
                         <canvas 
                           ref={canvasRef} width={380} height={380}
                           onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={() => setIsDrawing(false)}
                           onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={() => setIsDrawing(false)}
                           className="w-full h-full relative z-10 cursor-crosshair"
                         />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                         <button 
                           onClick={() => {
                             clearCanvas();
                             // Simulation of stroke check
                             playSound("SUCCESS");
                           }}
                           className="py-5 bg-[#88B04B] text-white rounded-[24px] font-black text-lg shadow-[0_6px_0_#5D8A31] active:translate-y-1 transition-all uppercase tracking-widest"
                         >
                            চেক করুন
                         </button>
                         <button 
                           className="py-5 bg-white border-2 border-[#F0F2E8] text-[#2D3436] rounded-[24px] font-black text-lg shadow-[0_6px_0_#F0F2E8] active:translate-y-1 transition-all uppercase tracking-widest"
                         >
                            অ্যানিমেশন
                         </button>
                      </div>
                   </div>
                )}

                {/* CHAT SCREEN */}
                {premiumCategory === "chat" && (
                  <div className="flex flex-col h-[650px] relative z-10">
                    <div className="flex-1 space-y-6 overflow-y-auto pb-6 pr-1 custom-scrollbar">
                      {chatMessages.map((msg) => (
                        <motion.div 
                          key={msg.id} initial={{ opacity: 0, x: msg.sender === "AI" ? -20 : 20 }} animate={{ opacity: 1, x: 0 }}
                          className={`flex ${msg.sender === "AI" ? "justify-start" : "justify-end"}`}
                        >
                          <div className={`max-w-[85%] p-5 rounded-[32px] space-y-1 relative shadow-sm ${msg.sender === "AI" ? "bg-[#F9FAF5] rounded-bl-none border border-[#F0F2E8]" : "bg-[#88B04B] text-white rounded-br-none"}`}>
                            <p className={`text-[8px] font-black uppercase tracking-[0.2em] ${msg.sender === "AI" ? "text-[#88B04B]" : "text-white/80"}`}>{msg.pinyin}</p>
                            <p className="text-lg font-black tracking-tight leading-snug">{msg.chinese}</p>
                            <div className="flex items-center gap-3 pt-1">
                               <p className={`text-[10px] font-bold ${msg.sender === "AI" ? "text-[#636E72]" : "text-white/80"}`}>{msg.bengali}</p>
                               <button onClick={() => speak(msg.chinese)} className="p-1 hover:bg-black/5 rounded-lg transition-colors"><Volume2 size={12} /></button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    <div className="pt-4 flex gap-3 bg-white sticky bottom-0">
                      <input 
                        type="text" value={userChatInput} onChange={(e) => setUserChatInput(e.target.value)}
                        placeholder="Say hello in Chinese..."
                        className="flex-1 p-5 bg-[#F9FAF5] border-2 border-[#F0F2E8] rounded-[24px] font-bold text-sm focus:border-[#88B04B] outline-none"
                      />
                      <button 
                        onClick={() => {
                          if (userChatInput.trim()) {
                            playSound("CLICK");
                            setChatMessages([...chatMessages, {
                              id: chatMessages.length + 1,
                              sender: "USER",
                              chinese: userChatInput,
                              pinyin: "...",
                              bengali: "..."
                            }]);
                            setUserChatInput("");
                          }
                        }}
                        className="w-16 h-16 bg-[#88B04B] rounded-[24px] flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"
                      >
                        <Send size={24} />
                      </button>
                    </div>
                  </div>
                )}

                {/* GAMES SCREEN */}
                {premiumCategory === "games" && (
                  <div className="flex flex-col h-[650px]">
                    <div className="flex justify-between items-center mb-8 bg-[#F9FAF5] p-5 rounded-[24px] border-2 border-[#F0F2E8]">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#F1C40F] shadow-sm"><Trophy size={20} /></div>
                          <span className="font-black text-xl">{gameState.score}</span>
                       </div>
                       <div className="text-[10px] font-black text-[#A0A396] uppercase tracking-[0.2em]">Hard Level</div>
                    </div>

                    <div className="flex-1 relative bg-white border-4 border-[#F0F2E8] rounded-[48px] overflow-hidden flex flex-col items-center">
                       <AnimatePresence mode="wait">
                         <motion.div 
                           key={gameState.activeWordIndex}
                           initial={{ y: -100 }} animate={{ y: 350 }} transition={{ duration: 6, ease: "linear" }}
                           className="absolute top-0 px-8 py-6 bg-white border-2 border-[#88B04B] rounded-[32px] shadow-2xl z-10"
                           onAnimationComplete={() => setGameState(p => ({ ...p, activeWordIndex: (p.activeWordIndex + 1) % GAME_WORDS.length }))}
                         >
                            <h3 className="text-4xl font-black text-[#2D3436] tracking-tighter">{GAME_WORDS[gameState.activeWordIndex].chinese}</h3>
                         </motion.div>
                       </AnimatePresence>

                       <div className="absolute bottom-8 left-6 right-6 grid grid-cols-2 gap-3">
                          {GAME_WORDS.map((w, i) => (
                            <button 
                              key={i}
                              onClick={() => {
                                if (w.chinese === GAME_WORDS[gameState.activeWordIndex].chinese) {
                                  playSound("GAME_TICK");
                                  setGameState(p => ({ score: p.score + 10, activeWordIndex: (p.activeWordIndex + 1) % GAME_WORDS.length }));
                                  speak("Good!");
                                } else {
                                  playSound("INCORRECT");
                                }
                              }}
                              className="py-4 bg-white border-2 border-[#F0F2E8] rounded-2xl font-black text-sm uppercase tracking-tight shadow-sm active:bg-[#88B04B] active:text-white transition-all"
                            >
                              {w.bengali}
                            </button>
                          ))}
                       </div>
                    </div>
                  </div>
                )}

                {/* SURVIVAL KIT SCREEN */}
                {premiumCategory === "survival" && (
                  <div className="space-y-6">
                    <div className="p-8 bg-gradient-to-br from-[#E74C3C] to-[#C0392B] rounded-[48px] text-white space-y-4 shadow-xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12"><HeartPulse size={100} /></div>
                       <h2 className="text-3xl font-black tracking-tighter relative z-10">সারভাইভাল কিট</h2>
                       <p className="text-white/80 font-bold text-sm tracking-tight relative z-10 leading-relaxed">জরুরী সময়ে এই চাইনিজ শব্দগুলো আপনার জীবন বাঁচাতে পারে!</p>
                    </div>

                    <div className="grid gap-4">
                      {SURVIVAL_KIT.map((item, i) => (
                        <motion.div 
                          key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                          className="bg-white p-6 rounded-[32px] border-2 border-[#F0F2E8] flex items-center justify-between group hover:border-[#E74C3C] transition-all cursor-pointer shadow-sm active:scale-[0.98]"
                          onClick={() => speak(item.chinese)}
                        >
                           <div className="space-y-1">
                              <p className="text-[#E74C3C] font-black text-[10px] uppercase tracking-widest">{item.pinyin}</p>
                              <h3 className="text-2xl font-black text-[#2D3436] tracking-tight">{item.chinese}</h3>
                              <p className="text-[#636E72] font-bold text-sm">{item.bengali}</p>
                           </div>
                           <div className="w-12 h-12 bg-[#F9FAF5] rounded-2xl flex items-center justify-center text-[#E74C3C] group-hover:bg-[#E74C3C] group-hover:text-white transition-all">
                              <Volume2 size={24} />
                           </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* FLASHCARDS SCREEN */}
                {premiumCategory === "flashcards" && (
                  <div className="space-y-8 flex flex-col items-center">
                    <div className="w-full h-[460px] relative">
                       <motion.div 
                         key={gameState.activeWordIndex}
                         initial={{ rotateY: -90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }}
                         className="w-full h-full bg-white rounded-[60px] border-4 border-[#F0F2E8] shadow-2xl overflow-hidden flex flex-col items-center"
                       >
                          <div className="w-full h-1/2 overflow-hidden bg-gray-100">
                             <img src={FLASHCARDS_DATA[gameState.activeWordIndex].img} className="w-full h-full object-cover" alt="Visual hint" />
                          </div>
                          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-3">
                             <h2 className="text-[100px] font-black text-[#2D3436] leading-none mb-4">{FLASHCARDS_DATA[gameState.activeWordIndex].char}</h2>
                             <p className="text-2xl font-black text-[#F1C40F] uppercase tracking-[0.3em]">{FLASHCARDS_DATA[gameState.activeWordIndex].pinyin}</p>
                             <p className="text-xl font-bold text-[#636E72]">{FLASHCARDS_DATA[gameState.activeWordIndex].bengali}</p>
                          </div>
                       </motion.div>
                    </div>

                    <div className="flex gap-4 w-full">
                       <button 
                        onClick={() => {
                          playSound("CLICK");
                          setGameState(p => ({ ...p, activeWordIndex: (p.activeWordIndex + 1) % FLASHCARDS_DATA.length }));
                        }}
                        className="flex-1 py-5 bg-[#88B04B] text-white rounded-[24px] font-black text-xl shadow-[0_8px_0_#5D8A31] active:translate-y-1 active:shadow-none transition-all uppercase tracking-widest"
                       >
                         পরবর্তী কার্ড
                       </button>
                    </div>
                  </div>
                )}

                {/* PLACEHOLDERS FOR OTHERS */}
                {(premiumCategory === "revision" || premiumCategory === "leaderboard") && (
                   <div className="h-[500px] flex flex-col items-center justify-center space-y-6 text-center">
                      <div className="w-32 h-32 bg-[#F9FAF5] rounded-[40px] border-4 border-[#F0F2E8] flex items-center justify-center text-4xl">⚙️</div>
                      <div className="space-y-2">
                        <h2 className="text-3xl font-black tracking-tight leading-none text-[#2D3436]">শীঘ্রই আসছে!</h2>
                        <p className="text-[#A0A396] font-bold px-12">আমরা এই ফিচারটি আরও সুন্দর করার জন্য কাজ করছি। আমাদের সাথেই থাকুন।</p>
                      </div>
                      <button onClick={returnToMap} className="px-8 py-3 bg-[#F0F2E8] text-[#2D3436] rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-200 transition-colors">ফিরে যান</button>
                   </div>
                )}
              </motion.div>
            )}

            {screen === "MAP" && (
              <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 py-4">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black tracking-tight">শিখার পথ</h2>
                  <div className="flex items-center gap-2 text-[#A0A396] bg-[#F9FAF5] px-3 py-1 rounded-full"><CheckCircle2 size={14} /> <span className="text-[10px] font-black uppercase tracking-widest">HSK ১</span></div>
                </div>

                <div className="flex flex-col items-center gap-20 relative">
                  <div className="absolute top-0 bottom-0 w-3 bg-[#F0F2E8] z-0 -translate-x-1/2 left-1/2 rounded-full" />
                  
                  {HSK_1_MODULES.map((module, i) => {
                    const isUnlocked = i <= completedModules.length;
                    return (
                      <motion.div key={module.id} 
                        initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                        className="relative z-10"
                      >
                        <button 
                          onClick={() => isUnlocked && startModule(module)}
                          className={`
                            w-24 h-24 rounded-[32px] flex items-center justify-center text-4xl shadow-xl relative transform transition-all
                            ${isUnlocked ? 'bg-white border-4 border-[#88B04B] text-[#88B04B] active:translate-y-1' : 'bg-[#F0F2E8] text-[#A0A396] border-4 border-transparent grayscale'}
                          `}
                        >
                          {module.icon}
                        </button>
                        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-40 text-center">
                          <p className={`text-[100%] font-black uppercase tracking-widest ${isUnlocked ? 'text-[#2D3436]' : 'text-[#A0A396]'}`}>{module.title}</p>
                          {i === completedModules.length && (
                            <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="mt-2 inline-flex gap-1.5 items-center px-4 py-1.5 bg-[#88B04B] text-white text-[10px] font-black rounded-full shadow-lg">
                              <Star size={10} fill="currentColor" /> শুরু করুন
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {screen === "LEARNING" && (
              <motion.div key="learning" initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -300, opacity: 0 }} className="flex flex-col h-full pt-10">
                <div className="flex-1 flex flex-col items-center space-y-14">
                  <div className="relative group">
                    <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="w-56 h-56 bg-white border-4 border-[#F0F2E8] rounded-[60px] shadow-sm flex flex-col items-center justify-center">
                      <span className="text-[120px] font-black text-[#2D3436] tracking-tighter leading-none">{activeModule.words[learningIndex].character}</span>
                      <span className="text-2xl font-black text-[#88B04B] mt-4 uppercase tracking-[0.2em]">{activeModule.words[learningIndex].pinyin}</span>
                    </motion.div>
                    <button 
                      onClick={() => speak(activeModule.words[learningIndex].character)}
                      className="absolute -bottom-4 -right-4 p-5 bg-[#88B04B] text-white rounded-[24px] shadow-xl hover:scale-110 active:scale-95 transition-all border-4 border-white"
                    >
                      <Volume2 size={32} />
                    </button>
                  </div>
                  
                  <div className="text-center space-y-3">
                      <p className="text-[#A0A396] font-black text-[10px] uppercase tracking-[0.3em]">বাংলা অর্থ</p>
                      <h2 className="text-5xl font-black text-[#2D3436] tracking-tighter">{activeModule.words[learningIndex].bengali}</h2>
                      <p className="text-[#636E72] font-bold text-xl italic opacity-80">"{activeModule.words[learningIndex].meaning}"</p>
                  </div>
                </div>

                <div className="mt-12 space-y-6">
                  <div className="bg-[#F9FAF5] p-6 rounded-[32px] border-2 border-[#F0F2E8] space-y-3 relative overflow-hidden">
                    <div className="absolute -top-1 -right-1 opacity-5"><LayoutGrid size={80} /></div>
                    <p className="text-[10px] font-black text-[#A0A396] uppercase tracking-widest text-center">উদাহরণ</p>
                    <p className="text-2xl font-black text-[#2D3436] text-center tracking-tight">আমি {activeModule.words[learningIndex].character} ভালোবাসি।</p>
                  </div>
                  <button onClick={nextStep} className="w-full py-5 bg-[#88B04B] text-white rounded-[24px] font-black text-xl shadow-[0_8px_0_#5D8A31] active:translate-y-1 active:shadow-none transition-all uppercase tracking-[0.2em]">
                    চালিয়ে যান
                  </button>
                </div>
              </motion.div>
            )}

            {screen === "QUIZ" && (
              <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col h-full pt-4">
                <div className="mb-10 flex items-center justify-between">
                  <div className="text-[10px] font-black text-[#88B04B] uppercase tracking-widest bg-[#F9FAF5] px-4 py-2 rounded-xl">ধাপ {quizIndex + 1}</div>
                  <div className="flex gap-1.5">
                    {[...Array((isMockTest ? MOCK_TEST_QUESTIONS : activeModule.quizzes).length)].map((_, i) => (
                      <div key={i} className={`w-8 h-2 rounded-full transition-all duration-500 ${i <= quizIndex ? "bg-[#88B04B]" : "bg-[#F0F2E8]"}`} />
                    ))}
                  </div>
                </div>

                <div className="flex-1 space-y-10">
                  <div className="space-y-4">
                    <p className="text-[#636E72] font-bold text-sm tracking-tight italic">সঠিক উত্তর নির্বাচন করুন</p>
                    <h2 className="text-3xl font-black text-[#2D3436] leading-[1.1] tracking-tighter">{(isMockTest ? MOCK_TEST_QUESTIONS : activeModule.quizzes)[quizIndex].question}</h2>
                  </div>
                  
                  {(isMockTest ? MOCK_TEST_QUESTIONS : activeModule.quizzes)[quizIndex].type === "BUILD" && (
                    <div className="space-y-10">
                      <div className="min-h-[140px] p-6 bg-[#F9FAF5] border-4 border-white rounded-[40px] shadow-inner flex flex-wrap gap-2 items-center justify-center relative">
                        <div className="absolute inset-0 border-2 border-[#F0F2E8] border-dashed rounded-[40px] pointer-events-none" />
                        {selectedChips.map((chip, i) => (
                          <motion.button 
                            key={`${chip}-${i}`} initial={{ scale: 0 }} animate={{ scale: 1 }}
                            onClick={() => toggleChip(chip)}
                            className="px-6 py-3 bg-white border-2 border-[#88B04B] rounded-2xl font-black text-2xl text-[#88B04B] shadow-sm transform active:scale-95"
                          >
                            {chip}
                          </motion.button>
                        ))}
                      </div>
                      <div className="flex flex-wrap justify-center gap-3">
                        {(isMockTest ? MOCK_TEST_QUESTIONS : activeModule.quizzes)[quizIndex].chips?.map((chip) => (
                          <button 
                            key={chip} 
                            disabled={selectedChips.includes(chip)}
                            onClick={() => toggleChip(chip)}
                            className={`px-7 py-4 border-2 rounded-[24px] font-black text-2xl transition-all shadow-sm ${selectedChips.includes(chip) ? "bg-[#F0F2E8] border-transparent text-transparent" : "bg-white border-[#F0F2E8] text-[#2D3436] hover:border-[#88B04B] active:translate-y-1"}`}
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {(isMockTest ? MOCK_TEST_QUESTIONS : activeModule.quizzes)[quizIndex].type === "TRANSLATE" && (
                    <div className="space-y-8">
                      <div className="p-12 bg-white border-2 border-[#F0F2E8] rounded-[48px] text-center shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5"><LayoutGrid size={60} /></div>
                        <span className="text-7xl font-black text-[#2D3436] tracking-tighter">{(isMockTest ? MOCK_TEST_QUESTIONS : activeModule.quizzes)[quizIndex].chineseContent}</span>
                      </div>
                      <div className="space-y-3">
                         <input 
                           type="text" value={quizInput} onChange={e => setQuizInput(e.target.value)}
                           onKeyDown={(e) => e.key === "Enter" && checkQuiz()}
                           placeholder="পিনয়িন উচ্চারণ লিখুন..."
                           className="w-full p-6 bg-white border-2 border-[#F0F2E8] rounded-[28px] text-xl font-black focus:border-[#88B04B] outline-none shadow-sm placeholder:text-[#A0A396]/50"
                         />
                         <div className="flex items-center gap-2 p-4 bg-[#F9FAF5] rounded-2xl border border-[#F0F2E8]">
                            <Star size={14} className="text-[#88B04B]" />
                            <p className="text-[10px] text-[#2D3436] font-bold uppercase tracking-widest">ইঙ্গিত: {(isMockTest ? MOCK_TEST_QUESTIONS : activeModule.quizzes)[quizIndex].hint}</p>
                         </div>
                      </div>
                    </div>
                  )}

                  {(isMockTest ? MOCK_TEST_QUESTIONS : activeModule.quizzes)[quizIndex].type === "LISTENING" && (
                    <div className="space-y-8">
                      <button 
                        onClick={() => speak((isMockTest ? MOCK_TEST_QUESTIONS : activeModule.quizzes)[quizIndex].chineseContent)}
                        className="w-full py-16 bg-white border-2 border-[#F0F2E8] rounded-[48px] flex flex-col items-center gap-4 hover:border-[#88B04B] transition-all group shadow-sm active:scale-[0.98]"
                      >
                        <div className="p-6 bg-[#F9FAF5] rounded-full text-[#88B04B] group-hover:scale-110 transition-transform shadow-inner"><Volume2 size={48} /></div>
                        <span className="text-[10px] font-black text-[#A0A396] uppercase tracking-[0.3em]">মনোযোগ দিয়ে শুনুন</span>
                      </button>
                      <div className="grid gap-3">
                        {(isMockTest ? MOCK_TEST_QUESTIONS : activeModule.quizzes)[quizIndex].options?.map(opt => (
                          <button 
                            key={opt} onClick={() => !quizResult && checkQuiz(opt)}
                            className="p-5 bg-white border-2 border-[#F0F2E8] rounded-[24px] font-black text-xl hover:border-[#88B04B] hover:bg-[#F9FAF5] transition-all text-left shadow-sm flex items-center justify-between"
                          >
                            {opt}
                            <ChevronRight size={20} className="opacity-20" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-auto -mx-6 -mb-6 relative z-50">
                  <AnimatePresence>
                    {quizResult && (
                      <motion.div 
                        initial={{ y: 200 }} animate={{ y: 0 }} exit={{ y: 200 }}
                        className={`p-8 pb-12 rounded-t-[50px] shadow-[0_-20px_60px_rgba(0,0,0,0.1)] relative z-30 ${quizResult.isCorrect ? "bg-[#88B04B]" : "bg-[#D63031]"}`}
                      >
                        <div className="flex items-center gap-5 mb-8">
                          <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center text-4xl shadow-lg">
                            {quizResult.isCorrect ? "✅" : "❌"}
                          </div>
                          <div className="text-white space-y-1">
                            <h3 className="font-black text-2xl uppercase tracking-tighter">{quizResult.isCorrect ? "চমৎকার!" : "আবার চেষ্টা করুন"}</h3>
                            <p className="text-white/90 font-bold leading-tight">{quizResult.feedback}</p>
                          </div>
                        </div>
                        <button onClick={nextQuiz} className="w-full py-5 bg-white text-[#2D3436] rounded-[24px] font-black text-xl shadow-xl active:translate-y-1 transition-all uppercase tracking-widest">
                          চালিয়ে যান
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {!quizResult && (() => {
                    const questions = isMockTest ? MOCK_TEST_QUESTIONS : activeModule.quizzes;
                    const currentQuiz = questions[quizIndex];
                    if (currentQuiz.type === "BUILD" || currentQuiz.type === "TRANSLATE") {
                      return (
                        <div className="p-6 bg-white border-t border-[#F0F2E8]">
                          <button 
                            onClick={() => checkQuiz()} 
                            disabled={(currentQuiz.type === "BUILD" && selectedChips.length === 0) || (currentQuiz.type === "TRANSLATE" && !quizInput)}
                            className="w-full py-5 bg-[#88B04B] text-white rounded-[24px] font-black text-xl shadow-[0_8px_0_#5D8A31] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50 uppercase tracking-widest"
                          >
                            চেক করুন
                          </button>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </motion.div>
            )}

            {screen === "RESULT" && (
              <motion.div key="result" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center h-full text-center py-10">
                <motion.div 
                  initial={{ rotate: -10 }}
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} 
                  transition={{ repeat: Infinity, duration: 4 }}
                  className="mb-10"
                >
                  <div className="w-56 h-56 bg-[#F1C40F] rounded-[70px] border-[12px] border-white shadow-2xl flex items-center justify-center text-8xl relative overflow-hidden">
                     <span className="relative z-10">🥇</span>
                     <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent" />
                  </div>
                </motion.div>
                <div className="space-y-3">
                  <h2 className="text-[44px] font-black text-[#2D3436] uppercase tracking-tighter leading-none">{isMockTest ? "প্রস্তুত!" : "বিজয়!"}</h2>
                  <p className="text-[#636E72] font-bold text-lg px-6">
                    {isMockTest ? `অভিনন্দন ${USER_NAME}! আপনি HSK ১ পরীক্ষার জন্য পুরোপুরি প্রস্তুত।` : "অভিনন্দন! আপনি এই স্তরটি চমৎকারভাবে সম্পন্ন করেছেন।"}
                  </p>
                </div>
                
                <div className="mt-12 grid grid-cols-2 gap-4 w-full">
                   <div className="bg-[#F9FAF5] p-5 rounded-[32px] border-2 border-[#F0F2E8]">
                      <p className="text-[10px] font-black text-[#A0A396] uppercase tracking-widest mb-1">স্কোর</p>
                      <p className="text-3xl font-black text-[#2D3436]">১০০%</p>
                   </div>
                   <div className="bg-[#F9FAF5] p-5 rounded-[32px] border-2 border-[#F0F2E8]">
                      <p className="text-[10px] font-black text-[#A0A396] uppercase tracking-widest mb-1">বোনাস</p>
                      <p className="text-3xl font-black text-[#88B04B]">+১৫ XP</p>
                   </div>
                </div>

                <button onClick={returnToMap} className="mt-10 w-full py-5 bg-[#88B04B] text-white rounded-[24px] font-black text-xl shadow-[0_8px_0_#5D8A31] uppercase tracking-widest active:translate-y-1 transition-all">
                  সমাপ্ত করুন
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
