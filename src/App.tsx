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
  ALL_HSK_DATA,
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
  STUDY_GUIDE,
  MOCK_TEST_STATUS,
  MOCK_TEST_QUESTIONS,
  TONE_PRACTICE,
  HSK_1_WORDS
} from "./constants";
import type { HSKLevelData, HSKModule } from "./constants";
import { playSound } from "./services/soundService";
import { MagicCamera } from "./components/MagicCamera";
import { ToneAnalyzer } from "./components/ToneAnalyzer";
import { VideoRoleplay } from "./components/VideoRoleplay";
import { ShortsFeed } from "./components/ShortsFeed";

export default function App() {
  const [screen, setScreen] = useState<"DASHBOARD" | "MAP" | "LEARNING" | "QUIZ" | "RESULT" | "PREMIUM">("DASHBOARD");
  const [premiumCategory, setPremiumCategory] = useState<string | null>(null);
  const [activeLevel, setActiveLevel] = useState<HSKLevelData>(ALL_HSK_DATA[0]);
  const [activeModule, setActiveModule] = useState<HSKModule>(ALL_HSK_DATA[0].modules[0]);
  const [learningIndex, setLearningIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizInput, setQuizInput] = useState("");
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [quizResult, setQuizResult] = useState<{ isCorrect: boolean; feedback: string } | null>(null);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  
  const [tutorMessages, setTutorMessages] = useState<{ sender: "AI" | "USER"; text: string }[]>([
    { sender: "AI", text: `আসসালামু আলাইকুম ${USER_NAME}! আমি আপনার পার্সোনাল চাইনিজ টিউটর। আমি আপনাকে চাইনিজ গ্রামার এবং উচ্চারণে সাহায্য করতে পারি। আপনার যেকোনো প্রশ্ন নিচে লিখুন।` }
  ]);
  const [tutorInput, setTutorInput] = useState("");
  const [isAILoading, setIsAILoading] = useState(false);
  
  // Recording States
  const [isRecording, setIsRecording] = useState(false);
  const [speakingTarget, setSpeakingTarget] = useState({ zh: "你好", py: "Nǐ hǎo", bn: "হ্যালো" });
  const [speakingFeedback, setSpeakingFeedback] = useState<null | { score: number; msg: string; pinyin: string }>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [dictSearchQuery, setDictSearchQuery] = useState("");
  const [dictLetterFilter, setDictLetterFilter] = useState<string | null>(null);
  const [isMockTest, setIsMockTest] = useState(false);
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const dashboardScrollPos = useRef(0);

  const aiRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startDrawing = (e: any) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      const rect = canvas.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    }
  };

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      const rect = canvas.getBoundingClientRect();
      const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
      const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
      if (ctx) {
        ctx.strokeStyle = "#88B04B";
        ctx.lineWidth = 12;
        ctx.lineCap = "round";
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }
  };

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (screen !== "DASHBOARD") {
        event.preventDefault();
        returnToMap();
      }
    };
    window.addEventListener("popstate", handlePopState);
    if (screen !== "DASHBOARD") {
      window.history.pushState({ screen }, "", "");
    }
    return () => window.removeEventListener("popstate", handlePopState);
  }, [screen]);

  const getAI = () => {
    if (!aiRef.current) {
      aiRef.current = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }
    return aiRef.current;
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        analyzeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      playSound("CLICK");
    } catch (err) {
      alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const analyzeAudio = async (blob: Blob) => {
    setIsAILoading(true);
    setSpeakingFeedback(null);
    try {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(',')[1];
            const aiInstance = getAI();
            const response = await aiInstance.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: [
                    {
                        parts: [
                            { text: `Analyze my Chinese pronunciation for the phrase: "${speakingTarget.zh}" (${speakingTarget.py}). Evaluate pronunciation accuracy, tone correctness, and fluency. Give feedback in Bengali. Use JSON format with fields: "score" (0-100), "msg" (Bengali feedback), "pinyin" (The pinyin for the phrase), "tips" (Bengali tips for improvement).` },
                            { inlineData: { mimeType: "audio/webm", data: base64Audio } }
                        ]
                    }
                ],
                config: {
                    responseMimeType: "application/json"
                }
            });
            const result = JSON.parse(response.text || "{}");
            setSpeakingFeedback(result);
        };
    } catch (error) {
        console.error("Audio Analysis failed", error);
        alert("উচ্চারণ বিশ্লেষণে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
        setIsAILoading(false);
    }
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
          Your name is "Guru". Always greet the user with "Assalamu Alaikum" and maintain a respectful, supportive Islamic tone since the user is Muslim.
          Reply in Bengali. 
          FORMATTING RULES:
          1. Use clean Markdown. 2. Use bold (**text**) for emphasis. 3. Use Bullet points.
          4. Separate Chinese, Pinyin, Bengali Pronunciation, and Meaning clearly.`
        }
      });
      const aiResponse = response.text || "দুঃখিত, আমি বুঝতে পারছি না। আবার চেষ্টা করুন।";
      setTutorMessages(prev => [...prev, { sender: "AI", text: aiResponse }]);
    } catch (error) {
      setTutorMessages(prev => [...prev, { sender: "AI", text: "দুঃখিত, নেটওয়ার্ক বা কানেকশনে সমস্যা হচ্ছে।" }]);
    } finally {
      setIsAILoading(false);
    }
  };

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      utterance.rate = 0.75;
      window.speechSynthesis.speak(utterance);
    }
  };

  const returnToMap = () => {
    playSound("CLICK");
    setScreen("DASHBOARD");
    setPremiumCategory(null);
    setIsMockTest(false);
  };

  const startMockTest = () => {
    if (containerRef.current) dashboardScrollPos.current = containerRef.current.scrollTop;
    setIsMockTest(true);
    setScreen("QUIZ");
    setQuizIndex(0);
    setQuizResult(null);
  };

  useEffect(() => {
    if (screen === "DASHBOARD" && containerRef.current) {
      // Use a slight delay to allow AnimatePresence to finish or component to mount
      const timer = setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = dashboardScrollPos.current;
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  // Rendering Helpers
  const renderIcon = (name: string, color: string) => {
    const props = { size: 20, color };
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
      default: return <LayoutGrid {...props} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2E8] font-sans text-[#2D3436]">
      <div className="w-full sm:max-w-md mx-auto h-dvh flex flex-col bg-white overflow-hidden relative">
        
        {/* Header */}
        <div className="pt-safe bg-white border-b border-[#F0F2E8] sticky top-0 z-50">
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {screen !== "DASHBOARD" && (
                <button onClick={returnToMap} className="p-2 -ml-2 text-[#636E72]"><X size={20} /></button>
              )}
              <div className="flex items-center gap-2">
                 <div className="w-8 h-8 bg-[#88B04B] rounded-lg flex items-center justify-center text-white font-black text-xs">G</div>
                 <span className="font-black text-sm tracking-tighter">চাইনিজ গুরু</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-[#FFF9F0] px-3 py-1.5 rounded-full border border-[#FFE0B2]">
                <Flame size={14} className="text-[#E67E22]" fill="currentColor" />
                <span className="font-black text-xs text-[#E67E22]">{USER_STREAK} দিন</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#F9FAF5] px-3 py-1.5 rounded-full border border-[#F0F2E8]">
                <Trophy size={14} className="text-[#F1C40F]" fill="currentColor" />
                <span className="font-black text-xs">{USER_POINTS}</span>
              </div>
            </div>
          </div>
        </div>

        <div ref={containerRef} className="flex-1 overflow-y-auto px-5 py-6 pb-24 scrollbar-hide">
          <AnimatePresence mode="wait">
            {screen === "DASHBOARD" && (
              <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="p-8 rounded-[48px] bg-[#7BA641] text-white shadow-xl relative overflow-hidden">
                   <div className="flex items-center gap-5 relative z-10">
                      <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center text-5xl">
                         🎓
                      </div>
                      <div>
                         <p className="text-[11px] font-black opacity-80 uppercase tracking-widest">স্বাগতম ফিরে আসার জন্য!</p>
                         <h1 className="text-3xl font-black tracking-tight">স্বাগতম, {USER_NAME}!</h1>
                      </div>
                   </div>
                   
                   <div className="mt-8 space-y-3 relative z-10">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-90">
                         <span>আজকের অগ্রগতি</span>
                         <span>৭৫%</span>
                      </div>
                      <div className="h-4 bg-white/20 rounded-full p-1 overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }} 
                           animate={{ width: "75%" }} 
                           transition={{ duration: 1, ease: "easeOut" }}
                           className="h-full bg-white rounded-full shadow-sm" 
                         />
                      </div>
                   </div>

                   <p className="mt-8 text-sm font-bold relative z-10 flex items-center gap-2">
                      চলুন চাইনিজ শিখি এবং আপনার লক্ষ্য অর্জন করি! 🚀
                   </p>
                   
                   <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                   <div className="absolute -top-10 -left-10 w-32 h-32 bg-black/5 rounded-full blur-2xl" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => { 
                    if (containerRef.current) dashboardScrollPos.current = containerRef.current.scrollTop;
                    setScreen("MAP"); 
                  }} className="col-span-2 p-6 bg-white border-2 border-[#F0F2E8] rounded-[40px] flex items-center justify-between shadow-sm active:scale-[0.98] transition-all group">
                    <div className="flex items-center gap-5">
                       <div className="w-16 h-16 bg-[#88B04B] rounded-[24px] flex items-center justify-center text-white shadow-lg shadow-[#88B04B]/20">
                          <Trophy size={32} />
                       </div>
                       <div className="text-left">
                          <h2 className="block font-black text-xl text-[#2D3436]">শিখার পথ</h2>
                          <p className="block text-[11px] font-bold text-[#A0A396] group-hover:text-[#88B04B] transition-colors uppercase tracking-widest">{activeLevel.title} মাস্টারক্লাস</p>
                       </div>
                    </div>
                    <ChevronRight size={24} className="text-gray-300 group-hover:text-[#88B04B] transition-colors" />
                  </button>

                  {PREMIUM_FEATURES.map((feature) => (
                    <button key={feature.id} onClick={() => { 
                      if (containerRef.current) dashboardScrollPos.current = containerRef.current.scrollTop;
                      setScreen("PREMIUM"); setPremiumCategory(feature.id); 
                    }} className="p-5 bg-white border-2 border-[#F0F2E8] rounded-[32px] text-left space-y-2 hover:border-[#88B04B] transition-all">
                      <div className="w-10 h-10 bg-[#F9FAF5] rounded-xl flex items-center justify-center">
                        {renderIcon(feature.icon, feature.color)}
                      </div>
                      <h3 className="font-black text-xs">{feature.title}</h3>
                    </button>
                  ))}
                </div>

                {/* Daily Missions */}
                <div className="space-y-4">
                   <div className="flex items-center justify-between">
                      <h2 className="text-xl font-black italic">ডেইলি মিশন</h2>
                      <button onClick={() => { 
                         if (containerRef.current) dashboardScrollPos.current = containerRef.current.scrollTop;
                         setScreen("PREMIUM"); setPremiumCategory("missions"); 
                      }} className="text-[10px] font-black text-[#88B04B] uppercase tracking-widest hover:underline">সবগুলো দেখুন</button>
                   </div>
                   <div className="bg-white border-2 border-[#F0F2E8] rounded-[32px] overflow-hidden cursor-pointer" onClick={() => {
                      if (containerRef.current) dashboardScrollPos.current = containerRef.current.scrollTop;
                      setScreen("PREMIUM"); setPremiumCategory("missions"); 
                   }}>
                      {DAILY_MISSIONS.map((m, idx) => (
                         <div key={idx} className={`p-4 flex items-center justify-between transition-colors hover:bg-[#F9FAF5] ${idx !== DAILY_MISSIONS.length - 1 ? 'border-b border-[#F0F2E8]' : ''}`}>
                            <div className="flex items-center gap-3">
                               <div className={`w-6 h-6 rounded-md flex items-center justify-center ${m.completed ? 'bg-green-500 text-white' : 'bg-gray-100'}`}>
                                  {m.completed && <CheckCircle2 size={14} />}
                               </div>
                               <span className={`text-sm font-bold ${m.completed ? 'text-gray-400 line-through' : 'text-[#2D3436]'}`}>{m.task}</span>
                            </div>
                            <span className="text-[10px] font-black text-[#88B04B]">+{m.points} XP</span>
                         </div>
                      ))}
                   </div>
                </div>

                {/* Culture Card */}
                <div className="bg-[#2D3436] rounded-[40px] p-8 text-white relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform"><Globe size={120} /></div>
                   <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">আজকের কালচার</p>
                   <h2 className="text-2xl font-black mb-4">চাইনিজ চা উৎসব</h2>
                   <p className="text-xs font-bold leading-relaxed text-white/70 mb-6">চায়নাতে চা পানের রীতি হাজার বছরের পুরনো। এটি কেবল একটি পানীয় নয়, এটি একটি শিল্প।</p>
                   <button onClick={() => { 
                      if (containerRef.current) dashboardScrollPos.current = containerRef.current.scrollTop;
                      setScreen("PREMIUM"); setPremiumCategory("culture"); 
                   }} className="px-6 py-3 bg-white text-[#2D3436] rounded-2xl font-black text-xs hover:bg-[#88B04B] hover:text-white transition-all">বিস্তারিত দেখুন</button>
                </div>
              </motion.div>
            )}

            {screen === "PREMIUM" && (
              <motion.div key="premium" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full">
                {premiumCategory === "camera" && <MagicCamera onClose={returnToMap} />}
                {premiumCategory === "tones" && <ToneAnalyzer onClose={returnToMap} />}
                {premiumCategory === "dubbing" && <VideoRoleplay onClose={returnToMap} />}
                {premiumCategory === "shorts" && <ShortsFeed onClose={returnToMap} />}
                
                {premiumCategory === "mocktest" && (
                   <div className="space-y-6">
                      <div className="bg-[#FAB1A0] rounded-[48px] p-10 text-center space-y-6 relative overflow-hidden shadow-xl shadow-red-100">
                         {/* Abstract background icon */}
                         <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                            <FileText size={200} />
                         </div>
                         
                         <h2 className="text-3xl font-black text-[#D63031] leading-tight relative z-10 px-4">HSK ১ আসল পরীক্ষার মতো সিমুলেশন</h2>
                         <p className="text-sm font-bold text-[#D63031]/70 relative z-10">৪০টি প্রশ্ন • ৬০ মিনিট</p>
                         
                         <button 
                            onClick={startMockTest} 
                            className="w-full py-6 bg-[#D63031] text-white rounded-[32px] font-black text-xl shadow-lg relative z-10 hover:scale-[1.02] transition-transform"
                         >
                            পরীক্ষা শুরু করুন
                         </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div className="bg-white border-2 border-[#F9FAF5] rounded-[40px] p-8 text-center space-y-2 shadow-sm">
                            <p className="text-[10px] font-black text-[#A0A396] uppercase tracking-widest">সর্বশেষ স্কোর</p>
                            <h3 className="text-3xl font-black text-[#2D3436]">০</h3>
                         </div>
                         <div className="bg-white border-2 border-[#F9FAF5] rounded-[40px] p-8 text-center space-y-2 shadow-sm">
                            <p className="text-[10px] font-black text-[#A0A396] uppercase tracking-widest">প্রস্তুতি</p>
                            <h3 className="text-3xl font-black text-[#2D3436]">৭৫%</h3>
                         </div>
                      </div>
                   </div>
                )}

                {premiumCategory === "flashcards" && (
                   <div className="space-y-6 flex flex-col items-center">
                      <motion.div 
                        animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 0.6, type: "spring" }}
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="w-full aspect-[3/4] perspective-1000 relative cursor-pointer"
                      >
                         <div className={`w-full h-full absolute inset-0 backface-hidden bg-white border-4 border-[#F0F2E8] rounded-[40px] flex flex-col items-center justify-center p-8 shadow-xl ${isFlipped ? 'hidden' : ''}`}>
                            <img src={FLASHCARDS_DATA[flashcardIdx].img} className="w-full h-48 object-cover rounded-3xl mb-6 shadow-sm" />
                            <h2 className="text-6xl font-black">{FLASHCARDS_DATA[flashcardIdx].char}</h2>
                            <p className="mt-4 text-[#A0A396] font-black uppercase tracking-widest text-xs">দেখুন এবং উচ্চারণ করুন</p>
                         </div>
                         <div className={`w-full h-full absolute inset-0 backface-hidden bg-[#88B04B] text-white rounded-[40px] flex flex-col items-center justify-center p-8 shadow-xl rotate-y-180 ${!isFlipped ? 'hidden' : ''}`} style={{ transform: 'rotateY(180deg)' }}>
                            <h2 className="text-4xl font-black">{FLASHCARDS_DATA[flashcardIdx].bengali}</h2>
                            <p className="text-2xl font-bold mt-2 opacity-80">{FLASHCARDS_DATA[flashcardIdx].pinyin}</p>
                            <button onClick={(e) => { e.stopPropagation(); speak(FLASHCARDS_DATA[flashcardIdx].char); }} className="mt-8 p-4 bg-white/20 rounded-full"><Volume2 size={32} /></button>
                         </div>
                      </motion.div>
                      <div className="flex gap-4 w-full">
                         <button onClick={() => { setIsFlipped(false); setFlashcardIdx(prev => (prev > 0 ? prev - 1 : FLASHCARDS_DATA.length - 1)); }} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black text-gray-500">আগেরটি</button>
                         <button onClick={() => { setIsFlipped(false); setFlashcardIdx(prev => (prev < FLASHCARDS_DATA.length - 1 ? prev + 1 : 0)); }} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black text-gray-500">পরেরটি</button>
                      </div>
                   </div>
                )}

                {premiumCategory === "survival" && (
                   <div className="space-y-4">
                      <div className="p-8 bg-[#FF7675] rounded-[40px] text-white">
                         <h2 className="text-2xl font-black">সারভাইভাল কিট</h2>
                         <p className="text-xs font-bold opacity-80">জরুরি অবস্থায় এই বাক্যগুলো আপনার জীবন বাঁচাতে পারে।</p>
                      </div>
                      {SURVIVAL_KIT.map((item, idx) => (
                         <div key={idx} className="p-6 bg-white border-2 border-[#F0F2E8] rounded-[32px] flex justify-between items-center group">
                            <div className="space-y-1">
                               <h3 className="text-xl font-black">{item.chinese}</h3>
                               <p className="text-xs font-bold text-[#88B04B]">{item.pinyin}</p>
                               <p className="text-sm font-bold text-[#636E72]">"{item.bengali}"</p>
                            </div>
                            <button onClick={() => speak(item.chinese)} className="p-4 bg-[#F9FAF5] rounded-full text-[#FF7675]"><Volume2 size={24} /></button>
                         </div>
                      ))}
                   </div>
                )}

                {premiumCategory === "culture" && (
                   <div className="space-y-6">
                      {CULTURE_DATA.map((item) => (
                         <div key={item.id} className="bg-white rounded-[40px] border-2 border-[#F0F2E8] overflow-hidden shadow-sm">
                            <img src={item.img} className="w-full h-48 object-cover" />
                            <div className="p-6 space-y-3">
                               <h3 className="text-xl font-black">{item.title}</h3>
                               <p className="text-sm font-bold text-[#636E72] leading-relaxed">{item.desc}</p>
                               <a href={item.wikiUrl} target="_blank" className="inline-flex items-center gap-2 text-[#88B04B] font-black text-sm">বিস্তারিত পড়ুন <Globe size={14} /></a>
                            </div>
                         </div>
                      ))}
                   </div>
                )}

                {premiumCategory === "writing" && (
                   <div className="space-y-6 flex flex-col items-center">
                      <div className="p-6 bg-white border-2 border-[#F0F2E8] rounded-[40px] w-full text-center">
                         <h2 className="text-6xl font-black">{WRITING_CHARACTERS[flashcardIdx % WRITING_CHARACTERS.length].char}</h2>
                         <p className="mt-2 text-[#88B04B] font-bold">{WRITING_CHARACTERS[flashcardIdx % WRITING_CHARACTERS.length].pinyin} ({WRITING_CHARACTERS[flashcardIdx % WRITING_CHARACTERS.length].meaning})</p>
                      </div>
                      
                      <div className="w-full aspect-square bg-[#F9FAF5] border-4 border-[#F0F2E8] rounded-[48px] relative overflow-hidden shadow-inner group">
                         <div className="absolute inset-0 flex items-center justify-center opacity-10 select-none pointer-events-none">
                            <span className="text-[200px] font-black">{WRITING_CHARACTERS[flashcardIdx % WRITING_CHARACTERS.length].char}</span>
                         </div>
                         <canvas 
                            ref={canvasRef} width={400} height={400} 
                            className="w-full h-full relative z-10 cursor-crosshair touch-none" 
                            onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={() => setIsDrawing(false)}
                            onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={() => setIsDrawing(false)}
                         />
                      </div>

                      <div className="flex gap-4 w-full">
                         <button onClick={() => {
                            const ctx = canvasRef.current?.getContext("2d");
                            ctx?.clearRect(0, 0, 400, 400);
                         }} className="flex-1 py-4 bg-gray-100 rounded-2xl font-black text-gray-500 flex items-center justify-center gap-2"><RotateCcw size={18} /> রিসেট</button>
                         <button onClick={() => {
                            setFlashcardIdx(prev => prev + 1);
                            const ctx = canvasRef.current?.getContext("2d");
                            ctx?.clearRect(0, 0, 400, 400);
                         }} className="flex-1 py-4 bg-[#88B04B] text-white rounded-2xl font-black flex items-center justify-center gap-2">পরেরটি <ChevronRight size={18} /></button>
                      </div>
                   </div>
                )}

                {premiumCategory === "games" && (
                   <div className="space-y-6">
                      <div className="p-6 bg-[#88B04B] rounded-[32px] text-white shadow-lg">
                         <h2 className="text-xl font-black">ম্যাচিং গেম</h2>
                         <p className="text-xs font-bold opacity-80 mt-1">সঠিক অর্থের সাথে চাইনিজ ক্যারেক্টার মেলান।</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         {GAME_WORDS.map((item, idx) => (
                            <button 
                              key={idx}
                              onClick={() => {
                                 playSound("CLICK");
                                 // Simple simulation of matching
                                 alert(`আপনি '${item.chinese}' শব্দটির অর্থ '${item.bengali}' বেছে নিয়েছেন। চমৎকার!`);
                              }}
                              className="p-8 bg-white border-2 border-[#F0F2E8] rounded-[32px] flex flex-col items-center gap-2 hover:border-[#88B04B] transition-all group"
                            >
                               <span className="text-4xl font-black group-hover:scale-110 transition-transform">{item.chinese}</span>
                               <span className="text-xs font-bold text-gray-400">অর্থ কী?</span>
                            </button>
                         ))}
                      </div>
                      <p className="text-center text-[10px] font-black text-gray-300 uppercase tracking-widest">নতুন লেভেল শীঘ্রই আসছে</p>
                   </div>
                )}

                {premiumCategory === "stories" && (
                   <div className="space-y-6">
                      {!selectedStory ? (
                         <>
                            <div className="p-8 bg-[#6C5CE7] rounded-[40px] text-white overflow-hidden relative">
                               <div className="absolute top-0 right-0 p-8 opacity-10"><BookOpen size={100} /></div>
                               <h2 className="text-2xl font-black">গল্প পড়ুন</h2>
                               <p className="text-xs font-bold opacity-70">আপনার পছন্দের একটি গল্প বেছে নিন।</p>
                            </div>
                            <div className="grid gap-4">
                               {STORY_CONTENT.map((story) => (
                                  <button 
                                    key={story.id} 
                                    onClick={() => { setSelectedStory(story); containerRef.current?.scrollTo({ top: 0 }); }}
                                    className="p-6 bg-white border-2 border-[#F0F2E8] rounded-[32px] text-left hover:border-[#6C5CE7] transition-all group"
                                  >
                                     <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-xl font-black text-[#2D3436]">{story.title}</h3>
                                        <ChevronRight className="text-gray-300 group-hover:text-[#6C5CE7]" />
                                     </div>
                                     <p className="text-sm font-bold text-gray-500">{story.description}</p>
                                  </button>
                               ))}
                            </div>
                         </>
                      ) : (
                         <>
                            <div className="p-8 bg-[#6C5CE7] rounded-[40px] text-white overflow-hidden relative">
                               <div className="absolute top-0 right-0 p-8 opacity-10"><BookOpen size={100} /></div>
                               <div className="flex items-center gap-3 mb-2">
                                  <button onClick={() => setSelectedStory(null)} className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors"><ChevronLeft size={16} /></button>
                                  <h2 className="text-2xl font-black">{selectedStory.title}</h2>
                                </div>
                               <p className="text-xs font-bold opacity-70">{selectedStory.description}</p>
                            </div>
                            <div className="space-y-4">
                               {selectedStory.segments.map((segment: any, idx: number) => (
                                  <div key={idx} className="p-6 bg-white border-2 border-[#F0F2E8] rounded-[32px] space-y-2 group hover:border-[#6C5CE7] transition-all">
                                     <div className="flex justify-between items-start">
                                        <div className="space-y-2">
                                           <h3 className="text-2xl font-black text-[#2D3436]">{segment.chinese}</h3>
                                           <p className="text-sm font-bold text-[#6C5CE7]">{segment.pinyin}</p>
                                        </div>
                                        <button onClick={() => speak(segment.chinese)} className="p-3 bg-[#F9FAF5] rounded-full text-[#6C5CE7]"><Volume2 size={20} /></button>
                                     </div>
                                     <p className="text-sm font-bold text-gray-400 italic">" {segment.bengali} "</p>
                                  </div>
                               ))}
                            </div>
                            <button onClick={() => { setSelectedStory(null); containerRef.current?.scrollTo({ top: 0 }); }} className="w-full py-6 bg-[#6C5CE7] text-white rounded-[32px] font-black shadow-lg">আরো গল্প দেখুন</button>
                         </>
                      )}
                   </div>
                )}

                {premiumCategory === "leaderboard" && (
                   <div className="space-y-6">
                      <div className="p-8 bg-[#FFD93D] rounded-[40px] text-gray-900 shadow-xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-8 opacity-10"><Trophy size={100} /></div>
                         <h2 className="text-2xl font-black">লিডারবোর্ড</h2>
                         <p className="text-xs font-bold opacity-60 uppercase tracking-widest font-black">সেরা ১০ জন শিক্ষার্থী</p>
                      </div>
                      <div className="bg-white border-2 border-[#F0F2E8] rounded-[32px] overflow-hidden">
                         {[
                            { rank: 1, name: "Mamun", points: 1200, isUser: true },
                            { rank: 2, name: "Ali", points: 1150, isUser: false },
                            { rank: 3, name: "Hassan", points: 980, isUser: false },
                            { rank: 4, name: "Fatima", points: 850, isUser: false },
                            { rank: 5, name: "Zayed", points: 720, isUser: false }
                         ].map((player, idx) => (
                            <div key={idx} className={`p-5 flex items-center justify-between ${idx !== 4 ? 'border-b border-[#F0F2E8]' : ''} ${player.isUser ? 'bg-[#F9FAF5]' : ''}`}>
                               <div className="flex items-center gap-4">
                                  <span className={`w-8 h-8 flex items-center justify-center font-black rounded-full ${player.rank === 1 ? 'bg-[#F1C40F] text-white' : 'text-gray-400'}`}>{player.rank}</span>
                                  <span className={`font-black ${player.isUser ? 'text-[#88B04B]' : 'text-[#2D3436]'}`}>{player.name} {player.isUser && "(আপনি)"}</span>
                               </div>
                               <span className="font-black text-[#88B04B]">{player.points} XP</span>
                            </div>
                         ))}
                      </div>
                      <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4">নতুন রেটিং আপডেট হবে ২৪ ঘণ্টা পর</p>
                   </div>
                )}

                {premiumCategory === "speaking" && (
                   <div className="space-y-8 py-6 w-full">
                      <div className="text-center space-y-6 w-full">
                         <div className="flex justify-between items-center px-4">
                            <button onClick={() => {
                               const words = HSK_1_WORDS;
                               const rand = words[Math.floor(Math.random() * words.length)];
                               setSpeakingTarget({ zh: rand.character, py: rand.pinyin, bn: rand.bengali });
                               setSpeakingFeedback(null);
                            }} className="p-3 bg-white border-2 border-[#F0F2E8] rounded-2xl text-[#88B04B] font-black text-xs shadow-sm active:scale-95 transition-all">
                               পরবর্তী শব্দ
                            </button>
                            <div className="w-16 h-16 bg-[#F9FAF5] rounded-3xl flex items-center justify-center text-[#88B04B] border-2 border-[#F0F2E8]">
                               <Mic size={28} />
                            </div>
                            <div className="w-20" /> {/* Spacer */}
                         </div>

                         <div className="space-y-2">
                            <h2 className="text-xl font-black italic text-gray-400">এই শব্দটি বলুন</h2>
                            <div className="p-10 bg-white border-2 border-[#F0F2E8] rounded-[56px] shadow-xl relative overflow-hidden group">
                               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Volume2 size={80} /></div>
                               <h3 className="text-7xl font-black text-[#2D3436] tracking-tighter">{speakingTarget.zh}</h3>
                               <p className="text-2xl font-black text-[#88B04B] mt-3 tracking-widest">{speakingTarget.py}</p>
                               <p className="text-sm font-bold text-gray-300 mt-2 italic">"{speakingTarget.bn}"</p>
                            </div>
                         </div>
                      </div>

                      {speakingFeedback && (
                         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-white border-2 border-[#F0F2E8] rounded-[48px] space-y-6 shadow-sm">
                            <div className="flex items-center justify-between">
                               <div className="space-y-1">
                                  <h4 className="font-black text-lg">ফলাফল</h4>
                                  <p className="text-xs font-bold text-[#A0A396]">এআই অ্যানালাইসিস</p>
                               </div>
                               <div className="w-20 h-20 rounded-full border-8 border-[#F9FAF5] flex items-center justify-center relative">
                                  <svg className="absolute inset-0 w-full h-full -rotate-90">
                                    <circle cx="40" cy="40" r="32" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-[#88B04B]" strokeDasharray={200} strokeDashoffset={200 - (200 * (speakingFeedback.score || 0)) / 100} />
                                  </svg>
                                  <span className="text-lg font-black text-[#88B04B]">{speakingFeedback.score}%</span>
                               </div>
                            </div>
                            
                            <div className="space-y-4">
                               <div className="p-4 bg-[#F9FAF5] rounded-3xl border border-[#F0F2E8]">
                                  <p className="text-sm font-bold text-[#2D3436] leading-relaxed">{speakingFeedback.msg}</p>
                               </div>
                               {(speakingFeedback as any).tips && (
                                  <div className="space-y-2">
                                     <p className="text-[10px] font-black text-[#88B04B] uppercase tracking-widest px-1">উন্নতির জন্য টিপস</p>
                                     <p className="text-xs font-bold text-[#636E72] leading-relaxed bg-[#FFF9F0] p-4 rounded-2xl border border-[#FFE0B2]">{(speakingFeedback as any).tips}</p>
                                  </div>
                               )}
                            </div>
                         </motion.div>
                      )}
                      
                      <div className="w-full space-y-6">
                         <div className="flex flex-col items-center gap-4">
                            <button 
                               onMouseDown={startRecording}
                               onMouseUp={stopRecording}
                               onTouchStart={startRecording}
                               onTouchEnd={stopRecording}
                               className={`w-full py-10 rounded-[48px] font-black shadow-xl flex items-center justify-center gap-4 transition-all active:scale-95 ${isRecording ? 'bg-[#FF6B6B] shadow-[#FF6B6B]/20 animate-pulse' : 'bg-gradient-to-r from-[#88B04B] to-[#5D8A31] text-white shadow-[#88B04B]/20'}`}
                            >
                               {isRecording ? <div className="flex items-center gap-4 text-white"><div className="w-4 h-4 bg-white rounded-full animate-ping" /> শুনছি... ছেড়ে দিন</div> : <><Mic size={32} /> রেকর্ড করতে চেপে ধরুন</>}
                            </button>
                            {isRecording && <p className="text-[10px] font-black text-[#FF6B6B] uppercase tracking-widest">বলার পর বাটনটি ছেড়ে দিন</p>}
                         </div>

                         <button onClick={() => speak(speakingTarget.zh)} className="w-full py-6 bg-white border-2 border-[#F0F2E8] rounded-[36px] font-black text-gray-400 flex items-center justify-center gap-2 hover:bg-[#F9FAF5] active:scale-95 transition-all">
                            <Volume2 size={24} /> সঠিক উচ্চারণ শুনুন
                         </button>
                      </div>

                      {isAILoading && (
                         <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-[100] flex flex-col items-center justify-center space-y-4">
                            <div className="w-16 h-16 border-8 border-[#F0F2E8] border-t-[#88B04B] rounded-full animate-spin" />
                            <p className="font-black text-[#88B04B] animate-pulse">গুরু আপনার উচ্চারণ পরীক্ষা করছে...</p>
                         </div>
                      )}
                   </div>
                )}

                {premiumCategory === "revision" && (
                   <div className="space-y-6">
                      <div className="p-8 bg-[#88B04B] rounded-[40px] text-white shadow-xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-8 opacity-10"><RotateCw size={100} /></div>
                         <h2 className="text-2xl font-black">স্মার্ট রিভিশন</h2>
                         <p className="text-xs font-bold opacity-70">আপনার ভুলে যাওয়া শব্দগুলো মনে করিয়ে দেওয়ার জন্য এটি তৈরি।</p>
                      </div>
                      <div className="space-y-4">
                         {REVISION_CARDS.map((item, idx) => (
                            <div key={idx} className="p-6 bg-white border-2 border-[#F0F2E8] rounded-[32px] flex justify-between items-center group shadow-sm">
                               <div className="space-y-1">
                                  <h3 className="text-xl font-black">{item.word}</h3>
                                  <p className="text-[#88B04B] font-bold text-xs">{item.pinyin}</p>
                                  <p className="text-[#636E72] text-sm italic">{item.bn}</p>
                               </div>
                               <div className="text-right space-y-2">
                                  <span className="inline-block px-3 py-1 bg-[#FFF9F0] text-[#E67E22] text-[9px] font-black rounded-full uppercase tracking-widest">{item.due}</span>
                                  <div className="flex gap-2">
                                     <button onClick={() => speak(item.word)} className="p-3 bg-gray-50 rounded-full text-gray-400"><Volume2 size={16} /></button>
                                  </div>
                               </div>
                            </div>
                         ))}
                      </div>
                      <button onClick={returnToMap} className="w-full py-6 bg-[#2D3436] text-white rounded-[32px] font-black">সব রিভাইজ করুন</button>
                   </div>
                )}

                {premiumCategory === "missions" && (
                   <div className="space-y-6">
                      <div className="p-8 bg-[#E67E22] rounded-[40px] text-white shadow-xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-8 opacity-10"><Target size={120} /></div>
                         <h2 className="text-3xl font-black relative z-10">পুরস্কার জিতুন</h2>
                         <p className="text-sm font-bold opacity-80 relative z-10">মিশন শেষ করে ১০০+ XP অর্জন করুন।</p>
                      </div>

                      <div className="space-y-4">
                         {DAILY_MISSIONS.map((m, idx) => (
                            <div key={idx} className="p-6 bg-white border-2 border-[#F0F2E8] rounded-[32px] flex items-center justify-between group shadow-sm">
                               <div className="flex items-center gap-4">
                                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${m.completed ? 'bg-[#88B04B] text-white' : 'bg-[#F9FAF5] text-gray-300'}`}>
                                     <CheckCircle2 size={24} />
                                  </div>
                                  <div className="space-y-1">
                                     <h3 className={`font-black ${m.completed ? 'text-gray-400 line-through' : 'text-[#2D3436]'}`}>{m.task}</h3>
                                     <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-[#E67E22] bg-[#FFF9F0] px-2 py-0.5 rounded-full">+{m.points} XP</span>
                                        {m.completed && <span className="text-[10px] font-black text-[#88B04B] bg-[#F9FAF5] px-2 py-0.5 rounded-full uppercase">সম্পন্ন</span>}
                                     </div>
                                  </div>
                               </div>
                               <ChevronRight size={18} className="text-gray-300" />
                            </div>
                         ))}
                      </div>

                      <div className="p-8 bg-[#F9FAF5] rounded-[40px] border-2 border-dashed border-[#F0F2E8] text-center space-y-3">
                         <Star size={32} className="mx-auto text-[#F1C40F]" fill="currentColor" />
                         <h4 className="font-black">বোনাস পুরস্কার</h4>
                         <p className="text-xs font-bold text-[#A0A396]">সবগুলো মিশন শেষ করলে পাবেন ১০টি লাকি স্ট্রিং!</p>
                      </div>

                      <button onClick={returnToMap} className="w-full py-6 bg-[#2D3436] text-white rounded-[32px] font-black">অন্যগুলো দেখুন</button>
                   </div>
                )}

                {premiumCategory === "chat" && (
                   <div className="flex flex-col h-[75dvh] -mt-4 -mx-5 bg-white">
                      <div className="px-5 py-4 bg-white border-b border-[#F0F2E8] flex justify-between items-center shrink-0">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#88B04B] rounded-full flex items-center justify-center text-white"><MessageSquare size={20} /></div>
                            <div>
                               <h2 className="text-sm font-black">কথোপকথন প্র্যাকটিস</h2>
                               <p className="text-[10px] text-[#88B04B] font-bold uppercase">বট মোড</p>
                            </div>
                         </div>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
                         {CHAT_HISTORY.map((m, i) => (
                            <div key={i} className={`flex ${m.sender === "USER" ? "justify-end" : "justify-start"}`}>
                               <div className={`max-w-[85%] p-5 rounded-[32px] space-y-2 shadow-sm ${m.sender === "USER" ? "bg-[#88B04B] text-white rounded-tr-none" : "bg-[#F9FAF5] text-[#2D3436] rounded-tl-none border border-[#F0F2E8]"}`}>
                                  <p className="text-xl font-black">{m.chinese}</p>
                                  <p className={`text-[10px] font-bold ${m.sender === "USER" ? "text-white/70" : "text-[#88B04B]"}`}>{m.pinyin}</p>
                                  <p className={`text-xs font-bold leading-relaxed ${m.sender === "USER" ? "text-white/80 border-t border-white/10 pt-2" : "text-[#636E72] border-t border-[#F0F2E8] pt-2 italic"}`}>{m.bengali}</p>
                               </div>
                            </div>
                         ))}
                      </div>

                      <div className="p-4 bg-[#F9FAF5] flex gap-2 overflow-x-auto scrollbar-hide border-t border-[#F0F2E8]">
                         {["আমি ভালো আছি।", "ধন্যবাদ।", "আপনি কেমন আছেন?"].map((reply, ri) => (
                            <button key={ri} onClick={() => alert("অসাধারণ! আপনার উত্তরটি সঠিক।")} className="px-5 py-3 bg-white border-2 border-[#F0F2E8] rounded-2xl whitespace-nowrap font-black text-xs hover:border-[#88B04B] transition-all">{reply}</button>
                         ))}
                      </div>
                   </div>
                )}

                {premiumCategory === "video" && (
                   <div className="space-y-8">
                      <div className="p-10 bg-[#2D3436] rounded-[48px] text-white space-y-4 text-center shadow-xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-8 opacity-10"><Video size={100} /></div>
                         <h2 className="text-3xl font-black">বাক্য তৈরি করুন</h2>
                         <p className="text-sm font-bold text-white/60 uppercase tracking-widest leading-relaxed">নিচের শব্দগুলো সাজিয়ে সঠিক চাইনিজ বাক্যটি তৈরি করুন।</p>
                      </div>

                      <div className="bg-white border-2 border-[#F0F2E8] rounded-[40px] p-8 text-center space-y-6 shadow-sm">
                         <p className="text-sm font-black text-[#88B04B] uppercase tracking-widest">বাংলা অর্থ</p>
                         <h3 className="text-2xl font-black text-[#2D3436]">"আমি বেইজিং যাচ্ছি"</h3>
                         <div className="min-h-[80px] bg-[#F9FAF5] rounded-[32px] border-2 border-dashed border-[#F0F2E8] p-4 flex flex-wrap gap-2 items-center justify-center">
                            {/* Selected words would go here */}
                         </div>
                      </div>

                      <div className="flex flex-wrap gap-3 justify-center">
                         {["我", "去", "北京", "的"].sort(() => Math.random() - 0.5).map((word, i) => (
                            <button key={i} onClick={() => playSound("CLICK")} className="px-8 py-5 bg-white border-2 border-[#F0F2E8] rounded-[24px] font-black text-xl shadow-sm hover:border-[#88B04B] hover:text-[#88B04B] transition-all">{word}</button>
                         ))}
                      </div>

                      <button onClick={() => alert("চমৎকার! আপনি সঠিক বাক্যটি তৈরি করেছেন।")} className="w-full py-6 bg-[#88B04B] text-white rounded-[32px] font-black shadow-lg">চেক করুন</button>
                   </div>
                )}

                {premiumCategory === "camera" && (
                   <div className="space-y-8 py-6">
                      <div className="p-8 bg-[#FF6B6B] rounded-[48px] text-white space-y-3 relative overflow-hidden shadow-xl">
                         <div className="absolute top-0 right-0 p-8 opacity-10"><Camera size={120} /></div>
                         <h2 className="text-3xl font-black">ম্যাজিক ক্যামেরা</h2>
                         <p className="text-sm font-bold opacity-80">চারপাশের বস্তু স্ক্যান করে চাইনিজ নাম জানুন।</p>
                      </div>

                      <div className="aspect-[4/5] bg-gray-100 rounded-[48px] border-4 border-dashed border-[#F0F2E8] flex flex-col items-center justify-center space-y-6 relative group overflow-hidden">
                         <div className="text-center space-y-2 relative z-10 p-8 bg-white/80 backdrop-blur-sm rounded-3xl border border-[#F0F2E8]">
                            <Camera size={48} className="mx-auto text-[#FF6B6B]" />
                            <p className="text-sm font-black text-[#2D3436]">ক্যামেরা পারমিশন দিন</p>
                            <button onClick={() => alert("ক্যামেরা চালু হচ্ছে...")} className="mt-4 px-8 py-4 bg-[#FF6B6B] text-white rounded-2xl font-black text-xs shadow-lg">স্ক্যান শুরু করুন</button>
                         </div>
                         <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1548919973-5dea5846f669?auto=format&fit=crop&q=80&w=600')] bg-cover bg-center opacity-30 grayscale" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         {["পানি", "বই", "কলম", "আপেল"].map((obj, i) => (
                            <div key={i} className="p-5 bg-white border-2 border-[#F0F2E8] rounded-3xl flex flex-col items-center gap-2 shadow-sm">
                               <p className="text-[10px] font-black text-[#A0A396] uppercase">{obj}</p>
                               <span className="text-2xl font-black">?</span>
                            </div>
                         ))}
                      </div>
                   </div>
                )}

                {premiumCategory === "tones" && (
                   <div className="space-y-8 py-6">
                      <div className="p-8 bg-[#4ECDC4] rounded-[48px] text-white space-y-3 relative overflow-hidden shadow-xl">
                         <div className="absolute top-0 right-0 p-8 opacity-10"><Waves size={120} /></div>
                         <h2 className="text-3xl font-black">সুর চেকার</h2>
                         <p className="text-sm font-bold opacity-80">টোন মিটার দিয়ে সঠিক সুর প্র্যাকটিস করুন।</p>
                      </div>

                      <div className="space-y-6">
                         {TONE_PRACTICE.map((t, idx) => (
                            <div key={idx} className="p-6 bg-white border-2 border-[#F0F2E8] rounded-[40px] space-y-4 shadow-sm">
                               <div className="flex justify-between items-center">
                                  <div>
                                     <h3 className="text-4xl font-black text-[#2D3436] tracking-tight">{t.char}</h3>
                                     <p className="text-xs font-black text-[#4ECDC4] bg-[#E8F8F7] px-3 py-1 rounded-full inline-block uppercase tracking-widest mt-1">Tone {t.tone}</p>
                                  </div>
                                  <button onClick={() => speak(t.char)} className="p-4 bg-[#F9FAF5] rounded-2xl text-gray-400 hover:bg-[#4ECDC4] hover:text-white transition-all"><Volume2 size={24} /></button>
                               </div>
                               <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                  <motion.div initial={{ width: 0 }} animate={{ width: "70%" }} className="h-full bg-[#4ECDC4]" />
                               </div>
                               <p className="text-xs font-bold text-[#636E72] italic uppercase tracking-wider">{t.desc}</p>
                            </div>
                         ))}
                      </div>

                      <button onClick={() => alert("ভয়েস ইনপুট দিন...")} className="w-full py-8 bg-[#4ECDC4] text-white rounded-[40px] font-black shadow-xl shadow-[#4ECDC4]/20 flex items-center justify-center gap-3">
                         <Mic size={24} /> সুর পরীক্ষা করুন
                      </button>
                   </div>
                )}

                {/* Dashboard Missing Screens Handle */}
                {["shorts"].includes(premiumCategory || "") && (
                   <div className="text-center py-20 space-y-6">
                      <div className="w-24 h-24 bg-[#F9FAF5] rounded-[32px] mx-auto flex items-center justify-center text-[#88B04B] border-4 border-[#F0F2E8]">
                         <Star size={48} className="animate-pulse" />
                      </div>
                      <div className="space-y-2">
                         <h2 className="text-2xl font-black italic uppercase tracking-tighter">শীঘ্রই আসছে!</h2>
                         <p className="text-sm font-bold text-[#A0A396]">এই ফিচারটি ডেভেলপমেন্ট মোডে আছে। <br/>পরবর্তী আপডেটে এটি যুক্ত করা হবে।</p>
                      </div>
                      <button onClick={returnToMap} className="px-8 py-4 bg-[#2D3436] text-white rounded-2xl font-bold">অন্যগুলো দেখুন</button>
                   </div>
                )}

                {premiumCategory === "aitutor" && (
                   <div className="flex flex-col h-[75dvh] -mt-4 -mx-5 bg-[#F5F7FB]">
                      <div className="px-5 py-3 bg-white border-b border-[#F0F2E8] flex items-center gap-3 shrink-0">
                         <div className="w-10 h-10 bg-[#00B894] rounded-full flex items-center justify-center text-white"><Bot size={22} /></div>
                         <div>
                            <h2 className="text-sm font-black">এআই টিউটর (Guru)</h2>
                            <p className="text-[10px] text-[#00B894] font-bold tracking-widest uppercase">সক্রিয় • ২৪/৭ সাহায্য</p>
                         </div>
                      </div>

                      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
                         {tutorMessages.map((m, i) => (
                           <div key={i} className={`flex ${m.sender === "USER" ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[85%] p-4 rounded-[22px] font-bold text-sm shadow-sm ${m.sender === "USER" ? "bg-[#00B894] text-white rounded-tr-none" : "bg-white text-[#2D3436] rounded-tl-none border border-[#E9EDF2]"}`}>
                                 <Markdown>{m.text}</Markdown>
                              </div>
                           </div>
                         ))}
                         {isAILoading && <div className="text-[10px] font-bold text-[#A0A396] ml-4 animate-pulse">গুরু ভাবছে...</div>}
                      </div>

                      <div className="p-4 bg-white border-t border-[#F0F2E8] flex items-center gap-3">
                         <input 
                           type="text" value={tutorInput} 
                           onChange={(e) => setTutorInput(e.target.value)}
                           onKeyDown={(e) => e.key === "Enter" && handleTutorSend()}
                           placeholder="আপনার বার্তা..." 
                           className="flex-1 bg-[#F0F2F5] px-5 py-3 rounded-full outline-none text-sm font-bold" 
                         />
                         <button onClick={handleTutorSend} className="bg-[#00B894] text-white p-4 rounded-full shadow-lg"><Send size={20} /></button>
                      </div>
                   </div>
                )}
                
                {premiumCategory === "roadmap" && (
                   <div className="space-y-6">
                      <div className="p-8 bg-[#2D3436] rounded-[40px] text-white shadow-xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-8 opacity-10"><Target size={120} /></div>
                         <h2 className="text-2xl font-black relative z-10">শিখার গাইড</h2>
                         <p className="text-[10px] opacity-60 uppercase tracking-widest font-black relative z-10">৬ মাসের মাস্টার প্ল্যান</p>
                      </div>
                      <div className="space-y-4 relative">
                         <div className="absolute left-6 top-0 bottom-0 w-1 bg-[#F0F2E8] rounded-full" />
                         {STUDY_GUIDE.map((step, idx) => (
                            <div key={idx} className="relative pl-14 py-2">
                               <div className="absolute left-4 top-4 w-4 h-4 bg-white border-4 border-[#88B04B] rounded-full z-10" />
                               <div className="p-6 bg-white border-2 border-[#F0F2E8] rounded-[32px] space-y-2 shadow-sm">
                                  <p className="text-[10px] font-black text-[#88B04B] uppercase tracking-widest">{step.phase}</p>
                                  <h3 className="text-xl font-black">{step.title}</h3>
                                  <p className="text-xs font-bold text-[#636E72] leading-relaxed italic">{step.desc}</p>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                )}

                {premiumCategory === "grammar" && (
                   <div className="space-y-6">
                      <div className="p-8 bg-[#E67E22] rounded-[40px] text-white shadow-xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-8 opacity-10"><BookOpen size={120} /></div>
                         <h2 className="text-2xl font-black relative z-10">গ্রামার গাইড</h2>
                         <p className="text-[10px] opacity-60 uppercase tracking-widest font-black relative z-10">সহজ চাইনিজ ব্যকরণ</p>
                      </div>
                      <div className="space-y-4">
                         {GRAMMAR_DATA.map((item, idx) => (
                            <div key={idx} className="p-6 bg-white border-2 border-[#F0F2E8] rounded-[32px] space-y-3 shadow-sm">
                               <h3 className="font-black text-lg">{item.title}</h3>
                               <p className="text-sm font-bold text-[#636E72]">{item.desc}</p>
                               <div className="grid gap-3">
                                  {item.rules.slice(0, 2).map((rule, ri) => (
                                     <div key={ri} className="p-4 bg-[#F9FAF5] rounded-2xl border border-[#F0F2E8]">
                                        <p className="text-lg font-black">{rule.ex}</p>
                                        <p className="text-xs font-bold text-[#A0A396]">অর্থ: {rule.bn}</p>
                                     </div>
                                  ))}
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                )}

                {premiumCategory === "dictionary" && (
                   <div className="space-y-6">
                      <div className="p-8 bg-[#A29BFE] rounded-[40px] text-white shadow-xl relative overflow-hidden">
                         <h2 className="text-3xl font-black relative z-10">A to Z ডিকশনারি</h2>
                         <p className="text-sm font-bold opacity-80 relative z-10">সহজ শব্দকোষ</p>
                         <div className="absolute top-0 right-0 p-8 opacity-20"><Search size={80} /></div>
                      </div>

                      <div className="space-y-4">
                         <div className="relative">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input 
                              type="text" value={dictSearchQuery} 
                              onChange={(e) => { setDictSearchQuery(e.target.value); setDictLetterFilter(null); }} 
                              placeholder="শব্দ বা অর্থ দিয়ে খুঁজুন..." 
                              className="w-full pl-14 pr-6 py-5 bg-white border-2 border-[#F0F2E8] rounded-[32px] outline-none font-bold text-sm shadow-sm focus:border-[#A29BFE] transition-all" 
                            />
                         </div>

                         <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"].map(letter => (
                               <button 
                                 key={letter} 
                                 onClick={() => { setDictLetterFilter(dictLetterFilter === letter ? null : letter); setDictSearchQuery(""); }}
                                 className={`px-5 py-3 rounded-2xl font-black text-sm shrink-0 transition-all ${dictLetterFilter === letter ? 'bg-[#A29BFE] text-white shadow-lg' : 'bg-white border-2 border-[#F0F2E8] text-gray-400'}`}
                               >
                                  {letter}
                               </button>
                            ))}
                         </div>
                      </div>

                      <div className="space-y-4">
                         {DICTIONARY_DATA.filter(d => {
                            const matchesSearch = d.word.includes(dictSearchQuery) || d.bn.includes(dictSearchQuery) || d.pinyin.toLowerCase().includes(dictSearchQuery.toLowerCase());
                            const matchesLetter = !dictLetterFilter || d.pinyin.toLowerCase().startsWith(dictLetterFilter.toLowerCase());
                            return matchesSearch && matchesLetter;
                         }).length > 0 ? (
                           DICTIONARY_DATA.filter(d => {
                              const matchesSearch = d.word.includes(dictSearchQuery) || d.bn.includes(dictSearchQuery) || d.pinyin.toLowerCase().includes(dictSearchQuery.toLowerCase());
                              const matchesLetter = !dictLetterFilter || d.pinyin.toLowerCase().startsWith(dictLetterFilter.toLowerCase());
                              return matchesSearch && matchesLetter;
                           }).map((item, idx) => (
                              <div key={idx} className="p-6 bg-white border-2 border-[#F0F2E8] rounded-[40px] space-y-4 relative group shadow-sm">
                                 <div className="flex justify-between items-start">
                                    <div className="space-y-1">
                                       <h3 className="text-4xl font-black text-[#2D3436] tracking-tight">{item.word}</h3>
                                       <p className="text-xs font-black text-[#A29BFE] bg-[#F5F4FF] px-3 py-1 rounded-full inline-block uppercase tracking-widest">{item.pinyin}</p>
                                    </div>
                                    <button onClick={() => speak(item.word)} className="p-5 bg-[#F9FAF5] rounded-[24px] text-gray-400 hover:bg-[#A29BFE] hover:text-white transition-all shadow-sm">
                                       <Volume2 size={24} />
                                    </button>
                                 </div>
                                 <div className="space-y-3">
                                    <p className="text-lg font-black text-[#2D3436]">বাংলা: {item.bn}</p>
                                    {item.ex && (
                                       <div className="p-4 bg-[#F9FAF5] rounded-2xl border border-[#F0F2E8]">
                                          <p className="text-xs font-bold text-[#636E72] leading-relaxed italic">{item.ex}</p>
                                       </div>
                                    )}
                                 </div>
                              </div>
                           ))
                         ) : (
                           <div className="text-center py-12 px-8 bg-white border-2 border-dashed border-[#F0F2E8] rounded-[40px] space-y-4">
                              <p className="text-[#A0A396] font-black">কোনো শব্দ পাওয়া যায়নি</p>
                              <button onClick={() => { setDictSearchQuery(""); setDictLetterFilter(null); }} className="text-[#A29BFE] font-black underline">সবগুলো দেখুন</button>
                           </div>
                         )}
                      </div>
                   </div>
                )}
              </motion.div>
            )}

            {screen === "MAP" && (
              <div className="space-y-6 pt-4 pb-20">
                 <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                    {ALL_HSK_DATA.map(level => (
                       <button 
                         key={level.level} 
                         onClick={() => { playSound("CLICK"); setActiveLevel(level); }}
                         className={`px-6 py-3 rounded-2xl font-black text-xs shrink-0 transition-all ${activeLevel.level === level.level ? 'bg-[#88B04B] text-white shadow-lg shadow-[#88B04B]/20' : 'bg-white border-2 border-[#F0F2E8] text-gray-400'}`}
                       >
                          {level.title}
                       </button>
                    ))}
                 </div>

                 <div className="grid gap-4">
                    {activeLevel.modules.map(module => (
                       <button key={module.id} onClick={() => { 
                         if (containerRef.current) dashboardScrollPos.current = containerRef.current.scrollTop;
                         setActiveModule(module); setScreen("LEARNING"); setLearningIndex(0);
                       }} className="w-full p-6 bg-white border-2 border-[#F0F2E8] rounded-[32px] flex items-center justify-between group active:scale-[0.98] transition-transform">
                          <div className="flex items-center gap-4">
                             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${completedModules.includes(module.id) ? 'bg-green-500 shadow-green-100' : 'bg-[#88B04B] shadow-green-100'}`}>
                                {completedModules.includes(module.id) ? <CheckCircle2 size={24} /> : <span className="text-xl">{module.icon || "📖"}</span>}
                             </div>
                             <div className="text-left">
                                <h3 className="font-black text-lg text-[#2D3436] tracking-tight">{module.title}</h3>
                                <p className="text-[10px] font-bold text-[#A0A396] uppercase tracking-widest mt-0.5">{module.shortDesc}</p>
                             </div>
                          </div>
                          <ChevronRight size={20} className="text-gray-300 group-hover:text-[#88B04B] transition-colors" />
                       </button>
                    ))}
                 </div>
              </div>
            )}
            
            {screen === "LEARNING" && (
              <div className="space-y-6 py-4">
                 <div className="text-center space-y-4">
                    <motion.h1 initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-8xl font-black text-[#2D3436] tracking-tighter">{activeModule.words[learningIndex].character}</motion.h1>
                    <p className="text-2xl font-black text-[#88B04B]">{activeModule.words[learningIndex].pinyin}</p>
                    <button onClick={() => speak(activeModule.words[learningIndex].character)} className="p-6 bg-[#88B04B]/10 text-[#88B04B] rounded-full hover:bg-[#88B04B]/20 transition-all active:scale-95"><Volume2 size={32} /></button>
                 </div>
                 
                 <div className="space-y-4 pb-20">
                    <div className="bg-white p-6 rounded-[32px] border-2 border-[#F0F2E8] shadow-sm">
                       <p className="text-[10px] font-black text-[#A0A396] uppercase tracking-widest mb-2">অর্থ</p>
                       <p className="text-2xl font-black text-[#2D3436]">{activeModule.words[learningIndex].meaning} ({activeModule.words[learningIndex].bengali})</p>
                    </div>

                    {activeModule.words[learningIndex].examples && activeModule.words[learningIndex].examples!.length > 0 && (
                       <div className="bg-[#F9FAF5] p-6 rounded-[32px] border-2 border-[#F0F2E8]">
                          <p className="text-[10px] font-black text-[#88B04B] uppercase tracking-widest mb-4">উদাহরণ বাক্য</p>
                          <div className="space-y-4">
                             {activeModule.words[learningIndex].examples!.map((ex, i) => (
                                <div key={i} className="space-y-1">
                                   <p className="text-xl font-black text-[#2D3436]">{ex.zh}</p>
                                   <p className="text-xs font-bold text-[#88B04B]">{ex.py}</p>
                                   <p className="text-sm font-bold text-[#636E72] italic">"{ex.bn}"</p>
                                </div>
                             ))}
                          </div>
                       </div>
                    )}

                    {activeModule.words[learningIndex].collocations && activeModule.words[learningIndex].collocations!.length > 0 && (
                       <div className="bg-white p-6 rounded-[32px] border-2 border-[#F0F2E8]">
                          <p className="text-[10px] font-black text-[#A0A396] uppercase tracking-widest mb-3">কমন শব্দগুচ্ছ (Collocations)</p>
                          <div className="flex flex-wrap gap-2">
                             {activeModule.words[learningIndex].collocations!.map((col, i) => (
                                <span key={i} className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-black text-[#2D3436]">{col}</span>
                             ))}
                          </div>
                       </div>
                    )}

                    {activeModule.words[learningIndex].notes && (
                       <div className="bg-[#FFF9F0] p-6 rounded-[32px] border-2 border-[#FFE0B2]">
                          <p className="text-[10px] font-black text-[#E67E22] uppercase tracking-widest mb-2">নোট (Usage Notes)</p>
                          <p className="text-sm font-bold text-[#636E72] leading-relaxed">{activeModule.words[learningIndex].notes}</p>
                       </div>
                    )}
                 </div>

                 <div className="fixed bottom-6 left-6 right-6 z-50">
                    <button onClick={() => { if (learningIndex < activeModule.words.length - 1) { setLearningIndex(idx => idx + 1); if (containerRef.current) containerRef.current.scrollTop = 0; } else setScreen("QUIZ"); }} className="w-full py-6 bg-[#2D3436] text-white rounded-[32px] font-black shadow-xl shadow-black/10 active:scale-95 transition-all">পরবর্তী</button>
                 </div>
              </div>
            )}
            
            {screen === "QUIZ" && (
               <div className="space-y-6 p-4">
                  <div className="h-2 bg-[#F0F2E8] rounded-full overflow-hidden">
                     <div className="h-full bg-[#88B04B] transition-all" style={{ width: `${((quizIndex + 1) / (isMockTest ? MOCK_TEST_QUESTIONS.length : activeModule.quizzes.length)) * 100}%` }} />
                  </div>
                  <div className="text-center space-y-4">
                     <p className="text-[10px] font-black text-[#A0A396] uppercase tracking-widest">প্রশ্ন {quizIndex + 1} / {isMockTest ? MOCK_TEST_QUESTIONS.length : activeModule.quizzes.length}</p>
                     <h2 className="text-2xl font-black text-[#2D3436] tracking-tight">{isMockTest ? MOCK_TEST_QUESTIONS[quizIndex].question : activeModule.quizzes[quizIndex].question}</h2>
                     <div className="py-10 bg-[#F9FAF5] rounded-[48px] border-2 border-dashed border-[#F0F2E8] mx-2">
                        <span className="text-6xl font-black text-[#2D3436]">
                           {isMockTest ? MOCK_TEST_QUESTIONS[quizIndex].chineseContent : activeModule.quizzes[quizIndex].chineseContent}
                        </span>
                     </div>
                  </div>
                  <div className="grid gap-3">
                     {(isMockTest ? MOCK_TEST_QUESTIONS[quizIndex].type : activeModule.quizzes[quizIndex].type) === "LISTENING" && (isMockTest ? MOCK_TEST_QUESTIONS[quizIndex].options : activeModule.quizzes[quizIndex].options)?.map((opt: string) => (
                        <button key={opt} onClick={() => {
                           const correct = (isMockTest ? MOCK_TEST_QUESTIONS[quizIndex].correctAnswer : activeModule.quizzes[quizIndex].correctAnswer);
                           if (opt === correct) { 
                              playSound("CORRECT"); 
                              if (quizIndex < (isMockTest ? MOCK_TEST_QUESTIONS.length : activeModule.quizzes.length)-1) setQuizIndex(i => i + 1); 
                              else setScreen("RESULT"); 
                           } else playSound("INCORRECT");
                        }} className="p-6 bg-white border-2 border-[#F0F2E8] rounded-[32px] font-black text-left hover:border-[#88B04B] transition-all active:scale-[0.98]">{opt}</button>
                     ))}

                     {(isMockTest ? MOCK_TEST_QUESTIONS[quizIndex].type : activeModule.quizzes[quizIndex].type) === "TRANSLATE" && (
                        <div className="space-y-4">
                           <input 
                              type="text" value={quizInput} onChange={(e) => setQuizInput(e.target.value)}
                              placeholder="অর্থ লিখুন..." 
                              className="w-full px-8 py-6 bg-white border-2 border-[#F0F2E8] rounded-[32px] outline-none font-bold text-lg focus:border-[#88B04B]" 
                           />
                           <button onClick={() => {
                              const correct = (isMockTest ? MOCK_TEST_QUESTIONS[quizIndex].correctAnswer : activeModule.quizzes[quizIndex].correctAnswer).toLowerCase();
                              if (quizInput.toLowerCase().trim() === correct) {
                                 playSound("CORRECT"); setQuizInput("");
                                 if (quizIndex < (isMockTest ? MOCK_TEST_QUESTIONS.length : activeModule.quizzes.length)-1) setQuizIndex(i => i + 1);
                                 else setScreen("RESULT");
                              } else playSound("INCORRECT");
                           }} className="w-full py-6 bg-[#88B04B] text-white rounded-[32px] font-black">যাচাই করুন</button>
                        </div>
                     )}

                     {(isMockTest ? MOCK_TEST_QUESTIONS[quizIndex].type : activeModule.quizzes[quizIndex].type) === "BUILD" && (
                        <div className="space-y-6">
                           <div className="min-h-[80px] p-4 bg-white border-2 border-dashed border-[#F0F2E8] rounded-[32px] flex flex-wrap gap-2">
                              {selectedChips.map((chip, i) => (
                                 <button key={i} onClick={() => setSelectedChips(prev => prev.filter((_, idx) => idx !== i))} className="px-4 py-2 bg-[#F9FAF5] border border-[#88B04B] rounded-xl font-bold">{chip}</button>
                              ))}
                           </div>
                           <div className="flex flex-wrap gap-2 justify-center">
                              {(isMockTest ? MOCK_TEST_QUESTIONS[quizIndex].chips : activeModule.quizzes[quizIndex].chips)?.map((chip: string, i: number) => (
                                 <button key={i} onClick={() => setSelectedChips(prev => [...prev, chip])} className="px-4 py-2 bg-white border-2 border-[#F0F2E8] rounded-xl font-bold">{chip}</button>
                              ))}
                           </div>
                           <button onClick={() => {
                              const userAnswer = selectedChips.join("");
                              const correct = (isMockTest ? MOCK_TEST_QUESTIONS[quizIndex].correctAnswer : activeModule.quizzes[quizIndex].correctAnswer);
                              if (userAnswer === correct) {
                                 playSound("CORRECT"); setSelectedChips([]);
                                 if (quizIndex < (isMockTest ? MOCK_TEST_QUESTIONS.length : activeModule.quizzes.length)-1) setQuizIndex(i => i + 1);
                                 else setScreen("RESULT");
                              } else playSound("INCORRECT");
                           }} className="w-full py-6 bg-[#88B04B] text-white rounded-[32px] font-black">যাচাই করুন</button>
                        </div>
                     )}
                  </div>
               </div>
            )}

            {screen === "RESULT" && (
               <div className="text-center py-10 space-y-8">
                  <div className="w-32 h-32 bg-[#F1C40F] rounded-full mx-auto flex items-center justify-center text-white shadow-xl">
                     <Trophy size={64} />
                  </div>
                  <h1 className="text-4xl font-black">অসাধারণ সাফল্য!</h1>
                  <p className="font-bold text-[#636E72]">আপনি আজকের সেশনটি সম্পূর্ণ করেছেন।</p>
                  <button onClick={returnToMap} className="w-full py-6 bg-[#2D3436] text-white rounded-[32px] font-black shadow-lg">ড্যাশবোর্ডে ফিরে যান</button>
               </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
