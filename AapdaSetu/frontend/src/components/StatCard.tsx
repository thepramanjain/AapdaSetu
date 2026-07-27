import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface CounterProps {
  value: number;
  suffix?: string;
  duration?: number;
}

const Counter: React.FC<CounterProps> = ({ value, suffix = '', duration = 1.8 }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let startTime: number | null = null;
    const startValue = 0;
    const endValue = value;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeProgress = progress * (2 - progress);
      const currentValue = startValue + easeProgress * (endValue - startValue);
      setCount(currentValue);

      if (progress < 1) {
        window.requestAnimationFrame(animate);
      }
    };

    window.requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  const formatNumber = (num: number) => {
    if (value >= 1000) {
      return Math.floor(num).toLocaleString('en-IN');
    }
    return num.toFixed(value % 1 === 0 ? 0 : 1);
  };

  return (
    <span ref={ref} className="tabular-nums">
      {formatNumber(count)}
      {suffix}
    </span>
  );
};

interface StatCardProps {
  icon: React.ComponentType<any>;
  label: string;
  value: number;
  suffix?: string;
  prefix?: string;
  accent?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  suffix = '',
  prefix = '',
  accent = 'text-emerald-500'
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-xl p-5 border border-slate-200 shadow-card hover:shadow-card-hover transition-shadow relative overflow-hidden"
    >
      <div className={`absolute -top-6 -right-6 h-24 w-24 rounded-full blur-2xl opacity-10 bg-current ${accent}`} />
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500 font-medium">
        <Icon className={`h-4 w-4 ${accent}`} />
        {label}
      </div>
      <div className="mt-3 text-3xl font-display font-bold tabular-nums text-slate-900">
        {prefix}
        <Counter value={value} suffix={suffix} />
      </div>
    </motion.div>
  );
};

export default StatCard;
