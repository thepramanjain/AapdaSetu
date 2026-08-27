import React from 'react';
import { motion } from 'framer-motion';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  accentColor?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  accentColor = '#10B981',
}) => {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.03 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="p-7 rounded-3xl flex flex-col justify-between relative overflow-hidden transition-all select-none group cursor-pointer"
      style={{
        backgroundColor: '#E4E9F2',
        boxShadow: '10px 10px 24px #b8c4d9, -10px -10px 24px #ffffff',
        border: '1.5px solid rgba(255, 255, 255, 0.85)',
      }}
    >
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="text-[11px] font-mono font-black uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="mt-2.5 text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight leading-none">
            {value}
          </h3>
        </div>

        {/* Neumorphic Inset Debossed Icon Box with Hover Glow */}
        <div
          className="h-13 w-13 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm"
          style={{
            backgroundColor: '#E4E9F2',
            boxShadow: 'inset 4px 4px 8px #b8c4d9, inset -4px -4px 8px #ffffff',
          }}
        >
          <Icon className="h-6 w-6 text-emerald-700 transition-transform duration-300 group-hover:rotate-6" style={{ color: accentColor }} />
        </div>
      </div>

      {trend && (
        <div className="mt-5 pt-3.5 border-t border-slate-300/70 flex items-center justify-between text-xs font-mono">
          <span
            className={`font-black flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
              trend.isPositive ? 'text-emerald-800 bg-emerald-500/15' : 'text-rose-700 bg-rose-500/15'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
          <span className="text-[11px] text-slate-500 font-bold">Live Stream Cycle</span>
        </div>
      )}
    </motion.div>
  );
};

export default KPICard;
