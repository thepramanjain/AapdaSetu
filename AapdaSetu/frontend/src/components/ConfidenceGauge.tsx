import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';

interface ConfidenceGaugeProps {
  confidence: number;
  label?: string;
  size?: number;
  className?: string;
}

export const ConfidenceGauge: React.FC<ConfidenceGaugeProps> = ({
  confidence,
  label = 'VALIDATED',
  size = 140,
  className
}) => {
  const radialData = [
    {
      name: 'Confidence',
      value: confidence,
      fill: confidence > 90 ? '#10b981' : '#3b82f6',
    }
  ];

  return (
    <div className="w-full relative flex items-center justify-center select-none" style={{ height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart 
          cx="50%" 
          cy="50%" 
          innerRadius="75%" 
          outerRadius="100%" 
          barSize={10} 
          data={radialData}
          startAngle={220}
          endAngle={-40}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background
            dataKey="value"
            cornerRadius={5}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      
      {/* Centered dial labels */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-3">
        <span className="text-3xl font-heading font-black text-white">
          {confidence.toFixed(1)}%
        </span>
        <span className="text-[9px] text-secondary font-mono tracking-widest font-bold uppercase mt-0.5 animate-pulse">
          {label}
        </span>
      </div>
    </div>
  );
};
export default ConfidenceGauge;
