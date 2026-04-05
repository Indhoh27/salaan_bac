import type { Request, Response } from "express";
export declare function listUsers(_req: Request, res: Response): Promise<void>;
export declare function getUserById(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function createUser(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function updateUser(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function deleteUser(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=user.controller.d.ts.map