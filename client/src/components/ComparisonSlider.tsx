import React, { useState, useEffect } from 'react';

interface ComparisonSliderProps {
  title: string;
  year1: number;
  year2: number;
}

// Generates a deterministic grid of colored pixels based on a "seed" (year)
const generateGrid = (rows: number, cols: number, baseColor: string, variance: number, seed: number) => {
  const pixels = [];
  for (let i = 0; i < rows * cols; i++) {
    // Pseudo-random based on index and seed
    const pseudoRand = Math.sin((i + 1) * seed) * 10000;
    const r = pseudoRand - Math.floor(pseudoRand);
    
    // Determine if pixel changes (for year 2)
    let colorClass = baseColor;
    if (seed > 2000 && r < variance) {
      colorClass = r < variance / 2 ? 'bg-red-500' : 'bg-purple-500'; // Deforestation or Urban
    }

    pixels.push(
      <div 
        key={i} 
        className={`w-full aspect-square opacity-80 ${colorClass}`}
        style={{ opacity: 0.6 + (r * 0.4) }} // Randomize opacity slightly for texture
      />
    );
  }
  return pixels;
};

export function ComparisonSlider({ title, year1, year2 }: ComparisonSliderProps) {
  const [sliderPos, setSliderPos] = useState(50);
  const rows = 12;
  const cols = 24;

  const layer1 = generateGrid(rows, cols, 'bg-green-500', 0.05, 1);
  const layer2 = generateGrid(rows, cols, 'bg-green-500', 0.35, 2026); // More variance/change in year 2

  return (
    <div className="dashboard-card p-6 flex flex-col h-full">
      <h3 className="text-lg font-bold text-slate-800 mb-4">{title}</h3>
      
      <div className="relative flex-1 min-h-[300px] w-full bg-slate-100 rounded-lg overflow-hidden select-none">
        {/* Layer 1 (Base Year) */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded font-bold z-10">
            {year1} (Baseline)
          </div>
          <div 
            className="w-full h-full grid"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: '1px' }}
          >
            {layer1}
          </div>
        </div>

        {/* Layer 2 (Compare Year) clipped by slider */}
        <div 
          className="absolute inset-0 z-10 border-r-2 border-white shadow-[2px_0_10px_rgba(0,0,0,0.3)]"
          style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
        >
          <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded font-bold z-10" style={{ right: `calc(100% - ${sliderPos}% + 8px)` }}>
            {year2} (Current)
          </div>
          <div 
            className="w-full h-full grid"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: '1px' }}
          >
            {layer2}
          </div>
        </div>

        {/* Custom Slider Input */}
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={sliderPos}
          onChange={(e) => setSliderPos(Number(e.target.value))}
          className="absolute inset-0 z-20 w-full h-full opacity-0 cursor-ew-resize"
        />
        
        {/* Slider Handle Visual */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white z-10 pointer-events-none flex items-center justify-center shadow-lg"
          style={{ left: `calc(${sliderPos}% - 2px)` }}
        >
          <div className="w-8 h-8 bg-white border-2 border-slate-300 rounded-full flex items-center justify-center shadow-md text-slate-400">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="rotate-180 -ml-2"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </div>
        </div>
      </div>
      <p className="text-sm text-slate-500 mt-4 text-center">Drag slider to compare pixel-level changes.</p>
    </div>
  );
}
