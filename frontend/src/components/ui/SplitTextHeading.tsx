import React from 'react';
import { motion } from 'framer-motion';

export interface SplitTextHeadingProps {
  text: string;
  className?: string;
  delay?: number;
  highlightWords?: string[];
  highlightClassName?: string;
  defaultColorClassName?: string;
}

export const SplitTextHeading: React.FC<SplitTextHeadingProps> = ({
  text,
  className = '',
  delay = 0,
  highlightWords = ['Relief', 'Intelligence', 'Setu', 'Ecosystem'],
  highlightClassName = 'bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(255,255,255,0.8)]',
  defaultColorClassName = 'text-slate-900 drop-shadow-[0_2px_8px_rgba(255,255,255,0.9)]',
}) => {
  const words = text.split(' ');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.035,
        delayChildren: delay,
      },
    },
  };

  const letterVariants = {
    hidden: {
      opacity: 0,
      y: 28,
      rotateX: -45,
      filter: 'blur(4px)',
    },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      filter: 'blur(0px)',
      transition: {
        type: 'spring',
        damping: 15,
        stiffness: 160,
      },
    },
  };

  return (
    <motion.h1
      className={`font-display font-black tracking-tight select-none flex flex-wrap gap-x-[0.28em] gap-y-[0.1em] ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, wIdx) => {
        const isHighlight = highlightWords.some(
          (hw) => word.toLowerCase().includes(hw.toLowerCase())
        );

        return (
          <span
            key={wIdx}
            className={`inline-flex whitespace-nowrap overflow-visible ${
              isHighlight ? highlightClassName : defaultColorClassName
            }`}
          >
            {word.split('').map((char, cIdx) => (
              <motion.span
                key={cIdx}
                variants={letterVariants}
                className="inline-block transform-gpu"
                whileHover={{
                  scale: 1.15,
                  y: -3,
                  transition: { duration: 0.15 },
                }}
              >
                {char}
              </motion.span>
            ))}
          </span>
        );
      })}
    </motion.h1>
  );
};

export default SplitTextHeading;
