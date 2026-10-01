import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  TrendingUp,
  Clock,
  CalendarCheck,
  LayoutGrid,
  ShieldCheck,
  PhoneCall,
  PlayCircle,
  ArrowRight,
  Flame,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { getModules, getPagesForModule } from '../../data/loader';
import { db, getSettings, type AppSettings } from '../../db';
import { Button, Card, Stat } from '../../components/ui';

export const HomeScreen: React.FC = () => {
  const modules = getModules();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [readCount, setReadCount] = useState(0);
  const [dueCardsCount, setDueCardsCount] = useState(0);

  useEffect(() => {
    getSettings().then(setSettings);
    db.progress.filter(p => !!p.understood).count().then(setReadCount);
    db.flashcards.count().then(setDueCardsCount);
  }, []);

  const totalPages = 292;
  const progressPct = Math.round((readCount / totalPages) * 100);

  // Quick Tools definitions
  const quickTools = [
    { title: 'Rate per Mile', desc: 'Calculate $/total mi vs break-even', path: '/toolbox?tool=rpm', icon: <TrendingUp className="w-4 h-4 text-[#F5A524]" /> },
    { title: 'Break-even & Target', desc: 'Truck 12 cost formula ($2.59/$2.70)', path: '/labs/economics', icon: <TrendingUp className="w-4 h-4 text-[#22A35A]" /> },
    { title: 'Time Zone Converter', desc: 'US Zones ↔ PKT with live DST', path: '/toolbox?tool=tz', icon: <Clock className="w-4 h-4 text-[#0E9F9A]" /> },
    { title: 'HOS Quick Check', desc: '11h driving & 14h window rules', path: '/labs/hos', icon: <CalendarCheck className="w-4 h-4 text-[#7C5CC4]" /> },
    { title: 'Detention Calculator', desc: 'Billable time & carrier revenue', path: '/toolbox?tool=detention', icon: <Clock className="w-4 h-4 text-[#E5484D]" /> },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Hero Banner: Continue Where You Left Off */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#0E1A2B] via-[#13294B] to-[#1E3A6B] text-white p-6 md:p-8 shadow-md">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5A524]/20 border border-[#F5A524]/40 text-[#F5A524] text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome back, {settings?.userName || 'Jawad'}</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Ready to dispatch today's fleet?
          </h1>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            Continue mastering carrier-side U.S. dispatching across all 11 course modules, realistic load boards, and simulated broker phone negotiations.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link to="/learn/m00-01/m00-01-p01">
              <Button variant="amber" icon={<ArrowRight className="w-4 h-4" />}>
                Continue Module 0 & 1
              </Button>
            </Link>
            <Link to="/simulation">
              <Button variant="outline" className="text-white border-white/30 hover:bg-white/10" icon={<PlayCircle className="w-4 h-4" />}>
                Week Simulation
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative background image */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none hidden md:block">
          <img
            src="/assets/photos/hero_dryvan.jpg"
            alt="Truck"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Today Panel / Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat
          label="Course Progress"
          value={`${readCount} / ${totalPages}`}
          subValue={`${progressPct}% completed`}
          color="navy"
        />
        <Stat
          label="Active Fleet"
          value="3 Trucks"
          subValue="Truck 12, Truck 7, Truck 3"
          source="Blue Line Transport"
          color="amber"
        />
        <Stat
          label="Diesel Snapshot"
          value={`$${settings?.dieselPrice?.toFixed(2) || '6.38'}/gal`}
          subValue="EIA Weekly Average"
          source={settings?.dieselDate || '28 Sep 2026'}
          color="default"
        />
        <Stat
          label="DAT Van Average"
          value={`$${settings?.datVanRate?.toFixed(2) || '2.19'}/mi`}
          subValue="Linehaul benchmark"
          source={settings?.datDate || 'August 2026'}
          color="green"
        />
      </div>

      {/* Quick Tools Row */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#13294B] dark:text-white flex items-center gap-2">
            <span>Essential Dispatch Tools</span>
            <span className="text-xs font-normal text-slate-500">Live calculators from the course</span>
          </h2>
          <Link to="/toolbox" className="text-xs font-semibold text-[#C98500] dark:text-[#F5A524] hover:underline flex items-center gap-1">
            <span>View All 14 Tools</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {quickTools.map((t, idx) => (
            <Link key={idx} to={t.path}>
              <Card variant="interactive" className="p-4 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    {t.icon}
                    <h3 className="text-xs font-bold text-[#13294B] dark:text-white">{t.title}</h3>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {t.desc}
                  </p>
                </div>
                <div className="mt-3 text-[10px] font-semibold text-[#C98500] dark:text-[#F5A524] flex items-center gap-1">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* 11 Course Modules Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-[#13294B] dark:text-white">
              Course Modules (11 Handbooks)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comprehensive curriculum from foundational ecosystem to full simulation
            </p>
          </div>
          <Link to="/learn" className="text-xs font-semibold text-[#C98500] dark:text-[#F5A524] hover:underline flex items-center gap-1">
            <span>Browse Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {modules.map((m, idx) => {
            const modulePages = getPagesForModule(m.id);
            return (
              <Link key={m.id} to={`/learn/${m.id}`}>
                <Card variant="interactive" className="overflow-hidden flex flex-col h-full group">
                  <div className="h-36 relative bg-slate-800 overflow-hidden">
                    <img
                      src={m.coverImage || `/assets/photos/dv_studio.jpg`}
                      alt={m.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] font-mono font-bold text-[#F5A524] uppercase">
                      Module {idx === 0 ? '0 & 1' : idx}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <div className="text-xs text-slate-300 font-medium">
                        {m.pageCount} pages · {m.sections?.length || 0} sections
                      </div>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <h3 className="text-sm font-bold text-[#13294B] dark:text-white group-hover:text-[#F5A524] transition-colors line-clamp-2">
                        {m.title}
                      </h3>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                        <span>{modulePages.length} handbook pages</span>
                      </span>
                      <span className="font-semibold text-[#C98500] dark:text-[#F5A524]">
                        Start Module →
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
