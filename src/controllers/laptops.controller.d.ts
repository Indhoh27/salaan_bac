import type { Request, Response } from "express";
export declare function listLaptops(_req: Request, res: Response): Promise<void>;
export declare function getLaptopById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function createLaptop(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function updateLaptop(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deleteLaptop(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=laptops.controller.d.ts.map