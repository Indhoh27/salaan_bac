export type ReportPeriod = "daily" | "weekly" | "monthly" | "yearly";

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

export function endOfDayExclusive(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 0, 0, 0, 0);
}

function startOfWeekMonday(d: Date): Date {
  // JS: 0=Sun..6=Sat; we want Monday as start
  const day = d.getDay();
  const diffToMonday = (day + 6) % 7; // Mon->0, Tue->1, ..., Sun->6
  return startOfDay(new Date(d.getFullYear(), d.getMonth(), d.getDate() - diffToMonday));
}

export function getPeriodRange(date: Date, period: ReportPeriod): { start: Date; endExclusive: Date } {
  const d = new Date(date);
  if (period === "daily") {
    return { start: startOfDay(d), endExclusive: endOfDayExclusive(d) };
  }
  if (period === "weekly") {
    const start = startOfWeekMonday(d);
    const endExclusive = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7);
    return { start, endExclusive };
  }
  if (period === "monthly") {
    const start = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
    const endExclusive = new Date(d.getFullYear(), d.getMonth() + 1, 1, 0, 0, 0, 0);
    return { start, endExclusive };
  }
  const start = new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0);
  const endExclusive = new Date(d.getFullYear() + 1, 0, 1, 0, 0, 0, 0);
  return { start, endExclusive };
}

export function parseReportDate(input: unknown): Date {
  if (typeof input !== "string" || !input.trim()) return new Date();
  // Accept YYYY-MM-DD or full ISO.
  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return new Date();
  return d;
}

