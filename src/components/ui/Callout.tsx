import React, { useState } from 'react';
import {
  Lightbulb,
  AlertTriangle,
  Mic,
  Eye,
  ClipboardCheck,
  Pencil,
  BookOpen,
} from 'lucide-react';
import { Button } from './Button';

export type CalloutType =
  | 'KEY RULE'
  | 'WARNING / CORRECTION'
  | 'SAY IT OUT LOUD'
  | 'REAL-WORLD TIP'
  | 'CHECKLIST'
  | 'TRY IT'
  | 'FACT';

export interface CalloutProps {
  type: CalloutType;
  title: string;
  children: React.ReactNode;
  onPractise?: () => void;
  answerText?: string;
  className?: string;
}

export const Callout: React.FC<CalloutProps> = ({
  type,
  title,
  children,
  onPractise,
  answerText,
  className = '',
}) => {
  const [showAnswer, setShowAnswer] = useState(false);

  const getStyle = () => {
    switch (type) {
      case 'KEY RULE':
        return {
          icon: <Lightbulb className="w-5 h-5 text-[#C98500]" />,
          bg: 'bg-[#FFF4DE] dark:bg-[#2A2312]',
          border: 'border-l-4 border-l-[#F5A524] border-t border-r border-b border-amber-200/60 dark:border-amber-900/40',
          textColor: 'text-[#5C3B00] dark:text-amber-100',
          titleColor: 'text-[#C98500] dark:text-[#F5A524]',
        };
      case 'WARNING / CORRECTION':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-[#E5484D]" />,
          bg: 'bg-[#FDECEC] dark:bg-[#2A1315]',
          border: 'border-l-4 border-l-[#E5484D] border-t border-r border-b border-red-200/60 dark:border-red-900/40',
          textColor: 'text-[#641A1C] dark:text-red-100',
          titleColor: 'text-[#E5484D] dark:text-red-400',
        };
      case 'SAY IT OUT LOUD':
        return {
          icon: <Mic className="w-5 h-5 text-[#0E9F9A]" />,
          bg: 'bg-[#E2F5F4] dark:bg-[#0B2527]',
          border: 'border-l-4 border-l-[#0E9F9A] border-t border-r border-b border-teal-200/60 dark:border-teal-900/40',
          textColor: 'text-[#064341] dark:text-teal-100',
          titleColor: 'text-[#0E9F9A] dark:text-teal-300',
        };
      case 'TRY IT':
        return {
          icon: <Pencil className="w-5 h-5 text-[#7C5CC4]" />,
          bg: 'bg-[#F1ECFB] dark:bg-[#1C162E]',
          border: 'border-l-4 border-l-[#7C5CC4] border-t border-r border-b border-purple-200/60 dark:border-purple-900/40',
          textColor: 'text-[#351F65] dark:text-purple-100',
          titleColor: 'text-[#7C5CC4] dark:text-purple-300',
        };
      case 'FACT':
        return {
          icon: <BookOpen className="w-5 h-5 text-[#0E9F9A]" />,
          bg: 'bg-[#E2F5F4] dark:bg-[#0B2527]',
          border: 'border-l-4 border-l-[#0E9F9A] border-t border-r border-b border-teal-200/60 dark:border-teal-900/40',
          textColor: 'text-[#064341] dark:text-teal-100',
          titleColor: 'text-[#0E9F9A] dark:text-teal-300',
        };
      case 'CHECKLIST':
        return {
          icon: <ClipboardCheck className="w-5 h-5 text-[#13294B] dark:text-slate-300" />,
          bg: 'bg-white dark:bg-[#13294B]/30',
          border: 'border-l-4 border-l-[#13294B] dark:border-l-slate-400 border border-slate-200 dark:border-slate-800',
          textColor: 'text-slate-800 dark:text-slate-200',
          titleColor: 'text-[#13294B] dark:text-slate-100',
        };
      case 'REAL-WORLD TIP':
      default:
        return {
          icon: <Eye className="w-5 h-5 text-[#13294B] dark:text-slate-300" />,
          bg: 'bg-white dark:bg-[#13294B]/30',
          border: 'border-l-4 border-l-[#13294B] dark:border-l-slate-400 border border-slate-200 dark:border-slate-800',
          textColor: 'text-slate-800 dark:text-slate-200',
          titleColor: 'text-[#13294B] dark:text-slate-100',
        };
    }
  };

  const style = getStyle();

  return (
    <div className={`my-4 p-4 rounded-xl ${style.bg} ${style.border} ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          {style.icon}
          <div className="text-xs uppercase tracking-wider font-bold">
            <span className={style.titleColor}>{type}</span>
            {title && <span className="ml-2 font-semibold text-slate-700 dark:text-slate-300">· {title}</span>}
          </div>
        </div>

        {type === 'SAY IT OUT LOUD' && onPractise && (
          <Button
            size="sm"
            variant="outline"
            className="text-xs py-1 px-2.5 h-7"
            onClick={onPractise}
            icon={<Mic className="w-3.5 h-3.5" />}
          >
            Practise this
          </Button>
        )}
      </div>

      <div className={`text-sm leading-relaxed ${style.textColor}`}>
        {children}
      </div>

      {type === 'TRY IT' && answerText && (
        <div className="mt-3 pt-2 border-t border-purple-200/50 dark:border-purple-900/50">
          <button
            type="button"
            className="text-xs font-semibold text-[#7C5CC4] dark:text-purple-300 hover:underline"
            onClick={() => setShowAnswer(!showAnswer)}
          >
            {showAnswer ? 'Hide answer' : 'Show answer'}
          </button>
          {showAnswer && (
            <div className="mt-1 text-xs text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-black/20 p-2 rounded-lg">
              {answerText}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
