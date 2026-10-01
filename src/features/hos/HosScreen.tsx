import React, { useState } from 'react';
import {
  CalendarCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  RotateCcw,
} from 'lucide-react';
import {
  evaluateDutySequence,
  planTrip,
  type DutyEvent,
  type TripPlanStop,
} from '../../engines/hos';
import { Button, Card, Pill } from '../../components/ui';

export const HosScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'planner' | 'eld'>('planner');

  // Trip planner state (Preset: Load 2 Bolingbrook -> Atlanta)
  const [speedMph, setSpeedMph] = useState(50);
  const [startHour, setStartHour] = useState(7.5); // 7:30 AM
  const [stops, setStops] = useState<TripPlanStop[]>([
    {
      type: 'pickup',
      location: 'Bolingbrook, IL',
      distanceFromPreviousMiles: 0,
      apptWindowStart: '08:00',
      apptWindowEnd: '12:00',
      loadingMinutes: 120,
    },
    {
      type: 'delivery',
      location: 'Atlanta, GA',
      distanceFromPreviousMiles: 715,
      apptWindowStart: '13:00',
      apptWindowEnd: '17:00',
      loadingMinutes: 90,
    },
  ]);

  const tripPlan = planTrip(stops, speedMph, 11, 14);

  // ELD Grid state: 24 hour blocks (0 to 23), 4 rows
  // Statuses: 'off' | 'sleeper' | 'driving' | 'on_duty'
  const [eldGrid, setEldGrid] = useState<Array<'off' | 'sleeper' | 'driving' | 'on_duty'>>([
    'off', 'off', 'off', 'off', 'off', 'off', 'off',
    'on_duty', // 7:00
    'driving', 'driving', 'driving', 'driving', // 8-11
    'off', // 12:00 (30 min break)
    'driving', 'driving', 'driving', 'driving', 'driving', 'driving', // 13-18
    'on_duty', // 19:00
    'sleeper', 'sleeper', 'sleeper', 'sleeper', // 20-23
  ]);

  const dutyEvents: DutyEvent[] = eldGrid.map((st) => ({
    status: st,
    durationHours: 1,
  }));

  const hosStatus = evaluateDutySequence(dutyEvents);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-[#7C5CC4]">
            Hours of Service & Compliance · Module 4
          </div>
          <h1 className="text-2xl font-extrabold text-[#13294B] dark:text-white mt-1">
            HOS Trip Planner & 24-Hour ELD Log Lab
          </h1>
        </div>

        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('planner')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'planner'
                ? 'bg-white dark:bg-[#13294B] text-[#13294B] dark:text-white shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Trip Planner
          </button>
          <button
            onClick={() => setActiveTab('eld')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'eld'
                ? 'bg-white dark:bg-[#13294B] text-[#13294B] dark:text-white shadow-xs'
                : 'text-slate-500'
            }`}
          >
            ELD Log Grid
          </button>
        </div>
      </div>

      {/* Coercion Warning Banner */}
      <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 flex items-start gap-3 text-xs text-red-900 dark:text-red-200">
        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">49 CFR § 390.6 Coercion Warning:</span> Dispatchers are strictly prohibited from pressuring, coercing, or scheduling a motor carrier or driver to operate in violation of federal Hours of Service safety rules.
        </div>
      </div>

      {activeTab === 'planner' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <div className="space-y-4">
            <Card className="p-5 space-y-4">
              <h3 className="text-sm font-bold text-[#13294B] dark:text-white">
                Trip Inputs (Preset: Load 2)
              </h3>

              <div>
                <label className="text-xs font-semibold text-slate-500">Departure Time</label>
                <div className="text-xs font-mono font-bold mt-1 text-[#13294B] dark:text-white">
                  Wednesday 7:30 AM CT
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 flex justify-between">
                  <span>Average Speed</span>
                  <span className="font-mono font-bold">{speedMph} mph</span>
                </label>
                <input
                  type="range"
                  min={40}
                  max={65}
                  value={speedMph}
                  onChange={(e) => setSpeedMph(Number(e.target.value))}
                  className="w-full accent-[#7C5CC4] mt-1"
                />
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                <div className="font-bold text-[#13294B] dark:text-white">Lane Route:</div>
                <div className="text-slate-600 dark:text-slate-300">
                  Bolingbrook, IL → Atlanta, GA (715 mi)
                </div>
                <div className="text-[11px] text-slate-500">
                  Required 10-hour sleeper break: Near Manchester, TN.
                </div>
              </div>

              {/* Feasibility Verdict */}
              <div
                className={`p-4 rounded-xl border text-xs ${
                  tripPlan.feasibleVerdict === 'feasible'
                    ? 'bg-green-50 border-green-200 text-green-900 dark:bg-green-950/30 dark:border-green-900 dark:text-green-200'
                    : tripPlan.feasibleVerdict === 'tight'
                    ? 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-200'
                    : 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950/30 dark:border-red-900 dark:text-red-200'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5 uppercase tracking-wider mb-1">
                  {tripPlan.feasibleVerdict === 'feasible' ? (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  )}
                  <span>Verdict: {tripPlan.feasibleVerdict.replace('_', ' ')}</span>
                </div>
                <p>{tripPlan.reason}</p>
              </div>
            </Card>
          </div>

          {/* Timeline View */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#13294B] dark:text-white">
                  HOS Gantt Execution Schedule
                </h3>
                <div className="text-xs text-slate-500 font-mono">
                  Total Driving: {tripPlan.totalDrivingHours}h · {tripPlan.restPeriods10h} Rest Period(s)
                </div>
              </div>

              <div className="space-y-3">
                {tripPlan.timeline.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                      item.isDriving
                        ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/60 text-blue-900 dark:text-blue-200'
                        : item.isRest
                        ? 'bg-purple-50/60 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900/60 text-purple-900 dark:text-purple-200'
                        : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="font-bold w-24">{item.activity}</div>
                      <div className="text-slate-600 dark:text-slate-300 font-medium">
                        {item.description}
                      </div>
                    </div>
                    <div className="font-mono font-bold shrink-0">
                      {Math.floor(item.durationMinutes / 60)}h {item.durationMinutes % 60}m
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      ) : (
        /* ELD Grid Drawing Exercise */
        <Card className="p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#13294B] dark:text-white">
                24-Hour ELD Duty Status Grid
              </h3>
              <p className="text-xs text-slate-500">
                Click cells to cycle status (Off Duty → Sleeper Berth → Driving → On Duty)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setEldGrid(new Array(24).fill('off'))
                }
                icon={<RotateCcw className="w-3.5 h-3.5" />}
              >
                Reset Day
              </Button>
            </div>
          </div>

          {/* 24 Hour Interactive Grid */}
          <div className="overflow-x-auto">
            <div className="min-w-[700px] border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              {/* Header hours 0 to 23 */}
              <div className="grid grid-cols-24 bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-center font-bold border-b border-slate-200 dark:border-slate-700">
                {Array.from({ length: 24 }).map((_, h) => (
                  <div key={h} className="py-1 border-r border-slate-200 dark:border-slate-700 last:border-r-0">
                    {h}
                  </div>
                ))}
              </div>

              {/* Status blocks */}
              <div className="grid grid-cols-24 h-16 divide-x divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
                {eldGrid.map((status, hour) => {
                  const colors = {
                    off: 'bg-slate-100 dark:bg-slate-800/40 hover:bg-slate-200',
                    sleeper: 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold',
                    driving: 'bg-blue-500 text-white font-bold',
                    on_duty: 'bg-amber-400 text-slate-950 font-bold',
                  };

                  return (
                    <button
                      key={hour}
                      onClick={() => {
                        const nextStatus: Record<string, 'off' | 'sleeper' | 'driving' | 'on_duty'> = {
                          off: 'sleeper',
                          sleeper: 'driving',
                          driving: 'on_duty',
                          on_duty: 'off',
                        };
                        const updated = [...eldGrid];
                        updated[hour] = nextStatus[status];
                        setEldGrid(updated);
                      }}
                      className={`h-full flex flex-col items-center justify-center text-[10px] uppercase select-none transition-colors ${colors[status]}`}
                      title={`Hour ${hour}:00 - ${status.toUpperCase()}`}
                    >
                      <span className="truncate px-0.5">{status === 'on_duty' ? 'ON' : status === 'sleeper' ? 'SB' : status === 'driving' ? 'D' : 'OFF'}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Checker Verdict & Clocks */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-slate-400 font-bold uppercase">Total Driving</span>
              <div className="text-xl font-bold font-mono text-[#13294B] dark:text-white mt-1">
                {hosStatus.drivingHours} / 11 h
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-slate-400 font-bold uppercase">Drive Clock Left</span>
              <div className="text-xl font-bold font-mono text-[#22A35A] mt-1">
                {hosStatus.hoursRemainingDrive} h
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-slate-400 font-bold uppercase">14h Window Left</span>
              <div className="text-xl font-bold font-mono text-[#F5A524] mt-1">
                {hosStatus.hoursRemainingWindow} h
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-slate-400 font-bold uppercase">Compliance</span>
              <div className="text-xl font-bold mt-1">
                {hosStatus.isLegal ? (
                  <span className="text-[#22A35A] flex items-center gap-1">
                    <CheckCircle2 className="w-5 h-5" /> Legal
                  </span>
                ) : (
                  <span className="text-[#E5484D] flex items-center gap-1">
                    <XCircle className="w-5 h-5" /> Violation
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Violations List */}
          {hosStatus.violations.length > 0 && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs space-y-2 text-red-900 dark:text-red-200">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span>HOS Violations Detected:</span>
              </div>
              <ul className="list-disc list-inside space-y-1">
                {hosStatus.violations.map((v, i) => (
                  <li key={i}>{v}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
