import React, { useEffect, useState, useRef } from 'react';
import { motion, useSpring } from 'framer-motion';

export interface InteractiveCharacterProps {
  isTypingPassword?: boolean;
  isTypingEmail?: boolean;
  isTypingName?: boolean;
  isSuccess?: boolean;
  className?: string;
}

export const InteractiveCharacter: React.FC<InteractiveCharacterProps> = ({
  isTypingPassword = false,
  isTypingEmail = false,
  isTypingName = false,
  isSuccess = false,
  className = '',
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Springs for smooth head and eye movement
  const headRotateX = useSpring(0, { stiffness: 160, damping: 18 });
  const headRotateY = useSpring(0, { stiffness: 160, damping: 18 });
  const pupilX = useSpring(0, { stiffness: 240, damping: 20 });
  const pupilY = useSpring(0, { stiffness: 240, damping: 20 });

  // Natural Blinking Loop
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, Math.random() * 3200 + 2200);

    return () => clearInterval(blinkInterval);
  }, []);

  // Global mouse tracking for head and eye direction
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isTypingPassword) return;

      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const characterCenterX = rect.left + rect.width / 2;
      const characterCenterY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - characterCenterX) / (window.innerWidth / 2);
      const deltaY = (e.clientY - characterCenterY) / (window.innerHeight / 2);

      const clampedX = Math.max(-1, Math.min(1, deltaX));
      const clampedY = Math.max(-1, Math.min(1, deltaY));

      // If user is typing in email/name, bias focus downward slightly towards form
      const yBias = (isTypingEmail || isTypingName) ? 0.3 : 0;

      headRotateX.set((-clampedY + yBias) * 18);
      headRotateY.set(clampedX * 22);

      pupilX.set(clampedX * 6.5);
      pupilY.set((clampedY + yBias) * 5.5);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, [isTypingPassword, isTypingEmail, isTypingName, headRotateX, headRotateY, pupilX, pupilY]);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ perspective: '900px' }}
    >
      {/* ─── 3D Head Container ─── */}
      <motion.div
        className="relative w-28 h-28 flex items-center justify-center"
        style={{
          rotateX: isTypingPassword ? 15 : headRotateX,
          rotateY: isTypingPassword ? 0 : headRotateY,
          transformStyle: 'preserve-3d',
        }}
        animate={
          isSuccess
            ? { y: [0, -14, 0], rotate: [0, -8, 8, 0] }
            : isTypingName
            ? { y: [0, -4, 0, -2, 0] }
            : { y: [0, -4, 0] }
        }
        transition={{
          duration: isSuccess ? 0.6 : isTypingName ? 1.2 : 3,
          repeat: isSuccess ? 3 : Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Soft Ambient Shadow */}
        <div className="absolute -bottom-3 inset-x-4 h-3 bg-emerald-950/20 rounded-full blur-md" />

        {/* Head Shell Body */}
        <div
          className="w-24 h-24 rounded-[2.2rem] relative flex items-center justify-center p-3 overflow-hidden shadow-xl"
          style={{
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.98) 0%, rgba(240, 253, 244, 0.94) 60%, rgba(209, 250, 229, 0.96) 100%)',
            border: '2px solid rgba(16, 185, 129, 0.45)',
            boxShadow: '0 12px 28px -4px rgba(6, 78, 59, 0.2), inset 0 2px 4px rgba(255, 255, 255, 1)',
          }}
        >
          {/* Top Antenna Beacon */}
          <div className="absolute top-1.5 inset-x-0 flex justify-center">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-sm" />
            </span>
          </div>

          {/* Dark Glass Visor */}
          <div
            className="w-full h-14 rounded-2xl relative flex items-center justify-around px-2 overflow-hidden shadow-inner"
            style={{
              background: 'linear-gradient(160deg, #0F172A 0%, #064E3B 100%)',
              border: '1.5px solid rgba(16, 185, 129, 0.35)',
            }}
          >
            {/* Visor Sheen */}
            <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

            {/* Left Eye */}
            <div className="relative w-5 h-5 rounded-full bg-slate-950 flex items-center justify-center overflow-hidden border border-emerald-500/40">
              {/* Eyelid Blinking / Password Covered */}
              <motion.div
                className="absolute inset-0 bg-emerald-950 z-20"
                animate={{
                  scaleY: isTypingPassword ? 1 : isBlinking ? 1 : 0,
                }}
                transition={{ duration: 0.08 }}
                style={{ transformOrigin: 'top' }}
              />
              {/* Glowing Emerald Pupil */}
              <motion.div
                className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 shadow-[0_0_8px_#10B981]"
                style={{ x: isTypingPassword ? 0 : pupilX, y: isTypingPassword ? 0 : pupilY }}
              >
                <div className="w-1 h-1 rounded-full bg-white ml-0.5 mt-0.5" />
              </motion.div>
            </div>

            {/* Right Eye */}
            <div className="relative w-5 h-5 rounded-full bg-slate-950 flex items-center justify-center overflow-hidden border border-emerald-500/40">
              {/* Eyelid Blinking / Password Covered */}
              <motion.div
                className="absolute inset-0 bg-emerald-950 z-20"
                animate={{
                  scaleY: isTypingPassword ? 1 : isBlinking ? 1 : 0,
                }}
                transition={{ duration: 0.08 }}
                style={{ transformOrigin: 'top' }}
              />
              {/* Glowing Emerald Pupil */}
              <motion.div
                className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-300 shadow-[0_0_8px_#10B981]"
                style={{ x: isTypingPassword ? 0 : pupilX, y: isTypingPassword ? 0 : pupilY }}
              >
                <div className="w-1 h-1 rounded-full bg-white ml-0.5 mt-0.5" />
              </motion.div>
            </div>
          </div>

          {/* Cute Dynamic Status Pill / Smile */}
          <div className="absolute bottom-2 inset-x-0 flex justify-center">
            {isTypingPassword ? (
              <span className="text-[8px] font-mono font-black text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-full border border-amber-300 shadow-sm">
                SHIELD ACTIVE
              </span>
            ) : isTypingEmail ? (
              <span className="text-[8px] font-mono font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded-full border border-emerald-300 shadow-sm animate-pulse">
                ATTENTIVE
              </span>
            ) : isTypingName ? (
              <span className="text-[8px] font-mono font-black text-teal-800 bg-teal-100 px-1.5 py-0.2 rounded-full border border-teal-300 shadow-sm">
                HELLO! 👋
              </span>
            ) : isSuccess ? (
              <span className="text-[8px] font-mono font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full border border-emerald-400 shadow-sm">
                SUCCESS! 🎉
              </span>
            ) : (
              <div className="w-4 h-1 rounded-full bg-emerald-400 shadow-sm" />
            )}
          </div>
        </div>

        {/* Dynamic Hands (Cover eyes when typing password!) */}
        <motion.div
          className="absolute z-30 rounded-full bg-emerald-400 border-2 border-white shadow-md"
          animate={
            isTypingPassword
              ? { x: 18, y: -2, rotate: 30, width: 18, height: 18 }
              : { x: 0, y: 0, rotate: 0, width: 12, height: 20, left: -4, top: 32 }
          }
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
        <motion.div
          className="absolute z-30 rounded-full bg-emerald-400 border-2 border-white shadow-md"
          animate={
            isTypingPassword
              ? { x: -18, y: -2, rotate: -30, width: 18, height: 18 }
              : { x: 0, y: 0, rotate: 0, width: 12, height: 20, right: -4, top: 32 }
          }
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
      </motion.div>
    </div>
  );
};

export default InteractiveCharacter;
