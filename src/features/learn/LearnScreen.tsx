import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  CheckCircle2,
  Clock,
  Mic,
  PhoneCall,
  Download,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import {
  getModules,
  getModule,
  getPagesForModule,
  getDrillsForModule,
  getRoleplaysForModule,
} from '../../data/loader';
import { db } from '../../db';
import { Button, Card, Pill } from '../../components/ui';

export const LearnScreen: React.FC = () => {
  const { moduleId } = useParams<{ moduleId?: string }>();
  const modules = getModules();
  const selectedModule = moduleId ? getModule(moduleId) : modules[0];
  const pages = selectedModule ? getPagesForModule(selectedModule.id) : [];
  const drills = selectedModule ? getDrillsForModule(selectedModule.id) : [];
  const roleplays = selectedModule ? getRoleplaysForModule(selectedModule.id) : [];

  const [understoodPages, setUnderstoodPages] = useState<Set<string>>(new Set());

  useEffect(() => {
    db.progress.toArray().then((prog) => {
      const set = new Set<string>();
      prog.forEach((p) => {
        if (p.understood) set.add(p.pageId);
      });
      setUnderstoodPages(set);
    });
  }, [selectedModule?.id]);

  if (!selectedModule) return null;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header / Breadcrumbs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-[#C98500] dark:text-[#F5A524]">
            Module Library · {selectedModule.id.toUpperCase()}
          </div>
          <h1 className="text-2xl font-extrabold text-[#13294B] dark:text-white mt-1">
            {selectedModule.title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {selectedModule.pdf && (
            <a
              href={selectedModule.pdf}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#13294B] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-[#F5A524] transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-red-500" />
              <span>Open Original PDF</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          )}
          {pages.length > 0 && (
            <Link to={`/learn/${selectedModule.id}/${pages[0].id}`}>
              <Button variant="amber" icon={<BookOpen className="w-4 h-4" />}>
                Read Module
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Module Selector Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {modules.map((m) => {
          const isActive = m.id === selectedModule.id;
          return (
            <Link
              key={m.id}
              to={`/learn/${m.id}`}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border ${
                isActive
                  ? 'bg-[#13294B] text-white border-[#13294B] dark:bg-[#F5A524] dark:text-[#0E1A2B] dark:border-[#F5A524]'
                  : 'bg-white dark:bg-[#13294B]/20 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              {m.id.toUpperCase()}
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Sections & Pages List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Handbook Pages ({pages.length})</span>
            <span>
              {understoodPages.size} / {pages.length} Understood
            </span>
          </div>

          <div className="space-y-3">
            {pages.map((p, idx) => {
              const isDone = understoodPages.has(p.id);
              return (
                <Link key={p.id} to={`/learn/${selectedModule.id}/${p.id}`}>
                  <Card
                    variant="interactive"
                    className="p-4 flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                          isDone
                            ? 'bg-[#22A35A]/15 text-[#22A35A] border border-[#22A35A]/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-4 h-4" /> : p.page}
                      </div>

                      <div className="min-w-0">
                        <div className="text-[10px] font-semibold text-[#C98500] dark:text-[#F5A524] uppercase tracking-wider truncate">
                          {p.kicker}
                        </div>
                        <h4 className="text-xs md:text-sm font-bold text-[#13294B] dark:text-white group-hover:text-[#F5A524] transition-colors truncate">
                          {p.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {p.images && p.images.length > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {p.images.length} diagrams
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#F5A524] transition-colors" />
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Column: Practice activities attached to module */}
        <div className="space-y-5">
          {/* Module PDF Card */}
          <Card className="p-5 overflow-hidden">
            <h3 className="text-sm font-bold text-[#13294B] dark:text-white mb-2">
              Original Course Handbook
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              All 292 pages in this app are digitized directly from the official PDF handbooks with identical page numbering.
            </p>
            {selectedModule.pdf && (
              <a
                href={selectedModule.pdf}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span>Download Handbook PDF</span>
              </a>
            )}
          </Card>

          {/* Module Drills */}
          {drills.length > 0 && (
            <Card className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#13294B] dark:text-white">
                <Mic className="w-4 h-4 text-[#0E9F9A]" />
                <span>Speaking Drills for this Module</span>
              </div>
              <div className="space-y-2">
                {drills.map((d) => (
                  <Link
                    key={d.id}
                    to={`/practice/drills/${d.id}`}
                    className="block p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:border-[#0E9F9A] transition-colors"
                  >
                    <div className="text-xs font-bold text-[#13294B] dark:text-white">
                      {d.title}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      {d.objective}
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {/* Module Roleplays */}
          {roleplays.length > 0 && (
            <Card className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#13294B] dark:text-white">
                <PhoneCall className="w-4 h-4 text-[#F5A524]" />
                <span>Role-plays for this Module</span>
              </div>
              <div className="space-y-2">
                {roleplays.map((r) => (
                  <Link
                    key={r.id}
                    to={`/practice/roleplay/${r.id}`}
                    className="block p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 hover:border-[#F5A524] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#13294B] dark:text-white">
                        {r.title}
                      </span>
                      <Pill label={r.difficulty} variant="counter" />
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {r.learnerBriefing}
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
