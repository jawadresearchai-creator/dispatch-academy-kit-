import React, { useState } from 'react';
import {
  Database,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  courseData,
  quizzesData,
  glossaryData,
  drillsData,
  roleplaysData,
  citiesData,
} from '../../data/loader';
import { haversineDistanceMiles, estimateRoadMiles } from '../../engines/distance';
import { pktDifferenceHours } from '../../engines/timezones';
import { calculateCostModel, calculateAskPrice, calculateWalkAway } from '../../engines/economics';
import { calculateDetention } from '../../engines/detention';
import { Button, Card, Stat } from '../../components/ui';

export const DevScreen: React.FC = () => {
  const [testResults, setTestResults] = useState<Array<{ name: string; pass: boolean; details: string }>>([]);

  // Counts verification
  const counts = {
    modules: courseData.modules?.length || 0,
    pages: courseData.pages?.length || 0,
    quizzes: (quizzesData || []).reduce((acc, q) => acc + (q.items?.length || 0), 0),
    glossary: glossaryData?.length || 0,
    drills: drillsData?.length || 0,
    roleplays: roleplaysData?.length || 0,
    cities: citiesData.cities?.length || 0,
  };

  const runEngineTests = () => {
    const results: Array<{ name: string; pass: boolean; details: string }> = [];

    // Test 1: Distance (Chicago -> Atlanta straight-line 589 mi -> road ≈ 695)
    const chicago = { lat: 41.88, lon: -87.63 };
    const atlanta = { lat: 33.75, lon: -84.39 };
    const straight = haversineDistanceMiles(chicago.lat, chicago.lon, atlanta.lat, atlanta.lon);
    const road = estimateRoadMiles(straight);
    const passDist = straight >= 585 && straight <= 595 && road === 695;
    results.push({
      name: 'Distance Haversine & Road Factor (SPEC 8.1)',
      pass: passDist,
      details: `Chicago → Atlanta: straight=${straight} mi, road=${road} mi (Expected 695 mi)`,
    });

    // Test 2: Time Zones (Chicago EDT/CDT vs PKT)
    const diffOct = pktDifferenceHours('America/Chicago', new Date('2026-10-14T09:00:00Z'));
    results.push({
      name: 'Time Zone Calculation Engine (SPEC 8.2)',
      pass: diffOct === 10,
      details: `October (CDT UTC-5) vs PKT (UTC+5) offset difference = +${diffOct}h`,
    });

    // Test 3: Economics Truck 12 (SPEC 8.4)
    const cost = calculateCostModel({
      weeklyFixed: 1300,
      milesPerWeek: 2500,
      dieselPrice: 6.382,
      mpg: 6.5,
      variableCostNoFuel: 0.86,
      dispatchFeePct: 0.06,
      factoringFeePct: 0.03,
      profitCushion: 0.10,
    });
    const ask = calculateAskPrice(cost.target, 800);
    const walkAway = calculateWalkAway(cost.breakEven, 800);
    const passEcon =
      cost.fixedPerMile === 0.52 &&
      cost.fuelPerMile === 0.98 &&
      cost.breakEven === 2.59 &&
      cost.target === 2.70 &&
      ask === 2160 &&
      walkAway === 2072;
    results.push({
      name: 'Economics Exact Course Formulas (SPEC 8.4)',
      pass: passEcon,
      details: `fixed=$${cost.fixedPerMile}, fuel=$${cost.fuelPerMile}, BE=$${cost.breakEven}, target=$${cost.target}, ask=$${ask}, walkAway=$${walkAway}`,
    });

    // Test 4: Detention Cases (SPEC 8.7)
    // 4 hours on site, 2 hrs free, $50/hr -> $100
    const detCaseA = calculateDetention({
      appointmentTimeMinutes: 480,
      arrivalTimeMinutes: 480,
      outTimeMinutes: 720,
      freeHours: 2,
      hourlyRate: 50,
      billingIncrement: 'full_hour',
      lateArrivalVoids: true,
    });
    results.push({
      name: 'Detention Billing Engine (SPEC 8.7)',
      pass: detCaseA.amount === 100,
      details: `Case A: $${detCaseA.amount} (Expected $100.00)`,
    });

    setTestResults(results);
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-[#13294B] dark:text-[#F5A524]">
            Development & Quality Assurance
          </div>
          <h1 className="text-2xl font-extrabold text-[#13294B] dark:text-white mt-1">
            Content Audit & Engine Unit Tests
          </h1>
        </div>

        <Button variant="amber" onClick={runEngineTests} icon={<Play className="w-4 h-4" />}>
          Run Engine Tests
        </Button>
      </div>

      {/* Content Counts Check (PROMPT 0 requirement) */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-[#13294B] dark:text-white">
          Content Pack Integrity Audit (content/)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Modules</span>
            <div className="text-xl font-bold font-mono text-[#13294B] dark:text-white mt-0.5">
              {counts.modules} / 11
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Handbook Pages</span>
            <div className="text-xl font-bold font-mono text-[#22A35A] mt-0.5">
              {counts.pages} / 292
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Quiz Qs</span>
            <div className="text-xl font-bold font-mono text-[#F5A524] mt-0.5">
              {counts.quizzes} / 128
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Glossary Terms</span>
            <div className="text-xl font-bold font-mono text-[#13294B] dark:text-white mt-0.5">
              {counts.glossary} / 230
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Speaking Drills</span>
            <div className="text-xl font-bold font-mono text-[#0E9F9A] mt-0.5">
              {counts.drills} / 12
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Role-Plays</span>
            <div className="text-xl font-bold font-mono text-[#7C5CC4] mt-0.5">
              {counts.roleplays} / 18
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Freight Cities</span>
            <div className="text-xl font-bold font-mono text-[#22A35A] mt-0.5">
              {counts.cities} / 103
            </div>
          </div>
        </div>
      </Card>

      {/* Engine Tests Runner Results */}
      {testResults.length > 0 && (
        <Card className="p-6 space-y-4">
          <h3 className="text-base font-bold text-[#13294B] dark:text-white">
            Unit Test Execution Results (src/engines/)
          </h3>

          <div className="space-y-3">
            {testResults.map((t, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="font-bold text-[#13294B] dark:text-white flex items-center gap-2">
                    {t.pass ? (
                      <CheckCircle2 className="w-4 h-4 text-[#22A35A]" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[#E5484D]" />
                    )}
                    <span>{t.name}</span>
                  </div>
                  <div className="text-slate-500 font-mono text-[11px]">{t.details}</div>
                </div>

                <span
                  className={`font-bold uppercase tracking-wider px-2 py-0.5 rounded text-[10px] ${
                    t.pass
                      ? 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                  }`}
                >
                  {t.pass ? 'PASS' : 'FAIL'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
