import type { Request, Response } from "express";
export declare function listSellings(_req: Request, res: Response): Promise<void>;
export declare function getSellingById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function createSelling(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function updateSelling(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deleteSelling(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=selling.controller.d.ts.map