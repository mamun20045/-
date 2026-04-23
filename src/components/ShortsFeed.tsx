import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, MessageCircle, Share2, Music, UserPlus } from 'lucide-react';
import { SHORTS_FEED } from '../constants';

export const ShortsFeed: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const currentShort = SHORTS_FEED[currentIndex];

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollPos = e.currentTarget.scrollTop;
    const height = e.currentTarget.clientHeight;
    const index = Math.round(scrollPos / height);
    if (index !== currentIndex && index < SHORTS_FEED.length) {
      setCurrentIndex(index);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      {/* Header */}
      <div className="absolute top-6 left-6 z-50">
        <button onClick={onClose} className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Feed Container */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      >
        {SHORTS_FEED.map((short, idx) => (
          <div key={short.id} className="h-full w-full snap-start relative flex items-center bg-gray-900">
            <video 
              id={`video-${short.id}`}
              src={short.url} 
              autoPlay={idx === currentIndex} 
              loop 
              muted={idx !== currentIndex}
              playsInline
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error("Video error, using backup:", e);
                const vid = document.getElementById(`video-${short.id}`) as HTMLVideoElement;
                if (vid && (short as any).backup) {
                  vid.src = (short as any).backup;
                }
              }}
            />
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none" />

            {/* Bottom Info */}
            <div className="absolute bottom-10 left-6 right-20 pointer-events-none">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#6C5CE7] rounded-full flex items-center justify-center text-white border-2 border-white">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-black text-lg">@GuruLearn</h3>
                  <p className="text-white/80 font-bold text-sm">চায়না ভ্রমণ গাউড</p>
                </div>
              </div>
              
              <div className="space-y-2 mb-6">
                <h2 className="text-white font-medium text-lg leading-tight">{short.title}</h2>
              </div>

              {/* Subtitles (Dual Language) */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                key={`sub-${short.id}`}
                className="bg-black/40 backdrop-blur-md p-6 rounded-3xl border border-white/10"
              >
                <p className="text-3xl font-black text-white mb-2 leading-tight">{short.subtiles.zh}</p>
                <div className="h-px bg-white/20 w-12 mb-2" />
                <p className="text-[#6C5CE7] font-black text-lg leading-tight">{short.subtiles.bn}</p>
              </motion.div>
            </div>

            {/* Side Actions */}
            <div className="absolute bottom-20 right-6 flex flex-col gap-8 items-center">
              <div className="flex flex-col items-center gap-1 group cursor-pointer">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors">
                  <Heart className="w-7 h-7" />
                </div>
                <span className="text-white font-bold text-xs uppercase tracking-widest">২৪ক</span>
              </div>
              <div className="flex flex-col items-center gap-1 cursor-pointer">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-blue-500 transition-colors">
                  <MessageCircle className="w-7 h-7" />
                </div>
                <span className="text-white font-bold text-xs uppercase tracking-widest">৫২</span>
              </div>
              <div className="flex flex-col items-center gap-1 cursor-pointer">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-green-500 transition-colors">
                  <Share2 className="w-7 h-7" />
                </div>
                <span className="text-white font-bold text-xs uppercase tracking-widest">শেয়ার</span>
              </div>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 bg-gray-800 rounded-full border-4 border-gray-600 flex items-center justify-center mt-4 overflow-hidden"
              >
                 <Music className="w-6 h-6 text-white" />
              </motion.div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
