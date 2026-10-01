import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileCheck,
  Building,
  Mail,
  Lock,
} from 'lucide-react';
import { Button, Card, Pill } from '../../components/ui';

export const VettingScreen: React.FC = () => {
  const [selectedCase, setSelectedCase] = useState<string>('caseA');
  const [userDecision, setUserDecision] = useState<'PASS' | 'CAUTION' | 'STOP' | null>(null);

  const cases = [
    {
      id: 'caseA',
      name: 'Case A: Established Tier-1 Broker',
      company: 'Heartland Logistics Inc.',
      mc: 'MC-248910',
      authorityAge: '14 years',
      bondStatus: 'Active BMC-84 ($75,000)',
      email: 'dispatch@heartlandlogistics.com',
      website: 'www.heartlandlogistics.com',
      creditScore: 94,
      daysToPay: 26,
      factorStatus: 'Approved by Factor (No restrictions)',
      correctDecision: 'PASS',
      explanation: 'Established authority (>2 yrs), active bond, verified email domain, strong credit score and factor approved.',
    },
    {
      id: 'caseB',
      name: 'Case B: Impersonator Domain Red Flag',
      company: 'Worldwide Express Freight',
      mc: 'MC-510294',
      authorityAge: '8 years',
      bondStatus: 'Active BMC-84 ($75,000)',
      email: 'loads-worldwidefreight@gmail.com', // Free webmail red flag!
      website: 'www.worldwidefreight.com',
      creditScore: 91,
      daysToPay: 28,
      factorStatus: 'Broker approved, but suspicious email',
      correctDecision: 'STOP',
      explanation: 'Fraud impersonation pattern! Broker authority is legit, but caller is using a free Gmail address (@gmail.com) instead of the verified domain.',
    },
    {
      id: 'caseC',
      name: 'Case C: Pending Bond Cancellation',
      company: 'Apex Midwest Trans',
      mc: 'MC-981203',
      authorityAge: '3 years',
      bondStatus: 'Cancellation pending (effective in 5 days)',
      email: 'ops@apexmidwest.com',
      website: 'www.apexmidwest.com',
      creditScore: 65,
      daysToPay: 55,
      factorStatus: 'Factor flagged: Do Not Load',
      correctDecision: 'STOP',
      explanation: 'Critical danger: BMC-84 bond has a pending cancellation on FMCSA L&I. You risk freight loss and zero payment.',
    },
    {
      id: 'caseD',
      name: 'Case D: New Authority (< 6 Months)',
      company: 'Blue Sky Freight LLC',
      mc: 'MC-1628490',
      authorityAge: '4 months',
      bondStatus: 'Active BMC-84 ($75,000)',
      email: 'john@blueskyfreight.com',
      website: 'www.blueskyfreight.com',
      creditScore: 72,
      daysToPay: 35,
      factorStatus: 'Conditional: Quick-Pay or Carrier Approval Required',
      correctDecision: 'CAUTION',
      explanation: 'Authority is under 6 months old. Many factoring companies do not purchase invoices for carriers under 6-12 months. Requires quick-pay or owner approval.',
    },
  ];

  const current = cases.find((c) => c.id === selectedCase) || cases[0];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-[#13294B] dark:text-[#F5A524]">
            Broker Vetting & Fraud Lab · Module 8
          </div>
          <h1 className="text-2xl font-extrabold text-[#13294B] dark:text-white mt-1">
            7-Check Vetting & Fraud Defense Workflow
          </h1>
        </div>

        {/* Case selector */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {cases.map((c) => (
            <button
              key={c.id}
              onClick={() => { setSelectedCase(c.id); setUserDecision(null); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors border ${
                selectedCase === c.id
                  ? 'bg-[#13294B] text-white border-[#13294B] dark:bg-[#F5A524] dark:text-[#0E1A2B]'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              {c.name.split(':')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Simulated SAFER & L&I Records */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-[#13294B] dark:text-[#F5A524]" />
                <h3 className="text-base font-bold text-[#13294B] dark:text-white">
                  {current.company}
                </h3>
              </div>
              <Pill label="Simulated SAFER Record" variant="navy" />
            </div>

            {/* Simulated SAFER Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Operating Authority</span>
                <div className="font-bold text-sm text-[#13294B] dark:text-white mt-0.5">{current.mc}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Authority Age</span>
                <div className="font-bold text-sm text-[#13294B] dark:text-white mt-0.5">{current.authorityAge}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Credit Score / DTP</span>
                <div className="font-bold text-sm text-[#13294B] dark:text-white mt-0.5">{current.creditScore}/100 ({current.daysToPay}d)</div>
              </div>
            </div>

            {/* FMCSA Licensing & Insurance (L&I) Table */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="font-bold text-[#13294B] dark:text-white flex items-center justify-between">
                <span>FMCSA L&I Filings ($75,000 Broker Security):</span>
                <span className="font-mono text-[#22A35A] font-bold">49 U.S.C. § 13906</span>
              </div>
              <div className="text-slate-600 dark:text-slate-300">
                Bond Status: <span className="font-bold">{current.bondStatus}</span>
              </div>
            </div>

            {/* Email & Contact Verification */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="font-bold text-[#13294B] dark:text-white">
                Contact & Domain Match Check:
              </div>
              <div className="flex flex-col sm:flex-row justify-between gap-2 text-slate-600 dark:text-slate-300">
                <div>Official Registered Website: <span className="font-mono font-bold">{current.website}</span></div>
                <div>Incoming Sender Email: <span className="font-mono font-bold text-[#F5A524]">{current.email}</span></div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Decision Action & Feedback */}
        <div className="space-y-4">
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#13294B] dark:text-white">
              Vetting Decision
            </h3>
            <p className="text-xs text-slate-500">
              Based on the 7-check vetting protocol, what is your dispatch verdict?
            </p>

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start border-green-500 text-green-600 hover:bg-green-50"
                onClick={() => setUserDecision('PASS')}
              >
                PASS — Approved to Book
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-amber-500 text-amber-600 hover:bg-amber-50"
                onClick={() => setUserDecision('CAUTION')}
              >
                CAUTION — Verify or Request Quick-Pay
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-red-500 text-red-600 hover:bg-red-50"
                onClick={() => setUserDecision('STOP')}
              >
                STOP — Fraud / High Financial Risk
              </Button>
            </div>

            {userDecision && (
              <div
                className={`p-4 rounded-xl border text-xs space-y-2 ${
                  userDecision === current.correctDecision
                    ? 'bg-green-50 border-green-200 text-green-900 dark:bg-green-950/30 dark:border-green-900 dark:text-green-200'
                    : 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950/30 dark:border-red-900 dark:text-red-200'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 uppercase">
                  {userDecision === current.correctDecision ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span>
                    {userDecision === current.correctDecision ? 'Correct Decision!' : 'Incorrect Decision'}
                  </span>
                </div>
                <p className="leading-relaxed">{current.explanation}</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
