import React, { useState } from 'react';
import {
  Kanban,
  Truck,
  FileCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
} from 'lucide-react';
import { Button, Card, Pill } from '../../components/ui';

export const DispatchScreen: React.FC = () => {
  const columns = [
    { id: 'booked', title: '1. Booked' },
    { id: 'ratecon', title: '2. RC Signed' },
    { id: 'dispatched', title: '3. Dispatched' },
    { id: 'pickup', title: '4. At Pickup' },
    { id: 'in_transit', title: '5. In Transit' },
    { id: 'delivered', title: '6. Delivered' },
    { id: 'invoiced', title: '7. Invoiced' },
    { id: 'paid', title: '8. Paid' },
  ];

  const [loads, setLoads] = useState([
    {
      id: 'load-101',
      number: 'LD-12354',
      truck: 'Truck 12 (Dave)',
      origin: 'Bolingbrook, IL',
      destination: 'Atlanta, GA',
      rate: 2050,
      status: 'in_transit',
      eta: 'Tomorrow 11:30 AM ET',
    },
    {
      id: 'load-102',
      number: 'LD-12355',
      truck: 'Truck 7 (Tariq)',
      origin: 'Dallas, TX',
      destination: 'Memphis, TN',
      rate: 1450,
      status: 'pickup',
      eta: 'Today 2:00 PM CT',
    },
    {
      id: 'load-103',
      number: 'LD-12356',
      truck: 'Truck 3 (Sam)',
      origin: 'Allentown, PA',
      destination: 'Richmond, VA',
      rate: 980,
      status: 'ratecon',
      eta: 'Thursday 8:00 AM ET',
    },
  ]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-[#13294B] dark:text-[#F5A524]">
            Execution Board · Module 9
          </div>
          <h1 className="text-2xl font-extrabold text-[#13294B] dark:text-white mt-1">
            Active Fleet Dispatch Pipeline (8 Steps)
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Pill label="Simulated Live Clock (1×)" variant="navy" />
        </div>
      </div>

      {/* 8-Stage Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colLoads = loads.filter((l) => l.status === col.id);
          return (
            <div
              key={col.id}
              className="w-72 shrink-0 bg-slate-100 dark:bg-slate-900 rounded-2xl p-3 flex flex-col border border-slate-200/80 dark:border-slate-800 min-h-[500px]"
            >
              <div className="flex items-center justify-between pb-3 px-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold text-[#13294B] dark:text-white uppercase tracking-wider">
                  {col.title}
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {colLoads.length}
                </span>
              </div>

              <div className="flex-1 space-y-3 py-3 overflow-y-auto">
                {colLoads.map((load) => (
                  <Card key={load.id} variant="interactive" className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-[#13294B] dark:text-white">
                        {load.number}
                      </span>
                      <span className="font-mono font-bold text-[#22A35A]">
                        ${load.rate.toLocaleString()}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#F5A524]" />
                      <span>{load.truck}</span>
                    </div>

                    <div className="text-[11px] text-slate-500 font-medium">
                      {load.origin} → {load.destination}
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>ETA: {load.eta}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
