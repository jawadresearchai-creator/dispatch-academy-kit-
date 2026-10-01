import React from 'react';

export interface PillProps {
  label: string;
  variant?: 'book' | 'counter' | 'pass' | 'navy' | 'neutral' | 'purple' | 'teal';
  size?: 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

export const Pill: React.FC<PillProps> = ({
  label,
  variant = 'neutral',
  size = 'sm',
  className = '',
  icon,
}) => {
  const variants = {
    book: 'bg-[#22A35A]/15 text-[#22A35A] border border-[#22A35A]/30',
    counter: 'bg-[#F5A524]/15 text-[#C98500] dark:text-[#F5A524] border border-[#F5A524]/30',
    pass: 'bg-[#E5484D]/15 text-[#E5484D] border border-[#E5484D]/30',
    navy: 'bg-[#13294B]/15 text-[#13294B] dark:text-blue-300 border border-[#13294B]/30',
    purple: 'bg-[#7C5CC4]/15 text-[#7C5CC4] border border-[#7C5CC4]/30',
    teal: 'bg-[#0E9F9A]/15 text-[#0E9F9A] border border-[#0E9F9A]/30',
    neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-semibold uppercase tracking-wider',
    md: 'text-xs px-2.5 py-1 font-semibold',
  };

  return (
    <span className={`inline-flex items-center gap-1 rounded-full ${variants[variant]} ${sizes[size]} ${className}`}>
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
    </span>
  );
};
