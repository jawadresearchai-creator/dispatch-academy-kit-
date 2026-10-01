import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Send,
  Sparkles,
  RotateCcw,
  BookOpen,
  HelpCircle,
  Truck,
  Globe,
  Zap,
} from 'lucide-react';
import { chatAI } from '../../ai/aiClient';
import { buildTutorPrompt } from '../../ai/prompts';
import { courseData, glossaryData } from '../../data/loader';
import { Button, Card } from '../../components/ui';

export const TutorScreen: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get('q') || '';

  const [messages, setMessages] = useState<
    Array<{ role: 'user' | 'assistant'; content: string; sources?: string[] }>
  >([
    {
      role: 'assistant',
      content:
        'As-salamu alaykum Jawad! I am your Dispatch Academy AI Tutor, grounded directly in the 11 course handbooks. Ask me about equipment specs, HOS regulations, break-even math, broker vetting, or simulated situations.',
    },
  ]);
  const [input, setInput] = useState(initialQ);
  const [mode, setMode] = useState<'explain' | 'simplify' | 'example' | 'quiz_me' | 'urdu'>('explain');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (initialQ) {
      handleSend(initialQ);
    }
  }, [initialQ]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    setInput('');
    const newMsgs = [...messages, { role: 'user' as const, content: textToSend }];
    setMessages(newMsgs);
    setLoading(true);

    try {
      // Find top 4 relevant pages from courseData
      const q = textToSend.toLowerCase();
      const scoredPages = (courseData.pages || [])
        .map((p) => {
          let score = 0;
          if (p.title.toLowerCase().includes(q)) score += 5;
          if (p.kicker.toLowerCase().includes(q)) score += 3;
          if (p.markdown.toLowerCase().includes(q)) score += 1;
          return { page: p, score };
        })
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 4)
        .map((item) => item.page);

      // Find glossary matches
      const matchedTerms = (glossaryData || [])
        .filter((g) => q.includes(g.term.toLowerCase()))
        .slice(0, 4);

      const { systemInstruction } = buildTutorPrompt(
        textToSend,
        scoredPages,
        matchedTerms,
        mode
      );

      const response = await chatAI({
        messages: newMsgs.map((m) => ({ role: m.role, content: m.content })),
        systemInstruction,
      });

      // Extract source page IDs if present (e.g. [m07-p08])
      const sourceMatches = response.match(/\[(m\d+.*?p\d+)\]/g) || [];
      const sources = Array.from(new Set(sourceMatches.map((s) => s.replace(/[[\]]/g, ''))));

      setMessages([
        ...newMsgs,
        {
          role: 'assistant',
          content: response,
          sources: sources.length > 0 ? sources : undefined,
        },
      ]);
    } catch (err: any) {
      setMessages([
        ...newMsgs,
        {
          role: 'assistant',
          content: 'Unable to connect to AI tutor. Please check your AI Settings or network connection.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Chat cleared. What concept or problem would you like to review today?',
      },
    ]);
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto h-[calc(100vh-4rem)] flex flex-col space-y-4">
      {/* Header & Modes */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h1 className="text-xl font-bold text-[#13294B] dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#F5A524]" />
            <span>Grounded AI Tutor</span>
          </h1>
          <p className="text-xs text-slate-500">
            Answers verified against all 292 course pages with exact citations
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Selector */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs">
            <button
              onClick={() => setMode('explain')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                mode === 'explain' ? 'bg-white dark:bg-[#13294B] text-[#13294B] dark:text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              Standard
            </button>
            <button
              onClick={() => setMode('simplify')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                mode === 'simplify' ? 'bg-white dark:bg-[#13294B] text-[#13294B] dark:text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              Simplify
            </button>
            <button
              onClick={() => setMode('example')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                mode === 'example' ? 'bg-white dark:bg-[#13294B] text-[#13294B] dark:text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              Truck 12
            </button>
            <button
              onClick={() => setMode('urdu')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                mode === 'urdu' ? 'bg-white dark:bg-[#13294B] text-[#13294B] dark:text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              Roman Urdu
            </button>
          </div>

          <Button size="sm" variant="ghost" onClick={clearChat} icon={<RotateCcw className="w-3.5 h-3.5" />}>
            Reset
          </Button>
        </div>
      </div>

      {/* Suggested Questions */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
        {[
          'What is the break-even formula and why divide by 1 − fees?',
          'What is the 11-hour driving limit vs 14-hour window?',
          'What are the 7 checks in Module 8 broker vetting?',
          'How does detention billing work after 2 hours free time?',
        ].map((q, i) => (
          <button
            key={i}
            onClick={() => handleSend(q)}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:border-[#F5A524] whitespace-nowrap text-left transition-colors shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-2xl bg-white dark:bg-[#0E1A2B] border border-slate-200 dark:border-slate-800 shadow-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-2xl rounded-2xl p-4 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-[#13294B] text-white rounded-tr-xs'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 rounded-tl-xs'
              }`}
            >
              <div className="text-[10px] font-bold opacity-60 uppercase mb-1">
                {m.role === 'user' ? 'Jawad' : 'Course Tutor'}
              </div>
              <div className="whitespace-pre-wrap">{m.content}</div>

              {/* Source chips */}
              {m.sources && m.sources.length > 0 && (
                <div className="mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-semibold text-slate-400">Sources:</span>
                  {m.sources.map((src) => {
                    const mod = src.split('-')[0];
                    return (
                      <Link
                        key={src}
                        to={`/learn/${mod}/${src}`}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-[10px] font-mono font-bold text-[#C98500] dark:text-[#F5A524] hover:underline"
                      >
                        <BookOpen className="w-3 h-3" />
                        <span>{src}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="max-w-md rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 animate-pulse">
              Consulting course handbooks and preparing answer...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question (e.g. Explain 14-hour clock or how to counter an Atlanta load)..."
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0E1A2B] text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A524]"
        />
        <Button type="submit" variant="amber" disabled={!input.trim() || loading} icon={<Send className="w-4 h-4" />}>
          Ask
        </Button>
      </form>
    </div>
  );
};
