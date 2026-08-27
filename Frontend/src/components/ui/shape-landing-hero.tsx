"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ShieldAlert, Activity, HeartHandshake, Zap, ArrowRight, Sparkles, Radio, Globe, Heart
} from "lucide-react";
import SplitTextHeading from "./SplitTextHeading";
import IndiaInteractiveMap from "../IndiaInteractiveMap";

// ─── Live Alert Ticker ───────────────────────────────────────────────
const alertItems = [
  { type: 'critical', label: 'Flood Warning – Assam Brahmaputra Basin' },
  { type: 'high', label: 'Cyclone Watch – Bay of Bengal & Odisha' },
  { type: 'medium', label: 'Landslide Alert – Himachal Pradesh' },
  { type: 'critical', label: 'Heavy Rainfall – Kerala Coastal Zone' },
  { type: 'medium', label: 'River Basin Surge – Bihar & UP' },
];

function LiveAlertTicker() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % alertItems.length), 3200);
    return () => clearInterval(t);
  }, []);

  const current = alertItems[idx];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={idx}
        initial={{ opacity: 0, y: 8, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.96 }}
        transition={{ duration: 0.35 }}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold"
        style={{
          background: 'rgba(255, 255, 255, 0.92)',
          border: '1px solid rgba(16, 185, 129, 0.5)',
          boxShadow: '0 4px 20px rgba(6, 78, 59, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
          color: '#064E3B',
          backdropFilter: 'blur(12px)',
        }}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
        </span>
        <span className="truncate max-w-[260px] sm:max-w-none">{current.label}</span>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Large High-Definition 3D Satellite Map Card ─────────────
