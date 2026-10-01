export interface CostModelInputs {
  weeklyFixed: number;
  milesPerWeek: number;
  dieselPrice: number;
  mpg: number;
  variableCostNoFuel: number;
  dispatchFeePct: number;
  factoringFeePct: number;
  profitCushion: number;
}

export interface CostModelOutputs {
  fixedPerMile: number;
  fuelPerMile: number;
  variablePerMile: number;
  operatingCost: number;
  totalFeePct: number;
  breakEven: number;
  target: number;
}

export function calculateCostModel(inputs: CostModelInputs): CostModelOutputs {
  const fixedPerMile = inputs.weeklyFixed / inputs.milesPerWeek;
  // Round fuel per mile to 2 decimal places as in the course
  const fuelPerMile = Number((inputs.dieselPrice / inputs.mpg).toFixed(2));
  const variablePerMile = Number((fuelPerMile + inputs.variableCostNoFuel).toFixed(2));
  const operatingCost = Number((fixedPerMile + variablePerMile).toFixed(2));
  const totalFeePct = inputs.dispatchFeePct + inputs.factoringFeePct;
  const breakEven = Number((operatingCost / (1 - totalFeePct)).toFixed(2));
  const target = Number(((operatingCost + inputs.profitCushion) / (1 - totalFeePct)).toFixed(2));

  return {
    fixedPerMile: Number(fixedPerMile.toFixed(2)),
    fuelPerMile,
    variablePerMile,
    operatingCost,
    totalFeePct,
    breakEven,
    target,
  };
}

export function calculateRatePerTotalMile(allInRate: number, loadedMiles: number, deadheadMiles: number): number {
  const totalMiles = loadedMiles + deadheadMiles;
  if (totalMiles === 0) return 0;
  return Number((allInRate / totalMiles).toFixed(2));
}

export function calculateRatePerLoadedMile(allInRate: number, loadedMiles: number): number {
  if (loadedMiles === 0) return 0;
  return Number((allInRate / loadedMiles).toFixed(2));
}

export function calculateAskPrice(targetPerMile: number, totalMiles: number): number {
  return Math.round(targetPerMile * totalMiles);
}

export function calculateWalkAway(breakEvenPerMile: number, totalMiles: number): number {
  return Math.round(breakEvenPerMile * totalMiles);
}

export function calculateFSCPerMile(dieselPrice: number, basePrice = 1.25, mpg = 6.0): number {
  if (dieselPrice <= basePrice) return 0;
  return Number(((dieselPrice - basePrice) / mpg).toFixed(3));
}

export function calculateTotalFSC(fscPerMile: number, loadedMiles: number): number {
  return Math.round(fscPerMile * loadedMiles);
}

export function calculateRevenuePerDay(tripRevenue: number, days: number): number {
  if (days <= 0) return 0;
  return Math.round(tripRevenue / days);
}

export function calculateCarrierKeeps(rate: number, feePct = 0.09): number {
  return Number((rate * (1 - feePct)).toFixed(2));
}

export function evaluateLoadDecision(
  ratePerTotalMile: number,
  breakEven: number,
  target: number
): { decision: 'BOOK' | 'COUNTER' | 'PASS'; reason: string } {
  if (ratePerTotalMile >= target) {
    return {
      decision: 'BOOK',
      reason: `Rate ($${ratePerTotalMile.toFixed(2)}/total mi) meets or exceeds target ($${target.toFixed(2)}).`,
    };
  } else if (ratePerTotalMile >= breakEven) {
    return {
      decision: 'COUNTER',
      reason: `Rate ($${ratePerTotalMile.toFixed(2)}/total mi) is above break-even ($${breakEven.toFixed(2)}) but below target ($${target.toFixed(2)}). Negotiate or check next leg.`,
    };
  } else {
    return {
      decision: 'PASS',
      reason: `Rate ($${ratePerTotalMile.toFixed(2)}/total mi) is below break-even ($${breakEven.toFixed(2)}). Every mile loses carrier money.`,
    };
  }
}

/**
 * Generates diesel sensitivity table (Module 7 table)
 */
export function generateDieselSensitivityTable(
  dieselPrices = [3.50, 4.00, 4.50, 5.00, 5.50, 6.00, 6.38, 6.70, 7.00],
  milesList = [2000, 2500, 3000]
) {
  return dieselPrices.map((diesel) => {
    const row: any = { diesel };
    for (const miles of milesList) {
      const model = calculateCostModel({
        weeklyFixed: 1300,
        milesPerWeek: miles,
        dieselPrice: diesel,
        mpg: 6.5,
        variableCostNoFuel: 0.86,
        dispatchFeePct: 0.06,
        factoringFeePct: 0.03,
        profitCushion: 0.10,
      });
      row[`be_${miles}`] = model.breakEven;
      row[`target_${miles}`] = model.target;
    }
    return row;
  });
}
