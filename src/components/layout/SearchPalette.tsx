import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen, Bookmark, Mic, PhoneCall } from 'lucide-react';
import { searchContent, type SearchResult } from '../../data/loader';

export interface SearchPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchPalette: React.FC<SearchPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open handled by parent
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSearch = (text: string) => {
    setQuery(text);
    if (text.trim().length >= 2) {
      setResults(searchContent(text));
    } else {
      setResults([]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-xl bg-white dark:bg-[#0E1A2B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 flex flex-col max-h-[70vh]">
        {/* Search Input Bar */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0 ml-1" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search handbook pages, terms (e.g. BMC-84, detention, break-even)..."
            autoFocus
            className="w-full text-sm bg-transparent border-none text-[#0E1A2B] dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => handleSearch('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2">
          {query.trim().length < 2 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              Type at least 2 characters to search across 292 handbook pages, 230 glossary terms, drills and role-plays.
            </div>
          ) : results.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No results matching "{query}". Try another keyword or check the Glossary in Toolbox.
            </div>
          ) : (
            <div className="space-y-1">
              {results.map((res) => (
                <a
                  key={res.id}
                  href={res.url}
                  onClick={onClose}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-[#F5A524] transition-colors shrink-0 mt-0.5">
                    {res.type === 'page' && <BookOpen className="w-4 h-4" />}
                    {res.type === 'glossary' && <Bookmark className="w-4 h-4" />}
                    {res.type === 'drill' && <Mic className="w-4 h-4" />}
                    {res.type === 'roleplay' && <PhoneCall className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-[#13294B] dark:text-white group-hover:text-[#F5A524] transition-colors flex items-center justify-between">
                      <span className="truncate">{res.title}</span>
                      <span className="text-[10px] text-slate-400 font-normal uppercase tracking-wider">
                        {res.type}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {res.subtitle}
                    </div>
                    {res.snippet && (
                      <div className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                        {res.snippet}
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Navigate with mouse or click item to open</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
