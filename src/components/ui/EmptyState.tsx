import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  imageSrc?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  imageSrc = '/assets/photos/hero_dryvan.jpg',
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto my-12 bg-white dark:bg-[#13294B]/20 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
      {imageSrc ? (
        <div className="w-24 h-24 rounded-2xl overflow-hidden mb-5 border-2 border-slate-200 dark:border-slate-700 shadow-sm">
          <img src={imageSrc} alt="" className="w-full h-full object-cover" />
        </div>
      ) : icon ? (
        <div className="w-14 h-14 rounded-2xl bg-[#13294B]/10 dark:bg-blue-400/10 flex items-center justify-center text-[#13294B] dark:text-blue-300 mb-4">
          {icon}
        </div>
      ) : null}

      <h3 className="text-lg font-bold text-[#13294B] dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
        {description}
      </p>

      {actionText && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionText}
        </Button>
      )}
    </div>
  );
};
