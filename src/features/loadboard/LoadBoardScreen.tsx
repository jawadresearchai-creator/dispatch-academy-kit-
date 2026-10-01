import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  PhoneCall,
  ShieldCheck,
  Check,
  ChevronRight,
  TrendingUp,
  Truck,
  RotateCcw,
  Clock,
  DollarSign,
  Award,
  ArrowUpDown,
  BookOpen,
} from 'lucide-react';
import { practiceData } from '../../data/loader';
import {
  evaluateLoadScreening,
  normalizeLoad,
  type PracticeLoadItem,
  type ScreeningCriteria,
} from '../../engines/screening';
import { calculateAskPrice, calculateWalkAway, calculateRatePerTotalMile } from '../../engines/economics';
import { calculateDrivingHours } from '../../engines/distance';
import { db } from '../../db';
import { Button, Card, Pill, Drawer, Stat } from '../../components/ui';

export const LoadBoardScreen: React.FC = () => {
  const navigate = useNavigate();

  // Active truck selection
  const [selectedTruckId, setSelectedTruckId] = useState<'12' | '7' | '3'>('12');
  const [boardMode, setBoardMode] = useState<'module6' | 'module11' | 'live'>('module6');
  const [showRpmTotal, setShowRpmTotal] = useState(false);
  const [selectedLoad, setSelectedLoad] = useState<PracticeLoadItem | null>(null);

  // Filter form state
  const [originFilter, setOriginFilter] = useState('');
  const [destFilter, setDestFilter] = useState('');
  const [equipFilter, setEquipFilter] = useState('ALL');
  const [maxDho, setMaxDho] = useState(150);

  // Sorting state
  const [sortBy, setSortBy] = useState<'rate' | 'rpmTot' | 'trip' | 'dho' | 'cs'>('rpmTot');
  const [sortDesc, setSortDesc] = useState(true);

  // User screening choices: loadId -> 'CALL' | 'PLAN' | 'REJECT'
  const [userDecisions, setUserDecisions] = useState<Record<string, 'CALL' | 'PLAN' | 'REJECT'>>({});
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  // Truck criteria
  const truckSpecs = {
    '12': {
      name: 'Truck 12 (Carlos)',
      trailer: '53ft Dry Van (No air-ride)',
      trailerType: 'V',
      hasAirRide: false,
      maxWeight: 44500,
      breakEven: 2.59,
      target: 2.70,
      home: 'Joliet, IL',
    },
    '7': {
      name: 'Truck 7 (Maria)',
      trailer: '53ft Reefer (FSMA)',
      trailerType: 'R',
      hasAirRide: true,
      maxWeight: 43000,
      breakEven: 2.80,
      target: 2.95,
      home: 'Dallas, TX',
    },
    '3': {
      name: 'Truck 3 (Sam)',
      trailer: '53ft Dry Van',
      trailerType: 'V',
      hasAirRide: true,
      maxWeight: 44000,
      breakEven: 2.59,
      target: 2.70,
      home: 'Atlanta, GA',
    },
  };

  const currentTruck = truckSpecs[selectedTruckId];

  const screeningCriteria: ScreeningCriteria = {
    minRatePerTotalMile: currentTruck.breakEven,
    targetRatePerTotalMile: currentTruck.target,
    maxDeadheadMiles: maxDho,
    trailerType: currentTruck.trailerType,
    maxWeightLbs: currentTruck.maxWeight,
    trailerLengthFt: 53,
    hasAirRide: currentTruck.hasAirRide,
  };

  // Load datasets based on board mode
  const rawLoads = useMemo(() => {
    if (boardMode === 'module6') {
      const m6 = practiceData?.module6Board;
      const extra = m6?.extraFacts || {};
      const answers = m6?.answers;
      return (m6?.loads || []).map((l: any) => {
        const norm = normalizeLoad(l, answers);
        if (extra[String(l.id)]) {
          norm.comments = extra[String(l.id)];
        }
        return norm;
      });
    } else if (boardMode === 'module11') {
      const sim = practiceData?.module11Simulation?.loads || [];
      return sim.map((l: any, idx: number) => {
        return normalizeLoad({
          id: `sim-${idx + 1}`,
          age: '0:20',
          pickupDay: 'Tue',
          equipment: l.details?.toLowerCase().includes('reefer') ? 'R' : 'V',
          fullPartial: 'F',
          dhO: l.dh || 0,
          origin: l.lane?.split('→')[0]?.trim() || '',
          destination: l.lane?.split('→')[1]?.trim() || '',
          tripMiles: l.loaded || 0,
          rate: l.rate,
          weightLb: 40000,
          lengthFt: 53,
          broker: l.broker?.split('·')[0]?.trim() || 'Broker',
          creditScore: 92,
          daysToPay: 30,
          comments: l.details,
        });
      });
    } else {
      // Live simulated freight board
      return [
        normalizeLoad({ id: 'live-1', age: '0:02', pickupDay: 'Today', equipment: 'V', fullPartial: 'F', dhO: 15, origin: 'Joliet, IL', destination: 'Columbus, OH', tripMiles: 345, rate: 1050, weightLb: 39000, lengthFt: 53, broker: 'Apex Logistics', creditScore: 94, daysToPay: 28 }),
        normalizeLoad({ id: 'live-2', age: '0:05', pickupDay: 'Today', equipment: 'V', fullPartial: 'F', dhO: 28, origin: 'Chicago, IL', destination: 'Atlanta, GA', tripMiles: 715, rate: 2050, weightLb: 42000, lengthFt: 53, broker: 'Peachtree Freight', creditScore: 92, daysToPay: 33 }),
        normalizeLoad({ id: 'live-3', age: '0:12', pickupDay: 'Tomorrow', equipment: 'R', fullPartial: 'F', dhO: 40, origin: 'Elgin, IL', destination: 'Dallas, TX', tripMiles: 920, rate: 2750, weightLb: 41000, lengthFt: 53, broker: 'Northstar Cold', creditScore: 96, daysToPay: 24 }),
        normalizeLoad({ id: 'live-4', age: '0:18', pickupDay: 'Today', equipment: 'V', fullPartial: 'P', dhO: 8, origin: 'Bolingbrook, IL', destination: 'Indianapolis, IN', tripMiles: 195, rate: 600, weightLb: 14000, lengthFt: 24, broker: 'Midwest Express', creditScore: 88, daysToPay: 31 }),
        normalizeLoad({ id: 'live-5', age: '0:22', pickupDay: 'Today', equipment: 'V', fullPartial: 'F', dhO: 160, origin: 'Rockford, IL', destination: 'Nashville, TN', tripMiles: 470, rate: 1100, weightLb: 44000, lengthFt: 53, broker: 'Delta Route', creditScore: 85, daysToPay: 35 }),
        normalizeLoad({ id: 'live-6', age: '0:35', pickupDay: 'Today', equipment: 'VA', fullPartial: 'F', dhO: 12, origin: 'Chicago, IL', destination: 'Charlotte, NC', tripMiles: 760, rate: 2100, weightLb: 38000, lengthFt: 53, broker: 'Carolina Link', creditScore: 97, daysToPay: 25, comments: 'Air-ride required' }),
      ];
    }
  }, [boardMode]);

  // Filtered & Sorted loads
  const displayedLoads = useMemo(() => {
    let result = rawLoads.filter((load) => {
      if (originFilter && !load.origin.toLowerCase().includes(originFilter.toLowerCase())) return false;
      if (destFilter && !load.destination.toLowerCase().includes(destFilter.toLowerCase())) return false;
      if (equipFilter !== 'ALL') {
        if (equipFilter === 'V' && !['V', 'VA'].includes(load.truckType || '')) return false;
        if (equipFilter === 'R' && load.truckType !== 'R') return false;
      }
      if (load.dho !== undefined && load.dho > maxDho) return false;
      return true;
    });

    // Sorting
    result.sort((a, b) => {
      let valA = 0;
      let valB = 0;
      const totA = a.tripMiles + (a.dho || 0);
      const totB = b.tripMiles + (b.dho || 0);

      if (sortBy === 'rate') {
        valA = a.rate || 0;
        valB = b.rate || 0;
      } else if (sortBy === 'rpmTot') {
        valA = a.rate && totA > 0 ? a.rate / totA : 0;
        valB = b.rate && totB > 0 ? b.rate / totB : 0;
      } else if (sortBy === 'trip') {
        valA = a.tripMiles;
        valB = b.tripMiles;
      } else if (sortBy === 'dho') {
        valA = a.dho || 0;
        valB = b.dho || 0;
      } else if (sortBy === 'cs') {
        valA = a.creditScore || 0;
        valB = b.creditScore || 0;
      }

      return sortDesc ? valB - valA : valA - valB;
    });

    return result;
  }, [rawLoads, originFilter, destFilter, equipFilter, maxDho, sortBy, sortDesc]);

  // Screening Session Stats
  const sessionStats = useMemo(() => {
    let evaluatedCount = 0;
    let correctCount = 0;

    displayedLoads.forEach((load) => {
      const decision = userDecisions[String(load.id)];
      if (decision) {
        evaluatedCount++;
        const ideal = evaluateLoadScreening(load, screeningCriteria);
        if (decision === ideal.decision) {
          correctCount++;
        }
      }
    });

    const accuracyPct = evaluatedCount > 0 ? Math.round((correctCount / evaluatedCount) * 100) : 0;
    return {
      evaluatedCount,
      totalCount: displayedLoads.length,
      correctCount,
      accuracyPct,
    };
  }, [displayedLoads, userDecisions, screeningCriteria]);

  const handleScreenChoice = (loadId: string | number, choice: 'CALL' | 'PLAN' | 'REJECT') => {
    setUserDecisions((prev) => ({ ...prev, [String(loadId)]: choice }));
  };

  const handleBookLoad = async (load: PracticeLoadItem) => {
    const totalMiles = load.tripMiles + (load.dho || 0);
    const rateVal = load.rate || 1600;

    await db.dispatchLoads.put({
      id: `load-${Date.now()}`,
      loadNumber: `LD-${Math.floor(10000 + Math.random() * 90000)}`,
      truckId: selectedTruckId,
      carrierName: 'Blue Line Transport LLC',
      status: 'booked',
      origin: `${load.origin}, ${load.originState || ''}`,
      destination: `${load.destination}, ${load.destState || ''}`,
      rate: rateVal,
      loadedMiles: load.tripMiles,
      deadheadMiles: load.dho || 0,
      equipment: load.truckType || '53V',
      brokerName: load.companyName || 'Broker',
      brokerPhone: '800-555-0199',
      pickupAppt: `${load.pickupDate} 08:00 AM CT`,
      deliveryAppt: 'Next Day 12:00 PM ET',
      checkCalls: [{ time: new Date().toISOString(), note: 'Load booked via load board simulator', status: 'Booked' }],
      documents: {
        rateConSigned: false,
        bolReceived: false,
        podReceived: false,
        invoiceSent: false,
      },
      createdAt: new Date().toISOString(),
    });

    setBookingSuccess(`Load booked! Created on Dispatch Board for ${currentTruck.name}.`);
    setTimeout(() => setBookingSuccess(null), 4000);
    setSelectedLoad(null);
  };

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortDesc(!sortDesc);
    } else {
      setSortBy(field);
      setSortDesc(true);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-[#13294B] dark:text-[#F5A524] flex items-center gap-2">
            <span>Load Board Simulator · Module 6</span>
            <Pill label="Carrier-Side Screening" variant="counter" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#13294B] dark:text-white mt-1">
            DAT / Truckstop-Style Freight Board
          </h1>
        </div>

        {/* Board Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-semibold">
            <button
              onClick={() => { setBoardMode('module6'); setUserDecisions({}); }}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                boardMode === 'module6'
                  ? 'bg-white dark:bg-[#13294B] text-[#13294B] dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Module 6 Board (12 Course Loads)
            </button>
            <button
              onClick={() => { setBoardMode('module11'); setUserDecisions({}); }}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                boardMode === 'module11'
                  ? 'bg-white dark:bg-[#13294B] text-[#13294B] dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Module 11 Tuesday Board
            </button>
            <button
              onClick={() => { setBoardMode('live'); setUserDecisions({}); }}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                boardMode === 'live'
                  ? 'bg-white dark:bg-[#13294B] text-[#13294B] dark:text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Live Arriving Loads
            </button>
          </div>
        </div>
      </div>

      {bookingSuccess && (
        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 text-xs font-semibold text-green-800 dark:text-green-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span>{bookingSuccess}</span>
          </div>
          <button
            onClick={() => navigate('/labs/dispatch')}
            className="underline hover:text-green-900 dark:hover:text-white cursor-pointer"
          >
            Open Dispatch Board →
          </button>
        </div>
      )}

      {/* Fleet Truck & Screening Profile Selector */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(['12', '7', '3'] as const).map((id) => {
          const t = truckSpecs[id];
          const isSelected = selectedTruckId === id;
          return (
            <Card
              key={id}
              onClick={() => setSelectedTruckId(id)}
              variant={isSelected ? 'interactive' : 'default'}
              className={`p-4 cursor-pointer border-2 transition-all ${
                isSelected
                  ? 'border-[#F5A524] bg-amber-50/20 dark:bg-amber-950/20 shadow-sm'
                  : 'border-transparent hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-[#13294B] dark:text-white">{t.name}</span>
                <span className="font-mono text-[10px] text-slate-400">{t.home}</span>
              </div>
              <div className="text-[11px] text-slate-500">{t.trailer}</div>
              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[10px] font-mono">
                <span className="text-slate-400">BE: ${t.breakEven.toFixed(2)}</span>
                <span className="font-bold text-[#22A35A]">Target: ${t.target.toFixed(2)}</span>
              </div>
            </Card>
          );
        })}

        {/* Screening Session Live Scorecard */}
        <Card className="p-4 bg-slate-900 text-white border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
              Screening Accuracy
            </span>
            <Award className="w-4 h-4 text-[#F5A524]" />
          </div>
          <div className="text-2xl font-black font-mono text-[#F5A524]">
            {sessionStats.accuracyPct}%
          </div>
          <div className="text-[10px] text-slate-400 flex justify-between">
            <span>Evaluated: {sessionStats.evaluatedCount} / {sessionStats.totalCount}</span>
            <button
              onClick={() => setUserDecisions({})}
              className="text-[#F5A524] hover:underline"
            >
              Reset
            </button>
          </div>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            {/* Origin City */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Origin City (e.g. Joliet, Chicago)..."
                value={originFilter}
                onChange={(e) => setOriginFilter(e.target.value)}
                className="bg-transparent border-none focus:outline-none w-36 text-xs text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Destination City */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
              <input
                type="text"
                placeholder="Destination..."
                value={destFilter}
                onChange={(e) => setDestFilter(e.target.value)}
                className="bg-transparent border-none focus:outline-none w-28 text-xs text-slate-800 dark:text-slate-200"
              />
            </div>

            {/* Equipment Filter */}
            <select
              value={equipFilter}
              onChange={(e) => setEquipFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200"
            >
              <option value="ALL">All Trailers</option>
              <option value="V">Van Only (V, VA)</option>
              <option value="R">Reefer Only (R)</option>
            </select>

            {/* DH-O Radius Slider */}
            <div className="flex items-center gap-2 text-slate-500">
              <span>Max DH-O:</span>
              <input
                type="range"
                min={25}
                max={200}
                step={25}
                value={maxDho}
                onChange={(e) => setMaxDho(Number(e.target.value))}
                className="w-20 accent-[#F5A524]"
              />
              <span className="font-mono text-slate-700 dark:text-slate-200">{maxDho} mi</span>
            </div>
          </div>

          {/* Toggle true RPM column */}
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showRpmTotal}
                onChange={(e) => setShowRpmTotal(e.target.checked)}
                className="accent-[#F5A524] rounded"
              />
              <span>Show $/Total Mi (Include Deadhead)</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Main Freight Table */}
      <Card className="overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#13294B] text-white uppercase font-semibold text-[11px] tracking-wider select-none">
              <tr>
                <th className="p-3">Age</th>
                <th className="p-3">Pickup</th>
                <th className="p-3">Equip</th>
                <th className="p-3">F/P</th>
                <th className="p-3 cursor-pointer hover:bg-white/10" onClick={() => toggleSort('dho')}>
                  <div className="flex items-center gap-1">
                    <span>DH-O</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3">Origin</th>
                <th className="p-3 cursor-pointer hover:bg-white/10" onClick={() => toggleSort('trip')}>
                  <div className="flex items-center gap-1">
                    <span>Trip</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3">Destination</th>
                <th className="p-3">Company / Broker</th>
                <th className="p-3 cursor-pointer hover:bg-white/10" onClick={() => toggleSort('cs')}>
                  <div className="flex items-center gap-1">
                    <span>CS / DTP</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3">Weight</th>
                <th className="p-3 cursor-pointer hover:bg-white/10" onClick={() => toggleSort('rate')}>
                  <div className="flex items-center gap-1">
                    <span>Gross Rate</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="p-3">$/Loaded Mi</th>
                {showRpmTotal && (
                  <th className="p-3 text-[#F5A524] cursor-pointer hover:bg-white/10" onClick={() => toggleSort('rpmTot')}>
                    <div className="flex items-center gap-1">
                      <span>$/Total Mi</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </th>
                )}
                <th className="p-3 text-right">Your Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-[#0E1A2B]/40">
              {displayedLoads.length === 0 ? (
                <tr>
                  <td colSpan={14} className="p-8 text-center text-slate-400 text-xs">
                    No loads match your search criteria. Try increasing the DH-O slider or resetting filters.
                  </td>
                </tr>
              ) : (
                displayedLoads.map((load) => {
                  const totalMiles = load.tripMiles + (load.dho || 0);
                  const rpmLoaded = load.rate && load.tripMiles > 0 ? (load.rate / load.tripMiles).toFixed(2) : '—';
                  const rpmTot = load.rate && totalMiles > 0 ? (load.rate / totalMiles).toFixed(2) : '—';
                  const userDecision = userDecisions[String(load.id)];
                  const ideal = evaluateLoadScreening(load, screeningCriteria);
                  const isSelected = selectedLoad?.id === load.id;

                  return (
                    <tr
                      key={load.id}
                      onClick={() => setSelectedLoad(load)}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                        isSelected ? 'bg-amber-50/50 dark:bg-amber-950/30' : ''
                      }`}
                    >
                      <td className="p-3 font-mono text-slate-400">{load.age || '0:15'}</td>
                      <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{load.pickupDay}</td>
                      <td className="p-3">
                        <span
                          className={`px-1.5 py-0.5 rounded font-bold font-mono text-[10px] ${
                            load.truckType === 'R'
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                              : load.truckType === 'VA'
                              ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {load.truckType}
                        </span>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-600 dark:text-slate-400">{load.loadType}</td>
                      <td className="p-3 font-mono text-slate-500">{load.dho} mi</td>
                      <td className="p-3 font-semibold text-[#13294B] dark:text-white">
                        {load.origin}{load.originState ? `, ${load.originState}` : ''}
                      </td>
                      <td className="p-3 font-mono">{load.tripMiles} mi</td>
                      <td className="p-3 font-semibold text-[#13294B] dark:text-white">
                        {load.destination}{load.destState ? `, ${load.destState}` : ''}
                      </td>
                      <td className="p-3 truncate max-w-[150px] font-medium text-slate-700 dark:text-slate-300">
                        {load.companyName}
                      </td>
                      <td className="p-3 font-mono text-slate-500">
                        {load.creditScore !== null ? `${load.creditScore} (${load.daysToPay}d)` : '—'}
                      </td>
                      <td className="p-3 font-mono">
                        {load.weightLbs ? `${(load.weightLbs / 1000).toFixed(1)}k` : '—'}
                      </td>
                      <td className="p-3 font-bold font-mono text-[#22A35A]">
                        {load.rate ? `$${load.rate.toLocaleString()}` : <span className="text-slate-400">Call</span>}
                      </td>
                      <td className="p-3 font-mono">{load.rate ? `$${rpmLoaded}` : '—'}</td>
                      {showRpmTotal && (
                        <td className="p-3 font-mono font-bold text-[#F5A524]">
                          {load.rate ? `$${rpmTot}` : '—'}
                        </td>
                      )}
                      <td className="p-3 text-right">
                        {userDecision ? (
                          <Pill
                            label={userDecision}
                            variant={
                              userDecision === 'CALL'
                                ? 'book'
                                : userDecision === 'PLAN'
                                ? 'counter'
                                : 'pass'
                            }
                          />
                        ) : (
                          <span className="text-slate-400 text-[11px] group-hover:text-[#F5A524] underline">
                            Screen →
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Load Detail & Screening Drawer */}
      <Drawer
        isOpen={!!selectedLoad}
        onClose={() => setSelectedLoad(null)}
        title={selectedLoad ? `${selectedLoad.origin} → ${selectedLoad.destination}` : ''}
        subtitle={selectedLoad ? `${selectedLoad.tripMiles} mi · ${selectedLoad.truckType} trailer · ${currentTruck.name}` : ''}
        width="max-w-xl"
      >
        {selectedLoad && (() => {
          const totalMiles = selectedLoad.tripMiles + (selectedLoad.dho || 0);
          const rateNum = selectedLoad.rate || 0;
          const rpmLoaded = rateNum > 0 ? (rateNum / selectedLoad.tripMiles).toFixed(2) : 0;
          const rpmTot = rateNum > 0 && totalMiles > 0 ? calculateRatePerTotalMile(rateNum, selectedLoad.tripMiles, selectedLoad.dho || 0) : 0;
          const askPrice = calculateAskPrice(currentTruck.target, totalMiles);
          const walkAway = calculateWalkAway(currentTruck.breakEven, totalMiles);
          const driveHours = calculateDrivingHours(totalMiles, 50);
          const ideal = evaluateLoadScreening(selectedLoad, screeningCriteria);
          const userChoice = userDecisions[String(selectedLoad.id)];

          return (
            <div className="space-y-6 text-xs">
              {/* Lane & Rate Header Card */}
              <div className="p-5 rounded-2xl bg-[#13294B] text-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-300">
                    Gross Linehaul Rate
                  </div>
                  <Pill label={`${selectedLoad.truckType} Trailer`} variant="counter" />
                </div>
                <div className="text-3xl font-extrabold font-mono text-[#F5A524]">
                  {selectedLoad.rate ? `$${selectedLoad.rate.toLocaleString()}` : 'Unposted (Call to Negotiate)'}
                </div>
                <div className="flex justify-between text-xs text-slate-300 border-t border-white/10 pt-2 font-mono">
                  <span>Trip: {selectedLoad.tripMiles} mi</span>
                  <span>DH-O: {selectedLoad.dho} mi</span>
                  <span>Total: {totalMiles} mi</span>
                </div>
              </div>

              {/* Economic Evaluation for Current Truck */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-[#13294B] dark:text-white flex items-center justify-between">
                  <span>{currentTruck.name} Economics</span>
                  <span className="text-slate-400 font-normal">Target: ${currentTruck.target.toFixed(2)}/mi</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Rate / Total Mile</span>
                    <span className="text-base font-bold font-mono text-[#13294B] dark:text-white">
                      ${rpmTot.toFixed(2)} / mi
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Rate / Loaded Mile</span>
                    <span className="text-base font-bold font-mono text-slate-700 dark:text-slate-300">
                      ${rpmLoaded} / mi
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Target Ask Price</span>
                    <span className="font-bold font-mono text-[#22A35A]">${askPrice.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Minimum Walk-Away</span>
                    <span className="font-bold font-mono text-slate-700 dark:text-slate-300">${walkAway.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Broker Profile & Credit */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-[#13294B] dark:text-white flex items-center justify-between">
                  <span>Broker: {selectedLoad.companyName}</span>
                  <span className="text-[10px] font-mono text-slate-400">BMC-84 $75k Active</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300 text-xs">
                  <span>Credit Score: <b className="text-[#13294B] dark:text-white">{selectedLoad.creditScore || 'N/A'}/100</b></span>
                  <span>Days to Pay: <b className="text-[#13294B] dark:text-white">{selectedLoad.daysToPay || '30'} days</b></span>
                  <span>Weight: <b className="text-[#13294B] dark:text-white">{selectedLoad.weightLbs?.toLocaleString()} lbs</b></span>
                </div>
              </div>

              {/* Extra Comments / Signals */}
              {selectedLoad.comments && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#F5A524] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Broker Notes / Flags:</span> {selectedLoad.comments}
                  </div>
                </div>
              )}

              {/* Screening Decision Actions */}
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-200">
                    Your Screening Decision (Five-Filter Scan):
                  </span>
                  {userChoice && <Pill label={`Chosen: ${userChoice}`} variant="navy" />}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    className={`border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 ${
                      userChoice === 'CALL' ? 'bg-green-100 dark:bg-green-950 ring-2 ring-green-500' : ''
                    }`}
                    onClick={() => handleScreenChoice(selectedLoad.id, 'CALL')}
                  >
                    CALL (Priority)
                  </Button>
                  <Button
                    variant="outline"
                    className={`border-amber-500 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 ${
                      userChoice === 'PLAN' ? 'bg-amber-100 dark:bg-amber-950 ring-2 ring-amber-500' : ''
                    }`}
                    onClick={() => handleScreenChoice(selectedLoad.id, 'PLAN')}
                  >
                    PLAN (Negotiate)
                  </Button>
                  <Button
                    variant="outline"
                    className={`border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 ${
                      userChoice === 'REJECT' ? 'bg-red-100 dark:bg-red-950 ring-2 ring-red-500' : ''
                    }`}
                    onClick={() => handleScreenChoice(selectedLoad.id, 'REJECT')}
                  >
                    REJECT (Pass)
                  </Button>
                </div>
              </div>

              {/* Instant Evaluation Feedback */}
              {userChoice && (
                <div
                  className={`p-4 rounded-xl border space-y-1.5 ${
                    userChoice === ideal.decision
                      ? 'bg-green-50 border-green-200 text-green-900 dark:bg-green-950/40 dark:border-green-900 dark:text-green-200'
                      : 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-200'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      {userChoice === ideal.decision ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                      )}
                      <span>
                        {userChoice === ideal.decision ? 'Accurate Decision!' : 'Course Recommended Alternative'}
                      </span>
                    </span>
                    <span className="font-mono uppercase font-bold text-[10px]">
                      Ideal: {ideal.decision}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed">{ideal.reason}</p>
                </div>
              )}

              {/* Workflow Next Steps */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <div className="text-[10px] uppercase font-bold text-slate-400">
                  Next Dispatch Actions
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/labs/vetting')}
                    icon={<ShieldCheck className="w-3.5 h-3.5 text-[#0E9F9A]" />}
                  >
                    Vet Broker
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate('/practice/roleplay')}
                    icon={<PhoneCall className="w-3.5 h-3.5 text-[#F5A524]" />}
                  >
                    Call Broker (Role-play)
                  </Button>
                  <Button
                    size="sm"
                    variant="amber"
                    onClick={() => handleBookLoad(selectedLoad)}
                    icon={<Check className="w-3.5 h-3.5" />}
                  >
                    Book Load
                  </Button>
                </div>
              </div>
            </div>
          );
        })()}
      </Drawer>
    </div>
  );
};
