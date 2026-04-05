import type { Request, Response } from "express";
export declare function listAccessories(_req: Request, res: Response): Promise<void>;
export declare function getAccessoryById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function createAccessory(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function updateAccessory(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deleteAccessory(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=accessory.controller.d.ts.map