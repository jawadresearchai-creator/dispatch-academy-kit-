import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  ZoomIn,
  Eye,
  FileCheck,
} from 'lucide-react';
import { hotspotsData } from '../../data/loader';
import { Button, Card, Pill } from '../../components/ui';

export const DocumentScreen: React.FC = () => {
  const [selectedDoc, setSelectedDoc] = useState<'ratecon' | 'bol' | 'pod'>('ratecon');
  const [selectedHotspot, setSelectedHotspot] = useState<any>(null);

  const docImages = {
    ratecon: '/assets/photos/rc.jpg',
    bol: '/assets/photos/bol.jpg',
    pod: '/assets/photos/pod.jpg',
  };

  const currentHotspots = (hotspotsData?.[selectedDoc] || [
    { id: '1', title: 'Carrier Name & MC', x: 20, y: 15, field: 'Carrier Verification', explanation: 'Verify carrier name matches Blue Line Transport and MC matches authority.' },
    { id: '2', title: 'Agreed Rate', x: 75, y: 35, field: 'Gross Rate', explanation: 'Ensure rate matches verbally negotiated amount ($2,050).' },
    { id: '3', title: 'Detention Clause', x: 40, y: 70, field: 'Accessorial Clause', explanation: 'Check free time rules and requirement for 2-hour advance notice.' },
  ]);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-[#13294B] dark:text-[#F5A524]">
            Document Lab · Real Scans & Hotspots
          </div>
          <h1 className="text-2xl font-extrabold text-[#13294B] dark:text-white mt-1">
            Rate Confirmation, BOL & POD Inspection
          </h1>
        </div>

        <div className="flex gap-2">
          {(['ratecon', 'bol', 'pod'] as const).map((doc) => (
            <button
              key={doc}
              onClick={() => { setSelectedDoc(doc); setSelectedHotspot(null); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-colors ${
                selectedDoc === doc
                  ? 'bg-[#13294B] text-white border-[#13294B] dark:bg-[#F5A524] dark:text-[#0E1A2B]'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              {doc === 'ratecon' ? 'Rate Con' : doc.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Viewer with Hotspots */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-4 bg-slate-900 border-slate-800 relative overflow-hidden flex flex-col items-center">
            <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-3 px-2">
              <span className="font-semibold text-white">Load #12354 — Real Document Scan</span>
              <span>Click numbered badges to inspect key clauses</span>
            </div>

            <div className="relative max-w-lg w-full rounded-xl overflow-hidden shadow-2xl border border-slate-700 bg-white">
              <img
                src={docImages[selectedDoc]}
                alt={selectedDoc}
                className="w-full h-auto object-contain opacity-95"
              />

              {/* Hotspot Badges */}
              {currentHotspots.map((hs: any, idx: number) => (
                <button
                  key={hs.id || idx}
                  onClick={() => setSelectedHotspot(hs)}
                  style={{ top: `${hs.y || 30 + idx * 20}%`, left: `${hs.x || 30 + idx * 15}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#F5A524] text-[#0E1A2B] font-bold font-mono text-xs flex items-center justify-center shadow-lg hover:scale-125 transition-transform border-2 border-white cursor-pointer animate-pulse"
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Hotspot Inspection Details */}
        <div className="space-y-4">
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-[#22A35A]" />
              <h3 className="text-sm font-bold text-[#13294B] dark:text-white">
                Clause & Field Inspector
              </h3>
            </div>

            {selectedHotspot ? (
              <div className="space-y-3 animate-fadeIn text-xs">
                <div className="text-[10px] font-mono uppercase font-bold text-[#C98500] dark:text-[#F5A524]">
                  {selectedHotspot.field}
                </div>
                <h4 className="text-sm font-bold text-[#13294B] dark:text-white">
                  {selectedHotspot.title}
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedHotspot.explanation}
                </p>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                Click any numbered orange circle on the document to view dispatch rules and compliance instructions.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
