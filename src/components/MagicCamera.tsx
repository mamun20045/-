import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, X, RefreshCw, Smartphone, Coffee, Book, Info } from 'lucide-react';

interface DetectedObject {
  name: string;
  pinyin: string;
  chinese: string;
  bengali: string;
  icon: React.ReactNode;
}

const MOCK_OBJECTS: DetectedObject[] = [
  { name: "Water", pinyin: "shuǐ", chinese: "水", bengali: "পানি", icon: <Coffee className="w-6 h-6" /> },
  { name: "Phone", pinyin: "shǒujī", chinese: "手机", bengali: "মোবাইল", icon: <Smartphone className="w-6 h-6" /> },
  { name: "Book", pinyin: "shū", chinese: "书", bengali: "বই", icon: <Book className="w-6 h-6" /> },
];

export const MagicCamera: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [scanning, setScanning] = useState(false);
  const [detected, setDetected] = useState<DetectedObject | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        setError("ক্যামেরা অ্যাক্সেস করা যাচ্ছে না। অনুগ্রহ করে পারমিশন চেক করুন।");
        console.error(err);
      }
    }
    startCamera();

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const handleScan = () => {
    setScanning(true);
    setDetected(null);
    
    // Simulate AI detection
    setTimeout(() => {
      const randomObj = MOCK_OBJECTS[Math.floor(Math.random() * MOCK_OBJECTS.length)];
      setDetected(randomObj);
      setScanning(false);

      // Simple Text-to-Speech simulation or notification
      const utterance = new SpeechSynthesisUtterance(randomObj.chinese);
      utterance.lang = 'zh-CN';
      window.speechSynthesis.speak(utterance);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
        <button onClick={onClose} className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white">
          <X className="w-6 h-6" />
        </button>
        <div className="bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
          <span className="text-white font-bold text-sm">ম্যাজিক ক্যামেরা</span>
        </div>
        <div className="w-12 h-12" /> {/* Spacer */}
      </div>

      <div className="flex-1 relative overflow-hidden">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white">
            <Info className="w-12 h-12 mb-4 text-red-400" />
            <p>{error}</p>
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
        )}

        {/* Scanning Animation */}
        <AnimatePresence>
          {scanning && (
            <motion.div 
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              exit={{ scaleX: 0 }}
              className="absolute inset-x-0 h-1 bg-green-400 top-1/2 shadow-[0_0_15px_rgba(74,222,128,0.8)] z-20"
            />
          )}
        </AnimatePresence>

        {/* Detected Info Card */}
        <AnimatePresence>
          {detected && !scanning && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-32 left-6 right-6"
            >
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-2xl flex items-center gap-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  {detected.icon}
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-3xl font-black text-gray-900">{detected.chinese}</h2>
                    <span className="text-green-600 font-bold">{detected.pinyin}</span>
                  </div>
                  <p className="text-gray-500 font-medium">বাংলা অর্থ: <span className="text-gray-900">{detected.bengali}</span></p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-8 bg-black flex justify-center items-center">
        <button 
          onClick={handleScan}
          disabled={scanning}
          className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all ${scanning ? 'scale-90 opacity-50' : 'hover:scale-110 active:scale-95'}`}
        >
          <div className={`w-16 h-16 rounded-full bg-white flex items-center justify-center ${scanning ? 'animate-pulse' : ''}`}>
            {scanning ? <RefreshCw className="w-8 h-8 text-black animate-spin" /> : <Camera className="w-8 h-8 text-black" />}
          </div>
        </button>
      </div>
    </div>
  );
};
