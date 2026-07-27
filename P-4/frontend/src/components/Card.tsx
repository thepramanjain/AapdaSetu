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
        'bg-white border border-slate-200 rounded-xl p-6 shadow-sm',
        hoverable && 'hover:shadow-md hover:border-slate-300 transition-all cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
