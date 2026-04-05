import type { Request, Response } from "express";
export declare function listPurchases(_req: Request, res: Response): Promise<void>;
export declare function getPurchaseById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function createPurchase(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function updatePurchase(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deletePurchase(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=purchase.controller.d.ts.map