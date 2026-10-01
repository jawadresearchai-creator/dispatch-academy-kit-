import React, { useState } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  Clock,
  ArrowRight,
  Layers,
  Award,
} from 'lucide-react';
import { citiesData, type CityItem } from '../../data/loader';
import {
  haversineDistanceMiles,
  estimateRoadMiles,
  calculateDrivingHours,
  breaksNeeded10Hour,
} from '../../engines/distance';
import { formatInZone, PKT_ZONE, getZoneAbbreviation } from '../../engines/timezones';
import { Button, Card, Pill } from '../../components/ui';

export const MapScreen: React.FC = () => {
  const cities = citiesData.cities || [];
  const [originCity, setOriginCity] = useState<CityItem>(
    cities.find((c) => c.name === 'Chicago') || cities[0]
  );
  const [destCity, setDestCity] = useState<CityItem>(
    cities.find((c) => c.name === 'Atlanta') || cities[1]
  );
  const [dhRadius, setDhRadius] = useState<number>(100);
  const [selectedCity, setSelectedCity] = useState<CityItem>(originCity);

  // Compute Route
  const straightLineMiles = haversineDistanceMiles(
    originCity.lat,
    originCity.lon,
    destCity.lat,
    destCity.lon
  );
  const roadMiles = estimateRoadMiles(straightLineMiles);
  const driveHours = calculateDrivingHours(roadMiles, 50);
  const breaksCount = breaksNeeded10Hour(driveHours);

  // Deadhead search: cities within radius
  const nearbyCities = cities
    .map((c) => ({
      city: c,
      dist: estimateRoadMiles(haversineDistanceMiles(selectedCity.lat, selectedCity.lon, c.lat, c.lon)),
    }))
    .filter((item) => item.dist <= dhRadius && item.city.name !== selectedCity.name)
    .sort((a, b) => a.dist - b.dist);

  // Project coordinates for simplified SVG US map
  // Lat: ~24 to 50, Lon: ~-125 to -66
  const project = (lat: number, lon: number) => {
    const x = ((lon - -125) / (-66 - -125)) * 800;
    const y = ((50 - lat) / (50 - 24)) * 500;
    return { x, y };
  };

  const originPt = project(originCity.lat, originCity.lon);
  const destPt = project(destCity.lat, destCity.lon);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-[#0E9F9A]">
            Geography Lab · Module 3
          </div>
          <h1 className="text-2xl font-extrabold text-[#13294B] dark:text-white mt-1">
            U.S. Corridors, Zones & Distance Lab
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Pill label="103 Freight Cities" variant="navy" />
          <Pill label="DAT Zones Z0–Z9" variant="counter" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Route Tool & Deadhead Radius */}
        <div className="space-y-5">
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-[#13294B] dark:text-white flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#F5A524]" />
              <span>Route & Mileage Calculator</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                  Origin City
                </label>
                <select
                  value={originCity.name}
                  onChange={(e) => {
                    const found = cities.find((c) => c.name === e.target.value);
                    if (found) { setOriginCity(found); setSelectedCity(found); }
                  }}
                  className="w-full mt-1 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                >
                  {cities.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}, {c.state} ({c.zone} · {c.tz.split('/')[1]})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                  Destination City
                </label>
                <select
                  value={destCity.name}
                  onChange={(e) => {
                    const found = cities.find((c) => c.name === e.target.value);
                    if (found) setDestCity(found);
                  }}
                  className="w-full mt-1 px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                >
                  {cities.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}, {c.state} ({c.zone} · {c.tz.split('/')[1]})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Calculated Mileage Card */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-[#13294B] dark:text-white">
                <span>Estimated Road Miles:</span>
                <span className="font-mono text-base text-[#F5A524]">{roadMiles} mi</span>
              </div>
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Straight-line:</span>
                <span className="font-mono">{straightLineMiles} mi (×1.18 factor)</span>
              </div>
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Driving Time (at 50 mph):</span>
                <span className="font-mono">{driveHours} hours</span>
              </div>
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>10-Hour Breaks Needed:</span>
                <span className="font-mono">{breaksCount} break(s)</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-400">
                Note: In course exercises, use dataset miles (e.g. Bolingbrook→Atlanta 715 mi).
              </div>
            </div>
          </Card>

          {/* Deadhead Radius Finder */}
          <Card className="p-5 space-y-3">
            <h3 className="text-sm font-bold text-[#13294B] dark:text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#0E9F9A]" />
              <span>Deadhead Circle (DH-O)</span>
            </h3>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min={25}
                max={250}
                step={25}
                value={dhRadius}
                onChange={(e) => setDhRadius(Number(e.target.value))}
                className="flex-1 accent-[#0E9F9A]"
              />
              <span className="text-xs font-mono font-bold w-16 text-right">
                {dhRadius} mi
              </span>
            </div>

            <div className="text-xs text-slate-500">
              Cities within {dhRadius} miles of <span className="font-bold text-[#13294B] dark:text-white">{selectedCity.name}</span>:
            </div>

            <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
              {nearbyCities.length === 0 ? (
                <div className="text-xs text-slate-400 py-2">No other major hubs within radius.</div>
              ) : (
                nearbyCities.map((item) => (
                  <div
                    key={item.city.name}
                    className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {item.city.name}, {item.city.state}
                    </span>
                    <span className="font-mono text-slate-400">{item.dist} mi</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Center / Right: Interactive US Vector Map */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6 bg-slate-900 border-slate-800 text-white relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Interactive U.S. Freight Map & Time Zones
              </div>
              <div className="text-xs text-[#F5A524] font-medium">
                Click any city dot to inspect
              </div>
            </div>

            {/* SVG Map Canvas */}
            <div className="relative w-full aspect-[16/10] bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center p-2">
              <svg viewBox="0 0 800 500" className="w-full h-full">
                {/* Simplified US Outline outline box */}
                <rect x="20" y="20" width="760" height="460" rx="16" fill="#0d1829" stroke="#1e2d42" />

                {/* Deadhead Radius circle around selected city */}
                {selectedCity && (
                  <circle
                    cx={project(selectedCity.lat, selectedCity.lon).x}
                    cy={project(selectedCity.lat, selectedCity.lon).y}
                    r={dhRadius * 0.4}
                    fill="rgba(14, 159, 154, 0.15)"
                    stroke="#0E9F9A"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />
                )}

                {/* Route Line */}
                <line
                  x1={originPt.x}
                  y1={originPt.y}
                  x2={destPt.x}
                  y2={destPt.y}
                  stroke="#F5A524"
                  strokeWidth="2.5"
                  strokeDasharray="6 3"
                />

                {/* Origin Marker */}
                <circle cx={originPt.x} cy={originPt.y} r="6" fill="#22A35A" stroke="#ffffff" strokeWidth="2" />
                {/* Destination Marker */}
                <circle cx={destPt.x} cy={destPt.y} r="6" fill="#E5484D" stroke="#ffffff" strokeWidth="2" />

                {/* City Nodes */}
                {cities.map((c) => {
                  const pt = project(c.lat, c.lon);
                  const isSelected = selectedCity.name === c.name;
                  return (
                    <g
                      key={c.name}
                      onClick={() => setSelectedCity(c)}
                      className="cursor-pointer group"
                    >
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={c.tier === 1 ? 4 : 2.5}
                        fill={isSelected ? '#F5A524' : '#64748b'}
                        className="transition-all hover:scale-150"
                      />
                      {c.tier === 1 && (
                        <text
                          x={pt.x + 6}
                          y={pt.y + 3}
                          fontSize="9"
                          fill="#94a3b8"
                          className="pointer-events-none select-none"
                        >
                          {c.name}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* City Inspector Footer */}
            {selectedCity && (
              <div className="mt-4 p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div>
                  <div className="font-bold text-sm text-white">
                    {selectedCity.name}, {selectedCity.state}
                  </div>
                  <div className="text-slate-400">
                    DAT Zone: <span className="text-[#F5A524] font-semibold">{selectedCity.zone}</span> · Tier {selectedCity.tier} Freight Hub
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Local Time</span>
                    <span className="text-white font-bold">{formatInZone(new Date(), selectedCity.tz)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Pakistan Time</span>
                    <span className="text-[#F5A524] font-bold">{formatInZone(new Date(), PKT_ZONE)}</span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
