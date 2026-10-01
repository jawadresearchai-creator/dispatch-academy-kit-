import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  PhoneCall,
  Download,
  Flame,
  Printer,
} from 'lucide-react';
import { db, getSettings } from '../../db';
import { Button, Card, Pill, Stat } from '../../components/ui';

export const ProgressScreen: React.FC = () => {
  const [userName, setUserName] = useState('Jawad');
  const [readCount, setReadCount] = useState(0);
  const [quizScoreAvg, setQuizScoreAvg] = useState(85);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    getSettings().then((s) => {
      if (s.userName) setUserName(s.userName);
    });
    db.progress.filter(p => !!p.understood).count().then(setReadCount);
  }, []);

  const readinessItems = [
    { id: 1, title: 'Foundations & Ecosystem Mastered', desc: 'Module 0/1 completed and understanding confirmed.' },
    { id: 2, title: 'Equipment Specs & Capacities', desc: 'Can identify dry vans, reefers, flatbeds, and legal limits.' },
    { id: 3, title: 'Geography & Time Zone Accuracy', desc: 'Flawless calculation of PKT ↔ US time differences.' },
    { id: 4, title: 'HOS & ELD Compliance', desc: 'Accurately plans trips respecting 11h/14h/30m rules.' },
    { id: 5, title: 'Carrier Onboarding Documents', desc: 'Understands W-9, COI, MC Certificate, and NOA.' },
    { id: 6, title: 'Load Board Mental Math', desc: 'Calculates rate per total mile within 10 seconds.' },
    { id: 7, title: 'Break-Even & Target Economics', desc: 'Understands dividing by (1 − fees) for carrier profitability.' },
    { id: 8, title: 'Broker Vetting & Fraud Shield', desc: 'Applies the 7-check protocol and spots domain impersonators.' },
    { id: 9, title: 'Booking & Paperwork Protocol', desc: 'Vets rate cons for penalties and executes 8-step dispatch.' },
    { id: 10, title: 'Accessorials & Claims Handling', desc: 'Billed detention accurately with proof and timely notice.' },
    { id: 11, title: 'Full Week Simulation Passed', desc: 'Operated Blue Line Transport 3-truck fleet with positive margin.' },
  ];

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-[#F5A524]">
            Readiness & Career Milestones
          </div>
          <h1 className="text-2xl font-extrabold text-[#13294B] dark:text-white mt-1">
            Dispatcher Readiness Checklist & Certificate
          </h1>
        </div>

        <Button
          variant="amber"
          onClick={() => setShowCertificate(!showCertificate)}
          icon={<Award className="w-4 h-4" />}
        >
          {showCertificate ? 'Hide Certificate' : 'View Certificate'}
        </Button>
      </div>

      {/* Printable Certificate View if Toggled */}
      {showCertificate && (
        <Card className="p-8 md:p-12 border-4 border-[#13294B] dark:border-[#F5A524] bg-white dark:bg-[#0E1A2B] text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5A524]/10 rounded-bl-full pointer-events-none" />
          <div className="text-xs font-mono font-bold uppercase tracking-widest text-[#C98500] dark:text-[#F5A524]">
            Official Training Record · Dispatch Academy
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-black text-[#13294B] dark:text-white">
              Certificate of Dispatch Mastery
            </h2>
            <p className="text-sm text-slate-500">
              This certifies that the following professional has successfully trained on carrier-side U.S. truck dispatching
            </p>
          </div>

          <div className="py-4 text-3xl font-extrabold text-[#13294B] dark:text-[#F5A524] underline decoration-[#F5A524] underline-offset-8">
            {userName}
          </div>

          <div className="max-w-xl mx-auto text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Having demonstrated practical competence in Hours of Service regulations, Lane Economics, Load Board Screening, Broker Fraud Vetting, and Voice Phone Negotiations across the 11-module curriculum.
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-500">
            <div>Date: October 2026</div>
            <div>Evaluation: 10/10 Readiness Verified</div>
            <Button size="sm" variant="outline" onClick={handlePrintCertificate} icon={<Printer className="w-3.5 h-3.5" />}>
              Print Certificate
            </Button>
          </div>
        </Card>
      )}

      {/* Readiness 11-Line Checklist */}
      <Card className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#13294B] dark:text-white">
              Module 11 Final Dispatcher Readiness Audit
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verify your confidence on the 11 core competencies before taking live carrier clients.
            </p>
          </div>
          <Pill label="11 Items" variant="navy" />
        </div>

        <div className="space-y-3">
          {readinessItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-start gap-4"
            >
              <div className="w-6 h-6 rounded-full bg-[#22A35A]/15 text-[#22A35A] flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                ✓
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-[#13294B] dark:text-white">
                  {item.id}. {item.title}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {item.desc}
                </div>
              </div>
              <Pill label="Ready" variant="book" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
