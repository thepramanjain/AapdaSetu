import React from 'react';

export const AnimatedGridBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 select-none">
      <div className="absolute inset-0 grid-lines opacity-60" />
      <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/[0.03] blur-[100px]" />
      <div className="absolute -top-20 right-1/4 h-[400px] w-[400px] rounded-full bg-teal-500/[0.04] blur-[100px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50" />
    </div>
  );
};
