import { useState, useEffect, useRef } from 'react';

/**
 * Hook to smoothly interpolate a numerical value over time with easeOutExpo
 */
export function useAnimatedCounter(targetValue, durationMs = 800) {
  const [displayValue, setDisplayValue] = useState(targetValue || 0);
  const displayValRef = useRef(displayValue);

  useEffect(() => {
    displayValRef.current = displayValue;
  }, [displayValue]);

  useEffect(() => {
    const startVal = displayValRef.current;
    const endVal = Number(targetValue) || 0;
    if (startVal === endVal) return;

    let startTime = null;
    let animationFrame = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / durationMs, 1);
      // easeOutExpo curve
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(startVal + (endVal - startVal) * ease);
      setDisplayValue(current);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [targetValue, durationMs]);

  return displayValue;
}

export default useAnimatedCounter;
