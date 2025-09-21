"use client"

import { useMemo } from "react";

type AudioVisualizerProps = {
  waveform: number[];
  className?: string;
};

export function AudioVisualizer({ waveform, className }: AudioVisualizerProps) {
  const maxBarHeight = 100; // Max height in pixels

  const bars = useMemo(() => {
    return waveform.map((value, index) => {
      const barHeight = Math.max(2, value * maxBarHeight);
      return {
        key: index,
        height: barHeight,
        y: (maxBarHeight - barHeight) / 2,
      };
    });
  }, [waveform]);

  return (
    <div className={className}>
      <svg width="100%" height={maxBarHeight} viewBox={`0 0 ${bars.length * 6} ${maxBarHeight}`}>
        {bars.map((bar, index) => (
          <rect
            key={bar.key}
            x={index * 6}
            y={bar.y}
            width="4"
            height={bar.height}
            rx="2"
            className="fill-primary transition-all duration-100 ease-in-out"
          />
        ))}
      </svg>
    </div>
  );
}
