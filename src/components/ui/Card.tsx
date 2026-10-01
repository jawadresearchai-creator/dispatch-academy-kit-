import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat' | 'interactive' | 'dark';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const base = 'rounded-[14px] transition-all';
  const variants = {
    default: 'bg-white dark:bg-[#13294B]/40 border border-slate-200/80 dark:border-slate-800 shadow-sm',
    flat: 'bg-slate-50 dark:bg-[#0E1A2B]/60 border border-slate-200/60 dark:border-slate-800/80',
    interactive: 'bg-white dark:bg-[#13294B]/40 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-[#F5A524]/60 cursor-pointer',
    dark: 'bg-[#13294B] text-white border border-[#1E3A6B] shadow-md',
  };

  return (
    <div className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};
