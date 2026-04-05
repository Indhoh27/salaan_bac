export function addMs(date: Date, ms: number): Date {
  return new Date(date.getTime() + ms);
}

export function minutesToMs(minutes: number): number {
  return minutes * 60 * 1000;
}

export function daysToMs(days: number): number {
  return days * 24 * 60 * 60 * 1000;
}

