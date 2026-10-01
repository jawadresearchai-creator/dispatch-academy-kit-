import React, { useState } from 'react';
import { Layers, RotateCw, Check, ArrowRight } from 'lucide-react';
import { glossaryData } from '../../data/loader';
import { Button, Card } from '../../components/ui';

export const FlashcardsScreen: React.FC = () => {
  const [selectedModule, setSelectedModule] = useState('all');
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const filteredCards = selectedModule === 'all'
    ? glossaryData
    : glossaryData.filter((g) => g.module === selectedModule);

  const currentCard = filteredCards[cardIndex] || filteredCards[0];

  const handleNext = () => {
    setFlipped(false);
    setCardIndex((prev) => (prev + 1) % filteredCards.length);
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-[#C98500] dark:text-[#F5A524]">
            Spaced Repetition Flashcards
          </div>
          <h1 className="text-2xl font-extrabold text-[#13294B] dark:text-white mt-1">
            Glossary Decks ({filteredCards.length} Cards)
          </h1>
        </div>

        <select
          value={selectedModule}
          onChange={(e) => { setSelectedModule(e.target.value); setCardIndex(0); setFlipped(false); }}
          className="px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-[#13294B] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
        >
          <option value="all">All Modules (230 Terms)</option>
          {['m00-01', 'm02', 'm03', 'm04', 'm05', 'm06', 'm07', 'm08', 'm09', 'm10', 'm11'].map((m) => (
            <option key={m} value={m}>
              {m.toUpperCase()} Deck
            </option>
          ))}
        </select>
      </div>

      {/* Card Carousel */}
      {currentCard && (
        <div className="space-y-6">
          <div
            onClick={() => setFlipped(!flipped)}
            className="cursor-pointer min-h-[300px] flex flex-col justify-between p-8 rounded-2xl bg-white dark:bg-[#0E1A2B] border-2 border-slate-200 dark:border-slate-800 hover:border-[#F5A524] transition-all shadow-md text-center select-none"
          >
            <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
              <span>Card {cardIndex + 1} of {filteredCards.length}</span>
              <span className="text-[#C98500] dark:text-[#F5A524]">{currentCard.module.toUpperCase()}</span>
            </div>

            <div className="py-8">
              {!flipped ? (
                <div className="space-y-3">
                  <div className="text-2xl md:text-3xl font-extrabold text-[#13294B] dark:text-white">
                    {currentCard.term}
                  </div>
                  <div className="text-xs text-slate-400">
                    Click anywhere on card to reveal definition
                  </div>
                </div>
              ) : (
                <div className="space-y-3 animate-fadeIn">
                  <div className="text-xs font-bold text-[#C98500] dark:text-[#F5A524] uppercase tracking-wider">
                    {currentCard.term}
                  </div>
                  <div className="text-base md:text-lg text-slate-800 dark:text-slate-200 leading-relaxed max-w-lg mx-auto font-medium">
                    {currentCard.definition}
                  </div>
                </div>
              )}
            </div>

            <div className="text-xs font-medium text-slate-400 flex items-center justify-center gap-1">
              <RotateCw className="w-3.5 h-3.5" />
              <span>{flipped ? 'Click to flip back' : 'Click to flip'}</span>
            </div>
          </div>

          {/* Rating Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button variant="outline" className="border-red-400 text-red-500" onClick={handleNext}>
              Again (1d)
            </Button>
            <Button variant="outline" className="border-amber-400 text-amber-500" onClick={handleNext}>
              Hard (2d)
            </Button>
            <Button variant="outline" className="border-green-400 text-green-500" onClick={handleNext}>
              Good (4d)
            </Button>
            <Button variant="amber" onClick={handleNext} icon={<ArrowRight className="w-4 h-4" />}>
              Easy (7d)
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
