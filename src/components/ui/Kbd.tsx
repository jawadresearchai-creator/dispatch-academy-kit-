import React from 'react';

export const Kbd: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <kbd
      className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded shadow-xs ${className}`}
    >
      {children}
    </kbd>
  );
};

export const Skeleton: React.FC<{ className?: string }> = ({ className = 'h-4 w-full' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-md ${className}`}
    />
  );
};
