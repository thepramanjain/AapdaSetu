import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Card } from './Card';
import { AnimatedCounter } from './AnimatedCounter';
import { cn } from '../utils';

interface MetricCardProps {
  title: string;
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  icon: LucideIcon;
  iconColor?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  description: string;
  className?: string;
  formatter?: (val: number) => string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
  icon: Icon,
  iconColor = 'blue',
  description,
  className,
  formatter
}) => {
  const colors = {
    blue: 'text-primary bg-blue-50 border-blue-100',
    green: 'text-secondary bg-emerald-50 border-emerald-100',
    red: 'text-danger bg-red-50 border-red-100',
    yellow: 'text-warning bg-amber-50 border-amber-100',
    purple: 'text-accent bg-indigo-50 border-indigo-100'
  };

  return (
    <Card className={cn("p-6 flex flex-col justify-between h-[150px] relative overflow-hidden", className)}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-bold">
          {title}
        </span>
        <div className={cn("w-7 h-7 rounded border flex items-center justify-center", colors[iconColor])}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div>
        <h3 className="text-2xl md:text-3xl font-heading font-extrabold text-slate-900 leading-none tracking-tight">
          <AnimatedCounter 
            value={value} 
            decimals={decimals} 
            prefix={prefix} 
            suffix={suffix} 
            formatter={formatter}
          />
        </h3>
        <p className="text-[9px] text-slate-500 mt-2 font-mono uppercase tracking-wide">
          {description}
        </p>
      </div>
    </Card>
  );
};
