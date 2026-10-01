export interface DetentionInputs {
  appointmentTimeMinutes: number; // e.g. 08:00 = 480
  arrivalTimeMinutes: number; // e.g. 07:45 = 465
  outTimeMinutes: number; // e.g. 12:00 = 720
  freeHours: number; // default 2
  hourlyRate: number; // default 50
  billingIncrement: 'full_hour' | '15_min_block' | 'exact_minute' | 'started_hour';
  lateArrivalVoids: boolean;
  isFcfs?: boolean;
}

export interface DetentionResult {
  billableMinutes: number;
  billableHours: number;
  amount: number;
  freeTimeExpiredAtMinutes: number;
  explanation: string;
  isVoided: boolean;
}

export function calculateDetention(inputs: DetentionInputs): DetentionResult {
  const isLate = !inputs.isFcfs && inputs.arrivalTimeMinutes > inputs.appointmentTimeMinutes;

  if (inputs.lateArrivalVoids && isLate) {
    return {
      billableMinutes: 0,
      billableHours: 0,
      amount: 0,
      freeTimeExpiredAtMinutes: 0,
      explanation: 'Voided: Driver arrived past scheduled appointment time. Standard broker contracts void detention for late arrivals.',
      isVoided: true,
    };
  }

  // Base clock starts at max(appointment, arrival) for APPT, or arrival for FCFS
  const clockStart = inputs.isFcfs
    ? inputs.arrivalTimeMinutes
    : Math.max(inputs.appointmentTimeMinutes, inputs.arrivalTimeMinutes);

  const freeTimeMinutes = inputs.freeHours * 60;
  const freeTimeExpiredAtMinutes = clockStart + freeTimeMinutes;

  const rawBillableMins = Math.max(0, inputs.outTimeMinutes - freeTimeExpiredAtMinutes);

  if (rawBillableMins <= 0) {
    return {
      billableMinutes: 0,
      billableHours: 0,
      amount: 0,
      freeTimeExpiredAtMinutes,
      explanation: `Within ${inputs.freeHours} hours free time. Driver was released before or at free time expiration.`,
      isVoided: false,
    };
  }

  let billableMins = 0;
  let amount = 0;

  switch (inputs.billingIncrement) {
    case '15_min_block':
      // 15-min increments rounded down
      const blocks15 = Math.floor(rawBillableMins / 15);
      billableMins = blocks15 * 15;
      amount = Number(((billableMins / 60) * inputs.hourlyRate).toFixed(2));
      break;
    case 'exact_minute':
      billableMins = rawBillableMins;
      amount = Number(((billableMins / 60) * inputs.hourlyRate).toFixed(2));
      break;
    case 'started_hour':
      // Any started hour rounds up
      const startedHours = Math.ceil(rawBillableMins / 60);
      billableMins = startedHours * 60;
      amount = startedHours * inputs.hourlyRate;
      break;
    case 'full_hour':
    default:
      // Full hours rounded down
      const fullHours = Math.floor(rawBillableMins / 60);
      billableMins = fullHours * 60;
      amount = fullHours * inputs.hourlyRate;
      break;
  }

  const billableHours = Number((billableMins / 60).toFixed(2));

  return {
    billableMinutes: billableMins,
    billableHours,
    amount,
    freeTimeExpiredAtMinutes,
    explanation: `${billableHours} hours billable at $${inputs.hourlyRate}/hr = $${amount.toFixed(2)}.`,
    isVoided: false,
  };
}
