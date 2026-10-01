import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Fuel,
  Percent,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Layers,
} from 'lucide-react';
import {
  calculateCostModel,
  calculateRatePerTotalMile,
  calculateAskPrice,
  calculateWalkAway,
  evaluateLoadDecision,
  generateDieselSensitivityTable,
  type CostModelInputs,
} from '../../engines/economics';
import { Button, Card, Pill, Stat } from '../../components/ui';

export const EconomicsScreen: React.FC = () => {
  // Truck 12 Default Inputs (SPEC 8.4)
  const [costInputs, setCostInputs] = useState<CostModelInputs>({
    weeklyFixed: 1300,
    milesPerWeek: 2500,
    dieselPrice: 6.382,
    mpg: 6.5,
    variableCostNoFuel: 0.86,
    dispatchFeePct: 0.06,
    factoringFeePct: 0.03,
    profitCushion: 0.10,
  });

  const costModel = calculateCostModel(costInputs);

  // Load economics card inputs
  const [loadRate, setLoadRate] = useState(2050);
  const [loadedMiles, setLoadedMiles] = useState(715);
  const [deadheadMiles, setDeadheadMiles] = useState(85);

  const rpmTotal = calculateRatePerTotalMile(loadRate, loadedMiles, deadheadMiles);
  const decision = evaluateLoadDecision(rpmTotal, costModel.breakEven, costModel.target);
  const ask = calculateAskPrice(costModel.target, loadedMiles + deadheadMiles);
  const walkAway = calculateWalkAway(costModel.breakEven, loadedMiles + deadheadMiles);

  // Diesel sensitivity table
  const dieselTable = generateDieselSensitivityTable([4.00, 5.00, 6.00, 6.38, 6.70, 7.00], [2000, 2500, 3000]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-[#22A35A]">
            Economics Lab · Module 7
          </div>
          <h1 className="text-2xl font-extrabold text-[#13294B] dark:text-white mt-1">
            Load Economics & Break-Even Engineering
          </h1>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            setCostInputs({
              weeklyFixed: 1300,
              milesPerWeek: 2500,
              dieselPrice: 6.382,
              mpg: 6.5,
              variableCostNoFuel: 0.86,
              dispatchFeePct: 0.06,
              factoringFeePct: 0.03,
              profitCushion: 0.10,
            })
          }
          icon={<RotateCcw className="w-3.5 h-3.5" />}
        >
          Reset to Truck 12 Defaults
        </Button>
      </div>

      {/* Truck 12 Results Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat
          label="Fixed Cost / Mi"
          value={`$${costModel.fixedPerMile.toFixed(2)}`}
          subValue="$1,300 ÷ 2,500 mi"
          color="default"
        />
        <Stat
          label="Fuel Cost / Mi"
          value={`$${costModel.fuelPerMile.toFixed(2)}`}
          subValue={`$${costInputs.dieselPrice.toFixed(2)} ÷ ${costInputs.mpg} mpg`}
          color="default"
        />
        <Stat
          label="Break-Even (All-In)"
          value={`$${costModel.breakEven.toFixed(2)} / mi`}
          subValue="Zero profit threshold (9% fees)"
          color="amber"
        />
        <Stat
          label="Target Rate"
          value={`$${costModel.target.toFixed(2)} / mi`}
          subValue="Includes 10¢ cushion profit"
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Interactive Cost Builder Inputs */}
        <div className="space-y-4">
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#13294B] dark:text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#F5A524]" />
              <span>Carrier Operating Cost Model</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-500 font-semibold block">Weekly Fixed Costs ($)</label>
                <input
                  type="number"
                  value={costInputs.weeklyFixed}
                  onChange={(e) => setCostInputs({ ...costInputs, weeklyFixed: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-500 font-semibold block">Weekly Target Miles</label>
                <input
                  type="number"
                  value={costInputs.milesPerWeek}
                  onChange={(e) => setCostInputs({ ...costInputs, milesPerWeek: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-500 font-semibold flex justify-between">
                  <span>Diesel Price / Gallon</span>
                  <span className="font-mono text-[#F5A524]">${costInputs.dieselPrice.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min={3.5}
                  max={7.5}
                  step={0.05}
                  value={costInputs.dieselPrice}
                  onChange={(e) => setCostInputs({ ...costInputs, dieselPrice: Number(e.target.value) })}
                  className="w-full mt-1 accent-[#F5A524]"
                />
              </div>

              <div>
                <label className="text-slate-500 font-semibold block">Average Fleet MPG</label>
                <input
                  type="number"
                  step={0.1}
                  value={costInputs.mpg}
                  onChange={(e) => setCostInputs({ ...costInputs, mpg: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-500 font-semibold block">Variable Cost without Fuel ($/mi)</label>
                <input
                  type="number"
                  step={0.01}
                  value={costInputs.variableCostNoFuel}
                  onChange={(e) => setCostInputs({ ...costInputs, variableCostNoFuel: Number(e.target.value) })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between text-slate-500">
                <span>Dispatch (6%) + Factoring (3%):</span>
                <span className="font-mono font-bold text-[#13294B] dark:text-white">9.0% Fees</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Center: Live Load Economics Card */}
        <div className="space-y-4">
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#13294B] dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#22A35A]" />
              <span>Load Decision Card (Trip Evaluation)</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-500 font-semibold block">All-in Gross Rate ($)</label>
                <input
                  type="number"
                  value={loadRate}
                  onChange={(e) => setLoadRate(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-sm font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-500 font-semibold block">Loaded Miles</label>
                  <input
                    type="number"
                    value={loadedMiles}
                    onChange={(e) => setLoadedMiles(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-500 font-semibold block">Deadhead Miles</label>
                  <input
                    type="number"
                    value={deadheadMiles}
                    onChange={(e) => setDeadheadMiles(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              {/* Computed Economics Details */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Rate per Total Mile:</span>
                  <span className="font-mono text-base font-bold text-[#13294B] dark:text-white">
                    ${rpmTotal.toFixed(2)} / mi
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Target Ask Price ({loadedMiles + deadheadMiles} mi):</span>
                  <span className="font-mono">${ask.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Minimum Walk-Away:</span>
                  <span className="font-mono">${walkAway.toLocaleString()}</span>
                </div>
              </div>

              {/* Decision Pill & Explanation */}
              <div
                className={`p-4 rounded-xl border ${
                  decision.decision === 'BOOK'
                    ? 'bg-green-50 border-green-200 text-green-900 dark:bg-green-950/30 dark:border-green-900 dark:text-green-200'
                    : decision.decision === 'COUNTER'
                    ? 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-200'
                    : 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950/30 dark:border-red-900 dark:text-red-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold uppercase tracking-wider text-xs">Suggested Action</span>
                  <Pill
                    label={decision.decision}
                    variant={
                      decision.decision === 'BOOK'
                        ? 'book'
                        : decision.decision === 'COUNTER'
                        ? 'counter'
                        : 'pass'
                    }
                  />
                </div>
                <p className="text-xs leading-relaxed">{decision.reason}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Diesel Sensitivity Matrix (Module 7 Table) */}
        <div className="space-y-4">
          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-[#13294B] dark:text-white flex items-center gap-2">
              <Fuel className="w-4 h-4 text-[#F5A524]" />
              <span>Diesel Sensitivity Matrix</span>
            </h3>
            <p className="text-xs text-slate-500">
              Module 7 reference: how break-even and target shift as fuel prices change.
            </p>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-mono text-[11px]">
                    <th className="py-2">Diesel</th>
                    <th className="py-2">2,000 mi</th>
                    <th className="py-2">2,500 mi</th>
                    <th className="py-2">3,000 mi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                  {dieselTable.map((row) => (
                    <tr
                      key={row.diesel}
                      className={
                        Math.abs(row.diesel - costInputs.dieselPrice) < 0.1
                          ? 'bg-amber-100/50 dark:bg-amber-950/50 font-bold'
                          : ''
                      }
                    >
                      <td className="py-2 text-[#C98500] dark:text-[#F5A524]">${row.diesel.toFixed(2)}</td>
                      <td className="py-2">${row.be_2000.toFixed(2)}</td>
                      <td className="py-2 text-[#22A35A]">${row.be_2500.toFixed(2)}</td>
                      <td className="py-2">${row.be_3000.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
