import React, { useState, useEffect } from 'react';
import {
  Search,
  Clock,
  Sparkles,
  BookMarked,
  Sun,
  Moon,
  ChevronDown,
  Flame,
} from 'lucide-react';
import {
  US_TIME_ZONES,
  PKT_ZONE,
  formatInZone,
  pktDifferenceHours,
  isDaylightSaving,
  getZoneAbbreviation,
} from '../../engines/timezones';
import { checkAIHealth, type AIHealthStatus } from '../../ai/aiClient';
import { getSettings, updateSettings } from '../../db';

export interface TopBarProps {
  onOpenSearch: () => void;
  onToggleStudyPanel: () => void;
  studyPanelOpen: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenSearch,
  onToggleStudyPanel,
  studyPanelOpen,
}) => {
  const [now, setNow] = useState(new Date());
  const [selectedZone, setSelectedZone] = useState('America/New_York');
  const [aiStatus, setAiStatus] = useState<AIHealthStatus>({
    available: false,
    transport: 'none',
    message: 'Checking...',
  });
  const [isDark, setIsDark] = useState(false);
  const [showZoneMenu, setShowZoneMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    getSettings().then((s) => {
      if (s.defaultUsZone) setSelectedZone(s.defaultUsZone);
      if (s.theme === 'dark' || (s.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        setIsDark(true);
        document.documentElement.classList.add('dark');
      } else {
        setIsDark(false);
        document.documentElement.classList.remove('dark');
      }
    });

    checkAIHealth().then(setAiStatus);
    const healthInterval = setInterval(() => checkAIHealth().then(setAiStatus), 15000);
    return () => clearInterval(healthInterval);
  }, []);

  const toggleTheme = async () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      await updateSettings({ theme: 'dark' });
    } else {
      document.documentElement.classList.remove('dark');
      await updateSettings({ theme: 'light' });
    }
  };

  const handleZoneSelect = async (zone: string) => {
    setSelectedZone(zone);
    setShowZoneMenu(false);
    await updateSettings({ defaultUsZone: zone });
  };

  const currentZoneObj = US_TIME_ZONES.find((z) => z.zone === selectedZone) || US_TIME_ZONES[0];
  const diffHours = pktDifferenceHours(selectedZone, now);
  const diffSign = diffHours >= 0 ? '+' : '';
  const zoneAbbr = getZoneAbbreviation(selectedZone, now);
  const dstActive = isDaylightSaving(selectedZone, now);

  const pktTimeStr = formatInZone(now, PKT_ZONE, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const usTimeStr = formatInZone(now, selectedZone, { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });

  return (
    <header className="h-16 px-4 md:px-6 bg-white dark:bg-[#0E1A2B] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-30">
      {/* Search Bar / Ctrl+K trigger */}
      <div className="flex items-center gap-3 w-72 md:w-96">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs border border-transparent hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <span>Search pages, terms, tools...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600 text-slate-500">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Dual Clock & Status Indicators */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Live Dual Clock */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-50 dark:bg-[#13294B]/30 border border-slate-200/80 dark:border-slate-800 text-xs">
          <Clock className="w-3.5 h-3.5 text-[#F5A524]" />

          {/* PKT */}
          <div className="flex items-center gap-1 font-mono">
            <span className="font-semibold text-[#13294B] dark:text-slate-200">PKT</span>
            <span className="text-slate-700 dark:text-slate-300">{pktTimeStr}</span>
          </div>

          <span className="text-slate-300 dark:text-slate-700">|</span>

          {/* US Time with Zone Selector */}
          <div className="relative">
            <button
              onClick={() => setShowZoneMenu(!showZoneMenu)}
              className="flex items-center gap-1 font-mono hover:text-[#C98500] dark:hover:text-[#F5A524] transition-colors"
            >
              <span className="font-semibold text-[#13294B] dark:text-slate-200">{zoneAbbr}</span>
              <span className="text-slate-700 dark:text-slate-300">{usTimeStr}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showZoneMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#13294B] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 text-xs">
                <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400">
                  Select US Time Zone
                </div>
                {US_TIME_ZONES.map((z) => (
                  <button
                    key={z.zone}
                    onClick={() => handleZoneSelect(z.zone)}
                    className={`w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between ${
                      selectedZone === z.zone ? 'font-bold text-[#F5A524]' : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <span>{z.label}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {getZoneAbbreviation(z.zone, now)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Difference & DST Badge */}
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#F5A524]/15 text-[#C98500] dark:text-[#F5A524]">
            PKT = {currentZoneObj.code} {diffSign}{diffHours}h {dstActive ? '(DST)' : ''}
          </span>
        </div>

        {/* Study Streak */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs font-semibold text-[#C98500] dark:text-amber-300">
          <Flame className="w-3.5 h-3.5 fill-[#F5A524] text-[#F5A524]" />
          <span>Day 1</span>
        </div>

        {/* AI Status Dot */}
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          title={aiStatus.message}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              aiStatus.available
                ? 'bg-[#22A35A] shadow-[0_0_8px_rgba(34,163,90,0.6)]'
                : 'bg-slate-400'
            }`}
          />
          <Sparkles className="w-3 h-3 text-slate-500 dark:text-slate-400" />
          <span className="hidden sm:inline text-[11px] font-medium text-slate-600 dark:text-slate-300">
            {aiStatus.available ? 'AI Ready' : 'AI Off'}
          </span>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isDark ? 'Switch to Light theme' : 'Switch to Dark theme'}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Right Study Panel Toggle */}
        <button
          onClick={onToggleStudyPanel}
          className={`p-2 rounded-xl transition-colors ${
            studyPanelOpen
              ? 'bg-[#13294B] text-white dark:bg-[#F5A524] dark:text-[#0E1A2B]'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Toggle Study Notes & Tutor Panel"
        >
          <BookMarked className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
