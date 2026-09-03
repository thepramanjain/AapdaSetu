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
        background: 'linear-gradient(155deg, #FFFFFF 0%, #F8FAFC 55%, #EDF2F7 100%)',
        boxShadow: '0 14px 35px -10px rgba(15, 23, 42, 0.08), inset 0 2px 4px rgba(255, 255, 255, 0.95)',
        border: '1.5px solid rgba(226, 232, 240, 0.8)',
      }}
    >
      <div className="flex justify-between items-start gap-4">
        <div>
          <p className="text-[11px] font-mono font-black uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="mt-2.5 text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight leading-none">
            {value}
          </h3>
        </div>

        {/* Floating Gradient Icon Box */}
        <div
          className="h-13 w-13 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm"
          style={{
            background: `linear-gradient(135deg, ${accentColor}25 0%, ${accentColor}10 100%)`,
            border: `1px solid ${accentColor}40`,
            boxShadow: `0 4px 14px ${accentColor}25`,
          }}
        >
          <Icon className="h-6 w-6 transition-transform duration-300 group-hover:rotate-6" style={{ color: accentColor }} />
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
