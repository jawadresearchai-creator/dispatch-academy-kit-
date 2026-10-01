import React, { useState } from 'react';
import {
  PlayCircle,
  Truck,
  TrendingUp,
  Award,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Button, Card, Pill, Stat } from '../../components/ui';

export const SimulationScreen: React.FC = () => {
  const [currentDay, setCurrentDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'>('Tue');
  const [fleetRevenue, setFleetRevenue] = useState(14750);
  const [totalMiles, setTotalMiles] = useState(5580);
  const [deadheadMiles, setDeadheadMiles] = useState(580);

  const rpmTotal = (fleetRevenue / totalMiles).toFixed(2);
  const deadheadPct = ((deadheadMiles / totalMiles) * 100).toFixed(1);

  const trucks = [
    {
      id: 'truck-12',
      name: 'Truck 12',
      driver: 'Dave',
      type: '53ft Dry Van',
      status: 'In Transit to Atlanta, GA',
      weekGross: 6150,
      miles: 2350,
      breakEven: 2.59,
      rpm: 2.62,
    },
    {
      id: 'truck-7',
      name: 'Truck 7',
      driver: 'Tariq',
      type: '53ft Reefer',
      status: 'Loading in Dallas, TX',
      weekGross: 5200,
      miles: 1850,
      breakEven: 2.80,
      rpm: 2.81,
    },
    {
      id: 'truck-3',
      name: 'Truck 3',
      driver: 'Sam',
      type: '53ft Dry Van',
      status: 'At delivery in Richmond, VA',
      weekGross: 3400,
      miles: 1380,
      breakEven: 2.59,
      rpm: 2.38, // flagged below break-even!
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-[#F5A524]">
            Capstone Game · Module 11
          </div>
          <h1 className="text-2xl font-extrabold text-[#13294B] dark:text-white mt-1">
            Blue Line Transport: Full Week Fleet Simulation
          </h1>
        </div>

        {/* Day Stepper */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold">
          {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const).map((day) => (
            <button
              key={day}
              onClick={() => setCurrentDay(day)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                currentDay === day
                  ? 'bg-[#13294B] text-white dark:bg-[#F5A524] dark:text-[#0E1A2B] shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Fleet KPI Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat
          label="Fleet Weekly Revenue"
          value={`$${fleetRevenue.toLocaleString()}`}
          subValue="Target: $14,500+"
          color="green"
        />
        <Stat
          label="Rate / Total Mile"
          value={`$${rpmTotal} / mi`}
          subValue="Goal: > $2.60/mi"
          color="amber"
        />
        <Stat
          label="Deadhead Percentage"
          value={`${deadheadPct}%`}
          subValue={`${deadheadMiles} deadhead miles`}
          color={Number(deadheadPct) > 12 ? 'red' : 'default'}
        />
        <Stat
          label="Active Trucks"
          value="3 / 3 Dispatched"
          subValue="Zero empty days"
          color="navy"
        />
      </div>

      {/* Fleet Trucks Status Table */}
      <Card className="p-6 space-y-4">
        <h3 className="text-base font-bold text-[#13294B] dark:text-white">
          Active Fleet Dispatch Roster
        </h3>

        <div className="space-y-3">
          {trucks.map((t) => {
            const isBelowBreakEven = t.rpm < t.breakEven;
            return (
              <div
                key={t.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#13294B] text-white flex items-center justify-center font-bold">
                    <Truck className="w-5 h-5 text-[#F5A524]" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#13294B] dark:text-white">
                      {t.name} ({t.driver})
                    </div>
                    <div className="text-slate-500">{t.type} · {t.status}</div>
                  </div>
                </div>

                <div className="flex items-center gap-6 font-mono text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Gross Revenue</span>
                    <span className="font-bold text-[#22A35A]">${t.weekGross.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Total Miles</span>
                    <span className="font-bold">{t.miles} mi</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">RPM Total</span>
                    <span
                      className={`font-bold ${
                        isBelowBreakEven ? 'text-[#E5484D]' : 'text-[#22A35A]'
                      }`}
                    >
                      ${t.rpm.toFixed(2)}/mi
                    </span>
                  </div>
                </div>

                <div>
                  {isBelowBreakEven ? (
                    <Pill label="Below Break-Even Flag" variant="pass" />
                  ) : (
                    <Pill label="Profitable" variant="book" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
