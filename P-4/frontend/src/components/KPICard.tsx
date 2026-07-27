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
  accentColor?: string; // e.g., 'text-green-600 bg-green-50'
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  accentColor = 'text-green-600 bg-green-50 border-green-100'
}) => {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm transition-all duration-300 hover:shadow-md"
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
        </div>
        <div className={`p-2.5 rounded-lg border ${accentColor}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className={`text-xs font-semibold ${trend.isPositive ? 'text-green-600' : 'text-rose-600'}`}>
            {trend.value}
          </span>
          <span className="text-xs text-slate-400 font-medium">from last cycle</span>
        </div>
      )}
    </motion.div>
  );
};

export default KPICard;
