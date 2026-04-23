import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, X, Info, Trophy, RotateCcw } from 'lucide-react';
import { TONE_PRACTICE } from '../constants';

export const ToneAnalyzer: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTone, setActiveTone] = useState(TONE_PRACTICE[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;
      
      setIsRecording(true);
      setScore(null);
      draw();

      // Stop after 3 seconds and "evaluate"
      setTimeout(() => {
        stopAnalysis();
        setScore(Math.floor(Math.random() * 20) + 80); // Simulate score
      }, 3000);
    } catch (err) {
      console.error("Microphone access denied", err);
    }
  };

  const stopAnalysis = () => {
    setIsRecording(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const draw = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const renderFrame = () => {
      animationFrameRef.current = requestAnimationFrame(renderFrame);
      analyserRef.current!.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.beginPath();
      ctx.strokeStyle = '#4ECDC4';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);

        x += sliceWidth;
      }
      ctx.stroke();
    };
    renderFrame();
  };

  const speakOriginal = () => {
    const utterance = new SpeechSynthesisUtterance(activeTone.char);
    utterance.lang = 'zh-CN';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#F8F9FA] flex flex-col">
      {/* Header */}
      <div className="p-6 flex justify-between items-center bg-white border-b border-gray-100">
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-6 h-6 text-gray-500" />
        </button>
        <h1 className="text-xl font-black text-gray-800">সুর চেকার</h1>
        <div className="w-10" />
      </div>

      <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
        {/* Tone Selector */}
        <div className="grid grid-cols-4 gap-2">
          {TONE_PRACTICE.map((t) => (
            <button
              key={t.tone}
              onClick={() => { setActiveTone(t); setScore(null); }}
              className={`p-4 rounded-2xl border-2 transition-all ${activeTone.tone === t.tone ? 'border-[#4ECDC4] bg-[#4ECDC4]/10' : 'border-gray-100 bg-white hover:border-gray-200'}`}
            >
              <div className="text-2xl font-black mb-1">{t.char}</div>
              <div className="text-xs text-gray-400 font-bold">সুর {t.tone}</div>
            </button>
          ))}
        </div>

        {/* Practice Card */}
        <motion.div 
          key={activeTone.tone}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center"
        >
          <div className="text-8xl font-black text-gray-900 mb-4">{activeTone.char}</div>
          <div className="text-2xl font-bold text-[#4ECDC4] mb-2">{activeTone.pinyin}</div>
          <p className="text-gray-500 font-medium max-w-xs">{activeTone.desc}</p>
          
          <button onClick={speakOriginal} className="mt-6 flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-full text-gray-600 font-bold hover:bg-gray-200 transition-colors">
            <Mic className="w-4 h-4" /> আসল উচ্চারণ শুনুন
          </button>
        </motion.div>

        {/* Visualizer Area */}
        <div className="relative h-48 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-full" width={600} height={200} />
          {!isRecording && !score && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium">
              আপনার কণ্ঠ এখানে দেখা যাবে...
            </div>
          )}
          
          <AnimatePresence>
            {score && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  <span className="text-4xl font-black text-gray-900">{score}%</span>
                </div>
                <p className="text-gray-500 font-bold">চমৎকার সুর হয়েছে!</p>
                <button onClick={() => setScore(null)} className="mt-4 text-[#4ECDC4] font-black flex items-center gap-1">
                  <RotateCcw className="w-4 h-4" /> আবার চেষ্টা করুন
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer / Mic Button */}
      <div className="p-8 bg-white border-t border-gray-100 flex flex-col items-center">
        <button 
          onMouseDown={startAnalysis}
          onMouseUp={stopAnalysis}
          onTouchStart={startAnalysis}
          onTouchEnd={stopAnalysis}
          className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-xl ${isRecording ? 'bg-red-500 scale-110 shadow-red-200' : 'bg-[#4ECDC4] hover:scale-105 shadow-cyan-100'}`}
        >
          <Mic className={`w-10 h-10 text-white ${isRecording ? 'animate-pulse' : ''}`} />
        </button>
        <p className="mt-4 text-gray-400 font-bold text-sm">চেপে ধরে কথা বলুন</p>
      </div>
    </div>
  );
};
