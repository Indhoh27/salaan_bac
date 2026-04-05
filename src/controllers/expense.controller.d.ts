import type { Request, Response } from "express";
export declare function listExpenses(_req: Request, res: Response): Promise<void>;
export declare function getExpenseById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function createExpense(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function updateExpense(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deleteExpense(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=expense.controller.d.ts.map