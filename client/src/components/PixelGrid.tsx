import React from 'react';

interface PixelGridProps {
  title: string;
  type: 'ndbi' | 'ndvi';
  score: number;
}

export function PixelGrid({ title, type, score }: PixelGridProps) {
  const rows = 8;
  const cols = 8;
  const total = rows * cols;
  
  // Calculate how many pixels should represent the 'active' state based on score
  // If score is 0.5, half are active.
  // Map NDBI (-1 to 1) to (0 to 1) roughly for visual, NDVI (-1 to 1)
  const normalizedScore = (score + 1) / 2; 
  const activeCount = Math.floor(total * normalizedScore);

  const baseColor = type === 'ndvi' ? 'bg-green-100' : 'bg-slate-100';
  const activeColor = type === 'ndvi' ? 'bg-green-600' : 'bg-purple-600';

  const pixels = Array.from({ length: total }).map((_, i) => {
    // Randomly distribute the active pixels for an organic look
    const isActive = Math.random() < normalizedScore;
    return (
      <div 
        key={i} 
        className={`w-full aspect-square ${isActive ? activeColor : baseColor} opacity-90 transition-colors duration-500`}
      />
    );
  });

  return (
    <div className="flex flex-col items-center">
      <h4 className="text-sm font-bold text-slate-700 mb-2">{title}</h4>
      <div 
        className="w-full max-w-[200px] grid gap-[1px] bg-slate-200 border border-slate-300 p-[1px] rounded"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {pixels}
      </div>
      <div className="mt-2 text-xs font-mono font-bold bg-slate-100 px-2 py-1 rounded">
        Score: {score.toFixed(2)}
      </div>
    </div>
  );
}
