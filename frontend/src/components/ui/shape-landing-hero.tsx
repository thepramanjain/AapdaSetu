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
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1.5px solid rgba(16, 185, 129, 0.5)',
          boxShadow: '0 6px 20px rgba(6, 78, 59, 0.16), inset 0 1px 0 rgba(255, 255, 255, 1)',
          color: '#064E3B',
          backdropFilter: 'blur(16px)',
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

// ─── Aceternity UI Text Animation with Pulsing Cursor Pill (from screenshot) ─────
function HeroTypewriterText() {
  const words = [
    "Relief Ecosystem",
    "Autonomous AI",
    "On-Chain Grants",
    "90s Drone Triage",
    "National Defense",
  ];

  const [wordIdx, setWordIdx] = useState(0);
  const [subIdx, setSubIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIdx];

    if (!isDeleting && subIdx === currentWord.length) {
      const timeout = setTimeout(() => setIsDeleting(true), 1800);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && subIdx === 0) {
      setIsDeleting(false);
      setWordIdx((prev) => (prev + 1) % words.length);
      return;
    }

    const speed = isDeleting ? 45 : 90;
    const timeout = setTimeout(() => {
      setSubIdx((prev) => prev + (isDeleting ? -1 : 1));
    }, speed);

    return () => clearTimeout(timeout);
  }, [subIdx, isDeleting, wordIdx]);

  return (
    <span className="inline-flex items-center flex-wrap">
      <span className="bg-gradient-to-br from-black via-slate-800 to-black bg-clip-text text-transparent">
        {words[wordIdx].substring(0, subIdx)}
      </span>
      {/* Animated Cursor Pill (Exact Aceternity UI Style from Screenshot) */}
      <span className="inline-block w-2.5 h-6 sm:w-3 sm:h-8 md:w-3.5 md:h-10 bg-rose-500 rounded-sm ml-1.5 align-middle animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.6)]" />
    </span>
  );
}

