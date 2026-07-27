import React, { useEffect, useState } from 'react';
import { animate } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  formatter?: (val: number) => string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1.5,
  prefix = '',
  suffix = '',
  decimals = 0,
  formatter
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => setCount(latest)
    });
    return () => controls.stop();
  }, [value, duration]);

  const displayValue = formatter 
    ? formatter(count)
    : count.toFixed(decimals);

  return (
    <span>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
};
