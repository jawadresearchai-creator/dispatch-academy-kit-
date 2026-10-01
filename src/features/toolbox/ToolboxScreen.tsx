import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Wrench,
  TrendingUp,
  DollarSign,
  Fuel,
  Clock,
  Navigation,
  Box,
  Layers,
  Radio,
  BookOpen,
} from 'lucide-react';
import { glossaryData } from '../../data/loader';
import {
  US_TIME_ZONES,
  PKT_ZONE,
  formatInZone,
  pktDifferenceHours,
  getZoneAbbreviation,
} from '../../engines/timezones';
import {
  calculateFSCPerMile,
  calculateRatePerTotalMile,
} from '../../engines/economics';
import { Button, Card, Tabs, Table } from '../../components/ui';

export const ToolboxScreen: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tool') || searchParams.get('tab') || 'rpm';

  const [activeTab, setActiveTab] = useState(initialTab);

  // Rate per mile calculator state
  const [rate, setRate] = useState(2050);
  const [loaded, setLoaded] = useState(715);
  const [deadhead, setDeadhead] = useState(85);

  const rpmLoaded = loaded > 0 ? (rate / loaded).toFixed(2) : '0';
  const rpmTotal = (loaded + deadhead) > 0 ? calculateRatePerTotalMile(rate, loaded, deadhead) : 0;

  // FSC Calculator state
  const [dieselPrice, setDieselPrice] = useState(6.382);
  const [basePrice, setBasePrice] = useState(1.25);
  const [fscMpg, setFscMpg] = useState(6.0);
  const fscPerMile = calculateFSCPerMile(dieselPrice, basePrice, fscMpg);

  // Time converter state
  const [selectedZone, setSelectedZone] = useState('America/New_York');

  // Glossary filter
  const [glossaryQuery, setGlossaryQuery] = useState(searchParams.get('q') || '');

  const filteredGlossary = glossaryData.filter(
    (g) =>
      g.term.toLowerCase().includes(glossaryQuery.toLowerCase()) ||
      g.definition.toLowerCase().includes(glossaryQuery.toLowerCase())
  );

  // NATO Phonetic table
  const natoAlphabet = [
    { letter: 'A', word: 'Alpha', phonetic: 'AL-FAH' },
    { letter: 'B', word: 'Bravo', phonetic: 'BRAH-VOH' },
    { letter: 'C', word: 'Charlie', phonetic: 'CHAR-LEE' },
    { letter: 'D', word: 'Delta', phonetic: 'DELL-TAH' },
    { letter: 'E', word: 'Echo', phonetic: 'ECK-OH' },
    { letter: 'F', word: 'Foxtrot', phonetic: 'FOKS-TROT' },
    { letter: 'G', word: 'Golf', phonetic: 'GOLF' },
    { letter: 'H', word: 'Hotel', phonetic: 'HOH-TELL' },
    { letter: 'I', word: 'India', phonetic: 'IN-DEE-AH' },
    { letter: 'J', word: 'Juliett', phonetic: 'JEW-LEE-ETT' },
    { letter: 'K', word: 'Kilo', phonetic: 'KEY-LOH' },
    { letter: 'L', word: 'Lima', phonetic: 'LEE-MAH' },
    { letter: 'M', word: 'Mike', phonetic: 'MIKE' },
    { letter: 'N', word: 'November', phonetic: 'NO-VEM-BER' },
    { letter: 'O', word: 'Oscar', phonetic: 'OSS-CAH' },
    { letter: 'P', word: 'Papa', phonetic: 'PAH-PAH' },
    { letter: 'Q', word: 'Quebec', phonetic: 'KEH-BECK' },
    { letter: 'R', word: 'Romeo', phonetic: 'ROW-ME-OH' },
    { letter: 'S', word: 'Sierra', phonetic: 'SEE-AIR-RAH' },
    { letter: 'T', word: 'Tango', phonetic: 'TANG-GO' },
    { letter: 'U', word: 'Uniform', phonetic: 'YOU-NEE-FORM' },
    { letter: 'V', word: 'Victor', phonetic: 'VIK-TAH' },
    { letter: 'W', word: 'Whiskey', phonetic: 'WISS-KEY' },
    { letter: 'X', word: 'X-ray', phonetic: 'ECKS-RAY' },
    { letter: 'Y', word: 'Yankee', phonetic: 'YANG-KEY' },
    { letter: 'Z', word: 'Zulu', phonetic: 'ZOO-LOO' },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-[#13294B] dark:text-[#F5A524]">
            Dispatch Toolbox · 14 Calculators & References
          </div>
          <h1 className="text-2xl font-extrabold text-[#13294B] dark:text-white mt-1">
            Dispatch Reference & Formula Center
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold">
        {[
          { id: 'rpm', label: 'Rate per Mile' },
          { id: 'fsc', label: 'Fuel Surcharge (FSC)' },
          { id: 'tz', label: 'Time Zones' },
          { id: 'glossary', label: 'Glossary (230 Terms)' },
          { id: 'phonetic', label: 'NATO Alphabet' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`px-3 py-2 rounded-xl border whitespace-nowrap transition-colors ${
              activeTab === t.id
                ? 'bg-[#13294B] text-white border-[#13294B] dark:bg-[#F5A524] dark:text-[#0E1A2B]'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB: RATE PER MILE */}
      {activeTab === 'rpm' && (
        <Card className="p-6 max-w-xl space-y-4">
          <h3 className="text-sm font-bold text-[#13294B] dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#F5A524]" />
            <span>Rate per Total Mile vs Loaded Mile</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-500 font-semibold block">All-in Gross Rate ($)</label>
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-sm font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 font-semibold block">Loaded Miles</label>
                <input
                  type="number"
                  value={loaded}
                  onChange={(e) => setLoaded(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-500 font-semibold block">Deadhead Miles</label>
                <input
                  type="number"
                  value={deadhead}
                  onChange={(e) => setDeadhead(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 mt-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Rate per Total Mile (True RPM):</span>
                <span className="font-mono text-lg font-bold text-[#F5A524]">${rpmTotal.toFixed(2)}/mi</span>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Rate per Loaded Mile:</span>
                <span className="font-mono">${rpmLoaded}/mi</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* TAB: FSC */}
      {activeTab === 'fsc' && (
        <Card className="p-6 max-w-xl space-y-4">
          <h3 className="text-sm font-bold text-[#13294B] dark:text-white flex items-center gap-2">
            <Fuel className="w-4 h-4 text-[#F5A524]" />
            <span>Fuel Surcharge (DAT RateView Method)</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-500 font-semibold block">EIA Weekly Diesel Average ($/gal)</label>
              <input
                type="number"
                step={0.01}
                value={dieselPrice}
                onChange={(e) => setDieselPrice(Number(e.target.value))}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-500 font-semibold block">Base Peg Rate ($/gal)</label>
                <input
                  type="number"
                  step={0.01}
                  value={basePrice}
                  onChange={(e) => setBasePrice(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
              <div>
                <label className="text-slate-500 font-semibold block">Baseline MPG</label>
                <input
                  type="number"
                  step={0.1}
                  value={fscMpg}
                  onChange={(e) => setFscMpg(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 mt-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Fuel Surcharge per Mile:</span>
                <span className="font-mono text-lg font-bold text-[#22A35A]">${fscPerMile.toFixed(3)}/mi</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Formula: (EIA Diesel ${dieselPrice.toFixed(3)} − Base ${basePrice.toFixed(2)}) ÷ {fscMpg} mpg
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* TAB: TIME CONVERTER */}
      {activeTab === 'tz' && (
        <Card className="p-6 max-w-xl space-y-4">
          <h3 className="text-sm font-bold text-[#13294B] dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0E9F9A]" />
            <span>Time Zone Converter (U.S. ↔ PKT)</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-500 font-semibold block">Select US Zone</label>
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200"
              >
                {US_TIME_ZONES.map((z) => (
                  <option key={z.zone} value={z.zone}>
                    {z.label} ({z.zone})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">{getZoneAbbreviation(selectedZone)} Time</span>
                <div className="text-base font-bold font-mono text-[#13294B] dark:text-white mt-1">
                  {formatInZone(new Date(), selectedZone)}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Pakistan (PKT) Time</span>
                <div className="text-base font-bold font-mono text-[#F5A524] mt-1">
                  {formatInZone(new Date(), PKT_ZONE)}
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 pt-2">
              Offset: PKT is {pktDifferenceHours(selectedZone) >= 0 ? '+' : ''}{pktDifferenceHours(selectedZone)} hours ahead of this zone.
            </div>
          </div>
        </Card>
      )}

      {/* TAB: GLOSSARY */}
      {activeTab === 'glossary' && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#13294B] dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#F5A524]" />
              <span>Freight Glossary (230 Terms)</span>
            </h3>
            <input
              type="text"
              value={glossaryQuery}
              onChange={(e) => setGlossaryQuery(e.target.value)}
              placeholder="Search terms..."
              className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 w-64"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredGlossary.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#13294B] dark:text-white">{item.term}</span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">{item.module}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.definition}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TAB: NATO PHONETIC ALPHABET */}
      {activeTab === 'phonetic' && (
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold text-[#13294B] dark:text-white flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#0E9F9A]" />
            <span>NATO Phonetic Alphabet Table</span>
          </h3>
          <p className="text-xs text-slate-500">
            Use for spelling VIN numbers, seal codes, and MC authorities over the phone.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {natoAlphabet.map((item) => (
              <div
                key={item.letter}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center space-y-0.5"
              >
                <div className="text-lg font-black text-[#13294B] dark:text-white">{item.letter}</div>
                <div className="text-xs font-bold text-[#C98500] dark:text-[#F5A524]">{item.word}</div>
                <div className="text-[10px] text-slate-400 font-mono">{item.phonetic}</div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
