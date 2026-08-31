import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export interface MaskedHeadingProps {
  text: string;
  mediaType?: 'video' | 'image';
  src?: string;
  poster?: string;
  fillScale?: number;
  parallax?: number;
  reveal?: 'rise' | 'fade' | 'slide';
  trigger?: 'view' | 'scroll';
  drift?: number;
  brightness?: number;
  saturation?: number;
  grayscale?: boolean;
  duration?: number;
  stagger?: number;
  align?: 'center' | 'left' | 'right';
  weight?: number;
  tracking?: number;
  lineHeight?: number;
  textScale?: number;
  className?: string;
}

export const MaskedHeading: React.FC<MaskedHeadingProps> = ({
  text = 'Disaster Intelligence & Relief Ecosystem',
  parallax = 20,
  reveal = 'rise',
  trigger = 'view',
  drift = 12,
  duration = 0.9,
  stagger = 0.06,
  align = 'left',
  weight = 900,
  tracking = -0.02,
  lineHeight = 1.08,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const parallaxY = useTransform(scrollYProgress, [0, 1], [-parallax, parallax]);
  const driftX = useTransform(scrollYProgress, [0, 1], [-drift, drift]);

  const words = text.split(' ');

  const alignmentClass =
    align === 'center'
      ? 'text-center justify-center'
      : align === 'right'
      ? 'text-right justify-end'
      : 'text-left justify-start';

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden py-2 ${className}`}
    >
      <motion.div
        className={`flex flex-wrap items-center gap-x-[0.3em] ${alignmentClass}`}
        style={{
          lineHeight,
          letterSpacing: `${tracking}em`,
          fontWeight: weight,
          y: parallaxY,
          x: driftX,
        }}
      >
        {words.map((word, wordIdx) => (
          <span key={wordIdx} className="inline-block overflow-hidden py-1">
            <motion.span
              className="inline-block font-display font-black leading-none py-1 select-none"
              style={{
                background: wordIdx % 2 === 0
                  ? 'linear-gradient(135deg, #0F172A 0%, #065F46 60%, #059669 100%)'
                  : 'linear-gradient(135deg, #B45309 0%, #D97706 50%, #F59E0B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 2px 8px rgba(16, 185, 129, 0.15))',
              }}
              initial={
                reveal === 'rise'
                  ? { y: '100%', opacity: 0 }
                  : reveal === 'slide'
                  ? { x: '-40%', opacity: 0 }
                  : { opacity: 0 }
              }
              whileInView={
                trigger === 'view'
                  ? { y: '0%', x: '0%', opacity: 1 }
                  : undefined
              }
              viewport={{ once: true, margin: '-20px' }}
              transition={{
                duration,
                delay: wordIdx * stagger,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {word}
            </motion.span>
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default MaskedHeading;
