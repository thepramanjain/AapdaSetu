import React from 'react';
import { Card } from './Card';

export const SkeletonCard: React.FC = () => {
  return (
    <Card className="p-6 animate-pulse select-none flex flex-col justify-between h-[180px]">
      <div>
        <div className="flex justify-between items-center mb-4">
          <div className="h-4 bg-white/10 rounded w-16" />
          <div className="h-4 bg-white/10 rounded w-10" />
        </div>
        <div className="h-6 bg-white/10 rounded w-3/4 mb-3" />
        <div className="h-3 bg-white/10 rounded w-5/6 mb-2" />
        <div className="h-3 bg-white/10 rounded w-1/2" />
      </div>
      <div className="h-8 bg-white/10 rounded w-full mt-4" />
    </Card>
  );
};
