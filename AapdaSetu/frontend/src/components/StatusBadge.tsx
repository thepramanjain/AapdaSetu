import React from 'react';
import { cn } from '../utils';

interface StatusBadgeProps {
  type: 'severity' | 'report' | 'health' | 'budget' | 'node';
  value: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value = '', className }) => {
  const normalizedValue = (value || '').toLowerCase();

  const getStyles = () => {
    switch (type) {
      case 'severity':
        if (normalizedValue === 'critical') {
          return 'bg-danger/10 text-danger border-danger/30 font-bold animate-pulse';
        }
        if (normalizedValue === 'high') {
          return 'bg-warning/10 text-warning border-warning/30';
        }
        if (normalizedValue === 'medium') {
          return 'bg-accent/10 text-accent border-accent/30';
        }
        return 'bg-primary/10 text-primary border-primary/30';

      case 'health':
        if (normalizedValue === 'healthy') {
          return 'bg-secondary/15 text-secondary border-secondary/30';
        }
        if (normalizedValue === 'warning') {
          return 'bg-warning/15 text-warning border-warning/30 animate-pulse';
        }
        return 'bg-danger/15 text-danger border-danger/30';

      case 'budget':
        if (normalizedValue === 'approved') {
          return 'bg-secondary/10 text-secondary border-secondary/30';
        }
        if (normalizedValue === 'pending') {
          return 'bg-warning/10 text-warning border-warning/30 animate-pulse';
        }
        return 'bg-danger/10 text-danger border-danger/30';

      case 'node':
        if (normalizedValue === 'completed') {
          return 'bg-secondary/10 text-secondary border-secondary/40';
        }
        if (normalizedValue === 'running') {
          return 'bg-primary/20 text-primary border-primary/50 animate-pulse font-medium';
        }
        return 'bg-gray-800 text-gray-400 border-gray-700';

      case 'report':
      default:
        if (normalizedValue === 'preparedness') return 'bg-amber-100 text-amber-800 border-amber-300 font-medium';
        if (normalizedValue === 'live' || normalizedValue === 'published') return 'bg-green-100 text-green-800 border-green-300 font-medium';
        if (normalizedValue === 'completed') return 'bg-secondary/10 text-secondary border-secondary/20';
        if (normalizedValue === 'dispatched') return 'bg-primary/10 text-primary border-primary/20';
        if (normalizedValue === 'assigned') return 'bg-accent/10 text-accent border-accent/20';
        if (normalizedValue === 'verified') return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDotColor = () => {
    if (normalizedValue === 'critical' || normalizedValue === 'offline') return 'bg-danger';
    if (normalizedValue === 'high' || normalizedValue === 'warning' || normalizedValue === 'pending' || normalizedValue === 'preparedness') return 'bg-warning';
    if (normalizedValue === 'healthy' || normalizedValue === 'completed' || normalizedValue === 'approved' || normalizedValue === 'live' || normalizedValue === 'published') return 'bg-success-dark';
    if (normalizedValue === 'running' || normalizedValue === 'dispatched') return 'bg-primary';
    return 'bg-gray-400';
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border font-mono tracking-wide',
        getStyles(),
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', getDotColor(), ['critical', 'warning', 'pending', 'running'].includes(normalizedValue) && 'animate-ping')} />
      {(value || '').toUpperCase()}
    </span>
  );
};
