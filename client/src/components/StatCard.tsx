import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  colorTheme?: 'green' | 'red' | 'purple' | 'blue' | 'default';
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue,
  colorTheme = 'default',
  className
}: StatCardProps) {
  
  const colorStyles = {
    green: "text-[hsl(var(--color-vegetation))] bg-[hsl(var(--color-vegetation))]/10",
    red: "text-[hsl(var(--color-deforestation))] bg-[hsl(var(--color-deforestation))]/10",
    purple: "text-[hsl(var(--color-urban))] bg-[hsl(var(--color-urban))]/10",
    blue: "text-[hsl(var(--color-water))] bg-[hsl(var(--color-water))]/10",
    default: "text-slate-600 bg-slate-100"
  };

  const trendStyles = {
    up: "text-red-500", // Contextual: increase in deforestation is bad (red)
    down: "text-green-500",
    neutral: "text-slate-500"
  };

  // Adjust trend color based on theme context if needed, but for simplicity:
  const actualTrendStyle = colorTheme === 'green' && trend === 'down' ? 'text-red-500' : 
                           colorTheme === 'red' && trend === 'up' ? 'text-red-500' :
                           trend === 'up' ? 'text-green-500' : 'text-slate-500';

  return (
    <div className={cn("dashboard-card p-5 flex flex-col", className)}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</h3>
        {Icon && (
          <div className={cn("p-2 rounded-lg", colorStyles[colorTheme])}>
            <Icon size={18} strokeWidth={2.5} />
          </div>
        )}
      </div>
      
      <div className="mt-auto flex items-baseline gap-2">
        <span className="text-3xl font-bold data-value text-slate-800">{value}</span>
        {subtitle && <span className="text-sm text-slate-500 font-medium">{subtitle}</span>}
      </div>

      {trendValue && (
        <div className="mt-2 text-xs font-medium flex items-center gap-1">
          <span className={trendStyles[trend || 'neutral']}>{trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}</span>
          <span className="text-slate-400">vs previous period</span>
        </div>
      )}
    </div>
  );
}
