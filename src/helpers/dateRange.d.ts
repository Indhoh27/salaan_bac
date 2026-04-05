export type ReportPeriod = "daily" | "weekly" | "monthly" | "yearly";
export declare function startOfDay(d: Date): Date;
export declare function endOfDayExclusive(d: Date): Date;
export declare function getPeriodRange(date: Date, period: ReportPeriod): {
    start: Date;
    endExclusive: Date;
};
export declare function parseReportDate(input: unknown): Date;
//# sourceMappingURL=dateRange.d.ts.map