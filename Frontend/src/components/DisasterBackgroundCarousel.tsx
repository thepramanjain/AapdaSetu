import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const disasterImages = [
  {
    url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1800&auto=format&fit=crop',
    title: 'Flood Rescue Operations',
    location: 'Assam Brahmaputra Basin'
  },
  {
    url: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=1800&auto=format&fit=crop',
    title: 'Emergency Aid & Supply Delivery',
    location: 'Odisha Coastal Relief Zone'
  },
  {
    url: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=1800&auto=format&fit=crop',
    title: 'Medical Triage & Evacuation',
    location: 'Himachal Disaster Response'
  },
  {
    url: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=1800&auto=format&fit=crop',
    title: 'AI Command Center Telemetry',
    location: 'National Crisis Coordination'
  }
];

export const DisasterBackgroundCarousel: React.FC<{
  overlayOpacity?: number;
  intervalMs?: number;
  className?: string;
}> = ({
  overlayOpacity = 0.82,
  intervalMs = 2000,
  className = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % disasterImages.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  const current = disasterImages[currentIndex];

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}>
      {/* Auto-transitioning Crossfade Images with Ken Burns Zoom */}
      <AnimatePresence mode="sync">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1.0 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url(${current.url})`,
            backgroundPosition: 'center 40%',
          }}
        />
      </AnimatePresence>

      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(180deg, rgba(255, 255, 255, 0.65) 0%, rgba(255, 255, 255, ${overlayOpacity}) 50%, rgba(250, 247, 242, 1) 100%),
            radial-gradient(ellipse at 30% 20%, rgba(255, 255, 255, 0.4) 0%, transparent 60%)
          `,
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Subtle Bottom Location Indicator Pill */}
      <div className="absolute bottom-6 left-6 z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 backdrop-blur-md shadow-sm border border-slate-200/80 text-[11px] font-mono text-slate-700">
        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-bold">{current.title}</span>
        <span className="text-slate-400">•</span>
        <span className="text-slate-500">{current.location}</span>
      </div>
    </div>
  );
};

export default DisasterBackgroundCarousel;
