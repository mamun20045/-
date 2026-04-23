import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Mic, X, CheckCircle2, RotateCcw } from 'lucide-react';
import { ROLEPLAY_SCENARIOS } from '../constants';

export const VideoRoleplay: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeScenario, setActiveScenario] = useState(ROLEPLAY_SCENARIOS[0]);
  const [currentStep, setCurrentStep] = useState(0); // 0: Watch, 1: Record, 2: Done
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const startPractice = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      
      // Wait for a few seconds to let "AI" part play
      setTimeout(() => {
        videoRef.current?.pause();
        setCurrentStep(1);
      }, 5000); // Simulate the timing of the first line
    }
  };

  const handleRecord = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setCurrentStep(2);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col font-sans">
      {/* Header */}
      <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center z-20">
        <button onClick={onClose} className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white">
          <X className="w-6 h-6" />
        </button>
        <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
          <span className="text-white font-bold text-sm">ভিডিও ডাবিং</span>
        </div>
        <div className="w-12 h-12" />
      </div>

      {/* Video Content */}
      <div className="flex-1 relative bg-gray-900 overflow-hidden flex items-center">
        <video 
          ref={videoRef}
          src={activeScenario.video}
          className="w-full aspect-video object-cover"
          playsInline
          onError={(e) => {
            console.error("Video error, trying backup...", e);
            if (videoRef.current && (activeScenario as any).backupVideo) {
               videoRef.current.src = (activeScenario as any).backupVideo;
            }
          }}
        />
        
        {/* Caption Overlay */}
        <div className="absolute bottom-40 inset-x-0 flex flex-col items-center px-10 text-center gap-4">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-black/60 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                <p className="text-white text-xl font-bold mb-1">{activeScenario.lines[0].text}</p>
                <p className="text-white/60 font-medium text-sm">{activeScenario.lines[0].translation}</p>
                <span className="mt-2 inline-block px-2 py-1 bg-white/20 rounded text-[10px] text-white font-black uppercase tracking-widest">Waiter Speaking</span>
              </motion.div>
            )}
            {currentStep === 1 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-[#FFD93D] p-6 rounded-2xl shadow-xl shadow-yellow-500/20">
                <p className="text-gray-900 text-2xl font-black mb-1">{activeScenario.lines[1].text}</p>
                <p className="text-gray-900/60 font-bold text-sm">{activeScenario.lines[1].translation} ({activeScenario.lines[1].pinyin})</p>
                <span className="mt-2 inline-block px-2 py-1 bg-black/10 rounded text-[10px] text-gray-900 font-black uppercase tracking-widest">Your Turn to Speak</span>
              </motion.div>
            )}
            {currentStep === 2 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-green-500 p-8 rounded-3xl shadow-2xl shadow-green-500/20 flex flex-col items-center">
                <CheckCircle2 className="w-12 h-12 text-white mb-2" />
                <p className="text-white text-2xl font-black">অসাধারণ ডাবিং!</p>
                <p className="text-white/80 font-bold">আপনার উচ্চারণ প্রায় চাইনিজদের মতো।</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Controller Area */}
      <div className="p-10 bg-white rounded-t-[40px] flex flex-col items-center gap-6">
        {currentStep === 0 && (
          <button 
            onClick={startPractice}
            className="w-full h-20 bg-gray-900 text-white rounded-2xl flex items-center justify-center gap-4 font-black shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Play className="w-8 h-8" /> সেশন শুরু করুন
          </button>
        )}
        
        {currentStep === 1 && (
          <button 
            onClick={handleRecord}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 scale-125' : 'bg-[#FFD93D] shadow-xl shadow-yellow-100 hover:scale-110'}`}
          >
            <Mic className={`w-10 h-10 ${isRecording ? 'text-white animate-pulse' : 'text-gray-900'}`} />
          </button>
        )}

        {currentStep === 2 && (
          <button 
            onClick={() => setCurrentStep(0)}
            className="w-full h-16 bg-gray-100 text-gray-900 rounded-2xl flex items-center justify-center gap-2 font-black border border-gray-200"
          >
            <RotateCcw className="w-5 h-5" /> আবার ডাব করুন
          </button>
        )}

        <p className="text-gray-400 font-bold text-sm">
          {currentStep === 0 ? "ভিডিওটি মনোযোগ দিয়ে দেখুন" : currentStep === 1 ? "মাইক চেপে কথা বলুন" : "চমৎকার প্র্যাকটিস হয়েছে!"}
        </p>
      </div>
    </div>
  );
};
