export const US_TIME_ZONES = [
  { label: 'Eastern (ET)', zone: 'America/New_York', code: 'ET' },
  { label: 'Central (CT)', zone: 'America/Chicago', code: 'CT' },
  { label: 'Mountain (MT)', zone: 'America/Denver', code: 'MT' },
  { label: 'Pacific (PT)', zone: 'America/Los_Angeles', code: 'PT' },
  { label: 'Arizona (MST)', zone: 'America/Phoenix', code: 'AZ' },
] as const;

export const PKT_ZONE = 'Asia/Karachi';

/**
 * Gets UTC offset in minutes for a given timezone and date using Intl
 */
export function getZoneOffsetMinutes(ianaZone: string, date: Date = new Date()): number {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: ianaZone,
      timeZoneName: 'longOffset',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
    const parts = formatter.formatToParts(date);
    const tzPart = parts.find((p) => p.type === 'timeZoneName')?.value;
    if (!tzPart) return 0;
    // Format: GMT-05:00 or GMT+05:00
    const match = tzPart.match(/GMT([+-])(\d{1,2}):?(\d{2})?/);
    if (!match) return 0;
    const sign = match[1] === '+' ? 1 : -1;
    const hours = parseInt(match[2], 10);
    const mins = match[3] ? parseInt(match[3], 10) : 0;
    return sign * (hours * 60 + mins);
  } catch {
    return 0;
  }
}

/**
 * Difference in hours: PKT minus US Zone.
 * e.g. for EDT (UTC-4) and PKT (UTC+5), diff is 5 - (-4) = +9 hours.
 */
export function pktDifferenceHours(usZone: string, date: Date = new Date()): number {
  const pktOffset = 300; // PKT is always UTC+5 (300 mins), no DST
  const usOffset = getZoneOffsetMinutes(usZone, date);
  return (pktOffset - usOffset) / 60;
}

/**
 * Format a Date in a specific timezone
 */
export function formatInZone(
  date: Date,
  ianaZone: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const defaultOpts: Intl.DateTimeFormatOptions = {
    timeZone: ianaZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  return new Intl.DateTimeFormat('en-US', { ...defaultOpts, ...options }).format(date);
}

/**
 * Check if the given timezone is currently observing Daylight Saving Time
 */
export function isDaylightSaving(ianaZone: string, date: Date = new Date()): boolean {
  const janOffset = getZoneOffsetMinutes(ianaZone, new Date(date.getFullYear(), 0, 1));
  const julOffset = getZoneOffsetMinutes(ianaZone, new Date(date.getFullYear(), 6, 1));
  const currentOffset = getZoneOffsetMinutes(ianaZone, date);
  // In northern hemisphere, daylight saving offset is greater (less negative) than standard
  return Math.min(janOffset, julOffset) !== currentOffset;
}

/**
 * Get short abbreviation e.g. EDT vs EST
 */
export function getZoneAbbreviation(ianaZone: string, date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: ianaZone,
      timeZoneName: 'short',
    });
    const parts = formatter.formatToParts(date);
    return parts.find((p) => p.type === 'timeZoneName')?.value || ianaZone;
  } catch {
    return ianaZone;
  }
}

/**
 * Convert local time in a specific timezone to a Date object
 */
export function parseLocalTimeToDate(
  year: number,
  month: number, // 1-12
  day: number,
  hour: number,
  minute: number,
  ianaZone: string
): Date {
  // Construct ISO string with timezone or compute via offset
  // We approximate by creating an initial UTC date and adjusting for offset
  const initialUtc = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const offsetMins = getZoneOffsetMinutes(ianaZone, initialUtc);
  return new Date(initialUtc.getTime() - offsetMins * 60 * 1000);
}
