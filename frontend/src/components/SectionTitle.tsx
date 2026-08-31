import React from 'react';
import { cn } from '../utils';

interface SectionTitleProps {
  subtitle: string;
  title: string;
  description?: string;
  alignment?: 'left' | 'center';
  className?: string;
}

export const SectionTitle: React.FC<SectionTitleProps> = ({
  subtitle,
  title,
  description,
  alignment = 'left',
  className
}) => {
  return (
    <div className={cn(
      "flex flex-col mb-8 relative z-10",
      alignment === 'center' && "text-center items-center",
      className
    )}>
      <span className="text-xs font-mono font-bold text-primary tracking-widest uppercase block mb-2.5">
        {subtitle}
      </span>
      <h2 className="text-2xl md:text-4xl font-heading font-black text-white tracking-tight leading-tight">
        {title}
      </h2>
      {description && (
        <p className={cn(
          "text-gray-400 text-xs sm:text-sm mt-2 max-w-2xl",
          alignment === 'center' && "mx-auto"
        )}>
          {description}
        </p>
      )}
    </div>
  );
};
