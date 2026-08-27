import React from 'react';
import { cn } from '../utils';

interface StatusBadgeProps {
  type: 'severity' | 'report' | 'health' | 'budget' | 'node';
  value: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value = '', className }) => {
  const normalizedValue = (value || '').toLowerCase();

  const getBadgeStyle = () => {
    switch (type) {
      case 'severity':
        if (normalizedValue === 'critical') {
          return {
            bg: 'rgba(239, 68, 68, 0.12)',
            text: '#DC2626',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            dot: '#EF4444',
            animate: true,
          };
        }
        if (normalizedValue === 'high') {
          return {
            bg: 'rgba(249, 115, 22, 0.12)',
            text: '#EA580C',
            border: '1px solid rgba(249, 115, 22, 0.35)',
            dot: '#F97316',
            animate: false,
          };
        }
        if (normalizedValue === 'medium') {
          return {
            bg: 'rgba(234, 179, 8, 0.15)',
            text: '#CA8A04',
            border: '1px solid rgba(234, 179, 8, 0.35)',
            dot: '#EAB308',
            animate: false,
          };
        }
        return {
          bg: 'rgba(16, 185, 129, 0.12)',
          text: '#059669',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          dot: '#10B981',
          animate: false,
        };

      case 'health':
        if (normalizedValue === 'healthy') {
          return {
            bg: 'rgba(16, 185, 129, 0.12)',
            text: '#059669',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            dot: '#10B981',
            animate: false,
          };
        }
        return {
          bg: 'rgba(239, 68, 68, 0.12)',
          text: '#DC2626',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          dot: '#EF4444',
          animate: true,
        };

      case 'budget':
        if (normalizedValue === 'approved' || normalizedValue === 'disbursed') {
          return {
            bg: 'rgba(16, 185, 129, 0.12)',
            text: '#059669',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            dot: '#10B981',
            animate: false,
          };
        }
        return {
          bg: 'rgba(249, 115, 22, 0.12)',
          text: '#EA580C',
          border: '1px solid rgba(249, 115, 22, 0.35)',
          dot: '#F97316',
          animate: true,
        };

      case 'report':
      default:
        if (normalizedValue === 'published' || normalizedValue === 'live') {
          return {
            bg: 'rgba(16, 185, 129, 0.12)',
            text: '#059669',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            dot: '#10B981',
            animate: false,
          };
        }
        if (normalizedValue === 'preparedness') {
          return {
            bg: 'rgba(234, 179, 8, 0.15)',
            text: '#CA8A04',
            border: '1px solid rgba(234, 179, 8, 0.35)',
            dot: '#EAB308',
            animate: false,
          };
        }
        return {
          bg: 'rgba(100, 116, 139, 0.12)',
          text: '#475569',
          border: '1px solid rgba(100, 116, 139, 0.3)',
          dot: '#64748B',
          animate: false,
        };
    }
  };

  const style = getBadgeStyle();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider select-none",
        className
      )}
      style={{
        backgroundColor: style.bg,
        color: style.text,
        border: style.border,
        boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.6)',
      }}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full shrink-0", style.animate && "animate-ping")}
        style={{ backgroundColor: style.dot, boxShadow: `0 0 6px ${style.dot}` }}
      />
      <span>{value}</span>
    </span>
  );
};

export default StatusBadge;
