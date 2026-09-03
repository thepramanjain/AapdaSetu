import React from 'react';
import { cn } from '../utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-gradient-to-br from-white via-slate-50/80 to-slate-100/60 border border-slate-200/90 rounded-2xl p-6 shadow-[0_6px_24px_-6px_rgba(0,0,0,0.06)] backdrop-blur-sm',
        hoverable && 'hover:shadow-[0_12px_32px_-8px_rgba(0,0,0,0.12)] hover:border-slate-300/90 hover:-translate-y-0.5 transition-all cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
