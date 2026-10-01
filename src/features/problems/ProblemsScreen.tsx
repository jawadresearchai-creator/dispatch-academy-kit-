import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  DollarSign,
  FileText,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import { calculateDetention } from '../../engines/detention';
import { Button, Card, Pill } from '../../components/ui';

export const ProblemsScreen: React.FC = () => {
  // Detention clock interactive inputs
  const [apptTime, setApptTime] = useState(480); // 8:00 AM (8 * 60)
  const [arrivalTime, setArrivalTime] = useState(465); // 7:45 AM (7 * 60 + 45)
  const [outTime, setOutTime] = useState(720); // 12:00 PM (12 * 60)
  const [freeHours, setFreeHours] = useState(2);
  const [hourlyRate, setHourlyRate] = useState(50);
  const [lateVoids, setLateVoids] = useState(true);

  const detentionResult = calculateDetention({
    appointmentTimeMinutes: apptTime,
    arrivalTimeMinutes: arrivalTime,
    outTimeMinutes: outTime,
    freeHours,
    hourlyRate,
    billingIncrement: 'full_hour',
    lateArrivalVoids: lateVoids,
  });

  const formatMinutes = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:${m < 10 ? '0' : ''}${m} ${ampm}`;
  };

  const accessorials = [
    { title: 'Detention', standard: '$50/hr after 2 free hours', proof: 'Signed in/out time on BOL + driver timestamp photo' },
    { title: 'TONU (Truck Order Not Used)', standard: '$150 – $250 flat', proof: 'Driver reached pickup prior to cancellation call' },
    { title: 'Layover', standard: '$250 – $350 / day', proof: 'Shipper/receiver closed or delays driver overnight' },
    { title: 'Lumper Fee', standard: 'Actual receipt reimbursed', proof: 'Official printed lumper receipt with load #' },
    { title: 'Driver Assist', standard: '$75 – $150', proof: 'Rate con agreement authorizing tailgating freight' },
    { title: 'Extra Stop', standard: '$50 – $100 per stop', proof: 'BOL signed at intermediate stop' },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-[#E5484D]">
            Accessorials, Problems & Claims · Module 10
          </div>
          <h1 className="text-2xl font-extrabold text-[#13294B] dark:text-white mt-1">
            Detention Clock & Claims Simulator
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Detention Simulator */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-[#13294B] dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#F5A524]" />
                <span>Interactive Detention Clock</span>
              </h3>
              <Pill label="Module 10 Exercise" variant="navy" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-slate-500 font-semibold block">Scheduled Appointment</label>
                <div className="text-sm font-bold font-mono text-[#13294B] dark:text-white mt-1">
                  {formatMinutes(apptTime)}
                </div>
                <input
                  type="range"
                  min={360}
                  max={600}
                  step={15}
                  value={apptTime}
                  onChange={(e) => setApptTime(Number(e.target.value))}
                  className="w-full accent-[#13294B] mt-1"
                />
              </div>

              <div>
                <label className="text-slate-500 font-semibold block">Driver Arrival Time</label>
                <div className="text-sm font-bold font-mono text-[#22A35A] mt-1">
                  {formatMinutes(arrivalTime)}
                </div>
                <input
                  type="range"
                  min={360}
                  max={660}
                  step={15}
                  value={arrivalTime}
                  onChange={(e) => setArrivalTime(Number(e.target.value))}
                  className="w-full accent-[#22A35A] mt-1"
                />
              </div>

              <div>
                <label className="text-slate-500 font-semibold block">Out / Departure Time</label>
                <div className="text-sm font-bold font-mono text-[#E5484D] mt-1">
                  {formatMinutes(outTime)}
                </div>
                <input
                  type="range"
                  min={480}
                  max={960}
                  step={15}
                  value={outTime}
                  onChange={(e) => setOutTime(Number(e.target.value))}
                  className="w-full accent-[#E5484D] mt-1"
                />
              </div>
            </div>

            {/* Detention Results Output */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 font-semibold">Total Detention Billed:</span>
                <span className="text-2xl font-bold font-mono text-[#22A35A]">
                  ${detentionResult.amount.toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300">
                {detentionResult.explanation}
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Accessorials Reference Cards */}
        <div className="space-y-4">
          <Card className="p-5 space-y-4">
            <h3 className="text-xs font-bold text-[#13294B] dark:text-white uppercase tracking-wider">
              Standard Accessorials Menu
            </h3>
            <div className="space-y-2 text-xs">
              {accessorials.map((acc, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1"
                >
                  <div className="font-bold text-[#13294B] dark:text-white flex items-center justify-between">
                    <span>{acc.title}</span>
                    <span className="text-[#C98500] dark:text-[#F5A524] font-mono">{acc.standard}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">Proof: {acc.proof}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