// ─── Large Satellite Map Card (No 3D, Clean Professional) ─────────────
function Map3DCard() {
  const [selectedState, setSelectedState] = useState<string | null>(null);

  return (
    <div className="w-full max-w-[640px] relative select-none">
      <div
        className="p-5 sm:p-6 flex flex-col justify-between overflow-hidden rounded-[2rem] relative"
        style={{
          background: 'linear-gradient(165deg, rgba(255, 255, 255, 0.97) 0%, rgba(246, 252, 249, 0.96) 50%, rgba(235, 247, 241, 0.99) 100%)',
          boxShadow: '0 20px 60px -12px rgba(6, 78, 59, 0.2), 0 0 0 1.5px rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* Glowing Top Gradient Accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-500 rounded-t-[2rem]" />

        {/* Center Interactive Map Component */}
        <div className="relative w-full h-[420px] sm:h-[500px] flex items-center justify-center p-1 my-auto">
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

      {/* Floating 24/7 Badge */}
      <div
        className="absolute -bottom-4 -left-4 z-30 rounded-2xl p-3.5 min-w-[200px]"
        style={{
          background: 'rgba(255, 255, 255, 0.97)',
          border: '1.5px solid rgba(16, 185, 129, 0.45)',
          boxShadow: '0 14px 34px rgba(6, 78, 59, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)',
        }}
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
      </div>
    </div>
  );
}

// ─── Portals List ──────────────────────────────────────────────────────
const portals = [
  {
    label: 'NGO Portal',
    desc: 'Coordinate relief on ground',
    badge: 'ACTIVE RELIEF',
    icon: HeartHandshake,
    to: '/ngo/dashboard',
    accentColor: '#059669',
    badgeBg: 'rgba(16, 185, 129, 0.15)',
    badgeText: '#065F46',
    hoverGlow: 'rgba(16, 185, 129, 0.25)',
    borderColor: 'rgba(16, 185, 129, 0.45)',
    gradientHover: 'linear-gradient(135deg, rgba(209,250,229,0.95) 0%, rgba(255,255,255,0.98) 100%)',
  },
  {
    label: 'Gov Portal',
    desc: 'Command & dispatch center',
    badge: 'COMMAND NODE',
    icon: ShieldAlert,
    to: '/gov/dashboard',
    accentColor: '#2563EB',
    badgeBg: 'rgba(37, 99, 235, 0.15)',
    badgeText: '#1E3A8A',
    hoverGlow: 'rgba(37, 99, 235, 0.25)',
    borderColor: 'rgba(59, 130, 246, 0.45)',
    gradientHover: 'linear-gradient(135deg, rgba(219,234,254,0.95) 0%, rgba(255,255,255,0.98) 100%)',
  },
  {
    label: 'Donor / Volunteer',
    desc: 'Direct giving & field relief',
    badge: 'ON-CHAIN',
    icon: Zap,
    to: '/donor',
    accentColor: '#D97706',
    badgeBg: 'rgba(217, 119, 6, 0.15)',
    badgeText: '#78350F',
    hoverGlow: 'rgba(245, 158, 11, 0.25)',
    borderColor: 'rgba(245, 158, 11, 0.45)',
    gradientHover: 'linear-gradient(135deg, rgba(254,243,199,0.95) 0%, rgba(255,255,255,0.98) 100%)',
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
      className="relative min-h-[100svh] w-full flex items-center overflow-hidden pt-20 pb-16"
    >
      {/* ─── VIDEO BACKGROUND ─── */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0"
        style={{ transform: 'scale(1.03)' }}
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
          }}
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260815_030633_ddbe5946-3728-4dc9-ad0a-2e81e5682c69.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      {/* ─── Static Atmospheric Haze ─── */}
      <div className="absolute inset-0 pointer-events-none z-[1] overflow-hidden">
        {[
          { w: 380, h: 260, l: '4%', t: '8%', col: 'rgba(255,255,255,0.08)', blur: 80 },
          { w: 280, h: 200, l: '62%', t: '4%', col: 'rgba(255,255,255,0.06)', blur: 60 },
          { w: 200, h: 170, l: '36%', t: '58%', col: 'rgba(16,185,129,0.07)', blur: 65 },
        ].map((m, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: m.w, height: m.h, left: m.l, top: m.t,
              background: `radial-gradient(ellipse, ${m.col} 0%, transparent 70%)`,
              filter: `blur(${m.blur}px)`,
            }}
          />
        ))}
      </div>

      {/* ─── Cinematic Colour Grading (Soft Contrast Overlay) ─── */}
      <div className="absolute inset-0 z-[2] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg,
              rgba(255, 255, 255, 0.25) 0%,
              rgba(255, 255, 255, 0.12) 25%,
              transparent 50%,
              rgba(6, 40, 22, 0.25) 75%,
              rgba(3, 24, 12, 0.75) 100%
            )`,
          }}
        />
        <div className="absolute bottom-0 inset-x-0 h-44" style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(2, 16, 8, 0.7) 100%)' }} />
      </div>

      {/* ─── Foreground Hero Content ─── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 w-full py-8 md:py-0">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">

          {/* Left Column */}
          <div className="lg:col-span-6 space-y-5 text-left">

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
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(16px)',
                  border: '1.5px solid rgba(16, 185, 129, 0.5)',
                  boxShadow: '0 6px 20px rgba(6, 78, 59, 0.16), inset 0 1px 0 rgba(255, 255, 255, 1)',
                }}
              >
                <Sparkles className="h-4 w-4 text-emerald-600 animate-spin" style={{ animationDuration: '6s' }} />
                {badge}
              </div>

              <LiveAlertTicker />
            </motion.div>

            {/* Headline - BOLD HIGH CONTRAST */}
            <div className="space-y-2">
              <div className="inline-block">
                <SplitTextHeading
                  text="AapdaSetu"
                  className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight font-display"
                  delay={0.1}
                  highlightWords={['Setu', 'AapdaSetu']}
                  defaultColorClassName="bg-gradient-to-b from-slate-950 via-slate-900 to-black bg-clip-text text-transparent drop-shadow-[0_2px_16px_rgba(255,255,255,0.98)]"
                  highlightClassName="bg-gradient-to-r from-black via-[#0F172A] to-black bg-clip-text text-transparent drop-shadow-[0_2px_16px_rgba(255,255,255,0.98)]"
                />
              </div>

              <div className="pt-1">
                <SplitTextHeading
                  text="Disaster Intelligence & Relief Ecosystem"
                  className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight font-display"
                  delay={0.25}
                  highlightWords={['Intelligence', 'Relief', 'Ecosystem']}
                  defaultColorClassName="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(255,255,255,0.98)]"
                  highlightClassName="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(255,255,255,0.98)]"
                />
              </div>
            </div>

            {/* Description - HIGH CONTRAST READABLE */}
            <motion.p
              className="text-sm sm:text-base leading-relaxed font-bold text-slate-900 max-w-lg drop-shadow-[0_1px_6px_rgba(255,255,255,0.98)]"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {description}
            </motion.p>

            {/* ─── 3 PREMIUM CRISP HIGH-CONTRAST PORTAL CARDS ─── */}
            <div className="grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-3 gap-3 pt-2 select-none w-full max-w-lg">
              {portals.map((portal, i) => {
                const Icon = portal.icon;
                return (
                  <motion.div
                    key={portal.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -3, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ delay: 0.55 + i * 0.08, type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <Link
                      to={portal.to}
                      className="portal-card group flex flex-col gap-2 p-3.5 sm:p-4 rounded-2xl w-full relative overflow-hidden transition-all duration-300"
                      style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        border: `1.5px solid ${portal.borderColor}`,
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 1)',
                        '--portal-hover-bg': portal.gradientHover,
                        '--portal-accent': portal.accentColor,
                      } as React.CSSProperties}
                    >
                      {/* Icon + Badge row */}
                      <div className="flex items-center justify-between relative z-10">
                        <div
                          className="h-8 w-8 rounded-xl flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform duration-300"
                          style={{ background: portal.badgeBg, border: `1px solid ${portal.borderColor}` }}
                        >
                          <Icon className="h-4.5 w-4.5" style={{ color: portal.accentColor }} />
                        </div>
                        <span
                          className="text-[8px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded-md"
                          style={{ background: portal.badgeBg, color: portal.badgeText }}
                        >
                          {portal.badge}
                        </span>
                      </div>
                      {/* Label + Desc + Arrow */}
                      <div className="flex items-end justify-between gap-1 mt-0.5 relative z-10">
                        <div className="min-w-0">
                          <div className="text-[13px] sm:text-sm font-black leading-tight truncate text-slate-900">
                            {portal.label}
                          </div>
                          <div className="text-[10px] font-semibold leading-tight truncate text-slate-500 mt-0.5">
                            {portal.desc}
                          </div>
                        </div>
                        <ArrowRight
                          className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                          style={{ color: portal.accentColor }}
                        />
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {children}

          </div>

          {/* Right Column: Map */}
          <motion.div
            className="lg:col-span-6 flex items-center justify-center relative z-10 mt-8 lg:mt-0"
            initial={{ opacity: 0, scale: 0.95 }}
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
