import React from 'react';

export interface StatProps {
  label: string;
  value: string | number;
  subValue?: string;
  source?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'default' | 'amber' | 'green' | 'red' | 'navy';
  className?: string;
}

export const Stat: React.FC<StatProps> = ({
  label,
  value,
  subValue,
  source,
  color = 'default',
  className = '',
}) => {
  const valueColors = {
    default: 'text-[#0E1A2B] dark:text-white',
    amber: 'text-[#C98500] dark:text-[#F5A524]',
    green: 'text-[#22A35A]',
    red: 'text-[#E5484D]',
    navy: 'text-[#13294B] dark:text-blue-300',
  };

  return (
    <div className={`p-4 rounded-xl bg-white dark:bg-[#13294B]/30 border border-slate-200/80 dark:border-slate-800 shadow-xs ${className}`}>
      <div className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-1">
        {label}
      </div>
      <div className={`text-2xl font-bold tracking-tight ${valueColors[color]}`}>
        {value}
      </div>
      {subValue && (
        <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
          {subValue}
        </div>
      )}
      {source && (
        <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-mono">
          Source: {source}
        </div>
      )}
    </div>
  );
};
