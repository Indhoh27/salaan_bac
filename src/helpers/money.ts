export function parseMoney(value: unknown): number {
  if (typeof value !== "string") return 0;
  const normalized = value.replace(/[^0-9.\-]/g, "");
  const n = Number.parseFloat(normalized);
  return Number.isFinite(n) ? n : 0;
}

