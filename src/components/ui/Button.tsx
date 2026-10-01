import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const base = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#F5A524] disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary: 'bg-[#13294B] text-white hover:bg-[#0E1E38] active:bg-[#0A1526] shadow-sm',
    secondary: 'bg-white dark:bg-[#1E293B] text-[#0E1A2B] dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-[#283548] border border-slate-200 dark:border-slate-700 shadow-xs',
    outline: 'bg-transparent text-[#13294B] dark:text-slate-200 border border-[#13294B]/30 dark:border-slate-600 hover:bg-[#13294B]/5 active:bg-[#13294B]/10',
    ghost: 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800',
    danger: 'bg-[#E5484D] text-white hover:bg-[#C9383D] active:bg-[#B32F34] shadow-sm',
    amber: 'bg-[#F5A524] text-[#0E1A2B] font-semibold hover:bg-[#E09419] active:bg-[#C98500] shadow-sm',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