function Map3DCard() {
  const rotateX = useSpring(useMotionValue(0), { stiffness: 120, damping: 22 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 120, damping: 22 });
  const [selectedState, setSelectedState] = useState<string | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    rotateX.set(-dy * 4.5);
    rotateY.set(dx * 4.5);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      className="w-full max-w-[650px] min-h-[580px] relative select-none"
      style={{ perspective: '1400px', rotateX, rotateY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="p-5 sm:p-7 flex flex-col justify-between overflow-hidden rounded-[2.5rem] relative group"
        style={{
          background: 'linear-gradient(165deg, rgba(255, 255, 255, 0.96) 0%, rgba(246, 252, 249, 0.94) 50%, rgba(235, 247, 241, 0.98) 100%)',
          boxShadow: '0 28px 70px -15px rgba(6, 78, 59, 0.22), 0 0 0 1.5px rgba(255, 255, 255, 0.95), inset 0 2px 4px rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* Glowing Top Multi-Stop Gradient Accent */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-500" />

        {/* Center Interactive Map Component (Enlarged & Sharp) */}
        <div className="relative w-full h-[520px] flex items-center justify-center p-1 my-auto">
          <IndiaInteractiveMap onSelectState={setSelectedState} />
        </div>

        {/* Card Footer Status */}
        <div className="flex items-center justify-between relative z-20 pt-3 border-t border-slate-200/90 mt-1">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            {selectedState ? (
              <span className="text-emerald-800 font-mono font-black">Region: {selectedState}</span>
            ) : (
              <span>36 States & UTs Monitored</span>
            )}
          </div>
          <div className="text-xs font-mono font-black text-emerald-700 flex items-center gap-1">
            <Globe className="h-3.5 w-3.5 text-emerald-600" />
            99.8% AI Telemetry Live
          </div>
        </div>
      </div>

      {/* Floating 24/7 AI Autonomous Grid Badge */}
      <motion.div
        className="absolute -bottom-4 -left-4 z-30 rounded-2xl p-4 min-w-[220px]"
        style={{
          background: 'rgba(255, 255, 255, 0.97)',
          border: '1.5px solid rgba(16, 185, 129, 0.45)',
          boxShadow: '0 14px 34px rgba(6, 78, 59, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
        }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="flex items-center gap-2 mb-0.5">
          <Activity className="h-4 w-4 text-emerald-600" />
          <span className="text-[10px] font-mono font-black uppercase text-emerald-700 tracking-wider">
            AUTONOMOUS AI
          </span>
        </div>
        <div className="text-sm font-black text-slate-900">
          24/7 National Resilience Grid
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Portals List ───────────────────────────────────────────────────
const portals = [
  {
    label: 'NGO Portal',
    desc: 'Coordinate relief on ground',
    badge: 'ACTIVE RELIEF',
    icon: HeartHandshake,
    to: '/ngo/dashboard',
    accentColor: '#10B981',
    gradient: 'linear-gradient(135deg, #064E3B 0%, #059669 60%, #10B981 100%)',
    textColor: '#FFFFFF',
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  {
    label: 'Gov Portal',
    desc: 'Command & dispatch center',
    badge: 'COMMAND NODE',
    icon: ShieldAlert,
    to: '/gov/dashboard',
    accentColor: '#2563EB',
    gradient: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 60%, #3B82F6 100%)',
    textColor: '#FFFFFF',
    borderColor: 'rgba(59, 130, 246, 0.5)',
  },
  {
    label: 'Donor / Volunteer',
    desc: 'Direct giving & field relief',
    badge: 'ON-CHAIN & RELIEF',
    icon: Zap,
    to: '/donor',
    accentColor: '#D97706',
    gradient: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 50%, #D97706 100%)',
    textColor: '#451A03',
    borderColor: 'rgba(245, 158, 11, 0.5)',
  },
];

export function HeroGeometric({
  badge = "Autonomous AI & Blockchain Suite",
  description = "AI-powered Disaster Intelligence Platform for Government and Relief Agencies. Detect threats, simulate multi-agent resource deployments, and release verified funding on-chain.",
  children,
}: {
  badge?: string;
  description?: string;
  children?: React.ReactNode;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.playbackRate = 1.0;
    const tryPlay = () => vid.play().catch(() => {});
    if (vid.readyState >= 3) {
      tryPlay();
    } else {
      vid.addEventListener('canplaythrough', tryPlay, { once: true });
    }
  }, []);

  return (
    <div
      className="relative min-h-[95vh] md:min-h-screen w-full flex items-center overflow-hidden pt-20 pb-16"
    >
      {/* ─── VIDEO BACKGROUND (Ultra HD 4K Quality Hardware-Accelerated Playback) ─── */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
        style={{
          transform: 'scale(1.03)',
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            filter: 'contrast(1.14) brightness(1.04) saturate(1.22)',
            imageRendering: 'high-quality',
          }}
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260815_030633_ddbe5946-3728-4dc9-ad0a-2e81e5682c69.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      {/* ─── Atmospheric haze (CSS animations only, no JS) ─── */}
      <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden">
        {[
          { w: 380, h: 260, l: '4%', t: '8%', col: 'rgba(255,255,255,0.1)', blur: 80, dur: 9 },
          { w: 280, h: 200, l: '62%', t: '4%', col: 'rgba(255,255,255,0.08)', blur: 60, dur: 11 },
          { w: 200, h: 170, l: '36%', t: '58%', col: 'rgba(16,185,129,0.09)', blur: 65, dur: 8 },
          { w: 150, h: 130, l: '80%', t: '62%', col: 'rgba(16,185,129,0.12)', blur: 50, dur: 13 },
        ].map((m, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: m.w, height: m.h, left: m.l, top: m.t,
              background: `radial-gradient(ellipse, ${m.col} 0%, transparent 70%)`,
              filter: `blur(${m.blur}px)`,
              animation: `floatMote ${m.dur}s ease-in-out infinite alternate`,
              animationDelay: `${i * 1.5}s`,
            }}
          />
        ))}
      </div>

      {/* ─── Cinematic Colour Grading ─── */}
      <div className="absolute inset-0 z-[2] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg,
              rgba(220, 240, 255, 0.18) 0%,
              rgba(255, 255, 255, 0.05) 20%,
              transparent 42%,
              rgba(6, 40, 22, 0.22) 70%,
              rgba(3, 24, 12, 0.78) 100%
            )`,
          }}
        />
        {/* Sun bloom left */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 16% 26%, rgba(255, 248, 200, 0.35) 0%, transparent 52%)' }} />
        {/* Right soft sky */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 84% 14%, rgba(180, 225, 255, 0.12) 0%, transparent 48%)' }} />
        {/* Bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-44" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(2, 16, 8, 0.7) 100%)' }} />
        {/* Edge vignette */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 50% 50%, transparent 52%, rgba(0,0,0,0.32) 100%)' }} />
      </div>

      {/* ─── Foreground Hero Content ─── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full py-8 md:py-0">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left Column: Typography, Split Text & Portals */}
          <div className="lg:col-span-6 space-y-6 text-left">

            {/* Top Badges Row */}
            <motion.div
              className="flex flex-wrap items-center gap-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider text-emerald-950"
                style={{
                  background: 'rgba(255, 255, 255, 0.92)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(16, 185, 129, 0.5)',
                  boxShadow: '0 4px 20px rgba(6, 78, 59, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
                }}
              >
                <Sparkles className="h-4 w-4 text-emerald-600 animate-spin" style={{ animationDuration: '6s' }} />
                {badge}
              </div>

              <LiveAlertTicker />
            </motion.div>

            {/* Brand Title with Letter Splitting Effect (High Contrast) */}
            <div className="space-y-1">
              <div className="inline-block">
                <SplitTextHeading
                  text="AapdaSetu"
                  className="text-5xl sm:text-7xl font-black"
                  delay={0.1}
                  highlightWords={['Setu']}
                  defaultColorClassName="text-slate-900 drop-shadow-[0_2px_12px_rgba(255,255,255,0.95)]"
                  highlightClassName="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(255,255,255,0.95)]"
                />
              </div>

              {/* Main Headline with Split Text Words (High Contrast & Clear) */}
              <div className="pt-2">
                <SplitTextHeading
                  text="Disaster Intelligence & Relief Ecosystem"
                  className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight"
                  delay={0.2}
                  highlightWords={['Intelligence', 'Relief']}
                  defaultColorClassName="text-slate-900 drop-shadow-[0_2px_8px_rgba(255,255,255,0.95)]"
                  highlightClassName="bg-gradient-to-r from-emerald-700 via-teal-700 to-amber-600 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(255,255,255,0.95)]"
                />
              </div>
            </div>

            {/* Luminous Subtitle Description */}
            <motion.p
              className="text-base sm:text-lg leading-relaxed font-semibold text-slate-800 max-w-xl drop-shadow-[0_1px_3px_rgba(255,255,255,0.95)]"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {description}
            </motion.p>

            {/* ─── Redesigned Bottom Action Portal Cards Container ─── */}
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
            >
              {portals.map((portal, i) => {
                const Icon = portal.icon;
                return (
                  <motion.div
                    key={portal.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + i * 0.1, type: 'spring', stiffness: 200 }}
                    whileHover={{ y: -6, scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="group"
                  >
                    <Link
                      to={portal.to}
                      className="flex flex-col justify-between p-4 sm:p-4.5 rounded-2xl transition-all h-full relative overflow-hidden shadow-lg hover:shadow-2xl"
                      style={{
                        background: portal.gradient,
                        color: portal.textColor,
                        border: `1.5px solid ${portal.borderColor}`,
                        boxShadow: `0 12px 28px -6px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.35)`,
                      }}
                    >
                      {/* Top Row: Icon & Pill Badge */}
                      <div className="flex items-center justify-between mb-2.5">
                        <div
                          className="h-9 w-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                          style={{
                            background: 'rgba(255, 255, 255, 0.22)',
                            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.4)',
                          }}
                        >
                          <Icon className="h-5 w-5" style={{ color: portal.textColor }} />
                        </div>
                        <span
                          className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-md"
                          style={{
                            background: 'rgba(0, 0, 0, 0.18)',
                            color: portal.textColor,
                          }}
                        >
                          {portal.badge}
                        </span>
                      </div>

                      {/* Content & Arrow */}
                      <div className="flex items-end justify-between">
                        <div>
                          <div className="text-base font-black leading-tight" style={{ color: portal.textColor }}>
                            {portal.label}
                          </div>
                          <div className="text-xs font-semibold opacity-95 mt-0.5" style={{ color: portal.textColor }}>
                            {portal.desc}
                          </div>
                        </div>
                        <div
                          className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ml-1.5 group-hover:translate-x-1.5 transition-transform"
                          style={{ background: 'rgba(255, 255, 255, 0.25)' }}
                        >
                          <ArrowRight className="h-3.5 w-3.5" style={{ color: portal.textColor }} />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>

            {children}

          </div>

          {/* Right Column: 3D High-Clarity Satellite Radar Map */}
          <motion.div
            className="lg:col-span-6 flex items-center justify-center relative z-10"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <Map3DCard />
          </motion.div>

        </div>
      </div>
    </div>
  );
}

export default HeroGeometric;
