export interface ScreeningCriteria {
  minRatePerTotalMile: number;
  targetRatePerTotalMile: number;
  maxDeadheadMiles: number;
  trailerType: string; // 'V', 'R', 'F'
  maxWeightLbs: number;
  trailerLengthFt: number;
  hasAirRide?: boolean;
}

export interface PracticeLoadItem {
  id: string | number;
  age?: string;
  ageHours?: number;
  pickupDay?: string;
  pickupDate?: string;
  equipment?: string;
  truckType?: string;
  fullPartial?: 'F' | 'P';
  loadType?: 'F' | 'P';
  dhO?: number;
  dho?: number;
  origin: string;
  originState?: string;
  destination: string;
  destState?: string;
  dhD?: number;
  dhd?: number;
  tripMiles: number;
  rate: number | null;
  weightLb?: number;
  weightLbs?: number;
  lengthFt: number;
  broker?: string;
  companyName?: string;
  creditScore?: number | null;
  daysToPay?: number | null;
  comments?: string;
  flags?: string[];
  courseAnswer?: 'CALL' | 'PLAN' | 'REJECT';
  courseReason?: string;
}

export interface ScreeningEvaluation {
  decision: 'CALL' | 'PLAN' | 'REJECT';
  ratePerTotalMile: number;
  failedFilter?: string;
  reason: string;
}

export function normalizeLoad(raw: any, courseAnswers?: any): PracticeLoadItem {
  const idStr = String(raw.id || '');
  const dho = raw.dhO !== undefined ? raw.dhO : raw.dho || 0;
  const dhd = raw.dhD !== undefined ? raw.dhD : raw.dhd || 0;
  const weight = raw.weightLb !== undefined ? raw.weightLb : raw.weightLbs || 0;
  const equip = raw.equipment || raw.truckType || 'V';
  const fp = raw.fullPartial || raw.loadType || 'F';
  const brokerName = raw.broker || raw.companyName || 'Freight Broker';
  const pickup = raw.pickupDay || raw.pickupDate || 'Today';

  let originStr = raw.origin || '';
  let originCity = originStr;
  let originState = raw.originState || '';
  if (originStr.includes(',')) {
    const parts = originStr.split(',');
    originCity = parts[0].trim();
    originState = parts[1].trim();
  }

  let destStr = raw.destination || '';
  let destCity = destStr;
  let destState = raw.destState || '';
  if (destStr.includes(',')) {
    const parts = destStr.split(',');
    destCity = parts[0].trim();
    destState = parts[1].trim();
  }

  // Course official answers lookup if from module 6
  let courseAnswer: 'CALL' | 'PLAN' | 'REJECT' | undefined = raw.courseAnswer;
  let courseReason: string | undefined = raw.courseReason;

  if (courseAnswers) {
    const numId = Number(raw.id);
    if (courseAnswers.call?.includes(numId)) courseAnswer = 'CALL';
    else if (courseAnswers.plan?.includes(numId)) courseAnswer = 'PLAN';
    else if (courseAnswers.reject?.includes(numId)) courseAnswer = 'REJECT';

    if (courseAnswers.reasons?.[idStr]) {
      courseReason = courseAnswers.reasons[idStr];
    }
  }

  return {
    id: raw.id,
    age: raw.age || '0:15',
    pickupDay: pickup,
    pickupDate: pickup,
    equipment: equip,
    truckType: equip,
    fullPartial: fp,
    loadType: fp,
    dhO: dho,
    dho: dho,
    origin: originCity,
    originState,
    destination: destCity,
    destState,
    dhD: dhd,
    dhd: dhd,
    tripMiles: raw.tripMiles || 0,
    rate: raw.rate !== undefined ? raw.rate : null,
    weightLb: weight,
    weightLbs: weight,
    lengthFt: raw.lengthFt || 53,
    broker: brokerName,
    companyName: brokerName,
    creditScore: raw.creditScore !== undefined ? raw.creditScore : null,
    daysToPay: raw.daysToPay !== undefined ? raw.daysToPay : null,
    comments: raw.comments || '',
    flags: raw.flags || [],
    courseAnswer,
    courseReason,
  };
}

export function evaluateLoadScreening(
  load: PracticeLoadItem,
  criteria: ScreeningCriteria
): ScreeningEvaluation {
  const norm = normalizeLoad(load);
  const totalMiles = norm.tripMiles + (norm.dho || 0);
  const rateNum = norm.rate || 0;
  const ratePerTotalMile = rateNum > 0 && totalMiles > 0
    ? Number((rateNum / totalMiles).toFixed(2))
    : 0;

  // If this load has an official course model answer & reason from practice-data.json, respect it
  if (norm.courseAnswer && norm.courseReason) {
    return {
      decision: norm.courseAnswer,
      ratePerTotalMile,
      reason: norm.courseReason,
    };
  }

  // 1. Equipment Check
  if (norm.truckType === 'R' && criteria.trailerType !== 'R') {
    return {
      decision: 'REJECT',
      ratePerTotalMile,
      failedFilter: 'Equipment mismatch',
      reason: 'Reefer trailer required (carrier equipment is Dry Van).',
    };
  }

  if (norm.truckType === 'VA' && criteria.hasAirRide === false) {
    return {
      decision: 'REJECT',
      ratePerTotalMile,
      failedFilter: 'Air-ride required',
      reason: 'Air-ride suspension required (carrier trailer has standard spring suspension).',
    };
  }

  if (norm.weightLbs && norm.weightLbs > criteria.maxWeightLbs) {
    return {
      decision: 'REJECT',
      ratePerTotalMile,
      failedFilter: 'Weight limit exceeded',
      reason: `Freight weight (${norm.weightLbs.toLocaleString()} lbs) exceeds truck max cargo capacity (${criteria.maxWeightLbs.toLocaleString()} lbs).`,
    };
  }

  // 2. Deadhead check
  if ((norm.dho || 0) > criteria.maxDeadheadMiles) {
    return {
      decision: 'PLAN',
      ratePerTotalMile,
      failedFilter: 'High deadhead',
      reason: `Origin deadhead (${norm.dho} mi) exceeds ${criteria.maxDeadheadMiles} mi buffer. Negotiate extra deadhead pay.`,
    };
  }

  // 3. Rate economics check
  if (rateNum === 0 || norm.rate === null) {
    return {
      decision: 'PLAN',
      ratePerTotalMile: 0,
      reason: 'Unposted rate. Check broker credit and call to query posted rate.',
    };
  }

  if (ratePerTotalMile < criteria.minRatePerTotalMile) {
    return {
      decision: 'REJECT',
      ratePerTotalMile,
      failedFilter: 'Below break-even',
      reason: `Rate per total mile ($${ratePerTotalMile.toFixed(2)}) is below carrier break-even ($${criteria.minRatePerTotalMile.toFixed(2)}). Every mile loses money.`,
    };
  }

  if (ratePerTotalMile < criteria.targetRatePerTotalMile) {
    return {
      decision: 'PLAN',
      ratePerTotalMile,
      failedFilter: 'Counter negotiation required',
      reason: `Rate ($${ratePerTotalMile.toFixed(2)}/total mi) is between break-even and target ($${criteria.targetRatePerTotalMile.toFixed(2)}). Must counter-offer to protect margin.`,
    };
  }

  return {
    decision: 'CALL',
    ratePerTotalMile,
    reason: `Rate ($${ratePerTotalMile.toFixed(2)}/total mi) meets or exceeds carrier target ($${criteria.targetRatePerTotalMile.toFixed(2)}). Priority call!`,
  };
}
