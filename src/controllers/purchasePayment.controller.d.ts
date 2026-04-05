import type { Request, Response } from "express";
export declare function listPurchasePayments(_req: Request, res: Response): Promise<void>;
export declare function getPurchasePaymentById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function createPurchasePayment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function updatePurchasePayment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deletePurchasePayment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=purchasePayment.controller.d.ts.map