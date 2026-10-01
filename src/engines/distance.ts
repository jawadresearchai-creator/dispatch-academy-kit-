export function haversineDistanceMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Earth radius in miles
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function estimateRoadMiles(straightLineMiles: number): number {
  // SPEC 8.1: road miles ≈ straight-line × 1.18 (round to the nearest 5)
  return Math.round((straightLineMiles * 1.18) / 5) * 5;
}

export function calculateDrivingHours(miles: number, speedMph = 50): number {
  return Number((miles / speedMph).toFixed(1));
}

export function breaksNeeded10Hour(drivingHours: number): number {
  return Math.floor(drivingHours / 11);
}
