export interface HosStatus {
  drivingHours: number;
  onDutyHours: number;
  timeSinceLastBreak: number;
  hoursRemainingDrive: number;
  hoursRemainingWindow: number;
  violations: string[];
  isLegal: boolean;
}

export interface DutyEvent {
  status: 'off' | 'sleeper' | 'driving' | 'on_duty';
  durationHours: number;
  note?: string;
}

export function evaluateDutySequence(events: DutyEvent[]): HosStatus {
  let drivingHours = 0;
  let onDutyHours = 0;
  let windowElapsed = 0;
  let continuousDriving = 0;
  let consecutiveOff = 0;
  let windowStarted = false;
  const violations: string[] = [];

  for (const ev of events) {
    if (ev.status === 'off' || ev.status === 'sleeper') {
      consecutiveOff += ev.durationHours;
      if (consecutiveOff >= 10) {
        // 10 hours off resets the 11-hour and 14-hour clocks!
        drivingHours = 0;
        windowElapsed = 0;
        continuousDriving = 0;
        windowStarted = false;
      } else if (ev.durationHours >= 0.5) {
        // 30 min break resets continuous driving clock
        continuousDriving = 0;
      }
      if (windowStarted) {
        windowElapsed += ev.durationHours;
      }
    } else {
      // on duty or driving
      consecutiveOff = 0;
      windowStarted = true;
      windowElapsed += ev.durationHours;

      if (ev.status === 'driving') {
        drivingHours += ev.durationHours;
        continuousDriving += ev.durationHours;

        if (continuousDriving > 8.001) {
          violations.push('30-minute break: Driving exceeded 8 cumulative hours without a qualifying 30-minute break.');
        }

        if (drivingHours > 11.001) {
          violations.push(`11-hour driving limit: Driving exceeded 11 hours (${drivingHours.toFixed(1)}h).`);
        }

        if (windowElapsed > 14.001) {
          violations.push(`14-hour window: Driving took place after the 14th hour of coming on duty (${windowElapsed.toFixed(1)}h).`);
        }
      } else {
        // on_duty not driving
        onDutyHours += ev.durationHours;
      }
    }
  }

  const hoursRemainingDrive = Math.max(0, 11 - drivingHours);
  const hoursRemainingWindow = Math.max(0, 14 - windowElapsed);

  return {
    drivingHours: Number(drivingHours.toFixed(1)),
    onDutyHours: Number(onDutyHours.toFixed(1)),
    timeSinceLastBreak: Number(continuousDriving.toFixed(1)),
    hoursRemainingDrive: Number(hoursRemainingDrive.toFixed(1)),
    hoursRemainingWindow: Number(hoursRemainingWindow.toFixed(1)),
    violations: Array.from(new Set(violations)),
    isLegal: violations.length === 0,
  };
}

export interface TripPlanStop {
  type: 'pickup' | 'delivery';
  location: string;
  distanceFromPreviousMiles: number;
  apptWindowStart: string; // e.g. "08:00"
  apptWindowEnd: string; // e.g. "12:00"
  loadingMinutes: number;
}

export interface TripPlanResult {
  totalMiles: number;
  totalDrivingHours: number;
  breaksCount: number;
  restPeriods10h: number;
  timeline: Array<{
    activity: string;
    durationMinutes: number;
    description: string;
    isDriving?: boolean;
    isRest?: boolean;
  }>;
  feasibleVerdict: 'feasible' | 'tight' | 'not_feasible';
  reason: string;
}

export function planTrip(
  stops: TripPlanStop[],
  speedMph = 50,
  initialDriveLeft = 11,
  initialWindowLeft = 14
): TripPlanResult {
  let totalMiles = 0;
  for (const s of stops) {
    totalMiles += s.distanceFromPreviousMiles;
  }
  const totalDrivingHours = Number((totalMiles / speedMph).toFixed(1));

  let currentDriveClock = initialDriveLeft;
  let currentWindowClock = initialWindowLeft;
  let currentContinuousDrive = 0;
  let breaksCount = 0;
  let restPeriods10h = 0;

  const timeline: Array<{
    activity: string;
    durationMinutes: number;
    description: string;
    isDriving?: boolean;
    isRest?: boolean;
  }> = [];

  for (let i = 0; i < stops.length; i++) {
    const stop = stops[i];
    // Loading/unloading
    timeline.push({
      activity: stop.type === 'pickup' ? 'Loading' : 'Unloading',
      durationMinutes: stop.loadingMinutes,
      description: `${stop.location} (${stop.loadingMinutes} mins on-duty)`,
    });
    currentWindowClock -= stop.loadingMinutes / 60;

    if (i < stops.length - 1) {
      const nextStop = stops[i + 1];
      const legMiles = nextStop.distanceFromPreviousMiles;
      let legDriveHours = legMiles / speedMph;

      while (legDriveHours > 0) {
        // Can we drive before 30-min break?
        const driveBeforeBreak = Math.min(legDriveHours, 8 - currentContinuousDrive, currentDriveClock, currentWindowClock);

        if (driveBeforeBreak > 0) {
          timeline.push({
            activity: 'Driving',
            durationMinutes: Math.round(driveBeforeBreak * 60),
            description: `Drive ${Math.round(driveBeforeBreak * speedMph)} miles`,
            isDriving: true,
          });
          legDriveHours -= driveBeforeBreak;
          currentContinuousDrive += driveBeforeBreak;
          currentDriveClock -= driveBeforeBreak;
          currentWindowClock -= driveBeforeBreak;
        }

        // Need 30 min break?
        if (currentContinuousDrive >= 8 && legDriveHours > 0) {
          timeline.push({
            activity: '30-min Break',
            durationMinutes: 30,
            description: 'Mandatory 30-minute off-duty break',
            isRest: true,
          });
          currentContinuousDrive = 0;
          currentWindowClock -= 0.5;
          breaksCount++;
        }

        // Need 10-hour rest?
        if ((currentDriveClock <= 0 || currentWindowClock <= 0) && legDriveHours > 0) {
          timeline.push({
            activity: '10-hour Rest',
            durationMinutes: 600,
            description: 'Mandatory 10-hour sleeper berth / off-duty reset',
            isRest: true,
          });
          currentDriveClock = 11;
          currentWindowClock = 14;
          currentContinuousDrive = 0;
          restPeriods10h++;
        }
      }
    }
  }

  let feasibleVerdict: 'feasible' | 'tight' | 'not_feasible' = 'feasible';
  let reason = 'Schedule is legal and maintains comfortable HOS buffers.';

  if (restPeriods10h > 2 || totalDrivingHours > 22) {
    feasibleVerdict = 'not_feasible';
    reason = 'Trip exceeds legal driving hours without multi-day resets that breach appointment windows.';
  } else if (currentWindowClock < 1.0 || currentDriveClock < 1.0) {
    feasibleVerdict = 'tight';
    reason = 'Buffer is under 60 minutes. Any minor delay, traffic or shipper detention will cause an HOS violation.';
  }

  return {
    totalMiles,
    totalDrivingHours,
    breaksCount,
    restPeriods10h,
    timeline,
    feasibleVerdict,
    reason,
  };
}
